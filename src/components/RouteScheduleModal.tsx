import React, { useState, useMemo, useEffect } from 'react';
import { Route, Bus, ShiftType } from '../types/transit';
import {
  X,
  Clock,
  Bus as BusIcon,
  Search,
  ArrowRight,
  Printer,
  MapPin,
  Calendar,
} from 'lucide-react';

interface RouteScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  routes: Route[];
  buses: Bus[];
  initialRouteId?: string | null;
  onSelectRouteForTracking: (route: Route, bus?: Bus) => void;
  currentShift: ShiftType;
}

export const RouteScheduleModal: React.FC<RouteScheduleModalProps> = ({
  isOpen,
  onClose,
  routes,
  buses,
  initialRouteId,
  onSelectRouteForTracking,
}) => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>(
    initialRouteId || routes[0]?.id || ''
  );
  const [searchFilter, setSearchFilter] = useState('');
  const [activeShiftTab, setActiveShiftTab] = useState<'both' | 'shift_1' | 'shift_2'>('both');

  useEffect(() => {
    if (initialRouteId) {
      setSelectedRouteId(initialRouteId);
    } else if (routes.length > 0 && !selectedRouteId) {
      setSelectedRouteId(routes[0].id);
    }
  }, [initialRouteId, routes, selectedRouteId]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Selected route
  const currentRoute = useMemo(() => {
    return routes.find((r) => r.id === selectedRouteId) || routes[0];
  }, [routes, selectedRouteId]);

  // Assigned buses for current route
  const assignedBuses = useMemo(() => {
    if (!currentRoute) return [];
    return buses.filter((b) => b.route_id === currentRoute.id);
  }, [buses, currentRoute]);

  // Filtered routes list based on search
  const filteredRoutes = useMemo(() => {
    if (!searchFilter.trim()) return routes;
    const q = searchFilter.toLowerCase();
    return routes.filter(
      (r) =>
        r.route_name.toLowerCase().includes(q) ||
        r.origin.toLowerCase().includes(q) ||
        r.assigned_bus_numbers.some((b) => b.toLowerCase().includes(q)) ||
        r.stops.some((s) => s.stop_name.toLowerCase().includes(q))
    );
  }, [routes, searchFilter]);

  if (!isOpen) return null;

  // Origin departure and arrival times calculation
  const originStop = currentRoute?.stops[0];
  const lastStop = currentRoute?.stops[currentRoute.stops.length - 1];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#17301F]/45 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div
        className="glass-modal w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] text-[#17301F]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header in Primary #166534 Deep Forest Green with Frosted Glass */}
        <div className="bg-[#166534]/95 backdrop-blur-md text-white p-5 sm:p-6 flex items-start justify-between gap-4 border-b border-white/15">
          <div>
            <div className="flex items-center gap-2 text-[#A7F3D0] text-xs font-bold uppercase tracking-wider mb-1">
              <Calendar className="w-4 h-4 text-[#A7F3D0]" />
              <span>AITR Official Master Route Timetable</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Standard Bus Timetable & Route Schedule
            </h2>
            <p className="text-white/80 font-medium text-xs sm:text-sm mt-0.5">
              Acropolis Institute of Technology & Research (AITR), Indore · 1st Shift (8:30 AM) & 2nd Shift (10:30 AM)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              title="Print timetable"
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl transition-all text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl transition-all cursor-pointer shadow-xs"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Modal Controls / Search & Route Selector (Frosted Glass Bar) */}
        <div className="bg-white/80 backdrop-blur-md border-b border-white/60 p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs font-bold">
          {/* Search Input (Claymorphic) */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search route, stop or bus number (e.g. Mhow Naka, G55, Vijay Nagar)..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 clay-input text-[#17301F] font-medium placeholder-[#64748B]"
            />
          </div>

          {/* Shift Filter Segmented Control (Claymorphic) */}
          <div className="flex items-center gap-1 bg-white/90 p-1 rounded-2xl border border-white/80 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.04)]">
            <span className="text-[11px] font-bold uppercase px-2 text-[#64748B]">Shift:</span>
            <button
              onClick={() => setActiveShiftTab('both')}
              className={`px-3 py-1 font-bold uppercase rounded-xl transition-all ${
                activeShiftTab === 'both' ? 'clay-btn-primary shadow-xs' : 'text-[#64748B] hover:text-[#17301F]'
              }`}
            >
              Both Shifts
            </button>
            <button
              onClick={() => setActiveShiftTab('shift_1')}
              className={`px-3 py-1 font-bold uppercase rounded-xl transition-all ${
                activeShiftTab === 'shift_1' ? 'clay-btn-primary shadow-xs' : 'text-[#64748B] hover:text-[#17301F]'
              }`}
            >
              1st Shift (8:30 AM)
            </button>
            <button
              onClick={() => setActiveShiftTab('shift_2')}
              className={`px-3 py-1 font-bold uppercase rounded-xl transition-all ${
                activeShiftTab === 'shift_2' ? 'clay-btn-primary shadow-xs' : 'text-[#64748B] hover:text-[#17301F]'
              }`}
            >
              2nd Shift (10:30 AM)
            </button>
          </div>
        </div>

        {/* Modal Body: Sidebar Route Picker & Timetable Details */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[350px]">
          {/* Left Column: Routes List (4 cols) */}
          <div className="md:col-span-4 border-r border-white/80 overflow-y-auto max-h-[500px] p-3 space-y-2 bg-[#F8FAF5]/80">
            <div className="text-[11px] font-bold text-[#64748B] px-2 py-1 uppercase tracking-wider">
              All 24 Routes ({filteredRoutes.length})
            </div>

            {filteredRoutes.map((route) => {
              const isSelected = route.id === selectedRouteId;
              return (
                <button
                  key={route.id}
                  onClick={() => setSelectedRouteId(route.id)}
                  className={`w-full text-left p-3.5 transition-all rounded-2xl cursor-pointer ${
                    isSelected
                      ? 'clay-card-active'
                      : 'clay-card clay-card-hover'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 clay-pill-mint text-[#166534]">
                      Group {route.group_number}
                    </span>
                    <span className="text-[11px] font-extrabold font-mono text-[#166534]">
                      {route.assigned_bus_numbers.join(', ')}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-[#17301F] mt-1.5 line-clamp-1">
                    {route.origin}
                  </div>

                  <div className="text-[11px] font-medium text-[#64748B] flex items-center justify-between mt-1">
                    <span>{route.stops.length} Stops</span>
                    <span>To AITR Campus</span>
                  </div>
                </button>
              );
            })}

            {filteredRoutes.length === 0 && (
              <div className="p-4 text-center text-xs font-medium text-[#64748B]">
                No routes found matching &quot;{searchFilter}&quot;.
              </div>
            )}
          </div>

          {/* Right Column: Active Route Schedule Details (8 cols) */}
          <div className="md:col-span-8 overflow-y-auto max-h-[500px] p-5 sm:p-6 space-y-6 bg-white/70">
            {currentRoute && (
              <>
                {/* Active Route Summary Card (Claymorphic) */}
                <div className="clay-card p-5 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 clay-btn-primary font-mono text-xs font-bold uppercase mb-1">
                        <span>Route Group {currentRoute.group_number}</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-extrabold text-[#166534]">
                        {currentRoute.route_name}
                      </h3>
                      <div className="text-xs font-medium text-[#64748B] flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#166534]" />
                        <span>Origin: <b>{currentRoute.origin}</b></span>
                        <ArrowRight className="w-3 h-3 text-[#64748B]" />
                        <span>Destination: <b>{currentRoute.destination} (AITR)</b></span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onSelectRouteForTracking(currentRoute, assignedBuses[0]);
                        onClose();
                      }}
                      className="px-4 py-2 clay-btn-green text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer"
                    >
                      <BusIcon className="w-3.5 h-3.5" />
                      <span>Track Live</span>
                    </button>
                  </div>

                  {/* Assigned Buses Chips */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/80">
                    <span className="text-xs font-bold uppercase text-[#64748B]">Assigned Fleet:</span>
                    {assignedBuses.map((bus) => (
                      <span
                        key={bus.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 clay-pill-mint text-xs font-bold"
                      >
                        <span className="font-mono text-[#166534] font-extrabold">BUS {bus.bus_number}</span>
                        <span>·</span>
                        <span className="text-[#64748B]">{bus.driver_name || 'Driver'}</span>
                      </span>
                    ))}
                  </div>

                  {/* Departure & Arrival Schedule Highlights */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3.5 bg-white/85 rounded-2xl border border-white/90 shadow-[inset_1px_1px_3px_rgba(255,255,255,0.9),0_2px_8px_rgba(22,101,52,0.04)]">
                      <div className="flex items-center justify-between text-xs font-bold uppercase text-[#166534] mb-1">
                        <span>1st Shift Schedule</span>
                        <span className="text-[10px] clay-pill-live px-2 py-0.5 font-bold">
                          College: 8:30 AM
                        </span>
                      </div>
                      <div className="text-xs text-[#64748B] space-y-1 mt-2">
                        <div className="flex justify-between">
                          <span>Origin Departure:</span>
                          <span className="font-extrabold text-[#17301F] font-mono">
                            {originStop?.shift_1_time || '7:15 AM'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>AITR Arrival:</span>
                          <span className="font-extrabold text-[#17301F] font-mono">
                            {lastStop?.shift_1_time || '8:25 AM'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 bg-white/85 rounded-2xl border border-white/90 shadow-[inset_1px_1px_3px_rgba(255,255,255,0.9),0_2px_8px_rgba(22,101,52,0.04)]">
                      <div className="flex items-center justify-between text-xs font-bold uppercase text-[#166534] mb-1">
                        <span>2nd Shift Schedule</span>
                        <span className="text-[10px] clay-pill-live px-2 py-0.5 font-bold">
                          College: 10:30 AM
                        </span>
                      </div>
                      <div className="text-xs text-[#64748B] space-y-1 mt-2">
                        <div className="flex justify-between">
                          <span>Origin Departure:</span>
                          <span className="font-extrabold text-[#17301F] font-mono">
                            {originStop?.shift_2_time || '9:15 AM'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>AITR Arrival:</span>
                          <span className="font-extrabold text-[#17301F] font-mono">
                            {lastStop?.shift_2_time || '10:25 AM'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advisory Notice */}
                <div className="glass-panel-mint p-3.5 text-xs font-medium text-[#17301F] flex items-start gap-2.5">
                  <Clock className="w-5 h-5 text-[#166534] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold uppercase text-[#166534]">AITR Transport Advisory: </span>
                    <span>
                      Students & faculty are instructed to reach their stop approximately <b>10 minutes before</b> scheduled bus arrival.
                    </span>
                  </div>
                </div>

                {/* Complete Stop-by-Stop Timetable Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-white/80 pb-2">
                    <h4 className="text-xs font-bold uppercase text-[#166534]">
                      Stop-by-Stop Timetable ({currentRoute.stops.length} Stops)
                    </h4>
                    <span className="text-[11px] text-[#64748B]">
                      Heading Towards AITR Campus
                    </span>
                  </div>

                  <div className="border border-white/90 rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(22,101,52,0.06)] bg-white/80">
                    <table className="w-full text-left text-xs divide-y divide-[#E2E8F0]/70">
                      <thead className="bg-[#F0FDF4]/90 text-[11px] font-bold text-[#166534] uppercase">
                        <tr>
                          <th className="px-3.5 py-3 w-10 text-center">#</th>
                          <th className="px-3.5 py-3">Stop Name</th>
                          {(activeShiftTab === 'both' || activeShiftTab === 'shift_1') && (
                            <th className="px-3.5 py-3">
                              <div>Shift 1 Arrival</div>
                              <div className="text-[10px] font-normal text-[#64748B]">Rec: -10 min</div>
                            </th>
                          )}
                          {(activeShiftTab === 'both' || activeShiftTab === 'shift_2') && (
                            <th className="px-3.5 py-3">
                              <div>Shift 2 Arrival</div>
                              <div className="text-[10px] font-normal text-[#64748B]">Rec: -10 min</div>
                            </th>
                          )}
                          <th className="px-3.5 py-3 text-right">Data Quality</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]/60 bg-white/60 font-medium">
                        {currentRoute.stops.map((stop, index) => {
                          const isFirst = index === 0;
                          const isDestination = index === currentRoute.stops.length - 1;

                          return (
                            <tr
                              key={stop.id}
                              className={`hover:bg-[#F0FDF4]/70 transition-colors ${
                                isFirst || isDestination ? 'bg-[#F0FDF4]/50' : ''
                              }`}
                            >
                              <td className="px-3.5 py-2.5 text-center font-bold text-[#64748B]">
                                {stop.sequence}
                              </td>

                              <td className="px-3.5 py-2.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-[#17301F] font-bold">{stop.stop_name}</span>
                                  {isFirst && (
                                    <span className="text-[10px] clay-btn-primary px-2 py-0.5">
                                      ORIGIN
                                    </span>
                                  )}
                                  {isDestination && (
                                    <span className="text-[10px] clay-btn-green px-2 py-0.5">
                                      CAMPUS
                                    </span>
                                  )}
                                </div>
                              </td>

                              {(activeShiftTab === 'both' || activeShiftTab === 'shift_1') && (
                                <td className="px-3.5 py-2.5 font-mono text-[#17301F] font-bold">
                                  {stop.shift_1_time ? (
                                    <span>{stop.shift_1_time}</span>
                                  ) : (
                                    <span className="text-[#64748B] font-normal uppercase text-[10px]">Verification Pending</span>
                                  )}
                                </td>
                              )}

                              {(activeShiftTab === 'both' || activeShiftTab === 'shift_2') && (
                                <td className="px-3.5 py-2.5 font-mono text-[#17301F] font-bold">
                                  {stop.shift_2_time ? (
                                    <span>{stop.shift_2_time}</span>
                                  ) : (
                                    <span className="text-[#64748B] font-normal uppercase text-[10px]">Verification Pending</span>
                                  )}
                                </td>
                              )}

                              <td className="px-3.5 py-2.5 text-right">
                                {stop.data_quality === 'needs_verification' || !stop.shift_1_time ? (
                                  <span className="text-[10px] font-bold uppercase bg-[#FEF3C7] text-[#B45309] border border-[#F59E0B]/60 rounded-lg px-2 py-0.5">
                                    OCR Pending
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold text-[#166534] uppercase">
                                    Verified
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-white/80 backdrop-blur-md border-t border-white/60 p-4 flex flex-wrap items-center justify-between gap-3 text-xs font-medium">
          <div className="text-[#64748B]">
            Source: <b>AITR Master Transport Route Document</b> · Official shift schedules for Indore region.
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 clay-btn-white uppercase cursor-pointer"
          >
            Close Schedule
          </button>
        </div>
      </div>
    </div>
  );
};
