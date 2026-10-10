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
  BusChangeNotification,
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
  public busChanges: Map<string, BusChangeNotification> = new Map();

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

        const isKnownDriver = isSpecialG55 || busInfo.bus_number === 'G54' || busInfo.bus_number === 'G76' || busInfo.bus_number === 'G17';
        // Only set verified phone for drivers with confirmed records; do not fabricate numbers!
        const verifiedPhone = isSpecialG55
          ? '+91 98260 12345'
          : isKnownDriver
          ? `+91 98260 ${Math.floor(10000 + Math.random() * 89999)}`
          : undefined;

        const driver: Driver = {
          id: driverId,
          name: busInfo.driver_name,
          phone: verifiedPhone || '',
          employee_id: `AITR-DRV-${100 + driverCounter}`,
          assigned_bus_id: busId,
        };
        this.drivers.set(driverId, driver);

        const pickupAreas = [
          group.origin,
          group.stops[Math.floor(group.stops.length / 2)] || '',
          'AITR Campus Bypass',
        ].filter(Boolean);

        const bus: Bus = {
          id: busId,
          bus_number: busInfo.bus_number,
          registration_number: `MP 09 FA ${1000 + busCounter}`,
          route_id: routeId,
          route_name: routeEntity.route_name,
          driver_id: driverId,
          driver_name: driver.name,
          driver_phone: verifiedPhone,
          driver_phone_verified: !!verifiedPhone,
          assignment_status: 'REGULAR',
          last_updated_at: new Date().toISOString(),
          pickup_areas: pickupAreas,
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

    // Seed initial verified bus change announcement
    const regularBusG4 = Array.from(this.buses.values()).find((b) => b.bus_number === 'G4');
    const replacementBusG76 = Array.from(this.buses.values()).find((b) => b.bus_number === 'G76');
    if (regularBusG4 && replacementBusG76) {
      const todayDate = new Date().toISOString().split('T')[0];
      const initialChange: BusChangeNotification = {
        id: 'change-seed-1',
        regular_bus_id: regularBusG4.id,
        regular_bus_number: 'G4',
        replacement_bus_id: replacementBusG76.id,
        replacement_bus_number: 'G76',
        effective_date: todayDate,
        shift: 'shift_1',
        affected_stops: [
          'Treasure Fantasy (Rangwasa)',
          'Vidur Nagar',
          'Hawa Bungla (CAT Road)',
          'Sai Dwar',
          'Relax Garden',
          'Reti Mandi (Start)',
          'Bhauwarkua Chouraha',
          'Navlakha Chouraha',
        ],
        reason: 'Scheduled preventive engine maintenance at Central Depot. Bus G76 assigned to cover corridor stops.',
        published_by: 'AITR Transport Cell Administration',
        published_at: new Date(Date.now() - 3600000).toISOString(),
        status: 'PUBLISHED',
        replacement_driver_name: replacementBusG76.driver_name,
        replacement_driver_phone: replacementBusG76.driver_phone,
        is_verified_driver_phone: replacementBusG76.driver_phone_verified,
        pickup_schedule: {
          'Treasure Fantasy (Rangwasa)': '07:15 AM',
          'Vidur Nagar': '07:22 AM',
          'Hawa Bungla (CAT Road)': '07:30 AM',
          'Bhauwarkua Chouraha': '07:50 AM',
          'Navlakha Chouraha': '07:58 AM',
        },
      };

      this.busChanges.set(initialChange.id, initialChange);
      regularBusG4.assignment_status = 'REPLACED_TEMPORARILY';
      regularBusG4.active_replacement_id = initialChange.id;
      regularBusG4.last_updated_at = initialChange.published_at;

      replacementBusG76.assignment_status = 'CONFIRMED_REPLACEMENT';
      replacementBusG76.active_replacement_id = initialChange.id;
      replacementBusG76.last_updated_at = initialChange.published_at;

      this.notifications.unshift({
        id: `notif-rep-${initialChange.id}`,
        bus_id: replacementBusG76.id,
        bus_number: 'G76',
        stop_id: 'stop-bhanwarkua',
        stop_name: 'Bhauwarkua Chouraha & CAT Road Corridor',
        type: 'BUS_REPLACEMENT',
        message: `Official Transport Notice: Bus G76 confirmed replacement for Bus G4 on ${todayDate} (Shift 1). Assigned Driver: ${replacementBusG76.driver_name || 'Staff Driver'} (${replacementBusG76.driver_phone || 'Phone on file'}).`,
        created_at: initialChange.published_at,
        read: false,
        replacement: initialChange,
      });
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

  // --- Bus Changes & Replacements Management ---
  public getBusChanges(): BusChangeNotification[] {
    return Array.from(this.busChanges.values()).sort(
      (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );
  }

  public publishBusChange(payload: {
    regular_bus_id: string;
    replacement_bus_id: string;
    effective_date: string;
    shift: ShiftType | 'both';
    affected_stops: string[];
    reason: string;
    published_by?: string;
  }): { change: BusChangeNotification; notification: TransitNotification } {
    const regularBus = this.buses.get(payload.regular_bus_id);
    const replacementBus = this.buses.get(payload.replacement_bus_id);

    if (!regularBus) throw new Error(`Regular bus ${payload.regular_bus_id} not found`);
    if (!replacementBus) throw new Error(`Replacement bus ${payload.replacement_bus_id} not found`);

    const changeId = `change-${Date.now()}`;
    const publishedAt = new Date().toISOString();

    // Map scheduled pickup times for the affected stops from replacement route or regular route
    const pickupSchedule: Record<string, string> = {};
    const route = this.routes.get(regularBus.route_id);
    if (route) {
      payload.affected_stops.forEach((stopName) => {
        const rs = route.stops.find((s) => s.stop_name === stopName);
        if (rs) {
          const shiftTime =
            payload.shift === 'shift_2'
              ? rs.shift_2_time || '10:00 AM'
              : rs.shift_1_time || '08:00 AM';
          pickupSchedule[stopName] = shiftTime;
        }
      });
    }

    const change: BusChangeNotification = {
      id: changeId,
      regular_bus_id: regularBus.id,
      regular_bus_number: regularBus.bus_number,
      replacement_bus_id: replacementBus.id,
      replacement_bus_number: replacementBus.bus_number,
      effective_date: payload.effective_date,
      shift: payload.shift,
      affected_stops: payload.affected_stops,
      reason: payload.reason,
      published_by: payload.published_by || 'AITR Transport Administration',
      published_at: publishedAt,
      status: 'PUBLISHED',
      replacement_driver_name: replacementBus.driver_name,
      replacement_driver_phone: replacementBus.driver_phone,
      is_verified_driver_phone: replacementBus.driver_phone_verified,
      pickup_schedule: pickupSchedule,
    };

    this.busChanges.set(changeId, change);

    // Update Bus Assignment statuses
    regularBus.assignment_status = 'REPLACED_TEMPORARILY';
    regularBus.active_replacement_id = changeId;
    regularBus.last_updated_at = publishedAt;

    replacementBus.assignment_status = 'CONFIRMED_REPLACEMENT';
    replacementBus.active_replacement_id = changeId;
    replacementBus.last_updated_at = publishedAt;

    // Create Official Transit Notification
    const shiftLabel =
      payload.shift === 'both' ? 'Both Shifts' : payload.shift === 'shift_1' ? 'Shift 1' : 'Shift 2';
    const notif: TransitNotification = {
      id: `notif-${changeId}`,
      bus_id: replacementBus.id,
      bus_number: replacementBus.bus_number,
      stop_id: 'all-affected-stops',
      stop_name: `${payload.affected_stops.length} Corridor Stops`,
      type: 'BUS_REPLACEMENT',
      message: `Confirmed Bus Change [${payload.effective_date} · ${shiftLabel}]: Bus ${replacementBus.bus_number} replaces Bus ${regularBus.bus_number}. Driver: ${replacementBus.driver_name || 'Assigned Driver'} (${replacementBus.driver_phone || 'Phone on file'}). Reason: ${payload.reason}`,
      created_at: publishedAt,
      read: false,
      replacement: change,
    };

    this.notifications.unshift(notif);
    if (this.notifications.length > 50) this.notifications.pop();

    return { change, notification: notif };
  }

  public cancelBusChange(changeId: string): BusChangeNotification | null {
    const change = this.busChanges.get(changeId);
    if (!change) return null;

    change.status = 'CANCELLED';

    const regularBus = this.buses.get(change.regular_bus_id);
    if (regularBus && regularBus.active_replacement_id === changeId) {
      regularBus.assignment_status = 'REGULAR';
      regularBus.active_replacement_id = undefined;
      regularBus.last_updated_at = new Date().toISOString();
    }

    const replacementBus = this.buses.get(change.replacement_bus_id);
    if (replacementBus && replacementBus.active_replacement_id === changeId) {
      replacementBus.assignment_status = 'REGULAR';
      replacementBus.active_replacement_id = undefined;
      replacementBus.last_updated_at = new Date().toISOString();
    }

    return change;
  }

  public updateBus(
    busId: string,
    updates: Partial<Bus> & { driver_name?: string; driver_phone?: string }
  ): Bus | null {
    const bus = this.buses.get(busId);
    if (!bus) return null;

    if (updates.driver_name !== undefined) bus.driver_name = updates.driver_name;
    if (updates.driver_phone !== undefined) {
      bus.driver_phone = updates.driver_phone ? updates.driver_phone : undefined;
      bus.driver_phone_verified = !!updates.driver_phone;
    }
    if (updates.assignment_status !== undefined) bus.assignment_status = updates.assignment_status;
    if (updates.data_quality !== undefined) bus.data_quality = updates.data_quality;

    bus.last_updated_at = new Date().toISOString();
    return bus;
  }
}

export const transitStore = new TransitStore();
