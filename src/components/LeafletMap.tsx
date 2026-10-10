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

  // Initialize Map with Google Maps / Clean Transport style
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [22.7500, 75.8900],
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap · AITR Transit System',
      maxZoom: 19,
    }).addTo(map);

    // Add AITR Campus Marker with Deep Forest Green styling
    const aitrIcon = L.divIcon({
      className: 'aitr-campus-icon',
      html: `
        <div style="background: linear-gradient(145deg, #18753d, #124d29); color: #ffffff; padding: 5px 12px; border: 1.5px solid rgba(255,255,255,0.7); border-radius: 14px; font-weight: 800; font-size: 11px; display: flex; align-items: center; gap: 5px; box-shadow: 0 6px 16px rgba(22, 101, 52, 0.35), inset 1px 1px 2px rgba(255,255,255,0.4); white-space: nowrap;">
          <span>🏛️</span>
          <span>AITR CAMPUS</span>
        </div>
      `,
      iconSize: [124, 32],
      iconAnchor: [62, 16],
    });

    L.marker([AITR_COORDINATES.latitude, AITR_COORDINATES.longitude], { icon: aitrIcon })
      .addTo(map)
      .bindPopup(`
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4; color: #17301f;">
          <div style="font-weight: 800; font-size: 13px; color: #166534; margin-bottom: 2px;">${AITR_COORDINATES.name}</div>
          <div style="color: #64748B;">${AITR_COORDINATES.address}</div>
        </div>
      `);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Route Polyline in #22C55E & Stops
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
          radius: isSelected ? 9 : 6,
          color: '#166534',
          fillColor: isSelected ? '#a7f3d0' : '#ffffff',
          fillOpacity: 1,
          weight: isSelected ? 3 : 2,
        }).addTo(map);

        circle.bindTooltip(
          `<div style="font-family: inherit; font-size: 12px; font-weight: 700; color: #17301f;">
            <strong style="color: #166534;">#${rs.sequence} ${rs.stop_name}</strong><br/>
            <span style="color: #64748B;">Shift 1: ${rs.shift_1_time || 'N/A'}</span>
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
      // Emerald Green Route Polyline #22C55E as specified
      const polyline = L.polyline(stopCoordinates, {
        color: '#22c55e',
        weight: 5,
        opacity: 0.95,
      }).addTo(map);

      polylineRef.current = polyline;

      // Fit bounds if no active bus GPS
      if (!activeBus?.latest_gps) {
        map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
      }
    }
  }, [activeRoute, selectedStopId, onSelectStop, activeBus]);

  // Update Bus Markers in Primary #166534 with Claymorphic Style
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
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="background: linear-gradient(145deg, #18753d, #134e2a); color: #ffffff; padding: 4px 10px; border: 1.5px solid rgba(255,255,255,0.7); border-radius: 14px; font-size: 11px; font-weight: 800; display: flex; align-items: center; gap: 5px; box-shadow: 0 6px 16px rgba(22, 101, 52, 0.4), inset 1px 1.5px 2px rgba(255,255,255,0.45); text-transform: uppercase;">
              <span>🚌</span>
              <span>${bus.bus_number}</span>
              ${isLive ? '<span style="width: 6px; height: 6px; background-color: #22c55e; border-radius: 50%; display: inline-block; box-shadow: 0 0 6px #22c55e;"></span>' : ''}
            </div>
            <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid #134e2a;"></div>
          </div>
        `,
        iconSize: [78, 42],
        iconAnchor: [39, 36],
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
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4; color: #17301f;">
          <div style="font-weight: 800; font-size: 13px; color: #166534; margin-bottom: 2px;">
            AITR BUS ${bus.bus_number}
          </div>
          <div>Driver: <b>${bus.driver_name || 'Assigned Driver'}</b></div>
          <div style="margin-top: 2px;">
            Status: <span style="font-weight: 700; color: #166534; background: #ecfdf5; padding: 1px 7px; border-radius: 8px; border: 1px solid #22c55e;">
              ${bus.status === 'ACTIVE' ? '● LIVE' : bus.status}
            </span>
          </div>
          <div style="margin-top: 2px;">Next Stop: <b>${bus.next_stop_name || 'AITR Campus'}</b></div>
          <div>Speed: <b>${speed ? `${Math.round(speed)} km/h` : 'Stopped'}</b></div>
          ${
            bus.is_simulated
              ? '<div style="color: #166534; font-weight: 700; margin-top: 4px; background: #f0fdf4; border: 1px solid #a7f3d0; border-radius: 8px; padding: 2px 5px;">⚡ SIMULATED TELEMETRY</div>'
              : ''
          }
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
    <div className="relative w-full overflow-hidden border border-white/80 rounded-2xl shadow-sm bg-[#F8FAF5]">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />

      {/* Frosted Glassmorphic Floating Map Legend */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/85 backdrop-blur-md border border-white/90 rounded-2xl px-4 py-2.5 text-xs font-bold shadow-[0_8px_24px_rgba(22,101,52,0.12)] flex items-center gap-4 text-[#17301F]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#166534]"></span>
          <span>Bus (#166534)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-1 rounded-full bg-[#22C55E]"></span>
          <span>Route (#22C55E)</span>
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
