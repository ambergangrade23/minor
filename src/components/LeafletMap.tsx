import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Bus, Route } from '../types/transit';
import { AITR_COORDINATES } from '../data/aitrMasterData';

interface LeafletMapProps {
  activeBus: Bus | null;
  activeRoute: Route | null;
  allActiveBuses?: Bus[];
  selectedStopId?: string | null;
  onSelectStop?: (stopId: string) => void;
  onSelectBus?: (bus: Bus) => void;
  height?: string;
  showAllBuses?: boolean;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  activeBus,
  activeRoute,
  allActiveBuses = [],
  selectedStopId,
  onSelectStop,
  onSelectBus,
  height = '480px',
  showAllBuses = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const busMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const stopMarkersRef = useRef<Map<string, L.CircleMarker | L.Marker>>(new Map());
  const polylineRef = useRef<L.Polyline | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center near Indore / AITR bypass
    const map = L.map(mapContainerRef.current, {
      center: [22.7500, 75.8900],
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors | AITR Indore',
      maxZoom: 19,
    }).addTo(map);

    // Add AITR Campus Marker
    const aitrIcon = L.divIcon({
      className: 'aitr-campus-icon',
      html: `
        <div style="background-color: #0f172a; color: white; padding: 4px 8px; border-radius: 6px; font-weight: 700; font-size: 11px; display: flex; items-center: center; gap: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 2px solid #38bdf8; white-space: nowrap;">
          <span>🏛️ AITR CAMPUS</span>
        </div>
      `,
      iconSize: [110, 28],
      iconAnchor: [55, 14],
    });

    L.marker([AITR_COORDINATES.latitude, AITR_COORDINATES.longitude], { icon: aitrIcon })
      .addTo(map)
      .bindPopup(`<b>${AITR_COORDINATES.name}</b><br/>${AITR_COORDINATES.address}`);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Route Polyline & Stops
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old stops & polyline
    stopMarkersRef.current.forEach((marker) => marker.remove());
    stopMarkersRef.current.clear();

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (!activeRoute) return;

    const stopCoordinates: [number, number][] = [];

    activeRoute.stops.forEach((rs) => {
      if (rs.latitude !== null && rs.longitude !== null) {
        stopCoordinates.push([rs.latitude, rs.longitude]);

        const isSelected = rs.stop_id === selectedStopId;

        const circle = L.circleMarker([rs.latitude, rs.longitude], {
          radius: isSelected ? 8 : 5,
          color: isSelected ? '#4f46e5' : '#0284c7',
          fillColor: isSelected ? '#6366f1' : '#38bdf8',
          fillOpacity: isSelected ? 0.9 : 0.7,
          weight: isSelected ? 3 : 2,
        }).addTo(map);

        circle.bindTooltip(
          `<div style="font-family: inherit; font-size: 12px;">
            <strong>#${rs.sequence} ${rs.stop_name}</strong><br/>
            <span>Shift 1: ${rs.shift_1_time || 'N/A'}</span>
          </div>`,
          { direction: 'top', offset: [0, -6] }
        );

        if (onSelectStop) {
          circle.on('click', () => onSelectStop(rs.stop_id));
        }

        stopMarkersRef.current.set(rs.stop_id, circle);
      }
    });

    // Make sure AITR is the final destination point on polyline
    stopCoordinates.push([AITR_COORDINATES.latitude, AITR_COORDINATES.longitude]);

    if (stopCoordinates.length >= 2) {
      const polyline = L.polyline(stopCoordinates, {
        color: '#4f46e5',
        weight: 4,
        opacity: 0.8,
        dashArray: '2, 6',
      }).addTo(map);

      polylineRef.current = polyline;

      // Fit bounds if no active bus GPS
      if (!activeBus?.latest_gps) {
        map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
      }
    }
  }, [activeRoute, selectedStopId, onSelectStop, activeBus]);

  // Update Bus Markers
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
      const isSelected = activeBus?.id === bus.id;
      const isLive = bus.status === 'ACTIVE' || bus.status === 'APPROACHING';

      const busIcon = L.divIcon({
        className: 'custom-bus-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            ${
              isLive
                ? `<div style="position: absolute; top: -4px; width: 36px; height: 36px; border-radius: 50%; background: rgba(34, 197, 94, 0.25); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
                : ''
            }
            <div style="background: ${isSelected ? '#4f46e5' : '#0f172a'}; color: white; padding: 4px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; display: flex; align-items: center; gap: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid ${isLive ? '#22c55e' : '#94a3b8'};">
              <span>🚌</span>
              <span>${bus.bus_number}</span>
            </div>
            <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid ${isSelected ? '#4f46e5' : '#0f172a'};"></div>
          </div>
        `,
        iconSize: [64, 40],
        iconAnchor: [32, 34],
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
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
          <div style="font-weight: 700; font-size: 13px; margin-bottom: 2px;">AITR Bus ${bus.bus_number}</div>
          <div>Driver: <b>${bus.driver_name || 'Assigned Driver'}</b></div>
          <div>Status: <span style="font-weight: 600; color: ${isLive ? '#16a34a' : '#64748b'}">${bus.status}</span></div>
          <div>Next Stop: <b>${bus.next_stop_name || 'AITR Campus'}</b></div>
          <div>Speed: <b>${speed ? `${Math.round(speed)} km/h` : 'Stopped'}</b></div>
          ${bus.is_simulated ? '<div style="color: #ea580c; font-weight: 600; margin-top: 4px;">● DEMO SIMULATION</div>' : ''}
        </div>
      `);

      if (onSelectBus) {
        marker.on('click', () => onSelectBus(bus));
      }
    });

    // Auto-center on selected bus if active
    if (activeBus?.latest_gps && !showAllBuses) {
      map.setView([activeBus.latest_gps.latitude, activeBus.latest_gps.longitude], 13);
    }
  }, [activeBus, allActiveBuses, showAllBuses, onSelectBus]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />

      {/* Floating Map Legend */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 text-xs shadow-md flex items-center gap-4 text-slate-700">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-medium">Live Bus</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
          <span>Selected Route</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
          <span>Stops</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>🏛️</span>
          <span className="font-semibold text-slate-900">AITR Indore</span>
        </div>
      </div>
    </div>
  );
};
