import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  Bus,
  Route,
  Role,
  ShiftType,
  TransitNotification,
  AdminMetrics,
  ETAPrediction,
  BusChangeNotification,
  AreaAlternativeHub,
  AlternativeBusCandidate,
} from '../types/transit';

interface TransitContextType {
  role: Role;
  setRole: (role: Role) => void;
  shift: ShiftType;
  setShift: (shift: ShiftType) => void;
  buses: Bus[];
  routes: Route[];
  activeBus: Bus | null;
  setActiveBus: (bus: Bus | null) => void;
  activeRoute: Route | null;
  setActiveRoute: (route: Route | null) => void;
  selectedStopId: string | null;
  setSelectedStopId: (stopId: string | null) => void;
  currentETA: ETAPrediction | null;
  metrics: AdminMetrics | null;
  notifications: TransitNotification[];
  replacements: BusChangeNotification[];
  problemAreaHubs: AreaAlternativeHub[];
  wsConnected: boolean;
  refreshData: () => Promise<void>;
  markNotificationRead: (id: string) => void;
  isSimulating: boolean;
  setSimulating: (active: boolean) => void;
  fetchNearbyAlternatives: (stopName: string, busId?: string) => Promise<AlternativeBusCandidate[]>;
  publishReplacement: (payload: {
    regular_bus_id: string;
    replacement_bus_id: string;
    effective_date: string;
    shift: ShiftType | 'both';
    affected_stops: string[];
    reason: string;
    published_by?: string;
  }) => Promise<{ success: boolean; change?: BusChangeNotification; error?: string }>;
  cancelReplacement: (changeId: string) => Promise<{ success: boolean; error?: string }>;
  updateBusInfo: (busId: string, updates: Partial<Bus> & { driver_name?: string; driver_phone?: string }) => Promise<{ success: boolean; error?: string }>;
}

const TransitContext = createContext<TransitContextType | undefined>(undefined);

