'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { verifySertifikatPublic, PublicSertifikatVerificationResult } from '@/modules/governance/actions/governance';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import {
  Award,
  CheckCircle2,
  XCircle,
  Search,
  Printer,
  Copy,
  Check,
  Calendar,
  Sparkles,
  ShieldCheck,
  FileCheck,
  FileText,
  User,
  ExternalLink,
} from 'lucide-react';

function SertifikatValidatorContent() {
  const searchParams = useSearchParams();
  const initialNomor = searchParams.get('nomor') || searchParams.get('id') || 'GW/SK-DIKSAR/2024/001';

  const [inputNomor, setInputNomor] = useState(initialNomor);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PublicSertifikatVerificationResult | null>(null);
  const [copied, setCopied] = useState(false);

  const performVerification = async (nomor: string) => {
    if (!nomor.trim()) return;
    setLoading(true);
    const res = await verifySertifikatPublic(nomor);
    setResult(res);
    setLoading(false);
  };

  useEffect(() => {
    if (initialNomor) {
      performVerification(initialNomor);
    }
  }, [initialNomor]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performVerification(inputNomor);
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/verifikasi/sertifikat?nomor=${encodeURIComponent(inputNomor.trim())}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 md:py-16 space-y-8">
      {/* Brand Header */}
      <div className="text-center space-y-2 no-print">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300">
          <Award className="w-3.5 h-3.5" /> Portal Verifikasi Sertifikat &amp; Piagam Gandawesi
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight font-mono">
          VALIDASI E-SERTIFIKAT RESMI
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-lg mx-auto">
          Pemeriksaan keaslian nomor registrasi piagam penghargaan dan kelulusan kaderisasi Perhimpunan Mahasiswa Pecinta Alam Gandawesi FPTI UPI.
        </p>
      </div>

      {/* Verification Search Bar */}
      <Card className="p-4 sm:p-5 no-print space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Masukkan Nomor Registrasi Sertifikat (misal: GW/SK-DIKSAR/2024/001 atau nomor eksternal)..."
              value={inputNomor}
              onChange={(e) => setInputNomor(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !inputNomor.trim()}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm px-6"
          >
            {loading ? <Spinner size="sm" /> : 'Verifikasi Sertifikat'}
          </Button>
        </form>

        {/* Quick Sample Links */}
        <div className="flex items-center flex-wrap gap-1.5 pt-1 text-[11px] text-stone-500">
          <span className="font-semibold text-stone-400">Contoh pencarian:</span>
          <button
            type="button"
            onClick={() => {
              setInputNomor('042/SK-NIA/GW-FPTI/XII/2025');
              performVerification('042/SK-NIA/GW-FPTI/XII/2025');
            }}
            className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 text-stone-600 dark:text-stone-300 font-mono text-[10px] cursor-pointer transition-colors"
          >
            Internal GW (Kaderisasi)
          </button>
          <button
            type="button"
            onClick={() => {
              setInputNomor('BASARNAS/VR-SAR/JBR/2025/118');
              performVerification('BASARNAS/VR-SAR/JBR/2025/118');
            }}
            className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-950/40 text-stone-600 dark:text-stone-300 font-mono text-[10px] cursor-pointer transition-colors"
          >
            Eksternal (BASARNAS)
          </button>
          <button
            type="button"
            onClick={() => {
              setInputNomor('BBTNGGP/KONS/PIAGAM/X/2025/074');
              performVerification('BBTNGGP/KONS/PIAGAM/X/2025/074');
            }}
            className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/40 text-stone-600 dark:text-stone-300 font-mono text-[10px] cursor-pointer transition-colors"
          >
            Institusional (Taman Nasional)
          </button>
        </div>
      </Card>

      {/* Verification Results */}
      {loading ? (
        <div className="py-12 text-center space-y-3">
          <Spinner size="lg" />
          <p className="text-xs text-stone-500 font-mono">Menelusuri Buku Registrasi Sertifikat &amp; Piagam Gandawesi...</p>
        </div>
      ) : result?.isValid && result.data ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Certificate Card Preview */}
          <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-stone-950 via-[#0a1711] to-stone-950 border-2 border-amber-500/50 shadow-2xl space-y-6 text-white relative">
            {/* Top Org Header */}
            <div className="text-center space-y-1 border-b border-white/10 pb-4">
              <div className="w-12 h-12 rounded-xl bg-forest-900 border border-emerald-500 flex items-center justify-center font-black text-emerald-400 text-base mx-auto shadow-md">
                GW
              </div>
              <h4 className="text-xs font-black tracking-widest text-amber-300 uppercase font-mono mt-2">
                {result.data.asal === 'eksternal'
                  ? 'ARSIP REKOGNISI RESMI LEMBAGA EKSTERNAL'
                  : 'PERHIMPUNAN MAHASISWA PECINTA ALAM GANDAWESI'}
              </h4>
              <p className="text-[10px] text-emerald-400 font-medium tracking-wider">
                {result.data.asal === 'eksternal' && result.data.lembaga_penerbit
                  ? `DITERBITKAN OLEH: ${result.data.lembaga_penerbit.toUpperCase()}`
                  : 'FAKULTAS PENDIDIKAN TEKNOLOGI DAN KEJURUAN — UNIVERSITAS PENDIDIKAN INDONESIA'}
              </p>
            </div>

            {/* Validation Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-300 block uppercase tracking-wider text-[11px]">
                    {result.data.asal === 'eksternal'
                      ? 'ARSIP PRESTASI &amp; REKOGNISI EKSTERNAL SAH'
                      : 'PIAGAM / SERTIFIKAT TERDAFTAR SAH'}
                  </span>
                  <span className="text-[10px] text-emerald-400/80">
                    {result.data.asal === 'eksternal'
                      ? `Tercatat resmi dalam Buku Arsip Prestasi & Kemitraan Eksternal Gandawesi FPTI UPI.`
                      : `Tercatat resmi dalam lembar Surat Keputusan & Buku Register Organisasi.`}
                  </span>
                </div>
              </div>
              <div className="text-right sm:self-center">
                <span className="text-[9px] text-stone-400 block font-mono">No. Registrasi:</span>
                <span className="font-mono text-xs font-bold text-amber-300 bg-black/40 px-2 py-0.5 rounded border border-amber-500/30 inline-block">
                  {result.data.nomor_sertifikat}
                </span>
              </div>
            </div>

            {/* Certificate Body */}
            <div className="space-y-4 text-center py-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 inline-block">
                {result.data.jenis}
              </span>

              <h2 className="text-xl sm:text-2xl font-black text-white font-serif tracking-wide">
                {result.data.judul}
              </h2>

              <div className="space-y-1 py-2">
                <p className="text-xs text-stone-400 italic">
                  {result.data.penerima_tipe === 'organisasi'
                    ? 'Dianugerahkan secara institusional kepada:'
                    : result.data.asal === 'eksternal'
                    ? 'Dianugerahkan kepada Delegasi Resmi Gandawesi:'
                    : 'Dianugerahkan secara resmi kepada:'}
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-amber-200 tracking-tight">
                  {result.data.anggota_nama}
                </h3>
                {result.data.anggota_nia ? (
                  <p className="text-xs font-mono text-emerald-400 font-bold">
                    NIA: {result.data.anggota_nia}
                  </p>
                ) : result.data.penerima_tipe === 'organisasi' ? (
                  <p className="text-xs font-semibold text-emerald-400">
                    Organisasi Mahasiswa Pencinta Alam — FPTI UPI
                  </p>
                ) : null}
              </div>

              {result.data.deskripsi && (
                <p className="text-xs text-stone-300 max-w-lg mx-auto leading-relaxed italic bg-black/40 p-3 rounded-xl border border-white/5">
                  &quot;{result.data.deskripsi}&quot;
                </p>
              )}

              {/* Scanned Physical File Banner */}
              {result.data.file && (
                <div className="p-3 bg-stone-900/90 rounded-xl border border-sky-500/30 flex items-center justify-between gap-3 text-left max-w-lg mx-auto">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-sky-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-stone-200">Berkas Pindaian (Scan) Fisik Asli</p>
                      <p className="text-[10px] text-stone-400">Terarsip permanen di server dokumen Gandawesi</p>
                    </div>
                  </div>
                  <a
                    href={result.data.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  >
                    Buka Scan Asli <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Signatures & Seal */}
            <div className="pt-4 flex items-end justify-between text-left text-[10px] text-stone-400 border-t border-white/10">
              <div className="space-y-0.5">
                <p>Bandung, {result.data.tanggal_terbit}</p>
                <p className="font-bold text-white">
                  {result.data.asal === 'eksternal' ? 'Arsip Prestasi & Rekognisi' : 'Dewan Pengurus Gandawesi'}
                </p>
                <div className="w-20 h-9 border border-emerald-500/30 rounded flex items-center justify-center text-[8px] text-emerald-400 font-mono mt-1">
                  ✓ TERCATAT RESMI
                </div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full border-2 border-amber-500/60 flex items-center justify-center font-serif text-[9px] font-black text-amber-300 bg-amber-950/40 shadow-lg">
                  SEGEL RESMI
                </div>
              </div>

              <div className="text-right space-y-0.5">
                <p>{result.data.asal === 'eksternal' ? 'Lembaga Penyelenggara:' : 'Mengesahkan,'}</p>
                <p className="font-bold text-white">
                  {result.data.asal === 'eksternal' ? (result.data.lembaga_penerbit || 'Pihak Luar') : result.data.pengesah_jabatan}
                </p>
                <p className="text-[11px] text-amber-300 font-semibold">{result.data.pengesah_nama}</p>
                <div className="w-20 h-9 border border-emerald-500/30 rounded flex items-center justify-center text-[8px] text-emerald-400 font-mono mt-1 ml-auto">
                  ✓ TERVERIFIKASI
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 no-print">
            <div className="text-xs text-stone-500 dark:text-stone-400">
              Validasi diterbitkan oleh Sistem Informasi Manajemen Gandawesi FPTI UPI.
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="flex-1 sm:flex-none text-xs gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Tautan Disalin!' : 'Salin Tautan'}
              </Button>

              <Button
                size="sm"
                onClick={() => window.print()}
                className="flex-1 sm:flex-none text-xs gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
              >
                <Printer className="w-3.5 h-3.5" /> Cetak Piagam
              </Button>
            </div>
          </div>
        </div>
      ) : result && !result.isValid ? (
        <Card className="p-8 text-center space-y-4 border-rose-500/30 bg-rose-50/20 dark:bg-rose-950/10">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-800">
            <XCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Nomor Sertifikat Tidak Terdaftar
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              {result.message}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setInputNomor('042/SK-NIA/GW-FPTI/XII/2025');
                performVerification('042/SK-NIA/GW-FPTI/XII/2025');
              }}
              className="text-xs font-semibold text-forest-700 dark:text-forest-300"
            >
              Coba Internal Gandawesi
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setInputNomor('BBTNGGP/KONS/PIAGAM/X/2025/074');
                performVerification('BBTNGGP/KONS/PIAGAM/X/2025/074');
              }}
              className="text-xs font-semibold text-amber-700 dark:text-amber-300"
            >
              Coba Penghargaan Balai TN
            </Button>
          </div>
        </Card>
      ) : null}

      {/* Back to Home CTA */}
      <div className="text-center pt-4 no-print">
        <Link
          href="/"
          className="text-xs text-stone-500 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors"
        >
          ← Kembali ke Beranda Utama Gandawesi
        </Link>
      </div>
    </div>
  );
}

export default function VerifikasiSertifikatPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <Spinner size="lg" />
          <p className="text-xs text-stone-400 mt-2 font-mono">Memuat portal verifikasi sertifikat...</p>
        </div>
      }
    >
      <SertifikatValidatorContent />
    </Suspense>
  );
}
