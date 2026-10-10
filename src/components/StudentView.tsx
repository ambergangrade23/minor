import React, { useState, useMemo } from 'react';
import { useTransit } from '../context/TransitContext';
import { LeafletMap } from './LeafletMap';
import { RouteScheduleModal } from './RouteScheduleModal';
import { Bus, Route } from '../types/transit';
import {
  Search,
  Clock,
  MapPin,
  Bus as BusIcon,
  ChevronRight,
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
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);

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
      {/* Hero Banner: Glassmorphism Card with Claymorphic Tactile Elements */}
      <div className="glass-panel p-6 sm:p-8 relative overflow-hidden">
        {/* Soft decorative inner glass glow */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gradient-to-bl from-[#A7F3D0]/30 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl">
          {/* Status Badges Row (Claymorphic Pills & Clean Typography) */}
          <div className="flex flex-wrap items-center gap-2.5 mb-3.5">
            <span className="clay-pill-live px-3.5 py-1 text-xs font-bold inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span>AITR Live Transport Fleet</span>
            </span>
            <span className="clay-pill-mint px-3 py-1 text-xs font-bold inline-flex items-center gap-1.5">
              <BusIcon className="w-3.5 h-3.5 text-[#166534]" />
              <span>24 Campus Routes</span>
            </span>
            <span className="px-3 py-1 bg-white/70 backdrop-blur-xs text-[#64748B] border border-white/80 rounded-full text-xs font-bold shadow-xs inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Indore Region</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#166534] leading-tight mb-2.5">
            Real-Time College Bus Tracking & ETA Prediction
          </h1>
          <p className="text-[#64748B] font-medium text-sm sm:text-base mb-6 max-w-2xl leading-relaxed">
            Live telemetry for Acropolis Institute of Technology & Research (AITR), Indore. Search your stop, track bus progress, and monitor arrival predictions.
          </p>

          {/* Claymorphic Inset Search Bar */}
          <div className="relative max-w-2xl">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-[#64748B] absolute left-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search your stop or locality (e.g. Mhow Naka, Bhanwarkua, Palasia, Vijay Nagar)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full clay-input text-[#17301F] font-medium placeholder-[#64748B] text-sm sm:text-base pl-12 pr-32 py-3.5 focus:outline-none"
              />
              <button
                type="button"
                className="absolute right-2 px-4 py-2 clay-btn-primary text-xs sm:text-sm font-bold uppercase cursor-pointer"
              >
                Find Bus
              </button>
            </div>

            {/* Live Search Autocomplete Glass Dropdown */}
            {searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 glass-modal overflow-hidden z-50 divide-y divide-[#E2E8F0]/80 text-[#17301F]">
                {searchResults.length > 0 ? (
                  searchResults.map((item, idx) => (
                    <div key={`${item.stopId}-${idx}`} className="p-3.5 hover:bg-[#F0FDF4]/70 transition-colors">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <MapPin className="w-5 h-5 text-[#166534] mt-0.5 shrink-0" />
                          <div>
                            <span className="font-bold text-[#17301F] text-sm">{item.stopName}</span>
                            <div className="text-xs text-[#64748B]">
                              {item.route.route_name} · Stop #{item.sequence}
                            </div>
                            <div className="text-xs text-[#64748B] font-mono mt-0.5">
                              Sched: Shift 1 ({item.shift1Time || 'N/A'}) · Shift 2 ({item.shift2Time || 'N/A'})
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 justify-end">
                          {item.buses.map((b) => (
                            <button
                              key={b.id}
                              onClick={() => handleSelectSearchResult(item, b)}
                              className="px-3 py-1 text-xs font-bold clay-btn-mint flex items-center gap-1 cursor-pointer"
                            >
                              <span>Bus {b.bus_number}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs font-medium text-[#64748B]">
                    No matching stop found for &quot;{searchQuery}&quot;. Try searching common Indore landmark names.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Shift Selector & Timetable Action Row (Claymorphic Buttons) */}
        <div className="mt-8 pt-5 border-t border-white/60 flex flex-wrap items-center justify-between gap-4 text-xs font-bold">
          <div className="flex items-center gap-3">
            <span className="text-[#64748B] uppercase tracking-wide">College Shift:</span>
            <div className="inline-flex bg-white/70 backdrop-blur-xs p-1 border border-white/80 rounded-2xl gap-1 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.04)]">
              <button
                onClick={() => setShift('shift_1')}
                className={`px-3.5 py-1.5 rounded-xl uppercase font-bold transition-all ${
                  shift === 'shift_1'
                    ? 'clay-btn-primary shadow-xs'
                    : 'text-[#17301F] hover:bg-white/60'
                }`}
              >
                1st Shift (8:30 AM)
              </button>
              <button
                onClick={() => setShift('shift_2')}
                className={`px-3.5 py-1.5 rounded-xl uppercase font-bold transition-all ${
                  shift === 'shift_2'
                    ? 'clay-btn-primary shadow-xs'
                    : 'text-[#17301F] hover:bg-white/60'
                }`}
              >
                2nd Shift (10:30 AM)
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="px-4 py-2 clay-btn-mint flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#166534]" />
              <span>View Route Schedule</span>
            </button>

            <div className="flex items-center gap-2 glass-panel-mint px-3.5 py-2 text-[#166534]">
              <Clock className="w-4 h-4 text-[#166534]" />
              <span>Recommended: <b>10 minutes before</b> bus arrival.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Approaching Alert Banner (Claymorphic Green Alert) */}
      {approachingAlert && (
        <div className="clay-card-mint p-4 flex items-center justify-between gap-4 text-[#166534]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl clay-btn-green flex items-center justify-center font-bold text-lg">
              🚌
            </div>
            <div>
              <div className="font-extrabold text-sm uppercase">Approaching Bus Alert</div>
              <div className="text-xs font-medium text-[#17301F]">{approachingAlert.message}</div>
            </div>
          </div>
          <span className="text-xs clay-btn-green px-3.5 py-1 uppercase">
            ● LIVE ALERT
          </span>
        </div>
      )}

      {/* Main Grid: Live Map & Selected Bus Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Map & Route Progression (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Route Picker Bar (Claymorphic Control) */}
          <div className="glass-panel p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BusIcon className="w-5 h-5 text-[#166534]" />
              <label htmlFor="route-select" className="text-xs font-bold uppercase text-[#64748B]">Route:</label>
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
                className="text-xs font-bold text-[#17301F] bg-white border border-[#A7F3D0] rounded-xl px-3 py-1.5 focus:outline-none shadow-[inset_1px_1px_3px_rgba(0,0,0,0.04)]"
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
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold uppercase text-[#64748B]">Bus:</span>
                  {buses
                    .filter((b) => b.route_id === activeRoute.id)
                    .map((b) => {
                      const isSelected = activeBus?.id === b.id;
                      const isLive = b.status === 'ACTIVE' || b.status === 'APPROACHING';
                      return (
                        <button
                          key={b.id}
                          onClick={() => setActiveBus(b)}
                          className={`px-3 py-1 text-xs font-bold uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'clay-btn-primary shadow-xs'
                              : 'clay-btn-white hover:border-[#22C55E]'
                          }`}
                        >
                          {isLive && <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>}
                          <span>{b.bus_number}</span>
                        </button>
                      );
                    })}
                </div>

                <button
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="px-3 py-1.5 clay-btn-mint text-xs font-bold uppercase cursor-pointer"
                >
                  Schedule
                </button>
              </div>
            )}
          </div>

          {/* Interactive Live Map (Glass Card Frame with Soft Clay Border) */}
          <div className="glass-panel p-2.5">
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

          {/* Active Live Fleet Cards (Claymorphic Fleet Pods) */}
          <div className="glass-panel p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3.5 border-b border-white/60 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse shadow-[0_0_8px_#22c55e]"></span>
                <h3 className="text-xs font-bold text-[#166534] uppercase tracking-wider">
                  Active Live Buses ({activeBusesList.length})
                </h3>
              </div>
              <span className="text-xs text-[#64748B]">Tap bus to track</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                    className={`p-3.5 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'clay-card-active'
                        : 'clay-card clay-card-hover'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-[#166534] font-mono">BUS {bus.bus_number}</span>
                      <span className="text-[10px] px-2 py-0.5 clay-pill-live">
                        ● LIVE
                      </span>
                    </div>
                    <div className="text-[11px] font-medium text-[#64748B] truncate mt-1">
                      {bus.driver_name || 'Driver'}
                    </div>
                    <div className="text-[11px] font-bold text-[#17301F] uppercase truncate mt-0.5">
                      Next: {bus.next_stop_name || 'AITR Campus'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Selected Bus Card & Route Progression Timeline (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Selected Bus Status Card (Claymorphic) */}
          {activeBus ? (
            <div className="clay-card p-5 space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-white/70 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1 clay-btn-primary font-extrabold text-sm uppercase">
                      Bus {activeBus.bus_number}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-1 font-bold uppercase rounded-xl border ${
                        activeBus.status === 'ACTIVE'
                          ? 'clay-pill-live'
                          : activeBus.status === 'APPROACHING'
                          ? 'clay-pill-live animate-pulse'
                          : activeBus.status === 'DELAYED'
                          ? 'bg-[#FEF3C7] text-[#B45309] border-[#F59E0B]/60 shadow-xs'
                          : activeBus.status === 'GPS_OFFLINE'
                          ? 'bg-[#FEE2E2] text-[#DC2626] border-[#DC2626]/60 shadow-xs'
                          : 'bg-[#F8FAF5] text-[#64748B] border-[#E2E8F0]'
                      }`}
                    >
                      {activeBus.status === 'ACTIVE' ? '● LIVE' : activeBus.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#17301F] mt-3">
                    {activeRoute?.route_name || 'AITR Route'}
                  </h3>
                  <div className="text-xs text-[#64748B] mt-0.5">
                    Driver: <b>{activeBus.driver_name}</b> · {activeBus.driver_phone}
                  </div>
                </div>

                {activeBus.is_simulated && (
                  <span className="text-[10px] font-bold uppercase text-[#166534] clay-pill-mint px-2 py-1">
                    ⚡ SIMULATED
                  </span>
                )}
              </div>

              {/* ETA Card:
                  Background: #FFFFFF
                  Border:     #A7F3D0
                  ETA:        #166534
                  Styled with Claymorphism 3D tactile elevation & inner specular bevel
              */}
              {currentETA ? (
                <div className="bg-[#FFFFFF] border-2 border-[#A7F3D0] rounded-2xl p-4.5 shadow-[6px_8px_20px_rgba(22,101,52,0.08),inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-1.5px_-1.5px_3px_rgba(22,101,52,0.04)] relative overflow-hidden transition-all duration-200">
                  <div className="flex items-center justify-between text-xs text-[#64748B] font-bold uppercase mb-1">
                    <span className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22C55E]"></span>
                      </span>
                      <span>Target Stop:</span>
                    </span>
                    <span className="text-[#17301F] font-extrabold">{currentETA.target_stop_name}</span>
                  </div>

                  <div className="flex items-baseline justify-between mt-3">
                    <div>
                      <div className="text-4xl font-extrabold text-[#166534] tracking-tight font-mono flex items-baseline gap-2">
                        <span>{currentETA.formatted_eta}</span>
                        {currentETA.is_approaching && (
                          <span className="text-xs clay-btn-green px-2.5 py-0.5 font-bold uppercase">
                            Approaching
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-[#64748B] mt-1 uppercase">
                        Distance: <b className="text-[#17301F]">{currentETA.remaining_distance_km} km</b> · Speed: {currentETA.current_speed_kmh} km/h
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <div className="font-bold uppercase text-[#64748B]">Scheduled Arrival</div>
                      <div className="font-extrabold text-[#17301F] text-base font-mono">
                        {currentETA.scheduled_time || 'See Timetable'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-[#A7F3D0]/70 flex items-center justify-between text-[11px] font-bold text-[#64748B] uppercase">
                    <span>Stops Remaining: <b className="text-[#166534]">{currentETA.remaining_stops_count}</b></span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                      <span>Updated {currentETA.last_updated_seconds_ago}s ago</span>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="glass-panel p-4 text-center text-xs font-medium text-[#64748B] border-dashed">
                  Select a stop from the route sequence below to view route-aware ETA and distance.
                </div>
              )}

              {/* Quick Telemetry Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white/70 backdrop-blur-xs border border-[#A7F3D0]/80 rounded-xl shadow-[inset_1px_1px_2px_rgba(255,255,255,0.8)]">
                  <span className="text-[#64748B] font-bold block text-[10px] uppercase">Last Stop</span>
                  <span className="font-bold text-[#17301F] truncate block mt-0.5">
                    {activeBus.current_stop_name || 'Departing Origin'}
                  </span>
                </div>
                <div className="p-3 bg-white/70 backdrop-blur-xs border border-[#A7F3D0]/80 rounded-xl shadow-[inset_1px_1px_2px_rgba(255,255,255,0.8)]">
                  <span className="text-[#64748B] font-bold block text-[10px] uppercase">Next Stop</span>
                  <span className="font-bold text-[#17301F] truncate block mt-0.5">
                    {activeBus.next_stop_name || 'Acropolis Campus'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-6 text-center font-medium text-[#64748B] text-sm">
              Please select a bus to view live tracking details.
            </div>
          )}

          {/* Route Sequence & Stops Timeline (Glassmorphic Container with Clay Stop Cards) */}
          {activeRoute && (
            <div className="glass-panel p-5">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/60">
                <div>
                  <h4 className="text-sm font-bold text-[#166534] uppercase">Route Stops Sequence</h4>
                  <span className="text-xs text-[#64748B]">
                    {activeRoute.stops.length} stops from {activeRoute.origin} to AITR
                  </span>
                </div>
                <button
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="text-xs font-bold uppercase clay-btn-mint px-2.5 py-1 cursor-pointer"
                >
                  Timetable
                </button>
              </div>

              {/* Vertical Stop Timeline with Clay Cards */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {activeRoute.stops.map((rs, idx) => {
                  const isCurrentBusStop = activeBus?.current_stop_index === idx;
                  const isSelectedStop = selectedStopId === rs.stop_id;
                  const isPassed = (activeBus?.current_stop_index ?? 0) > idx;
                  const schedTime = shift === 'shift_1' ? rs.shift_1_time : rs.shift_2_time;

                  return (
                    <div
                      key={rs.id}
                      onClick={() => setSelectedStopId(rs.stop_id)}
                      className={`relative flex items-center justify-between p-3 cursor-pointer transition-all rounded-2xl ${
                        isSelectedStop
                          ? 'clay-card-active'
                          : 'clay-card clay-card-hover'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                            isCurrentBusStop
                              ? 'clay-btn-primary'
                              : isPassed
                              ? 'bg-[#E2E8F0] text-[#64748B]'
                              : isSelectedStop
                              ? 'clay-btn-green'
                              : 'bg-white text-[#17301F] border border-white/80 shadow-xs'
                          }`}
                        >
                          {isCurrentBusStop ? '🚌' : rs.sequence}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-[#17301F]">{rs.stop_name}</div>
                          <div className="text-[11px] text-[#64748B] font-mono">
                            Scheduled: {schedTime || 'Pending'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isCurrentBusStop && (
                          <span className="text-[10px] clay-pill-live px-2 py-0.5">
                            BUS HERE
                          </span>
                        )}
                        {isSelectedStop && !isCurrentBusStop && (
                          <span className="text-[10px] clay-btn-primary px-2 py-0.5">
                            SELECTED
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-[#64748B]" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Route Schedule Modal */}
      <RouteScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        routes={routes}
        buses={buses}
        initialRouteId={activeRoute?.id}
        onSelectRouteForTracking={(route, bus) => {
          setActiveRoute(route);
          if (bus) setActiveBus(bus);
          if (route.stops.length > 0) setSelectedStopId(route.stops[0].stop_id);
        }}
        currentShift={shift}
      />
    </div>
  );
};
