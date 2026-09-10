'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RuteEkspedisiItem, RuteWaypoint } from '@/lib/types/content';
import {
  MapPin,
  Navigation,
  Mountain,
  Compass,
  Layers,
  Maximize2,
  Minimize2,
  Calendar,
} from 'lucide-react';

interface ExpeditionMapProps {
  routes: RuteEkspedisiItem[];
  selectedRouteId?: string | null;
  onSelectRoute?: (routeId: string) => void;
  className?: string;
}

// Custom Marker Generator with SVG icons avoiding Leaflet broken asset URLs
function createCustomMarkerIcon(tipe: RuteWaypoint['tipe'], label: string) {
  let bgClass = 'bg-emerald-600 border-emerald-300 text-white';
  let iconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="m3 21 8.5-16L20 21Z"/><path d="M11.5 5v16"/>
    </svg>
  `;

  if (tipe === 'basecamp') {
    bgClass = 'bg-blue-600 border-blue-300 text-white shadow-blue-500/30';
    iconSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 21h18M3 21l9-16 9 16M9 21v-4a3 3 0 0 1 6 0v4"/>
      </svg>
    `;
  } else if (tipe === 'puncak') {
    bgClass = 'bg-rose-600 border-rose-300 text-white shadow-rose-500/30 animate-pulse';
    iconSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.45 1-1 1s-1-.45-1-1v-2.34c-1.22-.57-2-1.84-2-3.32C6 9.45 7.45 8 9.25 8s3.25 1.45 3.25 3.34c0 1.48-.78 2.75-2 3.32z"/>
      </svg>
    `;
  } else if (tipe === 'objek') {
    bgClass = 'bg-amber-600 border-amber-300 text-white shadow-amber-500/30';
    iconSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
      </svg>
    `;
  }

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div class="group relative flex flex-col items-center">
        <div class="w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg transition-transform transform group-hover:scale-125 ${bgClass}">
          ${iconSvg}
        </div>
        <div class="mt-1 px-1.5 py-0.5 rounded bg-zinc-900/90 backdrop-blur-sm border border-zinc-700 text-[10px] font-semibold text-zinc-200 shadow-md whitespace-nowrap pointer-events-none">
          ${label}
        </div>
      </div>
    `,
    iconSize: [32, 54],
    iconAnchor: [16, 20],
    popupAnchor: [0, -22],
  });
}

const ROUTE_COLORS: Record<string, string> = {
  'rute-1': '#3b82f6', // Sawarna - Blue
  'rute-2': '#10b981', // Ciremai - Emerald
  'rute-3': '#f59e0b', // Citarik - Amber
  'rute-4': '#8b5cf6', // Gede - Violet
};

export default function ExpeditionMap({
  routes,
  selectedRouteId: externalSelectedId,
  onSelectRoute,
  className = '',
}: ExpeditionMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const [activeRouteId, setActiveRouteId] = useState<string | null>(
    externalSelectedId || (routes.length > 0 ? routes[0].id : null)
  );
  const [isExpanded, setIsExpanded] = useState(false);

  // Sync external selection
  useEffect(() => {
    if (externalSelectedId !== undefined) {
      setActiveRouteId(externalSelectedId);
    }
  }, [externalSelectedId]);

  const currentRoute = routes.find((r) => r.id === activeRouteId) || routes[0] || null;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [-6.89, 107.4],
      zoom: 8,
      scrollWheelZoom: true,
      zoomControl: false,
    });

    // Add zoom control top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // OpenStreetMap free tile server
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors | Ekspedisi Gandawesi UPI',
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    layerGroupRef.current = layerGroup;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Waypoints, Markers & Lines when active route changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup || !routes || routes.length === 0) return;

    layerGroup.clearLayers();

    const allBounds = L.latLngBounds([]);
    let activeBounds: L.LatLngBounds | null = null;

    routes.forEach((route) => {
      const isSelected = route.id === activeRouteId;
      const color = ROUTE_COLORS[route.id] || '#10b981';

      if (route.waypoints && route.waypoints.length > 0) {
        const polylinePoints: [number, number][] = [];

        route.waypoints.forEach((wp, idx) => {
          polylinePoints.push([wp.lat, wp.lng]);
          allBounds.extend([wp.lat, wp.lng]);

          if (isSelected) {
            if (!activeBounds) activeBounds = L.latLngBounds([[wp.lat, wp.lng]]);
            else activeBounds.extend([wp.lat, wp.lng]);
          }

          // Create marker
          const marker = L.marker([wp.lat, wp.lng], {
            icon: createCustomMarkerIcon(wp.tipe, wp.nama),
            zIndexOffset: isSelected ? 1000 : 100,
          });

          // Popup content
          const popupContent = `
            <div style="font-family: inherit; font-size: 13px; color: #18181b; line-height: 1.4; min-width: 220px;">
              <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: ${color}; letter-spacing: 0.05em; margin-bottom: 2px;">
                ${route.nama}
              </div>
              <div style="font-size: 14px; font-weight: 700; color: #09090b; margin-bottom: 4px;">
                ${wp.nama}
              </div>
              ${
                wp.elevasi_mdpl
                  ? `<div style="display: inline-flex; align-items: center; gap: 4px; background: #f4f4f5; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; color: #27272a; margin-bottom: 6px;">
                      🏔️ Elevasi: ${wp.elevasi_mdpl} mdpl
                    </div>`
                  : ''
              }
              ${
                wp.keterangan
                  ? `<p style="margin: 4px 0 0 0; font-size: 12px; color: #52525b;">${wp.keterangan}</p>`
                  : ''
              }
              <div style="margin-top: 8px; padding-top: 6px; border-top: 1px dashed #e4e4e7; font-size: 11px; color: #71717a;">
                GPS: ${wp.lat.toFixed(4)}, ${wp.lng.toFixed(4)}
              </div>
            </div>
          `;

          marker.bindPopup(popupContent, { maxWidth: 280 });
          layerGroup.addLayer(marker);
        });

        // Draw track polyline
        const trackLine = L.polyline(polylinePoints, {
          color: color,
          weight: isSelected ? 4 : 2,
          opacity: isSelected ? 0.9 : 0.4,
          dashArray: isSelected ? undefined : '6, 6',
          lineCap: 'round',
          lineJoin: 'round',
        });

        trackLine.on('click', () => {
          setActiveRouteId(route.id);
          if (onSelectRoute) onSelectRoute(route.id);
        });

        layerGroup.addLayer(trackLine);
      } else if (route.koordinat_lat && route.koordinat_lng) {
        // Fallback single coordinate marker
        const lat = route.koordinat_lat;
        const lng = route.koordinat_lng;
        allBounds.extend([lat, lng]);

        if (isSelected) {
          activeBounds = L.latLngBounds([[lat, lng]]);
        }

        const marker = L.marker([lat, lng], {
          icon: createCustomMarkerIcon('puncak', route.nama),
          zIndexOffset: isSelected ? 1000 : 100,
        });

        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 13px; color: #18181b;">
            <div style="font-weight: 700; margin-bottom: 4px;">${route.nama}</div>
            <div style="font-size: 12px; color: #52525b;">${route.lokasi || ''}</div>
          </div>
        `);
        layerGroup.addLayer(marker);
      }
    });

    // Fly to active bounds or overview
    if (activeBounds && (activeBounds as L.LatLngBounds).isValid()) {
      map.flyToBounds(activeBounds, {
        padding: [60, 60],
        maxZoom: 14,
        duration: 1.2,
      });
    } else if (allBounds.isValid()) {
      map.flyToBounds(allBounds, {
        padding: [40, 40],
        maxZoom: 11,
        duration: 1.0,
      });
    }
  }, [routes, activeRouteId, onSelectRoute]);

  const handleSelectRoute = (routeId: string) => {
    setActiveRouteId(routeId);
    if (onSelectRoute) onSelectRoute(routeId);
  };

  const handleResetView = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo([-6.89, 107.4], 8, { duration: 1.0 });
  };

  return (
    <div
      className={`relative rounded-3xl overflow-hidden border border-emerald-900/40 bg-zinc-950 shadow-2xl transition-all duration-300 ${
        isExpanded ? 'fixed inset-4 z-50 rounded-2xl shadow-3xl' : 'w-full'
      } ${className}`}
    >
      {/* Top Header Controls */}
      <div className="relative z-10 px-5 py-4 bg-gradient-to-b from-zinc-950/95 via-zinc-950/80 to-transparent backdrop-blur-md flex flex-wrap items-center justify-between gap-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider uppercase text-emerald-400">
                Peta GIS Interaktif
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300 font-mono">
                OpenStreetMap Free
              </span>
            </div>
            <h3 className="text-sm md:text-base font-bold text-white tracking-tight">
              Lintas Jalur & Topografi Ekspedisi
            </h3>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetView}
            className="px-3 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/60 text-xs font-medium text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 shadow-sm"
            title="Reset Sudut Pandang"
          >
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Reset Posisi</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 hover:text-white transition-all shadow-sm"
            title={isExpanded ? 'Perkecil Peta' : 'Layar Penuh'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Route Quick Tabs */}
      <div className="relative z-10 px-5 py-2.5 bg-zinc-950/75 backdrop-blur-md border-b border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-xs font-medium text-zinc-400 shrink-0 flex items-center gap-1 mr-1">
          <Navigation className="w-3.5 h-3.5 text-emerald-400" />
          Pilih Rute:
        </span>
        {routes.map((route) => {
          const isSelected = route.id === activeRouteId;
          const color = ROUTE_COLORS[route.id] || '#10b981';

          return (
            <button
              key={route.id}
              type="button"
              onClick={() => handleSelectRoute(route.id)}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 border ${
                isSelected
                  ? 'bg-zinc-800/90 text-white shadow-md'
                  : 'bg-zinc-900/40 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/70 border-zinc-800/60'
              }`}
              style={{
                borderColor: isSelected ? color : undefined,
                boxShadow: isSelected ? `0 0 12px ${color}33` : undefined,
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="max-w-[140px] truncate">{route.nama}</span>
              {route.elevasi_mdpl && (
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950/60 px-1.5 py-0.5 rounded">
                  {route.elevasi_mdpl}m
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Leaflet Map Canvas */}
      <div
        ref={mapContainerRef}
        className={`w-full relative z-0 transition-all ${
          isExpanded ? 'h-[calc(100%-140px)]' : 'h-[440px] md:h-[500px]'
        }`}
        style={{ minHeight: '380px' }}
      />

      {/* Bottom Floating Route Info HUD */}
      {currentRoute && (
        <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none">
          <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-zinc-950/90 backdrop-blur-md border border-white/10 shadow-2xl pointer-events-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold text-[11px]">
                  {currentRoute.tingkat_kesulitan?.toUpperCase() || 'MODERATE'}
                </span>
                {currentRoute.tanggal && (
                  <span className="text-xs text-zinc-400 flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3 text-zinc-500" />
                    {currentRoute.tanggal}
                  </span>
                )}
                {currentRoute.elevasi_mdpl && (
                  <span className="text-xs text-zinc-300 font-mono flex items-center gap-1">
                    <Mountain className="w-3 h-3 text-emerald-400" />
                    {currentRoute.elevasi_mdpl} mdpl
                  </span>
                )}
              </div>
              <h4 className="text-sm md:text-base font-bold text-white truncate">
                {currentRoute.nama}
              </h4>
              <p className="text-xs text-zinc-400 line-clamp-1">
                {currentRoute.lokasi}
              </p>
            </div>

            {/* Waypoint count badge */}
            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <div className="text-right">
                <div className="text-[11px] text-zinc-400">Total Pos & Waypoint</div>
                <div className="text-sm font-bold text-white font-mono">
                  {currentRoute.waypoints ? currentRoute.waypoints.length : 1} Titik Survei
                </div>
              </div>
              <div className="w-8 h-8 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-emerald-400">
                <MapPin className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Legend Overlay */}
      <div className="absolute top-28 left-4 z-10 hidden sm:block pointer-events-none">
        <div className="p-3 rounded-2xl bg-zinc-950/85 backdrop-blur-md border border-white/10 shadow-lg pointer-events-auto space-y-1.5 text-[11px]">
          <div className="font-bold text-zinc-300 mb-1 flex items-center gap-1">
            <Layers className="w-3 h-3 text-emerald-400" /> Legenda Peta
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-300/40" />
            Basecamp / Titik Awal
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-300/40" />
            Pos Jalur / Camp Transit
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-300/40" />
            Puncak / Target Survei
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-300/40" />
            Objek Khusus / Jeram / Sump
          </div>
        </div>
      </div>
    </div>
  );
}
