'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { StatCard, StatGrid } from '@/components/ui/StatCard';
import { Alert } from '@/components/ui/Alert';
import { Modal } from '@/components/ui/Modal';
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
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    anggota_id: '',
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
    setForm((p) => ({
      ...p,
      nomor_sertifikat: `0${randomNum}/SK-NIA/GW-FPTI/XII/2025`,
    }));
    setShowModal(true);
  };

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.anggota_id || !form.judul) return;

    setSubmitting(true);
    const res = await issueSertifikat({
      anggota_id: form.anggota_id,
      jenis: form.jenis,
      judul: form.judul,
      nomor_sertifikat: form.nomor_sertifikat,
      tanggal_terbit: form.tanggal_terbit,
      file: form.file || null,
      deskripsi: form.deskripsi,
    });
    setSubmitting(false);

    if (res.success) {
      setFeedback({ type: 'success', text: res.message || 'Sertifikat resmi berhasil diterbitkan!' });
      setShowModal(false);
      loadData();
    } else {
      setFeedback({ type: 'error', text: res.error || 'Gagal menerbitkan sertifikat.' });
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

  const filtered = list.filter(
    (s) =>
      s.anggota_nama.toLowerCase().includes(search.toLowerCase()) ||
      s.judul.toLowerCase().includes(search.toLowerCase()) ||
      s.nomor_sertifikat.toLowerCase().includes(search.toLowerCase()) ||
      (s.anggota_nia && s.anggota_nia.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-stone-900 via-forest-950 to-slate-900 border border-emerald-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                <Award className="w-3.5 h-3.5" /> Sertifikasi & Piagam Kaderisasi
              </span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Admin Panel
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-mono">
              PENERBITAN & MANAJEMEN SERTIFIKAT
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Penerbitan surat keputusan dan sertifikat penghargaan resmi untuk tahapan Siswa Diklat, Pelantikan Medan Operasi, Pengukuhan NIA, serta Ekspedisi Alam Terbuka.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={handleOpenModal}
            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shrink-0 shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Terbitkan Sertifikat Baru
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
      <StatGrid columns={3}>
        <StatCard
          label="Total Diterbitkan"
          value={list.length}
          description="Piagam Resmi Tercatat"
          icon={FileCheck}
          color="emerald"
        />
        <StatCard
          label="Penerima Anggota"
          value={new Set(list.map((s) => s.anggota_id)).size}
          description="Kader Berprestasi"
          icon={Users}
          color="amber"
        />
        <StatCard
          label="Kategori Sertifikasi"
          value={6}
          description="Kaderisasi & Ekspedisi"
          icon={ShieldCheck}
          color="indigo"
        />
      </StatGrid>

      {/* Main Table */}
      <Card className="overflow-hidden border border-stone-200 dark:border-stone-800">
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
            Daftar Sertifikat Resmi
          </h3>
          <div className="w-full sm:w-64 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Cari penerima / judul..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Penerima & NIA</th>
                <th className="py-3 px-4">Judul Piagam / Sertifikat</th>
                <th className="py-3 px-4">Jenis Sertifikasi</th>
                <th className="py-3 px-4">Tanggal Terbit</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/30">
                  <td className="py-3 px-4">
                    <p className="font-bold text-stone-900 dark:text-stone-100">{item.anggota_nama}</p>
                    <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {item.anggota_nia || '-'}
                    </p>
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <p className="font-semibold text-stone-800 dark:text-stone-200 truncate">{item.judul}</p>
                    <p className="text-[10px] font-mono text-stone-400">{item.nomor_sertifikat}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      {item.jenis.split('—')[0].trim()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-stone-600 dark:text-stone-400 font-mono text-[11px]">
                    {item.tanggal_terbit}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-500 transition-colors cursor-pointer"
                      title="Hapus Sertifikat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Terbitkan Sertifikat */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          <span className="flex items-center gap-2 text-emerald-400">
            <Award className="w-4 h-4" />
            Terbitkan Sertifikat Resmi Baru
          </span>
        }
        description="Penerbitan surat keputusan dan piagam resmi organisasi."
        maxWidth="lg"
      >
        <form onSubmit={handleIssue} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Pilih Penerima Sertifikat:</label>
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

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Jenis Kaderisasi / Kegiatan:</label>
            <select
              value={form.jenis}
              onChange={(e) => setForm((p) => ({ ...p, jenis: e.target.value }))}
              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-emerald-500"
            >
              <option value="Kelulusan PPNIA & Pengukuhan NIA">Kelulusan PPNIA & Pengukuhan NIA</option>
              <option value="Pelantikan Medan Operasi">Pelantikan Medan Operasi (Anggota Muda)</option>
              <option value="Pendidikan & Latihan Dasar (Siswa)">Pendidikan & Latihan Dasar (Siswa)</option>
              <option value="Ekspedisi & Penjelajahan Alam">Ekspedisi & Penjelajahan Alam Mandiri</option>
              <option value="Pelatihan SAR & Navigasi Darat">Pelatihan Khusus SAR & Navigasi Darat</option>
              <option value="Penghargaan Pengabdian Organisasi">Penghargaan Pengabdian Organisasi</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Judul Piagam / Sertifikat:</label>
            <input
              type="text"
              required
              value={form.judul}
              onChange={(e) => setForm((p) => ({ ...p, judul: e.target.value }))}
              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nomor Registrasi Sertifikat:</label>
              <input
                type="text"
                required
                value={form.nomor_sertifikat}
                onChange={(e) => setForm((p) => ({ ...p, nomor_sertifikat: e.target.value }))}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tanggal Terbit:</label>
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
            <label className="block text-slate-300 font-semibold mb-1">Tautan Berkas PDF (Opsional):</label>
            <input
              type="url"
              placeholder="https://storage.googleapis.com/..."
              value={form.file}
              onChange={(e) => setForm((p) => ({ ...p, file: e.target.value }))}
              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Deskripsi / Amanat Piagam:</label>
            <textarea
              rows={2}
              value={form.deskripsi}
              onChange={(e) => setForm((p) => ({ ...p, deskripsi: e.target.value }))}
              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={submitting} className="bg-emerald-600 text-white">
              {submitting ? <Spinner className="w-3.5 h-3.5 mr-1" /> : <Award className="w-3.5 h-3.5 mr-1" />}
              Terbitkan Sertifikat
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
