import express, { Request, Response } from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { transitStore } from './server/store';
import { calculateRouteAwareETA } from './src/utils/eta';
import { AITR_COORDINATES } from './src/data/aitrMasterData';
import {
  findNearbyAlternativeBuses,
  calculateRouteSimilarity,
  getRecurringProblemAreaHubs,
} from './src/utils/routeFinder';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and Preflight Handling for iframe and cross-origin requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Create HTTP server & WebSocket Server
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// Keep track of connected clients
const clients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  clients.add(ws);

  // Send initial snapshot of active buses
  const activeBuses = Array.from(transitStore.buses.values()).filter((b) => b.active);
  ws.send(
    JSON.stringify({
      type: 'initial_state',
      payload: {
        buses: activeBuses,
        metrics: transitStore.getMetrics(),
        timestamp: new Date().toISOString(),
      },
    })
  );

  ws.on('close', () => {
    clients.delete(ws);
  });
});

function broadcast(event: string, payload: unknown) {
  const message = JSON.stringify({ type: event, payload, timestamp: new Date().toISOString() });
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

// Periodic heartbeat & simulation loop (every 3 seconds)
setInterval(() => {
  // Check for GPS timeout
  const now = Date.now();
  let stateChanged = false;

  for (const bus of transitStore.buses.values()) {
    if (bus.status === 'ACTIVE' && bus.latest_gps && !bus.is_simulated) {
      const diff = now - new Date(bus.latest_gps.timestamp).getTime();
      if (diff > 45000) {
        bus.status = 'GPS_OFFLINE';
        stateChanged = true;
      }
    }
  }

  // Handle Demo simulation if active
  if (transitStore.simulatedBusId) {
    const bus = transitStore.buses.get(transitStore.simulatedBusId);
    const route = bus ? transitStore.routes.get(bus.route_id) : null;

    if (bus && route && route.stops.length > 0) {
      // Advance simulation
      let currIdx = bus.current_stop_index ?? 0;
      currIdx = (currIdx + 1) % route.stops.length;
      bus.current_stop_index = currIdx;

      const stop = route.stops[currIdx];
      bus.current_stop_name = stop.stop_name;
      bus.next_stop_name = route.stops[(currIdx + 1) % route.stops.length]?.stop_name;

      // Realistic coordinate interpolation or stop coord
      const lat = stop.latitude ?? (22.7000 + (currIdx / route.stops.length) * 0.12);
      const lng = stop.longitude ?? (75.8400 + (currIdx / route.stops.length) * 0.10);

      const simGps = {
        bus_id: bus.id,
        trip_id: bus.active_trip_id || 'demo-trip-1',
        latitude: lat + (Math.random() - 0.5) * 0.001,
        longitude: lng + (Math.random() - 0.5) * 0.001,
        speed: 25 + Math.floor(Math.random() * 10),
        heading: 45,
        accuracy: 5,
        timestamp: new Date().toISOString(),
        is_simulated: true,
      };

      bus.latest_gps = simGps;
      bus.last_heartbeat = simGps.timestamp;
      bus.status = currIdx === route.stops.length - 1 ? 'ARRIVED' : 'ACTIVE';
      bus.is_simulated = true;

      broadcast('gps:update', { bus, location: simGps });
      stateChanged = true;
    }
  }

  if (stateChanged) {
    broadcast('metrics:update', transitStore.getMetrics());
  }
}, 3000);

// --- REST API Endpoints ---

// 1. Auth Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, role } = req.body;
  const user = Array.from(transitStore.users.values()).find(
    (u) => u.email.toLowerCase() === (email || '').toLowerCase()
  );

  if (user) {
    res.json({ success: true, user });
  } else {
    // Generate role-based session
    const fallbackUser = {
      id: `user-${Date.now()}`,
      name: role === 'driver' ? 'Santosh Tawar (Driver)' : role === 'admin' ? 'Transport Administrator' : 'Student / Faculty',
      email: email || `${role}@aitr.ac.in`,
      role: role || 'student',
      driverId: role === 'driver' ? 'drv-g55' : undefined,
    };
    transitStore.users.set(fallbackUser.id, fallbackUser);
    res.json({ success: true, user: fallbackUser });
  }
});

