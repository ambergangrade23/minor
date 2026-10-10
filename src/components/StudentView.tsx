import React, { useState, useMemo } from 'react';
import { useTransit } from '../context/TransitContext';
import { LeafletMap } from './LeafletMap';
import { RouteScheduleModal } from './RouteScheduleModal';
import { NearbyAlternativesModal } from './NearbyAlternativesModal';
import { ProblemAreasDirectoryModal } from './ProblemAreasDirectoryModal';
import { Bus, Route } from '../types/transit';
import {
  Search,
  Clock,
  MapPin,
  Bus as BusIcon,
  ChevronRight,
  Calendar,
  Navigation,
  Compass,
  AlertTriangle,
  Phone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Info,
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
    replacements,
  } = useTransit();

  const [searchQuery, setSearchQuery] = useState('');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);
  const [isAlternativesModalOpen, setIsAlternativesModalOpen] = useState<boolean>(false);
  const [isProblemAreasModalOpen, setIsProblemAreasModalOpen] = useState<boolean>(false);
  const [targetAlternativeStop, setTargetAlternativeStop] = useState<string>('');

  // Selected stop object
  const selectedStop = useMemo(() => {
    if (!selectedStopId || !activeRoute) return null;
    return activeRoute.stops.find((s) => s.stop_id === selectedStopId) || null;
  }, [selectedStopId, activeRoute]);

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

  // Check for Confirmed Replacement Announcement for currently active bus
  const activeReplacementForCurrentBus = useMemo(() => {
    if (!activeBus) return null;
    return replacements.find(
      (r) =>
        r.status === 'PUBLISHED' &&
        (r.regular_bus_id === activeBus.id || r.regular_bus_number === activeBus.bus_number) &&
        (r.shift === 'both' || r.shift === shift)
    );
  }, [activeBus, replacements, shift]);

  // Check for Confirmed Replacement Announcement for currently selected stop
  const activeReplacementForCurrentStop = useMemo(() => {
    if (!selectedStop) return null;
    const stopNameLower = selectedStop.stop_name.toLowerCase();
    return replacements.find(
      (r) =>
        r.status === 'PUBLISHED' &&
        r.affected_stops.some((s) => s.toLowerCase().includes(stopNameLower) || stopNameLower.includes(s.toLowerCase())) &&
        (r.shift === 'both' || r.shift === shift)
    );
  }, [selectedStop, replacements, shift]);

  // Approaching alerts for selected stop
  const approachingAlert = useMemo(() => {
    if (!selectedStopId) return null;
    return notifications.find(
      (n) => n.stop_id === selectedStopId && (n.type === 'APPROACHING' || n.type === 'ARRIVED')
    );
  }, [selectedStopId, notifications]);

  const handleOpenAlternativesForStop = (stopName: string) => {
    setTargetAlternativeStop(stopName);
    setIsAlternativesModalOpen(true);
  };

  const handleSwitchToReplacement = (replacementBusNumber: string) => {
    const repBus = buses.find((b) => b.bus_number === replacementBusNumber);
    if (repBus) {
      setActiveBus(repBus);
      const repRoute = routes.find((r) => r.id === repBus.route_id);
      if (repRoute) setActiveRoute(repRoute);
    }
  };

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
              <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
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
            {replacements.filter((r) => r.status === 'PUBLISHED').length > 0 && (
              <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-extrabold shadow-xs inline-flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>
                  {replacements.filter((r) => r.status === 'PUBLISHED').length} Daily Bus Changes Active
                </span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#166534] leading-tight mb-2.5">
            Real-Time College Bus Tracking & Nearby Route Finder
          </h1>
          <p className="text-[#64748B] font-medium text-sm sm:text-base mb-6 max-w-2xl leading-relaxed">
            Live telemetry for Acropolis Institute of Technology & Research (AITR). Track buses in real-time, find smart nearby alternative routes, and view verified daily replacement announcements.
          </p>

          {/* Claymorphic Inset Search Bar */}
          <div className="relative max-w-2xl">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-[#64748B] absolute left-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search your stop or locality (e.g. Bhanwarkua, IT Park, Bengali, Musakhedi, Vijay Nagar)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full clay-input text-[#17301F] font-medium placeholder-[#64748B] text-sm sm:text-base pl-12 pr-32 py-3.5 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (searchQuery.trim()) {
                    handleOpenAlternativesForStop(searchQuery.trim());
                  }
                }}
                className="absolute right-2 px-4 py-2 clay-btn-primary text-xs sm:text-sm font-bold uppercase cursor-pointer"
              >
                Find Alternatives
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
                          <button
                            onClick={() => handleOpenAlternativesForStop(item.stopName)}
                            className="px-2.5 py-1 text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 flex items-center gap-1 shadow-xs"
                            title="Find other buses serving this stop or nearby"
                          >
                            <Navigation className="w-3 h-3" />
                            <span>Alternatives</span>
                          </button>
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

        {/* Shift Selector & Smart Finder Action Row */}
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

          {/* Quick Action Modals Trigger Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setTargetAlternativeStop(selectedStop?.stop_name || 'Bhanwarkua Chouraha');
                setIsAlternativesModalOpen(true);
              }}
              className="px-4 py-2 clay-btn-mint flex items-center gap-1.5 cursor-pointer shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Navigation className="w-4 h-4 text-[#166534]" />
              <span>Nearby Alternative Buses</span>
            </button>

            <button
              onClick={() => setIsProblemAreasModalOpen(true)}
              className="px-4 py-2 clay-btn-white text-[#17301F] border border-emerald-100 flex items-center gap-1.5 cursor-pointer shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Compass className="w-4 h-4 text-[#166534]" />
              <span>Bottleneck Hubs Directory</span>
            </button>

            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="px-3.5 py-2 bg-white/80 hover:bg-white text-[#17301F] border border-white/90 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Calendar className="w-4 h-4 text-[#166534]" />
              <span>Timetable</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmed Bus Replacement Official Announcement Banner */}
      {(activeReplacementForCurrentBus || activeReplacementForCurrentStop) && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/95 border-2 border-amber-400 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0">
              ⚠️
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[11px] font-black uppercase bg-amber-200 text-amber-900 border border-amber-300">
                  Official Transport Notice
                </span>
                <span className="text-xs font-bold text-amber-900">
                  Effective: {(activeReplacementForCurrentBus || activeReplacementForCurrentStop)?.effective_date} (
                  {(activeReplacementForCurrentBus || activeReplacementForCurrentStop)?.shift === 'both'
                    ? 'Both Shifts'
                    : (activeReplacementForCurrentBus || activeReplacementForCurrentStop)?.shift}
                  )
                </span>
              </div>

              <h3 className="text-base font-extrabold text-amber-950">
                Bus {(activeReplacementForCurrentBus || activeReplacementForCurrentStop)?.replacement_bus_number} is the confirmed replacement for Bus {(activeReplacementForCurrentBus || activeReplacementForCurrentStop)?.regular_bus_number}
              </h3>

              <p className="text-xs text-amber-900 mt-1 font-medium leading-relaxed">
                <strong>Reason: </strong>
                {(activeReplacementForCurrentBus || activeReplacementForCurrentStop)?.reason}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-amber-950 font-semibold">
                <span>
                  Assigned Driver: <strong>{(activeReplacementForCurrentBus || activeReplacementForCurrentStop)?.replacement_driver_name || 'Staff Driver'}</strong>
                </span>
                <span className="flex items-center gap-1 text-[#166534]">
                  <Phone className="w-3.5 h-3.5" />
                  {(activeReplacementForCurrentBus || activeReplacementForCurrentStop)?.replacement_driver_phone || 'Contact on file with Transport Cell'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            <button
              onClick={() => {
                const repNum = (activeReplacementForCurrentBus || activeReplacementForCurrentStop)?.replacement_bus_number;
                if (repNum) handleSwitchToReplacement(repNum);
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95"
            >
              <span>Track Replacement Bus {(activeReplacementForCurrentBus || activeReplacementForCurrentStop)?.replacement_bus_number}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
                    const defaultBus = buses.find((b) => b.route_id === r.id);
                    if (defaultBus) setActiveBus(defaultBus);
                    if (r.stops.length > 0) setSelectedStopId(r.stops[0].stop_id);
                  }
                }}
                className="clay-input text-xs font-bold text-[#17301F] py-1.5 px-3 rounded-xl focus:outline-none max-w-[280px] truncate"
              >
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.route_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (selectedStop) {
                    handleOpenAlternativesForStop(selectedStop.stop_name);
                  } else if (activeRoute && activeRoute.stops.length > 0) {
                    handleOpenAlternativesForStop(activeRoute.stops[0].stop_name);
                  }
                }}
                className="px-3 py-1.5 text-xs font-bold clay-btn-mint flex items-center gap-1 shadow-xs"
                title="Find alternative buses for this route/stop"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Nearby Alternatives</span>
              </button>
            </div>
          </div>

          {/* Leaflet Interactive Map View */}
          <LeafletMap activeBus={activeBus} activeRoute={activeRoute} selectedStopId={selectedStopId} />

          {/* Active Fleet Quick Switcher Grid (Claymorphic Cards) */}
          <div className="glass-panel p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase text-[#166534] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                Active Buses On Route ({activeBusesList.length} Active / {buses.length} Total)
              </span>
              <span className="text-[11px] text-[#64748B] font-medium">Click bus card to track</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
              {buses.slice(0, 15).map((bus) => {
                const isSelected = activeBus?.id === bus.id;
                const isReplaced = bus.assignment_status === 'REPLACED_TEMPORARILY';
                const isReplacement = bus.assignment_status === 'CONFIRMED_REPLACEMENT';

                return (
                  <button
                    key={bus.id}
                    onClick={() => {
                      setActiveBus(bus);
                      const r = routes.find((rt) => rt.id === bus.route_id);
                      if (r) setActiveRoute(r);
                    }}
                    className={`p-3 text-left transition-all cursor-pointer rounded-2xl ${
                      isSelected
                        ? 'clay-card-active'
                        : 'clay-card clay-card-hover'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-[#166534] font-mono">BUS {bus.bus_number}</span>
                      {isReplacement ? (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-amber-100 text-amber-800">
                          REP
                        </span>
                      ) : bus.status === 'ACTIVE' ? (
                        <span className="text-[10px] px-2 py-0.5 clay-pill-live">
                          ● LIVE
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#64748B] font-semibold">
                          {isReplaced ? 'Replaced' : 'Standby'}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-medium text-[#64748B] truncate mt-1">
                      {bus.driver_name || 'Driver on file'}
                    </div>
                    <div className="text-[10px] font-bold text-[#17301F] uppercase truncate mt-0.5">
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
                          ? 'clay-pill-live'
                          : activeBus.status === 'DELAYED'
                          ? 'bg-[#FEF3C7] text-[#B45309] border-[#F59E0B]/60 shadow-xs'
                          : activeBus.status === 'GPS_OFFLINE'
                          ? 'bg-[#FEE2E2] text-[#DC2626] border-[#DC2626]/60 shadow-xs'
                          : 'bg-[#F8FAF5] text-[#64748B] border-[#E2E8F0]'
                      }`}
                    >
                      {activeBus.status === 'ACTIVE' ? '● LIVE' : activeBus.status}
                    </span>

                    {activeBus.assignment_status === 'CONFIRMED_REPLACEMENT' && (
                      <span className="text-xs px-2 py-0.5 font-black bg-amber-100 text-amber-800 border border-amber-300 rounded-lg">
                        CONFIRMED REPLACEMENT
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-[#17301F] mt-3">
                    {activeRoute?.route_name || 'AITR Route'}
                  </h3>

                  <div className="text-xs text-[#64748B] mt-1 flex flex-wrap items-center gap-2">
                    <span>Driver: <b>{activeBus.driver_name || 'Driver on file'}</b></span>
                    <span className="text-slate-300">·</span>
                    {activeBus.driver_phone ? (
                      <span className="font-semibold text-[#166534] flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {activeBus.driver_phone}
                      </span>
                    ) : (
                      <span className="text-[#64748B] italic">Phone: Not Provided (Driver on file)</span>
                    )}
                  </div>
                </div>

                {activeBus.is_simulated && (
                  <span className="text-[10px] font-bold uppercase text-[#166534] clay-pill-mint px-2 py-1">
                    ⚡ SIMULATED
                  </span>
                )}
              </div>

              {/* ETA Card: Styled with Claymorphism 3D tactile elevation */}
              {currentETA ? (
                <div className="bg-[#FFFFFF] border-2 border-[#A7F3D0] rounded-2xl p-4.5 shadow-[6px_8px_20px_rgba(22,101,52,0.08),inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-1.5px_-1.5px_3px_rgba(22,101,52,0.04)] relative overflow-hidden transition-all duration-200">
                  <div className="flex items-center justify-between text-xs text-[#64748B] font-bold uppercase mb-1">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] shadow-[0_0_6px_#22c55e]" />
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
                    <button
                      onClick={() => handleOpenAlternativesForStop(currentETA.target_stop_name)}
                      className="text-[11px] font-bold text-[#166534] underline hover:text-emerald-800 flex items-center gap-1 lowercase"
                    >
                      <Navigation className="w-3 h-3 inline" />
                      <span>find alternative buses for this stop</span>
                    </button>
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (selectedStop) {
                        handleOpenAlternativesForStop(selectedStop.stop_name);
                      } else {
                        handleOpenAlternativesForStop(activeRoute.stops[0]?.stop_name || '');
                      }
                    }}
                    className="text-xs font-bold uppercase clay-btn-mint px-2.5 py-1 cursor-pointer flex items-center gap-1 shadow-xs"
                    title="Find nearby alternatives for this stop"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Alternatives</span>
                  </button>
                  <button
                    onClick={() => setIsScheduleModalOpen(true)}
                    className="text-xs font-bold uppercase bg-white text-[#17301F] border border-emerald-100 rounded-lg px-2.5 py-1 cursor-pointer shadow-xs"
                  >
                    Timetable
                  </button>
                </div>
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenAlternativesForStop(rs.stop_name);
                          }}
                          className="p-1 rounded-md text-[#64748B] hover:text-[#166534] hover:bg-emerald-50 transition-colors"
                          title={`Find alternative buses for ${rs.stop_name}`}
                        >
                          <Navigation className="w-3.5 h-3.5" />
                        </button>
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

      {/* Smart Nearby Alternative Buses Modal */}
      <NearbyAlternativesModal
        isOpen={isAlternativesModalOpen}
        onClose={() => setIsAlternativesModalOpen(false)}
        initialStopName={targetAlternativeStop}
        onSelectBus={(bus, route) => {
          setActiveBus(bus);
          if (route) setActiveRoute(route);
        }}
      />

      {/* Persistent Recurring Problem Areas Directory Modal */}
      <ProblemAreasDirectoryModal
        isOpen={isProblemAreasModalOpen}
        onClose={() => setIsProblemAreasModalOpen(false)}
        onSelectBus={(bus, route) => {
          setActiveBus(bus);
          if (route) setActiveRoute(route);
        }}
      />
    </div>
  );
};
