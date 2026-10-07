import {
  User,
  Driver,
  Stop,
  Route,
  RouteStop,
  Bus,
  Trip,
  GPSLocation,
  TransitNotification,
  AdminMetrics,
  ShiftType,
} from '../src/types/transit';
import {
  RAW_ROUTE_GROUPS,
  AITR_COORDINATES,
  INDORE_LANDMARK_COORDS,
  normalizeStopName,
} from '../src/data/aitrMasterData';
import { haversineDistanceKm } from '../src/utils/eta';

class TransitStore {
  public users: Map<string, User> = new Map();
  public drivers: Map<string, Driver> = new Map();
  public stops: Map<string, Stop> = new Map();
  public routes: Map<string, Route> = new Map();
  public buses: Map<string, Bus> = new Map();
  public trips: Map<string, Trip> = new Map();
  public gpsHistory: Map<string, GPSLocation[]> = new Map(); // bus_id -> GPSLocation[]
  public notifications: TransitNotification[] = [];

  // Active demo simulation state
  public simulationTimer: NodeJS.Timeout | null = null;
  public simulatedBusId: string | null = null;
  public simulationSpeedMultiplier: number = 1;
  public simulationStopIndex: number = 0;

  constructor() {
    this.initDatabase();
  }

  private initDatabase() {
    // 1. Initialize Users
    const defaultUsers: User[] = [
      {
        id: 'user-admin-1',
        name: 'AITR Transport Cell Admin',
        email: 'admin@aitr.ac.in',
        role: 'admin',
        phone: '+91 731 4730000',
      },
      {
        id: 'user-driver-1',
        name: 'Santosh Tawar (Driver G55)',
        email: 'driver@aitr.ac.in',
        role: 'driver',
        phone: '+91 98260 12345',
        driverId: 'drv-g55',
      },
      {
        id: 'user-student-1',
        name: 'AITR Student / Faculty',
        email: 'student@aitr.ac.in',
        role: 'student',
        phone: '+91 91234 56789',
      },
    ];
    defaultUsers.forEach((u) => this.users.set(u.id, u));

    // 2. Initialize Stops uniquely from all 24 route groups
    const stopNameToIdMap = new Map<string, string>();
    let stopCounter = 1;

    for (const group of RAW_ROUTE_GROUPS) {
      for (const stopName of group.stops) {
        const normalized = normalizeStopName(stopName);
        if (!stopNameToIdMap.has(normalized)) {
          const stopId = `stop-${stopCounter++}`;
          stopNameToIdMap.set(normalized, stopId);

          const knownCoord = INDORE_LANDMARK_COORDS[stopName] || INDORE_LANDMARK_COORDS[stopName.replace(' (Start)', '')];

          this.stops.set(stopId, {
            id: stopId,
            name: stopName,
            normalized_name: normalized,
            locality: 'Indore Region',
            latitude: knownCoord ? knownCoord.lat : null,
            longitude: knownCoord ? knownCoord.lng : null,
            is_verified_coordinates: !!knownCoord,
          });
        }
      }
    }

    // 3. Initialize Routes, Drivers, and Buses
    let driverCounter = 1;
    let busCounter = 1;

    for (const group of RAW_ROUTE_GROUPS) {
      const routeId = `route-${group.group_number}`;

      // Build Route Stops
      const routeStops: RouteStop[] = group.stops.map((rawStopName, index) => {
        const normalized = normalizeStopName(rawStopName);
        const stopId = stopNameToIdMap.get(normalized) || `stop-${stopCounter++}`;
        const existingStop = this.stops.get(stopId);

        // Approximate scheduled timings for shift 1 (8:30 AM arrival at AITR) and shift 2 (10:30 AM arrival at AITR)
        // Some stops have OCR / source document inconsistencies as described in the requirements
        const isLast = index === group.stops.length - 1;
        const totalStops = group.stops.length;
        const minutesBeforeAITR = Math.round((totalStops - 1 - index) * 2.5); // ~2.5 mins per stop progression

        const shift1ArrivalDate = new Date();
        shift1ArrivalDate.setHours(8, 25, 0, 0);
        const shift1StopDate = new Date(shift1ArrivalDate.getTime() - minutesBeforeAITR * 60000);
        const s1Hours = shift1StopDate.getHours();
        const s1Mins = shift1StopDate.getMinutes().toString().padStart(2, '0');
        const s1Time = `${s1Hours}:${s1Mins} AM`;

        const shift2ArrivalDate = new Date();
        shift2ArrivalDate.setHours(10, 25, 0, 0);
        const shift2StopDate = new Date(shift2ArrivalDate.getTime() - minutesBeforeAITR * 60000);
        const s2Hours = shift2StopDate.getHours();
        const s2Mins = shift2StopDate.getMinutes().toString().padStart(2, '0');
        const s2Time = `${s2Hours}:${s2Mins} AM`;

        // Mark intentional data verification points for OCR / source inconsistencies
        const needsVerification =
          (group.group_number === 8 && (index === 3 || index === 7)) ||
          (group.group_number === 16 && index === 0) ||
          !existingStop?.is_verified_coordinates;

        return {
          id: `rs-${group.group_number}-${index + 1}`,
          route_id: routeId,
          stop_id: stopId,
          stop_name: rawStopName,
          sequence: index + 1,
          shift_1_time: needsVerification && index % 5 === 0 ? null : s1Time,
          shift_2_time: needsVerification && index % 6 === 0 ? null : s2Time,
          data_quality: needsVerification ? 'needs_verification' : 'verified',
          notes: needsVerification ? 'Raw document row contains OCR gaps or unverified GPS coordinates' : undefined,
          latitude: existingStop?.latitude ?? null,
          longitude: existingStop?.longitude ?? null,
        };
      });

      const assignedBusNumbers = group.buses.map((b) => b.bus_number);

      const routeEntity: Route = {
        id: routeId,
        group_number: group.group_number,
        route_name: `Route ${group.group_number}: ${group.route_name}`,
        description: `${group.origin} to ${group.destination} (${group.stops.length} stops)`,
        origin: group.origin,
        destination: group.destination,
        active: true,
        stops: routeStops,
        assigned_bus_numbers: assignedBusNumbers,
      };
      this.routes.set(routeId, routeEntity);

      // Create Drivers and Buses for this group
      for (const busInfo of group.buses) {
        const isSpecialG55 = busInfo.bus_number === 'G55';
        const driverId = isSpecialG55 ? 'drv-g55' : `drv-${driverCounter++}`;
        const busId = `bus-${busCounter++}`;

        const driver: Driver = {
          id: driverId,
          name: busInfo.driver_name,
          phone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
          employee_id: `AITR-DRV-${100 + driverCounter}`,
          assigned_bus_id: busId,
        };
        this.drivers.set(driverId, driver);

        const bus: Bus = {
          id: busId,
          bus_number: busInfo.bus_number,
          registration_number: `MP 09 FA ${1000 + busCounter}`,
          route_id: routeId,
          route_name: routeEntity.route_name,
          driver_id: driverId,
          driver_name: driver.name,
          driver_phone: driver.phone,
          status: isSpecialG55 ? 'ACTIVE' : 'NOT_STARTED',
          active: true,
          data_quality: busInfo.incomplete ? 'needs_verification' : 'verified',
          current_shift: 'shift_1',
          current_stop_index: 0,
          current_stop_name: routeStops[0]?.stop_name,
          next_stop_name: routeStops[1]?.stop_name,
        };

        // For G55, start an active trip with a live GPS heartbeat so students immediately see a live bus on load!
        if (isSpecialG55) {
          const tripId = `trip-active-g55`;
          const trip: Trip = {
            id: tripId,
            bus_id: busId,
            bus_number: 'G55',
            route_id: routeId,
            driver_id: driverId,
            shift: 'shift_1',
            started_at: new Date(Date.now() - 12 * 60000).toISOString(),
            status: 'IN_PROGRESS',
            current_stop_index: 4, // Around Anapurna Mandir / Bank Colony
          };
          this.trips.set(tripId, trip);
          bus.active_trip_id = tripId;
          bus.status = 'ACTIVE';
          bus.current_stop_index = 4;
          bus.current_stop_name = routeStops[4]?.stop_name;
          bus.next_stop_name = routeStops[5]?.stop_name;

          const g55InitialLocation: GPSLocation = {
            bus_id: busId,
            trip_id: tripId,
            latitude: 22.7015,
            longitude: 75.8390,
            speed: 28,
            heading: 65,
            accuracy: 8,
            timestamp: new Date().toISOString(),
          };
          bus.latest_gps = g55InitialLocation;
          bus.last_heartbeat = g55InitialLocation.timestamp;
          this.gpsHistory.set(busId, [g55InitialLocation]);
        }

        this.buses.set(busId, bus);
      }
    }
  }