// 2. Get All Routes
app.get('/api/routes', (_req: Request, res: Response) => {
  res.json({
    success: true,
    routes: Array.from(transitStore.routes.values()),
    aitrCoordinates: AITR_COORDINATES,
  });
});

// 3. Get Route by ID
app.get('/api/routes/:id', (req: Request, res: Response) => {
  const route = transitStore.routes.get(req.params.id);
  if (!route) return res.status(404).json({ error: 'Route not found' });
  res.json({ success: true, route });
});

// 4. Get All Buses
app.get('/api/buses', (_req: Request, res: Response) => {
  res.json({
    success: true,
    buses: Array.from(transitStore.buses.values()),
  });
});

// 5. Get Bus by ID
app.get('/api/buses/:id', (req: Request, res: Response) => {
  const bus = transitStore.buses.get(req.params.id);
  if (!bus) return res.status(404).json({ error: 'Bus not found' });
  const route = transitStore.routes.get(bus.route_id);
  res.json({ success: true, bus, route });
});

// 6. Stop Search
app.get('/api/stops/search', (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  const results = transitStore.searchStops(query);
  res.json({ success: true, results });
});

// 7. Get Route-Aware ETA for Stop
app.get('/api/buses/:id/eta', (req: Request, res: Response) => {
  const busId = req.params.id;
  const stopId = (req.query.stopId as string) || '';
  const shift = (req.query.shift as 'shift_1' | 'shift_2') || 'shift_1';

  const bus = transitStore.buses.get(busId);
  if (!bus) return res.status(404).json({ error: 'Bus not found' });

  const route = transitStore.routes.get(bus.route_id);
  if (!route) return res.status(404).json({ error: 'Route not found' });

  const eta = calculateRouteAwareETA(bus, route, stopId, shift);
  res.json({ success: true, eta });
});

// 8. Driver Live GPS Telemetry
app.post('/api/driver/location', (req: Request, res: Response) => {
  try {
    const { bus_id, trip_id, route_id, latitude, longitude, speed, heading, accuracy, timestamp } = req.body;

    if (!bus_id || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Missing required location fields' });
    }

    const { bus, notification } = transitStore.recordGPS({
      bus_id,
      trip_id,
      route_id,
      latitude: Number(latitude),
      longitude: Number(longitude),
      speed: speed ? Number(speed) : 0,
      heading: heading ? Number(heading) : null,
      accuracy: accuracy ? Number(accuracy) : null,
      timestamp: timestamp || new Date().toISOString(),
    });

    broadcast('gps:update', { bus, location: bus.latest_gps });
    if (notification) {
      broadcast('notification:new', notification);
    }

    res.json({ success: true, bus });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating GPS';
    res.status(500).json({ error: msg });
  }
});

// 9. Driver Trip Start
app.post('/api/driver/trip/start', (req: Request, res: Response) => {
  const { bus_id, driver_id, shift } = req.body;
  try {
    const trip = transitStore.startTrip(bus_id, driver_id, shift || 'shift_1');
    const bus = transitStore.buses.get(bus_id);
    broadcast('trip:status', { type: 'started', trip, bus });
    broadcast('metrics:update', transitStore.getMetrics());
    res.json({ success: true, trip, bus });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error starting trip';
    res.status(400).json({ error: msg });
  }
});

// 10. Driver Trip End
app.post('/api/driver/trip/stop', (req: Request, res: Response) => {
  const { bus_id } = req.body;
  try {
    const trip = transitStore.endTrip(bus_id);
    const bus = transitStore.buses.get(bus_id);
    broadcast('trip:status', { type: 'ended', trip, bus });
    broadcast('metrics:update', transitStore.getMetrics());
    res.json({ success: true, trip, bus });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error stopping trip';
    res.status(400).json({ error: msg });
  }
});

