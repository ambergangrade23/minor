import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import L from 'leaflet';
import * as d3 from 'd3';
import { Bus, Route, RouteStop } from '../types/transit';
import { AITR_COORDINATES } from '../data/aitrMasterData';
import { haversineDistanceKm } from '../utils/eta';
import {
  Navigation,
  CheckCircle2,
  Clock,
  Compass,
  Maximize2,
  Minimize2,
  Layers,
  Sparkles,
  Zap,
  ChevronRight,
  Info,
} from 'lucide-react';

interface LeafletMapProps {
  activeBus: Bus | null;
  activeRoute: Route | null;
  allActiveBuses?: Bus[];
  selectedStopId?: string | null;
  onSelectStop?: (stopId: string) => void;
  onSelectBus?: (bus: Bus) => void;
  height?: string;
  showAllBuses?: boolean;
  enableD3Progression?: boolean;
}

interface CommuteStats {
  progressionPercent: number;
  passedStopsCount: number;
  totalStopsCount: number;
  currentSegment: {
    fromStopName: string;
    toStopName: string;
    toStopSequence: number;
  } | null;
  distanceToNextStopMeters: number | null;
  estimatedSecsToNextStop: number | null;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  activeBus,
  activeRoute,
  allActiveBuses = [],
  selectedStopId,
  onSelectStop,
  onSelectBus,
  height = '500px',
  showAllBuses = false,
  enableD3Progression = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const busMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const d3SvgRef = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined> | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // HUD & UI States
  const [isHudExpanded, setIsHudExpanded] = useState<boolean>(true);
  const [showFlowParticles, setShowFlowParticles] = useState<boolean>(true);
  const [showProgressionSplit, setShowProgressionSplit] = useState<boolean>(true);
  const [hoveredStop, setHoveredStop] = useState<RouteStop | null>(null);

  // Calculate ordered stops array with valid coordinates + AITR campus destination
  const routeStopsWithCoords = useMemo(() => {
    if (!activeRoute) return [];
    return activeRoute.stops.filter(
      (s) => s.latitude !== null && s.longitude !== null && !isNaN(s.latitude) && !isNaN(s.longitude)
    );
  }, [activeRoute]);

  // Destination Stop Representation (AITR Campus)
  const aitrStop = useMemo<RouteStop>(() => {
    return {
      id: 'aitr-campus-terminal',
      route_id: activeRoute?.id || 'route-aitr',
      stop_id: 'aitr-campus-terminal',
      stop_name: AITR_COORDINATES.name,
      sequence: (routeStopsWithCoords.length || 0) + 1,
      latitude: AITR_COORDINATES.latitude,
      longitude: AITR_COORDINATES.longitude,
      shift_1_time: '08:45 AM',
      shift_2_time: '10:45 AM',
      data_quality: 'verified',
    };
  }, [routeStopsWithCoords.length, activeRoute?.id]);

  // Complete chain of coordinates including AITR
  const allStopsInProgression = useMemo(() => {
    return [...routeStopsWithCoords, aitrStop];
  }, [routeStopsWithCoords, aitrStop]);