  // --- Search Stoppages ---
  public searchStops(query: string): Array<{
    stop: Stop;
    servedByRoutes: Array<{ route_id: string; route_name: string; group_number: number; sequence: number }>;
    servedByBuses: Array<{ bus_id: string; bus_number: string; driver_name: string; status: string }>;
  }> {
    const q = normalizeStopName(query);
    if (!q) return [];

    const matchedStops: Array<{
      stop: Stop;
      servedByRoutes: Array<{ route_id: string; route_name: string; group_number: number; sequence: number }>;
      servedByBuses: Array<{ bus_id: string; bus_number: string; driver_name: string; status: string }>;
    }> = [];

    for (const stop of this.stops.values()) {
      const match =
        stop.normalized_name.includes(q) ||
        stop.name.toLowerCase().includes(query.toLowerCase());

      if (match) {
        const routesForStop: Array<{ route_id: string; route_name: string; group_number: number; sequence: number }> = [];
        const busesForStop: Array<{ bus_id: string; bus_number: string; driver_name: string; status: string }> = [];

        for (const route of this.routes.values()) {
          const foundRs = route.stops.find((s) => s.stop_id === stop.id);
          if (foundRs) {
            routesForStop.push({
              route_id: route.id,
              route_name: route.route_name,
              group_number: route.group_number,
              sequence: foundRs.sequence,
            });

            // Find buses assigned to this route
            for (const bus of this.buses.values()) {
              if (bus.route_id === route.id) {
                busesForStop.push({
                  bus_id: bus.id,
                  bus_number: bus.bus_number,
                  driver_name: bus.driver_name || 'Driver',
                  status: bus.status,
                });
              }
            }
          }
        }

        matchedStops.push({
          stop,
          servedByRoutes: routesForStop,
          servedByBuses: busesForStop,
        });
      }
    }

    return matchedStops.slice(0, 15);
  }

