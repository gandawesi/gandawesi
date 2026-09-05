'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { StatCard, StatGrid } from '@/components/ui/StatCard';
import { Modal } from '@/components/ui/Modal';
import {
  Users,
  Briefcase,
  Crown,
  Sparkles,
  GraduationCap,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  X,
  Building,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import {
  fetchGovernanceAdminData,
  createJabatanOrganisasi,
  deleteJabatanOrganisasi,
  createDewanPenasehat,
  deleteDewanPenasehat,
  transisiKeAnggotaLuarBiasa,
} from '@/lib/actions/governance';
import type {
  JabatanOrganisasiItem,
  DewanPenasehatItem,
  CandidateALBItem,
  TransisiALBPayload,
} from '@/lib/types/governance';

export default function AdminGovernancePage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'jabatan' | 'penasehat' | 'transisi_alb'>('jabatan');

  // Data States
  const [jabatanList, setJabatanList] = useState<JabatanOrganisasiItem[]>([]);
  const [dewanPenasehatList, setDewanPenasehatList] = useState<DewanPenasehatItem[]>([]);
  const [candidatesALB, setCandidatesALB] = useState<CandidateALBItem[]>([]);
  const [allALBList, setAllALBList] = useState<CandidateALBItem[]>([]);

  // Feedback Notification
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal States
  const [showAddJabatanModal, setShowAddJabatanModal] = useState(false);
  const [jabatanForm, setJabatanForm] = useState({
    anggota_id: '',
    jabatan: '',
    divisi: '',
    periode_mulai: new Date().toISOString().split('T')[0],
    periode_selesai: '',
    catatan: '',
  });
  const [savingJabatan, setSavingJabatan] = useState(false);

  const [showAddPenasehatModal, setShowAddPenasehatModal] = useState(false);
  const [penasehatForm, setPenasehatForm] = useState({
    anggota_id: '',
    periode_mulai: new Date().toISOString().split('T')[0],
    periode_selesai: '',
    catatan: '',
  });
  const [savingPenasehat, setSavingPenasehat] = useState(false);

  const [transisiTarget, setTransisiTarget] = useState<CandidateALBItem | null>(null);
  const [transisiForm, setTransisiForm] = useState({
    tanggal_transisi: new Date().toISOString().split('T')[0],
    catatan: 'Telah lulus yudisium/wisuda program sarjana FPTI UPI (laporan lisan terverifikasi).',
  });
  const [submittingTransisi, setSubmittingTransisi] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const res = await fetchGovernanceAdminData();
    setJabatanList(res.jabatanList);
    setDewanPenasehatList(res.dewanPenasehatList);
    setCandidatesALB(res.candidatesALB);
    setAllALBList(res.allALBList);
    if (res.candidatesALB.length > 0 && !jabatanForm.anggota_id) {
      setJabatanForm((prev) => ({ ...prev, anggota_id: res.candidatesALB[0].id }));
    }
    if (res.allALBList.length > 0 && !penasehatForm.anggota_id) {
      setPenasehatForm((prev) => ({ ...prev, anggota_id: res.allALBList[0].id }));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Add Jabatan
  const handleSaveJabatan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jabatanForm.anggota_id || !jabatanForm.jabatan) return;

    setSavingJabatan(true);
    const res = await createJabatanOrganisasi({
      anggota_id: jabatanForm.anggota_id,
      jabatan: jabatanForm.jabatan,
      periode_mulai: jabatanForm.periode_mulai,
      periode_selesai: jabatanForm.periode_selesai || null,
      catatan: jabatanForm.divisi ? `Divisi: ${jabatanForm.divisi}. ${jabatanForm.catatan}` : jabatanForm.catatan,
    });
    setSavingJabatan(false);

    if (res.success) {
      setFeedback({ type: 'success', text: res.message || 'Jabatan berhasil dicatat!' });
      setShowAddJabatanModal(false);
      loadData();
    } else {
      setFeedback({ type: 'error', text: res.error || 'Gagal mencatat jabatan.' });
    }
  };

  // Handle Delete Jabatan
  const handleDeleteJabatan = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus catatan jabatan ini?')) return;
    const res = await deleteJabatanOrganisasi(id);
    if (res.success) {
      setFeedback({ type: 'success', text: 'Jabatan organisasi berhasil dihapus.' });
      loadData();
    }
  };

  // Handle Add Dewan Penasehat
  const handleSavePenasehat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!penasehatForm.anggota_id) return;

    setSavingPenasehat(true);
    const res = await createDewanPenasehat({
      anggota_id: penasehatForm.anggota_id,
      periode_mulai: penasehatForm.periode_mulai,
      periode_selesai: penasehatForm.periode_selesai || null,
      catatan: penasehatForm.catatan,
    });
    setSavingPenasehat(false);

    if (res.success) {
      setFeedback({ type: 'success', text: res.message || 'Dewan Penasehat berhasil ditunjuk!' });
      setShowAddPenasehatModal(false);
      loadData();
    } else {
      setFeedback({ type: 'error', text: res.error || 'Gagal menunjuk dewan penasehat.' });
    }
  };

  // Handle Delete Dewan Penasehat
  const handleDeletePenasehat = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus Dewan Penasehat ini?')) return;
    const res = await deleteDewanPenasehat(id);
    if (res.success) {
      setFeedback({ type: 'success', text: 'Dewan Penasehat berhasil dihapus.' });
      loadData();
    }
  };

  // Handle Transisi ALB
  const handleConfirmTransisi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transisiTarget) return;

    setSubmittingTransisi(true);
    const res = await transisiKeAnggotaLuarBiasa({
      anggota_id: transisiTarget.id,
      tanggal_transisi: transisiForm.tanggal_transisi,
      catatan: transisiForm.catatan,
    });
    setSubmittingTransisi(false);

    if (res.success) {
      setFeedback({ type: 'success', text: res.message || 'Status berhasil diubah ke Anggota Luar Biasa!' });
      setTransisiTarget(null);
      loadData();
    } else {
      setFeedback({ type: 'error', text: res.error || 'Gagal memperbarui status anggota.' });
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-stone-900 via-forest-950 to-slate-900 border border-amber-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
                <Building className="w-3.5 h-3.5" /> Tata Kelola & Struktur Organisasi
              </span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Governance CMS
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-mono">
              MANAJEMEN GOVERNANCE & ANGGOTA LUAR BIASA
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Pengelolaan kepengurusan organisasi, penunjukan Dewan Penasehat khusus Anggota Luar Biasa (alumni), dan pencatatan manual transisi status Anggota Luar Biasa berdasarkan laporan lisan kelulusan.
            </p>
          </div>
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

      {/* 4 Summary Cards */}
      <StatGrid columns={4}>
        <StatCard
          icon={Briefcase}
          label="Jabatan Aktif DP"
          value={jabatanList.filter((j) => j.is_active).length}
          subtext="Pengurus Harian & Divisi"
          color="emerald"
        />
        <StatCard
          icon={Sparkles}
          label="Dewan Penasehat (ALB)"
          value={dewanPenasehatList.length}
          subtext="Senior Alumni Terpilih"
          color="amber"
        />
        <StatCard
          icon={GraduationCap}
          label="Calon Transisi ALB"
          value={candidatesALB.length}
          subtext="Anggota Biasa Aktif"
          color="blue"
        />
        <StatCard
          icon={Users}
          label="Total ALB (Alumni)"
          value={allALBList.length}
          subtext="Memenuhi Syarat Penasehat"
          color="forest"
        />
      </StatGrid>

      {/* Tabs Navigation */}
      <div className="flex border-b border-stone-200 dark:border-stone-800 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('jabatan')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'jabatan'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-500/5'
              : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Struktur Kepengurusan DP ({jabatanList.length})
        </button>
        <button
          onClick={() => setActiveTab('penasehat')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'penasehat'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-500/5'
              : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          Dewan Penasehat (ALB) ({dewanPenasehatList.length})
        </button>
        <button
          onClick={() => setActiveTab('transisi_alb')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'transisi_alb'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/5'
              : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-indigo-500" />
          Transisi Anggota Luar Biasa (Alumni)
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: STRUKTUR KEPENGURUSAN JABATAN ORGANISASI              */}
      {/* ============================================================ */}
      {activeTab === 'jabatan' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Daftar Jabatan Kepengurusan Dewan Pengurus
              </h3>
              <p className="text-xs text-stone-500">
                Pencatatan penugasan Ketua Umum, BPH, dan pimpinan divisi operasional.
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowAddJabatanModal(true)}
              className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 self-start cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Tambah Jabatan Organisasi
            </Button>
          </div>

          <Card className="overflow-hidden border border-stone-200 dark:border-stone-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Nama Anggota & NIA</th>
                    <th className="py-3 px-4">Jabatan</th>
                    <th className="py-3 px-4">Divisi / Bidang</th>
                    <th className="py-3 px-4">Masa Periode</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                  {jabatanList.map((j) => (
                    <tr key={j.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/30">
                      <td className="py-3 px-4">
                        <p className="font-bold text-stone-900 dark:text-stone-100">{j.anggota_nama}</p>
                        <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          {j.anggota_nia || 'Belum Ada NIA'}
                        </p>
                      </td>
                      <td className="py-3 px-4 font-semibold text-stone-800 dark:text-stone-200">
                        {j.jabatan}
                      </td>
                      <td className="py-3 px-4 text-stone-600 dark:text-stone-400">
                        {j.divisi || '-'}
                      </td>
                      <td className="py-3 px-4 text-stone-600 dark:text-stone-400 font-mono text-[11px]">
                        {j.periode_mulai} s.d {j.periode_selesai || 'Sekarang'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            j.is_active
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                          }`}
                        >
                          {j.is_active ? 'Aktif' : 'Selesai'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteJabatan(j.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-500 transition-colors cursor-pointer"
                          title="Hapus Jabatan"
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
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: DEWAN PENASEHAT (ALB ONLY)                            */}
      {/* ============================================================ */}
      {activeTab === 'penasehat' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 leading-relaxed flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Ketentuan Khusus AD/ART Gandawesi:</p>
              <p className="text-[11px] mt-0.5 opacity-90">
                Dewan Penasehat hanya boleh ditunjuk dari <strong>Anggota Luar Biasa (alumni)</strong> yang telah menyelesaikan masa kuliah di UPI. Anggota Biasa tidak diperkenankan menjabat posisi penasehat.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Daftar Dewan Penasehat Organisasi
              </h3>
              <p className="text-xs text-stone-500">
                Alumni senior terpilih yang memberikan pendampingan strategis bagi Dewan Pengurus aktif.
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowAddPenasehatModal(true)}
              className="text-xs bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 self-start cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Tunjuk Dewan Penasehat
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {dewanPenasehatList.map((dpn) => (
              <Card
                key={dpn.id}
                className="p-5 bg-white dark:bg-stone-900 border border-amber-500/30 space-y-3 shadow-sm hover:border-amber-500/60 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      Dewan Penasehat
                    </span>
                    <span className="text-[10px] font-mono text-stone-400">
                      Angkatan {dpn.nomor_angkatan}
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-stone-900 dark:text-stone-100">
                    {dpn.anggota_nama}
                  </h4>

                  <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    NIA: {dpn.anggota_nia}
                  </p>

                  <div className="text-[11px] text-stone-500 space-y-1 pt-1">
                    <p>Masa Bakti: {dpn.periode_mulai} s.d {dpn.periode_selesai || 'Selesai'}</p>
                    {dpn.catatan && (
                      <p className="bg-stone-50 dark:bg-stone-950 p-2 rounded-lg border border-stone-200 dark:border-stone-800 italic">
                        "{dpn.catatan}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-right">
                  <button
                    onClick={() => handleDeletePenasehat(dpn.id)}
                    className="text-xs text-rose-500 hover:text-rose-600 font-semibold cursor-pointer"
                  >
                    Hapus Penasehat
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: TRANSISI KE ANGGOTA LUAR BIASA (ALB / ALUMNI)          */}
      {/* ============================================================ */}
      {activeTab === 'transisi_alb' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-800 dark:text-indigo-300 leading-relaxed flex items-start gap-3">
            <GraduationCap className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Transisi Manual Anggota Luar Biasa (Alumni):</p>
              <p className="text-[11px] mt-0.5 opacity-90">
                Sesuai aturan operasional Gandawesi, transisi ke Anggota Luar Biasa dilakukan secara <strong>manual oleh Admin</strong> berdasarkan laporan lisan kelulusan studi/wisuda. Status ini bersifat permanen (alumni) dan memberikan hak untuk dapat ditunjuk menjadi <strong>Dewan Penasehat</strong>.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Kandidat Anggota Biasa (Mahasiswa Aktif)
            </h3>
            <p className="text-xs text-stone-500">
              Pilih anggota yang telah menamatkan studi di UPI untuk ditransisikan menjadi Anggota Luar Biasa.
            </p>
          </div>

          <Card className="overflow-hidden border border-stone-200 dark:border-stone-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Nama Lengkap</th>
                    <th className="py-3 px-4">NIM & Jurusan</th>
                    <th className="py-3 px-4">Nomor NIA Resmi</th>
                    <th className="py-3 px-4">Angkatan</th>
                    <th className="py-3 px-4 text-center">Status Saat Ini</th>
                    <th className="py-3 px-4 text-right">Aksi Transisi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                  {candidatesALB.map((member) => (
                    <tr key={member.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/30">
                      <td className="py-3 px-4 font-bold text-stone-900 dark:text-stone-100">
                        {member.nama}
                      </td>
                      <td className="py-3 px-4 text-stone-600 dark:text-stone-400">
                        {member.jurusan || 'FPTI UPI'} {member.nim ? `(${member.nim})` : ''}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {member.nia || '-'}
                      </td>
                      <td className="py-3 px-4 text-stone-600 dark:text-stone-400">
                        Angkatan {member.nomor_angkatan || 32} ({member.nama_angkatan || 'Giri Wardhana'})
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 capitalize">
                          {member.status_keanggotaan.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setTransisiTarget(member);
                            setTransisiForm({
                              tanggal_transisi: new Date().toISOString().split('T')[0],
                              catatan: `Telah lulus yudisium/wisuda prodi ${member.jurusan || 'FPTI'} (laporan lisan terverifikasi).`,
                            });
                          }}
                          className="text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 cursor-pointer"
                        >
                          <GraduationCap className="w-3.5 h-3.5 mr-1" /> Transisikan ke ALB
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: TAMBAH JABATAN ORGANISASI                          */}
      {/* ============================================================ */}
      <Modal
        isOpen={showAddJabatanModal}
        onClose={() => setShowAddJabatanModal(false)}
        title={
          <span className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-emerald-400" />
            Tambah Jabatan Kepengurusan DP
          </span>
        }
        description="Pencatatan jabatan struktural Dewan Pengurus (DP) organisasi."
        maxWidth="md"
      >
        <form onSubmit={handleSaveJabatan} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Pilih Anggota:</label>
            <select
              value={jabatanForm.anggota_id}
              onChange={(e) => setJabatanForm((p) => ({ ...p, anggota_id: e.target.value }))}
              required
              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-emerald-500"
            >
              {candidatesALB.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nama} ({c.nia || 'No NIA'}) - Angkatan {c.nomor_angkatan}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Nama Jabatan:</label>
            <input
              type="text"
              required
              placeholder="Contoh: Ketua Umum Organisasi / Ketua Divisi Gunung Hutan"
              value={jabatanForm.jabatan}
              onChange={(e) => setJabatanForm((p) => ({ ...p, jabatan: e.target.value }))}
              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-emerald-500"
            >
            </input>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Divisi / Bidang:</label>
            <input
              type="text"
              placeholder="Contoh: Badan Pengurus Harian / Divisi Operasional Lapangan"
              value={jabatanForm.divisi}
              onChange={(e) => setJabatanForm((p) => ({ ...p, divisi: e.target.value }))}
              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Periode Mulai:</label>
              <input
                type="date"
                required
                value={jabatanForm.periode_mulai}
                onChange={(e) => setJabatanForm((p) => ({ ...p, periode_mulai: e.target.value }))}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Periode Selesai:</label>
              <input
                type="date"
                value={jabatanForm.periode_selesai}
                onChange={(e) => setJabatanForm((p) => ({ ...p, periode_selesai: e.target.value }))}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Catatan SK / Mandat:</label>
            <textarea
              rows={2}
              placeholder="Catatan surat keputusan atau amanat..."
              value={jabatanForm.catatan}
              onChange={(e) => setJabatanForm((p) => ({ ...p, catatan: e.target.value }))}
              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
            <Button type="button" variant="secondary" onClick={() => setShowAddJabatanModal(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={savingJabatan} className="bg-emerald-600 text-white">
              {savingJabatan ? <Spinner className="w-3.5 h-3.5 mr-1" /> : <Plus className="w-3.5 h-3.5 mr-1" />}
              Simpan Jabatan
            </Button>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 2: TUNJUK DEWAN PENASEHAT                              */}
      {/* ============================================================ */}
      <Modal
        isOpen={showAddPenasehatModal}
        onClose={() => setShowAddPenasehatModal(false)}
        title="Tunjuk Dewan Penasehat (Alumni)"
        description="Penunjukan alumni Anggota Luar Biasa sebagai penasehat organisasi."
        maxWidth="md"
      >
        <form onSubmit={handleSavePenasehat} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Pilih Anggota Luar Biasa (ALB):
            </label>
            <select
              value={penasehatForm.anggota_id}
              onChange={(e) => setPenasehatForm((p) => ({ ...p, anggota_id: e.target.value }))}
              required
              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-amber-500"
            >
              {allALBList.map((alb) => (
                <option key={alb.id} value={alb.id}>
                  {alb.nama} ({alb.nia}) - Angkatan {alb.nomor_angkatan}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-amber-400/80 mt-1">
              *Hanya menampilkan anggota yang telah berstatus Anggota Luar Biasa.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Periode Mulai:</label>
              <input
                type="date"
                required
                value={penasehatForm.periode_mulai}
                onChange={(e) => setPenasehatForm((p) => ({ ...p, periode_mulai: e.target.value }))}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Periode Selesai:</label>
              <input
                type="date"
                value={penasehatForm.periode_selesai}
                onChange={(e) => setPenasehatForm((p) => ({ ...p, periode_selesai: e.target.value }))}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Bidang Penasehat / Catatan:</label>
            <textarea
              rows={2}
              placeholder="Contoh: Penasehat Bidang Ekspedisi Internasional & Kemitraan Alumni"
              value={penasehatForm.catatan}
              onChange={(e) => setPenasehatForm((p) => ({ ...p, catatan: e.target.value }))}
              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
            <Button type="button" variant="secondary" onClick={() => setShowAddPenasehatModal(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={savingPenasehat} className="bg-amber-600 hover:bg-amber-500 text-white">
              {savingPenasehat ? <Spinner className="w-3.5 h-3.5 mr-1" /> : <Sparkles className="w-3.5 h-3.5 mr-1" />}
              Tunjuk Penasehat
            </Button>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 3: KONFIRMASI TRANSISI KE ANGGOTA LUAR BIASA           */}
      {/* ============================================================ */}
      <Modal
        isOpen={!!transisiTarget}
        onClose={() => setTransisiTarget(null)}
        title="Konfirmasi Transisi Anggota Luar Biasa (Alumni)"
        description="Pencatatan alumni yang telah lulus/wisuda secara permanen."
        maxWidth="md"
      >
        {transisiTarget && (
          <>
            <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-900/50 space-y-1 text-xs">
              <p className="font-bold text-white">{transisiTarget.nama}</p>
              <p className="text-emerald-400 font-mono">NIA: {transisiTarget.nia || '-'}</p>
              <p className="text-stone-400">Prodi: {transisiTarget.jurusan || 'FPTI UPI'}</p>
            </div>

            <form onSubmit={handleConfirmTransisi} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tanggal Lulus / Wisuda:
                </label>
                <input
                  type="date"
                  required
                  value={transisiForm.tanggal_transisi}
                  onChange={(e) => setTransisiForm((p) => ({ ...p, tanggal_transisi: e.target.value }))}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Catatan Laporan Lisan / Verifikasi Admin:
                </label>
                <textarea
                  rows={3}
                  required
                  value={transisiForm.catatan}
                  onChange={(e) => setTransisiForm((p) => ({ ...p, catatan: e.target.value }))}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-indigo-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  Perhatian: Status Anggota Luar Biasa bersifat <strong>permanen</strong>. Anggota tidak dapat dikembalikan ke status Anggota Biasa dan memenuhi syarat menjadi Dewan Penasehat.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
                <Button type="button" variant="secondary" onClick={() => setTransisiTarget(null)}>
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submittingTransisi}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  {submittingTransisi ? <Spinner className="w-3.5 h-3.5 mr-1" /> : <GraduationCap className="w-3.5 h-3.5 mr-1" />}
                  Konfirmasi Transisi ALB
                </Button>
              </div>
            </form>
          </>
        )}
      </Modal>
    </div>
  );
}
