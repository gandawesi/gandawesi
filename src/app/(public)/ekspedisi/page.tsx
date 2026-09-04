import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Compass,
  MapPin,
  Calendar,
  Users,
  Mountain,
  ArrowRight,
  Sparkles,
  Camera,
  Layers,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getRuteEkspedisiList } from '@/lib/actions/content';

export const metadata: Metadata = {
  title: 'Peta Rute & Rekam Jejak Ekspedisi — Gandawesi FPTI UPI',
  description:
    'Galeri dokumentasi ekspedisi gunung hutan, penelusuran gua bawah tanah, arung jeram arus deras, dan pemetaan jalur alam terbuka perhimpunan mahasiswa pecinta alam Gandawesi.',
};

export default async function PublicEkspedisiPage() {
  const routes = await getRuteEkspedisiList();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 dark:bg-forest-950/60 border border-forest-200 dark:border-forest-800 text-xs font-bold text-forest-800 dark:text-forest-300">
          <Compass className="w-3.5 h-3.5" /> Eksplorasi Alam Nusantara
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100 font-mono">
          REKAM JEJAK EKSPEDISI
        </h1>
        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed">
          Dokumentasi penjelajahan medan ekstrem, pemetaan hidrologi gua, navigasi rimba belantara, dan penaklukkan jeram arus deras oleh kader-kader Gandawesi FPTI UPI.
        </p>
      </div>

      {/* Routes List */}
      <div className="space-y-8">
        {routes.map((rute, idx) => {
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
              className="rounded-3xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-800/80 overflow-hidden shadow-xl p-6 md:p-8 space-y-6"
            >
              {/* Route Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-forest-800 text-white font-mono font-bold text-xs flex items-center justify-center">
                      0{idx + 1}
                    </span>
                    <h2 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-100">
                      {rute.nama}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-rose-500 font-medium pl-9">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{rute.lokasi}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-stone-500 pl-9 md:pl-0">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-forest-600" />
                    <span>{dateStr}</span>
                  </div>
                </div>
              </div>

              {/* Description & Participants */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm">
                <div className="md:col-span-2 space-y-3 text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line">
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

      {/* Footer Exploration CTA */}
      <div className="p-8 rounded-3xl bg-forest-950 text-white text-center space-y-4 border border-forest-900 shadow-xl">
        <h3 className="text-xl font-bold font-mono tracking-wider">
          Ingin Menjadi Bagian dari Ekspedisi Selanjutnya?
        </h3>
        <p className="text-xs sm:text-sm text-forest-200/90 max-w-xl mx-auto leading-relaxed">
          Pendidikan kaderisasi Gandawesi mempersiapkan mental, ketahanan fisik, dan keahlian navigasi Anda untuk menjelajahi bentang alam Indonesia.
        </p>
        <div className="pt-2">
          <Link href="/daftar">
            <Button size="md" className="bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold gap-2">
              Daftar Calon Anggota Gandawesi <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
