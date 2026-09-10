import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Compass,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getRuteEkspedisiList } from '@/lib/actions/content';
import ExpeditionExplorer from '@/modules/artikel/components/ExpeditionExplorer';

export const metadata: Metadata = {
  title: 'Peta Rute & Rekam Jejak Ekspedisi — Gandawesi FPTI UPI',
  description:
    'Peta interaktif GIS topografi jalur ekspedisi gunung rimba, penelusuran gua bawah tanah, arung jeram arus deras, dan pemetaan jalur alam terbuka perhimpunan mahasiswa pecinta alam Gandawesi.',
};

export default async function PublicEkspedisiPage() {
  const routes = await getRuteEkspedisiList();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 dark:bg-forest-950/60 border border-forest-200 dark:border-forest-800 text-xs font-bold text-forest-800 dark:text-forest-300">
          <Compass className="w-3.5 h-3.5" /> Eksplorasi Alam & Topografi GIS
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100 font-mono">
          PETA & REKAM JEJAK EKSPEDISI
        </h1>
        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed">
          Peta topografi interaktif OpenStreetMap, koordinat GPS pos survei, dan dokumentasi penjelajahan alam terbuka oleh kader Gandawesi FPTI UPI.
        </p>
      </div>

      {/* Interactive Explorer & Map */}
      <ExpeditionExplorer initialRoutes={routes} />

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