// 11. Admin Metrics & Live Status
app.get('/api/admin/metrics', (_req: Request, res: Response) => {
  res.json({ success: true, metrics: transitStore.getMetrics() });
});

// 12. Admin Data Verification Queue
app.get('/api/admin/verification-queue', (_req: Request, res: Response) => {
  const flaggedBuses = Array.from(transitStore.buses.values()).filter(
    (b) => b.data_quality === 'needs_verification'
  );

  const flaggedStops: Array<{ route_id: string; route_name: string; stop: unknown }> = [];
  for (const route of transitStore.routes.values()) {
    route.stops.forEach((s) => {
      if (s.data_quality === 'needs_verification' || s.latitude === null) {
        flaggedStops.push({
          route_id: route.id,
          route_name: route.route_name,
          stop: s,
        });
      }
    });
  }

  res.json({ success: true, flaggedBuses, flaggedStops });
});

// 13. Admin Verify / Edit Record
app.post('/api/admin/verify-record', (req: Request, res: Response) => {
  const { type, id, updates } = req.body;

  if (type === 'bus') {
    const bus = transitStore.buses.get(id);
    if (bus) {
      if (updates.bus_number) bus.bus_number = updates.bus_number;
      if (updates.driver_name) bus.driver_name = updates.driver_name;
      bus.data_quality = 'verified';
    }
  } else if (type === 'stop') {
    const stop = transitStore.stops.get(id);
    if (stop) {
      if (updates.latitude !== undefined) stop.latitude = Number(updates.latitude);
      if (updates.longitude !== undefined) stop.longitude = Number(updates.longitude);
      stop.is_verified_coordinates = true;

      // Update in all routes containing this stop
      for (const route of transitStore.routes.values()) {
        const rs = route.stops.find((s) => s.stop_id === id);
        if (rs) {
          rs.latitude = stop.latitude;
          rs.longitude = stop.longitude;
          rs.data_quality = 'verified';
        }
      }
    }
  }

  broadcast('metrics:update', transitStore.getMetrics());
  res.json({ success: true });
});

// 14. Admin Demo Mode Simulation Trigger
app.post('/api/admin/demo-simulate', (req: Request, res: Response) => {
  const { bus_id, active, speedMultiplier } = req.body;

  if (!active) {
    // Stop simulation
    if (transitStore.simulatedBusId) {
      const b = transitStore.buses.get(transitStore.simulatedBusId);
      if (b) {
        b.is_simulated = false;
        b.status = 'NOT_STARTED';
      }
      transitStore.simulatedBusId = null;
    }
    broadcast('simulation:status', { active: false });
    return res.json({ success: true, active: false });
  }

  const busToSimulate = bus_id ? transitStore.buses.get(bus_id) : Array.from(transitStore.buses.values()).find((b) => b.bus_number === 'G55');
  if (!busToSimulate) return res.status(404).json({ error: 'Bus not found' });

  transitStore.simulatedBusId = busToSimulate.id;
  transitStore.simulationSpeedMultiplier = speedMultiplier || 1;
  busToSimulate.active = true;
  busToSimulate.status = 'ACTIVE';
  busToSimulate.is_simulated = true;
  busToSimulate.active_trip_id = `demo-sim-trip-${Date.now()}`;

  broadcast('simulation:status', {
    active: true,
    bus_id: busToSimulate.id,
    bus_number: busToSimulate.bus_number,
    route_id: busToSimulate.route_id,
  });

  res.json({
    success: true,
    active: true,
    simulatedBus: busToSimulate,
  });
});

// 15. Notifications List
app.get('/api/notifications', (_req: Request, res: Response) => {
  res.json({ success: true, notifications: transitStore.notifications });
});

// 16. Get Bus Changes / Replacements
app.get('/api/replacements', (_req: Request, res: Response) => {
  res.json({ success: true, replacements: transitStore.getBusChanges() });
});

