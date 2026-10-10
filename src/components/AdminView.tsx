import React, { useState, useEffect, useMemo } from 'react';
import { useTransit } from '../context/TransitContext';
import { LeafletMap } from './LeafletMap';
import { Bus, RouteStop, ShiftType } from '../types/transit';
import { calculateRouteSimilarity } from '../utils/routeFinder';
import {
  Radio,
  Play,
  Square,
  RefreshCw,
  Search,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  Phone,
  ShieldCheck,
  Plus,
  X,
  Edit2,
  Sparkles,
  ArrowRight,
  Send,
  Info,
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const {
    buses,
    routes,
    metrics,
    refreshData,
    replacements,
    publishReplacement,
    cancelReplacement,
    updateBusInfo,
  } = useTransit();

  const [activeTab, setActiveTab] = useState<'overview' | 'fleet' | 'replacements' | 'verification' | 'demo'>('replacements');
  const [searchTerm, setSearchTerm] = useState('');

  // Daily Bus Change Publisher Form State
  const [regBusId, setRegBusId] = useState<string>(() => buses[0]?.id || '');
  const [repBusId, setRepBusId] = useState<string>(() => buses[1]?.id || '');
  const [effectiveDate, setEffectiveDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [effectiveShift, setEffectiveShift] = useState<ShiftType | 'both'>('shift_1');
  const [selectedAffectedStops, setSelectedAffectedStops] = useState<string[]>([]);
  const [changeReason, setChangeReason] = useState<string>('Scheduled Preventive Depot Maintenance');
  const [isSubmittingChange, setIsSubmittingChange] = useState<boolean>(false);
  const [publishFeedback, setPublishFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Edit Bus / Driver Assignment State
  const [editingBus, setEditingBus] = useState<Bus | null>(null);
  const [editDriverName, setEditDriverName] = useState('');
  const [editDriverPhone, setEditDriverPhone] = useState('');
  const [editAssignmentStatus, setEditAssignmentStatus] = useState<'REGULAR' | 'CONFIRMED_REPLACEMENT' | 'REPLACED_TEMPORARILY' | 'MAINTENANCE'>('REGULAR');
  const [isSavingBus, setIsSavingBus] = useState(false);

  // Demo simulator state
  const [simBusId, setSimBusId] = useState<string>(() => {
    const g55 = buses.find((b) => b.bus_number === 'G55');
    return g55 ? g55.id : buses[0]?.id || '';
  });
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);

  // Verification queue data
  const [verificationQueue, setVerificationQueue] = useState<{
    flaggedBuses: Bus[];
    flaggedStops: Array<{ route_id: string; route_name: string; stop: RouteStop }>;
  }>({ flaggedBuses: [], flaggedStops: [] });

  const [editingItem, setEditingItem] = useState<{
    type: 'bus' | 'stop';
    id: string;
    name: string;
    field1: string;
    field2: string;
  } | null>(null);

  // Selected regular bus object
  const currentRegularBus = useMemo(() => {
    return buses.find((b) => b.id === regBusId) || buses[0];
  }, [buses, regBusId]);

  // Selected regular route
  const currentRegularRoute = useMemo(() => {
    if (!currentRegularBus) return null;
    return routes.find((r) => r.id === currentRegularBus.route_id) || null;
  }, [routes, currentRegularBus]);

  // Selected replacement bus object
  const currentReplacementBus = useMemo(() => {
    return buses.find((b) => b.id === repBusId) || buses[1];
  }, [buses, repBusId]);

  // Auto-populate affected stops when regular route changes
  useEffect(() => {
    if (currentRegularRoute) {
      setSelectedAffectedStops(currentRegularRoute.stops.map((s) => s.stop_name));
    }
  }, [currentRegularRoute]);

  // Candidate replacement buses ranked by corridor similarity to regular route
  const recommendedReplacements = useMemo(() => {
    if (!currentRegularRoute) return [];
    return routes
      .filter((r) => r.id !== currentRegularRoute.id)
      .map((r) => {
        const sim = calculateRouteSimilarity(currentRegularRoute, r);
        const assignedBuses = buses.filter((b) => b.route_id === r.id);
        return {
          route: r,
          similarity: sim.score,
          sharedStops: sim.sharedStops,
          buses: assignedBuses,
        };
      })
      .filter((item) => item.similarity >= 30)
      .sort((a, b) => b.similarity - a.similarity);
  }, [currentRegularRoute, routes, buses]);

  const fetchVerificationQueue = async () => {
    try {
      const res = await fetch('/api/admin/verification-queue');
      if (res.ok) {
        const data = await res.json();
        if (data && data.success) {
          setVerificationQueue({
            flaggedBuses: data.flaggedBuses || [],
            flaggedStops: data.flaggedStops || [],
          });
        }
      }
    } catch (e) {
      console.warn('Notice: verification queue sync paused:', e);
    }
  };

  useEffect(() => {
    fetchVerificationQueue();
  }, []);

  const handleToggleDemo = async (start: boolean) => {
    try {
      const res = await fetch('/api/admin/demo-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bus_id: simBusId,
          active: start,
          speedMultiplier: simSpeed,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success) {
          setIsDemoRunning(data.active);
          refreshData();
        }
      }
    } catch (e) {
      console.warn('Demo simulation request notice:', e);
    }
  };

  const handlePublishBusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regBusId || !repBusId) {
      setPublishFeedback({ type: 'error', message: 'Please select both a regular bus and a replacement bus.' });
      return;
    }
    if (regBusId === repBusId) {
      setPublishFeedback({ type: 'error', message: 'The replacement bus cannot be identical to the regular bus.' });
      return;
    }
    if (selectedAffectedStops.length === 0) {
      setPublishFeedback({ type: 'error', message: 'Please confirm at least one affected stop.' });
      return;
    }

    setIsSubmittingChange(true);
    setPublishFeedback(null);

    const res = await publishReplacement({
      regular_bus_id: regBusId,
      replacement_bus_id: repBusId,
      effective_date: effectiveDate,
      shift: effectiveShift,
      affected_stops: selectedAffectedStops,
      reason: changeReason.trim() || 'Scheduled fleet operational adjustment',
      published_by: 'AITR Transport Cell Administration',
    });

    setIsSubmittingChange(false);
    if (res.success) {
      setPublishFeedback({
        type: 'success',
        message: `Official change published successfully! Students on Bus ${currentRegularBus?.bus_number} have been alerted about Replacement Bus ${currentReplacementBus?.bus_number}.`,
      });
      refreshData();
    } else {
      setPublishFeedback({
        type: 'error',
        message: res.error || 'Failed to publish replacement announcement.',
      });
    }
  };

  const handleCancelAnnouncement = async (changeId: string) => {
    if (!window.confirm('Are you sure you want to cancel this published bus replacement? Regular route operations will be restored.')) {
      return;
    }
    const res = await cancelReplacement(changeId);
    if (res.success) {
      refreshData();
    } else {
      alert(res.error || 'Failed to cancel replacement');
    }
  };

  const handleOpenEditBus = (bus: Bus) => {
    setEditingBus(bus);
    setEditDriverName(bus.driver_name || '');
    setEditDriverPhone(bus.driver_phone || '');
    setEditAssignmentStatus(bus.assignment_status || 'REGULAR');
  };

  const handleSaveBusInfo = async () => {
    if (!editingBus) return;
    setIsSavingBus(true);
    const res = await updateBusInfo(editingBus.id, {
      driver_name: editDriverName.trim(),
      driver_phone: editDriverPhone.trim() || undefined,
      assignment_status: editAssignmentStatus,
    });
    setIsSavingBus(false);
    if (res.success) {
      setEditingBus(null);
      refreshData();
    } else {
      alert(res.error || 'Failed to update bus details');
    }
  };

  const handleSaveVerification = async () => {
    if (!editingItem) return;
    try {
      const updates =
        editingItem.type === 'bus'
          ? { bus_number: editingItem.field1, driver_name: editingItem.field2 }
          : { latitude: Number(editingItem.field1), longitude: Number(editingItem.field2) };

      const res = await fetch('/api/admin/verify-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: editingItem.type,
          id: editingItem.id,
          updates,
        }),
      });

      if (res.ok) {
        setEditingItem(null);
        fetchVerificationQueue();
        refreshData();
      }
    } catch (e) {
      console.warn('Record verification update notice:', e);
    }
  };

  const filteredBuses = buses.filter(
    (b) =>
      b.bus_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.driver_name && b.driver_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.route_name && b.route_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Admin Navigation Tabs (Glassmorphic Bar with Clay Buttons) */}
      <div className="glass-panel p-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('replacements')}
            className={`px-4 py-2 text-xs font-bold uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'replacements' ? 'clay-btn-primary shadow-xs' : 'clay-btn-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Daily Bus Changes ({replacements.filter((r) => r.status === 'PUBLISHED').length})</span>
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer ${
              activeTab === 'overview' ? 'clay-btn-primary shadow-xs' : 'clay-btn-white'
            }`}
          >
            Fleet Map
          </button>
          <button
            onClick={() => setActiveTab('fleet')}
            className={`px-4 py-2 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer ${
              activeTab === 'fleet' ? 'clay-btn-primary shadow-xs' : 'clay-btn-white'
            }`}
          >
            Buses & Drivers ({buses.length})
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`px-4 py-2 text-xs font-bold uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'verification' ? 'clay-btn-primary shadow-xs' : 'clay-btn-white'
            }`}
          >
            <span>Verification Queue</span>
            {metrics?.needsVerificationCount ? (
              <span className="px-1.5 py-0.5 text-[10px] clay-pill-mint text-[#166534] font-mono font-bold">
                {metrics.needsVerificationCount}
              </span>
            ) : null}
          </button>
          <button
            onClick={() => setActiveTab('demo')}
            className={`px-4 py-2 text-xs font-bold uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'demo' ? 'clay-btn-primary shadow-xs' : 'clay-btn-white'
            }`}
          >
            <span>Demo Simulator</span>
            {isDemoRunning && <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>}
          </button>
        </div>

        <button
          onClick={() => {
            refreshData();
            fetchVerificationQueue();
          }}
          className="px-3.5 py-2 clay-btn-mint text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="uppercase">Sync</span>
        </button>
      </div>

      {/* Claymorphic Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="clay-card p-3.5 text-center sm:text-left">
          <span className="text-[10px] text-[#64748B] font-bold uppercase block">Total Buses</span>
          <span className="text-2xl font-extrabold text-[#166534] font-mono tabular-nums">{metrics?.totalBuses ?? buses.length}</span>
        </div>
        <div className="clay-card p-3.5 text-center sm:text-left border-b-2 border-b-[#22C55E]">
          <span className="text-[10px] text-[#22C55E] font-bold uppercase block">● Active</span>
          <span className="text-2xl font-extrabold text-[#22C55E] font-mono tabular-nums">{metrics?.activeBuses ?? 0}</span>
        </div>
        <div className="clay-card p-3.5 text-center sm:text-left">
          <span className="text-[10px] text-[#64748B] font-bold uppercase block">Inactive</span>
          <span className="text-2xl font-extrabold text-[#64748B] font-mono tabular-nums">{metrics?.inactiveBuses ?? 0}</span>
        </div>
        <div className="clay-card p-3.5 text-center sm:text-left border-b-2 border-b-amber-500">
          <span className="text-[10px] text-amber-700 font-bold uppercase block">Replacements</span>
          <span className="text-2xl font-extrabold text-amber-600 font-mono tabular-nums">
            {replacements.filter((r) => r.status === 'PUBLISHED').length}
          </span>
        </div>
        <div className="clay-card p-3.5 text-center sm:text-left border-b-2 border-b-[#166534]">
          <span className="text-[10px] text-[#166534] font-bold uppercase block">GPS Online</span>
          <span className="text-2xl font-extrabold text-[#166534] font-mono tabular-nums">{metrics?.gpsOnline ?? 0}</span>
        </div>
        <div className="clay-card p-3.5 text-center sm:text-left border-b-2 border-b-[#DC2626]">
          <span className="text-[10px] text-[#DC2626] font-bold uppercase block">GPS Offline</span>
          <span className="text-2xl font-extrabold text-[#DC2626] font-mono tabular-nums">{metrics?.gpsOffline ?? 0}</span>
        </div>
        <div className="clay-card p-3.5 text-center sm:text-left">
          <span className="text-[10px] text-[#166534] font-bold uppercase block">Active Trips</span>
          <span className="text-2xl font-extrabold text-[#166534] font-mono tabular-nums">{metrics?.activeTrips ?? 0}</span>
        </div>
        <div className="clay-card p-3.5 text-center sm:text-left border-b-2 border-b-[#F59E0B]">
          <span className="text-[10px] text-[#B45309] font-bold uppercase block">Verification</span>
          <span className="text-2xl font-extrabold text-[#B45309] font-mono tabular-nums">{metrics?.needsVerificationCount ?? 0}</span>
        </div>
      </div>

      {/* Tab 1: Daily Bus Changes & Replacements Management */}
      {activeTab === 'replacements' && (
        <div className="space-y-6">
          {/* Section A: Publisher Form */}
          <div className="clay-card p-5 sm:p-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/80 pb-4">
              <div>
                <h3 className="text-lg font-black text-[#166534] flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <span>Publish Daily Bus Change Notification</span>
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Authorized Transport Staff interface. Publish substitution orders to immediately notify affected students with replacement bus, stop times, and driver contacts.
                </p>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-extrabold self-start sm:self-auto shadow-xs">
                Transport Cell Authority
              </span>
            </div>

            {publishFeedback && (
              <div
                className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-3 ${
                  publishFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                    : 'bg-rose-50 text-rose-900 border border-rose-300'
                }`}
              >
                <span>{publishFeedback.message}</span>
                <button
                  onClick={() => setPublishFeedback(null)}
                  className="font-bold underline text-xs"
                >
                  Dismiss
                </button>
              </div>
            )}

            <form onSubmit={handlePublishBusChange} className="space-y-5">
              {/* Bus Selectors Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Regular Bus */}
                <div>
                  <label className="text-xs font-bold uppercase text-[#64748B] block mb-1.5">
                    1. Regular Bus (Undergoing maintenance / repair)
                  </label>
                  <select
                    value={regBusId}
                    onChange={(e) => setRegBusId(e.target.value)}
                    className="w-full p-2.5 clay-input text-xs font-bold text-[#17301F]"
                  >
                    {buses.map((b) => (
                      <option key={b.id} value={b.id}>
                        Bus {b.bus_number} — {b.route_name} ({b.driver_name || 'Driver on file'})
                      </option>
                    ))}
                  </select>
                  {currentRegularRoute && (
                    <div className="mt-1.5 text-[11px] text-[#64748B] font-medium">
                      Assigned route has <strong className="text-[#17301F]">{currentRegularRoute.stops.length} stops</strong> from {currentRegularRoute.origin} to AITR.
                    </div>
                  )}
                </div>

                {/* 2. Replacement Bus */}
                <div>
                  <label className="text-xs font-bold uppercase text-[#64748B] block mb-1.5">
                    2. Replacement Bus (Confirmed substitute vehicle)
                  </label>
                  <select
                    value={repBusId}
                    onChange={(e) => setRepBusId(e.target.value)}
                    className="w-full p-2.5 clay-input text-xs font-bold text-[#17301F]"
                  >
                    {buses
                      .filter((b) => b.id !== regBusId)
                      .map((b) => (
                        <option key={b.id} value={b.id}>
                          Bus {b.bus_number} — {b.route_name} ({b.driver_name || 'Driver on file'})
                        </option>
                      ))}
                  </select>
                  {currentReplacementBus && (
                    <div className="mt-1.5 text-[11px] text-[#166534] font-medium flex items-center gap-2">
                      <span>Driver: <strong>{currentReplacementBus.driver_name || 'Driver on file'}</strong></span>
                      <span>·</span>
                      <span>Contact: {currentReplacementBus.driver_phone || 'Not Provided (on file)'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommended Candidate Corridor Substitutes Hint */}
              {recommendedReplacements.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200">
                  <div className="flex items-center gap-1.5 text-xs font-black text-indigo-900 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Smart Corridor Recommendations (Shared stops with Bus {currentRegularBus?.bus_number})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recommendedReplacements.slice(0, 4).map((rec) => (
                      rec.buses.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setRepBusId(b.id)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all ${
                            repBusId === b.id
                              ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                              : 'bg-white text-indigo-900 border-indigo-200 hover:bg-indigo-100/70'
                          }`}
                        >
                          Bus {b.bus_number} ({rec.similarity}% overlap)
                        </button>
                      ))
                    ))}
                  </div>
                </div>
              )}

              {/* Date & Shift Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-[#64748B] block mb-1.5">
                    3. Effective Date
                  </label>
                  <input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="w-full p-2.5 clay-input text-xs font-bold text-[#17301F]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-[#64748B] block mb-1.5">
                    4. Effective Shift
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setEffectiveShift('shift_1')}
                      className={`py-2 px-2 text-xs font-bold rounded-xl transition-all ${
                        effectiveShift === 'shift_1' ? 'clay-btn-primary shadow-xs' : 'clay-btn-white text-[#64748B]'
                      }`}
                    >
                      Shift 1 (8:30 AM)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEffectiveShift('shift_2')}
                      className={`py-2 px-2 text-xs font-bold rounded-xl transition-all ${
                        effectiveShift === 'shift_2' ? 'clay-btn-primary shadow-xs' : 'clay-btn-white text-[#64748B]'
                      }`}
                    >
                      Shift 2 (10:30 AM)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEffectiveShift('both')}
                      className={`py-2 px-2 text-xs font-bold rounded-xl transition-all ${
                        effectiveShift === 'both' ? 'clay-btn-primary shadow-xs' : 'clay-btn-white text-[#64748B]'
                      }`}
                    >
                      Both Shifts
                    </button>
                  </div>
                </div>
              </div>

              {/* 5. Affected Stops Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase text-[#64748B]">
                    5. Confirm Affected Stops ({selectedAffectedStops.length} of {currentRegularRoute?.stops.length || 0} selected)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (currentRegularRoute) {
                          setSelectedAffectedStops(currentRegularRoute.stops.map((s) => s.stop_name));
                        }
                      }}
                      className="text-[11px] font-bold text-[#166534] underline hover:text-emerald-800"
                    >
                      Select All Stops
                    </button>
                    <span className="text-slate-300">·</span>
                    <button
                      type="button"
                      onClick={() => setSelectedAffectedStops([])}
                      className="text-[11px] font-bold text-rose-700 underline hover:text-rose-900"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#F8FAF5] border border-emerald-100 max-h-44 overflow-y-auto flex flex-wrap gap-1.5">
                  {currentRegularRoute?.stops.map((s) => {
                    const isSelected = selectedAffectedStops.includes(s.stop_name);
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => {
                          setSelectedAffectedStops((prev) =>
                            isSelected ? prev.filter((st) => st !== s.stop_name) : [...prev, s.stop_name]
                          );
                        }}
                        className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-[#166534] text-white shadow-xs'
                            : 'bg-white text-[#64748B] border border-emerald-100 hover:bg-emerald-50'
                        }`}
                      >
                        {isSelected && '✓ '}
                        {s.stop_name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 6. Reason for Change */}
              <div>
                <label className="text-xs font-bold uppercase text-[#64748B] block mb-1.5">
                  6. Reason for Bus Change Announcement
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {[
                    'Scheduled Preventive Depot Maintenance',
                    'Mechanical Breakdown / Workshop Repair',
                    'Route Optimization & Corridor Capacity Relief',
                    'Assigned Driver Emergency Leave',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setChangeReason(preset)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all ${
                        changeReason === preset
                          ? 'bg-[#166534] text-white border-[#166534]'
                          : 'bg-white text-[#64748B] border-emerald-100 hover:bg-emerald-50'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  placeholder="Enter reason for student bulletin..."
                  className="w-full p-2.5 clay-input text-xs font-semibold text-[#17301F]"
                  required
                />
              </div>

              {/* Live Preview Card */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 space-y-2">
                <span className="text-[11px] font-black uppercase text-amber-900 tracking-wider flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-700" />
                  <span>Student Alert Live Preview</span>
                </span>
                <p className="text-xs text-amber-950 font-bold">
                  Official Transport Notice: Bus {currentReplacementBus?.bus_number} will replace Bus {currentRegularBus?.bus_number} on {effectiveDate} ({effectiveShift === 'both' ? 'Both Shifts' : effectiveShift}).
                </p>
                <div className="text-[11px] text-amber-900 flex flex-wrap gap-3">
                  <span>Driver: <strong>{currentReplacementBus?.driver_name || 'Driver on file'}</strong></span>
                  <span>Contact: {currentReplacementBus?.driver_phone || 'Phone on file'}</span>
                  <span>Affected Stops: {selectedAffectedStops.length} stops</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingChange}
                  className="px-6 py-3 clay-btn-green text-white font-extrabold text-xs uppercase flex items-center gap-2 shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmittingChange ? 'Publishing Announcement...' : 'Publish Bus Change Announcement'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Section B: Active & Published Announcements Table */}
          <div className="clay-card p-5 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-white/80 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#166534]">
                  Active & Published Bus Replacements ({replacements.length})
                </h3>
                <p className="text-xs text-[#64748B]">
                  Manage effective replacement bulletins. Cancel anytime to restore normal route schedules.
                </p>
              </div>
            </div>

            {replacements.length === 0 ? (
              <div className="p-8 text-center text-xs font-semibold text-[#64748B]">
                No replacement announcements currently active. Use the form above to publish one.
              </div>
            ) : (
              <div className="space-y-3">
                {replacements.map((rep) => {
                  const isPublished = rep.status === 'PUBLISHED';
                  return (
                    <div
                      key={rep.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isPublished
                          ? 'bg-amber-50/90 border-amber-300 shadow-sm'
                          : 'bg-white/60 border-slate-200 opacity-70'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase ${
                              isPublished ? 'bg-amber-500 text-white' : 'bg-slate-300 text-slate-700'
                            }`}
                          >
                            Bus {rep.replacement_bus_number} ⇄ Bus {rep.regular_bus_number}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {rep.status}
                          </span>
                        </div>

                        <span className="text-xs font-bold text-[#17301F]">
                          Effective: {rep.effective_date} · {rep.shift === 'both' ? 'Both Shifts' : rep.shift}
                        </span>
                      </div>

                      <p className="text-xs text-[#17301F] mt-2 font-medium">
                        <strong>Reason:</strong> {rep.reason}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-amber-200/80">
                        <div className="flex flex-wrap items-center gap-3 text-[#64748B]">
                          <span>
                            Driver: <strong>{rep.replacement_driver_name || 'Staff Driver'}</strong>
                          </span>
                          <span className="flex items-center gap-1 text-[#166534] font-semibold">
                            <Phone className="w-3 h-3" />
                            {rep.replacement_driver_phone || 'Phone on file'}
                          </span>
                          <span>Stops: {rep.affected_stops.length} stops</span>
                        </div>

                        {isPublished && (
                          <button
                            onClick={() => handleCancelAnnouncement(rep.id)}
                            className="px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold cursor-pointer transition-colors"
                          >
                            Cancel Announcement
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Overview & Live Fleet Map */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="glass-panel p-4">
            <div className="flex items-center justify-between mb-3 border-b border-white/70 pb-2.5">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-[#22C55E] animate-pulse" />
                <h3 className="font-bold text-sm uppercase text-[#166534]">AITR Live Campus & Regional Fleet Map</h3>
              </div>
              <span className="text-xs text-[#64748B] uppercase">24 Routes Real-Time</span>
            </div>
            <LeafletMap
              activeBus={buses.find((b) => b.status === 'ACTIVE') || buses[0]}
              activeRoute={routes[0]}
              allActiveBuses={buses.filter((b) => b.status === 'ACTIVE' || b.status === 'APPROACHING')}
              showAllBuses={true}
              height="480px"
            />
          </div>
        </div>
      )}

      {/* Tab 3: Bus Master Table with Driver Edit & Status */}
      {activeTab === 'fleet' && (
        <div className="glass-panel overflow-hidden">
          <div className="p-4 bg-white/70 border-b border-white/80 flex flex-wrap items-center justify-between gap-3">
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search bus, driver or route..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs font-medium pl-9 pr-3 py-2 clay-input"
              />
            </div>
            <span className="text-xs font-bold uppercase text-[#166534]">{filteredBuses.length} buses registered</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-[#E2E8F0]/70">
              <thead className="bg-[#F8FAF5]/90 text-[11px] font-bold text-[#64748B] uppercase">
                <tr>
                  <th className="px-4 py-3">Bus No.</th>
                  <th className="px-4 py-3">Assigned Route</th>
                  <th className="px-4 py-3">Designated Driver</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Assignment Status</th>
                  <th className="px-4 py-3">Telemetry</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]/60 bg-white/50 font-medium">
                {filteredBuses.map((bus) => (
                  <tr key={bus.id} className="hover:bg-[#F0FDF4]/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-[#166534]">
                      BUS {bus.bus_number}
                    </td>
                    <td className="px-4 py-3 text-[#17301F] font-bold">
                      {bus.route_name}
                    </td>
                    <td className="px-4 py-3 text-[#17301F]">
                      {bus.driver_name || 'Driver to be assigned'}
                    </td>
                    <td className="px-4 py-3 text-[#64748B] font-mono">
                      {bus.driver_phone ? (
                        <span className="text-[#166534] font-bold">{bus.driver_phone}</span>
                      ) : (
                        <span className="text-slate-400 italic">Not Provided</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase ${
                          bus.assignment_status === 'CONFIRMED_REPLACEMENT'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : bus.assignment_status === 'REPLACED_TEMPORARILY'
                            ? 'bg-purple-100 text-purple-800 border border-purple-300'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {bus.assignment_status || 'REGULAR'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {bus.status === 'ACTIVE' ? (
                        <span className="text-[#22C55E] font-bold text-[11px] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                          LIVE ON ROUTE
                        </span>
                      ) : (
                        <span className="text-[#64748B] text-[11px]">STANDBY</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleOpenEditBus(bus)}
                        className="px-2.5 py-1 rounded-lg clay-btn-white text-[11px] font-bold text-[#166534] hover:bg-emerald-50 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Edit Bus Modal */}
          {editingBus && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17301F]/60 backdrop-blur-md">
              <div className="clay-card p-6 max-w-md w-full space-y-4">
                <div className="flex items-center justify-between border-b border-white/80 pb-3">
                  <h4 className="font-extrabold text-base text-[#166534]">
                    Edit Bus {editingBus.bus_number} & Driver Record
                  </h4>
                  <button onClick={() => setEditingBus(null)} className="text-[#64748B] hover:text-[#17301F]">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold uppercase text-[#64748B] block mb-1">
                      Assigned Driver Name:
                    </label>
                    <input
                      type="text"
                      value={editDriverName}
                      onChange={(e) => setEditDriverName(e.target.value)}
                      className="w-full p-2.5 clay-input text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-[#64748B] block mb-1">
                      Verified Contact Number:
                    </label>
                    <input
                      type="text"
                      value={editDriverPhone}
                      onChange={(e) => setEditDriverPhone(e.target.value)}
                      placeholder="+91 XXXXX XXXXX (or leave blank if unprovided)"
                      className="w-full p-2.5 clay-input text-xs font-mono font-bold"
                    />
                    <span className="text-[10px] text-[#64748B] mt-0.5 block">
                      Leave empty if no verified conductor phone is available. Do not fabricate contact details.
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-[#64748B] block mb-1">
                      Assignment Status:
                    </label>
                    <select
                      value={editAssignmentStatus}
                      onChange={(e) => setEditAssignmentStatus(e.target.value as any)}
                      className="w-full p-2.5 clay-input text-xs font-bold"
                    >
                      <option value="REGULAR">REGULAR (Active Route)</option>
                      <option value="CONFIRMED_REPLACEMENT">CONFIRMED_REPLACEMENT (Substitute Duty)</option>
                      <option value="REPLACED_TEMPORARILY">REPLACED_TEMPORARILY (Undergoing Service)</option>
                      <option value="MAINTENANCE">MAINTENANCE (Depot Standby)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/80">
                  <button
                    onClick={() => setEditingBus(null)}
                    className="px-4 py-2 clay-btn-white text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveBusInfo}
                    disabled={isSavingBus}
                    className="px-4 py-2 clay-btn-green text-white text-xs font-bold uppercase"
                  >
                    {isSavingBus ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Verification Queue */}
      {activeTab === 'verification' && (
        <div className="clay-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/80 pb-3">
            <div>
              <h3 className="font-bold text-sm uppercase text-[#166534]">Data Quality & Verification Queue</h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Stops or driver schedules extracted from paper schedules requiring coordinate or timing validation.
              </p>
            </div>
            <span className="text-xs font-bold bg-[#FEF3C7] text-[#B45309] border border-[#F59E0B]/50 px-2.5 py-1 rounded-xl">
              {verificationQueue.flaggedStops.length} Unverified Stops
            </span>
          </div>

          <div className="space-y-3">
            {verificationQueue.flaggedStops.slice(0, 15).map((item) => (
              <div
                key={item.stop.id}
                className="p-3.5 bg-white/85 rounded-2xl border border-white/90 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9),0_2px_8px_rgba(22,101,52,0.04)] flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-[#17301F] text-sm">{item.stop.stop_name}</div>
                  <div className="text-[#64748B] mt-0.5">
                    Route: {item.route_name} · Stop #{item.stop.sequence}
                  </div>
                  <div className="text-[11px] font-mono text-[#DC2626] mt-1">
                    Coordinates Pending · Sched 1: {item.stop.shift_1_time || 'Pending'} · Sched 2: {item.stop.shift_2_time || 'Pending'}
                  </div>
                </div>

                <button
                  onClick={() =>
                    setEditingItem({
                      type: 'stop',
                      id: item.stop.stop_id,
                      name: item.stop.stop_name,
                      field1: '22.7196',
                      field2: '75.8577',
                    })
                  }
                  className="px-3.5 py-1.5 clay-btn-mint text-xs font-bold cursor-pointer"
                >
                  Verify GPS Coordinates
                </button>
              </div>
            ))}
          </div>

          {/* Edit Modal */}
          {editingItem && (
            <div className="p-4 bg-white/95 rounded-2xl border border-white shadow-xl space-y-3">
              <h4 className="font-bold text-sm text-[#166534]">
                Confirm GPS Coordinates for {editingItem.name}
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Latitude"
                  value={editingItem.field1}
                  onChange={(e) => setEditingItem({ ...editingItem, field1: e.target.value })}
                  className="p-2 text-xs clay-input"
                />
                <input
                  type="text"
                  placeholder="Longitude"
                  value={editingItem.field2}
                  onChange={(e) => setEditingItem({ ...editingItem, field2: e.target.value })}
                  className="p-2 text-xs clay-input"
                />
              </div>
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => setEditingItem(null)}
                  className="px-3.5 py-1.5 clay-btn-white text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveVerification}
                  className="px-4 py-1.5 clay-btn-green text-xs font-bold uppercase cursor-pointer"
                >
                  Save Verification
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Controlled Demo Mode Simulator */}
      {activeTab === 'demo' && (
        <div className="clay-card p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-white/80 pb-4">
            <div>
              <h3 className="text-lg font-bold text-[#166534]">Demonstration Telemetry Simulator</h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Simulate a bus navigating real route stops in Indore for presentation and testing.
              </p>
            </div>
            {isDemoRunning && (
              <span className="text-xs clay-pill-live px-3.5 py-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-ping" />
                <span>Simulation Running</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sim-vehicle-select" className="text-xs font-bold uppercase text-[#64748B] block mb-2">Target Vehicle:</label>
              <select
                id="sim-vehicle-select"
                aria-label="Select Target Vehicle"
                value={simBusId}
                disabled={isDemoRunning}
                onChange={(e) => setSimBusId(e.target.value)}
                className="w-full text-xs font-bold p-3 clay-input"
              >
                {buses.map((b) => (
                  <option key={b.id} value={b.id}>
                    Bus {b.bus_number} ({b.route_name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-[#64748B] block mb-2">Speed Multiplier:</label>
              <div className="flex items-center gap-2">
                {[1, 2, 5].map((spd) => (
                  <button
                    key={spd}
                    disabled={isDemoRunning}
                    onClick={() => setSimSpeed(spd)}
                    className={`flex-1 py-2.5 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer ${
                      simSpeed === spd
                        ? 'clay-btn-primary shadow-xs'
                        : 'clay-btn-white'
                    }`}
                  >
                    {spd}x Realtime
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2">
            {!isDemoRunning ? (
              <button
                onClick={() => handleToggleDemo(true)}
                className="w-full py-4 clay-btn-green text-white font-bold text-sm uppercase flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>Launch Telemetry Simulation</span>
              </button>
            ) : (
              <button
                onClick={() => handleToggleDemo(false)}
                className="w-full py-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-sm uppercase rounded-2xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors active:scale-[0.98]"
              >
                <Square className="w-5 h-5 fill-white" />
                <span>Halt Simulation</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
