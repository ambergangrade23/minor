import React, { useState } from 'react';
import { useTransit } from '../context/TransitContext';
import { Bus, Route, ShiftType } from '../types/transit';
import {
  Search,
  Clock,
  Bus as BusIcon,
  ChevronRight,
  UserCheck,
  X,
  Compass,
} from 'lucide-react';

interface FindMyBusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRouteBus?: (route: Route, bus: Bus, stopId?: string) => void;
}

export const FindMyBusModal: React.FC<FindMyBusModalProps> = ({
  isOpen,
  onClose,
  onSelectRouteBus,
}) => {
  const { buses, routes, shift, setShift, replacements } = useTransit();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRouteFilter, setSelectedRouteFilter] = useState<string>('ALL');

  if (!isOpen) return null;

  // Filtered bus list based on search query
  const filteredBuses = buses.filter((bus) => {
    const term = searchTerm.toLowerCase();
    const route = routes.find((r) => r.id === bus.route_id);
    const busMatch = bus.bus_number.toLowerCase().includes(term);
    const driverMatch = (bus.driver_name || '').toLowerCase().includes(term);
    const stopMatch = route?.stops.some((s) => s.stop_name.toLowerCase().includes(term));
    const corridorMatch = (bus.pickup_areas || []).some((area) => area.toLowerCase().includes(term));

    const matchesSearch = !searchTerm.trim() || busMatch || driverMatch || stopMatch || corridorMatch;
    const matchesFilter = selectedRouteFilter === 'ALL' || bus.route_id === selectedRouteFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/90 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.22)] p-6 sm:p-7 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200/80 flex items-center justify-center text-sky-700 shadow-sm">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold uppercase tracking-wide text-[#0f172a]">
                Find My Bus & Route Search
              </h3>
              <p className="text-xs text-[#64748b]">
                Search by bus number, pickup stop, or driver name
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Shift selector */}
        <div className="space-y-3 mb-4 shrink-0">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type bus number (e.g. Bus 12), stop (e.g. Bhawarkua), or driver name..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-[#0f172a] placeholder:text-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/30"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
              <button
                onClick={() => setSelectedRouteFilter('ALL')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedRouteFilter === 'ALL'
                    ? 'bg-[#0f172a] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Fleet ({buses.length})
              </button>
              {routes.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRouteFilter(r.id)}
                  className={`px-3 py-1 rounded-lg whitespace-nowrap transition-all ${
                    selectedRouteFilter === r.id
                      ? 'bg-[#0f172a] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {r.route_name.split('·')[0]}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setShift('shift_1')}
                className={`px-2.5 py-1 text-[11px] font-black rounded-lg transition-all ${
                  shift === 'shift_1' ? 'bg-white text-[#0f172a] shadow-xs' : 'text-slate-500'
                }`}
              >
                Shift 1
              </button>
              <button
                onClick={() => setShift('shift_2')}
                className={`px-2.5 py-1 text-[11px] font-black rounded-lg transition-all ${
                  shift === 'shift_2' ? 'bg-white text-[#0f172a] shadow-xs' : 'text-slate-500'
                }`}
              >
                Shift 2
              </button>
            </div>
          </div>
        </div>

        {/* Bus Results List */}
        <div className="space-y-3 overflow-y-auto pr-1 flex-1">
          {filteredBuses.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No bus routes found matching "{searchTerm}". Try searching for major stops like Bhanwarkua, Palasia, or Annapurna.
            </div>
          ) : (
            filteredBuses.map((bus) => {
              const route = routes.find((r) => r.id === bus.route_id);
              const rep = replacements.find(
                (rp) => rp.regular_bus_number === bus.bus_number && rp.status === 'PUBLISHED'
              );

              return (
                <div
                  key={bus.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center shrink-0 shadow-sm">
                        <BusIcon className="w-4 h-4 text-sky-400" />
                        <span className="text-[10px] font-black">{bus.bus_number.replace('Bus ', '#')}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-[#0f172a] group-hover:text-sky-700 transition-colors">
                            {bus.bus_number}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              rep
                                ? 'bg-amber-100 text-amber-800'
                                : bus.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {rep ? `Replaced by ${rep.replacement_bus_number}` : bus.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 font-medium">
                          {route?.route_name || (bus.pickup_areas && bus.pickup_areas.join(', '))}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-sky-600" />
                            <span className="font-semibold text-slate-700">{bus.driver_name || 'Assigned Driver'}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {shift === 'shift_1' ? '07:15 AM' : '08:45 AM'}
                            </span>
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {route?.stops.length || 0} Scheduled Stops
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (route && onSelectRouteBus) {
                          onSelectRouteBus(route, bus);
                        }
                        onClose();
                      }}
                      className="px-3 py-2 rounded-xl bg-sky-50 group-hover:bg-sky-600 text-sky-700 group-hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs shrink-0 self-center"
                    >
                      <span>Track Route</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Acropolis Institute bus transport directory</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#0f172a] text-white font-bold hover:bg-sky-700 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