// 17. Publish Daily Bus Change
app.post('/api/replacements', (req: Request, res: Response) => {
  try {
    const { regular_bus_id, replacement_bus_id, effective_date, shift, affected_stops, reason, published_by } = req.body;
    if (!regular_bus_id || !replacement_bus_id || !effective_date || !affected_stops || !affected_stops.length) {
      return res.status(400).json({ error: 'Missing required replacement fields (regular bus, replacement bus, effective date, affected stops)' });
    }

    const { change, notification } = transitStore.publishBusChange({
      regular_bus_id,
      replacement_bus_id,
      effective_date,
      shift: shift || 'both',
      affected_stops,
      reason: reason || 'Scheduled Fleet Operational Adjustment',
      published_by,
    });

    broadcast('replacement:new', change);
    broadcast('notification:new', notification);
    broadcast('metrics:update', transitStore.getMetrics());

    res.json({ success: true, change, notification });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error publishing bus change';
    res.status(400).json({ error: msg });
  }
});

// 18. Cancel Bus Change
app.post('/api/replacements/:id/cancel', (req: Request, res: Response) => {
  try {
    const change = transitStore.cancelBusChange(req.params.id);
    if (!change) return res.status(404).json({ error: 'Bus change not found' });

    broadcast('replacement:cancelled', change);
    broadcast('metrics:update', transitStore.getMetrics());

    res.json({ success: true, change });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error cancelling bus change';
    res.status(500).json({ error: msg });
  }
});

// 19. Smart Nearby Alternative Buses Finder
app.get('/api/alternatives/nearby', (req: Request, res: Response) => {
  const stopName = (req.query.stopName as string) || '';
  const shift = (req.query.shift as 'shift_1' | 'shift_2') || 'shift_1';
  const regularBusId = req.query.busId as string | undefined;

  const routes = Array.from(transitStore.routes.values());
  const buses = Array.from(transitStore.buses.values());
  const replacements = transitStore.getBusChanges();

  const alternatives = findNearbyAlternativeBuses({
    targetStopName: stopName,
    shift,
    routes,
    buses,
    regularBusId,
    confirmedReplacements: replacements,
  });

  res.json({ success: true, alternatives });
});

// 20. Problem Areas Directory Hubs
app.get('/api/alternatives/problem-areas', (_req: Request, res: Response) => {
  const routes = Array.from(transitStore.routes.values());
  const buses = Array.from(transitStore.buses.values());
  const replacements = transitStore.getBusChanges();

  const hubs = getRecurringProblemAreaHubs(routes, buses, replacements);
  res.json({ success: true, hubs });
});

// 21. Route Similarity & Corridor Predictions
app.get('/api/alternatives/corridors', (req: Request, res: Response) => {
  const routeId = req.query.routeId as string;
  const targetRoute = routeId ? transitStore.routes.get(routeId) : null;
  const allRoutes = Array.from(transitStore.routes.values());

  if (!targetRoute) {
    return res.json({ success: true, allCorridors: allRoutes.map((r) => ({ id: r.id, name: r.route_name })) });
  }

  const comparisons = allRoutes
    .filter((r) => r.id !== targetRoute.id)
    .map((r) => {
      const sim = calculateRouteSimilarity(targetRoute, r);
      const assignedBuses = Array.from(transitStore.buses.values()).filter((b) => b.route_id === r.id);
      return {
        route: r,
        similarity: sim.score,
        sharedStops: sim.sharedStops,
        corridor: sim.sharedCorridor,
        candidateBuses: assignedBuses,
      };
    })
    .filter((c) => c.similarity >= 30)
    .sort((a, b) => b.similarity - a.similarity);

  res.json({ success: true, targetRoute, candidateRoutes: comparisons });
});

// 22. Update Bus Assignment & Driver Info (Admin)
app.put('/api/buses/:id', (req: Request, res: Response) => {
  const bus = transitStore.updateBus(req.params.id, req.body);
  if (!bus) return res.status(404).json({ error: 'Bus not found' });
  broadcast('bus:updated', bus);
  broadcast('metrics:update', transitStore.getMetrics());
  res.json({ success: true, bus });
});

// Vite Middleware for Development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, () => {
    console.log(`[AITR Transit Server] Listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[AITR Transit Server Error]', err);
});
