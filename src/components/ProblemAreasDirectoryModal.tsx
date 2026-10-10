import React, { useState, useMemo } from 'react';
import { useTransit } from '../context/TransitContext';
import { AreaAlternativeHub, Bus, Route } from '../types/transit';
import {
  X,
  MapPin,
  Bus as BusIcon,
  Sparkles,
  CheckCircle2,
  Phone,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface ProblemAreasDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBus?: (bus: Bus, route?: Route) => void;
}

export const ProblemAreasDirectoryModal: React.FC<ProblemAreasDirectoryModalProps> = ({
  isOpen,
  onClose,
  onSelectBus,
}) => {
  const { problemAreaHubs, shift, setShift, setActiveBus, setActiveRoute, routes } = useTransit();
  const [selectedHubId, setSelectedHubId] = useState<string>(
    problemAreaHubs[0]?.id || 'hub-bhawarkua'
  );

  const selectedHub: AreaAlternativeHub | undefined = useMemo(() => {
    return (
      problemAreaHubs.find((h) => h.id === selectedHubId) ||
      problemAreaHubs[0]
    );
  }, [problemAreaHubs, selectedHubId]);

  if (!isOpen) return null;

  const handleSelectBus = (bus: Bus) => {
    const route = routes.find((r) => r.id === bus.route_id);
    setActiveBus(bus);
    if (route) setActiveRoute(route);
    if (onSelectBus) onSelectBus(bus, route);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#17301F]/60 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl glass-modal overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 sm:px-6 bg-[#166534] text-white flex items-center justify-between shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-radial from-[#22C55E]/30 to-transparent pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl clay-card-mint flex items-center justify-center text-[#166534] shadow-md">
              <MapPin className="w-5 h-5 text-[#166534]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                Persistent Alternatives Directory
              </h3>
              <p className="text-xs text-[#A7F3D0] font-medium">
                Recurring problem areas & bottleneck transit corridors in Indore
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all relative z-10"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shift Selection & Quick Guide Banner */}
        <div className="px-5 py-3 border-b border-emerald-100/80 bg-white/80 backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#17301F]">Selected Shift:</span>
            <div className="flex items-center gap-1.5 p-1 bg-[#F8FAF5] rounded-xl border border-[#A7F3D0]/60 shadow-inner">
              <button
                onClick={() => setShift('shift_1')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  shift === 'shift_1' ? 'clay-btn-primary shadow-xs' : 'text-[#64748B] hover:text-[#17301F]'
                }`}
              >
                Shift 1 (8:30 AM)
              </button>
              <button
                onClick={() => setShift('shift_2')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  shift === 'shift_2' ? 'clay-btn-primary shadow-xs' : 'text-[#64748B] hover:text-[#17301F]'
                }`}
              >
                Shift 2 (10:30 AM)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 font-semibold text-[#166534]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#166534]" /> Regular
            </span>
            <span className="flex items-center gap-1 font-semibold text-indigo-700">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Predicted
            </span>
            <span className="flex items-center gap-1 font-semibold text-amber-700">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Confirmed
            </span>
          </div>
        </div>

        {/* Modal Body: Left Hub Sidebar & Right Alternatives Viewer */}
        <div className="flex-1 overflow-hidden flex flex-col sm:flex-row min-h-[420px]">
          {/* Left Hub Selector */}
          <div className="w-full sm:w-64 border-b sm:border-b-0 sm:border-r border-emerald-100/80 bg-[#F8FAF5]/60 overflow-y-auto p-2 sm:p-3 space-y-1.5 shrink-0 max-h-48 sm:max-h-none">
            <div className="px-2 py-1 text-[11px] font-black uppercase tracking-wider text-[#64748B]">
              Key Transit Hubs
            </div>
            {problemAreaHubs.map((hub) => {
              const isSelected = hub.id === selectedHub?.id;
              const hasConfirmed = hub.confirmedReplacements && hub.confirmedReplacements.length > 0;

              return (
                <button
                  key={hub.id}
                  onClick={() => setSelectedHubId(hub.id)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'clay-card-active font-bold text-[#166534] shadow-sm'
                      : 'hover:bg-white text-[#17301F]'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold leading-snug">{hub.name}</div>
                    <div className="text-[10px] text-[#64748B] line-clamp-1">{hub.locality}</div>
                  </div>
                  {hasConfirmed && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                      Alert
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Hub Details & Categorized Alternatives */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-white/70">
            {selectedHub ? (
              <>
                {/* Hub Header & Geography */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-white border border-[#A7F3D0]/60 shadow-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#166534] mb-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{selectedHub.locality}</span>
                      </div>
                      <h4 className="text-lg font-black text-[#17301F]">{selectedHub.name}</h4>
                      <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                        {selectedHub.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 1. Confirmed Replacements Section (if active) */}
                {selectedHub.confirmedReplacements && selectedHub.confirmedReplacements.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-black text-amber-900 uppercase tracking-wide">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>Confirmed Replacements Active For This Area</span>
                    </div>

                    <div className="space-y-2">
                      {selectedHub.confirmedReplacements.map((rep) => (
                        <div
                          key={rep.id}
                          className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-sm"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-500 text-white">
                                Bus {rep.replacement_bus_number}
                              </span>
                              <span className="text-xs font-extrabold text-amber-900">
                                Replaces Bus {rep.regular_bus_number}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-amber-800">
                              Effective: {rep.effective_date} ({rep.shift === 'both' ? 'Both Shifts' : rep.shift})
                            </span>
                          </div>

                          <p className="text-xs text-amber-950 mb-2 font-medium">
                            <strong>Reason:</strong> {rep.reason}
                          </p>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-amber-200 text-xs">
                            <div className="flex items-center gap-3">
                              <span className="text-[#64748B]">Driver: <strong>{rep.replacement_driver_name || 'Assigned Driver'}</strong></span>
                              <span className="text-[#166534] flex items-center gap-1 font-semibold">
                                <Phone className="w-3.5 h-3.5" />
                                {rep.replacement_driver_phone || 'Phone on file'}
                              </span>
                            </div>
                            <span className="text-[11px] text-amber-800 italic">
                              Confirmed by Transport Staff
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Regular Routes & Buses Section */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-black text-[#17301F] uppercase tracking-wide">
                    <span className="flex items-center gap-1.5">
                      <BusIcon className="w-4 h-4 text-[#166534]" />
                      Regular Buses Directly Serving {selectedHub.name} ({selectedHub.regularBuses.length})
                    </span>
                    <span className="text-[11px] text-[#64748B] normal-case font-medium">
                      Exact Stop Scheduled
                    </span>
                  </div>

                  {selectedHub.regularBuses.length === 0 ? (
                    <div className="p-4 rounded-xl bg-gray-50 text-xs text-[#64748B]">
                      No regular buses have exact stop recordings here. See predicted corridor alternatives below.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedHub.regularBuses.map((bus) => {
                        const route = routes.find((r) => r.id === bus.route_id);
                        const stopInRoute = route?.stops.find((s) =>
                          s.stop_name.toLowerCase().includes(selectedHub.normalized_name)
                        );
                        const scheduledTime =
                          shift === 'shift_1' ? stopInRoute?.shift_1_time : stopInRoute?.shift_2_time;

                        return (
                          <div
                            key={bus.id}
                            className="p-3.5 rounded-2xl clay-card hover:border-[#22C55E] flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="w-8 h-8 rounded-lg bg-[#166534] text-white flex items-center justify-center font-black text-xs shadow-xs">
                                    {bus.bus_number}
                                  </span>
                                  <div>
                                    <div className="text-xs font-bold text-[#17301F] leading-tight">
                                      {route?.route_name || 'Route'}
                                    </div>
                                    <div className="text-[10px] text-[#64748B]">Group {route?.group_number}</div>
                                  </div>
                                </div>
                                {bus.status === 'ACTIVE' && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                    ● Live
                                  </span>
                                )}
                              </div>

                              <div className="mt-2 flex items-center justify-between text-xs text-[#64748B] bg-[#F8FAF5] p-2 rounded-xl">
                                <div className="flex items-center gap-1 font-bold text-[#166534]">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{scheduledTime || '07:45 AM'}</span>
                                </div>
                                <div className="flex items-center gap-1 text-[11px]">
                                  <Phone className="w-3 h-3 text-[#64748B]" />
                                  <span>{bus.driver_phone || 'Phone on file'}</span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 pt-2.5 border-t border-emerald-100/60 flex items-center justify-between">
                              <span className="text-[11px] text-[#64748B]">
                                Driver: <strong>{bus.driver_name}</strong>
                              </span>
                              <button
                                onClick={() => handleSelectBus(bus)}
                                className="px-2.5 py-1 rounded-lg clay-btn-mint text-xs font-bold flex items-center gap-1 shadow-xs"
                              >
                                <span>Track</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 3. Predicted Alternatives (Shared Corridor) Section */}
                <div className="space-y-2.5 pt-2 border-t border-emerald-100/80">
                  <div className="flex items-center justify-between text-xs font-black text-indigo-900 uppercase tracking-wide">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      Predicted Corridor Alternatives ({selectedHub.predictedAlternatives.length})
                    </span>
                    <span className="text-[11px] text-[#64748B] normal-case font-medium">
                      High corridor overlap & nearby boarding
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-900 leading-relaxed flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Important Transport Rule:</strong> Predicted alternative buses traverse the same corridor or
                      stop within walkable distance, but boarding is subject to Transport Cell capacity and confirmation.
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {selectedHub.predictedAlternatives.map((cand, idx) => (
                      <div
                        key={`${cand.bus.id}-${idx}`}
                        className="p-3.5 rounded-2xl bg-white border border-indigo-100 hover:border-indigo-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <span className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-black text-sm shrink-0">
                            {cand.bus.bus_number}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#17301F]">{cand.route_name}</span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-indigo-100 text-indigo-800">
                                {cand.similarity}% Corridor Overlap
                              </span>
                            </div>
                            <p className="text-xs text-[#64748B] mt-0.5">{cand.reason}</p>
                            <div className="flex items-center gap-3 text-xs text-[#64748B] mt-1.5">
                              <span>Driver: <strong>{cand.bus.driver_name}</strong></span>
                              <span>
                                Contact: {cand.bus.driver_phone || 'Not Provided on file'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleSelectBus(cand.bus)}
                          className="px-3 py-1.5 rounded-xl clay-btn-white text-xs font-bold text-indigo-900 flex items-center justify-center gap-1 self-end sm:self-auto shadow-xs"
                        >
                          <span>View Route</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:px-6 bg-[#F8FAF5] border-t border-emerald-100/80 text-[11px] text-[#64748B] flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#166534] shrink-0" />
            <span>
              Reusable Directory for recurring bottleneck areas across Indore. Always check with Transport Cell for official seat allocations.
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg clay-btn-white text-xs font-bold text-[#17301F] shadow-xs"
          >
            Close Directory
          </button>
        </div>
      </div>
    </div>
  );
};
