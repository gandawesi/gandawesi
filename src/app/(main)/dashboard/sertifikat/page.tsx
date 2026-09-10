'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import {
  Award,
  FileCheck,
  Calendar,
  Download,
  Printer,
  ExternalLink,
  Search,
  Sparkles,
  ShieldCheck,
  X,
  Eye,
  Building2,
  FileText,
  Compass,
} from 'lucide-react';
import { fetchMySertifikatList } from '@/lib/actions/governance';
import type { SertifikatItem } from '@/lib/types/governance';

export default function MemberSertifikatPage() {
  const [list, setList] = useState<SertifikatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tabFilter, setTabFilter] = useState<'semua' | 'internal' | 'eksternal'>('semua');
  const [previewItem, setPreviewItem] = useState<SertifikatItem | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetchMySertifikatList();
      setList(res);
      setLoading(false);
    }
    load();
  }, []);

  const countInternal = list.filter((s) => s.asal !== 'eksternal').length;
  const countExternal = list.filter((s) => s.asal === 'eksternal').length;

  const filtered = list.filter((s) => {
    // Tab filter
    if (tabFilter === 'internal' && s.asal === 'eksternal') return false;
    if (tabFilter === 'eksternal' && s.asal !== 'eksternal') return false;

    // Search query
    const q = search.toLowerCase();
    return (
      s.judul.toLowerCase().includes(q) ||
      s.jenis.toLowerCase().includes(q) ||
      s.nomor_sertifikat.toLowerCase().includes(q) ||
      (s.lembaga_penerbit && s.lembaga_penerbit.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Rekam Jejak Prestasi &amp; Kelulusan
            </span>
            <span className="text-xs font-mono font-bold text-stone-500 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-full">
              {list.length} Arsip Sertifikat
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 tracking-tight mt-1 font-mono">
            SERTIFIKAT &amp; PENCAPAIAN
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
            Kumpulan sertifikat kelulusan kaderisasi Gandawesi FPTI UPI serta piagam pelatihan/kompetisi dari lembaga eksternal luar kampus.
          </p>
        </div>

        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Cari sertifikat atau penerbit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setTabFilter('semua')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
            tabFilter === 'semua'
              ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-sm'
              : 'bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
          }`}
        >
          Semua Koleksi ({list.length})
        </button>
        <button
          onClick={() => setTabFilter('internal')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
            tabFilter === 'internal'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          Internal Gandawesi ({countInternal})
        </button>
        <button
          onClick={() => setTabFilter('eksternal')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
            tabFilter === 'eksternal'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          Eksternal &amp; Delegasi ({countExternal})
        </button>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-stone-400">
          <Spinner className="w-8 h-8 text-emerald-500 mb-3" />
          <p className="text-sm font-medium">Memuat berkas sertifikat Anda...</p>
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center space-y-3 bg-white/50 dark:bg-stone-900/50">
          <FileCheck className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto" />
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Tidak ada sertifikat yang ditemukan
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {tabFilter === 'eksternal'
              ? 'Belum ada catatan piagam penghargaan atau sertifikasi eksternal yang diarsipkan untuk akun Anda.'
              : 'Sertifikat resmi akan diterbitkan oleh pengurus setelah Anda menyelesaikan setiap tahapan kegiatan kaderisasi.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => {
            const isEksternal = item.asal === 'eksternal';
            return (
              <Card
                key={item.id}
                className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-4 group shadow-sm hover:shadow-md relative overflow-hidden"
              >
                {/* Top Badge Strip */}
                {isEksternal && (
                  <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-sky-500 to-indigo-500" />
                )}

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    {isEksternal ? (
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> Eksternal
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {item.jenis.split('—')[0].trim()}
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-[10px] text-stone-400">
                      <Calendar className="w-3 h-3" /> {item.tanggal_terbit}
                    </div>
                  </div>

                  <h3 className="text-sm font-black text-stone-900 dark:text-stone-100 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {item.judul}
                  </h3>

                  {isEksternal && item.lembaga_penerbit && (
                    <div className="text-[11px] font-medium text-stone-600 dark:text-stone-400 flex items-center gap-1.5 bg-sky-50/50 dark:bg-sky-950/20 p-2 rounded-lg border border-sky-100 dark:border-sky-900/40">
                      <Building2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                      <span className="truncate">{item.lembaga_penerbit}</span>
                    </div>
                  )}

                  <p className="text-[10px] font-mono text-stone-500 bg-stone-100 dark:bg-stone-950 px-2.5 py-1 rounded-lg border border-stone-200/60 dark:border-stone-800 inline-block">
                    No: {item.nomor_sertifikat}
                  </p>

                  {item.deskripsi && (
                    <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2">
                      {item.deskripsi}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPreviewItem(item)}
                    className="flex-1 text-xs py-1.5 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> Pratinjau
                  </Button>
                  {item.file ? (
                    <a
                      href={item.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900 transition-colors cursor-pointer"
                      title="Buka Berkas Pindaian Fisik"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  ) : (
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="p-2 rounded-xl bg-forest-50 dark:bg-forest-950/50 text-forest-600 dark:text-forest-400 hover:bg-forest-100 dark:hover:bg-forest-900 transition-colors cursor-pointer"
                      title="Lihat Piagam"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* PREVIEW CERTIFICATE MODAL                                   */}
      {/* ============================================================ */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border-2 border-amber-500/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-full bg-stone-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Certificate Paper Frame */}
            <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-stone-950 via-[#0d1c14] to-stone-950 border-4 border-double border-amber-500/50 space-y-6 text-center shadow-inner">
              {/* Logo & Org Header */}
              <div className="space-y-1">
                <div className="w-12 h-12 rounded-xl bg-forest-900 border border-emerald-500 flex items-center justify-center font-black text-emerald-400 text-lg mx-auto shadow-md">
                  GW
                </div>
                <h4 className="text-xs font-black tracking-widest text-amber-300 uppercase font-mono mt-2">
                  {previewItem.asal === 'eksternal'
                    ? 'REKOGNISI RESMI DARI LEMBAGA EKSTERNAL'
                    : 'PERHIMPUNAN MAHASISWA PECINTA ALAM GANDAWESI'}
                </h4>
                <p className="text-[10px] text-emerald-400 font-medium tracking-wider">
                  {previewItem.asal === 'eksternal' && previewItem.lembaga_penerbit
                    ? `DITERBITKAN OLEH: ${previewItem.lembaga_penerbit.toUpperCase()}`
                    : 'FAKULTAS PENDIDIKAN TEKNOLOGI DAN KEJURUAN — UNIVERSITAS PENDIDIKAN INDONESIA'}
                </p>
              </div>

              {/* Title & Badge */}
              <div className="space-y-1.5 py-2 border-y border-white/10">
                <span className="text-[9px] font-bold uppercase tracking-widest text-amber-400">
                  {previewItem.asal === 'eksternal' ? 'PIAGAM PENGHARGAAN & SERTIFIKASI KOMPETENSI' : 'PIAGAM PENGHARGAAN RESMI'}
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white font-serif tracking-wide">
                  {previewItem.judul}
                </h2>
                <p className="text-[10px] font-mono text-stone-400">
                  Nomor Registrasi: {previewItem.nomor_sertifikat}
                </p>
                <div>
                  <Link
                    href={`/verifikasi/sertifikat?nomor=${encodeURIComponent(previewItem.nomor_sertifikat)}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-[9px] font-mono text-emerald-400/90 hover:text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30 transition-colors"
                  >
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Verifikasi Keaslian Publik</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </Link>
                </div>
              </div>

              {/* Recipient */}
              <div className="space-y-1">
                <p className="text-[11px] text-stone-400 italic">
                  {previewItem.asal === 'eksternal' ? 'Dianugerahkan kepada Delegasi Gandawesi FPTI UPI:' : 'Dianugerahkan dengan hormat kepada:'}
                </p>
                <h3 className="text-xl sm:text-2xl font-black text-amber-200 tracking-tight">
                  {previewItem.anggota_nama}
                </h3>
                {previewItem.anggota_nia && (
                  <p className="text-xs font-mono text-emerald-400 font-bold">
                    NIA: {previewItem.anggota_nia}
                  </p>
                )}
              </div>

              {previewItem.deskripsi && (
                <p className="text-xs text-stone-300 max-w-lg mx-auto leading-relaxed italic bg-black/40 p-3 rounded-xl border border-white/5">
                  &quot;{previewItem.deskripsi}&quot;
                </p>
              )}

              {/* Scanned Physical File Attachment Card */}
              {previewItem.file && (
                <div className="p-3 bg-stone-900/80 rounded-xl border border-sky-500/30 flex items-center justify-between gap-3 text-left">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-sky-400 shrink-0" />
                    <div>
                      <p className="text-[11px] font-bold text-stone-200">Berkas Pindaian (Scan) Fisik Terlampir</p>
                      <p className="text-[9px] text-stone-400">Dokumen asli tersimpan di Supabase Storage</p>
                    </div>
                  </div>
                  <a
                    href={previewItem.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  >
                    <Download className="w-3 h-3" /> Lihat Pindaian Asli
                  </a>
                </div>
              )}

              {/* Signatures & Seal */}
              <div className="pt-4 flex items-end justify-between text-left text-[9px] text-stone-400 border-t border-white/10">
                <div className="space-y-0.5">
                  <p>Bandung, {previewItem.tanggal_terbit}</p>
                  <p className="font-bold text-white">
                    {previewItem.asal === 'eksternal' ? 'Lembaga Penyelenggara' : 'Dewan Pengurus Gandawesi'}
                  </p>
                  <div className="w-20 h-8 border border-emerald-500/30 rounded flex items-center justify-center text-[7px] text-emerald-400/60 font-mono mt-1">
                    {previewItem.asal === 'eksternal' ? '[ REKOGNISI SAH ]' : '[ TTD RESMI ]'}
                  </div>
                </div>

                <div className="text-center">
                  <div className="w-14 h-14 rounded-full border-2 border-amber-500/60 flex items-center justify-center font-serif text-[8px] font-black text-amber-300 bg-amber-950/30 shadow-md">
                    SEGEL SAH
                  </div>
                </div>

                <div className="text-right space-y-0.5">
                  <p>Mengetahui,</p>
                  <p className="font-bold text-white">
                    {previewItem.asal === 'eksternal' ? (previewItem.lembaga_penerbit || 'Ketua Penyelenggara') : 'Ketua Umum Organisasi'}
                  </p>
                  <div className="w-20 h-8 border border-emerald-500/30 rounded flex items-center justify-center text-[7px] text-emerald-400/60 font-mono mt-1 ml-auto">
                    [ CAP &amp; TTD ]
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <Link
                href={`/verifikasi/sertifikat?nomor=${encodeURIComponent(previewItem.nomor_sertifikat)}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Buka Laman Verifikasi Publik
              </Link>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setPreviewItem(null)}
                  className="text-xs"
                >
                  Tutup
                </Button>
                <Button
                  variant="primary"
                  onClick={() => window.print()}
                  className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak Piagam
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
