'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { StatCard, StatGrid } from '@/components/ui/StatCard';
import { Alert } from '@/components/ui/Alert';
import { Modal } from '@/components/ui/Modal';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { SUPABASE_STORAGE_BUCKETS } from '@/lib/constants';
import { exportToCSV } from '@/lib/utils/export-csv';
import {
  Award,
  FileCheck,
  Plus,
  Trash2,
  Calendar,
  X,
  CheckCircle2,
  AlertTriangle,
  Search,
  ExternalLink,
  ShieldCheck,
  Users,
  Building2,
  Globe,
  FileSpreadsheet,
  FileText,
  Eye,
} from 'lucide-react';
import {
  fetchAllSertifikatAdmin,
  issueSertifikat,
  deleteSertifikat,
  fetchGovernanceAdminData,
} from '@/lib/actions/governance';
import type { SertifikatItem, CandidateALBItem } from '@/lib/types/governance';

export default function AdminSertifikatPage() {
  const [list, setList] = useState<SertifikatItem[]>([]);
  const [members, setMembers] = useState<CandidateALBItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [asalFilter, setAsalFilter] = useState<'all' | 'internal' | 'eksternal' | 'organisasi'>('all');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<{
    asal: 'internal' | 'eksternal';
    penerima_tipe: 'anggota' | 'organisasi';
    anggota_id: string;
    lembaga_penerbit: string;
    jenis: string;
    judul: string;
    nomor_sertifikat: string;
    tanggal_terbit: string;
    file: string;
    deskripsi: string;
  }>({
    asal: 'internal',
    penerima_tipe: 'anggota',
    anggota_id: '',
    lembaga_penerbit: '',
    jenis: 'Kelulusan PPNIA & Pengukuhan NIA',
    judul: 'Piagam Pengukuhan Anggota Biasa & Kelulusan PPNIA',
    nomor_sertifikat: '012/SK-NIA/GW-FPTI/XII/2025',
    tanggal_terbit: new Date().toISOString().split('T')[0],
    file: '',
    deskripsi: 'Dinyatakan telah menuntaskan seluruh kewajiban pembinaan dan evaluasi kaderisasi.',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [sertList, govData] = await Promise.all([
      fetchAllSertifikatAdmin(),
      fetchGovernanceAdminData(),
    ]);
    setList(sertList);
    const allMembers = [...govData.candidatesALB, ...govData.allALBList];
    setMembers(allMembers);
    if (allMembers.length > 0 && !form.anggota_id) {
      setForm((p) => ({ ...p, anggota_id: allMembers[0].id }));
    }
    setLoading(false);
  }, [form.anggota_id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenModal = () => {
    const randomNum = Math.floor(Math.random() * 90 + 10);
    setForm({
      asal: 'internal',
      penerima_tipe: 'anggota',
      anggota_id: members[0]?.id || '',
      lembaga_penerbit: '',
      jenis: 'Kelulusan PPNIA & Pengukuhan NIA',
      judul: 'Piagam Pengukuhan Anggota Biasa & Kelulusan PPNIA',
      nomor_sertifikat: `0${randomNum}/SK-NIA/GW-FPTI/XII/2025`,
      tanggal_terbit: new Date().toISOString().split('T')[0],
      file: '',
      deskripsi: 'Dinyatakan telah menuntaskan seluruh kewajiban pembinaan dan evaluasi kaderisasi.',
    });
    setShowModal(true);
  };

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.penerima_tipe === 'anggota' && !form.anggota_id) return;
    if (!form.judul.trim() || !form.nomor_sertifikat.trim()) return;

    setSubmitting(true);
    const res = await issueSertifikat({
      anggota_id: form.penerima_tipe === 'organisasi' ? null : form.anggota_id,
      penerima_tipe: form.penerima_tipe,
      asal: form.asal,
      lembaga_penerbit: form.asal === 'eksternal' ? form.lembaga_penerbit.trim() : 'Gandawesi FPTI UPI',
      jenis: form.jenis,
      judul: form.judul.trim(),
      nomor_sertifikat: form.nomor_sertifikat.trim(),
      tanggal_terbit: form.tanggal_terbit,
      file: form.file || null,
      deskripsi: form.deskripsi.trim(),
    });
    setSubmitting(false);

    if (res.success) {
      setFeedback({ type: 'success', text: res.message || 'Sertifikat resmi berhasil diterbitkan/diarsipkan!' });
      setShowModal(false);
      loadData();
    } else {
      setFeedback({ type: 'error', text: res.error || 'Gagal menyimpan sertifikat.' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus sertifikat ini?')) return;
    const res = await deleteSertifikat(id);
    if (res.success) {
      setFeedback({ type: 'success', text: 'Sertifikat berhasil dihapus.' });
      loadData();
    }
  };

  const filtered = list.filter((s) => {
    if (asalFilter === 'internal' && s.asal === 'eksternal') return false;
    if (asalFilter === 'eksternal' && (s.asal !== 'eksternal' || s.penerima_tipe === 'organisasi')) return false;
    if (asalFilter === 'organisasi' && s.penerima_tipe !== 'organisasi') return false;

    const q = search.toLowerCase();
    return (
      s.anggota_nama.toLowerCase().includes(q) ||
      s.judul.toLowerCase().includes(q) ||
      s.nomor_sertifikat.toLowerCase().includes(q) ||
      (s.lembaga_penerbit && s.lembaga_penerbit.toLowerCase().includes(q)) ||
      (s.anggota_nia && s.anggota_nia.toLowerCase().includes(q))
    );
  });

  const countInternal = list.filter((s) => s.asal !== 'eksternal').length;
  const countEksternalDelegasi = list.filter((s) => s.asal === 'eksternal' && s.penerima_tipe !== 'organisasi').length;
  const countOrganisasi = list.filter((s) => s.penerima_tipe === 'organisasi').length;

  const handleExportCSV = () => {
    const headers = [
      'No',
      'Asal Sertifikat',
      'Tipe Penerima',
      'Penerima',
      'NIA',
      'Lembaga Penerbit',
      'Nomor Sertifikat / SK',
      'Judul Piagam / Sertifikat',
      'Jenis Kegiatan',
      'Tanggal Terbit',
      'Deskripsi',
      'Berkas File URL',
    ];

    const rows = filtered.map((s, idx) => [
      idx + 1,
      s.asal === 'eksternal' ? 'Eksternal (Dari Luar)' : 'Internal (Gandawesi)',
      s.penerima_tipe === 'organisasi' ? 'Lembaga / Organisasi' : 'Perseorangan / Anggota',
      s.anggota_nama,
      s.anggota_nia || '-',
      s.lembaga_penerbit || (s.asal === 'eksternal' ? 'Pihak Luar' : 'Gandawesi FPTI UPI'),
      s.nomor_sertifikat,
      s.judul,
      s.jenis,
      s.tanggal_terbit,
      s.deskripsi || '-',
      s.file || '-',
    ]);

    const dateStr = new Date().toISOString().split('T')[0];
    exportToCSV(`rekap-sertifikat-gandawesi-${dateStr}`, headers, rows);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-stone-900 via-forest-950 to-slate-900 border border-emerald-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                <Award className="w-3.5 h-3.5" /> Sertifikasi, Delegasi &amp; Arsip Rekognisi
              </span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Admin Panel
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-mono">
              MANAJEMEN SERTIFIKAT &amp; PENGHARGAAN
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Kelola penerbitan sertifikat internal kaderisasi (Diksar, Medan Operasi, PPNIA), arsip delegasi perseorangan dari lembaga luar (SAR, Panjat Tebing), serta penghargaan institusional resmi untuk Gandawesi.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={handleOpenModal}
            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shrink-0 shadow-lg cursor-pointer font-bold"
          >
            <Plus className="w-4 h-4" /> Catat / Terbitkan Sertifikat
          </Button>
        </div>
      </div>

      {/* Notification Banner */}
      {feedback && (
        <Alert
          type={feedback.type}
          message={feedback.text}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Summary Cards */}
      <StatGrid columns={4}>
        <StatCard
          label="Total Sertifikat"
          value={list.length}
          description="Arsip Seluruh Piagam"
          icon={FileCheck}
          color="emerald"
        />
        <StatCard
          label="Internal Gandawesi"
          value={countInternal}
          description="Kaderisasi & Pengukuhan"
          icon={Award}
          color="forest"
        />
        <StatCard
          label="Eksternal Delegasi"
          value={countEksternalDelegasi}
          description="Prestasi Anggota di Luar"
          icon={Users}
          color="amber"
        />
        <StatCard
          label="Prestasi Lembaga"
          value={countOrganisasi}
          description="Piagam Milik Organisasi"
          icon={Building2}
          color="stone"
        />
      </StatGrid>

      {/* Main Table Card */}
      <Card className="overflow-hidden border border-stone-200 dark:border-stone-800">
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs Filter */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs overflow-x-auto">
            {[
              { id: 'all', label: `Semua (${list.length})` },
              { id: 'internal', label: `Internal (${countInternal})` },
              { id: 'eksternal', label: `Eksternal Delegasi (${countEksternalDelegasi})` },
              { id: 'organisasi', label: `Institusional (${countOrganisasi})` },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setAsalFilter(t.id as any)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                  asalFilter === t.id
                    ? 'bg-white dark:bg-forest-900 text-stone-900 dark:text-white shadow-xs font-bold'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search & Export Toolbar */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Cari judul / penerbit / penerima..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="text-xs font-bold gap-1.5 shrink-0 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:text-emerald-600 cursor-pointer"
              title="Unduh seluruh daftar sertifikat ke Excel / CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Ekspor Excel</span>
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Asal &amp; Penerbit</th>
                <th className="py-3 px-4">Penerima &amp; Afiliasi</th>
                <th className="py-3 px-4">Judul Piagam &amp; No. SK</th>
                <th className="py-3 px-4">Jenis / Kategori</th>
                <th className="py-3 px-4">Tanggal Terbit</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    Tidak ada data sertifikat yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/30">
                    <td className="py-3 px-4">
                      {item.penerima_tipe === 'organisasi' ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                            <Building2 className="w-2.5 h-2.5" /> Institusional
                          </span>
                          <p className="text-[11px] text-stone-500 font-medium">
                            Dari: {item.lembaga_penerbit || 'Mitra Luar'}
                          </p>
                        </div>
                      ) : item.asal === 'eksternal' ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            <Globe className="w-2.5 h-2.5" /> Eksternal / Delegasi
                          </span>
                          <p className="text-[11px] text-stone-500 font-medium">
                            Dari: {item.lembaga_penerbit || 'Lembaga Luar'}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <ShieldCheck className="w-2.5 h-2.5" /> Internal Gandawesi
                          </span>
                          <p className="text-[11px] text-stone-500 font-medium">Penerbit: Gandawesi FPTI UPI</p>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {item.penerima_tipe === 'organisasi' ? (
                        <div>
                          <p className="font-bold text-purple-600 dark:text-purple-400">
                            Lembaga Gandawesi FPTI UPI
                          </p>
                          <span className="text-[10px] text-stone-400">Aset Prestasi Organisasi</span>
                        </div>
                      ) : (
                        <div>
                          <p className="font-bold text-stone-900 dark:text-stone-100">{item.anggota_nama}</p>
                          <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                            {item.anggota_nia ? `NIA: ${item.anggota_nia}` : 'Delegasi'}
                          </p>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-semibold text-stone-800 dark:text-stone-200 line-clamp-1">{item.judul}</p>
                      <p className="text-[10px] font-mono text-stone-400">{item.nomor_sertifikat}</p>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                        {item.jenis.split('—')[0].trim()}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-stone-600 dark:text-stone-400 font-mono text-[11px]">
                      {item.tanggal_terbit}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/verifikasi/sertifikat?nomor=${encodeURIComponent(item.nomor_sertifikat)}`}
                          target="_blank"
                          className="p-1.5 text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                          title="Lihat Verifikasi Publik"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-500 transition-colors cursor-pointer"
                          title="Hapus Sertifikat"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Terbitkan / Catat Sertifikat Baru */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          <span className="flex items-center gap-2 text-emerald-400">
            <Award className="w-4 h-4" />
            Catat Piagam / Sertifikat (Internal &amp; Eksternal)
          </span>
        }
        description="Pencatatan sertifikat internal kaderisasi, delegasi perseorangan dari lembaga luar, atau piagam penghargaan organisasi."
        maxWidth="lg"
      >
        <form onSubmit={handleIssue} className="space-y-4 text-xs">
          {/* Asal Sertifikat Selector */}
          <div>
            <label className="block text-stone-300 font-bold uppercase tracking-wider mb-1.5 text-[11px]">
              1. Asal Penerbit Sertifikat:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, asal: 'internal' }))}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer text-left ${
                  form.asal === 'internal'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 ring-2 ring-emerald-500/20'
                    : 'border-stone-800 text-stone-400 hover:bg-stone-900'
                }`}
              >
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-bold text-xs text-white">Internal Gandawesi</p>
                  <p className="text-[10px] text-stone-400">Diterbitkan langsung oleh pengurus GW</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, asal: 'eksternal' }))}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer text-left ${
                  form.asal === 'eksternal'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-300 ring-2 ring-blue-500/20'
                    : 'border-stone-800 text-stone-400 hover:bg-stone-900'
                }`}
              >
                <Globe className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <p className="font-bold text-xs text-white">Eksternal (Pihak Luar)</p>
                  <p className="text-[10px] text-stone-400">Diterima dari instansi/organisasi luar</p>
                </div>
              </button>
            </div>
          </div>

          {/* Penerima Tipe Selector */}
          <div>
            <label className="block text-stone-300 font-bold uppercase tracking-wider mb-1.5 text-[11px]">
              2. Entitas Penerima Sertifikat:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, penerima_tipe: 'anggota' }))}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer text-left ${
                  form.penerima_tipe === 'anggota'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-300 ring-2 ring-amber-500/20'
                    : 'border-stone-800 text-stone-400 hover:bg-stone-900'
                }`}
              >
                <Users className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <p className="font-bold text-xs text-white">Perseorangan (Anggota / Delegasi)</p>
                  <p className="text-[10px] text-stone-400">Tercatat di lemari sertifikat individu</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, penerima_tipe: 'organisasi' }))}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer text-left ${
                  form.penerima_tipe === 'organisasi'
                    ? 'border-purple-500 bg-purple-500/10 text-purple-300 ring-2 ring-purple-500/20'
                    : 'border-stone-800 text-stone-400 hover:bg-stone-900'
                }`}
              >
                <Building2 className="w-5 h-5 text-purple-400 shrink-0" />
                <div>
                  <p className="font-bold text-xs text-white">Lembaga Organisasi (Gandawesi)</p>
                  <p className="text-[10px] text-stone-400">Aset prestasi bersama di profil publik</p>
                </div>
              </button>
            </div>
          </div>

          {/* Conditional Input: Member or Organization */}
          {form.penerima_tipe === 'anggota' ? (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {form.asal === 'eksternal' ? 'Nama Anggota yang Mewakili Delegasi:' : 'Pilih Anggota Penerima Sertifikat:'}
              </label>
              <select
                value={form.anggota_id}
                onChange={(e) => setForm((p) => ({ ...p, anggota_id: e.target.value }))}
                required
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-emerald-500"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nama} ({m.nia || 'No NIA'}) - Angkatan {m.nomor_angkatan || '-'}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs">
              ✓ Penerima: <strong>Perhimpunan Mahasiswa Pecinta Alam Gandawesi FPTI UPI</strong> (Institusional). Sertifikat ini akan otomatis dipajang di galeri prestasi publik organisasi.
            </div>
          )}

          {/* If External: Input Lembaga Luar */}
          {form.asal === 'eksternal' && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Nama Instansi / Lembaga Luar Pemberi Sertifikat:
              </label>
              <input
                type="text"
                required
                placeholder="Mis. BASARNAS Bandung / Balai Besar TN Gunung Gede Pangrango / Rektorat UPI"
                value={form.lembaga_penerbit}
                onChange={(e) => setForm((p) => ({ ...p, lembaga_penerbit: e.target.value }))}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-emerald-500"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Kategori / Jenis Kegiatan:</label>
              <input
                type="text"
                required
                placeholder="Misal: Pelatihan SAR / Piagam Kemitraan Konservasi"
                value={form.jenis}
                onChange={(e) => setForm((p) => ({ ...p, jenis: e.target.value }))}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tanggal Terbit / Pengesahan:</label>
              <input
                type="date"
                required
                value={form.tanggal_terbit}
                onChange={(e) => setForm((p) => ({ ...p, tanggal_terbit: e.target.value }))}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Judul Lengkap Piagam / Sertifikat:</label>
            <input
              type="text"
              required
              placeholder="Misal: Piagam Apresiasi Mitra Aksi Bersih Gunung Gede Pangrango"
              value={form.judul}
              onChange={(e) => setForm((p) => ({ ...p, judul: e.target.value }))}
              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Nomor Registrasi / Nomor Surat Keputusan:</label>
            <input
              type="text"
              required
              placeholder="Misal: BBTNGGP/KONS/PIAGAM/X/2025/074"
              value={form.nomor_sertifikat}
              onChange={(e) => setForm((p) => ({ ...p, nomor_sertifikat: e.target.value }))}
              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Deskripsi / Peran / Catatan Prestasi:</label>
            <textarea
              rows={2}
              placeholder="Catatan prestasi, uraian kegiatan, atau amanat piagam..."
              value={form.deskripsi}
              onChange={(e) => setForm((p) => ({ ...p, deskripsi: e.target.value }))}
              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-emerald-500"
            />
          </div>

          {/* Image Uploader for Physical Scan / PDF */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Upload Scan / Foto Fisik Sertifikat (WebP Auto-Compress):
            </label>
            <ImageUploader
              bucket={SUPABASE_STORAGE_BUCKETS.DOCUMENTS}
              folder="certificates"
              label="Unggah Berkas Scan Piagam / Sertifikat"
              helperText="File foto/scan otomatis dikompres ke WebP resolusi web tajam & hemat ruang penyimpanan."
              initialUrl={form.file || null}
              onUploadComplete={(publicUrl) => {
                setForm((p) => ({ ...p, file: publicUrl }));
              }}
              onImageRemoved={() => {
                setForm((p) => ({ ...p, file: '' }));
              }}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              {submitting ? <Spinner className="w-3.5 h-3.5 mr-1" /> : <Award className="w-3.5 h-3.5 mr-1" />}
              Simpan Piagam / Sertifikat
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
