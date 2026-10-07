import { Bus, Route, RouteStop, ETAPrediction, GPSLocation, BusStatus, ShiftType } from '../types/transit';

const HEARTBEAT_TIMEOUT_MS = 45 * 1000; // 45 seconds timeout for live GPS
const DEFAULT_ROUTE_SPEED_KMH = 26; // City bus average speed in Indore traffic
const APPROACHING_DISTANCE_KM = 1.5; // Trigger "Approaching" when within 1.5 km
const ARRIVED_DISTANCE_KM = 0.15; // Trigger "Arrived" when within 150 meters

export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function computeBusEffectiveStatus(bus: Bus): BusStatus {
  if (!bus.active) return 'INACTIVE';
  if (!bus.active_trip_id) return 'NOT_STARTED';

  if (bus.latest_gps) {
    const elapsedMs = Date.now() - new Date(bus.latest_gps.timestamp).getTime();
    if (elapsedMs > HEARTBEAT_TIMEOUT_MS && !bus.is_simulated) {
      return 'GPS_OFFLINE';
    }
  } else {
    return 'GPS_OFFLINE';
  }

  return bus.status || 'ACTIVE';
}

export function calculateRouteAwareETA(
  bus: Bus,
  route: Route,
  targetStopId: string,
  shift: ShiftType = 'shift_1'
): ETAPrediction | null {
  const targetIndex = route.stops.findIndex((s) => s.stop_id === targetStopId);
  if (targetIndex === -1) return null;

  const targetStop = route.stops[targetIndex];
  const busGps = bus.latest_gps;

  const lastUpdatedSecondsAgo = busGps
    ? Math.max(0, Math.floor((Date.now() - new Date(busGps.timestamp).getTime()) / 1000))
    : 9999;

  let currentSpeed = busGps?.speed && busGps.speed > 5 ? busGps.speed : DEFAULT_ROUTE_SPEED_KMH;
  if (currentSpeed > 65) currentSpeed = 40; // cap unrealistic GPS spikes

  // Determine current stop index
  const currentStopIndex = bus.current_stop_index ?? 0;
  const hasPassed = currentStopIndex > targetIndex;

  // Compute remaining route distance
  let remainingDistanceKm = 0;

  if (hasPassed) {
    remainingDistanceKm = 0;
  } else if (!busGps || targetStop.latitude === null || targetStop.longitude === null) {
    // Coordinate unavailable or GPS not available: approximate by stop sequence count
    const remainingStopsCount = Math.max(0, targetIndex - currentStopIndex);
    remainingDistanceKm = remainingStopsCount * 1.8; // ~1.8 km average between Indore stops
  } else {
    // Route progression distance calculation:
    // Distance from current GPS to the immediate next stop on route +
    // distance between all subsequent stops up to targetStop
    const nextStopIndex = Math.min(route.stops.length - 1, currentStopIndex + 1);
    const nextStop = route.stops[nextStopIndex];

    if (nextStop.latitude && nextStop.longitude) {
      const distToNext = haversineDistanceKm(
        busGps.latitude,
        busGps.longitude,
        nextStop.latitude,
        nextStop.longitude
      );
      remainingDistanceKm += distToNext;

      // Accumulate distance between intermediate stops up to target stop
      for (let i = nextStopIndex; i < targetIndex; i++) {
        const s1 = route.stops[i];
        const s2 = route.stops[i + 1];
        if (s1.latitude && s1.longitude && s2.latitude && s2.longitude) {
          remainingDistanceKm += haversineDistanceKm(s1.latitude, s1.longitude, s2.latitude, s2.longitude);
        } else {
          remainingDistanceKm += 1.6;
        }
      }
    } else {
      // Fallback straight line to target stop if intermediate stops lack coordinates
      remainingDistanceKm = haversineDistanceKm(
        busGps.latitude,
        busGps.longitude,
        targetStop.latitude,
        targetStop.longitude
      );
    }
  }

  // Calculate ETA in minutes: remaining_distance / speed * 60 + stop dwell time (1.2 min per stop)
  const remainingStopsCount = Math.max(0, targetIndex - currentStopIndex);
  const travelMinutes = (remainingDistanceKm / currentSpeed) * 60;
  const dwellMinutes = remainingStopsCount * 1.2;
  const totalEtaMinutes = hasPassed ? 0 : Math.max(1, Math.round(travelMinutes + dwellMinutes));

  const isApproaching = !hasPassed && remainingDistanceKm <= APPROACHING_DISTANCE_KM;
  const isArrived = !hasPassed && remainingDistanceKm <= ARRIVED_DISTANCE_KM;

  let effectiveStatus: BusStatus = computeBusEffectiveStatus(bus);
  if (effectiveStatus === 'ACTIVE') {
    if (isArrived) effectiveStatus = 'ARRIVED';
    else if (isApproaching) effectiveStatus = 'APPROACHING';
  }

  const scheduledTime = shift === 'shift_1' ? targetStop.shift_1_time : targetStop.shift_2_time;

  return {
    bus_id: bus.id,
    bus_number: bus.bus_number,
    route_id: route.id,
    target_stop_id: targetStop.stop_id,
    target_stop_name: targetStop.stop_name,
    status: effectiveStatus,
    current_speed_kmh: Math.round(currentSpeed),
    remaining_stops_count: remainingStopsCount,
    remaining_distance_km: Math.round(remainingDistanceKm * 10) / 10,
    eta_minutes: totalEtaMinutes,
    formatted_eta: hasPassed ? 'Bus Passed' : totalEtaMinutes === 1 ? '1 min' : `${totalEtaMinutes} min`,
    scheduled_time: scheduledTime,
    shift: shift,
    recommended_arrival_notice: 'Recommended arrival at stop: 10 minutes before scheduled bus arrival.',
    last_updated_seconds_ago: lastUpdatedSecondsAgo,
    is_approaching: isApproaching,
    has_passed: hasPassed,
  };
}