  // Compute Commute Progression Metrics in Real-time
  const commuteStats = useMemo<CommuteStats>(() => {
    if (!activeRoute || allStopsInProgression.length <= 1) {
      return {
        progressionPercent: 0,
        passedStopsCount: 0,
        totalStopsCount: 0,
        currentSegment: null,
        distanceToNextStopMeters: null,
        estimatedSecsToNextStop: null,
      };
    }

    const totalStops = allStopsInProgression.length;

    // If bus is not live or has no GPS, estimate based on status
    if (!activeBus?.latest_gps) {
      const isComplete = activeBus?.status === 'COMPLETED';
      return {
        progressionPercent: isComplete ? 100 : 0,
        passedStopsCount: isComplete ? totalStops : 0,
        totalStopsCount: totalStops,
        currentSegment: {
          fromStopName: allStopsInProgression[0].stop_name,
          toStopName: allStopsInProgression[1]?.stop_name || AITR_COORDINATES.name,
          toStopSequence: 1,
        },
        distanceToNextStopMeters: null,
        estimatedSecsToNextStop: null,
      };
    }

    const { latitude: busLat, longitude: busLng, speed = 25 } = activeBus.latest_gps;

    // Find the next stop index
    let nextStopIndex = 1;

    if (activeBus.next_stop_sequence) {
      const idx = allStopsInProgression.findIndex(
        (s) => s.sequence >= (activeBus.next_stop_sequence || 1)
      );
      if (idx !== -1) nextStopIndex = Math.min(idx, totalStops - 1);
    } else if (activeBus.next_stop_id) {
      const idx = allStopsInProgression.findIndex((s) => s.stop_id === activeBus.next_stop_id);
      if (idx !== -1) nextStopIndex = idx;
    } else {
      // Find closest upcoming stop by distance
      let minDistance = Infinity;
      let closestIdx = 0;
      allStopsInProgression.forEach((s, idx) => {
        if (s.latitude && s.longitude) {
          const d = haversineDistanceKm(busLat, busLng, s.latitude, s.longitude);
          if (d < minDistance) {
            minDistance = d;
            closestIdx = idx;
          }
        }
      });
      nextStopIndex = Math.min(closestIdx + 1, totalStops - 1);
    }

    const passedStops = Math.max(0, nextStopIndex);
    const targetStop = allStopsInProgression[nextStopIndex] || allStopsInProgression[totalStops - 1];
    const prevStop = allStopsInProgression[Math.max(0, nextStopIndex - 1)];

    let distanceToNextMeters: number | null = null;
    let estimatedSecs: number | null = null;

    if (targetStop.latitude && targetStop.longitude) {
      distanceToNextMeters = Math.round(
        haversineDistanceKm(busLat, busLng, targetStop.latitude, targetStop.longitude) * 1000
      );
      const effectiveSpeedKmh = Math.max(speed ?? 20, 20);
      estimatedSecs = Math.round((distanceToNextMeters / (effectiveSpeedKmh * 1000)) * 3600);
    }

    const rawPercent = Math.round((passedStops / (totalStops - 1)) * 100);
    const progressionPercent = Math.min(Math.max(rawPercent, 5), 100);

    return {
      progressionPercent,
      passedStopsCount: passedStops,
      totalStopsCount: totalStops,
      currentSegment: {
        fromStopName: prevStop.stop_name,
        toStopName: targetStop.stop_name,
        toStopSequence: targetStop.sequence,
      },
      distanceToNextStopMeters: distanceToNextMeters,
      estimatedSecsToNextStop: estimatedSecs,
    };
  }, [activeRoute, allStopsInProgression, activeBus]);

