import {
  Route,
  Bus,
  ShiftType,
  AlternativeBusCandidate,
  AreaAlternativeHub,
  BusChangeNotification,
} from '../types/transit';
import { normalizeStopName, INDORE_LANDMARK_COORDS } from '../data/aitrMasterData';
import { haversineDistanceKm } from './eta';

// Recognized transit corridors across Indore & surrounding bypass routes
export const TRANSIT_CORRIDORS = [
  {
    name: 'Bhawarkua & Ring Road Corridor',
    keywords: ['bhanwarkua', 'rajiv gandhi', 'it park', 'teen imli', 'musakhedi', 'choithram', 'vishnupuri'],
  },
  {
    name: 'AB Road & Palasia Corridor',
    keywords: ['palasia', 'geeta bhawan', 'lig', 'industry house', 'navlakha', 'gpo', 'regal'],
  },
  {
    name: 'Vijay Nagar & MR-10 Corridor',
    keywords: ['vijay nagar', 'mr 10', 'bapat', 'redisson', 'heera nagar', 'clerk colony'],
  },
  {
    name: 'Dewas Naka & Scheme 78 Corridor',
    keywords: ['dewas naka', 'niranjanpur', 'scheme 78', 'sica', 'talawali chanda', 'mangliya'],
  },
  {
    name: 'Rau & Silicon City / Bypass Corridor',
    keywords: ['silicon city', 'rau', 'indorama', 'tejaji nagar', 'silver spring', 'rangwasa'],
  },
  {
    name: 'Bengali & Kanadiya Corridor',
    keywords: ['bengali', 'kanadiya', 'tilak nagar', 'vaibhav nagar', 'sanchar nagar', 'pipliyahana'],
  },
  {
    name: 'Kshipra / Dakachya Highway Corridor',
    keywords: ['kshipra', 'shipra', 'dakachya', 'sayaji', 'radhaganj', 'bhopal chouraha', 'bavdiya'],
  },
  {
    name: 'Central Old Indore & Gangwal Corridor',
    keywords: ['gangwal', 'bada ganpati', 'jawaharmarg', 'malganj', 'patel bridge', 'rajkumar bridge'],
  },
];

/**
 * Compare two routes to identify shared stops, corridor alignment, and compute Jaccard similarity
 */
export function calculateRouteSimilarity(
  routeA: Route,
  routeB: Route
): {
  score: number; // 0 to 100 percentage
  sharedStops: string[];
  sharedCorridor?: string;
} {
  if (routeA.id === routeB.id) {
    return {
      score: 100,
      sharedStops: routeA.stops.map((s) => s.stop_name),
      sharedCorridor: identifyCorridor(routeA.stops.map((s) => s.stop_name)),
    };
  }

  const setA = new Set(routeA.stops.map((s) => normalizeStopName(s.stop_name)));
  const setB = new Set(routeB.stops.map((s) => normalizeStopName(s.stop_name)));

  const shared: string[] = [];
  routeA.stops.forEach((s) => {
    const norm = normalizeStopName(s.stop_name);
    if (setB.has(norm) && !shared.includes(s.stop_name)) {
      shared.push(s.stop_name);
    }
  });

  const unionSize = new Set([...setA, ...setB]).size;
  const jaccard = unionSize > 0 ? (shared.length / unionSize) * 100 : 0;

  // Bonus weight if both arrive at AITR and share prominent bottleneck hubs
  let score = Math.round(jaccard * 1.8);
  if (shared.length >= 4) score = Math.min(100, score + 25);
  if (shared.length >= 8) score = Math.min(100, score + 40);

  const sharedCorridor = identifyCorridor(shared);

  return {
    score: Math.min(98, Math.max(0, score)),
    sharedStops: shared,
    sharedCorridor,
  };
}

/**
 * Identify transit corridor based on stop keywords
 */
