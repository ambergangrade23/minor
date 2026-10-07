import React, { useState, useEffect } from 'react';
import { useTransit } from '../context/TransitContext';
import { LeafletMap } from './LeafletMap';
import { Bus, Route, RouteStop } from '../types/transit';
import {
  ShieldAlert,
  Radio,
  CheckCircle,
  Play,
  Square,
  Edit2,
  AlertCircle,
  Bus as BusIcon,
  MapPin,
  RefreshCw,
  Search,
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const { buses, routes, metrics, refreshData, isSimulating } = useTransit();

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
      const data = await res.json();
      if (data.success) {
        setVerificationQueue({
          flaggedBuses: data.flaggedBuses,
          flaggedStops: data.flaggedStops,
        });
      }
    } catch (e) {
      console.error(e);
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
      const data = await res.json();
      if (data.success) {
        setIsDemoRunning(data.active);
        refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveVerification = async () => {
    if (!editingItem) return;
    try {
      const updates =
        editingItem.type === 'bus'
          ? { bus_number: editingItem.field1, driver_name: editingItem.field2 }
          : { latitude: Number(editingItem.field1), longitude: Number(editingItem.field2) };

      await fetch('/api/admin/verify-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: editingItem.type,
          id: editingItem.id,
          updates,
        }),
      });

      setEditingItem(null);
      fetchVerificationQueue();
      refreshData();
    } catch (e) {
      console.error(e);
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
      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'overview' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Fleet Overview & Map
          </button>
          <button
            onClick={() => setActiveTab('fleet')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'fleet' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Buses Table ({buses.length})
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'verification' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Data Verification Queue</span>
            {metrics?.needsVerificationCount ? (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-900 font-black">
                {metrics.needsVerificationCount}
              </span>
            ) : null}
          </button>
          <button
            onClick={() => setActiveTab('demo')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'demo' ? 'bg-orange-600 text-white shadow-sm' : 'text-orange-700 bg-orange-50 hover:bg-orange-100'
            }`}
          >
            <span>Demo Mode Simulator</span>
            {isDemoRunning && <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>}
          </button>
        </div>

        <button
          onClick={() => {
            refreshData();
            fetchVerificationQueue();
          }}
          className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync</span>
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Buses</span>
          <span className="text-xl font-extrabold text-slate-900">{metrics?.totalBuses ?? buses.length}</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-sm">
          <span className="text-[10px] text-emerald-700 font-bold uppercase block">Active Buses</span>
          <span className="text-xl font-extrabold text-emerald-700">{metrics?.activeBuses ?? 0}</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Inactive</span>
          <span className="text-xl font-extrabold text-slate-600">{metrics?.inactiveBuses ?? 0}</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-sm">
          <span className="text-[10px] text-emerald-600 font-bold uppercase block">GPS Online</span>
          <span className="text-xl font-extrabold text-emerald-600">{metrics?.gpsOnline ?? 0}</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-rose-200 shadow-sm">
          <span className="text-[10px] text-rose-600 font-bold uppercase block">GPS Offline</span>
          <span className="text-xl font-extrabold text-rose-600">{metrics?.gpsOffline ?? 0}</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-indigo-200 shadow-sm">
          <span className="text-[10px] text-indigo-600 font-bold uppercase block">Active Trips</span>
          <span className="text-xl font-extrabold text-indigo-600">{metrics?.activeTrips ?? 0}</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Routes</span>
          <span className="text-xl font-extrabold text-slate-900">{metrics?.totalRoutes ?? routes.length}</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-amber-200 bg-amber-50/40 shadow-sm">
          <span className="text-[10px] text-amber-700 font-bold uppercase block">Verify Pending</span>
          <span className="text-xl font-extrabold text-amber-700">{metrics?.needsVerificationCount ?? 0}</span>
        </div>
      </div>

      {/* Tab 1: Overview & Live Fleet Map */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                <h3 className="font-bold text-sm text-slate-900">Live Campus & City Fleet Map</h3>
              </div>
              <span className="text-xs text-slate-500">Showing all active AITR buses</span>
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

      {/* Tab 2: Bus Master Table */}
      {activeTab === 'fleet' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search bus, driver or route..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <span className="text-xs text-slate-500">{filteredBuses.length} buses registered</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-200">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Bus No.</th>
                  <th className="px-4 py-3">Driver Name</th>
                  <th className="px-4 py-3">Route Assignment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Current Stop</th>
                  <th className="px-4 py-3">Next Stop</th>
                  <th className="px-4 py-3">Data Quality</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBuses.map((bus) => (
                  <tr key={bus.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-black text-slate-900">
                      <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-800 font-mono">
                        {bus.bus_number}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{bus.driver_name || 'Unassigned'}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{bus.route_name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          bus.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : bus.status === 'GPS_OFFLINE'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        ● {bus.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 truncate">{bus.current_stop_name || 'Origin'}</td>
                    <td className="px-4 py-3 text-indigo-700 font-medium truncate">
                      {bus.next_stop_name || 'Acropolis Campus'}
                    </td>
                    <td className="px-4 py-3">
                      {bus.data_quality === 'needs_verification' ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                          Needs Verification
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-emerald-700">Verified</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Data Quality Verification Queue (Section 17 & 18) */}
      {activeTab === 'verification' && (
        <div className="space-y-6">
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 text-amber-900 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              <span>AITR Data Verification System (Strict Source Preservation)</span>
            </div>
            <p>
              In accordance with Section 17 & 18, OCR inconsistencies (such as incomplete bus number &ldquo;G&rdquo; in Route Group 16, missing scheduled times, or stops awaiting verified GPS coordinates) are preserved as <b>Needs Verification</b>. Admin can verify or edit coordinates and details below.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h4 className="font-bold text-sm text-slate-900">Flagged Master Records</h4>

            <div className="space-y-3">
              {verificationQueue.flaggedBuses.map((bus) => (
                <div
                  key={bus.id}
                  className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/30 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">Bus &ldquo;{bus.bus_number}&rdquo;</span>
                      <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded">
                        Incomplete Bus Identifier in Route Group 16
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      Assigned Driver: {bus.driver_name} · Route: {bus.route_name}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setEditingItem({
                        type: 'bus',
                        id: bus.id,
                        name: `Bus ${bus.bus_number}`,
                        field1: bus.bus_number,
                        field2: bus.driver_name || '',
                      })
                    }
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                  >
                    Edit & Verify Bus
                  </button>
                </div>
              ))}

              {verificationQueue.flaggedStops.slice(0, 15).map(({ route_id, route_name, stop }, idx) => (
                <div
                  key={`${route_id}-${stop.id}-${idx}`}
                  className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">#{stop.sequence} {stop.stop_name}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded">
                        {stop.latitude ? 'Timetable Missing' : 'Awaiting Exact GPS Coordinates'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {route_name} · Shift 1: {stop.shift_1_time || 'NULL'} · Shift 2: {stop.shift_2_time || 'NULL'}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setEditingItem({
                        type: 'stop',
                        id: stop.stop_id,
                        name: stop.stop_name,
                        field1: stop.latitude ? String(stop.latitude) : '22.7200',
                        field2: stop.longitude ? String(stop.longitude) : '75.8600',
                      })
                    }
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                  >
                    Update Coordinates
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Controlled Demo Mode Simulator (Section 25) */}
      {activeTab === 'demo' && (
        <div className="max-w-2xl bg-white rounded-3xl p-6 border border-orange-200 shadow-sm space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              ⚡
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Presentation Demo Simulator</h3>
              <p className="text-xs text-slate-500">
                Simulate bus movement along real route stops without needing an active driver on the road.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="demo-bus-select" className="text-xs font-bold text-slate-700 block mb-1">Select Demo Bus:</label>
              <select
                id="demo-bus-select"
                aria-label="Select Demo Bus"
                value={simBusId}
                disabled={isDemoRunning}
                onChange={(e) => setSimBusId(e.target.value)}
                className="w-full text-xs font-medium p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500"
              >
                {buses.map((b) => (
                  <option key={b.id} value={b.id}>
                    Bus {b.bus_number} — {b.route_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-700 block mb-1">Simulation Speed:</span>
              <div className="flex gap-2">
                {[1, 2, 5].map((s) => (
                  <button
                    key={s}
                    disabled={isDemoRunning}
                    onClick={() => setSimSpeed(s)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                      simSpeed === s ? 'bg-orange-600 text-white border-orange-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {s}x Speed
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              {!isDemoRunning ? (
                <button
                  onClick={() => handleToggleDemo(true)}
                  className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-extrabold rounded-2xl shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>START DEMO SIMULATION</span>
                </button>
              ) : (
                <button
                  onClick={() => handleToggleDemo(false)}
                  className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-2xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  <Square className="w-5 h-5 fill-white" />
                  <span>STOP DEMO SIMULATION</span>
                </button>
              )}
            </div>

            {isDemoRunning && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-center text-xs text-orange-800 font-bold animate-pulse">
                ● DEMO MODE ACTIVE: Broadcasting live coordinates every 3 seconds to students and map.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h4 className="font-bold text-base text-slate-900">
              Verify / Edit {editingItem.type === 'bus' ? 'Bus Identifier' : 'Stop Coordinates'}
            </h4>
            <div className="text-xs text-slate-500">{editingItem.name}</div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {editingItem.type === 'bus' ? 'Bus Number' : 'Latitude'}
                </label>
                <input
                  type="text"
                  value={editingItem.field1}
                  onChange={(e) => setEditingItem({ ...editingItem, field1: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {editingItem.type === 'bus' ? 'Driver Name' : 'Longitude'}
                </label>
                <input
                  type="text"
                  value={editingItem.field2}
                  onChange={(e) => setEditingItem({ ...editingItem, field2: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEditingItem(null)}
                className="flex-1 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVerification}
                className="flex-1 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white shadow-sm"
              >
                Save & Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
