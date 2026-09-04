'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchSiswaDashboardData,
  fetchMateriList,
  fetchSoalPostTest,
  submitPostTest,
  fetchAlatSiswaList,
  upsertAlatSiswa,
  submitTesKesehatanAkhir,
} from '@/lib/actions/siswa';
import { fetchSesiKegiatanList } from '@/lib/actions/admin-siswa';
import { fetchMyMedanOperasiSummary } from '@/lib/actions/medan-operasi';
import type {
  MateriKaderisasiItem,
  SoalPostTestItem,
  AlatSiswaItem,
  SesiKegiatanItem,
} from '@/lib/types/siswa';
import type { MyMedanOperasiSummary } from '@/lib/types/medan-operasi';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import {
  Award,
  Activity,
  Package,
  BookOpen,
  HeartPulse,
  CheckCircle2,
  Clock,
  ChevronRight,
  Shield,
  UploadCloud,
  FileCheck,
  AlertCircle,
  X,
  Send,
  Sparkles,
  Compass,
  Mountain,
} from 'lucide-react';

export default function KaderisasiSiswaPage() {
  const [activeTab, setActiveTab] = useState<'jasmani' | 'alat' | 'materi' | 'kesehatan' | 'medan_operasi'>('materi');
  const [medanSummary, setMedanSummary] = useState<MyMedanOperasiSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Dashboard metrics
  const [metrics, setMetrics] = useState({
    presensiPercentage: 0,
    totalSesiJasmani: 0,
    kehadiranJasmani: 0,
    alatPercentage: 0,
    totalAlat: 0,
    alatLengkap: 0,
    postTestAverage: 0,
    hasTesKesehatanAkhir: false,
    statusTahap: 'dalam_proses',
  });

  // Tab 1: Sesi Jasmani
  const [sesiJasmaniList, setSesiJasmaniList] = useState<SesiKegiatanItem[]>([]);

  // Tab 2: Alat
  const [alatList, setAlatList] = useState<AlatSiswaItem[]>([]);
  const [editingAlat, setEditingAlat] = useState<AlatSiswaItem | null>(null);

  // Tab 3: Materi & Post-Test
  const [materiList, setMateriList] = useState<MateriKaderisasiItem[]>([]);
  const [quizMateri, setQuizMateri] = useState<MateriKaderisasiItem | null>(null);
  const [quizSoalList, setQuizSoalList] = useState<SoalPostTestItem[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<{ score: number; message: string } | null>(null);

  // Tab 4: Tes Kesehatan Akhir
  const [uploadingHealth, setUploadingHealth] = useState(false);

  // Feedback notification
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [dashData, matData, alData, sesData, medanData] = await Promise.all([
      fetchSiswaDashboardData(),
      fetchMateriList(),
      fetchAlatSiswaList(),
      fetchSesiKegiatanList('bina_jasmani'),
      fetchMyMedanOperasiSummary(),
    ]);

    setMetrics(dashData);
    setMateriList(matData);
    setAlatList(alData);
    setSesiJasmaniList(sesData);
    setMedanSummary(medanData);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Start Post-Test Quiz
  const handleOpenQuiz = async (materi: MateriKaderisasiItem) => {
    setQuizMateri(materi);
    setQuizAnswers({});
    setQuizResult(null);
    const soals = await fetchSoalPostTest(materi.id);
    setQuizSoalList(soals);
  };

  // Submit Post-Test Answers via RPC
  const handleSubmitQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizMateri) return;

    setSubmittingQuiz(true);
    const payload = Object.entries(quizAnswers).map(([soal_id, jawaban]) => ({
      soal_id,
      jawaban,
    }));

    const res = await submitPostTest(quizMateri.id, payload);
    setSubmittingQuiz(false);

    if (res.success && res.score !== undefined) {
      setQuizResult({ score: res.score, message: res.message || 'Post-test dinilai oleh server.' });
      loadData();
    } else {
      setFeedback({ type: 'error', text: res.error || 'Gagal mengirim jawaban.' });
    }
  };

  // Toggle Equipment Status
  const handleToggleAlatStatus = async (alat: AlatSiswaItem) => {
    const nextStatus = alat.status === 'lengkap' ? 'belum' : 'lengkap';
    const res = await upsertAlatSiswa({
      id: alat.id,
      nama_alat: alat.nama_alat,
      jenis: alat.jenis,
      sumber: alat.sumber,
      status: nextStatus,
      tanggal_kembali: alat.tanggal_kembali,
    });

    if (res.success) {
      setFeedback({ type: 'success', text: `Status ${alat.nama_alat} diubah menjadi ${nextStatus.toUpperCase()}` });
      loadData();
    }
  };

  // Upload final health document
  const handleUploadTesAkhir = async () => {
    setUploadingHealth(true);
    const mockPath = `/uploads/tes_kesehatan_akhir_${Date.now()}.pdf`;
    const res = await submitTesKesehatanAkhir(mockPath);
    setUploadingHealth(false);

    if (res.success) {
      setFeedback({ type: 'success', text: res.message || 'Surat tes kesehatan akhir disimpan!' });
      loadData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-xs text-stone-500 font-medium">Memuat portal kurikulum kaderisasi Siswa...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-forest-950 via-forest-900 to-moss-900 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-700/60 border border-forest-500/30 text-forest-200 text-xs font-semibold mb-3">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Kaderisasi Tahap Siswa (~3 Bulan)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Portal Pelatihan & Evaluasi Siswa
          </h1>

          <p className="text-forest-100/80 text-xs sm:text-sm mt-2 leading-relaxed">
            Pantau kehadiran bina jasmani, kelengkapan alat pribadi/kelompok, kuis post-test pematerian online, serta tes kesehatan akhir menuju kelulusan ke Medan Operasi.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
              <Clock className="w-3.5 h-3.5" />
              Status: {metrics.statusTahap === 'lolos' ? 'Lolos ke Medan Operasi' : 'Dalam Proses Diklat'}
            </span>
            <span className="text-stone-300">Keputusan Akhir: Ketua Dewan Pengurus (DP)</span>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-semibold ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Progress Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-stone-400 uppercase font-semibold">Bina Jasmani</span>
            <p className="text-2xl font-extrabold text-stone-900 dark:text-white mt-0.5">
              {metrics.presensiPercentage}%
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              {metrics.kehadiranJasmani} dari {metrics.totalSesiJasmani} sesi
            </p>
          </div>
          <Activity className="w-7 h-7 text-forest-600" />
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-stone-400 uppercase font-semibold">Kelengkapan Alat</span>
            <p className="text-2xl font-extrabold text-stone-900 dark:text-white mt-0.5">
              {metrics.alatPercentage}%
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              {metrics.alatLengkap} dari {metrics.totalAlat} perlengkapan
            </p>
          </div>
          <Package className="w-7 h-7 text-amber-500" />
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-stone-400 uppercase font-semibold">Rata-rata Post-Test</span>
            <p className="text-2xl font-extrabold text-stone-900 dark:text-white mt-0.5">
              {metrics.postTestAverage}
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">Skala nilai 0-100</p>
          </div>
          <BookOpen className="w-7 h-7 text-blue-500" />
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-stone-400 uppercase font-semibold">Tes Kesehatan Akhir</span>
            <p className="text-sm font-bold mt-1">
              {metrics.hasTesKesehatanAkhir ? (
                <span className="text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Lengkap
                </span>
              ) : (
                <span className="text-amber-600 flex items-center gap-1">
                  <Clock className="w-4 h-4" /> Belum Diunggah
                </span>
              )}
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">Syarat Medan Operasi</p>
          </div>
          <HeartPulse className="w-7 h-7 text-rose-500" />
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 overflow-x-auto pb-1">
        {[
          { key: 'materi', label: 'Modul & Post-Test Online', icon: BookOpen },
          { key: 'alat', label: 'Checklist Kelengkapan Alat', icon: Package },
          { key: 'jasmani', label: 'Sesi Bina Jasmani', icon: Activity },
          { key: 'kesehatan', label: 'Tes Kesehatan Akhir', icon: HeartPulse },
          { key: 'medan_operasi', label: 'Medan Operasi & Pelantikan', icon: Compass },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-forest-800 text-white shadow-xs dark:bg-forest-700'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PEMATERIAN & POST-TEST ONLINE */}
      {activeTab === 'materi' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                Kurikulum Pematerian Tahap Siswa
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Siswa dapat membaca modul materi dan mengerjakan kuis evaluasi post-test secara online
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {materiList.map((materi) => (
              <Card key={materi.id} className="p-5 flex flex-col justify-between hover:border-forest-500/40 transition-all">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-forest-50 dark:bg-forest-950/60 text-forest-700 dark:text-forest-300">
                      {materi.tanggal ? `Materi: ${materi.tanggal}` : 'Kurikulum Wajib'}
                    </span>
                    {materi.sudah_dikerjakan ? (
                      <span className="text-[11px] font-extrabold text-emerald-600 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Skor: {materi.skor_siswa}/100
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                        Belum Dikerjakan
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-stone-900 dark:text-white leading-snug">
                    {materi.judul}
                  </h4>

                  <p className="text-xs text-stone-500">
                    Jumlah Soal: <strong>{materi.total_soal || 5} Pertanyaan</strong> • Penilaian aman di sisi server via RPC
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400">Post-Test Online</span>
                  <Button
                    size="sm"
                    variant={materi.sudah_dikerjakan ? 'outline' : 'primary'}
                    onClick={() => handleOpenQuiz(materi)}
                  >
                    {materi.sudah_dikerjakan ? 'Kerjakan Ulang' : 'Kerjakan Kuis'}
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CHECKLIST ALAT SISWA */}
      {activeTab === 'alat' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                Checklist Perlengkapan Ekspedisi
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Kesiapan perlengkapan pribadi dan regu menjelang keberangkatan latihan rimba gunung
              </p>
            </div>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-stone-900/60 text-stone-500 font-semibold border-b border-stone-100 dark:border-stone-800 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Nama Perlengkapan</th>
                    <th className="py-3 px-4">Jenis</th>
                    <th className="py-3 px-4">Sumber Alat</th>
                    <th className="py-3 px-4">Status Kesiapan</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {alatList.map((alat) => (
                    <tr key={alat.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/30">
                      <td className="py-3 px-4 font-bold text-stone-900 dark:text-white">
                        {alat.nama_alat}
                      </td>
                      <td className="py-3 px-4 capitalize text-stone-600 dark:text-stone-300">
                        {alat.jenis}
                      </td>
                      <td className="py-3 px-4 text-stone-600 dark:text-stone-400">
                        {alat.sumber === 'pinjam_gandawesi'
                          ? 'Inventaris Gandawesi'
                          : alat.sumber === 'pinjam_luar'
                          ? 'Pinjam Luar'
                          : 'Beli / Milik Sendiri'}
                      </td>
                      <td className="py-3 px-4">
                        {alat.status === 'lengkap' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Lengkap
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                            <Clock className="w-3.5 h-3.5" /> Belum Ada
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleAlatStatus(alat)}
                          className="text-xs"
                        >
                          {alat.status === 'lengkap' ? 'Tandai Belum' : 'Tandai Lengkap'}
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

      {/* TAB 3: BINA JASMANI */}
      {activeTab === 'jasmani' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
              Jadwal & Riwayat Latihan Fisik (Bina Jasmani)
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Latihan fisik rutin 2x/minggu untuk mengukur daya tahan aerobik dan kekuatan beban
            </p>
          </div>

          <div className="space-y-3">
            {sesiJasmaniList.map((sesi, idx) => (
              <Card key={sesi.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-forest-50 dark:bg-forest-950/60 text-forest-700 dark:text-forest-300 flex items-center justify-center font-bold text-xs shrink-0">
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white">
                      {sesi.judul}
                    </h4>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Tanggal: {sesi.tanggal} • {sesi.catatan || 'Lokasi Kampus UPI'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Terdata Hadir
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TES KESEHATAN AKHIR */}
      {activeTab === 'kesehatan' && (
        <div className="space-y-4 max-w-2xl mx-auto">
          <Card className="p-6 md:p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <HeartPulse className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                Tes Kesehatan Akhir Sebelum Medan Operasi
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto leading-relaxed">
                Seluruh siswa yang akan diberangkatkan ke tahap ekspedisi lapangan wajib menyerahkan surat keterangan sehat mutakhir dari dokter/fasilitas kesehatan resmi.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800 text-xs text-left space-y-1.5">
              <span className="font-bold text-stone-700 dark:text-stone-300 block">
                Status Berkas Pemeriksaan Akhir:
              </span>
              <p className="text-stone-600 dark:text-stone-400">
                {metrics.hasTesKesehatanAkhir
                  ? 'Surat keterangan sehat akhir telah tercatat di basis data tim medis panitia.'
                  : 'Berkas belum diunggah. Silakan unggah surat keterangan dokter terbaru di bawah.'}
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={handleUploadTesAkhir}
              disabled={uploadingHealth}
              className="w-full sm:w-auto"
            >
              <UploadCloud className="w-4 h-4 mr-2" />
              {metrics.hasTesKesehatanAkhir ? 'Perbarui Surat Kesehatan Akhir' : 'Unggah Surat Kesehatan Akhir'}
            </Button>
          </Card>
        </div>
      )}

      {/* TAB 5: MEDAN OPERASI & PELANTIKAN ANGGOTA MUDA */}
      {activeTab === 'medan_operasi' && (
        <div className="space-y-6">
          {/* Status Celebration Banner */}
          {medanSummary?.status_keanggotaan === 'anggota_muda' ? (
            <Card className="p-6 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border-indigo-500/40">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 bg-indigo-500/20 px-3 py-0.5 rounded-full border border-indigo-500/30">
                    <Sparkles className="w-3.5 h-3.5" /> Resmi Dilantik
                  </span>
                  <h3 className="text-xl font-extrabold text-white">
                    Selamat! Anda Resmi Berstatus Anggota Muda{' '}
                    <span className="text-amber-400">"{medanSummary.nama_angkatan || 'Giri Wardhana'}"</span>
                  </h3>
                  <p className="text-xs text-indigo-200/80 max-w-xl">
                    Seluruh tahapan diklat lapangan telah dilalui. Nama angkatan Anda telah disepakati melalui musyawarah dan disahkan oleh Dewan Pengurus.
                  </p>
                </div>
                <div className="p-4 bg-indigo-500/20 text-indigo-300 rounded-2xl border border-indigo-500/30">
                  <Award className="w-8 h-8" />
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6 bg-slate-900/60 border-slate-800">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-0.5 rounded-full border border-amber-500/20">
                    <Mountain className="w-3.5 h-3.5" /> Ekspedisi Lapangan Berjalan
                  </span>
                  <h3 className="text-lg font-bold text-white">Tahap Puncak: Medan Operasi Rimba</h3>
                  <p className="text-xs text-slate-400 max-w-xl">
                    Perjalanan navigasi darat, bivak alam, dan survival sedang dievaluasi langsung oleh Komandan Latihan (Danlat). Perhatikan catatan instruktur untuk peningkatan performa.
                  </p>
                </div>
                <div className="text-right sm:border-l sm:border-slate-800 sm:pl-6">
                  <p className="text-[11px] text-slate-500 uppercase font-semibold">Rata-rata Skor Danlat</p>
                  <p className="text-2xl font-extrabold text-emerald-400 mt-0.5">
                    {medanSummary?.rata_rata_skor || 88} / 100
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Evaluasi Lapangan Log */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              Catatan Observasi Danlat & Instruktur
            </h4>

            {medanSummary?.evaluasi_list && medanSummary.evaluasi_list.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {medanSummary.evaluasi_list.map((item) => (
                  <Card key={item.id} className="p-4 bg-slate-900/40 border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-400">
                        {item.evaluator_nama || 'Komandan Latihan'}
                      </span>
                      <div className="flex items-center gap-2">
                        {item.skor !== null && (
                          <span className="font-bold text-slate-200 bg-slate-800 px-2 py-0.5 rounded">
                            Skor: {item.skor}
                          </span>
                        )}
                        <span className="text-slate-500">{item.tanggal}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">"{item.catatan}"</p>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center bg-slate-900/20 border-slate-800">
                <p className="text-xs text-slate-400">Belum ada evaluasi lapangan tercatat.</p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* MODAL KUIS POST-TEST ONLINE (RAMAH PONSEL / MOBILE-FRIENDLY) */}
      {quizMateri && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <Card className="max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-forest-600 uppercase tracking-wider">
                  Post-Test Online (RPC Evaluation)
                </span>
                <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white">
                  {quizMateri.judul}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQuizMateri(null)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {quizResult ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-2xl font-extrabold text-stone-900 dark:text-white">
                    Skor Anda: {quizResult.score} / 100
                  </h4>
                  <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                    {quizResult.message}
                  </p>
                </div>
                <Button size="sm" onClick={() => setQuizMateri(null)}>
                  Tutup dan Kembali ke Materi
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmitQuiz} className="space-y-6">
                <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2">
                  {quizSoalList.map((soal, idx) => (
                    <div key={soal.id} className="p-4 rounded-2xl bg-stone-50/70 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800 space-y-3">
                      <p className="text-xs font-bold text-stone-900 dark:text-white leading-relaxed">
                        {idx + 1}. {soal.pertanyaan}
                      </p>

                      <div className="space-y-2">
                        {soal.pilihan.map((opsi) => {
                          const optionKey = opsi.slice(0, 1); // 'A', 'B', 'C', 'D'
                          const isSelected = quizAnswers[soal.id] === optionKey;
                          return (
                            <label
                              key={opsi}
                              onClick={() => setQuizAnswers({ ...quizAnswers, [soal.id]: optionKey })}
                              className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-forest-600 bg-forest-50 dark:bg-forest-950/60 text-forest-900 dark:text-forest-200 font-semibold ring-2 ring-forest-500/20'
                                  : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0f1814] text-stone-700 dark:text-stone-300 hover:bg-stone-50'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`soal-${soal.id}`}
                                checked={isSelected}
                                onChange={() => {}}
                                className="text-forest-600 focus:ring-forest-500"
                              />
                              <span>{opsi}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800 text-xs">
                  <span className="text-stone-400">
                    Terjawab: {Object.keys(quizAnswers).length} dari {quizSoalList.length} soal
                  </span>

                  <div className="flex items-center gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setQuizMateri(null)}>
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={submittingQuiz || Object.keys(quizAnswers).length < quizSoalList.length}
                    >
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                      {submittingQuiz ? 'Menilai...' : 'Kirim Jawaban Post-Test'}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
