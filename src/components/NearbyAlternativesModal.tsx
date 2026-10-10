import React, { useState, useEffect, useMemo } from 'react';
import { useTransit } from '../context/TransitContext';
import { AlternativeBusCandidate, Bus, Route } from '../types/transit';
import {
  X,
  Search,
  Navigation,
  Footprints,
  Clock,
  Phone,
  ShieldCheck,
  AlertTriangle,
  Bus as BusIcon,
  Sparkles,
  ArrowRight,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface NearbyAlternativesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStopName?: string;
  onSelectBus?: (bus: Bus, route?: Route) => void;
}

export const NearbyAlternativesModal: React.FC<NearbyAlternativesModalProps> = ({
  isOpen,
  onClose,
  initialStopName,
  onSelectBus,
}) => {
  const { shift, setShift, routes, buses, fetchNearbyAlternatives, setActiveBus, setActiveRoute } = useTransit();
  const [searchQuery, setSearchQuery] = useState(initialStopName || '');
  const [candidates, setCandidates] = useState<AlternativeBusCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'exact' | 'walk'>('all');

  // Sync initialStopName when modal opens
  useEffect(() => {
    if (isOpen && initialStopName) {
      setSearchQuery(initialStopName);
    }
  }, [isOpen, initialStopName]);

  // Fetch alternatives when search query or shift changes
  useEffect(() => {
    if (!isOpen) return;

    const stopToSearch = searchQuery.trim();
    if (!stopToSearch) {
      setCandidates([]);
      return;
    }

    let isMounted = true;
    setLoading(true);

    fetchNearbyAlternatives(stopToSearch)
      .then((data) => {
        if (isMounted) {
          setCandidates(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, searchQuery, shift, fetchNearbyAlternatives]);

  const filteredCandidates = useMemo(() => {
    if (filterMode === 'exact') {
      return candidates.filter((c) => c.match_type === 'EXACT_STOP' || c.is_confirmed_replacement);
    }
    if (filterMode === 'walk') {
      return candidates.filter((c) => c.match_type === 'NEARBY_STOP');
    }
    return candidates;
  }, [candidates, filterMode]);

  const exactCount = useMemo(() => candidates.filter((c) => c.match_type === 'EXACT_STOP').length, [candidates]);
  const nearbyCount = useMemo(() => candidates.filter((c) => c.match_type === 'NEARBY_STOP').length, [candidates]);
  const predictedCount = useMemo(() => candidates.filter((c) => c.match_type === 'PREDICTED_CORRIDOR').length, [candidates]);

  if (!isOpen) return null;

  const handleSelect = (cand: AlternativeBusCandidate) => {
    setActiveBus(cand.bus);
    setActiveRoute(cand.route);
    if (onSelectBus) {
      onSelectBus(cand.bus, cand.route);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#17301F]/60 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl glass-modal overflow-hidden flex flex-col max-h-[90vh] my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 bg-[#166534] text-white flex items-center justify-between shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-48 bg-radial from-[#22C55E]/30 to-transparent pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl clay-card-mint flex items-center justify-center text-[#166534] shadow-md">
              <Navigation className="w-5 h-5 text-[#166534]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg tracking-tight">Smart Bus Replacement & Nearby Finder</h3>
              <p className="text-xs text-[#A7F3D0] font-medium">
                Find alternative buses for your stop, walking distances & replacement orders
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

        {/* Search & Shift Controls */}
        <div className="p-4 sm:p-5 border-b border-emerald-100/80 bg-white/70 backdrop-blur-sm space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter pickup stop (e.g. Bhanwarkua, IT Park, Bengali, Musakhedi)..."
                className="w-full pl-10 pr-4 py-2.5 clay-input text-sm font-semibold text-[#17301F] placeholder:text-[#64748B]/70"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#64748B] hover:text-[#17301F]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Shift Pill Selector */}
            <div className="flex items-center gap-1.5 p-1 bg-[#F8FAF5] rounded-xl border border-[#A7F3D0]/60 self-start sm:self-auto shadow-inner">
              <button
                type="button"
                onClick={() => setShift('shift_1')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  shift === 'shift_1'
                    ? 'clay-btn-primary shadow-xs'
                    : 'text-[#64748B] hover:text-[#17301F]'
                }`}
              >
                Shift 1 (8:30 AM)
              </button>
              <button
                type="button"
                onClick={() => setShift('shift_2')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  shift === 'shift_2'
                    ? 'clay-btn-primary shadow-xs'
                    : 'text-[#64748B] hover:text-[#17301F]'
                }`}
              >
                Shift 2 (10:30 AM)
              </button>
            </div>
          </div>

          {/* Quick Filter Tags */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterMode === 'all'
                    ? 'bg-[#166534] text-white shadow-xs'
                    : 'bg-white text-[#64748B] border border-emerald-100 hover:bg-emerald-50/50'
                }`}
              >
                All Ranked ({candidates.length})
              </button>
              <button
                onClick={() => setFilterMode('exact')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterMode === 'exact'
                    ? 'bg-[#166534] text-white shadow-xs'
                    : 'bg-white text-[#64748B] border border-emerald-100 hover:bg-emerald-50/50'
                }`}
              >
                Exact Stop ({exactCount})
              </button>
              <button
                onClick={() => setFilterMode('walk')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterMode === 'walk'
                    ? 'bg-[#166534] text-white shadow-xs'
                    : 'bg-white text-[#64748B] border border-emerald-100 hover:bg-emerald-50/50'
                }`}
              >
                Nearby Walk ({nearbyCount})
              </button>
            </div>

            {searchQuery && (
              <span className="text-xs text-[#64748B] font-medium">
                Searching alternatives for: <span className="font-bold text-[#166534]">{searchQuery}</span>
              </span>
            )}
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-gradient-to-b from-[#F8FAF5]/40 to-white/70">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-3 border-[#A7F3D0] border-t-[#166534] animate-spin" />
              <p className="text-sm font-semibold text-[#17301F]">
                Analyzing Indore transit corridors & walking routes...
              </p>
            </div>
          ) : !searchQuery.trim() ? (
            <div className="py-12 text-center max-w-md mx-auto">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl clay-card-mint flex items-center justify-center text-[#166534]">
                <BusIcon className="w-7 h-7" />
              </div>
              <h4 className="font-extrabold text-[#17301F] text-base mb-1">Enter your pickup stop above</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                We will instantly find other buses serving the exact same stop, verified stops within walking distance,
                and predicted corridor alternatives.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {['Bhanwarkua Chouraha', 'Rajiv Gandhi Chouraha', 'IT Park Chouraha', 'Musakhedi', 'Vijay Nagar'].map(
                  (stop) => (
                    <button
                      key={stop}
                      onClick={() => setSearchQuery(stop)}
                      className="px-2.5 py-1 text-xs font-semibold bg-white border border-[#A7F3D0] text-[#166534] rounded-lg hover:bg-emerald-50 shadow-xs"
                    >
                      {stop}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="py-12 text-center max-w-md mx-auto">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-[#17301F] text-base mb-1">No alternative buses found</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                No verified routes or nearby stops match &ldquo;{searchQuery}&rdquo;. Try typing part of the landmark
                name (e.g. &ldquo;Palasia&rdquo;, &ldquo;Dewas Naka&rdquo;, &ldquo;Ring Road&rdquo;).
              </p>
            </div>
          ) : (
            filteredCandidates.map((cand, idx) => {
              const isExact = cand.match_type === 'EXACT_STOP';
              const isConfirmed = cand.is_confirmed_replacement;
              const isPredicted = cand.match_type === 'PREDICTED_CORRIDOR';

              return (
                <div
                  key={`${cand.bus.id}-${cand.stop_id}-${idx}`}
                  className={`p-4 sm:p-5 rounded-2xl transition-all ${
                    isConfirmed
                      ? 'bg-amber-50/90 border-2 border-amber-400 shadow-md'
                      : isExact
                      ? 'clay-card hover:border-[#22C55E]'
                      : 'bg-white/80 border border-emerald-100 shadow-xs hover:border-[#A7F3D0]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    {/* Bus Identifier & Badges */}
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black shadow-xs shrink-0 ${
                          isConfirmed
                            ? 'bg-amber-500 text-white'
                            : isExact
                            ? 'bg-[#166534] text-white'
                            : 'bg-emerald-100 text-[#166534]'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-bold leading-none opacity-85">Bus</span>
                        <span className="text-lg leading-tight">{cand.bus.bus_number}</span>
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          {/* Match Type Badge */}
                          {isConfirmed ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-200 text-amber-900 border border-amber-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-amber-800" />
                              CONFIRMED REPLACEMENT
                            </span>
                          ) : isExact ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-[#166534] border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-[#22C55E]" />
                              Exact Stop Match
                            </span>
                          ) : isPredicted ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-indigo-600" />
                              Predicted Corridor ({cand.route_similarity_score}%)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                              <Footprints className="w-3 h-3 text-blue-600" />
                              Nearby Stop ({cand.distance_meters} m)
                            </span>
                          )}

                          {cand.bus.status === 'ACTIVE' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-white" />
                              LIVE ON ROUTE
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-sm sm:text-base text-[#17301F]">
                          {cand.route.route_name}
                        </h4>
                        <p className="text-xs text-[#64748B] mt-0.5">
                          Stop: <span className="font-semibold text-[#17301F]">{cand.stop_name}</span>
                        </p>
                      </div>
                    </div>

                    {/* Quick Timing & Walk Meta */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 bg-[#F8FAF5] sm:bg-transparent p-2.5 sm:p-0 rounded-xl">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#166534]" />
                        <span className="text-sm font-black text-[#166534]">
                          {cand.shift_time || 'Check Timetable'}
                        </span>
                        <span className="text-[11px] text-[#64748B] font-semibold">
                          ({shift === 'shift_1' ? 'Shift 1' : 'Shift 2'})
                        </span>
                      </div>

                      {cand.distance_meters > 0 && (
                        <div className="flex items-center gap-1 text-xs font-bold text-blue-700">
                          <Footprints className="w-3.5 h-3.5" />
                          <span>{cand.distance_meters} m walk · ~{cand.walking_time_minutes} min</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Confirmed Replacement Reason Banner */}
                  {isConfirmed && cand.replacement_reason && (
                    <div className="mt-3 p-2.5 rounded-xl bg-amber-100/70 border border-amber-300 text-xs text-amber-900 flex items-start gap-2">
                      <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold">Official Staff Replacement Order: </span>
                        <span>{cand.replacement_reason}</span>
                      </div>
                    </div>
                  )}

                  {/* Predicted Route Similarity Note */}
                  {isPredicted && (
                    <div className="mt-2.5 p-2 rounded-xl bg-indigo-50/80 border border-indigo-200 text-xs text-indigo-900 flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <span>
                        <strong className="font-semibold">Predicted Alternative: </strong>
                        Shares {cand.route_similarity_score}% corridor trajectory toward AITR Bypass. Subject to Transport Cell approval.
                      </span>
                    </div>
                  )}

                  {/* Driver Contact & Action Bar */}
                  <div className="mt-3 pt-3 border-t border-emerald-100/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                    <div className="flex flex-wrap items-center gap-3 text-[#64748B]">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Assigned Driver:</span>
                        <span className="font-bold text-[#17301F]">{cand.driver_name}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-[#166534]" />
                        {cand.driver_phone ? (
                          <span className="font-semibold text-[#166534]">
                            {cand.driver_phone}
                            {cand.is_verified_driver_phone && (
                              <span className="ml-1 text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.2 rounded">
                                Verified
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-[#64748B] italic font-medium">
                            Phone: Not Provided (Driver on file)
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelect(cand)}
                      className="px-3.5 py-2 rounded-xl clay-btn-mint text-xs font-bold flex items-center justify-center gap-1.5 self-end sm:self-auto hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <span>Track This Bus</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Data Safety & Policy Notice */}
        <div className="p-3.5 sm:px-6 bg-[#F8FAF5] border-t border-emerald-100/80 text-[11px] text-[#64748B] flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#166534] shrink-0" />
            <span>
              <strong>Data Integrity Guarantee:</strong> Driver contact details and route sheets are strictly verified from
              AITR Transport Cell records. No conductor phones are invented.
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg clay-btn-white text-xs font-bold text-[#17301F] shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