export const TransitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>('student');
  const [shift, setShift] = useState<ShiftType>('shift_1');
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [activeBus, setActiveBus] = useState<Bus | null>(null);
  const [activeRoute, setActiveRoute] = useState<Route | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [currentETA, setCurrentETA] = useState<ETAPrediction | null>(null);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [notifications, setNotifications] = useState<TransitNotification[]>([]);
  const [replacements, setReplacements] = useState<BusChangeNotification[]>([]);
  const [problemAreaHubs, setProblemAreaHubs] = useState<AreaAlternativeHub[]>([]);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [isSimulating, setSimulating] = useState<boolean>(false);

  const refreshData = useCallback(async () => {
    try {
      const [routesRes, busesRes, metricsRes, notifsRes, repRes, hubsRes] = await Promise.all([
        fetch('/api/routes').then((r) => (r.ok ? r.json() : { success: false })).catch(() => ({ success: false })),
        fetch('/api/buses').then((r) => (r.ok ? r.json() : { success: false })).catch(() => ({ success: false })),
        fetch('/api/admin/metrics').then((r) => (r.ok ? r.json() : { success: false })).catch(() => ({ success: false })),
        fetch('/api/notifications').then((r) => (r.ok ? r.json() : { success: false })).catch(() => ({ success: false })),
        fetch('/api/replacements').then((r) => (r.ok ? r.json() : { success: false })).catch(() => ({ success: false })),
        fetch('/api/alternatives/problem-areas').then((r) => (r.ok ? r.json() : { success: false })).catch(() => ({ success: false })),
      ]);

      if (routesRes && routesRes.success) setRoutes(routesRes.routes);
      if (busesRes && busesRes.success) {
        setBuses(busesRes.buses);
        if (!activeBus) {
          const g55 = busesRes.buses.find((b: Bus) => b.bus_number === 'G55') || busesRes.buses[0];
          if (g55) {
            setActiveBus(g55);
            const foundRoute = routesRes?.routes?.find((r: Route) => r.id === g55.route_id);
            if (foundRoute) setActiveRoute(foundRoute);
          }
        } else {
          // Keep activeBus updated with latest telemetry and assignment status
          const updated = busesRes.buses.find((b: Bus) => b.id === activeBus.id);
          if (updated) {
            setActiveBus((prev) => (prev ? { ...prev, ...updated } : updated));
          }
        }
      }
      if (metricsRes && metricsRes.success) setMetrics(metricsRes.metrics);
      if (notifsRes && notifsRes.success) setNotifications(notifsRes.notifications);
      if (repRes && repRes.success) setReplacements(repRes.replacements);
      if (hubsRes && hubsRes.success) setProblemAreaHubs(hubsRes.hubs);
    } catch (err) {
      console.warn('Transit data refresh warning:', err);
    }
  }, [activeBus]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Periodic polling fallback
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshData]);

  // WebSocket for Live GPS and Events
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    let socket: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    function connect() {
      try {
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
          setWsConnected(true);
        };

        socket.onclose = () => {
          setWsConnected(false);
          reconnectTimeout = setTimeout(connect, 4000);
        };

        socket.onerror = () => {
          setWsConnected(false);
          socket?.close();
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'gps:update') {
              const { bus, location } = data.payload;
              setBuses((prev) =>
                prev.map((b) =>
                  b.id === bus.id
                    ? {
                        ...b,
                        latest_gps: location,
                        status: bus.status,
                        current_stop_name: bus.current_stop_name,
                        next_stop_name: bus.next_stop_name,
                      }
                    : b
                )
              );
              setActiveBus((current) =>
                current && current.id === bus.id ? { ...current, latest_gps: location, status: bus.status } : current
              );
            } else if (data.type === 'notification:new') {
              setNotifications((prev) => [data.payload, ...prev]);
            } else if (data.type === 'replacement:new') {
              setReplacements((prev) => [data.payload, ...prev.filter((p) => p.id !== data.payload.id)]);
              refreshData();
            } else if (data.type === 'replacement:cancelled') {
              setReplacements((prev) =>
                prev.map((p) => (p.id === data.payload.id ? { ...p, status: 'CANCELLED' } : p))
              );
              refreshData();
            } else if (data.type === 'bus:updated') {
              setBuses((prev) => prev.map((b) => (b.id === data.payload.id ? { ...b, ...data.payload } : b)));
            } else if (data.type === 'metrics:update') {
              setMetrics(data.payload);
            } else if (data.type === 'simulation:status') {
              setSimulating(data.payload.active);
            }
          } catch (e) {
            console.warn('WS Message Parse Notice:', e);
          }
        };
      } catch (wsErr) {
        console.warn('WebSocket connection not available:', wsErr);
        setWsConnected(false);
      }
    }

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      socket?.close();
    };
  }, [refreshData]);

  // Fetch Live Route-Aware ETA whenever active bus or selected stop changes
  useEffect(() => {
    if (!activeBus || !selectedStopId) {
      setCurrentETA(null);
      return;
    }

    let isMounted = true;
    fetch(`/api/buses/${activeBus.id}/eta?stopId=${selectedStopId}&shift=${shift}`)
      .then((r) => (r.ok ? r.json() : { success: false }))
      .then((data) => {
        if (isMounted && data.success) {
          setCurrentETA(data.eta);
        }
      })
      .catch((err) => console.warn('ETA fetch notice:', err));

    return () => {
      isMounted = false;
    };
  }, [activeBus, selectedStopId, shift, buses]);

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const fetchNearbyAlternatives = async (stopName: string, busId?: string): Promise<AlternativeBusCandidate[]> => {
    try {
      const q = encodeURIComponent(stopName);
      const url = `/api/alternatives/nearby?stopName=${q}&shift=${shift}${busId ? `&busId=${busId}` : ''}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        return data.alternatives || [];
      }
      return [];
    } catch (e) {
      console.warn('Error fetching nearby alternatives:', e);
      return [];
    }
  };

  const publishReplacement = async (payload: {
    regular_bus_id: string;
    replacement_bus_id: string;
    effective_date: string;
    shift: ShiftType | 'both';
    affected_stops: string[];
    reason: string;
    published_by?: string;
  }) => {
    try {
      const res = await fetch('/api/replacements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await refreshData();
        return { success: true, change: data.change };
      }
      return { success: false, error: data.error || 'Failed to publish replacement' };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Network error';
      return { success: false, error: msg };
    }
  };

  const cancelReplacement = async (changeId: string) => {
    try {
      const res = await fetch(`/api/replacements/${changeId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: data.error || 'Failed to cancel replacement' };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Network error';
      return { success: false, error: msg };
    }
  };

  const updateBusInfo = async (
    busId: string,
    updates: Partial<Bus> & { driver_name?: string; driver_phone?: string }
  ) => {
    try {
      const res = await fetch(`/api/buses/${busId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: data.error || 'Failed to update bus details' };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Network error';
      return { success: false, error: msg };
    }
  };

  return (
    <TransitContext.Provider
      value={{
        role,
        setRole,
        shift,
        setShift,
        buses,
        routes,
        activeBus,
        setActiveBus,
        activeRoute,
        setActiveRoute,
        selectedStopId,
        setSelectedStopId,
        currentETA,
        metrics,
        notifications,
        replacements,
        problemAreaHubs,
        wsConnected,
        refreshData,
        markNotificationRead,
        isSimulating,
        setSimulating,
        fetchNearbyAlternatives,
        publishReplacement,
        cancelReplacement,
        updateBusInfo,
      }}
    >
      {children}
    </TransitContext.Provider>
  );
};

export const useTransit = () => {
  const context = useContext(TransitContext);
  if (!context) throw new Error('useTransit must be used within TransitProvider');
  return context;
};