  // --- Record GPS telemetry from Driver's device ---
  public recordGPS(gps: {
    bus_id: string;
    trip_id?: string;
    route_id?: string;
    latitude: number;
    longitude: number;
    speed?: number | null;
    heading?: number | null;
    accuracy?: number | null;
    timestamp?: string;
  }): { bus: Bus; notification?: TransitNotification } {
    const bus = this.buses.get(gps.bus_id);
    if (!bus) throw new Error(`Bus ${gps.bus_id} not found`);

    const location: GPSLocation = {
      bus_id: gps.bus_id,
      trip_id: gps.trip_id || bus.active_trip_id,
      latitude: gps.latitude,
      longitude: gps.longitude,
      speed: gps.speed ?? 0,
      heading: gps.heading ?? null,
      accuracy: gps.accuracy ?? 10,
      timestamp: gps.timestamp || new Date().toISOString(),
      is_simulated: false,
    };

    bus.latest_gps = location;
    bus.last_heartbeat = location.timestamp;
    bus.status = 'ACTIVE';

    // Store in history
    const history = this.gpsHistory.get(gps.bus_id) || [];
    history.push(location);
    if (history.length > 100) history.shift();
    this.gpsHistory.set(gps.bus_id, history);

    // Update stop progression based on closest stop in route
    const route = this.routes.get(bus.route_id);
    let approachingNotif: TransitNotification | undefined;

    if (route) {
      let closestIdx = 0;
      let minDistance = 999999;

      route.stops.forEach((st, idx) => {
        if (st.latitude !== null && st.longitude !== null) {
          const d = haversineDistanceKm(gps.latitude, gps.longitude, st.latitude, st.longitude);
          if (d < minDistance) {
            minDistance = d;
            closestIdx = idx;
          }
        }
      });

      bus.current_stop_index = closestIdx;
      bus.current_stop_name = route.stops[closestIdx]?.stop_name;
      const nextIdx = Math.min(route.stops.length - 1, closestIdx + 1);
      bus.next_stop_name = route.stops[nextIdx]?.stop_name;

      if (minDistance < 1.5) {
        approachingNotif = {
          id: `notif-${Date.now()}`,
          bus_id: bus.id,
          bus_number: bus.bus_number,
          stop_id: route.stops[closestIdx].stop_id,
          stop_name: route.stops[closestIdx].stop_name,
          type: minDistance < 0.2 ? 'ARRIVED' : 'APPROACHING',
          message:
            minDistance < 0.2
              ? `Bus ${bus.bus_number} has arrived at ${route.stops[closestIdx].stop_name}.`
              : `Bus ${bus.bus_number} is approaching ${route.stops[closestIdx].stop_name} (~${Math.round(minDistance * 10) / 10} km away).`,
          created_at: new Date().toISOString(),
          read: false,
        };
        this.notifications.unshift(approachingNotif);
        if (this.notifications.length > 50) this.notifications.pop();
      }
    }

    return { bus, notification: approachingNotif };
  }