  // Recenter map on bus
  const handleRecenterBus = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map || !activeBus?.latest_gps) return;
    map.flyTo([activeBus.latest_gps.latitude, activeBus.latest_gps.longitude], 14, {
      animate: true,
      duration: 0.8,
    });
  }, [activeBus]);

  // Fit entire route bounds
  const handleFitRoute = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map || allStopsInProgression.length === 0) return;

    const bounds = L.latLngBounds(
      allStopsInProgression
        .filter((s) => s.latitude && s.longitude)
        .map((s) => [s.latitude!, s.longitude!])
    );
    map.fitBounds(bounds, { padding: [60, 60], animate: true });
  }, [allStopsInProgression]);

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [22.7500, 75.8900],
      zoom: 12,
      zoomControl: false,
    });

    // Custom positioned zoom controls
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Clean Map Tiles with high clarity
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap · AITR Transit Progression Engine',
      maxZoom: 19,
    }).addTo(map);

    // Append D3 SVG Layer into Leaflet's overlayPane
    const overlayPane = map.getPanes().overlayPane;
    const svg = d3
      .select(overlayPane)
      .append('svg')
      .attr('class', 'leaflet-d3-route-overlay')
      .style('position', 'absolute')
      .style('top', '0')
      .style('left', '0')
      .style('overflow', 'visible')
      .style('pointer-events', 'none')
      .style('z-index', '420');

    // Setup SVG Definitions: Gradients, Filters, Arrow markers
    const defs = svg.append('defs');

    // Forest to Emerald Route Flow Gradient
    const flowGrad = defs
      .append('linearGradient')
      .attr('id', 'aitr-route-flow-grad')
      .attr('gradientUnits', 'userSpaceOnUse');
    flowGrad.append('stop').attr('offset', '0%').attr('stop-color', '#166534');
    flowGrad.append('stop').attr('offset', '50%').attr('stop-color', '#22c55e');
    flowGrad.append('stop').attr('offset', '100%').attr('stop-color', '#a7f3d0');

    // Traveled Solid Gradient
    const traveledGrad = defs
      .append('linearGradient')
      .attr('id', 'aitr-traveled-grad')
      .attr('gradientUnits', 'userSpaceOnUse');
    traveledGrad.append('stop').attr('offset', '0%').attr('stop-color', '#14532d');
    traveledGrad.append('stop').attr('offset', '100%').attr('stop-color', '#166534');

    // Upcoming Animated Gradient
    const upcomingGrad = defs
      .append('linearGradient')
      .attr('id', 'aitr-upcoming-grad')
      .attr('gradientUnits', 'userSpaceOnUse');
    upcomingGrad.append('stop').attr('offset', '0%').attr('stop-color', '#22c55e');
    upcomingGrad.append('stop').attr('offset', '100%').attr('stop-color', '#a7f3d0');

    // Glow Filter for Real-time Transit Path
    const filter = defs.append('filter').attr('id', 'route-path-glow').attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%');
    filter.append('feGaussianBlur').attr('stdDeviation', '3.5').attr('result', 'blur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'blur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    d3SvgRef.current = svg;
    mapInstanceRef.current = map;

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (d3SvgRef.current) {
        d3SvgRef.current.remove();
        d3SvgRef.current = null;
      }
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Render D3.js SVG Real-time Route Progression Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    const svg = d3SvgRef.current;
    if (!map || !svg) return;

    // Clean previous elements inside svg
    svg.selectAll('.d3-route-layer').remove();

    if (!activeRoute || allStopsInProgression.length < 2) return;

    const layerGroup = svg.append('g').attr('class', 'd3-route-layer');

    // Projection Helper: Convert Lat/Lng into Leaflet Layer Pixel Point
    const project = (lat: number, lng: number): [number, number] => {
      const pt = map.latLngToLayerPoint(new L.LatLng(lat, lng));
      return [pt.x, pt.y];
    };

    // Smooth Catmull-Rom or Linear Curve Generator
    const lineGenerator = d3
      .line<[number, number]>()
      .x((d) => d[0])
      .y((d) => d[1])
      .curve(d3.curveCatmullRom.alpha(0.5));

    // Determine division point between Traveled vs Upcoming
    const splitIndex = Math.min(
      Math.max(commuteStats.passedStopsCount, 0),
      allStopsInProgression.length - 1
    );

    const busGps = activeBus?.latest_gps;

    const renderD3Paths = () => {
      layerGroup.selectAll('*').remove();

      // Collect all projected stop points
      const projectedPoints: Array<{ stop: RouteStop; pt: [number, number]; isPassed: boolean; isNext: boolean }> = [];

      allStopsInProgression.forEach((stop, idx) => {
        if (stop.latitude && stop.longitude) {
          const pt = project(stop.latitude, stop.longitude);
          const isPassed = idx < splitIndex;
          const isNext = idx === splitIndex;
          projectedPoints.push({ stop, pt, isPassed, isNext });
        }
      });

      if (projectedPoints.length < 2) return;

      // Projected bus location
      let busPt: [number, number] | null = null;
      if (busGps) {
        busPt = project(busGps.latitude, busGps.longitude);
      }

      // Base Route Coordinates (All points)
      const allCoords = projectedPoints.map((p) => p.pt);

      if (!showProgressionSplit || !busGps) {
        // 1. STANDARD FULL ROUTE VISUALIZATION (Emerald Ribbon)
        // Background Glow Path
        layerGroup
          .append('path')
          .datum(allCoords)
          .attr('d', lineGenerator)
          .attr('fill', 'none')
          .attr('stroke', '#a7f3d0')
          .attr('stroke-width', 10)
          .attr('stroke-opacity', 0.45)
          .attr('filter', 'url(#route-path-glow)');

        // Foreground Active Path
        layerGroup
          .append('path')
          .datum(allCoords)
          .attr('d', lineGenerator)
          .attr('fill', 'none')
          .attr('stroke', '#22c55e')
          .attr('stroke-width', 5.5)
          .attr('stroke-linejoin', 'round')
          .attr('stroke-linecap', 'round');

        // Flow Direction Animated Dashes
        if (showFlowParticles) {
          layerGroup
            .append('path')
            .datum(allCoords)
            .attr('d', lineGenerator)
            .attr('fill', 'none')
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 2.5)
            .attr('stroke-dasharray', '8 12')
            .attr('stroke-linecap', 'round')
            .attr('opacity', 0.85)
            .attr('class', 'animate-transit-dash');
        }
      } else {
        // 2. REAL-TIME COMMUTE PROGRESSION VIEW (Traveled vs Upcoming Split)
        const traveledPoints = projectedPoints.slice(0, splitIndex + 1).map((p) => p.pt);
        if (busPt) {
          traveledPoints.push(busPt);
        }

        const upcomingPoints: [number, number][] = [];
        if (busPt) {
          upcomingPoints.push(busPt);
        }
        upcomingPoints.push(...projectedPoints.slice(splitIndex).map((p) => p.pt));

        // --- A. TRAVELED SEGMENT (Deep Forest Green #166534 with subtle halo) ---
        if (traveledPoints.length >= 2) {
          // Traveled Outer Track
          layerGroup
            .append('path')
            .datum(traveledPoints)
            .attr('d', lineGenerator)
            .attr('fill', 'none')
            .attr('stroke', '#166534')
            .attr('stroke-width', 6)
            .attr('stroke-linecap', 'round')
            .attr('stroke-linejoin', 'round')
            .attr('opacity', 0.95);

          // Traveled Inner Solid Core
          layerGroup
            .append('path')
            .datum(traveledPoints)
            .attr('d', lineGenerator)
            .attr('fill', 'none')
            .attr('stroke', '#22c55e')
            .attr('stroke-width', 2.5)
            .attr('stroke-linecap', 'round')
            .attr('opacity', 0.8);
        }

        // --- B. UPCOMING SEGMENT (Animated Mint/Emerald Flow towards AITR) ---
        if (upcomingPoints.length >= 2) {
          // Upcoming Halo Glow
          layerGroup
            .append('path')
            .datum(upcomingPoints)
            .attr('d', lineGenerator)
            .attr('fill', 'none')
            .attr('stroke', '#a7f3d0')
            .attr('stroke-width', 9)
            .attr('stroke-opacity', 0.5)
            .attr('filter', 'url(#route-path-glow)');

          // Upcoming Base Track
          layerGroup
            .append('path')
            .datum(upcomingPoints)
            .attr('d', lineGenerator)
            .attr('fill', 'none')
            .attr('stroke', '#22c55e')
            .attr('stroke-width', 5.5)
            .attr('stroke-linecap', 'round')
            .attr('stroke-linejoin', 'round');

          // Directional Commute Pulse Flow (Dash Animation)
          layerGroup
            .append('path')
            .datum(upcomingPoints)
            .attr('d', lineGenerator)
            .attr('fill', 'none')
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 2.8)
            .attr('stroke-dasharray', '8 10')
            .attr('stroke-linecap', 'round')
            .attr('class', 'animate-transit-dash')
            .attr('opacity', 0.9);
        }

        // --- C. REAL-TIME BUS RADAR RIPPLE AT BUS POSITION ---
        if (busPt) {
          const radarG = layerGroup
            .append('g')
            .attr('transform', `translate(${busPt[0]}, ${busPt[1]})`);

          // Expanding Outer Ripple
          radarG
            .append('circle')
            .attr('r', 24)
            .attr('fill', '#22c55e')
            .attr('fill-opacity', 0.18)
            .attr('stroke', '#22c55e')
            .attr('stroke-width', 1.5)
            .attr('stroke-opacity', 0.6);

          // Secondary Radar Glow
          radarG
            .append('circle')
            .attr('r', 14)
            .attr('fill', '#a7f3d0')
            .attr('fill-opacity', 0.35)
            .attr('stroke', '#166534')
            .attr('stroke-width', 2);

          // Center GPS Target
          radarG
            .append('circle')
            .attr('r', 5)
            .attr('fill', '#2563eb')
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 1.5);
        }
      }

      // --- D. D3 INTERACTIVE STOP NODES ALONG THE ROUTE ---
      const stopsGroup = layerGroup.append('g').attr('class', 'd3-stops-group');

      projectedPoints.forEach(({ stop, pt, isPassed, isNext }, index) => {
        const isDestination = stop.stop_id === 'aitr-campus-terminal';
        const isSelected = stop.stop_id === selectedStopId;

        const stopNode = stopsGroup
          .append('g')
          .attr('transform', `translate(${pt[0]}, ${pt[1]})`)
          .style('cursor', 'pointer')
          .style('pointer-events', 'all')
          .on('click', () => {
            if (onSelectStop) onSelectStop(stop.stop_id);
          })
          .on('mouseenter', () => setHoveredStop(stop))
          .on('mouseleave', () => setHoveredStop(null));

        if (isDestination) {
          // AITR Campus Destination Node (Golden/Forest Badge)
          stopNode
            .append('circle')
            .attr('r', 16)
            .attr('fill', '#166534')
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 2.5)
            .attr('filter', 'url(#route-path-glow)');

          stopNode
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '4.5px')
            .attr('font-size', '12px')
            .attr('fill', '#ffffff')
            .text('🏛️');
        } else if (isPassed) {
          // Passed Stop: Forest Green with Checkmark
          stopNode
            .append('circle')
            .attr('r', isSelected ? 9 : 7)
            .attr('fill', '#166534')
            .attr('stroke', isSelected ? '#a7f3d0' : '#ffffff')
            .attr('stroke-width', isSelected ? 2.5 : 1.5)
            .attr('opacity', 0.9);

          // Mini check dot
          stopNode
            .append('circle')
            .attr('r', 2.5)
            .attr('fill', '#a7f3d0');
        } else if (isNext) {
          // Active Approaching Stop: Glowing Emerald
          stopNode
            .append('circle')
            .attr('r', 14)
            .attr('fill', '#22c55e')
            .attr('fill-opacity', 0.2)
            .attr('stroke', '#22c55e')
            .attr('stroke-width', 1.5);

          stopNode
            .append('circle')
            .attr('r', isSelected ? 10 : 8)
            .attr('fill', '#22c55e')
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 2.5);

          stopNode
            .append('circle')
            .attr('r', 3.5)
            .attr('fill', '#ffffff');
        } else {
          // Upcoming Stop: Clean White with Forest Ring
          stopNode
            .append('circle')
            .attr('r', isSelected ? 9 : 6.5)
            .attr('fill', isSelected ? '#a7f3d0' : '#ffffff')
            .attr('stroke', '#166534')
            .attr('stroke-width', isSelected ? 2.5 : 2);

          // Sequence text on hover or selected
          if (isSelected) {
            stopNode
              .append('text')
              .attr('text-anchor', 'middle')
              .attr('dy', '3px')
              .attr('font-size', '8px')
              .attr('font-weight', 'bold')
              .attr('fill', '#166534')
              .text(index + 1);
          }
        }
      });
    };

    // Render immediately
    renderD3Paths();

    // Hook onto Leaflet camera transform events to keep D3 synchronized
    const updateHandler = () => renderD3Paths();
    map.on('zoom', updateHandler);
    map.on('move', updateHandler);
    map.on('viewreset', updateHandler);

    return () => {
      map.off('zoom', updateHandler);
      map.off('move', updateHandler);
      map.off('viewreset', updateHandler);
    };
  }, [
    activeRoute,
    allStopsInProgression,
    activeBus,
    commuteStats,
    selectedStopId,
    showProgressionSplit,
    showFlowParticles,
    onSelectStop,
  ]);

  // 3. Update Bus GPS Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const busesToDisplay = showAllBuses ? allActiveBuses : activeBus ? [activeBus] : [];

    // Remove obsolete markers
    busMarkersRef.current.forEach((marker, busId) => {
      if (!busesToDisplay.some((b) => b.id === busId)) {
        marker.remove();
        busMarkersRef.current.delete(busId);
      }
    });

    busesToDisplay.forEach((bus) => {
      if (!bus.latest_gps) return;

      const { latitude, longitude, speed } = bus.latest_gps;
      const isLive = bus.status === 'ACTIVE' || bus.status === 'APPROACHING';

      // Bus marker in #166534 Deep Forest Green with Claymorphic Bevel
      const busIcon = L.divIcon({
        className: 'custom-bus-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; filter: drop-shadow(0 6px 12px rgba(22,101,52,0.35));">
            <div style="background: linear-gradient(145deg, #18753d, #134e2a); color: #ffffff; padding: 4px 10px; border: 1.5px solid rgba(255,255,255,0.85); border-radius: 14px; font-size: 11px; font-weight: 800; display: flex; align-items: center; gap: 5px; box-shadow: inset 1px 1.5px 2px rgba(255,255,255,0.45); text-transform: uppercase;">
              <span>🚌</span>
              <span>${bus.bus_number}</span>
              ${isLive ? '<span style="width: 7px; height: 7px; background-color: #22c55e; border-radius: 50%; display: inline-block; box-shadow: 0 0 8px #22c55e;"></span>' : ''}
            </div>
            <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid #134e2a;"></div>
          </div>
        `,
        iconSize: [84, 42],
        iconAnchor: [42, 36],
      });

      let marker = busMarkersRef.current.get(bus.id);

      if (marker) {
        marker.setLatLng([latitude, longitude]);
        marker.setIcon(busIcon);
      } else {
        marker = L.marker([latitude, longitude], { icon: busIcon }).addTo(map);
        busMarkersRef.current.set(bus.id, marker);
      }

      marker.unbindPopup();
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4; color: #17301f; min-width: 170px;">
          <div style="font-weight: 800; font-size: 13px; color: #166534; margin-bottom: 3px;">
            AITR BUS ${bus.bus_number}
          </div>
          <div>Driver: <b>${bus.driver_name || 'Assigned Driver'}</b></div>
          <div style="margin-top: 3px;">
            Status: <span style="font-weight: 700; color: #166534; background: #ecfdf5; padding: 2px 7px; border-radius: 8px; border: 1px solid #22c55e;">
              ${bus.status === 'ACTIVE' ? '● LIVE' : bus.status}
            </span>
          </div>
          <div style="margin-top: 3px;">Next Stop: <b>${bus.next_stop_name || 'AITR Campus'}</b></div>
          <div>Speed: <b>${speed ? `${Math.round(speed)} km/h` : 'Stopped'}</b></div>
          ${
            bus.is_simulated
              ? '<div style="color: #166534; font-weight: 700; margin-top: 5px; background: #f0fdf4; border: 1px solid #a7f3d0; border-radius: 8px; padding: 2px 6px; font-size: 10px;">⚡ REAL-TIME TELEMETRY</div>'
              : ''
          }
        </div>
      `);

      if (onSelectBus) {
        marker.on('click', () => onSelectBus(bus));
      }
    });

    // Initial center on route if no map centering done
    if (activeRoute && allStopsInProgression.length > 0 && !activeBus?.latest_gps) {
      const bounds = L.latLngBounds(
        allStopsInProgression.filter((s) => s.latitude && s.longitude).map((s) => [s.latitude!, s.longitude!])
      );
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [activeBus, allActiveBuses, showAllBuses, activeRoute, allStopsInProgression, onSelectBus]);

  return (
    <div className="relative w-full overflow-hidden border border-white/80 rounded-2xl shadow-sm bg-[#F8FAF5]">
      {/* Map Canvas */}
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />

      {/* Real-time Commute Progression HUD (Floating Glassmorphic & Claymorphic Card) */}
      {enableD3Progression && activeRoute && (
        <div className="absolute top-3 left-3 right-3 sm:right-auto sm:max-w-md z-[400] transition-all duration-300">
          <div className="glass-modal p-3.5 sm:p-4 shadow-[0_12px_36px_rgba(22,101,52,0.16)] border border-white/95">
            {/* Header: Bus Info & Minimize Toggle */}
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-emerald-100/80">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                <span className="text-xs font-black uppercase text-[#166534] tracking-wide">
                  Route Progression · Bus {activeBus?.bus_number || 'En Route'}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#ecfdf5] text-[#166534] border border-[#a7f3d0]">
                  D3.js Overlay
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleRecenterBus}
                  disabled={!activeBus?.latest_gps}
                  className="p-1 rounded-lg hover:bg-emerald-50 text-[#166534] disabled:opacity-30 cursor-pointer transition-colors"
                  title="Recenter on Bus"
                >
                  <Navigation className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleFitRoute}
                  className="p-1 rounded-lg hover:bg-emerald-50 text-[#166534] cursor-pointer transition-colors"
                  title="Fit Whole Route"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsHudExpanded(!isHudExpanded)}
                  className="p-1 rounded-lg hover:bg-emerald-50 text-[#64748b] cursor-pointer transition-colors"
                  title={isHudExpanded ? 'Collapse' : 'Expand'}
                >
                  {isHudExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Commute Progress Bar (Always Visible) */}
            <div className="mt-2.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#17301F] mb-1">
                <span className="flex items-center gap-1.5 text-[#166534]">
                  <Zap className="w-3.5 h-3.5 text-[#22c55e]" />
                  <span>Commute Progress</span>
                </span>
                <span className="font-extrabold text-[#166534]">
                  {commuteStats.progressionPercent}% Complete
                </span>
              </div>

              {/* Multi-segment Progress Track */}
              <div className="w-full h-2.5 bg-emerald-50 border border-[#a7f3d0] rounded-full overflow-hidden p-0.5 shadow-inner">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-[#166534] via-[#22c55e] to-[#a7f3d0]"
                  style={{ width: `${commuteStats.progressionPercent}%` }}
                />
              </div>
            </div>

            {/* Expanded Real-time Progression Details */}
            {isHudExpanded && (
              <div className="mt-3 space-y-2.5 pt-2 border-t border-emerald-100/60 animate-in fade-in duration-200">
                {/* Current Segment Description */}
                {commuteStats.currentSegment && (
                  <div className="clay-card-mint p-2.5 text-xs text-[#17301F]">
                    <div className="text-[10px] uppercase font-bold text-[#64748B] flex items-center justify-between mb-1">
                      <span>Current Transit Corridor</span>
                      <span className="text-[#166534] font-black">
                        {commuteStats.passedStopsCount} of {commuteStats.totalStopsCount} Stops Passed
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 font-bold text-[#166534] truncate">
                      <span className="truncate">{commuteStats.currentSegment.fromStopName}</span>
                      <span className="text-[#22c55e]">➔</span>
                      <span className="truncate text-[#17301F]">
                        {commuteStats.currentSegment.toStopName}
                      </span>
                    </div>

                    {commuteStats.distanceToNextStopMeters !== null && (
                      <div className="mt-1 flex items-center justify-between text-[11px] text-[#64748B]">
                        <span>Next Stop: <b>{commuteStats.distanceToNextStopMeters} m</b></span>
                        {commuteStats.estimatedSecsToNextStop !== null && (
                          <span className="text-[#166534] font-bold">
                            ETA: ~{Math.ceil(commuteStats.estimatedSecsToNextStop / 60)} min
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Interactive Stop Micro-Stepper Ribbon */}
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold text-[#64748B] flex items-center justify-between">
                    <span>Route Progression Chain</span>
                    <span className="text-[10px] text-[#22c55e]">Tap stop to focus</span>
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full scrollbar-none">
                    {allStopsInProgression.slice(0, 10).map((stop, idx) => {
                      const isPassed = idx < commuteStats.passedStopsCount;
                      const isNext = idx === commuteStats.passedStopsCount;
                      const isSelected = stop.stop_id === selectedStopId;

                      return (
                        <button
                          key={stop.stop_id}
                          onClick={() => onSelectStop && onSelectStop(stop.stop_id)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#166534] text-white shadow-xs'
                              : isNext
                              ? 'bg-[#22c55e] text-white'
                              : isPassed
                              ? 'bg-emerald-100 text-[#166534] border border-[#a7f3d0]'
                              : 'bg-white/80 text-[#64748B] border border-white'
                          }`}
                          title={`${stop.sequence}. ${stop.stop_name}`}
                        >
                          {isPassed ? '✓ ' : ''}
                          {stop.sequence}. {stop.stop_name.slice(0, 8)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Display Mode Toggles */}
                <div className="pt-1 flex items-center justify-between gap-2 text-[11px] font-bold text-[#17301F]">
                  <button
                    onClick={() => setShowProgressionSplit(!showProgressionSplit)}
                    className={`px-2.5 py-1 rounded-xl flex items-center gap-1 transition-all cursor-pointer ${
                      showProgressionSplit ? 'clay-btn-mint text-[#166534]' : 'bg-white/70 text-[#64748B]'
                    }`}
                  >
                    <Layers className="w-3 h-3" />
                    <span>{showProgressionSplit ? 'Progression Split: ON' : 'Full Route Mode'}</span>
                  </button>

                  <button
                    onClick={() => setShowFlowParticles(!showFlowParticles)}
                    className={`px-2.5 py-1 rounded-xl flex items-center gap-1 transition-all cursor-pointer ${
                      showFlowParticles ? 'clay-btn-mint text-[#166534]' : 'bg-white/70 text-[#64748B]'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-[#22c55e]" />
                    <span>Flow Motion</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hovered Stop Tooltip Overlay */}
      {hoveredStop && (
        <div className="absolute top-3 right-3 z-[410] glass-modal px-3 py-2 text-xs font-bold text-[#17301F] shadow-lg animate-in fade-in duration-150">
          <div className="text-[#166534] font-black">#{hoveredStop.sequence} {hoveredStop.stop_name}</div>
          <div className="text-[11px] text-[#64748B]">Shift 1: {hoveredStop.shift_1_time || 'N/A'} · Shift 2: {hoveredStop.shift_2_time || 'N/A'}</div>
        </div>
      )}

      {/* Frosted Glassmorphic Floating Map Legend */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/90 backdrop-blur-md border border-white/95 rounded-2xl px-3.5 py-2 text-[11px] font-bold shadow-[0_8px_24px_rgba(22,101,52,0.12)] flex flex-wrap items-center gap-3.5 text-[#17301F]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#166534]"></span>
          <span>Traveled / Bus (#166534)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-1 rounded-full bg-[#22C55E]"></span>
          <span>Upcoming Route (#22C55E)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full border-2 border-[#166534] bg-[#A7F3D0]"></span>
          <span>Stops</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]"></span>
          <span>Current GPS</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>🏛️</span>
          <span>AITR Campus</span>
        </div>
      </div>
    </div>
  );
};
