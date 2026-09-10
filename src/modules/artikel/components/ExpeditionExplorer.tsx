'use client';

import React, { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { RuteEkspedisiItem } from '@/lib/types/content';
import {
  Compass,
  MapPin,
  Calendar,
  Users,
  Mountain,
  Camera,
  Layers,
  Activity,
  CheckCircle2,
  Navigation,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Dynamic import for Leaflet map to strictly prevent SSR window reference error
const ExpeditionMap = dynamic(
  () => import('@/shared/components/map/ExpeditionMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[450px] md:h-[500px] rounded-3xl bg-zinc-900/70 border border-zinc-800 animate-pulse flex flex-col items-center justify-center text-zinc-400 gap-3 shadow-2xl">
        <div className="w-12 h-12 rounded-full border-3 border-emerald-500/30 border-t-emerald-500 animate-spin" />
        <div className="text-center">
          <p className="text-sm font-semibold text-zinc-200">Memuat Peta GIS Gandawesi...</p>
          <p className="text-xs text-zinc-500">Menghubungkan OpenStreetMap tiles & titik koordinat survei</p>
        </div>
      </div>
    ),
  }
);

interface ExpeditionExplorerProps {
  initialRoutes: RuteEkspedisiItem[];
}

export default function ExpeditionExplorer({ initialRoutes }: ExpeditionExplorerProps) {
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(
    initialRoutes.length > 0 ? initialRoutes[0].id : null
  );

  const mapSectionRef = useRef<HTMLDivElement>(null);

  const handleFocusOnMap = (routeId: string) => {
    setSelectedRouteId(routeId);
    if (mapSectionRef.current) {
      mapSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="space-y-12">
      {/* Interactive GIS Map Section */}
      <div ref={mapSectionRef} className="space-y-3">
        <ExpeditionMap
          routes={initialRoutes}
          selectedRouteId={selectedRouteId}
          onSelectRoute={(id) => setSelectedRouteId(id)}
        />
      </div>

      {/* Routes List Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              Daftar Ekspedisi Resmi & Topografi Jalur
            </h3>
          </div>
          <span className="text-xs font-mono text-stone-500 dark:text-stone-400">
            {initialRoutes.length} Ekspedisi Terdokumentasi
          </span>
        </div>

        {initialRoutes.map((rute, idx) => {
          const isSelected = rute.id === selectedRouteId;
          const dateStr = rute.tanggal
            ? new Date(rute.tanggal).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            : 'Dokumentasi Ekspedisi';

          return (
            <div
              key={rute.id}
              className={`rounded-3xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border transition-all duration-300 overflow-hidden shadow-xl p-6 md:p-8 space-y-6 ${
                isSelected
                  ? 'border-emerald-500/80 ring-2 ring-emerald-500/20 shadow-emerald-500/10'
                  : 'border-stone-200/80 dark:border-stone-800/80 hover:border-stone-300 dark:hover:border-stone-700'
              }`}
            >
              {/* Route Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-forest-800 text-white font-mono font-bold text-xs flex items-center justify-center">
                      0{idx + 1}
                    </span>
                    <h2 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-100">
                      {rute.nama}
                    </h2>
                    {rute.tingkat_kesulitan && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        {rute.tingkat_kesulitan}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs pl-9">
                    <span className="flex items-center gap-1 text-rose-500 font-medium">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      {rute.lokasi}
                    </span>
                    {rute.elevasi_mdpl && (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                        <Mountain className="w-3.5 h-3.5" />
                        {rute.elevasi_mdpl} mdpl
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pl-9 md:pl-0">
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-forest-600 dark:text-forest-400" />
                    <span>{dateStr}</span>
                  </div>

                  <Button
                    size="sm"
                    variant={isSelected ? 'primary' : 'outline'}
                    onClick={() => handleFocusOnMap(rute.id)}
                    className="text-xs gap-1.5 rounded-xl transition-all"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    {isSelected ? 'Sedang Difokuskan' : 'Fokus di Peta'}
                  </Button>
                </div>
              </div>

              {/* Waypoints Preview Badges */}
              {rute.waypoints && rute.waypoints.length > 0 && (
                <div className="p-4 rounded-2xl bg-stone-50/70 dark:bg-stone-950/40 border border-stone-100 dark:border-stone-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-500" />
                      Titik Survei & Pos Lintas Jalur ({rute.waypoints.length} Titik)
                    </span>
                    <span className="text-[11px] text-stone-400">
                      Klik marker di peta untuk elevasi detail
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {rute.waypoints.map((wp, wIdx) => (
                      <div
                        key={wIdx}
                        className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/70 dark:border-stone-800/80 space-y-1 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate">
                            {wp.nama}
                          </span>
                          {wp.elevasi_mdpl && (
                            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 shrink-0">
                              {wp.elevasi_mdpl}m
                            </span>
                          )}
                        </div>
                        {wp.keterangan && (
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2">
                            {wp.keterangan}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description & Participants */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm">
                <div className="md:col-span-2 space-y-2 text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    Catatan Operasional & Karakteristik Medan
                  </h4>
                  <p>{rute.deskripsi}</p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/50 border border-stone-100 dark:border-stone-800 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-forest-600" /> Tim & Partisipan
                  </h4>
                  <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                    {rute.peserta || 'Regu Ekspedisi Gandawesi'}
                  </p>
                  {rute.koordinat_lat && rute.koordinat_lng && (
                    <div className="pt-2 border-t border-stone-200/50 dark:border-stone-800 text-[11px] font-mono text-stone-400">
                      GPS: {rute.koordinat_lat.toFixed(4)}, {rute.koordinat_lng.toFixed(4)}
                    </div>
                  )}
                </div>
              </div>

              {/* Photo Gallery Grid */}
              {rute.foto && rute.foto.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-400">
                    <Camera className="w-3.5 h-3.5" /> Dokumentasi Lapangan
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {rute.foto.map((imgUrl, imgIdx) => (
                      <div
                        key={imgIdx}
                        className="relative rounded-2xl overflow-hidden aspect-video bg-stone-900 shadow-md group"
                      >
                        <img
                          src={imgUrl}
                          alt={`${rute.nama} ${imgIdx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
