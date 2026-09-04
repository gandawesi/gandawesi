'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchAngkatanDiklatList,
  fetchPesertaMedanOperasi,
  fetchEvaluasiIndividuList,
  submitEvaluasiIndividu,
  fetchEvaluasiKelompokList,
  submitEvaluasiKelompok,
  updateNamaAngkatan,
  decideKelulusanMedanOperasi,
  executeBatchKelulusanMedanOperasi,
} from '@/lib/actions/medan-operasi';
import type {
  PesertaMedanOperasiItem,
  EvaluasiIndividuItem,
  EvaluasiKelompokItem,
  AngkatanDiklatItem,
} from '@/lib/types/medan-operasi';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import {
  Compass,
  Users,
  Award,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Plus,
  Calendar,
  Save,
  ShieldCheck,
  X,
  FileText,
  UserX,
  Sparkles,
  Mountain,
  Eye,
} from 'lucide-react';

export default function AdminMedanOperasiPage() {
  const [activeTab, setActiveTab] = useState<'individu' | 'kelompok' | 'pelantikan'>('individu');

  // Angkatan State
  const [angkatanList, setAngkatanList] = useState<AngkatanDiklatItem[]>([]);
  const [selectedAngkatanId, setSelectedAngkatanId] = useState<string>('all');

  // Peserta State
  const [pesertaList, setPesertaList] = useState<PesertaMedanOperasiItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'dalam_proses' | 'lolos' | 'gugur'>('all');
  const [loading, setLoading] = useState(true);

  // Evaluasi Kelompok State
  const [evalKelompokList, setEvalKelompokList] = useState<EvaluasiKelompokItem[]>([]);
  const [loadingKelompok, setLoadingKelompok] = useState(false);
  const [showAddKelompokModal, setShowAddKelompokModal] = useState(false);
  const [kelompokNote, setKelompokNote] = useState('');
  const [submittingKelompok, setSubmittingKelompok] = useState(false);

  // Modal: Input Evaluasi Individu
  const [evalTarget, setEvalTarget] = useState<PesertaMedanOperasiItem | null>(null);
  const [evalSkor, setEvalSkor] = useState<number>(85);
  const [evalCatatan, setEvalCatatan] = useState<string>('');
  const [submittingEval, setSubmittingEval] = useState(false);

  // Modal: Detail Riwayat Evaluasi
  const [historyTarget, setHistoryTarget] = useState<PesertaMedanOperasiItem | null>(null);
  const [historyList, setHistoryList] = useState<EvaluasiIndividuItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Modal: Pencatatan Gugur di Tengah Proses
  const [gugurTarget, setGugurTarget] = useState<PesertaMedanOperasiItem | null>(null);
  const [gugurAlasan, setGugurAlasan] = useState<string>('');
  const [submittingGugur, setSubmittingGugur] = useState(false);

  // Tab Pelantikan State (Musyawarah Nama Angkatan & Batch Graduation)
  const [namaAngkatanInput, setNamaAngkatanInput] = useState('');
  const [savingNamaAngkatan, setSavingNamaAngkatan] = useState(false);
  const [selectedBatchMemberIds, setSelectedBatchMemberIds] = useState<string[]>([]);
  const [batchNote, setBatchNote] = useState('Dinyatakan lolos dan resmi dilantik menjadi Anggota Muda.');
  const [submittingBatch, setSubmittingBatch] = useState(false);

  // Toast Banner
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 1. Load Angkatan
  const loadAngkatan = useCallback(async () => {
    const list = await fetchAngkatanDiklatList();
    setAngkatanList(list);
    if (list.length > 0 && selectedAngkatanId === 'all') {
      // Pick first active or latest
      const ang32 = list.find((a) => a.nomor_angkatan === 32);
      if (ang32) {
        setSelectedAngkatanId(ang32.id);
        setNamaAngkatanInput(ang32.nama_angkatan || '');
      }
    }
  }, [selectedAngkatanId]);

  // 2. Load Peserta
  const loadPeserta = useCallback(async (angkatanId: string) => {
    setLoading(true);
    const data = await fetchPesertaMedanOperasi(angkatanId);
    setPesertaList(data);
    // Pre-select non-gugur candidates for batch graduation
    const eligible = data.filter((p) => !p.is_gugur).map((p) => p.id);
    setSelectedBatchMemberIds(eligible);
    setLoading(false);
  }, []);

  // 3. Load Evaluasi Kelompok
  const loadKelompok = useCallback(async (angkatanId: string) => {
    if (!angkatanId || angkatanId === 'all') return;
    setLoadingKelompok(true);
    const data = await fetchEvaluasiKelompokList(angkatanId);
    setEvalKelompokList(data);
    setLoadingKelompok(false);
  }, []);

  useEffect(() => {
    loadAngkatan();
  }, [loadAngkatan]);

  useEffect(() => {
    if (selectedAngkatanId) {
      loadPeserta(selectedAngkatanId);
      loadKelompok(selectedAngkatanId);

      const currAng = angkatanList.find((a) => a.id === selectedAngkatanId);
      if (currAng) {
        setNamaAngkatanInput(currAng.nama_angkatan || '');
      }
    }
  }, [selectedAngkatanId, loadPeserta, loadKelompok, angkatanList]);

  // Filtered Peserta
  const filteredPeserta = pesertaList.filter((item) => {
    const matchesQuery =
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.nim && item.nim.includes(searchQuery)) ||
      (item.jurusan && item.jurusan.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ? true : item.status_tahap === statusFilter;

    return matchesQuery && matchesStatus;
  });

  // Aggregates
  const totalPeserta = pesertaList.length;
  const avgSkorTotal =
    totalPeserta > 0
      ? Math.round(pesertaList.reduce((a, b) => a + b.rata_rata_skor, 0) / totalPeserta)
      : 0;
  const totalGugur = pesertaList.filter((p) => p.is_gugur || p.status_tahap === 'gugur').length;
  const totalLolos = pesertaList.filter(
    (p) => p.status_keanggotaan === 'anggota_muda' || p.status_tahap === 'lolos'
  ).length;

  // Handler: Submit Evaluasi Individu
  const handleSubmitEvaluasi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalTarget) return;

    setSubmittingEval(true);
    const res = await submitEvaluasiIndividu({
      anggota_id: evalTarget.id,
      skor: Number(evalSkor),
      catatan: evalCatatan,
    });
    setSubmittingEval(false);
    setEvalTarget(null);
    setEvalCatatan('');

    if (res.success) {
      setFeedback({ type: 'success', text: res.message || 'Evaluasi lapangan berhasil dicatat!' });
      loadPeserta(selectedAngkatanId);
    } else {
      setFeedback({ type: 'error', text: res.error || 'Gagal menyimpan evaluasi.' });
    }
  };

  // Handler: Open History
  const handleOpenHistory = async (peserta: PesertaMedanOperasiItem) => {
    setHistoryTarget(peserta);
    setLoadingHistory(true);
    const list = await fetchEvaluasiIndividuList(peserta.id);
    setHistoryList(list);
    setLoadingHistory(false);
  };

  // Handler: Submit Gugur Lapangan
  const handleSubmitGugur = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gugurTarget) return;

    setSubmittingGugur(true);
    const res = await decideKelulusanMedanOperasi({
      anggota_id: gugurTarget.id,
      decision: 'gugur',
      catatan: gugurAlasan,
    });
    setSubmittingGugur(false);
    setGugurTarget(null);
    setGugurAlasan('');

    if (res.success) {
      setFeedback({ type: 'success', text: res.message || 'Pencatatan gugur berhasil disimpan.' });
      loadPeserta(selectedAngkatanId);
    } else {
      setFeedback({ type: 'error', text: res.error || 'Gagal mencatat peserta gugur.' });
    }
  };

  // Handler: Submit Evaluasi Kelompok
  const handleSubmitKelompok = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kelompokNote || !selectedAngkatanId) return;

    setSubmittingKelompok(true);
    const res = await submitEvaluasiKelompok({
      angkatan_id: selectedAngkatanId,
      catatan: kelompokNote,
    });
    setSubmittingKelompok(false);
    setShowAddKelompokModal(false);
    setKelompokNote('');

    if (res.success) {
      setFeedback({ type: 'success', text: res.message || 'Evaluasi tim berhasil disimpan!' });
      loadKelompok(selectedAngkatanId);
    } else {
      setFeedback({ type: 'error', text: res.error || 'Gagal menyimpan evaluasi tim.' });
    }
  };

  // Handler: Update Nama Angkatan
  const handleSaveNamaAngkatan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaAngkatanInput || !selectedAngkatanId) return;

    setSavingNamaAngkatan(true);
    const res = await updateNamaAngkatan(selectedAngkatanId, namaAngkatanInput);
    setSavingNamaAngkatan(false);

    if (res.success) {
      setFeedback({ type: 'success', text: res.message || 'Nama angkatan berhasil disimpan!' });
      loadAngkatan();
      loadPeserta(selectedAngkatanId);
    } else {
      setFeedback({ type: 'error', text: res.error || 'Gagal memperbarui nama angkatan.' });
    }
  };

  // Handler: Toggle Batch Member Selection
  const handleToggleBatchMember = (id: string) => {
    setSelectedBatchMemberIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  // Handler: Execute Batch Graduation
  const handleExecuteBatchGraduation = async () => {
    if (selectedBatchMemberIds.length === 0 || !selectedAngkatanId) return;

    setSubmittingBatch(true);
    const res = await executeBatchKelulusanMedanOperasi({
      angkatan_id: selectedAngkatanId,
      nama_angkatan: namaAngkatanInput,
      anggota_ids: selectedBatchMemberIds,
      catatan_kolektif: batchNote,
    });
    setSubmittingBatch(false);

    if (res.success) {
      setFeedback({ type: 'success', text: res.message || 'Pelantikan batch berhasil dieksekusi!' });
      loadPeserta(selectedAngkatanId);
    } else {
      setFeedback({ type: 'error', text: res.error || 'Gagal mengeksekusi pelantikan.' });
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-500/10 border border-forest-500/20 flex items-center justify-center text-forest-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Medan Operasi & Anggota Muda
              </h1>
              <p className="text-sm text-slate-400">
                Pencatatan evaluasi lapangan Danlat, penetapan nama angkatan, dan pelantikan otomatis Anggota Muda.
              </p>
            </div>
          </div>
        </div>

        {/* Angkatan Filter Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Angkatan:
          </label>
          <select
            value={selectedAngkatanId}
            onChange={(e) => setSelectedAngkatanId(e.target.value)}
            className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-medium text-emerald-400 focus:outline-none focus:border-emerald-500"
          >
            {angkatanList.map((a) => (
              <option key={a.id} value={a.id}>
                Angkatan {a.nomor_angkatan} {a.nama_angkatan ? `(${a.nama_angkatan})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Feedback Toast Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between animate-in fade-in slide-in-from-top-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-3">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            )}
            <p className="text-sm font-medium">{feedback.text}</p>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Aggregates Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-slate-900/60 border-slate-800/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Peserta Lapangan
              </p>
              <p className="text-2xl font-bold text-white mt-1">{totalPeserta}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Mountain className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Kandidat ekspedisi rimba lapangan</p>
        </Card>

        <Card className="p-5 bg-slate-900/60 border-slate-800/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Rata-rata Skor Danlat
              </p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{avgSkorTotal} / 100</p>
            </div>
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
              <Compass className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Navigasi, ketahanan, & kepemimpinan</p>
        </Card>

        <Card className="p-5 bg-slate-900/60 border-slate-800/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Gugur di Lapangan
              </p>
              <p className="text-2xl font-bold text-rose-400 mt-1">{totalGugur}</p>
            </div>
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
              <UserX className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Faktor cedera, sakit, atau etika</p>
        </Card>

        <Card className="p-5 bg-slate-900/60 border-slate-800/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Dilantik Anggota Muda
              </p>
              <p className="text-2xl font-bold text-indigo-400 mt-1">{totalLolos}</p>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Status keanggotaan ter-upgrade</p>
        </Card>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('individu')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'individu'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-4 h-4" />
          Evaluasi Lapangan Individu
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {pesertaList.length} Peserta
          </span>
        </button>
        <button
          onClick={() => setActiveTab('kelompok')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'kelompok'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          Evaluasi Kolektif Angkatan
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {evalKelompokList.length} Catatan
          </span>
        </button>
        <button
          onClick={() => setActiveTab('pelantikan')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'pelantikan'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          Sidang Pelantikan & Nama Angkatan
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
            Musyawarah
          </span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: EVALUASI LAPANGAN INDIVIDU                            */}
      {/* ============================================================ */}
      {activeTab === 'individu' && (
        <div className="space-y-6">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Cari nama, NIM, jurusan..."
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
                <option value="all">Semua Status Tahap</option>
                <option value="dalam_proses">Dalam Proses Operasi</option>
                <option value="lolos">Lolos / Anggota Muda</option>
                <option value="gugur">Gugur Lapangan</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Spinner className="w-8 h-8 text-emerald-500 mb-3" />
              <p className="text-sm">Memuat data peserta Medan Operasi...</p>
            </div>
          ) : filteredPeserta.length === 0 ? (
            <Card className="p-12 text-center bg-slate-900/30 border-slate-800">
              <Mountain className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 font-medium">Tidak ada peserta ditemukan</p>
              <p className="text-slate-500 text-sm mt-1">Coba ubah filter atau kata kunci pencarian.</p>
            </Card>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/80 text-xs uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Peserta</th>
                    <th className="px-5 py-3 font-semibold">Status Keanggotaan</th>
                    <th className="px-5 py-3 font-semibold">Skor Evaluasi Danlat</th>
                    <th className="px-5 py-3 font-semibold">Catatan Lapangan</th>
                    <th className="px-5 py-3 font-semibold">Status Kelulusan</th>
                    <th className="px-5 py-3 font-semibold text-right">Aksi Danlat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredPeserta.map((peserta) => (
                    <tr key={peserta.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={peserta.foto_profil} name={peserta.nama} size="sm" />
                          <div>
                            <div className="font-semibold text-white">{peserta.nama}</div>
                            <div className="text-xs text-slate-400">
                              NIM: {peserta.nim || '-'} &bull; {peserta.jurusan || 'FPTI UPI'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          status={peserta.status_keanggotaan as any}
                          subLabel={
                            peserta.status_keanggotaan === 'anggota_muda' && peserta.nama_angkatan
                              ? peserta.nama_angkatan
                              : undefined
                          }
                          size="sm"
                        />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold ${
                              peserta.rata_rata_skor >= 80 ? 'text-emerald-400' : 'text-amber-400'
                            }`}
                          >
                            {peserta.rata_rata_skor > 0 ? `${peserta.rata_rata_skor} / 100` : 'Belum Ada'}
                          </span>
                        </div>
                        {peserta.rata_rata_skor > 0 && (
                          <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${Math.min(100, peserta.rata_rata_skor)}%` }}
                            />
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleOpenHistory(peserta)}
                          className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-emerald-400 bg-slate-900 border border-slate-800 hover:border-emerald-500/30 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{peserta.total_evaluasi} Catatan</span>
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        {peserta.status_tahap === 'lolos' || peserta.status_keanggotaan === 'anggota_muda' ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Anggota Muda
                            </span>
                            {peserta.approver_nama && (
                              <p className="text-[11px] text-slate-500 mt-1">Oleh: {peserta.approver_nama}</p>
                            )}
                          </div>
                        ) : peserta.is_gugur || peserta.status_tahap === 'gugur' ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                            <XCircle className="w-3.5 h-3.5" />
                            Gugur Lapangan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            Operasi Berjalan
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEvalTarget(peserta);
                              setEvalSkor(85);
                              setEvalCatatan('');
                            }}
                            className="border-slate-700 hover:border-emerald-500/50 text-xs text-slate-300 hover:text-white"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                            Evaluasi
                          </Button>
                          {!peserta.is_gugur && peserta.status_keanggotaan !== 'anggota_muda' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setGugurTarget(peserta);
                                setGugurAlasan('');
                              }}
                              className="border-slate-800 hover:border-rose-500/50 text-xs text-rose-400 hover:bg-rose-500/10"
                            >
                              Catat Gugur
                            </Button>
                          )}
                        </div>
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
      {/* TAB 2: EVALUASI KOLEKTIF ANGKATAN                            */}
      {/* ============================================================ */}
      {activeTab === 'kelompok' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40 p-5 rounded-xl border border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">Catatan Dinamika & Solidaritas Tim Angkatan</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluasi kekompakan, manajemen perjalanan bivak, dan musyawarah seluruh peserta sebagai satu kesatuan angkatan.
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setShowAddKelompokModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              + Catat Evaluasi Tim
            </Button>
          </div>

          {loadingKelompok ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Spinner className="w-8 h-8 text-emerald-500 mb-3" />
              <p className="text-sm">Memuat catatan evaluasi kelompok...</p>
            </div>
          ) : evalKelompokList.length === 0 ? (
            <Card className="p-12 text-center bg-slate-900/30 border-slate-800">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 font-medium">Belum ada evaluasi kelompok tercatat</p>
              <p className="text-slate-500 text-sm mt-1">
                Gunakan tombol di atas untuk mencatat observasi kekompakan regu dan musyawarah tim.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evalKelompokList.map((item) => (
                <Card
                  key={item.id}
                  className="p-5 bg-slate-900/60 border-slate-800/80 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      Evaluator: {item.evaluator_nama || 'Komandan Latihan'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {item.tanggal}
                    </span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/50">
                    "{item.catatan}"
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: SIDANG PELANTIKAN & PENETAPAN NAMA ANGKATAN           */}
      {/* ============================================================ */}
      {activeTab === 'pelantikan' && (
        <div className="space-y-8">
          {/* Section A: Musyawarah Penetapan Nama Angkatan */}
          <Card className="p-6 bg-slate-900/60 border-slate-800/80 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                  Tradisi Musyawarah Angkatan Muda
                </span>
                <h2 className="text-lg font-bold text-white mt-1">Penetapan Nama Angkatan Resmi</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Nama angkatan dirumuskan secara aklamasi melalui musyawarah seluruh peserta di akhir Medan Operasi dan disahkan oleh Dewan Pengurus.
                </p>
              </div>
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>

            <form onSubmit={handleSaveNamaAngkatan} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  required
                  placeholder="Contoh: Giri Wardhana / Cakrawala Sunda / Bumi Naraya"
                  value={namaAngkatanInput}
                  onChange={(e) => setNamaAngkatanInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-semibold text-emerald-400 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                disabled={savingNamaAngkatan || !namaAngkatanInput}
                className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs px-5 shadow-lg shadow-amber-950/40"
              >
                {savingNamaAngkatan ? <Spinner className="w-4 h-4 mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
                Tetapkan Nama Angkatan
              </Button>
            </form>
          </Card>

          {/* Section B: Pelantikan Massal / Batch Graduation */}
          <Card className="p-6 bg-slate-900/60 border-slate-800/80 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
                  Sidang Kelulusan & Pengesahan
                </span>
                <h2 className="text-lg font-bold text-white mt-1">Pelantikan Resmi Anggota Muda</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Pilih peserta yang memenuhi syarat untuk dilantik serentak. Sistem akan memicu trigger database untuk mengubah status keanggotaan menjadi <strong className="text-white">Anggota Muda {namaAngkatanInput ? `(${namaAngkatanInput})` : ''}</strong>.
                </p>
              </div>
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <Award className="w-6 h-6" />
              </div>
            </div>

            {/* Checklist of Candidates */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>PILIH KANDIDAT YANG LOLOS EKSPEDISI:</span>
                <span className="text-emerald-400">{selectedBatchMemberIds.length} dari {pesertaList.filter(p => !p.is_gugur).length} Peserta Terpilih</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {pesertaList
                  .filter((p) => !p.is_gugur)
                  .map((peserta) => {
                    const isSelected = selectedBatchMemberIds.includes(peserta.id);
                    const isAlreadyPassed = peserta.status_keanggotaan === 'anggota_muda';

                    return (
                      <div
                        key={peserta.id}
                        onClick={() => handleToggleBatchMember(peserta.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500/50 text-white ring-1 ring-emerald-500/30'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // handled by div
                            className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 accent-emerald-500"
                          />
                          <div>
                            <p className="text-xs font-semibold text-white">{peserta.nama}</p>
                            <p className="text-[11px] text-slate-400">
                              Skor: {peserta.rata_rata_skor} &bull; {peserta.jurusan || 'FPTI'}
                            </p>
                          </div>
                        </div>
                        {isAlreadyPassed && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                            Dilantik
                          </span>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Note & Execute Button */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Catatan SK / Berita Acara Pelantikan:
              </label>
              <textarea
                rows={2}
                value={batchNote}
                onChange={(e) => setBatchNote(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-800">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  Otomasi Database: Trigger <code className="text-emerald-300">trg_sync_status_kaderisasi</code> akan berjalan otomatis.
                </span>
              </div>
              <Button
                variant="primary"
                onClick={handleExecuteBatchGraduation}
                disabled={submittingBatch || selectedBatchMemberIds.length === 0}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-6 py-2.5 shadow-lg shadow-indigo-950/40"
              >
                {submittingBatch ? (
                  <Spinner className="w-4 h-4 mr-2" />
                ) : (
                  <Award className="w-4 h-4 mr-2" />
                )}
                Lantik {selectedBatchMemberIds.length} Anggota Muda Resmi
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: INPUT EVALUASI LAPANGAN INDIVIDU                     */}
      {/* ============================================================ */}
      {evalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Evaluasi Lapangan Danlat
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{evalTarget.nama}</h3>
                <p className="text-xs text-slate-400">
                  NIM: {evalTarget.nim || '-'} &bull; {evalTarget.jurusan}
                </p>
              </div>
              <button
                onClick={() => setEvalTarget(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEvaluasi} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nilai Kuantitatif Lapangan (0 - 100):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={40}
                    max={100}
                    step={1}
                    value={evalSkor}
                    onChange={(e) => setEvalSkor(Number(e.target.value))}
                    className="flex-1 accent-emerald-500 cursor-pointer"
                  />
                  <span className="text-lg font-bold text-emerald-400 w-12 text-right">
                    {evalSkor}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Catatan Observasi Lapangan:
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Contoh: Akurasi resection kompas bidik presisi, kepemimpinan regu saat membuka jalur rintisan konsisten..."
                  value={evalCatatan}
                  onChange={(e) => setEvalCatatan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEvalTarget(null)}
                  className="border-slate-800 text-slate-400 hover:text-white"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submittingEval || !evalCatatan}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                >
                  {submittingEval ? <Spinner className="w-4 h-4 mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
                  Simpan Evaluasi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: RIWAYAT EVALUASI LENGKAP                              */}
      {/* ============================================================ */}
      {historyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  Log Observasi Lapangan
                </span>
                <h3 className="text-lg font-bold text-white mt-1">Riwayat Evaluasi: {historyTarget.nama}</h3>
                <p className="text-xs text-slate-400">
                  Rata-rata Skor: <strong className="text-emerald-400">{historyTarget.rata_rata_skor} / 100</strong>
                </p>
              </div>
              <button
                onClick={() => setHistoryTarget(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingHistory ? (
              <div className="py-10 flex flex-col items-center justify-center text-slate-400">
                <Spinner className="w-6 h-6 text-emerald-500 mb-2" />
                <p className="text-xs">Memuat riwayat evaluasi...</p>
              </div>
            ) : historyList.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-400">Belum ada rekaman evaluasi individu untuk peserta ini.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {historyList.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">
                        {item.evaluator_nama || 'Danlat'}
                      </span>
                      <div className="flex items-center gap-2">
                        {item.skor !== null && (
                          <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                            Skor: {item.skor}
                          </span>
                        )}
                        <span className="text-slate-500">{item.tanggal}</span>
                      </div>
                    </div>
                    <p className="text-slate-300 leading-relaxed">"{item.catatan}"</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHistoryTarget(null)}
                className="border-slate-800 text-slate-400 hover:text-white"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: PENCATATAN GUGUR DI TENGAH PROSES                      */}
      {/* ============================================================ */}
      {gugurTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-rose-900/50 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  Pencatatan Gugur di Tengah Proses
                </span>
                <h3 className="text-lg font-bold text-white mt-1">Gugur Operasi: {gugurTarget.nama}</h3>
                <p className="text-xs text-slate-400">
                  NIM: {gugurTarget.nim || '-'} &bull; {gugurTarget.jurusan}
                </p>
              </div>
              <button
                onClick={() => setGugurTarget(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300">
              <AlertTriangle className="w-4 h-4 inline mr-1.5 text-rose-400" />
              Tindakan ini akan mencatat status <strong className="text-white">gugur</strong> pada riwayat tahap Medan Operasi. Data performa peserta tetap tersimpan sebagai arsip kaderisasi.
            </div>

            <form onSubmit={handleSubmitGugur} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Alasan Evakuasi / Gugur di Lapangan:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Contoh: Evakuasi medis darurat akibat cedera lutut saat melintasi medan terjal; atas pertimbangan keselamatan peserta ditarik mundur oleh tim medis..."
                  value={gugurAlasan}
                  onChange={(e) => setGugurAlasan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setGugurTarget(null)}
                  className="border-slate-800 text-slate-400 hover:text-white"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submittingGugur || !gugurAlasan}
                  className="bg-rose-600 hover:bg-rose-500 text-white text-xs"
                >
                  {submittingGugur ? <Spinner className="w-4 h-4 mr-1.5" /> : <UserX className="w-4 h-4 mr-1.5" />}
                  Konfirmasi Gugur Lapangan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: TAMBAH EVALUASI KOLEKTIF ANGKATAN                    */}
      {/* ============================================================ */}
      {showAddKelompokModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Catat Evaluasi Kelompok Tim</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Observasi dinamika kelompok, kepemimpinan bergilir, dan manajemen kemah
                </p>
              </div>
              <button
                onClick={() => setShowAddKelompokModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitKelompok} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Catatan Evaluasi Tim Angkatan:
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Contoh: Koordinasi pembuatan bivak darurat dan pembagian piket jaga malam berlangsung disiplin. Rekan yang tertinggal dibantu secara suportif..."
                  value={kelompokNote}
                  onChange={(e) => setKelompokNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddKelompokModal(false)}
                  className="border-slate-800 text-slate-400 hover:text-white"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submittingKelompok || !kelompokNote}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                >
                  {submittingKelompok ? <Spinner className="w-4 h-4 mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
                  Simpan Catatan Tim
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
