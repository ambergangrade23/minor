import React, { useState, useEffect } from 'react';
import { useTransit } from '../context/TransitContext';
import { LeafletMap } from './LeafletMap';
import { Bus, RouteStop } from '../types/transit';
import {
  Radio,
  Play,
  Square,
  RefreshCw,
  Search,
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const { buses, routes, metrics, refreshData } = useTransit();

  const [activeTab, setActiveTab] = useState<'overview' | 'fleet' | 'verification' | 'demo'>('overview');
  const [searchTerm, setSearchTerm] = useState('');

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
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'clay-btn-primary shadow-xs'
                : 'clay-btn-white'
            }`}
          >
            Fleet Map & Overview
          </button>
          <button
            onClick={() => setActiveTab('fleet')}
            className={`px-4 py-2 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer ${
              activeTab === 'fleet'
                ? 'clay-btn-primary shadow-xs'
                : 'clay-btn-white'
            }`}
          >
            Buses Table ({buses.length})
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`px-4 py-2 text-xs font-bold uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'verification'
                ? 'clay-btn-primary shadow-xs'
                : 'clay-btn-white'
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
              activeTab === 'demo'
                ? 'clay-btn-primary shadow-xs'
                : 'clay-btn-white'
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
        <div className="clay-card p-3.5 text-center sm:text-left">
          <span className="text-[10px] text-[#64748B] font-bold uppercase block">Routes</span>
          <span className="text-2xl font-extrabold text-[#17301F] font-mono tabular-nums">{metrics?.totalRoutes ?? routes.length}</span>
        </div>
        <div className="clay-card p-3.5 text-center sm:text-left border-b-2 border-b-[#F59E0B]">
          <span className="text-[10px] text-[#B45309] font-bold uppercase block">Verification</span>
          <span className="text-2xl font-extrabold text-[#B45309] font-mono tabular-nums">{metrics?.needsVerificationCount ?? 0}</span>
        </div>
      </div>

      {/* Tab 1: Overview & Live Fleet Map */}
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

      {/* Tab 2: Bus Master Table (Glassmorphic Table Frame) */}
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
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Next Stop</th>
                  <th className="px-4 py-3">Telemetry</th>
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
                      {bus.driver_phone}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase ${
                          bus.status === 'ACTIVE'
                            ? 'clay-pill-live'
                            : bus.status === 'APPROACHING'
                            ? 'clay-pill-live'
                            : bus.status === 'DELAYED'
                            ? 'bg-[#FEF3C7] text-[#B45309] border border-[#F59E0B]/50'
                            : bus.status === 'GPS_OFFLINE'
                            ? 'bg-[#FEE2E2] text-[#DC2626] border border-[#DC2626]/50'
                            : 'bg-white/80 text-[#64748B] border border-white/90'
                        }`}
                      >
                        {bus.status === 'ACTIVE' ? '● LIVE' : bus.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#64748B]">
                      {bus.next_stop_name || 'AITR Campus'}
                    </td>
                    <td className="px-4 py-3">
                      {bus.latest_gps ? (
                        <span className="text-[#22C55E] font-bold text-[11px] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                          GPS ONLINE
                        </span>
                      ) : (
                        <span className="text-[#64748B] text-[11px]">STANDBY</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Verification Queue (Claymorphic) */}
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
                  <div className="text-[11px] font-mono text-[#64748B] mt-0.5">
                    Shift 1: {item.stop.shift_1_time || 'Pending'} · Shift 2: {item.stop.shift_2_time || 'Pending'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setEditingItem({
                        type: 'stop',
                        id: item.stop.id,
                        name: item.stop.stop_name,
                        field1: String(item.stop.latitude ?? 22.7500),
                        field2: String(item.stop.longitude ?? 75.8900),
                      })
                    }
                    className="px-3.5 py-1.5 clay-btn-primary text-xs font-bold uppercase cursor-pointer"
                  >
                    Edit Coordinates
                  </button>
                </div>
              </div>
            ))}
          </div>

          {editingItem && (
            <div className="p-4 clay-card-mint space-y-3">
              <div className="font-bold text-sm text-[#166534]">Editing: {editingItem.name}</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#64748B] block mb-1">Latitude:</label>
                  <input
                    type="text"
                    value={editingItem.field1}
                    onChange={(e) => setEditingItem({ ...editingItem, field1: e.target.value })}
                    className="w-full text-xs font-bold p-2.5 clay-input"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#64748B] block mb-1">Longitude:</label>
                  <input
                    type="text"
                    value={editingItem.field2}
                    onChange={(e) => setEditingItem({ ...editingItem, field2: e.target.value })}
                    className="w-full text-xs font-bold p-2.5 clay-input"
                  />
                </div>
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

      {/* Tab 4: Controlled Demo Mode Simulator (Claymorphic) */}
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
