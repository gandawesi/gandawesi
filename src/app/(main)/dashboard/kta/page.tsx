'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import {
  Award,
  ShieldCheck,
  QrCode,
  Printer,
  Download,
  RotateCw,
  Lock,
  Compass,
  Sparkles,
  ArrowRight,
  FileText,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { fetchMyKTADigital } from '@/lib/actions/governance';
import type { KTADigitalData } from '@/lib/types/governance';

export default function KTADigitalPage() {
  const [kta, setKta] = useState<KTADigitalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [side, setSide] = useState<'front' | 'back'>('front');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetchMyKTADigital();
      setKta(res);
      setLoading(false);
    }
    load();
  }, []);

  if (loading || !kta) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-stone-400">
        <Spinner className="w-8 h-8 text-emerald-500 mb-3" />
        <p className="text-sm font-medium">Memuat data Kartu Tanda Anggota (KTA) resmi...</p>
      </div>
    );
  }

  // ============================================================
  // GATED ACCESS: IF MEMBER DOES NOT HAVE NIA YET
  // ============================================================
  if (!kta.has_nia) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 space-y-8">
        <Card className="p-8 sm:p-10 bg-slate-900/80 border-2 border-amber-500/30 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Akses KTA Terbatas (Gated)
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Memerlukan Nomor Induk Anggota (NIA)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-2">
              Kartu Tanda Anggota (KTA) Digital resmi hanya diterbitkan bagi anggota yang telah menyelesaikan seluruh tahapan pembinaan <strong>PPNIA (~1 Tahun)</strong> dan dikukuhkan secara aklamasi dalam Sidang Pleno Dewan Pengurus.
            </p>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-left max-w-md mx-auto space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Status Anda Saat Ini:
            </span>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-200 font-semibold">{kta.nama}</span>
              <span className="text-amber-400 font-bold capitalize bg-amber-500/10 px-2 py-0.5 rounded">
                {kta.status_keanggotaan.replace('_', ' ')}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Angkatan: {kta.nomor_angkatan ? `Angkatan ${kta.nomor_angkatan} (${kta.nama_angkatan})` : 'Dalam Proses'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/dashboard/ppnia">
              <Button variant="primary" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-5 py-2.5">
                <Compass className="w-4 h-4 mr-1.5" /> Pantau Progres PPNIA Saya
              </Button>
            </Link>
            <Link href="/dashboard/kaderisasi">
              <Button variant="secondary" className="text-xs px-5 py-2.5">
                Lihat Alur Kaderisasi <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // ============================================================
  // UNGATED VIEW: OFFICIAL DIGITAL KTA (FRONT & BACK)
  // ============================================================
  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Identitas Resmi Keanggotaan
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              {kta.nia}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 tracking-tight mt-1 font-mono">
            KARTU TANDA ANGGOTA (KTA)
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
            Kartu identitas resmi keanggotaan penuh Perhimpunan Mahasiswa Pecinta Alam Gandawesi FPTI UPI.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="secondary"
            onClick={() => setSide(side === 'front' ? 'back' : 'front')}
            className="text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            {side === 'front' ? 'Lihat Tampak Belakang' : 'Lihat Tampak Depan'}
          </Button>

          <Button
            variant="primary"
            onClick={() => window.print()}
            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak KTA
          </Button>
        </div>
      </div>

      {/* Main KTA Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Card Canvas */}
        <div className="lg:col-span-8 flex flex-col items-center">
          {/* Card Toggle Tabs */}
          <div className="flex items-center gap-1 p-1 bg-stone-200 dark:bg-stone-800 rounded-xl mb-6 text-xs font-bold">
            <button
              onClick={() => setSide('front')}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                side === 'front'
                  ? 'bg-white dark:bg-stone-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              Tampak Depan (Identitas)
            </button>
            <button
              onClick={() => setSide('back')}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                side === 'back'
                  ? 'bg-white dark:bg-stone-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              Tampak Belakang (Kode Etik)
            </button>
          </div>

          {/* ============================================================ */}
          {/* SIDE 1: TAMPAK DEPAN                                         */}
          {/* ============================================================ */}
          {side === 'front' && (
            <div className="w-full max-w-[540px] aspect-[1.586/1] rounded-3xl p-6 sm:p-7 relative overflow-hidden bg-gradient-to-br from-stone-900 via-[#07160f] to-slate-950 border-2 border-amber-500/50 shadow-2xl shadow-emerald-950/40 flex flex-col justify-between transition-all select-none">
              {/* Decorative Hologram Blobs */}
              <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

              {/* Card Header */}
              <div className="relative z-10 flex items-start justify-between border-b border-white/10 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-forest-900/90 border border-emerald-500/60 flex items-center justify-center font-black text-emerald-300 text-sm tracking-widest shadow-inner">
                    GW
                  </div>
                  <div>
                    <h4 className="text-[11px] sm:text-xs font-black tracking-wider text-white uppercase font-mono">
                      GANDAWESI FPTI UPI
                    </h4>
                    <p className="text-[9px] sm:text-[10px] text-emerald-400 font-medium tracking-wide">
                      Perhimpunan Mahasiswa Pecinta Alam
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                    {kta.status_keanggotaan === 'anggota_luar_biasa' ? 'Anggota Luar Biasa' : 'Anggota Biasa'}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="relative z-10 my-auto py-3 flex items-center gap-5">
                <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl bg-gradient-to-br from-forest-800 to-emerald-950 border-2 border-amber-500/40 flex items-center justify-center text-emerald-200 text-2xl font-black shrink-0 shadow-lg">
                  {kta.nama.slice(0, 2).toUpperCase()}
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    Nama Anggota
                  </p>
                  <h3 className="text-base sm:text-lg font-black text-white tracking-tight truncate">
                    {kta.nama}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-300 font-mono pt-0.5">
                    <span className="text-emerald-400 font-semibold">
                      Angkatan {kta.nomor_angkatan || 32}
                    </span>
                    <span>•</span>
                    <span className="text-slate-400">{kta.nama_angkatan || 'Giri Wardhana'}</span>
                  </div>
                  {kta.jurusan && (
                    <p className="text-[10px] text-slate-400 truncate">
                      {kta.jurusan} {kta.nim ? `(${kta.nim})` : ''}
                    </p>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="relative z-10 pt-3 border-t border-white/10 flex items-end justify-between gap-4">
                <div>
                  <span className="text-[8px] sm:text-[9px] font-bold text-amber-400/90 uppercase tracking-widest block mb-0.5">
                    Nomor Induk Anggota (NIA)
                  </span>
                  <div className="font-mono text-base sm:text-xl font-extrabold tracking-widest text-amber-300 bg-amber-950/40 px-3 py-1 rounded-xl border border-amber-500/30 inline-block">
                    {kta.nia}
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1">
                    Diterbitkan: {kta.tanggal_terbit || '2025-12-20'}
                  </p>
                </div>

                <div className="p-1.5 bg-white/5 rounded-xl border border-white/10 shrink-0 text-center">
                  <QrCode className="w-8 h-8 sm:w-9 sm:h-9 text-slate-300 mx-auto" />
                  <span className="text-[7px] font-mono text-slate-400 mt-0.5 block">VERIFIED</span>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* SIDE 2: TAMPAK BELAKANG                                      */}
          {/* ============================================================ */}
          {side === 'back' && (
            <div className="w-full max-w-[540px] aspect-[1.586/1] rounded-3xl p-6 sm:p-7 relative overflow-hidden bg-gradient-to-br from-[#0c1310] via-stone-900 to-slate-950 border-2 border-emerald-500/40 shadow-2xl shadow-emerald-950/40 flex flex-col justify-between transition-all select-none">
              <div className="relative z-10 border-b border-white/10 pb-2 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 font-mono">
                  IKRAR KODE ETIK PECINTA ALAM
                </span>
                <span className="text-[9px] font-mono text-slate-500">KTA-GW-BACK</span>
              </div>

              <div className="relative z-10 my-auto py-2 space-y-2 text-[10px] sm:text-[11px] text-slate-300 leading-relaxed italic">
                <p>
                  "1. Pecinta Alam Indonesia sadar bahwa alam beserta isinya adalah ciptaan Tuhan Yang Maha Esa."
                </p>
                <p>
                  "2. Pecinta Alam Indonesia sebagai bagian dari masyarakat sadar akan tanggung jawabnya kepada Tuhan, bangsa, dan tanah air."
                </p>
                <p>
                  "3. Pecinta Alam Indonesia sadar bahwa segenap pecinta alam adalah saudara sebagai sesama makhluk yang mencintai alam."
                </p>
              </div>

              <div className="relative z-10 pt-2 border-t border-white/10 flex items-end justify-between text-[9px] text-slate-400">
                <div className="space-y-0.5 max-w-[260px]">
                  <p className="font-bold text-white text-[10px]">SEKRETARIAT GANDAWESI FPTI UPI</p>
                  <p>Gedung PKM FPTI UPI, Jl. Dr. Setiabudhi No. 229, Bandung</p>
                  <p className="text-[8px] text-slate-500">Kartu ini sah & berlaku permanen seumur hidup.</p>
                </div>

                <div className="text-right shrink-0">
                  <div className="w-16 h-8 border border-emerald-500/30 rounded-lg flex items-center justify-center font-mono text-[8px] text-emerald-400/80 bg-emerald-950/30">
                    [ TTD KETUA ]
                  </div>
                  <span className="text-[8px] font-semibold text-slate-300 block mt-0.5">Dewan Pengurus</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Details Card */}
        <div className="lg:col-span-4 space-y-5">
          <Card className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Validitas KTA Resmi
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Nomor Induk Anggota (NIA)</span>
                <span className="font-mono font-bold text-stone-900 dark:text-stone-100 text-sm text-emerald-600 dark:text-emerald-400">
                  {kta.nia}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Nama Lengkap</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">{kta.nama}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Tingkat Keanggotaan</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400 capitalize">
                  {kta.status_keanggotaan.replace('_', ' ')}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Masa Berlaku</span>
                <span className="font-semibold text-stone-700 dark:text-stone-300">
                  Seumur Hidup (Permanen)
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Kode Verifikasi QR</span>
                <span className="font-mono text-[10px] text-stone-500 break-all">{kta.qr_code_hash}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
              <Link
                href="/dashboard/sertifikat"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-forest-50 dark:bg-forest-950/50 text-forest-700 dark:text-forest-300 font-bold text-xs hover:bg-forest-100 dark:hover:bg-forest-900 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" /> Lihat Koleksi Sertifikat Saya
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
