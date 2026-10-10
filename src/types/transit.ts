export type Role = 'student' | 'driver' | 'admin';

export type BusStatus =
  | 'NOT_STARTED'
  | 'ACTIVE'
  | 'APPROACHING'
  | 'DELAYED'
  | 'ARRIVED'
  | 'COMPLETED'
  | 'GPS_OFFLINE'
  | 'INACTIVE';

export type ShiftType = 'shift_1' | 'shift_2';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  driverId?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  employee_id: string;
  assigned_bus_id?: string;
}

export interface Stop {
  id: string;
  name: string;
  normalized_name: string;
  locality?: string;
  latitude: number | null;
  longitude: number | null;
  is_verified_coordinates: boolean;
}

export interface RouteStop {
  id: string;
  route_id: string;
  stop_id: string;
  stop_name: string;
  sequence: number;
  shift_1_time: string | null;
  shift_2_time: string | null;
  data_quality: 'verified' | 'needs_verification';
  notes?: string;
  latitude: number | null;
  longitude: number | null;
}

export interface Route {
  id: string;
  group_number: number;
  route_name: string;
  description: string;
  origin: string;
  destination: string;
  active: boolean;
  stops: RouteStop[];
  assigned_bus_numbers: string[];
}

export interface Bus {
  id: string;
  bus_number: string;
  registration_number?: string;
  route_id: string;
  route_name?: string;
  driver_id?: string;
  driver_name?: string;
  driver_phone?: string;
  driver_phone_verified?: boolean;
  assignment_status?: 'REGULAR' | 'CONFIRMED_REPLACEMENT' | 'REPLACED_TEMPORARILY' | 'MAINTENANCE';
  last_updated_at?: string;
  pickup_areas?: string[];
  status: BusStatus;
  active: boolean;
  data_quality: 'verified' | 'needs_verification';
  latest_gps?: GPSLocation;
  last_heartbeat?: string;
  active_trip_id?: string;
  current_shift?: ShiftType;
  current_stop_index?: number;
  current_stop_name?: string;
  next_stop_name?: string;
  distance_to_next_km?: number;
  eta_to_next_min?: number;
  is_simulated?: boolean;
  active_replacement_id?: string;
}

export type AlternativeMatchType = 'EXACT_STOP' | 'NEARBY_STOP' | 'CONFIRMED_REPLACEMENT' | 'PREDICTED_CORRIDOR';

export interface AlternativeBusCandidate {
  bus: Bus;
  route: Route;
  match_type: AlternativeMatchType;
  stop_name: string;
  stop_id: string;
  distance_meters: number;
  walking_time_minutes: number;
  shift_time: string | null;
  driver_name: string;
  driver_phone: string | null;
  is_verified_driver_phone: boolean;
  route_similarity_score: number; // 0 - 100%
  corridor_name?: string;
  is_confirmed_replacement: boolean;
  replacement_reason?: string;
  effective_shift?: string;
  timing_compatibility: 'optimal' | 'moderate' | 'unverified';
  notes?: string;
}

export interface BusChangeNotification {
  id: string;
  regular_bus_id: string;
  regular_bus_number: string;
  replacement_bus_id: string;
  replacement_bus_number: string;
  effective_date: string;
  shift: ShiftType | 'both';
  affected_stops: string[];
  reason: string;
  published_by: string;
  published_at: string;
  status: 'PUBLISHED' | 'CANCELLED';
  replacement_driver_name?: string;
  replacement_driver_phone?: string;
  is_verified_driver_phone?: boolean;
  pickup_schedule?: Record<string, string>;
}

export interface AreaAlternativeHub {
  id: string;
  name: string;
  normalized_name: string;
  locality: string;
  latitude: number;
  longitude: number;
  description: string;
  routesServing: Array<{ route_id: string; route_name: string; group_number: number }>;
  regularBuses: Bus[];
  predictedAlternatives: Array<{ bus: Bus; route_name: string; similarity: number; reason: string }>;
  confirmedReplacements: BusChangeNotification[];
}

export interface Trip {
  id: string;
  bus_id: string;
  bus_number: string;
  route_id: string;
  driver_id: string;
  shift: ShiftType;
  started_at: string;
  ended_at?: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  current_stop_index: number;
}

export interface GPSLocation {
  id?: string;
  trip_id?: string;
  bus_id: string;
  latitude: number;
  longitude: number;
  speed: number | null; // km/h
  heading: number | null;
  accuracy: number | null;
  timestamp: string;
  is_simulated?: boolean;
}

export interface ETAPrediction {
  bus_id: string;
  bus_number: string;
  route_id: string;
  target_stop_id: string;
  target_stop_name: string;
  status: BusStatus;
  current_speed_kmh: number;
  remaining_stops_count: number;
  remaining_distance_km: number;
  eta_minutes: number;
  formatted_eta: string;
  scheduled_time: string | null;
  shift: ShiftType;
  recommended_arrival_notice: string;
  last_updated_seconds_ago: number;
  is_approaching: boolean;
  has_passed: boolean;
}

export interface TransitNotification {
  id: string;
  user_id?: string;
  bus_id: string;
  bus_number: string;
  stop_id: string;
  stop_name: string;
  type: 'APPROACHING' | 'ARRIVED' | 'DELAY' | 'GPS_RESTORED' | 'GPS_LOST' | 'BUS_REPLACEMENT';
  message: string;
  created_at: string;
  read: boolean;
  replacement?: BusChangeNotification;
}

export interface AdminMetrics {
  totalBuses: number;
  activeBuses: number;
  inactiveBuses: number;
  gpsOnline: number;
  gpsOffline: number;
  activeTrips: number;
  totalRoutes: number;
  totalStops: number;
  needsVerificationCount: number;
}
