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
} from 'lucide-react';
import { fetchMySertifikatList } from '@/lib/actions/governance';
import type { SertifikatItem } from '@/lib/types/governance';

export default function MemberSertifikatPage() {
  const [list, setList] = useState<SertifikatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
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

  const filtered = list.filter(
    (s) =>
      s.judul.toLowerCase().includes(search.toLowerCase()) ||
      s.jenis.toLowerCase().includes(search.toLowerCase()) ||
      s.nomor_sertifikat.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Rekam Jejak Prestasi
            </span>
            <span className="text-xs font-mono font-bold text-stone-500 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-full">
              {list.length} Piagam Resmi
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 tracking-tight mt-1 font-mono">
            SERTIFIKAT & PENCAPAIAN
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
            Kumpulan sertifikat kelulusan jenjang kaderisasi, pelantikan lapangan, dan kegiatan ekspedisi resmi Gandawesi FPTI UPI.
          </p>
        </div>

        <div className="w-full sm:w-64 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Cari sertifikat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-emerald-500"
          />
        </div>
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
            Sertifikat resmi akan diterbitkan oleh pengurus setelah Anda menyelesaikan setiap tahapan kegiatan kaderisasi.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <Card
              key={item.id}
              className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-4 group shadow-sm hover:shadow-md"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {item.jenis.split('—')[0].trim()}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-stone-400">
                    <Calendar className="w-3 h-3" /> {item.tanggal_terbit}
                  </div>
                </div>

                <h3 className="text-sm font-black text-stone-900 dark:text-stone-100 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {item.judul}
                </h3>

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
                <button
                  onClick={() => setPreviewItem(item)}
                  className="p-2 rounded-xl bg-forest-50 dark:bg-forest-950/50 text-forest-600 dark:text-forest-400 hover:bg-forest-100 dark:hover:bg-forest-900 transition-colors cursor-pointer"
                  title="Unduh Sertifikat"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ============================================================ */}
      {/* PREVIEW CERTIFICATE MODAL                                   */}
      {/* ============================================================ */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border-2 border-amber-500/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
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
                  PERHIMPUNAN MAHASISWA PECINTA ALAM GANDAWESI
                </h4>
                <p className="text-[10px] text-emerald-400 font-medium tracking-wider">
                  FAKULTAS PENDIDIKAN TEKNOLOGI DAN KEJURUAN — UNIVERSITAS PENDIDIKAN INDONESIA
                </p>
              </div>

              {/* Title & Badge */}
              <div className="space-y-1.5 py-2 border-y border-white/10">
                <span className="text-[9px] font-bold uppercase tracking-widest text-amber-400">
                  PIAGAM PENGHARGAAN RESMI
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white font-serif tracking-wide">
                  {previewItem.judul}
                </h2>
                <p className="text-[10px] font-mono text-stone-400">
                  Nomor Registrasi: {previewItem.nomor_sertifikat}
                </p>
              </div>

              {/* Recipient */}
              <div className="space-y-1">
                <p className="text-[11px] text-stone-400 italic">Dianugerahkan dengan hormat kepada:</p>
                <h3 className="text-xl sm:text-2xl font-black text-amber-200 tracking-tight">
                  {previewItem.anggota_nama}
                </h3>
                <p className="text-xs font-mono text-emerald-400 font-bold">
                  NIA: {previewItem.anggota_nia || 'GW.32.235.GW'}
                </p>
              </div>

              {previewItem.deskripsi && (
                <p className="text-xs text-stone-300 max-w-lg mx-auto leading-relaxed italic bg-black/40 p-3 rounded-xl border border-white/5">
                  "{previewItem.deskripsi}"
                </p>
              )}

              {/* Signatures & Seal */}
              <div className="pt-4 flex items-end justify-between text-left text-[9px] text-stone-400 border-t border-white/10">
                <div className="space-y-0.5">
                  <p>Bandung, {previewItem.tanggal_terbit}</p>
                  <p className="font-bold text-white">Dewan Pengurus Gandawesi</p>
                  <div className="w-16 h-8 border border-emerald-500/30 rounded flex items-center justify-center text-[7px] text-emerald-400/60 font-mono mt-1">
                    [ TTD RESMI ]
                  </div>
                </div>

                <div className="text-center">
                  <div className="w-14 h-14 rounded-full border-2 border-amber-500/60 flex items-center justify-center font-serif text-[8px] font-black text-amber-300 bg-amber-950/30 shadow-md">
                    SEGEL SAH
                  </div>
                </div>

                <div className="text-right space-y-0.5">
                  <p>Mengetahui,</p>
                  <p className="font-bold text-white">Ketua Umum Organisasi</p>
                  <div className="w-16 h-8 border border-emerald-500/30 rounded flex items-center justify-center text-[7px] text-emerald-400/60 font-mono mt-1 ml-auto">
                    [ CAP & TTD ]
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => setPreviewItem(null)}
                className="text-xs"
              >
                Tutup Pratinjau
              </Button>
              <Button
                variant="primary"
                onClick={() => window.print()}
                className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Cetak Sertifikat
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
