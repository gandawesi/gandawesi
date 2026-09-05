'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchAnggotaMudaPPNIAList,
  saveEvaluasiBerkala,
  fetchPresentasiPPNIAList,
  fetchRencanaEkspedisiList,
  decideRencanaEkspedisi,
  fetchSesiPPNIAList,
  createSesiPPNIA,
  fetchPresensiSesiPPNIA,
  savePresensiSesiPPNIABatch,
} from '@/lib/actions/ppnia';
import type {
  JenisKegiatanPPNIA,
  StatusEvaluasiBerkala,
  AnggotaMudaPPNIAItem,
  PresentasiPPNIAItem,
  RencanaEkspedisiItem,
  SesiKegiatanPPNIAItem,
  PresensiPPNIAItem,
} from '@/lib/types/ppnia';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { StatCard, StatGrid } from '@/components/ui/StatCard';
import {
  ShieldAlert,
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
  Mountain,
  BookOpen,
  MapPin,
  ExternalLink,
  Send,
  Layers,
  Activity,
  CheckSquare,
} from 'lucide-react';

export default function AdminPPNIAPage() {
  const [activeTab, setActiveTab] = useState<'watchlist' | 'presensi' | 'presentasi' | 'ekspedisi'>('watchlist');

  // Watchlist State
  const [anggotaList, setAnggotaList] = useState<AnggotaMudaPPNIAItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'aman' | 'perlu_perhatian' | 'kritis'>('all');
  const [loadingWatchlist, setLoadingWatchlist] = useState(true);

  // Modal: Update Evaluasi Berkala
  const [evalTarget, setEvalTarget] = useState<AnggotaMudaPPNIAItem | null>(null);
  const [evalPeriode, setEvalPeriode] = useState('2025-Q2');
  const [evalStatus, setEvalStatus] = useState<StatusEvaluasiBerkala>('aman');
  const [evalCatatan, setEvalCatatan] = useState('');
  const [submittingEval, setSubmittingEval] = useState(false);

  // Tab 2: Presensi State
  const [selectedJenis, setSelectedJenis] = useState<JenisKegiatanPPNIA>('pematerian');
  const [sesiList, setSesiList] = useState<SesiKegiatanPPNIAItem[]>([]);
  const [selectedSesiId, setSelectedSesiId] = useState('');
  const [presensiItems, setPresensiItems] = useState<PresensiPPNIAItem[]>([]);
  const [loadingPresensi, setLoadingPresensi] = useState(false);
  const [savingPresensi, setSavingPresensi] = useState(false);

  // Modal: Tambah Sesi PPNIA
  const [showAddSesiModal, setShowAddSesiModal] = useState(false);
  const [sesiForm, setSesiForm] = useState({
    jenis_kegiatan: 'pematerian' as JenisKegiatanPPNIA,
    judul: '',
    tanggal: new Date().toISOString().split('T')[0],
    catatan: '',
  });
  const [submittingSesi, setSubmittingSesi] = useState(false);

  // Tab 3: Presentasi State
  const [presentasiList, setPresentasiList] = useState<PresentasiPPNIAItem[]>([]);
  const [loadingPresentasi, setLoadingPresentasi] = useState(false);

  // Tab 4: Rencana Ekspedisi State
  const [ekspedisiList, setEkspedisiList] = useState<RencanaEkspedisiItem[]>([]);
  const [loadingEkspedisi, setLoadingEkspedisi] = useState(false);
  const [processingEkspedisiId, setProcessingEkspedisiId] = useState<string | null>(null);

  // Feedback Toast Banner
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 1. Load Watchlist
  const loadWatchlist = useCallback(async () => {
    setLoadingWatchlist(true);
    const data = await fetchAnggotaMudaPPNIAList();
    setAnggotaList(data);
    setLoadingWatchlist(false);
  }, []);

  // 2. Load Sesi List
  const loadSesi = useCallback(async (jenis: JenisKegiatanPPNIA) => {
    const list = await fetchSesiPPNIAList(jenis);
    setSesiList(list);
    if (list.length > 0) {
      setSelectedSesiId(list[0].id);
    } else {
      setSelectedSesiId('');
      setPresensiItems([]);
    }
  }, []);

  // 3. Load Presensi for Sesi
  const loadPresensi = useCallback(async (sesiId: string) => {
    if (!sesiId) return;
    setLoadingPresensi(true);
    const items = await fetchPresensiSesiPPNIA(sesiId);
    setPresensiItems(items);
    setLoadingPresensi(false);
  }, []);

  // 4. Load Presentasi
  const loadPresentasi = useCallback(async () => {
    setLoadingPresentasi(true);
    const list = await fetchPresentasiPPNIAList();
    setPresentasiList(list);
    setLoadingPresentasi(false);
  }, []);

  // 5. Load Ekspedisi
  const loadEkspedisi = useCallback(async () => {
    setLoadingEkspedisi(true);
    const list = await fetchRencanaEkspedisiList();
    setEkspedisiList(list);
    setLoadingEkspedisi(false);
  }, []);

  useEffect(() => {
    loadWatchlist();
    loadSesi(selectedJenis);
    loadPresentasi();
    loadEkspedisi();
  }, [loadWatchlist, loadSesi, selectedJenis, loadPresentasi, loadEkspedisi]);

  useEffect(() => {
    if (selectedSesiId) {
      loadPresensi(selectedSesiId);
    }
  }, [selectedSesiId, loadPresensi]);

  // Filtered Watchlist
  const filteredAnggota = anggotaList.filter((item) => {
    const matchesQuery =
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.nim && item.nim.includes(searchQuery)) ||
      (item.jurusan && item.jurusan.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ? true : item.status_evaluasi_terkini === statusFilter;

    return matchesQuery && matchesStatus;
  });

  // Aggregates
  const totalAnggota = anggotaList.length;
  const avgKehadiran =
    totalAnggota > 0
      ? Math.round(anggotaList.reduce((a, b) => a + b.persentase_total, 0) / totalAnggota)
      : 0;
  const totalPerhatian = anggotaList.filter(
    (a) => a.status_evaluasi_terkini === 'perlu_perhatian' || a.status_evaluasi_terkini === 'kritis'
  ).length;
  const pendingEkspedisi = ekspedisiList.filter((e) => e.status_approval === 'diajukan').length;

  // Handlers
  const handleSaveEvaluasi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalTarget) return;

    setSubmittingEval(true);
    const res = await saveEvaluasiBerkala({
      anggota_id: evalTarget.id,
      periode: evalPeriode,
      status: evalStatus,
      catatan: evalCatatan,
    });
    setSubmittingEval(false);
    setEvalTarget(null);
    setEvalCatatan('');

    if (res.success) {
      setFeedback({ type: 'success', text: res.message || 'Evaluasi berkala berhasil disimpan!' });
      loadWatchlist();
    } else {
      setFeedback({ type: 'error', text: res.error || 'Gagal menyimpan evaluasi berkala.' });
    }
  };

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

  const handleSavePresensi = async () => {
    if (!selectedSesiId) return;
    setSavingPresensi(true);
    const payload = presensiItems.map((p) => ({
      anggota_id: p.anggota_id,
      hadir: p.hadir,
      catatan: p.catatan,
    }));
    const res = await savePresensiSesiPPNIABatch(selectedSesiId, payload);
    setSavingPresensi(false);

    if (res.success) {
      setFeedback({ type: 'success', text: res.message || 'Presensi berhasil disimpan!' });
      loadWatchlist();
    } else {
      setFeedback({ type: 'error', text: res.error || 'Gagal menyimpan presensi.' });
    }
  };

  const handleCreateSesiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sesiForm.judul) return;

    setSubmittingSesi(true);
    const res = await createSesiPPNIA(sesiForm);
    setSubmittingSesi(false);
    setShowAddSesiModal(false);
    setSesiForm({
      jenis_kegiatan: selectedJenis,
      judul: '',
      tanggal: new Date().toISOString().split('T')[0],
      catatan: '',
    });

    if (res.success) {
      setFeedback({ type: 'success', text: res.message || 'Sesi kegiatan PPNIA berhasil dijadwalkan!' });
      loadSesi(selectedJenis);
    } else {
      setFeedback({ type: 'error', text: res.error || 'Gagal menjadwalkan sesi.' });
    }
  };

  const handleDecideEkspedisi = async (id: string, decision: 'disetujui' | 'ditolak') => {
    setProcessingEkspedisiId(id);
    const res = await decideRencanaEkspedisi(id, decision);
    setProcessingEkspedisiId(null);

    if (res.success) {
      setFeedback({ type: 'success', text: res.message || `Proposal ${decision}!` });
      loadEkspedisi();
      loadWatchlist();
    } else {
      setFeedback({ type: 'error', text: res.error || 'Gagal memproses proposal ekspedisi.' });
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-500/10 border border-forest-500/20 flex items-center justify-center text-forest-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Monitoring PPNIA (Dewan Pengurus)
              </h1>
              <p className="text-sm text-slate-400">
                Presensi 4 pilar kegiatan setahun, kurasi slide presentasi, approval ekspedisi, dan watchlist evaluasi berkala.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddSesiModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Jadwalkan Sesi PPNIA
          </Button>
        </div>
      </div>

      {/* Feedback Toast */}
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
          label="Anggota Muda PPNIA"
          value={totalAnggota}
          subtext="Masa pembinaan ~1 tahun"
          color="purple"
        />
        <StatCard
          icon={Activity}
          label="Rata-rata Presensi"
          value={`${avgKehadiran}%`}
          subtext="Akumulasi 4 jenis kegiatan"
          color="emerald"
        />
        <StatCard
          icon={AlertTriangle}
          label="Watchlist Perhatian"
          value={totalPerhatian}
          subtext="Peringatan dini evaluasi"
          color="amber"
        />
        <StatCard
          icon={Mountain}
          label="Ekspedisi Menunggu DP"
          value={pendingEkspedisi}
          subtext="Proposal rencana ekspedisi"
          color="blue"
        />
      </StatGrid>

      {/* Main Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('watchlist')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'watchlist'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Watchlist & Evaluasi Berkala
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {anggotaList.length}
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
          Presensi 4 Pilar PPNIA
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {sesiList.length} Sesi
          </span>
        </button>
        <button
          onClick={() => setActiveTab('presentasi')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'presentasi'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Presentasi Pra/Pasca Ekspedisi
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {presentasiList.length} Berkas
          </span>
        </button>
        <button
          onClick={() => setActiveTab('ekspedisi')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'ekspedisi'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Mountain className="w-4 h-4" />
          Approval Rencana Ekspedisi
          {pendingEkspedisi > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
              {pendingEkspedisi} Baru
            </span>
          )}
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: WATCHLIST & EVALUASI BERKALA                          */}
      {/* ============================================================ */}
      {activeTab === 'watchlist' && (
        <div className="space-y-6">
          {/* Filter & Search */}
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
                <option value="all">Semua Status Watchlist</option>
                <option value="aman">🟢 Aman (Aktif)</option>
                <option value="perlu_perhatian">🟡 Perlu Perhatian</option>
                <option value="kritis">🔴 Kritis (Peringatan Dini)</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loadingWatchlist ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Spinner className="w-8 h-8 text-emerald-500 mb-3" />
              <p className="text-sm">Memuat data monitoring PPNIA...</p>
            </div>
          ) : filteredAnggota.length === 0 ? (
            <Card className="p-12 text-center bg-slate-900/30 border-slate-800">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 font-medium">Tidak ada anggota muda ditemukan</p>
            </Card>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/80 text-xs uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Anggota Muda</th>
                    <th className="px-5 py-3 font-semibold">Presensi 4 Pilar</th>
                    <th className="px-5 py-3 font-semibold">Slide Presentasi</th>
                    <th className="px-5 py-3 font-semibold">Status Ekspedisi</th>
                    <th className="px-5 py-3 font-semibold">Evaluasi DP ({filteredAnggota[0]?.periode_terkini || '2025-Q2'})</th>
                    <th className="px-5 py-3 font-semibold text-right">Aksi DP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredAnggota.map((am) => (
                    <tr key={am.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-white">{am.nama}</div>
                        <div className="text-xs text-slate-400">
                          NIM: {am.nim || '-'} &bull; {am.jurusan || 'FPTI UPI'}
                        </div>
                        <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {am.nama_angkatan || 'Anggota Muda'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Materi: {am.kehadiran_pematerian}/{am.total_pematerian}</span>
                            <span>Pres: {am.kehadiran_presentasi}/{am.total_presentasi}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Daki: {am.kehadiran_pendakian}/{am.total_pendakian}</span>
                            <span>Eksp: {am.kehadiran_ekspedisi}/{am.total_ekspedisi}</span>
                          </div>
                          <div className="w-32 h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                am.persentase_total >= 75
                                  ? 'bg-emerald-500'
                                  : am.persentase_total >= 50
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.min(100, am.persentase_total)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-bold text-white">{am.total_slide_presentasi}</span>
                        <span className="text-xs text-slate-500 ml-1">berkas</span>
                      </td>

                      <td className="px-5 py-4">
                        {am.rencana_ekspedisi_status === 'disetujui' ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Disetujui
                          </span>
                        ) : am.rencana_ekspedisi_status === 'diajukan' ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
                            <Clock className="w-3.5 h-3.5" /> Diajukan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-medium">
                            Belum Ada
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {am.status_evaluasi_terkini === 'aman' ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                            🟢 Aman
                          </span>
                        ) : am.status_evaluasi_terkini === 'perlu_perhatian' ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                              🟡 Perlu Perhatian
                            </span>
                            {am.catatan_evaluasi_terkini && (
                              <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 max-w-xs">
                                {am.catatan_evaluasi_terkini}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                              🔴 Kritis
                            </span>
                            {am.catatan_evaluasi_terkini && (
                              <p className="text-[11px] text-rose-300 mt-1 line-clamp-1 max-w-xs">
                                {am.catatan_evaluasi_terkini}
                              </p>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEvalTarget(am);
                            setEvalStatus(am.status_evaluasi_terkini);
                            setEvalCatatan(am.catatan_evaluasi_terkini || '');
                          }}
                          className="border-slate-700 hover:border-emerald-500/50 text-xs text-slate-300 hover:text-white"
                        >
                          Evaluasi DP
                        </Button>
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
      {/* TAB 2: PRESENSI 4 PILAR PPNIA                                */}
      {/* ============================================================ */}
      {activeTab === 'presensi' && (
        <div className="space-y-6">
          {/* Sub-selector Jenis Kegiatan */}
          <div className="flex gap-2 border-b border-slate-800 pb-3">
            {[
              { key: 'pematerian', label: '1. Pematerian Lanjutan' },
              { key: 'presentasi', label: '2. Sidang Presentasi' },
              { key: 'pendakian', label: '3. Pendakian Bersama' },
              { key: 'ekspedisi', label: '4. Ekspedisi Mandiri' },
            ].map((j) => (
              <button
                key={j.key}
                onClick={() => setSelectedJenis(j.key as JenisKegiatanPPNIA)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedJenis === j.key
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {j.label}
              </button>
            ))}
          </div>

          {/* Sesi Selector & Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/40 p-5 rounded-xl border border-slate-800">
            <div className="w-full sm:w-auto flex-1 max-w-xl">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Pilih Sesi {selectedJenis.toUpperCase()}:
              </label>
              <select
                value={selectedSesiId}
                onChange={(e) => setSelectedSesiId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {sesiList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.judul} - ({s.tanggal})
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
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
              >
                {savingPresensi ? <Spinner className="w-4 h-4 mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
                Simpan Presensi Sesi
              </Button>
            </div>
          </div>

          {/* Presensi Table */}
          {loadingPresensi ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Spinner className="w-8 h-8 text-emerald-500 mb-3" />
              <p className="text-sm">Memuat daftar presensi...</p>
            </div>
          ) : presensiItems.length === 0 ? (
            <Card className="p-10 text-center bg-slate-900/30 border-slate-800">
              <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-300 text-sm font-medium">Belum ada sesi pada jenis kegiatan ini.</p>
              <p className="text-slate-500 text-xs mt-1">Gunakan tombol 'Jadwalkan Sesi PPNIA' di atas untuk membuat sesi baru.</p>
            </Card>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/80 text-xs uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3 w-16 text-center">Status</th>
                    <th className="px-5 py-3 font-semibold">Nama Anggota Muda</th>
                    <th className="px-5 py-3 font-semibold">NIM</th>
                    <th className="px-5 py-3 font-semibold">Catatan Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {presensiItems.map((item) => (
                    <tr
                      key={item.anggota_id}
                      className={`hover:bg-slate-800/30 transition-colors ${item.hadir ? 'bg-emerald-500/5' : ''}`}
                    >
                      <td className="px-5 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={item.hadir}
                          onChange={() => handleTogglePresensi(item.anggota_id)}
                          className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer accent-emerald-500"
                        />
                      </td>
                      <td className="px-5 py-4 font-semibold text-white">{item.anggota_nama}</td>
                      <td className="px-5 py-4 text-xs text-slate-400">{item.anggota_nim || '-'}</td>
                      <td className="px-5 py-4">
                        <input
                          type="text"
                          placeholder={item.hadir ? 'Hadir (Opsional catatan)' : 'Alasan ketidakhadiran'}
                          value={item.catatan || ''}
                          onChange={(e) => handlePresensiNoteChange(item.anggota_id, e.target.value)}
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
      {/* TAB 3: KURASI PRESENTASI PRA & PASCA EKSPEDISI              */}
      {/* ============================================================ */}
      {activeTab === 'presentasi' && (
        <div className="space-y-6">
          <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800">
            <h2 className="text-base font-bold text-white">Kurasi Berkas Presentasi PPNIA</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Daftar materi seminar proposal pra-ekspedisi dan LPJ laporan perjalanan pasca-ekspedisi yang diajukan Anggota Muda.
            </p>
          </div>

          {loadingPresentasi ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Spinner className="w-8 h-8 text-emerald-500 mb-3" />
              <p className="text-sm">Memuat berkas presentasi...</p>
            </div>
          ) : presentasiList.length === 0 ? (
            <Card className="p-12 text-center bg-slate-900/30 border-slate-800">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 font-medium">Belum ada berkas presentasi diajukan</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {presentasiList.map((p) => (
                <Card key={p.id} className="p-5 bg-slate-900/60 border-slate-800/80 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          p.jenis === 'pra_ekspedisi'
                            ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
                            : 'text-purple-400 bg-purple-500/10 border-purple-500/20'
                        }`}
                      >
                        {p.jenis === 'pra_ekspedisi' ? 'Seminar Pra-Ekspedisi' : 'Laporan Pasca-Ekspedisi'}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-1.5">{p.catatan || 'Presentasi PPNIA'}</h3>
                      <p className="text-xs text-slate-400">
                        Oleh: <strong className="text-white">{p.anggota_nama}</strong> &bull; NIM: {p.anggota_nim || '-'}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-800/60 rounded-xl text-slate-400">
                      <FileText className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {p.tanggal || '-'}
                    </span>
                    {p.file && (
                      <a
                        href={p.file}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Unduh Slide Materi
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: APPROVAL RENCANA EKSPEDISI                           */}
      {/* ============================================================ */}
      {activeTab === 'ekspedisi' && (
        <div className="space-y-6">
          <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800">
            <h2 className="text-base font-bold text-white">Proposal Rencana Ekspedisi Lapangan PPNIA</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Verifikasi kelayakan rute, deskripsi kegiatan, dan susunan tim sebelum ekspedisi diberangkatkan.
            </p>
          </div>

          {loadingEkspedisi ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Spinner className="w-8 h-8 text-emerald-500 mb-3" />
              <p className="text-sm">Memuat proposal ekspedisi...</p>
            </div>
          ) : ekspedisiList.length === 0 ? (
            <Card className="p-12 text-center bg-slate-900/30 border-slate-800">
              <Mountain className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 font-medium">Belum ada proposal ekspedisi diajukan</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {ekspedisiList.map((ek) => (
                <Card key={ek.id} className="p-6 bg-slate-900/60 border-slate-800/80 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            ek.status_approval === 'disetujui'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : ek.status_approval === 'diajukan'
                              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {ek.status_approval === 'disetujui'
                            ? 'Telah Disetujui'
                            : ek.status_approval === 'diajukan'
                            ? 'Menunggu Verifikasi DP'
                            : 'Ditolak / Perlu Revisi'}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          Rencana Pelaksanaan: {ek.tanggal || '-'}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-1">{ek.deskripsi}</h3>
                      <p className="text-xs text-emerald-400 flex items-center gap-1 pt-0.5">
                        <MapPin className="w-3.5 h-3.5" /> Lokasi Target: {ek.lokasi || '-'}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[11px] text-slate-500 block">Penanggung Jawab:</span>
                      <span className="text-xs font-semibold text-white">{ek.pengaju_nama}</span>
                    </div>
                  </div>

                  {/* Team Members */}
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/70 space-y-1.5 text-xs">
                    <span className="font-semibold text-slate-300">Rekan Satu Tim Ekspedisi ({ek.peserta.length} Orang):</span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {ek.peserta.map((p) => (
                        <span
                          key={p.id}
                          className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-slate-300 text-[11px]"
                        >
                          {p.nama} ({p.nim || 'FPTI'})
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons for DP */}
                  <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={processingEkspedisiId === ek.id || ek.status_approval === 'ditolak'}
                      onClick={() => handleDecideEkspedisi(ek.id, 'ditolak')}
                      className="border-slate-800 hover:border-rose-500 text-xs text-rose-400 hover:bg-rose-500/10"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Tolak / Minta Revisi
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={processingEkspedisiId === ek.id || ek.status_approval === 'disetujui'}
                      onClick={() => handleDecideEkspedisi(ek.id, 'disetujui')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                    >
                      {processingEkspedisiId === ek.id ? (
                        <Spinner className="w-4 h-4 mr-1" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                      )}
                      Setujui Ekspedisi
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: UPDATE EVALUASI BERKALA (WATCHLIST DP)               */}
      {/* ============================================================ */}
      {evalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Evaluasi Berkala Dewan Pengurus
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

            <form onSubmit={handleSaveEvaluasi} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Periode Evaluasi:
                </label>
                <select
                  value={evalPeriode}
                  onChange={(e) => setEvalPeriode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="2025-Q1">2025 - Kuartal 1 (Bulan 1-3)</option>
                  <option value="2025-Q2">2025 - Kuartal 2 (Bulan 4-6)</option>
                  <option value="2025-Q3">2025 - Kuartal 3 (Bulan 7-9)</option>
                  <option value="2025-Q4">2025 - Kuartal 4 (Bulan 10-12)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Status Early Warning:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'aman', label: '🟢 Aman', border: 'border-emerald-500 text-emerald-400 bg-emerald-500/10' },
                    { key: 'perlu_perhatian', label: '🟡 Perhatian', border: 'border-amber-500 text-amber-400 bg-amber-500/10' },
                    { key: 'kritis', label: '🔴 Kritis', border: 'border-rose-500 text-rose-400 bg-rose-500/10' },
                  ].map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setEvalStatus(s.key as any)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                        evalStatus === s.key ? s.border : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Catatan Pembinaan DP:
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Contoh: Keaktifan konsisten, proposal ekspedisi disetujui. Siap lanjut ke tahap evaluasi akhir NIA..."
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
      {/* MODAL: TAMBAH SESI PPNIA                                     */}
      {/* ============================================================ */}
      {showAddSesiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Jadwalkan Sesi Kegiatan PPNIA</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pematerian, presentasi, pendakian, atau ekspedisi mandiri
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
                  Pilar Kegiatan:
                </label>
                <select
                  value={sesiForm.jenis_kegiatan}
                  onChange={(e) =>
                    setSesiForm((prev) => ({
                      ...prev,
                      jenis_kegiatan: e.target.value as any,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="pematerian">1. Pematerian Lanjutan</option>
                  <option value="presentasi">2. Sidang Presentasi Proposal / LPJ</option>
                  <option value="pendakian">3. Pendakian Bersama Latihan</option>
                  <option value="ekspedisi">4. Ekspedisi Mandiri PPNIA</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Judul Sesi Kegiatan:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pematerian: Manajemen Ekspedisi & Manajemen Risiko"
                  value={sesiForm.judul}
                  onChange={(e) =>
                    setSesiForm((prev) => ({ ...prev, judul: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Tanggal Pelaksanaan:
                </label>
                <input
                  type="date"
                  required
                  value={sesiForm.tanggal}
                  onChange={(e) =>
                    setSesiForm((prev) => ({ ...prev, tanggal: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Catatan / Lokasi (Opsional):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Ruang Rapat DP, pukul 19.00 WIB"
                  value={sesiForm.catatan}
                  onChange={(e) =>
                    setSesiForm((prev) => ({ ...prev, catatan: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
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
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                >
                  {submittingSesi ? <Spinner className="w-4 h-4 mr-1.5" /> : null}
                  Jadwalkan Sesi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
