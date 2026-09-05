'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchKriteriaEvaluasiList,
  createKriteriaEvaluasi,
  deleteKriteriaEvaluasi,
  fetchEvaluasiAkhirAnggotaList,
  saveNilaiEvaluasiBatch,
  decideSidangDPEvaluasiAkhir,
  terbitkanNIAResmi,
} from '@/lib/actions/evaluasi-nia';
import type {
  KriteriaEvaluasiItem,
  NilaiEvaluasiItem,
  EvaluasiAkhirAnggotaItem,
} from '@/lib/types/evaluasi-nia';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { StatCard, StatGrid } from '@/components/ui/StatCard';
import {
  Award,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Plus,
  Trash2,
  Save,
  ShieldCheck,
  X,
  FileText,
  KeyRound,
  Sparkles,
  Sliders,
  AlertTriangle,
  Send,
  BookOpen,
} from 'lucide-react';

export default function AdminNIAPage() {
  const [activeTab, setActiveTab] = useState<'rekap' | 'kriteria'>('rekap');

  // Candidate and Evaluation State
  const [anggotaList, setAnggotaList] = useState<EvaluasiAkhirAnggotaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'lolos' | 'tunda' | 'belum_sidang'>('all');
  const [loading, setLoading] = useState(true);

  // Criteria State
  const [kriteriaList, setKriteriaList] = useState<KriteriaEvaluasiItem[]>([]);
  const [showAddKriteriaModal, setShowAddKriteriaModal] = useState(false);
  const [kriteriaForm, setKriteriaForm] = useState({
    nama_kriteria: '',
    periode: '2025-Q2',
  });
  const [submittingKriteria, setSubmittingKriteria] = useState(false);

  // Modal: Input Nilai Kriteria
  const [nilaiTarget, setNilaiTarget] = useState<EvaluasiAkhirAnggotaItem | null>(null);
  const [scoresState, setScoresState] = useState<Record<string, { skor: number; catatan: string }>>({});
  const [submittingScores, setSubmittingScores] = useState(false);

  // Modal: Sidang Pleno DP
  const [sidangTarget, setSidangTarget] = useState<EvaluasiAkhirAnggotaItem | null>(null);
  const [sidangKeputusan, setSidangKeputusan] = useState<'lolos' | 'tunda'>('lolos');
  const [sidangCatatan, setSidangCatatan] = useState('');
  const [submittingSidang, setSubmittingSidang] = useState(false);

  // Modal: Terbitkan NIA
  const [niaTarget, setNiaTarget] = useState<EvaluasiAkhirAnggotaItem | null>(null);
  const [niaInput, setNiaInput] = useState('');
  const [submittingNIA, setSubmittingNIA] = useState(false);

  // Feedback Toast Banner
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 1. Load Kriteria
  const loadKriteria = useCallback(async () => {
    const list = await fetchKriteriaEvaluasiList('2025-Q2');
    setKriteriaList(list);
  }, []);

  // 2. Load Anggota
  const loadAnggota = useCallback(async () => {
    setLoading(true);
    const data = await fetchEvaluasiAkhirAnggotaList('2025-Q2');
    setAnggotaList(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadKriteria();
    loadAnggota();
  }, [loadKriteria, loadAnggota]);

  // Filtered Anggota
  const filteredAnggota = anggotaList.filter((item) => {
    const matchesQuery =
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.nim && item.nim.includes(searchQuery)) ||
      (item.jurusan && item.jurusan.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.nia && item.nia.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ? true : item.status_sidang === statusFilter;

    return matchesQuery && matchesStatus;
  });

  // Aggregates
  const totalCalon = anggotaList.length;
  const avgSkorTotal =
    totalCalon > 0
      ? Math.round(anggotaList.reduce((a, b) => a + b.rata_rata_skor, 0) / totalCalon)
      : 0;
  const totalLolos = anggotaList.filter((a) => a.status_sidang === 'lolos').length;
  const totalBerNIA = anggotaList.filter((a) => a.nia !== null || a.status_keanggotaan === 'anggota_biasa').length;

  // Handlers
  const handleOpenNilaiModal = (anggota: EvaluasiAkhirAnggotaItem) => {
    setNilaiTarget(anggota);
    const initialMap: Record<string, { skor: number; catatan: string }> = {};
    kriteriaList.forEach((k) => {
      const existing = anggota.nilai_list.find((n) => n.kriteria_id === k.id);
      initialMap[k.id] = {
        skor: existing?.skor ?? 85,
        catatan: existing?.catatan || '',
      };
    });
    setScoresState(initialMap);
  };

  const handleSaveScores = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nilaiTarget) return;

    setSubmittingScores(true);
    const batch = Object.entries(scoresState).map(([kriteria_id, val]) => ({
      kriteria_id,
      skor: val.skor,
      catatan: val.catatan,
    }));

    const res = await saveNilaiEvaluasiBatch(nilaiTarget.id, batch);
    setSubmittingScores(false);
    setNilaiTarget(null);

    if (res.success) {
      setFeedback({ type: 'success', text: res.message || 'Nilai kriteria berhasil disimpan!' });
      loadAnggota();
    } else {
      setFeedback({ type: 'error', text: res.error || 'Gagal menyimpan nilai kriteria.' });
    }
  };

  const handleSaveSidang = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sidangTarget || !sidangCatatan) return;

    setSubmittingSidang(true);
    const res = await decideSidangDPEvaluasiAkhir({
      anggota_id: sidangTarget.id,
      keputusan: sidangKeputusan,
      catatan: sidangCatatan,
    });
    setSubmittingSidang(false);
    setSidangTarget(null);
    setSidangCatatan('');

    if (res.success) {
      setFeedback({ type: 'success', text: res.message || 'Keputusan sidang berhasil disimpan!' });
      loadAnggota();
    } else {
      setFeedback({ type: 'error', text: res.error || 'Gagal menyimpan keputusan sidang.' });
    }
  };

  const handleTerbitkanNIA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niaTarget || !niaInput) return;

    setSubmittingNIA(true);
    const res = await terbitkanNIAResmi({
      anggota_id: niaTarget.id,
      nia: niaInput,
    });
    setSubmittingNIA(false);

    if (res.success) {
      setFeedback({ type: 'success', text: res.message || 'NIA berhasil diterbitkan!' });
      setNiaTarget(null);
      setNiaInput('');
      loadAnggota();
    } else {
      setFeedback({ type: 'error', text: res.error || 'Gagal menerbitkan NIA.' });
    }
  };

  const handleCreateKriteria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kriteriaForm.nama_kriteria) return;

    setSubmittingKriteria(true);
    const res = await createKriteriaEvaluasi(kriteriaForm);
    setSubmittingKriteria(false);
    setShowAddKriteriaModal(false);
    setKriteriaForm({ nama_kriteria: '', periode: '2025-Q2' });

    if (res.success) {
      setFeedback({ type: 'success', text: res.message || 'Kriteria baru berhasil dibuat!' });
      loadKriteria();
      loadAnggota();
    } else {
      setFeedback({ type: 'error', text: res.error || 'Gagal membuat kriteria.' });
    }
  };

  const handleDeleteKriteria = async (id: string) => {
    if (!confirm('Yakin ingin menghapus kriteria penilaian ini?')) return;
    const res = await deleteKriteriaEvaluasi(id);
    if (res.success) {
      setFeedback({ type: 'success', text: res.message || 'Kriteria berhasil dihapus!' });
      loadKriteria();
      loadAnggota();
    } else {
      setFeedback({ type: 'error', text: res.error || 'Gagal menghapus kriteria.' });
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Sidang Evaluasi Akhir & Penerbitan NIA
              </h1>
              <p className="text-sm text-slate-400">
                Penilaian kriteria dinamis PPNIA, sidang pleno Dewan Pengurus, dan penerbitan Nomor Induk Anggota (NIA) resmi.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddKriteriaModal(true)}
            className="border-slate-700 text-slate-300 text-xs hover:text-white"
          >
            <Plus className="w-4 h-4 mr-1.5 text-emerald-400" />
            Tambah Kriteria Evaluasi
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

      {/* Summary Cards */}
      <StatGrid columns={4}>
        <StatCard
          icon={Users}
          label="Kandidat Calon NIA"
          value={totalCalon}
          subtext="Anggota Muda aktif"
          color="purple"
        />
        <StatCard
          icon={Sparkles}
          label="Rata-rata Skor Kriteria"
          value={`${avgSkorTotal} / 100`}
          subtext={`Akumulasi ${kriteriaList.length} kriteria`}
          color="emerald"
        />
        <StatCard
          icon={CheckCircle2}
          label="Lolos Sidang Pleno DP"
          value={totalLolos}
          subtext="Memenuhi syarat penetapan"
          color="blue"
        />
        <StatCard
          icon={KeyRound}
          label="Anggota Biasa Resmi (NIA)"
          value={totalBerNIA}
          subtext="Status keanggotaan penuh"
          color="amber"
        />
      </StatGrid>

      {/* Main Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('rekap')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'rekap'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          Rekapitulasi Sidang & Penerbitan NIA
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {anggotaList.length} Kandidat
          </span>
        </button>
        <button
          onClick={() => setActiveTab('kriteria')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'kriteria'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Kriteria Evaluasi Dinamis
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {kriteriaList.length} Kriteria
          </span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: REKAPITULASI SIDANG & PENERBITAN NIA                  */}
      {/* ============================================================ */}
      {activeTab === 'rekap' && (
        <div className="space-y-6">
          {/* Filter & Search */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Cari nama, NIM, jurusan, NIA..."
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
                <option value="all">Semua Status Sidang</option>
                <option value="lolos">🟢 Lolos Sidang Pleno</option>
                <option value="tunda">🟡 Ditunda (Perbaikan)</option>
                <option value="belum_sidang">⚪ Belum Sidang</option>
              </select>
            </div>
          </div>

          {/* Candidate Table */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Spinner className="w-8 h-8 text-emerald-500 mb-3" />
              <p className="text-sm">Memuat data kandidat kelulusan NIA...</p>
            </div>
          ) : filteredAnggota.length === 0 ? (
            <Card className="p-12 text-center bg-slate-900/30 border-slate-800">
              <Award className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 font-medium">Tidak ada kandidat ditemukan</p>
            </Card>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/80 text-xs uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Kandidat</th>
                    <th className="px-5 py-3 font-semibold">Skor Evaluasi Kriteria</th>
                    <th className="px-5 py-3 font-semibold">Keputusan Sidang DP</th>
                    <th className="px-5 py-3 font-semibold">Nomor Induk Anggota (NIA)</th>
                    <th className="px-5 py-3 font-semibold text-right">Aksi Dewan Pengurus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredAnggota.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-white">{item.nama}</div>
                        <div className="text-xs text-slate-400">
                          NIM: {item.nim || '-'} &bull; {item.jurusan || 'FPTI'}
                        </div>
                        <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {item.nama_angkatan || 'Anggota Muda'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold ${
                              item.rata_rata_skor >= 85
                                ? 'text-emerald-400'
                                : item.rata_rata_skor > 0
                                ? 'text-amber-400'
                                : 'text-slate-500'
                            }`}
                          >
                            {item.rata_rata_skor > 0 ? `${item.rata_rata_skor} / 100` : 'Belum Dinilai'}
                          </span>
                          <span className="text-xs text-slate-500">
                            ({item.kriteria_dinilai}/{item.total_kriteria} kriteria)
                          </span>
                        </div>
                        {item.rata_rata_skor > 0 && (
                          <div className="w-28 h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${Math.min(100, item.rata_rata_skor)}%` }}
                            />
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {item.status_sidang === 'lolos' ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Lolos Pleno DP
                            </span>
                            {item.catatan_sidang && (
                              <p className="text-[11px] text-slate-400 mt-1 max-w-xs line-clamp-1">
                                {item.catatan_sidang}
                              </p>
                            )}
                          </div>
                        ) : item.status_sidang === 'tunda' ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                              <Clock className="w-3.5 h-3.5" /> Ditunda
                            </span>
                            {item.catatan_sidang && (
                              <p className="text-[11px] text-amber-300/80 mt-1 max-w-xs line-clamp-1">
                                {item.catatan_sidang}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-medium">
                            Belum Sidang
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {item.nia ? (
                          <div>
                            <span className="inline-flex items-center gap-1.5 font-mono font-bold text-xs px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <KeyRound className="w-3.5 h-3.5" />
                              {item.nia}
                            </span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              Status: Anggota Biasa
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 font-mono">Belum Diterbitkan</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenNilaiModal(item)}
                            className="border-slate-700 hover:border-emerald-500/50 text-xs text-slate-300 hover:text-white"
                          >
                            Nilai Kriteria
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSidangTarget(item);
                              setSidangKeputusan(item.status_sidang === 'tunda' ? 'tunda' : 'lolos');
                              setSidangCatatan(item.catatan_sidang || '');
                            }}
                            className="border-slate-700 hover:border-cyan-500/50 text-xs text-slate-300 hover:text-white"
                          >
                            Sidang DP
                          </Button>
                          {!item.nia && (
                            <Button
                              size="sm"
                              variant="primary"
                              disabled={item.status_sidang !== 'lolos'}
                              onClick={() => {
                                setNiaTarget(item);
                                setNiaInput(`GW.${item.nomor_angkatan || 32}.235.GW`);
                              }}
                              className="bg-amber-600 hover:bg-amber-500 text-white text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <KeyRound className="w-3.5 h-3.5 mr-1" />
                              Terbitkan NIA
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
      {/* TAB 2: KELOLA KRITERIA EVALUASI DINAMIS                      */}
      {/* ============================================================ */}
      {activeTab === 'kriteria' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40 p-5 rounded-xl border border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">Daftar Kriteria Penilaian PPNIA Aktif</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Kriteria penilaian akhir fleksibel dan ditentukan oleh Dewan Pengurus tiap periode secara dinamis.
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setShowAddKriteriaModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Tambah Kriteria Baru
            </Button>
          </div>

          <div className="space-y-3">
            {kriteriaList.map((k, index) => (
              <Card
                key={k.id}
                className="p-4 bg-slate-900/60 border-slate-800/80 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{k.nama_kriteria}</h3>
                    <p className="text-[11px] text-slate-400">Periode Berlaku: {k.periode}</p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteKriteria(k.id)}
                  className="border-slate-800 hover:border-rose-500/50 text-slate-400 hover:text-rose-400 text-xs p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: INPUT NILAI KRITERIA                                  */}
      {/* ============================================================ */}
      {nilaiTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Form Penilaian Kriteria Akhir
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{nilaiTarget.nama}</h3>
                <p className="text-xs text-slate-400">
                  NIM: {nilaiTarget.nim || '-'} &bull; {nilaiTarget.jurusan}
                </p>
              </div>
              <button
                onClick={() => setNilaiTarget(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveScores} className="space-y-4">
              {kriteriaList.map((k) => {
                const currentVal = scoresState[k.id] || { skor: 85, catatan: '' };

                return (
                  <div key={k.id} className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{k.nama_kriteria}</span>
                      <span className="text-sm font-extrabold text-emerald-400">{currentVal.skor}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={50}
                        max={100}
                        value={currentVal.skor}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setScoresState((prev) => ({
                            ...prev,
                            [k.id]: { ...prev[k.id], skor: val },
                          }));
                        }}
                        className="flex-1 accent-emerald-500 cursor-pointer"
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="Catatan pendukung penilaian..."
                      value={currentVal.catatan}
                      onChange={(e) => {
                        const val = e.target.value;
                        setScoresState((prev) => ({
                          ...prev,
                          [k.id]: { ...prev[k.id], catatan: val },
                        }));
                      }}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                );
              })}

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setNilaiTarget(null)}
                  className="border-slate-800 text-slate-400 hover:text-white"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submittingScores}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                >
                  {submittingScores ? <Spinner className="w-4 h-4 mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
                  Simpan Seluruh Nilai
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: SIDANG PLENO DEWAN PENGURUS                          */}
      {/* ============================================================ */}
      {sidangTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  Sidang Pleno Dewan Pengurus
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{sidangTarget.nama}</h3>
                <p className="text-xs text-slate-400">
                  Rata-rata Skor: <strong className="text-emerald-400">{sidangTarget.rata_rata_skor} / 100</strong>
                </p>
              </div>
              <button
                onClick={() => setSidangTarget(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSidang} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Keputusan Rapat Pleno DP:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSidangKeputusan('lolos')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      sidangKeputusan === 'lolos'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 ring-2 ring-emerald-500/20'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Lolos & Siap NIA
                  </button>
                  <button
                    type="button"
                    onClick={() => setSidangKeputusan('tunda')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      sidangKeputusan === 'tunda'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400 ring-2 ring-amber-500/20'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-amber-400" />
                    Tunda (Perbaikan)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Catatan Berita Acara Sidang Pleno:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Contoh: Seluruh kriteria PPNIA terpenuhi dengan predikat memuaskan. Sidang pleno menyepakati penetapan status Anggota Biasa..."
                  value={sidangCatatan}
                  onChange={(e) => setSidangCatatan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSidangTarget(null)}
                  className="border-slate-800 text-slate-400 hover:text-white"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submittingSidang || !sidangCatatan}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                >
                  {submittingSidang ? <Spinner className="w-4 h-4 mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
                  Simpan Keputusan Pleno
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: TERBITKAN NOMOR INDUK ANGGOTA (NIA)                   */}
      {/* ============================================================ */}
      {niaTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Penerbitan Nomor Induk Anggota Resmi
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{niaTarget.nama}</h3>
                <p className="text-xs text-slate-400">
                  Angkatan {niaTarget.nomor_angkatan} ({niaTarget.nama_angkatan || '-'})
                </p>
              </div>
              <button
                onClick={() => setNiaTarget(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-indigo-200">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                Otomasi Database Terintegrasi
              </div>
              <p className="text-[11px] text-indigo-300/90 leading-relaxed">
                Trigger <code className="bg-slate-950 px-1 py-0.5 rounded text-indigo-200 font-mono">trg_anggota_nia_promosi</code> akan langsung mengubah status keanggotaan menjadi <strong className="text-white">Anggota Biasa</strong> begitu NIA resmi tersimpan.
              </p>
            </div>

            <form onSubmit={handleTerbitkanNIA} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Input Format NIA Gandawesi:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: GW.32.235.GW"
                  value={niaInput}
                  onChange={(e) => setNiaInput(e.target.value.toUpperCase())}
                  className="w-full font-mono text-base font-bold tracking-wider px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-amber-400 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Format: GW.[Angkatan].[NomorUrutGlobal].[KodeAngkatan] &bull; Anti-duplikasi divalidasi sistem.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setNiaTarget(null)}
                  className="border-slate-800 text-slate-400 hover:text-white"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submittingNIA || !niaInput}
                  className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-4"
                >
                  {submittingNIA ? <Spinner className="w-4 h-4 mr-1.5" /> : <KeyRound className="w-4 h-4 mr-1.5" />}
                  Terbitkan NIA Resmi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: TAMBAH KRITERIA BARU                                  */}
      {/* ============================================================ */}
      {showAddKriteriaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Tambah Kriteria Evaluasi PPNIA</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Daftar kriteria fleksibel yang ditentukan Dewan Pengurus per periode
                </p>
              </div>
              <button
                onClick={() => setShowAddKriteriaModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateKriteria} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nama Kriteria Penilaian:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Publikasi Karya Tulis & Jurnalistik Alam Bebas"
                  value={kriteriaForm.nama_kriteria}
                  onChange={(e) =>
                    setKriteriaForm((prev) => ({ ...prev, nama_kriteria: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Periode Evaluasi:
                </label>
                <input
                  type="text"
                  required
                  placeholder="2025-Q2"
                  value={kriteriaForm.periode}
                  onChange={(e) =>
                    setKriteriaForm((prev) => ({ ...prev, periode: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddKriteriaModal(false)}
                  className="border-slate-800 text-slate-400 hover:text-white"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submittingKriteria || !kriteriaForm.nama_kriteria}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                >
                  {submittingKriteria ? <Spinner className="w-4 h-4 mr-1.5" /> : null}
                  Simpan Kriteria
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
