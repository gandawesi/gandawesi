'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { verifyKTAPublic, PublicKTAVerificationResult } from '@/modules/governance/actions/governance';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Search,
  Printer,
  Copy,
  Check,
  ArrowRight,
  GraduationCap,
  Calendar,
  Sparkles,
} from 'lucide-react';

function KTAValidatorContent() {
  const searchParams = useSearchParams();
  const initialNia = searchParams.get('nia') || searchParams.get('code') || '32.235';

  const [inputNia, setInputNia] = useState(initialNia);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PublicKTAVerificationResult | null>(null);
  const [copied, setCopied] = useState(false);

  const performVerification = async (nia: string) => {
    if (!nia.trim()) return;
    setLoading(true);
    const res = await verifyKTAPublic(nia);
    setResult(res);
    setLoading(false);
  };

  useEffect(() => {
    if (initialNia) {
      performVerification(initialNia);
    }
  }, [initialNia]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performVerification(inputNia);
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/verifikasi/kta?nia=${encodeURIComponent(inputNia.trim())}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 md:py-16 space-y-8">
      {/* Brand Header */}
      <div className="text-center space-y-2 no-print">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 dark:bg-forest-950/60 border border-forest-200 dark:border-forest-800 text-xs font-bold text-forest-800 dark:text-forest-300">
          <ShieldCheck className="w-3.5 h-3.5" /> Portal Verifikasi Resmi Gandawesi
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight font-mono">
          VALIDASI KARTU TANDA ANGGOTA (KTA)
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-lg mx-auto">
          Pemeriksaan keaslian dan status aktif anggota resmi Perhimpunan Mahasiswa Pecinta Alam Gandawesi FPTI UPI.
        </p>
      </div>

      {/* Verification Search Bar */}
      <Card className="p-4 sm:p-5 no-print">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Masukkan Nomor Induk Anggota (misal: 32.235) atau Kode KTA..."
              value={inputNia}
              onChange={(e) => setInputNia(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !inputNia.trim()}
            className="bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs sm:text-sm px-6"
          >
            {loading ? <Spinner size="sm" /> : 'Verifikasi KTA'}
          </Button>
        </form>
      </Card>

      {/* Verification Results */}
      {loading ? (
        <div className="py-12 text-center space-y-3">
          <Spinner size="lg" />
          <p className="text-xs text-stone-500 font-mono">Menghubungkan ke Buku Induk Keanggotaan Gandawesi...</p>
        </div>
      ) : result?.isValid && result.data ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Certificate Card */}
          <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white via-white to-forest-50/40 dark:from-[#0c1410] dark:via-[#0c1410] dark:to-[#112017] border-2 border-emerald-500/30 shadow-2xl space-y-6">
            {/* Status Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-200/80 dark:border-stone-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    KTA RESMI TERVERIFIKASI
                  </span>
                  <h2 className="text-lg font-bold text-stone-900 dark:text-white mt-1">
                    Anggota Sah &amp; Berstatus Aktif
                  </h2>
                </div>
              </div>

              <div className="text-right sm:self-center">
                <span className="text-[10px] text-stone-400 block uppercase font-bold">Kode Verifikasi</span>
                <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-500/20 inline-block">
                  {result.data.qr_code_hash}
                </span>
              </div>
            </div>

            {/* Member Details */}
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              {/* Member Photo */}
              <div className="w-24 h-32 rounded-2xl bg-gradient-to-br from-forest-800 to-emerald-950 border-2 border-amber-500/40 overflow-hidden flex items-center justify-center text-emerald-200 text-3xl font-black shrink-0 shadow-lg">
                {result.data.foto_profil ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={result.data.foto_profil}
                    alt={result.data.nama}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  result.data.nama.slice(0, 2).toUpperCase()
                )}
              </div>

              {/* Data Grid */}
              <div className="space-y-3 flex-1 text-center sm:text-left">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                    Nama Lengkap Anggota
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white">
                    {result.data.nama}
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 text-xs">
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800/80">
                    <span className="text-[10px] text-stone-400 block font-bold uppercase">Nomor Induk (NIA)</span>
                    <span className="font-mono text-sm font-black text-amber-600 dark:text-amber-400">
                      {result.data.nia}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800/80">
                    <span className="text-[10px] text-stone-400 block font-bold uppercase">Tingkat Anggota</span>
                    <span className="font-bold text-stone-900 dark:text-stone-100 capitalize">
                      {result.data.status_keanggotaan.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800/80 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-stone-400 block font-bold uppercase">Angkatan</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      Angkatan {result.data.nomor_angkatan || '-'} ({result.data.nama_angkatan})
                    </span>
                  </div>
                </div>

                {(result.data.jurusan || result.data.nim) && (
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-stone-500 dark:text-stone-400 pt-1">
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-forest-600" />
                      <span>{result.data.jurusan} {result.data.nim ? `(${result.data.nim})` : ''}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-forest-600" />
                      <span>Pengukuhan: {result.data.tanggal_terbit}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Official Seal Note */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200 text-xs leading-relaxed flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                Data keanggotaan ini terverifikasi secara autentik dan tercatat sah dalam <strong>Buku Induk Keanggotaan Perhimpunan Mahasiswa Pecinta Alam Gandawesi FPTI UPI</strong>. Berlaku sebagai bukti identitas dan legitimasi kegiatan alam terbuka.
              </span>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center justify-between gap-3 no-print">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="text-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                {copied ? 'Tautan Tersalin!' : 'Salin Tautan Verifikasi'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="text-xs"
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" /> Cetak Lembar Validasi
              </Button>
            </div>

            <Link href="/tentang">
              <Button variant="ghost" size="sm" className="text-xs text-stone-500 hover:text-stone-900">
                Profil Lengkap Gandawesi <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      ) : result && !result.isValid ? (
        <Card className="p-8 sm:p-10 text-center space-y-4 border-2 border-rose-500/30">
          <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
            <XCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-stone-900 dark:text-white">
              KTA Tidak Ditemukan atau Belum Sah
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
              {result.message}
            </p>
          </div>
          <p className="text-[11px] text-stone-400">
            Pastikan format NIA sudah tepat (misal: <code>32.235</code>). Jika anggota baru saja menyelesaikan PPNIA, pastikan SK pengukuhan sudah diterbitkan oleh Dewan Pengurus.
          </p>
        </Card>
      ) : null}
    </div>
  );
}

export default function PublicKTAVerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <p className="text-xs text-stone-500">Memuat portal verifikasi KTA...</p>
        </div>
      }
    >
      <KTAValidatorContent />
    </Suspense>
  );
}