export function identifyCorridor(stopNames: string[]): string | undefined {
  const text = stopNames.map((s) => normalizeStopName(s)).join(' ');
  for (const corridor of TRANSIT_CORRIDORS) {
    let hits = 0;
    for (const kw of corridor.keywords) {
      if (text.includes(kw)) hits++;
    }
    if (hits >= 2) return corridor.name;
  }
  return undefined;
}

/**
 * Find nearby alternative buses for a target stop
 * Ranks strictly by:
 * 1. Exact-stop match
 * 2. Walking distance to nearby verified stops
 * 3. Route similarity
 * 4. Timing compatibility
 */
export function findNearbyAlternativeBuses(params: {
  targetStopName: string;
  shift: ShiftType;
  routes: Route[];
  buses: Bus[];
  regularBusId?: string;
  confirmedReplacements?: BusChangeNotification[];
  maxWalkingDistanceKm?: number;
}): AlternativeBusCandidate[] {
  const {
    targetStopName,
    shift,
    routes,
    buses,
    regularBusId,
    confirmedReplacements = [],
    maxWalkingDistanceKm = 2.0, // up to 2 km walking radius for realistic urban transit alternatives
  } = params;

  if (!targetStopName) return [];

  const targetNorm = normalizeStopName(targetStopName);
  
  // Find coordinate for target stop: check exact keys, landmark aliases, or any stop in routes
  let targetCoord = INDORE_LANDMARK_COORDS[targetStopName] || 
    INDORE_LANDMARK_COORDS[targetStopName.replace(' (Start)', '')] ||
    Object.entries(INDORE_LANDMARK_COORDS).find(([k]) => normalizeStopName(k).includes(targetNorm) || targetNorm.includes(normalizeStopName(k)))?.[1];

  if (!targetCoord) {
    for (const r of routes) {
      for (const s of r.stops) {
        if (s.latitude !== null && s.longitude !== null && (normalizeStopName(s.stop_name).includes(targetNorm) || targetNorm.includes(normalizeStopName(s.stop_name)))) {
          targetCoord = { lat: s.latitude, lng: s.longitude };
          break;
        }
      }
      if (targetCoord) break;
    }
  }

  const results: AlternativeBusCandidate[] = [];
  const processedBusRoutePairs = new Set<string>();

  // Check active confirmed replacements affecting this stop
  const activeReplacements = confirmedReplacements.filter((r) => {
    if (r.status !== 'PUBLISHED') return false;
    if (r.shift !== 'both' && r.shift !== shift) return false;
    return r.affected_stops.some((st) => {
      const stNorm = normalizeStopName(st);
      return stNorm === targetNorm || stNorm.includes(targetNorm) || targetNorm.includes(stNorm);
    });
  });

  // 1. Scan all routes for Exact-Stop Matches and Nearby-Stop Matches
  for (const route of routes) {
    for (const rs of route.stops) {
      const rsNorm = normalizeStopName(rs.stop_name);
      const isExact = rsNorm === targetNorm || 
        rsNorm.includes(targetNorm) || 
        targetNorm.includes(rsNorm) || 
        rs.stop_name.toLowerCase().includes(targetStopName.toLowerCase());

      let distanceMeters = 0;
      let isNearby = false;

      if (!isExact && targetCoord && rs.latitude !== null && rs.longitude !== null) {
        const distKm = haversineDistanceKm(targetCoord.lat, targetCoord.lng, rs.latitude, rs.longitude);
        if (distKm <= maxWalkingDistanceKm) {
          distanceMeters = Math.round(distKm * 1000);
          isNearby = true;
        }
      }

      if (isExact || isNearby) {
        // Find buses assigned to this route
        const routeBuses = buses.filter((b) => b.route_id === route.id && b.active);

        for (const bus of routeBuses) {
          const pairKey = `${bus.id}-${rs.stop_id}`;
          if (processedBusRoutePairs.has(pairKey)) continue;
          processedBusRoutePairs.add(pairKey);

          const isRegular = regularBusId ? bus.id === regularBusId : false;

          // Check if this bus has a confirmed replacement announcement
          const matchingReplacement = activeReplacements.find(
            (rep) => rep.regular_bus_id === bus.id || rep.regular_bus_number === bus.bus_number
          );

          const time = shift === 'shift_1' ? rs.shift_1_time : rs.shift_2_time;

          // Estimate walking time: 4.5 km/h ~ 75 meters per minute
          const walkingMinutes = isExact ? 0 : Math.max(1, Math.ceil(distanceMeters / 75));

          // Timing compatibility: check if scheduled time is valid
          let timingComp: 'optimal' | 'moderate' | 'unverified' = 'moderate';
          if (!time) {
            timingComp = 'unverified';
          } else if (isExact) {
            timingComp = 'optimal';
          }

          results.push({
            bus,
            route,
            match_type: isExact ? 'EXACT_STOP' : 'NEARBY_STOP',
            stop_name: rs.stop_name,
            stop_id: rs.stop_id,
            distance_meters: distanceMeters,
            walking_time_minutes: walkingMinutes,
            shift_time: time,
            driver_name: bus.driver_name || 'Assigned Driver',
            driver_phone: bus.driver_phone && bus.driver_phone !== '+91 0000000000' ? bus.driver_phone : null,
            is_verified_driver_phone: !!bus.driver_phone_verified,
            route_similarity_score: isExact ? 100 : Math.max(50, 100 - Math.round(distanceMeters / 30)),
            corridor_name: identifyCorridor(route.stops.map((s) => s.stop_name)),
            is_confirmed_replacement: !!matchingReplacement,
            replacement_reason: matchingReplacement?.reason,
            effective_shift: matchingReplacement?.shift,
            timing_compatibility: timingComp,
            notes: isRegular
              ? 'Your Regular Bus Assignment'
              : isExact
              ? 'Serves this exact pickup point'
              : `Nearby verified stop · ${distanceMeters} m walking distance (~${walkingMinutes} min walk)`,
          });
        }
      }
    }
  }

  // 2. Identify Corridor-based Predicted Alternative Candidates (if exact stop has few options)
  const regularBus = buses.find((b) => b.id === regularBusId);
  const regularRoute = regularBus ? routes.find((r) => r.id === regularBus.route_id) : null;

  if (regularRoute) {
    for (const route of routes) {
      if (route.id === regularRoute.id) continue;
      const sim = calculateRouteSimilarity(regularRoute, route);

      if (sim.score >= 50 && sim.sharedStops.length >= 3) {
        const routeBuses = buses.filter((b) => b.route_id === route.id && b.active);
        for (const bus of routeBuses) {
          const alreadyIncluded = results.some((r) => r.bus.id === bus.id);
          if (!alreadyIncluded) {
            const nearestShared = sim.sharedStops[0] || route.stops[0]?.stop_name;
            const rs = route.stops.find((s) => s.stop_name === nearestShared) || route.stops[0];
            const time = shift === 'shift_1' ? rs.shift_1_time : rs.shift_2_time;

            results.push({
              bus,
              route,
              match_type: 'PREDICTED_CORRIDOR',
              stop_name: rs.stop_name,
              stop_id: rs.stop_id,
              distance_meters: 800,
              walking_time_minutes: 11,
              shift_time: time,
              driver_name: bus.driver_name || 'Assigned Driver',
              driver_phone: bus.driver_phone && bus.driver_phone !== '+91 0000000000' ? bus.driver_phone : null,
              is_verified_driver_phone: !!bus.driver_phone_verified,
              route_similarity_score: sim.score,
              corridor_name: sim.sharedCorridor || 'Shared AITR Corridor',
              is_confirmed_replacement: false,
              timing_compatibility: 'moderate',
              notes: `Predicted candidate (${sim.score}% corridor overlap on ${sim.sharedStops.length} stops). Subject to Transport Cell approval.`,
            });
          }
        }
      }
    }
  }

  // 3. Strict Ranking according to Requirement 2:
  // - Exact-stop match first
  // - Nearby-stop distance second (ascending)
  // - Route similarity score third (descending)
  // - Timing compatibility fourth
  results.sort((a, b) => {
    // Exact stop matches come before nearby stops
    if (a.match_type === 'EXACT_STOP' && b.match_type !== 'EXACT_STOP') return -1;
    if (b.match_type === 'EXACT_STOP' && a.match_type !== 'EXACT_STOP') return 1;

    // Confirmed replacements get elevated notice
    if (a.is_confirmed_replacement && !b.is_confirmed_replacement) return -1;
    if (!a.is_confirmed_replacement && b.is_confirmed_replacement) return 1;

    // Nearby distance (lower distance first)
    if (a.distance_meters !== b.distance_meters) {
      return a.distance_meters - b.distance_meters;
    }

    // Route similarity (higher first)
    if (b.route_similarity_score !== a.route_similarity_score) {
      return b.route_similarity_score - a.route_similarity_score;
    }

    // Timing compatibility
    const rankTiming = (t: string) => (t === 'optimal' ? 1 : t === 'moderate' ? 2 : 3);
    return rankTiming(a.timing_compatibility) - rankTiming(b.timing_compatibility);
  });

  return results;
}

