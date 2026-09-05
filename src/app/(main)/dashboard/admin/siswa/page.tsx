'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchRekapKelulusanSiswa,
  decideKelulusanSiswa,
  fetchSesiKegiatanList,
  createSesiKegiatan,
  fetchPresensiSesi,
  savePresensiBatch,
  createMateriWithSoal,
} from '@/lib/actions/admin-siswa';
import { fetchMateriList } from '@/lib/actions/siswa';
import type {
  RekapKelulusanSiswaItem,
  SesiKegiatanItem,
  PresensiSiswaItem,
  MateriKaderisasiItem,
} from '@/lib/types/siswa';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { StatCard, StatGrid } from '@/components/ui/StatCard';
import {
  Award,
  Users,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  ShieldCheck,
  Plus,
  BookOpen,
  Calendar,
  Save,
  CheckSquare,
  AlertTriangle,
  X,
  FileText,
  UserCheck,
  Check,
  HelpCircle,
} from 'lucide-react';

export default function AdminSiswaPage() {
  const [activeTab, setActiveTab] = useState<'rekap' | 'presensi' | 'materi'>('rekap');

  // Rekap state
  const [rekapList, setRekapList] = useState<RekapKelulusanSiswaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'dalam_proses' | 'lolos' | 'gugur'>('all');
  const [loadingRekap, setLoadingRekap] = useState(true);

  // Decision modal state
  const [decisionTarget, setDecisionTarget] = useState<RekapKelulusanSiswaItem | null>(null);
  const [decisionType, setDecisionType] = useState<'lolos' | 'gugur'>('lolos');
  const [decisionNote, setDecisionNote] = useState('');
  const [submittingDecision, setSubmittingDecision] = useState(false);

  // Presensi state
  const [sesiList, setSesiList] = useState<SesiKegiatanItem[]>([]);
  const [selectedSesiId, setSelectedSesiId] = useState<string>('');
  const [presensiItems, setPresensiItems] = useState<PresensiSiswaItem[]>([]);
  const [loadingPresensi, setLoadingPresensi] = useState(false);
  const [savingPresensi, setSavingPresensi] = useState(false);

  // Sesi modal state
  const [showAddSesiModal, setShowAddSesiModal] = useState(false);
  const [sesiForm, setSesiForm] = useState({
    jenis_kegiatan: 'bina_jasmani' as const,
    judul: '',
    tanggal: new Date().toISOString().split('T')[0],
    catatan: '',
  });
  const [submittingSesi, setSubmittingSesi] = useState(false);

  // Materi & Soal state
  const [materiList, setMateriList] = useState<MateriKaderisasiItem[]>([]);
  const [loadingMateri, setLoadingMateri] = useState(false);
  const [showAddMateriModal, setShowAddMateriModal] = useState(false);
  const [materiForm, setMateriForm] = useState({
    judul: '',
    tanggal: new Date().toISOString().split('T')[0],
  });
  const [soalListForm, setSoalListForm] = useState<
    { pertanyaan: string; pilihan: string[]; jawaban_benar: string }[]
  >([
    {
      pertanyaan: '',
      pilihan: ['', '', '', ''],
      jawaban_benar: '',
    },
  ]);
  const [submittingMateri, setSubmittingMateri] = useState(false);

  // Toast / feedback message
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 1. Load Rekap Data
  const loadRekap = useCallback(async () => {
    setLoadingRekap(true);
    const data = await fetchRekapKelulusanSiswa();
    setRekapList(data);
    setLoadingRekap(false);
  }, []);

  // 2. Load Sesi Data
  const loadSesi = useCallback(async () => {
    const list = await fetchSesiKegiatanList();
    setSesiList(list);
    if (list.length > 0 && !selectedSesiId) {
      setSelectedSesiId(list[0].id);
    }
  }, [selectedSesiId]);

  // 3. Load Presensi for Selected Sesi
  const loadPresensiForSesi = useCallback(async (sesiId: string) => {
    if (!sesiId) return;
    setLoadingPresensi(true);
    const presensi = await fetchPresensiSesi(sesiId);
    setPresensiItems(presensi);
    setLoadingPresensi(false);
  }, []);

  // 4. Load Materi Data
  const loadMateri = useCallback(async () => {
    setLoadingMateri(true);
    const list = await fetchMateriList();
    setMateriList(list);
    setLoadingMateri(false);
  }, []);

  useEffect(() => {
    loadRekap();
    loadSesi();
    loadMateri();
  }, [loadRekap, loadSesi, loadMateri]);

  useEffect(() => {
    if (selectedSesiId) {
      loadPresensiForSesi(selectedSesiId);
    }
  }, [selectedSesiId, loadPresensiForSesi]);

  // Filtered rekap list
  const filteredRekap = rekapList.filter((item) => {
    const matchesQuery =
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.nim && item.nim.includes(searchQuery)) ||
      (item.jurusan && item.jurusan.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ? true : item.status_kelulusan === statusFilter;

    return matchesQuery && matchesStatus;
  });

  // Rekap Stats
  const totalSiswa = rekapList.length;
  const avgJasmani =
    totalSiswa > 0
      ? Math.round(rekapList.reduce((a, b) => a + b.persentase_jasmani, 0) / totalSiswa)
      : 0;
  const avgPostTest =
    totalSiswa > 0
      ? Math.round(rekapList.reduce((a, b) => a + b.rata_rata_post_test, 0) / totalSiswa)
      : 0;
  const readyToPass = rekapList.filter(
    (s) =>
      s.persentase_jasmani >= 80 &&
      s.rata_rata_post_test >= 75 &&
      s.persentase_alat >= 80 &&
      s.tes_kesehatan_akhir_ada
  ).length;

  // Handle Decision Submit
  const handleExecuteDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionTarget) return;

    setSubmittingDecision(true);
    const res = await decideKelulusanSiswa(
      decisionTarget.id,
      decisionType,
      decisionNote
    );
    setSubmittingDecision(false);
    setDecisionTarget(null);
    setDecisionNote('');

    if (res.success) {
      setFeedback({ type: 'success', text: res.message || 'Keputusan berhasil disimpan!' });
      loadRekap();
    } else {
      setFeedback({ type: 'error', text: res.error || 'Gagal menyimpan keputusan.' });
    }
  };

  // Handle Presensi Item Change
  const handleTogglePresensi = (anggotaId: string) => {
    setPresensiItems((prev) =>
      prev.map((item) =>
        item.anggota_id === anggotaId ? { ...item, hadir: !item.hadir } : item
      )
    );
  };

  const handlePresensiNoteChange = (anggotaId: string, note: string) => {
    setPresensiItems((prev) =>
      prev.map((item) =>
        item.anggota_id === anggotaId ? { ...item, catatan: note } : item
      )
    );
  };

  const handleMarkAllPresent = () => {
    setPresensiItems((prev) => prev.map((item) => ({ ...item, hadir: true })));
  };

  // Handle Save Presensi Batch
  const handleSavePresensi = async () => {
    if (!selectedSesiId) return;
    setSavingPresensi(true);
    const payload = presensiItems.map((p) => ({
      anggota_id: p.anggota_id,
      hadir: p.hadir,
      catatan: p.catatan,
    }));
    const res = await savePresensiBatch(selectedSesiId, payload);
    setSavingPresensi(false);

    if (res.success) {
      setFeedback({ type: 'success', text: res.message || 'Presensi berhasil disimpan!' });
      loadRekap(); // Update graduation recap as well
    } else {
      setFeedback({ type: 'error', text: res.error || 'Gagal menyimpan presensi.' });
    }
  };

  // Handle Create Sesi
  const handleCreateSesiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sesiForm.judul) return;

    setSubmittingSesi(true);
    const res = await createSesiKegiatan({
      jenis_kegiatan: sesiForm.jenis_kegiatan,
      judul: sesiForm.judul,
      tanggal: sesiForm.tanggal,
      catatan: sesiForm.catatan,
    });
    setSubmittingSesi(false);
    setShowAddSesiModal(false);
    setSesiForm({
      jenis_kegiatan: 'bina_jasmani',
      judul: '',
      tanggal: new Date().toISOString().split('T')[0],
      catatan: '',
    });

    if (res.success) {
      setFeedback({ type: 'success', text: res.message || 'Sesi berhasil dibuat!' });
      loadSesi();
    } else {
      setFeedback({ type: 'error', text: res.error || 'Gagal membuat sesi kegiatan.' });
    }
  };

  // Handle Add Question to Materi Form
  const handleAddQuestionField = () => {
    setSoalListForm((prev) => [
      ...prev,
      {
        pertanyaan: '',
        pilihan: ['', '', '', ''],
        jawaban_benar: '',
      },
    ]);
  };

  const handleUpdateQuestion = (index: number, field: string, value: any) => {
    setSoalListForm((prev) => {
      const copy = [...prev];
      if (field === 'pertanyaan') {
        copy[index].pertanyaan = value;
      } else if (field === 'jawaban_benar') {
        copy[index].jawaban_benar = value;
      }
      return copy;
    });
  };

  const handleUpdateChoice = (qIndex: number, cIndex: number, value: string) => {
    setSoalListForm((prev) => {
      const copy = [...prev];
      copy[qIndex].pilihan[cIndex] = value;
      return copy;
    });
  };

  const handleRemoveQuestion = (index: number) => {
    if (soalListForm.length === 1) return;
    setSoalListForm((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle Create Materi & Soal Submit
  const handleCreateMateriSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materiForm.judul) return;

    // Validate questions
    for (let i = 0; i < soalListForm.length; i++) {
      const q = soalListForm[i];
      if (!q.pertanyaan || !q.jawaban_benar) {
        setFeedback({
          type: 'error',
          text: `Harap lengkapi pertanyaan dan kunci jawaban untuk Soal #${i + 1}`,
        });
        return;
      }
    }

    setSubmittingMateri(true);
    const res = await createMateriWithSoal(materiForm, soalListForm);
    setSubmittingMateri(false);
    setShowAddMateriModal(false);
    setMateriForm({
      judul: '',
      tanggal: new Date().toISOString().split('T')[0],
    });
    setSoalListForm([
      {
        pertanyaan: '',
        pilihan: ['', '', '', ''],
        jawaban_benar: '',
      },
    ]);

    if (res.success) {
      setFeedback({ type: 'success', text: res.message || 'Materi & Kuis berhasil dibuat!' });
      loadMateri();
    } else {
      setFeedback({ type: 'error', text: res.error || 'Gagal membuat modul materi.' });
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Kelola & Evaluasi Tahap Siswa
              </h1>
              <p className="text-sm text-slate-400">
                Presensi latihan, modul pematerian & kuis post-test, serta Sidang Kelulusan Dewan Pengurus (DP).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddSesiModal(true)}
            className="flex items-center gap-2 border-slate-700 text-slate-300 hover:text-white"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            Tambah Sesi Kegiatan
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddMateriModal(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40"
          >
            <BookOpen className="w-4 h-4" />
            Buat Modul & Soal Kuis
          </Button>
        </div>
      </div>

      {/* Feedback Toast Banner */}
      {feedback && (
        <Alert
          type={feedback.type}
          message={feedback.text}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('rekap')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'rekap'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Sidang Kelulusan DP
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {rekapList.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('presensi')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'presensi'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          Presensi Bina Jasmani & Sesi
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {sesiList.length} Sesi
          </span>
        </button>
        <button
          onClick={() => setActiveTab('materi')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'materi'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Modul & Soal Post-Test
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {materiList.length} Modul
          </span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: REKAP KELULUSAN (DEWAN PENGURUS)                       */}
      {/* ============================================================ */}
      {activeTab === 'rekap' && (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <StatGrid columns={4}>
            <StatCard
              icon={Users}
              label="Total Siswa Aktif"
              value={totalSiswa}
              subtext="Kandidat ekspedisi"
              color="emerald"
            />
            <StatCard
              icon={Activity}
              label="Rata-rata Jasmani"
              value={`${avgJasmani}%`}
              subtext="Target: min. 80%"
              color="blue"
            />
            <StatCard
              icon={BookOpen}
              label="Rata-rata Post-Test"
              value={`${avgPostTest} / 100`}
              subtext="Target: min. 75"
              color="amber"
            />
            <StatCard
              icon={ShieldCheck}
              label="Kandidat Siap Lolos"
              value={readyToPass}
              subtext="Prasyarat terpenuhi"
              color="purple"
            />
          </StatGrid>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Cari nama, NIM, atau jurusan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full sm:w-auto px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">Semua Status DP</option>
                <option value="dalam_proses">Dalam Proses Evaluasi</option>
                <option value="lolos">Lolos ke Medan Operasi</option>
                <option value="gugur">Gugur</option>
              </select>
            </div>
          </div>

          {/* Table of Siswa */}
          {loadingRekap ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Spinner className="w-8 h-8 text-emerald-500 mb-3" />
              <p className="text-sm">Memuat rekapitulasi performa siswa...</p>
            </div>
          ) : filteredRekap.length === 0 ? (
            <Card className="p-12 text-center bg-slate-900/30 border-slate-800">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 font-medium">Tidak ada data siswa ditemukan</p>
              <p className="text-slate-500 text-sm mt-1">Coba sesuaikan kata kunci atau filter status.</p>
            </Card>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/80 text-xs uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Siswa & Identitas</th>
                    <th className="px-5 py-3 font-semibold">Bina Jasmani</th>
                    <th className="px-5 py-3 font-semibold">Post-Test Materi</th>
                    <th className="px-5 py-3 font-semibold">Alat Siswa</th>
                    <th className="px-5 py-3 font-semibold">Surat Dokter</th>
                    <th className="px-5 py-3 font-semibold">Status Sidang DP</th>
                    <th className="px-5 py-3 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredRekap.map((item) => {
                    const isAllMet =
                      item.persentase_jasmani >= 80 &&
                      item.rata_rata_post_test >= 75 &&
                      item.persentase_alat >= 80 &&
                      item.tes_kesehatan_akhir_ada;

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-white">{item.nama}</div>
                          <div className="text-xs text-slate-400">
                            NIM: {item.nim || '-'} &bull; {item.jurusan || 'FPTI UPI'}
                          </div>
                          {item.status_keanggotaan === 'medan_operasi' && (
                            <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              Medan Operasi
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-semibold ${
                                item.persentase_jasmani >= 80 ? 'text-emerald-400' : 'text-amber-400'
                              }`}
                            >
                              {item.persentase_jasmani}%
                            </span>
                            <span className="text-xs text-slate-500">
                              ({item.kehadiran_jasmani}/{item.total_sesi_jasmani} sesi)
                            </span>
                          </div>
                          <div className="w-28 h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                item.persentase_jasmani >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.min(100, item.persentase_jasmani)}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-semibold ${
                                item.rata_rata_post_test >= 75 ? 'text-emerald-400' : 'text-amber-400'
                              }`}
                            >
                              {item.rata_rata_post_test}
                            </span>
                            <span className="text-xs text-slate-500">
                              ({item.materi_dikerjakan}/{item.total_materi} modul)
                            </span>
                          </div>
                          <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                item.rata_rata_post_test >= 75 ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.min(100, item.rata_rata_post_test)}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-semibold ${
                                item.persentase_alat >= 80 ? 'text-emerald-400' : 'text-amber-400'
                              }`}
                            >
                              {item.persentase_alat}%
                            </span>
                            <span className="text-xs text-slate-500">
                              ({item.alat_lengkap}/{item.total_alat})
                            </span>
                          </div>
                          <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                item.persentase_alat >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.min(100, item.persentase_alat)}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {item.tes_kesehatan_akhir_ada ? (
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Lengkap
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                              <Clock className="w-3.5 h-3.5" />
                              Belum Upload
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {item.status_kelulusan === 'lolos' ? (
                            <div>
                              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                                <Check className="w-3.5 h-3.5" />
                                Lolos DP
                              </span>
                              {item.approver_nama && (
                                <p className="text-[11px] text-slate-500 mt-1">
                                  Oleh: {item.approver_nama}
                                </p>
                              )}
                            </div>
                          ) : item.status_kelulusan === 'gugur' ? (
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                              <X className="w-3.5 h-3.5" />
                              Gugur
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                              <Clock className="w-3.5 h-3.5" />
                              Dalam Proses
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setDecisionTarget(item);
                              setDecisionType(isAllMet ? 'lolos' : 'gugur');
                              setDecisionNote(item.catatan_kelulusan || '');
                            }}
                            className="border-slate-700 hover:border-emerald-500/50 text-xs text-slate-300 hover:text-white"
                          >
                            Evaluasi & DP
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: PRESENSI BINA JASMANI & SESI                          */}
      {/* ============================================================ */}
      {activeTab === 'presensi' && (
        <div className="space-y-6">
          {/* Sesi Selector and Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/40 p-5 rounded-xl border border-slate-800">
            <div className="w-full sm:w-auto flex-1 max-w-xl">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Pilih Sesi Kegiatan Kaderisasi:
              </label>
              <select
                value={selectedSesiId}
                onChange={(e) => setSelectedSesiId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {sesiList.map((s) => (
                  <option key={s.id} value={s.id}>
                    [{s.jenis_kegiatan.toUpperCase()}] {s.judul} - ({s.tanggal})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllPresent}
                className="border-slate-700 text-slate-300 text-xs"
              >
                <CheckSquare className="w-4 h-4 text-emerald-400 mr-1.5" />
                Tandai Semua Hadir
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSavePresensi}
                disabled={savingPresensi || presensiItems.length === 0}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs shadow-md shadow-emerald-950/40"
              >
                {savingPresensi ? (
                  <Spinner className="w-4 h-4 mr-1.5" />
                ) : (
                  <Save className="w-4 h-4 mr-1.5" />
                )}
                Simpan Presensi Sesi
              </Button>
            </div>
          </div>

          {/* Active Sesi Info */}
          {selectedSesiId && (
            <div className="bg-slate-900/20 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>
                  Sesi Aktif:{' '}
                  <strong className="text-white">
                    {sesiList.find((s) => s.id === selectedSesiId)?.judul}
                  </strong>
                </span>
              </div>
              <div>
                Catatan: {sesiList.find((s) => s.id === selectedSesiId)?.catatan || '-'}
              </div>
            </div>
          )}

          {/* Presensi Table */}
          {loadingPresensi ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Spinner className="w-8 h-8 text-emerald-500 mb-3" />
              <p className="text-sm">Memuat daftar presensi siswa...</p>
            </div>
          ) : presensiItems.length === 0 ? (
            <Card className="p-10 text-center bg-slate-900/30 border-slate-800">
              <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-300 text-sm font-medium">
                Belum ada siswa terdaftar pada sesi ini
              </p>
            </Card>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/80 text-xs uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3 w-16 text-center">Status</th>
                    <th className="px-5 py-3 font-semibold">Nama Siswa</th>
                    <th className="px-5 py-3 font-semibold">NIM</th>
                    <th className="px-5 py-3 font-semibold">Catatan Kehadiran / Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {presensiItems.map((item) => (
                    <tr
                      key={item.anggota_id}
                      className={`hover:bg-slate-800/30 transition-colors ${
                        item.hadir ? 'bg-emerald-500/5' : ''
                      }`}
                    >
                      <td className="px-5 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={item.hadir}
                          onChange={() => handleTogglePresensi(item.anggota_id)}
                          className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer accent-emerald-500"
                        />
                      </td>
                      <td className="px-5 py-4 font-semibold text-white">
                        {item.anggota_nama}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400">
                        {item.anggota_nim || '-'}
                      </td>
                      <td className="px-5 py-4">
                        <input
                          type="text"
                          placeholder={item.hadir ? 'Hadir (Opsional catatan)' : 'Alasan tidak hadir (Sakit, izin praktikum, dll)'}
                          value={item.catatan || ''}
                          onChange={(e) =>
                            handlePresensiNoteChange(item.anggota_id, e.target.value)
                          }
                          className="w-full max-w-md px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: MODUL PEMATERIAN & SOAL POST-TEST                     */}
      {/* ============================================================ */}
      {activeTab === 'materi' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-slate-900/40 p-5 rounded-xl border border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">Bank Modul & Post-Test Kaderisasi</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Kunci jawaban disimpan terpisah di tabel aman dan dievaluasi via RPC Server-Side.
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setShowAddMateriModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Buat Modul Baru
            </Button>
          </div>

          {loadingMateri ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Spinner className="w-8 h-8 text-emerald-500 mb-3" />
              <p className="text-sm">Memuat modul pematerian...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {materiList.map((m) => (
                <Card
                  key={m.id}
                  className="p-5 bg-slate-900/60 border-slate-800/80 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Modul Kurikulum
                      </span>
                      <h3 className="text-base font-semibold text-white mt-1">{m.judul}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        Jadwal: {m.tanggal}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-800/60 rounded-xl text-slate-400">
                      <BookOpen className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Total Soal Evaluasi: <strong className="text-white">{m.total_soal} Soal</strong>
                    </span>
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      RPC Server-Side Graded
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: KEPUTUSAN SIDANG KELULUSAN DP                        */}
      {/* ============================================================ */}
      {decisionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Sidang Kelulusan Dewan Pengurus (DP)
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  Keputusan Tahap Siswa: {decisionTarget.nama}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  NIM: {decisionTarget.nim || '-'} &bull; {decisionTarget.jurusan}
                </p>
              </div>
              <button
                onClick={() => setDecisionTarget(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Performance Summary Pill */}
            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-center text-xs">
              <div>
                <p className="text-slate-500 text-[10px]">Jasmani</p>
                <p
                  className={`font-bold mt-0.5 ${
                    decisionTarget.persentase_jasmani >= 80 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {decisionTarget.persentase_jasmani}%
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px]">Post-Test</p>
                <p
                  className={`font-bold mt-0.5 ${
                    decisionTarget.rata_rata_post_test >= 75 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {decisionTarget.rata_rata_post_test}
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px]">Alat Lengkap</p>
                <p
                  className={`font-bold mt-0.5 ${
                    decisionTarget.persentase_alat >= 80 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {decisionTarget.persentase_alat}%
                </p>
              </div>
            </div>

            <form onSubmit={handleExecuteDecision} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Keputusan Akhir Ketua DP:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDecisionType('lolos')}
                    className={`p-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                      decisionType === 'lolos'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 ring-2 ring-emerald-500/20'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Loloskan ke Medan Operasi
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecisionType('gugur')}
                    className={`p-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                      decisionType === 'gugur'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400 ring-2 ring-rose-500/20'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <XCircle className="w-4 h-4 text-rose-400" />
                    Gugurkan Siswa
                  </button>
                </div>
              </div>

              {decisionType === 'lolos' && (
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
                  <ShieldCheck className="w-4 h-4 inline mr-1.5 text-indigo-400" />
                  <strong>Otomasi Sistem:</strong> Trigger{' '}
                  <code className="bg-slate-950 px-1 py-0.5 rounded text-indigo-200">
                    trg_sync_status_kaderisasi
                  </code>{' '}
                  akan langsung mengubah status keanggotaan menjadi{' '}
                  <strong className="text-white">medan_operasi</strong>.
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Catatan Sidang & Rekomendasi Lapangan (Wajib):
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Contoh: Performa jasmani dan navigasi konsisten. Rekomendasi peran navigator tim ekspedisi..."
                  value={decisionNote}
                  onChange={(e) => setDecisionNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDecisionTarget(null)}
                  className="border-slate-800 text-slate-400 hover:text-white"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submittingDecision || !decisionNote}
                  className={
                    decisionType === 'lolos'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-rose-600 hover:bg-rose-500 text-white'
                  }
                >
                  {submittingDecision ? (
                    <Spinner className="w-4 h-4 mr-1.5" />
                  ) : decisionType === 'lolos' ? (
                    <Check className="w-4 h-4 mr-1.5" />
                  ) : (
                    <X className="w-4 h-4 mr-1.5" />
                  )}
                  Eksekusi Keputusan DP
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: TAMBAH SESI KEGIATAN                                  */}
      {/* ============================================================ */}
      {showAddSesiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Tambah Sesi Kegiatan</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Jadwalkan latihan fisik atau sesi kelas untuk tahap siswa
                </p>
              </div>
              <button
                onClick={() => setShowAddSesiModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSesiSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Jenis Kegiatan:
                </label>
                <select
                  value={sesiForm.jenis_kegiatan}
                  onChange={(e) =>
                    setSesiForm((prev) => ({
                      ...prev,
                      jenis_kegiatan: e.target.value as any,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="bina_jasmani">Bina Jasmani / Fisik</option>
                  <option value="pematerian">Pematerian Kelas</option>
                  <option value="presentasi">Presentasi Proposal</option>
                  <option value="pendakian">Simulasi Lapangan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Judul Sesi:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bina Jasmani Sesi 3: Lari & Beban Carrier"
                  value={sesiForm.judul}
                  onChange={(e) =>
                    setSesiForm((prev) => ({ ...prev, judul: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Tanggal Kegiatan:
                </label>
                <input
                  type="date"
                  required
                  value={sesiForm.tanggal}
                  onChange={(e) =>
                    setSesiForm((prev) => ({ ...prev, tanggal: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Catatan / Lokasi (Opsional):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Lapangan Atletik FPTI UPI, kumpul pukul 06.00 WIB"
                  value={sesiForm.catatan}
                  onChange={(e) =>
                    setSesiForm((prev) => ({ ...prev, catatan: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddSesiModal(false)}
                  className="border-slate-800 text-slate-400 hover:text-white"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submittingSesi}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  {submittingSesi ? <Spinner className="w-4 h-4 mr-1.5" /> : null}
                  Simpan Sesi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: TAMBAH MODUL PEMATERIAN & SOAL POST-TEST             */}
      {/* ============================================================ */}
      {showAddMateriModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Buat Modul Pematerian & Soal Kuis</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Soal kuis akan dievaluasi secara aman menggunakan RPC Supabase.
                </p>
              </div>
              <button
                onClick={() => setShowAddMateriModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMateriSubmit} className="space-y-6">
              {/* Module Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Judul Modul:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Manajemen Tali-Temali & Pionering"
                    value={materiForm.judul}
                    onChange={(e) =>
                      setMateriForm((prev) => ({ ...prev, judul: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Tanggal Pematerian:
                  </label>
                  <input
                    type="date"
                    required
                    value={materiForm.tanggal}
                    onChange={(e) =>
                      setMateriForm((prev) => ({ ...prev, tanggal: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Questions Section */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4" />
                    Daftar Soal Post-Test ({soalListForm.length} Soal)
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddQuestionField}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Soal
                  </button>
                </div>

                {soalListForm.map((q, qIndex) => (
                  <div
                    key={qIndex}
                    className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">
                        Soal #{qIndex + 1}
                      </span>
                      {soalListForm.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(qIndex)}
                          className="text-xs text-rose-400 hover:text-rose-300"
                        >
                          Hapus
                        </button>
                      )}
                    </div>

                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Tuliskan pertanyaan soal di sini..."
                        value={q.pertanyaan}
                        onChange={(e) =>
                          handleUpdateQuestion(qIndex, 'pertanyaan', e.target.value)
                        }
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {['A', 'B', 'C', 'D'].map((label, cIndex) => (
                        <div key={label} className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500 w-4">{label}.</span>
                          <input
                            type="text"
                            required
                            placeholder={`Pilihan ${label}`}
                            value={q.pilihan[cIndex]}
                            onChange={(e) =>
                              handleUpdateChoice(qIndex, cIndex, e.target.value)
                            }
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Kunci Jawaban Benar (Kerahasiaan Dijamin):
                      </label>
                      <select
                        value={q.jawaban_benar}
                        onChange={(e) =>
                          handleUpdateQuestion(qIndex, 'jawaban_benar', e.target.value)
                        }
                        required
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-emerald-400 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="">-- Pilih Jawaban Benar --</option>
                        {q.pilihan.map((p, idx) => {
                          const label = ['A', 'B', 'C', 'D'][idx];
                          return (
                            <option key={idx} value={p || label}>
                              Pilihan {label}: {p || `(Kosong)`}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddMateriModal(false)}
                  className="border-slate-800 text-slate-400 hover:text-white"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submittingMateri}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  {submittingMateri ? <Spinner className="w-4 h-4 mr-1.5" /> : null}
                  Simpan Modul & Soal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
