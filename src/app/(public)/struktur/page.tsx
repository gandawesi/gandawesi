'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import {
  Users,
  Shield,
  Award,
  Crown,
  Briefcase,
  Compass,
  Calendar,
  Sparkles,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';
import { fetchPublicStrukturOrganisasi } from '@/lib/actions/governance';
import type { StrukturOrganisasiPublicData, JabatanOrganisasiItem, DewanPenasehatItem } from '@/lib/types/governance';

export default function PublicStrukturOrganisasiPage() {
  const [data, setData] = useState<StrukturOrganisasiPublicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('2024–2025');

  useEffect(() => {
    async function load() {
      setLoading(false);
      const res = await fetchPublicStrukturOrganisasi();
      setData(res);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-14">
      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-500/10 dark:bg-forest-500/20 text-forest-700 dark:text-forest-400 text-xs font-bold border border-forest-500/30">
          <Shield className="w-3.5 h-3.5" /> Tata Kelola & Kepemimpinan
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-stone-900 dark:text-stone-100 font-mono">
          STRUKTUR ORGANISASI
        </h1>
        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed">
          Dewan Pengurus dan Dewan Penasehat Perhimpunan Mahasiswa Pecinta Alam Gandawesi Fakultas Pendidikan Teknologi dan Kejuruan (FPTI) Universitas Pendidikan Indonesia.
        </p>

        {/* Period Selector Tabs */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {['2024–2025', '2023–2024'].map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedPeriod === p
                  ? 'bg-forest-700 text-white shadow-md'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              Periode {p} {p === '2024–2025' ? '(Aktif)' : '(Arsip)'}
            </button>
          ))}
        </div>
      </div>

      {loading || !data ? (
        <div className="py-24 flex flex-col items-center justify-center text-stone-400">
          <Spinner className="w-8 h-8 text-forest-600 mb-3" />
          <p className="text-sm font-medium">Memuat struktur organisasi resmi...</p>
        </div>
      ) : (
        <div className="space-y-16">
          {/* ============================================================ */}
          {/* 1. PIMPINAN TERTINGGI (KETUA & WAKIL)                        */}
          {/* ============================================================ */}
          <section className="space-y-6">
            <div className="flex items-center justify-center gap-3">
              <div className="h-px bg-stone-300 dark:bg-stone-800 flex-1" />
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/30">
                <Crown className="w-4 h-4" /> Pimpinan Tertinggi Organisasi
              </div>
              <div className="h-px bg-stone-300 dark:bg-stone-800 flex-1" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {data.pimpinan.map((leader) => (
                <Card
                  key={leader.id}
                  className="p-6 sm:p-7 relative overflow-hidden bg-gradient-to-br from-white to-stone-50 dark:from-stone-900/90 dark:to-stone-950 border-2 border-amber-500/30 shadow-xl hover:border-amber-500/60 transition-all group"
                >
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-forest-800 to-forest-950 text-emerald-300 border-2 border-forest-600 flex items-center justify-center font-black text-xl shrink-0 shadow-lg">
                      {leader.anggota_nama.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                        {leader.jabatan}
                      </span>
                      <h3 className="text-lg font-black text-stone-900 dark:text-stone-100 truncate mt-1">
                        {leader.anggota_nama}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-stone-500 font-mono">
                        <span className="text-forest-600 dark:text-forest-400 font-bold">
                          {leader.anggota_nia || 'NIA Terdaftar'}
                        </span>
                        <span>•</span>
                        <span>Angkatan {leader.nomor_angkatan || 32} ({leader.nama_angkatan || 'Giri Wardhana'})</span>
                      </div>
                    </div>
                  </div>

                  {leader.catatan && (
                    <p className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300 italic leading-relaxed">
                      "{leader.catatan}"
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </section>

          {/* ============================================================ */}
          {/* 2. BADAN PENGURUS HARIAN (BPH)                              */}
          {/* ============================================================ */}
          <section className="space-y-6">
            <div className="flex items-center justify-center gap-3">
              <div className="h-px bg-stone-300 dark:bg-stone-800 flex-1" />
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/30">
                <Briefcase className="w-4 h-4" /> Badan Pengurus Harian (BPH)
              </div>
              <div className="h-px bg-stone-300 dark:bg-stone-800 flex-1" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
              {data.bph.map((item) => (
                <Card
                  key={item.id}
                  className="p-5 bg-white/80 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 hover:border-emerald-500/40 transition-all flex items-center gap-4"
                >
                  <div className="w-13 h-13 rounded-2xl bg-forest-100 dark:bg-forest-950 text-forest-700 dark:text-forest-300 border border-forest-300 dark:border-forest-800 flex items-center justify-center font-bold text-base shrink-0">
                    {item.anggota_nama.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                      {item.jabatan}
                    </span>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                      {item.anggota_nama}
                    </h4>
                    <p className="text-[11px] text-stone-500 font-mono">
                      {item.anggota_nia || 'NIA Terdaftar'} • Angkatan {item.nomor_angkatan || 32}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* ============================================================ */}
          {/* 3. DIVISI OPERASIONAL & KADERISASI                          */}
          {/* ============================================================ */}
          <section className="space-y-6">
            <div className="flex items-center justify-center gap-3">
              <div className="h-px bg-stone-300 dark:bg-stone-800 flex-1" />
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3.5 py-1.5 rounded-full border border-indigo-500/30">
                <Compass className="w-4 h-4" /> Divisi Operasional & Kaderisasi
              </div>
              <div className="h-px bg-stone-300 dark:bg-stone-800 flex-1" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {data.divisi_operasional.map((op) => (
                <Card
                  key={op.id}
                  className="p-5 bg-white/70 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 hover:border-indigo-500/40 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      {op.divisi || 'Divisi'}
                    </span>
                    <span className="text-[10px] font-mono text-stone-400">
                      {op.anggota_nia || '-'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    {op.jabatan}
                  </h4>
                  <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {op.anggota_nama}
                  </p>
                  <p className="text-[11px] text-stone-500 leading-tight">
                    Angkatan {op.nomor_angkatan || 32} — {op.nama_angkatan || 'Giri Wardhana'}
                  </p>
                </Card>
              ))}
            </div>
          </section>

          {/* ============================================================ */}
          {/* 4. DEWAN PENASEHAT (ALUMNI / ANGGOTA LUAR BIASA)             */}
          {/* ============================================================ */}
          <section className="space-y-6 pt-6">
            <div className="flex items-center justify-center gap-3">
              <div className="h-px bg-stone-300 dark:bg-stone-800 flex-1" />
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/30">
                <Sparkles className="w-4 h-4" /> Dewan Penasehat Organisasi (Alumni)
              </div>
              <div className="h-px bg-stone-300 dark:bg-stone-800 flex-1" />
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950/20 via-stone-900/60 to-forest-950/20 border-2 border-amber-500/30 space-y-6">
              <div className="max-w-2xl">
                <span className="text-xs font-bold text-amber-500 uppercase tracking-wider block">
                  AD/ART Gandawesi:
                </span>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed mt-1">
                  Dewan Penasehat merupakan badan pertimbangan moral, keilmuan, dan jaringan kehormatan yang <strong>dipilih khusus dari para Anggota Luar Biasa (alumni)</strong> yang telah menyelesaikan masa studi akademik di UPI.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {data.dewan_penasehat.map((advisor) => (
                  <Card
                    key={advisor.id}
                    className="p-5 bg-stone-900/90 border border-amber-500/30 space-y-2 hover:border-amber-500/60 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                        Dewan Penasehat
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white leading-snug">
                      {advisor.anggota_nama}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-stone-400 font-mono pt-0.5">
                      <span className="text-amber-300 font-bold">{advisor.anggota_nia}</span>
                      <span>•</span>
                      <span>Angkatan {advisor.nomor_angkatan} ({advisor.nama_angkatan})</span>
                    </div>
                    {advisor.catatan && (
                      <p className="text-[11px] text-stone-300 bg-black/40 p-2.5 rounded-xl border border-stone-800 leading-relaxed">
                        {advisor.catatan}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Bottom CTA */}
          <div className="text-center pt-8 border-t border-stone-200 dark:border-stone-800">
            <Link
              href="/daftar"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-forest-700 hover:bg-forest-600 text-white text-sm font-bold shadow-lg shadow-forest-950/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              Bergabung Menjadi Kader Gandawesi <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
