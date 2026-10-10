import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Bus, Route, Role, ShiftType, TransitNotification, AdminMetrics, ETAPrediction } from '../types/transit';

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
  wsConnected: boolean;
  refreshData: () => Promise<void>;
  markNotificationRead: (id: string) => void;
  isSimulating: boolean;
  setSimulating: (active: boolean) => void;
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
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [isSimulating, setSimulating] = useState<boolean>(false);

  const refreshData = useCallback(async () => {
    try {
      const [routesRes, busesRes, metricsRes, notifsRes] = await Promise.all([
        fetch('/api/routes')
          .then((r) => (r.ok ? r.json() : { success: false }))
          .catch(() => ({ success: false })),
        fetch('/api/buses')
          .then((r) => (r.ok ? r.json() : { success: false }))
          .catch(() => ({ success: false })),
        fetch('/api/admin/metrics')
          .then((r) => (r.ok ? r.json() : { success: false }))
          .catch(() => ({ success: false })),
        fetch('/api/notifications')
          .then((r) => (r.ok ? r.json() : { success: false }))
          .catch(() => ({ success: false })),
      ]);

      if (routesRes && routesRes.success) setRoutes(routesRes.routes);
      if (busesRes && busesRes.success) {
        setBuses(busesRes.buses);
        // Default select G55 if nothing active
        if (!activeBus) {
          const g55 = busesRes.buses.find((b: Bus) => b.bus_number === 'G55') || busesRes.buses[0];
          if (g55) {
            setActiveBus(g55);
            const foundRoute = routesRes?.routes?.find((r: Route) => r.id === g55.route_id);
            if (foundRoute) setActiveRoute(foundRoute);
          }
        }
      }
      if (metricsRes && metricsRes.success) setMetrics(metricsRes.metrics);
      if (notifsRes && notifsRes.success) setNotifications(notifsRes.notifications);
    } catch (err) {
      console.warn('Transit data refresh warning:', err);
    }
  }, [activeBus]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Periodic polling fallback when WebSocket is idle or disconnected
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
  }, []);

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
        wsConnected,
        refreshData,
        markNotificationRead,
        isSimulating,
        setSimulating,
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