/**
 * Persistent Alternatives Hub Directory for Recurring Problem Areas
 * Covers Bhawarkua, Rajiv Gandhi Chouraha, IT Park, Musakhedi, Vijay Nagar, Palasia, Bengali, Dewas Naka, Kshipra
 */
export function getRecurringProblemAreaHubs(
  routes: Route[],
  buses: Bus[],
  confirmedReplacements: BusChangeNotification[] = []
): AreaAlternativeHub[] {
  const HUB_DEFINITIONS = [
    {
      id: 'hub-bhawarkua',
      name: 'Bhawarkua Chouraha',
      normalized_name: 'bhanwarkua',
      locality: 'South Indore · Major Student Residential Center',
      latitude: 22.6925,
      longitude: 75.8672,
      description:
        'Indore’s primary student and coaching district. Very high morning boarding volume with multi-bus options across Groups 1 & 3.',
    },
    {
      id: 'hub-rajiv-gandhi',
      name: 'Rajiv Gandhi Chouraha',
      normalized_name: 'rajiv gandhi',
      locality: 'Ring Road & AB Road Junction',
      latitude: 22.6845,
      longitude: 75.8640,
      description:
        'Key bypass arterial interchange connecting Choithram, Vishnupuri, and IT Park corridors.',
    },
    {
      id: 'hub-it-park',
      name: 'IT Park Chouraha',
      normalized_name: 'it park',
      locality: 'Ring Road · Crystal IT Park Sector',
      latitude: 22.6815,
      longitude: 75.8770,
      description:
        'Fast-growing tech corridor with high frequency transit overlap between Group 3 and Group 5.',
    },
    {
      id: 'hub-musakhedi',
      name: 'Musakhedi / Teen Imli Chouraha',
      normalized_name: 'musakhedi',
      locality: 'Nemawar Road & Ring Road Gateway',
      latitude: 22.7050,
      longitude: 75.9080,
      description:
        'Frequent traffic bottleneck zone where 4 major bus lines converge before heading towards Bypass / AITR.',
    },
    {
      id: 'hub-vijay-nagar',
      name: 'Vijay Nagar & Hotel Redisson',
      normalized_name: 'vijay nagar',
      locality: 'North Indore Commercial Nexus',
      latitude: 22.7533,
      longitude: 75.8937,
      description:
        'Northern Indore transit center serving BRTS, MR-10, and eastern bypass connector routes (Groups 7 & 10).',
    },
    {
      id: 'hub-palasia',
      name: 'Palasia Chouraha & Thana',
      normalized_name: 'palasia',
      locality: 'Central Indore Arterial Hub',
      latitude: 22.7240,
      longitude: 75.8850,
      description:
        'Central crossover stop for Groups 2, 11, 13, and 14 connecting old city centers to the bypass.',
    },
    {
      id: 'hub-bengali',
      name: 'Bengali Chouraha',
      normalized_name: 'bengali',
      locality: 'East Indore Ring Road Hub',
      latitude: 22.7215,
      longitude: 75.9065,
      description:
        'Direct connection point into Kanadiya Bypass for Groups 11, 12, and 14.',
    },
    {
      id: 'hub-dewas-naka',
      name: 'Dewas Naka Square',
      normalized_name: 'dewas naka',
      locality: 'Indore-Dewas Bypass Confluence',
      latitude: 22.7845,
      longitude: 75.9125,
      description:
        'Critical industrial & highway connector stop heavily utilized by northern suburb students.',
    },
    {
      id: 'hub-kshipra',
      name: 'Kshipra / Dakachya Highway Hub',
      normalized_name: 'kshipra',
      locality: 'Ujjain & Dewas Highway Gateway',
      latitude: 22.9230,
      longitude: 75.9910,
      description:
        'Convergence point for all inter-city groups from Ujjain, Dewas, Maksi, and rural corridors into AITR.',
    },
  ];

  return HUB_DEFINITIONS.map((def) => {
    const norm = def.normalized_name;

    // Find routes serving this hub directly
    const routesServing: Array<{ route_id: string; route_name: string; group_number: number }> = [];
    const regularBuses: Bus[] = [];

    for (const route of routes) {
      const match = route.stops.some((s) => normalizeStopName(s.stop_name).includes(norm));
      if (match) {
        routesServing.push({
          route_id: route.id,
          route_name: route.route_name,
          group_number: route.group_number,
        });

        // Add buses for this route
        const bList = buses.filter((b) => b.route_id === route.id && b.active);
        bList.forEach((b) => {
          if (!regularBuses.some((existing) => existing.id === b.id)) {
            regularBuses.push(b);
          }
        });
      }
    }

    // Predicted alternatives from routes sharing nearby corridors
    const predictedAlternatives: Array<{ bus: Bus; route_name: string; similarity: number; reason: string }> = [];
    for (const route of routes) {
      if (routesServing.some((rs) => rs.route_id === route.id)) continue;

      // Check if route has stops within 2.5 km of this hub
      let minDist = 999;
      let closestStop = '';
      for (const s of route.stops) {
        if (s.latitude !== null && s.longitude !== null) {
          const d = haversineDistanceKm(def.latitude, def.longitude, s.latitude, s.longitude);
          if (d < minDist) {
            minDist = d;
            closestStop = s.stop_name;
          }
        }
      }

      if (minDist <= 2.2) {
        const bList = buses.filter((b) => b.route_id === route.id && b.active);
        bList.forEach((b) => {
          predictedAlternatives.push({
            bus: b,
            route_name: route.route_name,
            similarity: Math.round(Math.max(45, 95 - minDist * 20)),
            reason: `Stops at ${closestStop} (~${Math.round(minDist * 10) / 10} km away). Shares heading toward AITR Bypass.`,
          });
        });
      }
    }

    // Confirmed replacements affecting stops in this hub
    const confirmed = confirmedReplacements.filter((rep) => {
      if (rep.status !== 'PUBLISHED') return false;
      return rep.affected_stops.some((st) => normalizeStopName(st).includes(norm));
    });

    return {
      id: def.id,
      name: def.name,
      normalized_name: def.normalized_name,
      locality: def.locality,
      latitude: def.latitude,
      longitude: def.longitude,
      description: def.description,
      routesServing,
      regularBuses,
      predictedAlternatives: predictedAlternatives.slice(0, 6),
      confirmedReplacements: confirmed,
    };
  });
}
