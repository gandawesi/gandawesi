'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchMyPPNIASummary,
  submitPresentasiPPNIA,
  submitRencanaEkspedisi,
} from '@/lib/actions/ppnia';
import { fetchMyEvaluasiAkhirSummary } from '@/lib/actions/evaluasi-nia';
import type { MyPPNIASummary } from '@/lib/types/ppnia';
import type { MyEvaluasiAkhirSummary } from '@/lib/types/evaluasi-nia';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import {
  BookOpen,
  Activity,
  Award,
  Mountain,
  FileText,
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  MapPin,
  ExternalLink,
  Users,
  Send,
  Sparkles,
  ShieldCheck,
  Compass,
  GraduationCap,
  QrCode,
  Printer,
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';

export default function PPNIAPortalPage() {
  const { profile } = useAuth();
  const [summary, setSummary] = useState<MyPPNIASummary | null>(null);
  const [evalAkhir, setEvalAkhir] = useState<MyEvaluasiAkhirSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'presentasi' | 'ekspedisi' | 'sidang_nia'>('presentasi');

  // Presentasi Form State
  const [presForm, setPresForm] = useState({
    jenis: 'pra_ekspedisi' as 'pra_ekspedisi' | 'pasca_ekspedisi',
    tanggal: new Date().toISOString().split('T')[0],
    file: '',
    catatan: '',
  });
  const [submittingPres, setSubmittingPres] = useState(false);

  // Ekspedisi Form State
  const [ekspForm, setEkspForm] = useState({
    deskripsi: '',
    lokasi: '',
    tanggal: '',
    peserta_ids: [] as string[],
  });
  const [submittingEksp, setSubmittingEksp] = useState(false);

  // Feedback Notification
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [ppniaData, evalData] = await Promise.all([
      fetchMyPPNIASummary(),
      fetchMyEvaluasiAkhirSummary(),
    ]);
    setSummary(ppniaData);
    setEvalAkhir(evalData);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Submit Presentation Handler
  const handleSubmitPresentasi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!presForm.catatan || !presForm.file) return;

    setSubmittingPres(true);
    const res = await submitPresentasiPPNIA(presForm);
    setSubmittingPres(false);

    if (res.success) {
      setFeedback({ type: 'success', text: res.message || 'Berkas presentasi berhasil diajukan!' });
      setPresForm({
        jenis: 'pra_ekspedisi',
        tanggal: new Date().toISOString().split('T')[0],
        file: '',
        catatan: '',
      });
      loadData();
    } else {
      setFeedback({ type: 'error', text: res.error || 'Gagal mengajukan presentasi.' });
    }
  };

  // Submit Expedition Handler
  const handleSubmitEkspedisi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ekspForm.deskripsi || !ekspForm.lokasi) return;

    setSubmittingEksp(true);
    const res = await submitRencanaEkspedisi(ekspForm);
    setSubmittingEksp(false);

    if (res.success) {
      setFeedback({ type: 'success', text: res.message || 'Proposal rencana ekspedisi berhasil diajukan!' });
      setEkspForm({ deskripsi: '', lokasi: '', tanggal: '', peserta_ids: [] });
      loadData();
    } else {
      setFeedback({ type: 'error', text: res.error || 'Gagal mengajukan rencana ekspedisi.' });
    }
  };

  if (loading || !summary) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400">
        <Spinner className="w-8 h-8 text-emerald-500 mb-3" />
        <p className="text-sm font-medium">Memuat data aktivitas PPNIA Anda...</p>
      </div>
    );
  }

  const evalStatus = summary.evaluasi_terkini?.status || 'aman';

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-forest-950/80 via-emerald-950/40 to-slate-900 border border-forest-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                <Compass className="w-3.5 h-3.5" /> Program PPNIA (~1 Tahun)
              </span>
              {evalAkhir?.nia ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-emerald-500/20 text-amber-300 border border-amber-500/40 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Resmi Anggota Biasa: {evalAkhir.nia}
                </span>
              ) : (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Anggota Muda {summary.nama_angkatan ? `(${summary.nama_angkatan})` : ''}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Portal Aktivitas & Progres PPNIA
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Pelacakan mandiri pemenuhan 4 pilar kegiatan wajib, unggah materi seminar presentasi, dan pengajuan proposal ekspedisi sebelum evaluasi akhir penerbitan Nomor Induk Anggota (NIA).
            </p>
          </div>

          {/* Early Warning Status Card */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 shrink-0 text-right space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Watchlist Dewan Pengurus:
            </span>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full">
              {evalStatus === 'aman' ? (
                <span className="text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  🟢 Status: Aman
                </span>
              ) : evalStatus === 'perlu_perhatian' ? (
                <span className="text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  🟡 Perlu Perhatian
                </span>
              ) : (
                <span className="text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                  🔴 Kritis
                </span>
              )}
            </div>
            {summary.evaluasi_terkini?.catatan && (
              <p className="text-[11px] text-slate-400 max-w-xs text-left pt-1 border-t border-slate-800/80 mt-1">
                "{summary.evaluasi_terkini.catatan}"
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Toast */}
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
            &times;
          </button>
        </div>
      )}

      {/* 4 Pillars Progress Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                1. Pematerian Lanjutan
              </p>
              <p className="text-2xl font-bold text-white mt-1">
                {summary.pematerian_count.hadir} / {summary.pematerian_count.total}
              </p>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full"
              style={{
                width: `${Math.min(
                  100,
                  (summary.pematerian_count.hadir / summary.pematerian_count.total) * 100
                )}%`,
              }}
            />
          </div>
        </Card>

        <Card className="p-5 bg-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                2. Sidang Presentasi
              </p>
              <p className="text-2xl font-bold text-cyan-400 mt-1">
                {summary.presentasi_count.hadir} / {summary.presentasi_count.total}
              </p>
            </div>
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full"
              style={{
                width: `${Math.min(
                  100,
                  (summary.presentasi_count.hadir / summary.presentasi_count.total) * 100
                )}%`,
              }}
            />
          </div>
        </Card>

        <Card className="p-5 bg-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                3. Pendakian Bersama
              </p>
              <p className="text-2xl font-bold text-amber-400 mt-1">
                {summary.pendakian_count.hadir} / {summary.pendakian_count.total}
              </p>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
              <Mountain className="w-5 h-5" />
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full"
              style={{
                width: `${Math.min(
                  100,
                  (summary.pendakian_count.hadir / summary.pendakian_count.total) * 100
                )}%`,
              }}
            />
          </div>
        </Card>

        <Card className="p-5 bg-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                4. Ekspedisi Mandiri
              </p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {summary.ekspedisi_count.hadir} / {summary.ekspedisi_count.total}
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{
                width: `${Math.min(
                  100,
                  (summary.ekspedisi_count.hadir / summary.ekspedisi_count.total) * 100
                )}%`,
              }}
            />
          </div>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('presentasi')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'presentasi'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Pengajuan Slide Presentasi
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {summary.presentasi_list.length} Berkas
          </span>
        </button>
        <button
          onClick={() => setActiveTab('ekspedisi')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'ekspedisi'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Mountain className="w-4 h-4" />
          Rencana Ekspedisi Kelompok
          {summary.ekspedisi_saya && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
              {summary.ekspedisi_saya.status_approval.toUpperCase()}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('sidang_nia')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'sidang_nia'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          Sidang Pleno & Kartu NIA
          {evalAkhir?.nia ? (
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {evalAkhir.nia}
            </span>
          ) : evalAkhir?.status_sidang === 'lolos' ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
              LOLOS
            </span>
          ) : null}
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: FORM PENGAJUAN PRESENTASI                             */}
      {/* ============================================================ */}
      {activeTab === 'presentasi' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Submit */}
          <Card className="p-6 bg-slate-900/60 border-slate-800 lg:col-span-1 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Unggah Berkas Presentasi</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Seminar Proposal (Pra-Ekspedisi) atau Laporan Pertanggungjawaban (Pasca-Ekspedisi).
              </p>
            </div>

            <form onSubmit={handleSubmitPresentasi} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Jenis Presentasi:
                </label>
                <select
                  value={presForm.jenis}
                  onChange={(e) => setPresForm((prev) => ({ ...prev, jenis: e.target.value as any }))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="pra_ekspedisi">Seminar Proposal Pra-Ekspedisi</option>
                  <option value="pasca_ekspedisi">Sidang LPJ Pasca-Ekspedisi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Judul Materi / Topik Seminar:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Proposal Ekspedisi Lembah Cilimus Ciremai"
                  value={presForm.catatan}
                  onChange={(e) => setPresForm((prev) => ({ ...prev, catatan: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Tautan File Slide (Google Drive / Cloud PDF):
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/file/d/..."
                  value={presForm.file}
                  onChange={(e) => setPresForm((prev) => ({ ...prev, file: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Tanggal Pelaksanaan Seminar:
                </label>
                <input
                  type="date"
                  required
                  value={presForm.tanggal}
                  onChange={(e) => setPresForm((prev) => ({ ...prev, tanggal: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={submittingPres || !presForm.catatan || !presForm.file}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs py-2.5"
              >
                {submittingPres ? <Spinner className="w-4 h-4 mr-1.5" /> : <UploadCloud className="w-4 h-4 mr-1.5" />}
                Kirim Berkas Presentasi
              </Button>
            </form>
          </Card>

          {/* List of Submissions */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Riwayat Berkas Presentasi Anda
            </h3>

            {summary.presentasi_list.length === 0 ? (
              <Card className="p-10 text-center bg-slate-900/30 border-slate-800">
                <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-300 text-sm font-medium">Belum ada berkas presentasi yang diunggah</p>
                <p className="text-slate-500 text-xs mt-1">Gunakan form di samping untuk mengunggah materi seminar Anda.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {summary.presentasi_list.map((p) => (
                  <Card key={p.id} className="p-5 bg-slate-900/60 border-slate-800 space-y-3">
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
                        <h4 className="text-sm font-bold text-white mt-1">{p.catatan || 'Presentasi PPNIA'}</h4>
                      </div>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {p.tanggal}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex justify-end">
                      {p.file && (
                        <a
                          href={p.file}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Buka Slide Materi
                        </a>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: RENCANA EKSPEDISI KELOMPOK                            */}
      {/* ============================================================ */}
      {activeTab === 'ekspedisi' && (
        <div className="space-y-6">
          {summary.ekspedisi_saya ? (
            <Card className="p-6 bg-slate-900/60 border-slate-800 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${
                        summary.ekspedisi_saya.status_approval === 'disetujui'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : summary.ekspedisi_saya.status_approval === 'diajukan'
                          ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {summary.ekspedisi_saya.status_approval === 'disetujui'
                        ? 'Telah Disetujui DP'
                        : summary.ekspedisi_saya.status_approval === 'diajukan'
                        ? 'Sedang Ditinjau DP'
                        : 'Memerlukan Revisi'}
                    </span>
                    <span className="text-xs text-slate-400">
                      Rencana: {summary.ekspedisi_saya.tanggal || '-'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">
                    {summary.ekspedisi_saya.deskripsi}
                  </h3>
                  <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Lokasi Target: {summary.ekspedisi_saya.lokasi}
                  </p>
                </div>

                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl shrink-0">
                  <Mountain className="w-7 h-7" />
                </div>
              </div>

              {/* Team Members */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-400" />
                  Rekan Satu Tim Ekspedisi ({summary.ekspedisi_saya.peserta.length} Orang):
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {summary.ekspedisi_saya.peserta.map((p) => (
                    <span
                      key={p.id}
                      className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg text-slate-200 text-xs font-medium"
                    >
                      {p.nama} ({p.nim || 'FPTI'})
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 bg-slate-900/60 border-slate-800 max-w-2xl mx-auto space-y-5">
              <div>
                <h3 className="text-base font-bold text-white">Ajukan Proposal Rencana Ekspedisi</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Rancang ekspedisi penjelajahan alam mandiri bersama tim rekan Anggota Muda Anda.
                </p>
              </div>

              <form onSubmit={handleSubmitEkspedisi} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Judul & Deskripsi Riset/Penjelajahan:
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Contoh: Ekspedisi Pendataan Biodiversitas & Pemetaan Jalur Kuno Lembah Cilimus Gunung Ciremai..."
                    value={ekspForm.deskripsi}
                    onChange={(e) => setEkspForm((prev) => ({ ...prev, deskripsi: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Lokasi Target Ekspedisi:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Taman Nasional Gunung Ciremai, Jawa Barat"
                    value={ekspForm.lokasi}
                    onChange={(e) => setEkspForm((prev) => ({ ...prev, lokasi: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Estimasi Tanggal Pelaksanaan:
                  </label>
                  <input
                    type="date"
                    required
                    value={ekspForm.tanggal}
                    onChange={(e) => setEkspForm((prev) => ({ ...prev, tanggal: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={submittingEksp || !ekspForm.deskripsi || !ekspForm.lokasi}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs py-2.5"
                >
                  {submittingEksp ? <Spinner className="w-4 h-4 mr-1.5" /> : <Send className="w-4 h-4 mr-1.5" />}
                  Ajukan Proposal Ekspedisi ke DP
                </Button>
              </form>
            </Card>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: SIDANG PLENO DP & KARTU DIGITAL NIA                   */}
      {/* ============================================================ */}
      {activeTab === 'sidang_nia' && (
        <div className="space-y-8">
          {/* Status Sidang & NIA Overview Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card className="p-5 bg-slate-900/70 border-slate-800 flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl shrink-0">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Keputusan Sidang Pleno
                </span>
                <div className="text-base font-bold text-white mt-0.5">
                  {evalAkhir?.status_sidang === 'lolos' ? (
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Dinyatakan Lolos
                    </span>
                  ) : evalAkhir?.status_sidang === 'tunda' ? (
                    <span className="text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> Ditunda / Perlu Revisi
                    </span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> Menunggu Sidang DP
                    </span>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-5 bg-slate-900/70 border-slate-800 flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl shrink-0">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Nomor Induk Anggota (NIA)
                </span>
                <p className="text-base font-mono font-bold text-amber-400 mt-0.5">
                  {evalAkhir?.nia || 'Belum Diterbitkan'}
                </p>
              </div>
            </Card>

            <Card className="p-5 bg-slate-900/70 border-slate-800 flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl shrink-0">
                <Activity className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Rata-rata Skor Evaluasi
                </span>
                <p className="text-base font-bold text-white mt-0.5">
                  <span className="text-indigo-400 text-lg">{evalAkhir?.rata_rata_skor || '-'}</span> / 100
                </p>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Digital Member ID Card (NIA Card) */}
            <div className="lg:col-span-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Kartu Digital Anggota Biasa (KTA)
                </h3>
                {evalAkhir?.nia && (
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" /> Cetak Kartu
                  </button>
                )}
              </div>

              {evalAkhir?.nia ? (
                /* The Prestigious KTA Card */
                <div className="relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-stone-900 via-[#0a1812] to-slate-950 border-2 border-amber-500/40 shadow-2xl shadow-emerald-950/40">
                  {/* Watermark & Decorative background */}
                  <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

                  {/* Card Header */}
                  <div className="relative z-10 flex items-start justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-forest-900/90 border border-forest-600 flex items-center justify-center font-black text-emerald-400 text-sm tracking-wider shadow-inner">
                        GW
                      </div>
                      <div>
                        <h4 className="text-xs font-black tracking-wider text-white uppercase">
                          GANDAWESI FPTI UPI
                        </h4>
                        <p className="text-[10px] text-emerald-400 font-medium tracking-wide">
                          Perhimpunan Mahasiswa Pecinta Alam
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <ShieldCheck className="w-3 h-3 text-amber-400" />
                      Anggota Biasa
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="relative z-10 my-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-forest-800 to-emerald-900 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-200 text-2xl font-black shrink-0 shadow-lg">
                      {profile?.nama?.slice(0, 2).toUpperCase() || 'GW'}
                    </div>
                    <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                        Nama Lengkap
                      </p>
                      <h3 className="text-lg sm:text-xl font-black text-white tracking-tight truncate">
                        {profile?.nama || 'Alya Putri Salsabila'}
                      </h3>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs">
                        <span className="text-slate-300 font-medium">
                          Angkatan {evalAkhir.nomor_angkatan || summary.nomor_angkatan || '-'}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-emerald-400 font-semibold">
                          {evalAkhir.nama_angkatan || summary.nama_angkatan || 'Rimba Halimun'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer with Big NIA & QR Code */}
                  <div className="relative z-10 pt-4 border-t border-white/10 flex items-end justify-between gap-4">
                    <div>
                      <span className="text-[9px] font-bold text-amber-400/80 uppercase tracking-widest block mb-0.5">
                        Nomor Induk Anggota (NIA) Resmi
                      </span>
                      <div className="font-mono text-xl sm:text-2xl font-extrabold tracking-widest text-amber-300 bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-500/30 inline-block">
                        {evalAkhir.nia}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Diterbitkan: {evalAkhir.tanggal_nia_terbit || '-'}
                      </p>
                    </div>

                    <div className="p-2 bg-white/5 rounded-xl border border-white/10 shrink-0 text-center">
                      <QrCode className="w-10 h-10 text-slate-300 mx-auto" />
                      <span className="text-[8px] font-mono text-slate-400 mt-0.5 block">VERIFIED</span>
                    </div>
                  </div>
                </div>
              ) : (
                <Card className="p-8 bg-slate-900/60 border-slate-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <Award className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Kartu NIA Belum Diterbitkan</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    Nomor Induk Anggota (NIA) dan Kartu Anggota Penuh akan diterbitkan setelah Anda menyelesaikan seluruh tahapan PPNIA dan dinyatakan Lolos dalam Sidang Pleno Dewan Pengurus.
                  </p>
                </Card>
              )}

              {/* Plenary Notes Card */}
              {evalAkhir?.catatan_sidang && (
                <Card className="p-5 bg-slate-900/60 border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    Catatan Sidang Pleno Dewan Pengurus:
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 italic">
                    "{evalAkhir.catatan_sidang}"
                  </p>
                </Card>
              )}
            </div>

            {/* Right Column: Transkrip Nilai Evaluasi Kriteria */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  Transkrip Nilai Evaluasi PPNIA
                </h3>
                <span className="text-xs text-slate-400">
                  {evalAkhir?.transkrip_nilai?.length || 0} Kriteria Dinilai
                </span>
              </div>

              <div className="space-y-3">
                {evalAkhir?.transkrip_nilai && evalAkhir.transkrip_nilai.length > 0 ? (
                  evalAkhir.transkrip_nilai.map((item, idx) => (
                    <Card key={item.id || idx} className="p-4 bg-slate-900/60 border-slate-800 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            Kriteria #{idx + 1}
                          </span>
                          <h4 className="text-xs font-bold text-white mt-0.5">
                            {item.nama_kriteria}
                          </h4>
                        </div>
                        <div className="text-right shrink-0">
                          {item.skor !== null ? (
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                              item.skor >= 85
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : item.skor >= 70
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}>
                              Skor: {item.skor} / 100
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500 italic">Belum dinilai</span>
                          )}
                        </div>
                      </div>

                      {/* Score progress bar */}
                      {item.skor !== null && (
                        <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.skor >= 85 ? 'bg-emerald-500' : item.skor >= 70 ? 'bg-indigo-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, item.skor))}%` }}
                          />
                        </div>
                      )}

                      {item.catatan && (
                        <p className="text-[11px] text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                          <span className="font-semibold text-slate-300">Catatan Penguji:</span> {item.catatan}
                        </p>
                      )}
                    </Card>
                  ))
                ) : (
                  <Card className="p-8 bg-slate-900/60 border-slate-800 text-center">
                    <p className="text-xs text-slate-400">Belum ada transkrip nilai evaluasi yang tercatat.</p>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
