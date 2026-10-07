import React, { useState, useMemo } from 'react';
import { useTransit } from '../context/TransitContext';
import { LeafletMap } from './LeafletMap';
import { Bus, Route } from '../types/transit';
import {
  Search,
  Navigation,
  Clock,
  MapPin,
  AlertCircle,
  Bus as BusIcon,
  ChevronRight,
  Radio,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const StudentView: React.FC = () => {
  const {
    buses,
    routes,
    activeBus,
    setActiveBus,
    activeRoute,
    setActiveRoute,
    selectedStopId,
    setSelectedStopId,
    currentETA,
    shift,
    setShift,
    notifications,
  } = useTransit();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRouteFilter, setSelectedRouteFilter] = useState<string>('all');

  // Search Results across all stops in master database
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase().trim();
    const results: Array<{
      stopId: string;
      stopName: string;
      route: Route;
      buses: Bus[];
      sequence: number;
      shift1Time: string | null;
      shift2Time: string | null;
    }> = [];

    routes.forEach((route) => {
      route.stops.forEach((rs) => {
        if (rs.stop_name.toLowerCase().includes(query)) {
          const matchingBuses = buses.filter((b) => b.route_id === route.id);
          results.push({
            stopId: rs.stop_id,
            stopName: rs.stop_name,
            route,
            buses: matchingBuses,
            sequence: rs.sequence,
            shift1Time: rs.shift_1_time,
            shift2Time: rs.shift_2_time,
          });
        }
      });
    });

    return results.slice(0, 8);
  }, [searchQuery, routes, buses]);

  const handleSelectSearchResult = (item: (typeof searchResults)[0], bus: Bus) => {
    setActiveRoute(item.route);
    setActiveBus(bus);
    setSelectedStopId(item.stopId);
    setSearchQuery('');
  };

  const activeBusesList = useMemo(() => {
    return buses.filter((b) => b.status === 'ACTIVE' || b.status === 'APPROACHING');
  }, [buses]);

  // Approaching alerts for selected stop
  const approachingAlert = useMemo(() => {
    if (!selectedStopId) return null;
    return notifications.find(
      (n) => n.stop_id === selectedStopId && (n.type === 'APPROACHING' || n.type === 'ARRIVED')
    );
  }, [selectedStopId, notifications]);

  return (
    <div className="space-y-6">
      {/* Hero / Quick Search Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4 border border-indigo-500/30">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>AITR Live Transit Network · Indore & Surrounding Routes</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Know where your bus is. <span className="text-indigo-400">Know when it arrives.</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mb-6 leading-relaxed">
            Real-time GPS tracking across all 24 AITR routes, live stop-by-stop ETAs, and smart arrival alerts for Acropolis students and faculty.
          </p>

          {/* Search Box */}
          <div className="relative max-w-2xl">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search your bus stop, locality or landmark (e.g. Mhow Naka, Bhanwarkua, Palasia, Vijay Nagar)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-md text-white placeholder-slate-400 text-sm sm:text-base rounded-2xl pl-12 pr-28 py-3.5 border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/15 transition-all shadow-inner"
              />
              <button
                type="button"
                className="absolute right-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs sm:text-sm font-semibold rounded-xl shadow transition-colors"
              >
                Find Bus
              </button>
            </div>

            {/* Live Search Autocomplete Dropdown */}
            {searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-800 text-slate-200">
                {searchResults.length > 0 ? (
                  searchResults.map((item, idx) => (
                    <div key={`${item.stopId}-${idx}`} className="p-3.5 hover:bg-slate-800/80 transition-colors">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <MapPin className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold text-white text-sm">{item.stopName}</span>
                            <div className="text-xs text-slate-400">
                              {item.route.route_name} · Stop #{item.sequence}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              Sched: Shift 1 ({item.shift1Time || 'N/A'}) · Shift 2 ({item.shift2Time || 'N/A'})
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 justify-end">
                          {item.buses.map((b) => (
                            <button
                              key={b.id}
                              onClick={() => handleSelectSearchResult(item, b)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 shadow-sm transition-all"
                            >
                              <span>Bus {b.bus_number}</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No matching stop found for &quot;{searchQuery}&quot;. Try searching with common Indore landmark names.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Shift Selector Pill in Banner */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-400">Current College Shift:</span>
            <div className="inline-flex p-1 bg-slate-800/80 rounded-xl border border-slate-700">
              <button
                onClick={() => setShift('shift_1')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  shift === 'shift_1' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                1st Shift (8:30 AM – 2:40 PM)
              </button>
              <button
                onClick={() => setShift('shift_2')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  shift === 'shift_2' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                2nd Shift (10:30 AM – 5:00 PM)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-indigo-300 bg-indigo-950/60 px-3 py-1.5 rounded-xl border border-indigo-800/40">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Recommended arrival at stop: <b>10 minutes before</b> scheduled bus arrival.</span>
          </div>
        </div>
      </div>

      {/* Approaching Alert Banner */}
      {approachingAlert && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center justify-between gap-4 text-emerald-900 shadow-sm animate-bounce-short">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚌</span>
            <div>
              <div className="font-bold text-sm">Approaching Bus Alert!</div>
              <div className="text-xs text-emerald-800">{approachingAlert.message}</div>
            </div>
          </div>
          <span className="text-xs bg-emerald-200/80 text-emerald-800 font-semibold px-2.5 py-1 rounded-lg">
            Live Update
          </span>
        </div>
      )}

      {/* Main Grid: Live Map & Selected Bus Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Map & Route Progression (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Route Picker bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BusIcon className="w-4 h-4 text-indigo-600" />
              <label htmlFor="route-select" className="text-xs font-semibold text-slate-700">Select Route:</label>
              <select
                id="route-select"
                aria-label="Select Route"
                value={activeRoute?.id || ''}
                onChange={(e) => {
                  const r = routes.find((rt) => rt.id === e.target.value);
                  if (r) {
                    setActiveRoute(r);
                    const b = buses.find((bus) => bus.route_id === r.id);
                    if (b) setActiveBus(b);
                    if (r.stops.length > 0) setSelectedStopId(r.stops[0].stop_id);
                  }
                }}
                className="text-xs font-medium text-slate-900 bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {routes.map((rt) => (
                  <option key={rt.id} value={rt.id}>
                    {rt.route_name} ({rt.assigned_bus_numbers.join(', ')})
                  </option>
                ))}
              </select>
            </div>

            {/* Bus Picker within route */}
            {activeRoute && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500">Bus:</span>
                {buses
                  .filter((b) => b.route_id === activeRoute.id)
                  .map((b) => {
                    const isSelected = activeBus?.id === b.id;
                    const isLive = b.status === 'ACTIVE' || b.status === 'APPROACHING';
                    return (
                      <button
                        key={b.id}
                        onClick={() => setActiveBus(b)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-sm ring-2 ring-indigo-500'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isLive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                        <span>{b.bus_number}</span>
                      </button>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Interactive Live Map */}
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
            <LeafletMap
              activeBus={activeBus}
              activeRoute={activeRoute}
              allActiveBuses={activeBusesList}
              selectedStopId={selectedStopId}
              onSelectStop={(stopId) => setSelectedStopId(stopId)}
              onSelectBus={(bus) => setActiveBus(bus)}
              height="440px"
            />
          </div>

          {/* Live Fleet Ticker */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="text-xs font-bold text-slate-800 tracking-wider">
                  Active Live Buses on Road ({activeBusesList.length})
                </h3>
              </div>
              <span className="text-xs text-slate-500">Click a bus to track</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {activeBusesList.map((bus) => {
                const isSelected = activeBus?.id === bus.id;
                return (
                  <button
                    key={bus.id}
                    onClick={() => {
                      setActiveBus(bus);
                      const r = routes.find((rt) => rt.id === bus.route_id);
                      if (r) setActiveRoute(r);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-900">{bus.bus_number}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-emerald-100 text-emerald-700">
                        Live
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-1">
                      {bus.driver_name || 'Assigned Driver'}
                    </div>
                    <div className="text-[11px] text-indigo-700 font-medium truncate">
                      Next: {bus.next_stop_name || 'AITR'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Selected Bus Card & Route Progression Timeline (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Real-time Bus Status Card */}
          {activeBus ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-indigo-900 text-white font-extrabold text-sm tracking-wide">
                      Bus {activeBus.bus_number}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        activeBus.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : activeBus.status === 'APPROACHING'
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : activeBus.status === 'GPS_OFFLINE'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      ● {activeBus.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-2">
                    {activeRoute?.route_name || 'AITR Route'}
                  </h3>
                  <div className="text-xs text-slate-500">
                    Driver: <b>{activeBus.driver_name}</b> · Phone: {activeBus.driver_phone}
                  </div>
                </div>

                {activeBus.is_simulated && (
                  <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-1 rounded-lg">
                    DEMO SIMULATION
                  </span>
                )}
              </div>

              {/* Dynamic ETA Widget if Stop Selected */}
              {currentETA ? (
                <div className="bg-gradient-to-r from-indigo-50 via-sky-50 to-indigo-50 border border-indigo-200/80 rounded-2xl p-4">
                  <div className="flex items-center justify-between text-xs text-indigo-900 mb-1">
                    <span className="font-semibold">Selected Stop:</span>
                    <span className="font-bold text-slate-900">{currentETA.target_stop_name}</span>
                  </div>

                  <div className="flex items-baseline justify-between mt-2">
                    <div>
                      <div className="text-3xl font-black text-indigo-950 tracking-tight">
                        {currentETA.formatted_eta}
                      </div>
                      <div className="text-xs text-indigo-700 font-medium mt-0.5">
                        Distance: <b>{currentETA.remaining_distance_km} km</b> · Speed: {currentETA.current_speed_kmh} km/h
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <div className="text-slate-500">Scheduled Time</div>
                      <div className="font-bold text-slate-900 text-sm">
                        {currentETA.scheduled_time || 'Check Timetable'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-indigo-200/60 flex items-center justify-between text-[11px] text-slate-600">
                    <span>
                      Stops Remaining: <b>{currentETA.remaining_stops_count}</b>
                    </span>
                    <span>Updated {currentETA.last_updated_seconds_ago}s ago</span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-4 text-center text-xs text-slate-500">
                  Select a stop from the route sequence below to view route-aware ETA and distance.
                </div>
              )}

              {/* Quick Telemetry Bar */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">CURRENT / LAST STOP</span>
                  <span className="font-bold text-slate-800 truncate block mt-0.5">
                    {activeBus.current_stop_name || 'Departing Origin'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">NEXT UPCOMING STOP</span>
                  <span className="font-bold text-indigo-700 truncate block mt-0.5">
                    {activeBus.next_stop_name || 'Acropolis Campus'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
              Please select a bus to view live tracking details.
            </div>
          )}

          {/* Route Sequence & Stops Timeline */}
          {activeRoute && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Route Stops Progression</h4>
                  <span className="text-xs text-slate-500">
                    {activeRoute.stops.length} stops from {activeRoute.origin} to AITR
                  </span>
                </div>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                  {shift === 'shift_1' ? 'Shift 1' : 'Shift 2'}
                </span>
              </div>

              {/* Vertical Stop Timeline */}
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {activeRoute.stops.map((rs, idx) => {
                  const isCurrentBusStop = activeBus?.current_stop_index === idx;
                  const isSelectedStop = selectedStopId === rs.stop_id;
                  const isPassed = (activeBus?.current_stop_index ?? 0) > idx;
                  const schedTime = shift === 'shift_1' ? rs.shift_1_time : rs.shift_2_time;

                  return (
                    <div
                      key={rs.id}
                      onClick={() => setSelectedStopId(rs.stop_id)}
                      className={`relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
                        isSelectedStop
                          ? 'bg-indigo-50/80 border-indigo-400 shadow-sm ring-1 ring-indigo-400'
                          : isCurrentBusStop
                          ? 'bg-emerald-50/60 border-emerald-300'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            isCurrentBusStop
                              ? 'bg-emerald-600 text-white animate-pulse'
                              : isPassed
                              ? 'bg-slate-300 text-slate-700'
                              : isSelectedStop
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isPassed ? '✓' : idx + 1}
                        </div>

                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{rs.stop_name}</span>
                            {isCurrentBusStop && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.2 rounded">
                                Bus Near Here
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Sched: <b>{schedTime || 'Verification Required'}</b>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        {isSelectedStop ? (
                          <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                            Selected
                          </span>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