  // --- Start Trip ---
  public startTrip(busId: string, driverId: string, shift: ShiftType = 'shift_1'): Trip {
    const bus = this.buses.get(busId);
    if (!bus) throw new Error('Bus not found');

    const tripId = `trip-${Date.now()}`;
    const trip: Trip = {
      id: tripId,
      bus_id: busId,
      bus_number: bus.bus_number,
      route_id: bus.route_id,
      driver_id: driverId,
      shift,
      started_at: new Date().toISOString(),
      status: 'IN_PROGRESS',
      current_stop_index: 0,
    };

    this.trips.set(tripId, trip);
    bus.active_trip_id = tripId;
    bus.status = 'ACTIVE';
    bus.current_shift = shift;
    bus.current_stop_index = 0;

    const route = this.routes.get(bus.route_id);
    if (route && route.stops.length > 0) {
      bus.current_stop_name = route.stops[0].stop_name;
      bus.next_stop_name = route.stops[1]?.stop_name || route.stops[0].stop_name;
    }

    return trip;
  }

  // --- End Trip ---
  public endTrip(busId: string): Trip | null {
    const bus = this.buses.get(busId);
    if (!bus || !bus.active_trip_id) return null;

    const trip = this.trips.get(bus.active_trip_id);
    if (trip) {
      trip.ended_at = new Date().toISOString();
      trip.status = 'COMPLETED';
    }

    bus.status = 'COMPLETED';
    bus.active_trip_id = undefined;
    return trip || null;
  }

  // --- Admin Metrics ---
  public getMetrics(): AdminMetrics {
    const allBuses = Array.from(this.buses.values());
    const now = Date.now();
    let gpsOnline = 0;
    let gpsOffline = 0;

    allBuses.forEach((b) => {
      if (b.active && b.latest_gps) {
        const diff = now - new Date(b.latest_gps.timestamp).getTime();
        if (diff <= 45000 || b.is_simulated) {
          gpsOnline++;
        } else {
          gpsOffline++;
        }
      } else {
        gpsOffline++;
      }
    });

    let needsVerificationCount = 0;
    allBuses.forEach((b) => {
      if (b.data_quality === 'needs_verification') needsVerificationCount++;
    });
    for (const r of this.routes.values()) {
      r.stops.forEach((s) => {
        if (s.data_quality === 'needs_verification' || s.latitude === null) {
          needsVerificationCount++;
        }
      });
    }

    return {
      totalBuses: allBuses.length,
      activeBuses: allBuses.filter((b) => b.active && b.status === 'ACTIVE').length,
      inactiveBuses: allBuses.filter((b) => !b.active || b.status === 'INACTIVE' || b.status === 'NOT_STARTED').length,
      gpsOnline,
      gpsOffline,
      activeTrips: Array.from(this.trips.values()).filter((t) => t.status === 'IN_PROGRESS').length,
      totalRoutes: this.routes.size,
      totalStops: this.stops.size,
      needsVerificationCount,
    };
  }
}

export const transitStore = new TransitStore();
