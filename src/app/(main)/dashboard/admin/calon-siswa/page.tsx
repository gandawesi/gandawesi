'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchCalonSiswaList,
  saveCatatanKesehatanPanitia,
  saveHasilWawancara,
  decideCalonSiswaStatus,
  fetchAllPeriodeList,
} from '@/lib/actions/admin-calon-siswa';
import type { CalonSiswaItem, PeriodePendaftaranItem } from '@/lib/types/registration';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { StatCard, StatGrid } from '@/components/ui/StatCard';
import { Modal } from '@/components/ui/Modal';
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  HeartPulse,
  FileCheck,
  Search,
  Filter,
  UserCheck,
  AlertTriangle,
  Award,
  X,
  MessageSquare,
  ShieldCheck,
  Star,
  RotateCcw,
  Archive,
  Info,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { exportToCSV } from '@/lib/utils/export-csv';

export default function AdminCalonSiswaPage() {
  const [calonList, setCalonList] = useState<CalonSiswaItem[]>([]);
  const [periodeList, setPeriodeList] = useState<PeriodePendaftaranItem[]>([]);
  const [selectedPeriode, setSelectedPeriode] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'dalam_proses' | 'lolos' | 'gugur'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Health Note Modal state
  const [healthModalTarget, setHealthModalTarget] = useState<CalonSiswaItem | null>(null);
  const [healthNoteText, setHealthNoteText] = useState('');

  // Interview Result Modal state
  const [interviewModalTarget, setInterviewModalTarget] = useState<CalonSiswaItem | null>(null);
  const [interviewForm, setInterviewForm] = useState({
    nilai_wawancara: 85,
    rekomendasi: 'sangat_direkomendasikan' as 'sangat_direkomendasikan' | 'direkomendasikan' | 'dipertimbangkan' | 'tidak_direkomendasikan',
    catatan_pewawancara: '',
    pewawancara_nama: 'Rian Hidayat (Danlat)',
  });

  // Decision Modal state (Wewenang Danlat)
  const [decisionModalTarget, setDecisionModalTarget] = useState<CalonSiswaItem | null>(null);
  const [decisionType, setDecisionType] = useState<'lolos' | 'gugur'>('lolos');
  const [decisionNote, setDecisionNote] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    const [listRes, perRes] = await Promise.all([
      fetchCalonSiswaList(selectedPeriode),
      fetchAllPeriodeList(),
    ]);
    setCalonList(listRes.calonSiswaList);
    setPeriodeList(perRes);
    setLoading(false);
  }, [selectedPeriode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveHealthNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!healthModalTarget) return;

    setProcessingId(healthModalTarget.id);
    const res = await saveCatatanKesehatanPanitia(healthModalTarget.id, healthNoteText);
    setProcessingId(null);
    setHealthModalTarget(null);

    if (res.success) {
      setFeedback({ type: 'success', text: res.message || 'Catatan kesehatan disimpan!' });
      loadData();
    } else {
      setFeedback({ type: 'error', text: res.error || 'Gagal menyimpan catatan medis.' });
    }
  };

  const handleSaveInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interviewModalTarget) return;

    setProcessingId(interviewModalTarget.id);
    const res = await saveHasilWawancara(interviewModalTarget.id, interviewForm);
    setProcessingId(null);
    setInterviewModalTarget(null);

    if (res.success) {
      setFeedback({ type: 'success', text: res.message || 'Hasil wawancara berhasil dicatat!' });
      loadData();
    } else {
      setFeedback({ type: 'error', text: res.error || 'Gagal menyimpan hasil wawancara.' });
    }
  };

  const handleExecuteDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionModalTarget) return;

    setProcessingId(decisionModalTarget.id);
    const res = await decideCalonSiswaStatus(
      decisionModalTarget.id,
      decisionType,
      decisionNote
    );
    setProcessingId(null);
    setDecisionModalTarget(null);
    setDecisionNote('');

    if (res.success) {
      setFeedback({ type: 'success', text: res.message || 'Keputusan ACC berhasil dieksekusi!' });
      loadData();
    } else {
      setFeedback({ type: 'error', text: res.error || 'Gagal mengeksekusi keputusan.' });
    }
  };

  const filteredList = calonList.filter((item) => {
    if (statusFilter !== 'all') {
      const curStatus = item.keputusan_tahap?.status || 'dalam_proses';
      if (curStatus !== statusFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.nama.toLowerCase().includes(q) ||
        (item.nim && item.nim.toLowerCase().includes(q)) ||
        (item.jurusan && item.jurusan.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const countTotal = calonList.length;
  const countDokter = calonList.filter((c) => c.tes_kesehatan_awal?.file_surat_dokter).length;
  const countWawancara = calonList.filter((c) => c.hasil_wawancara?.nilai_wawancara != null).length;
  const countLolos = calonList.filter((c) => c.keputusan_tahap?.status === 'lolos').length;
  const countGugur = calonList.filter((c) => c.keputusan_tahap?.status === 'gugur').length;

  const handleExportCSV = () => {
    const headers = [
      'No',
      'Nama Lengkap',
      'NIM',
      'Jurusan',
      'No HP',
      'Email',
      'Surat Ortu',
      'Surat Dokter',
      'Catatan Medis Panitia',
      'Skor Wawancara',
      'Rekomendasi Wawancara',
      'Pewawancara',
      'Catatan Wawancara',
      'Status Kelulusan',
      'Catatan Danlat',
    ];

    const rows = filteredList.map((c, idx) => [
      idx + 1,
      c.nama,
      c.nim || '-',
      c.jurusan || '-',
      c.no_hp || '-',
      c.email || '-',
      c.file_persetujuan_ortu ? 'Terlampir' : 'Belum Ada',
      c.tes_kesehatan_awal?.file_surat_dokter ? 'Ada' : 'Belum Ada',
      c.tes_kesehatan_awal?.catatan_panitia || '-',
      c.hasil_wawancara?.nilai_wawancara ?? '-',
      c.hasil_wawancara?.rekomendasi ? c.hasil_wawancara.rekomendasi.replace(/_/g, ' ') : '-',
      c.hasil_wawancara?.pewawancara_nama || '-',
      c.hasil_wawancara?.catatan_pewawancara || '-',
      c.keputusan_tahap?.status === 'lolos'
        ? 'Lolos ke Siswa'
        : c.keputusan_tahap?.status === 'gugur'
        ? 'Gugur Seleksi (Dapat Daftar Ulang)'
        : 'Dalam Proses / Ditinjau',
      c.keputusan_tahap?.catatan || '-',
    ]);

    const dateStr = new Date().toISOString().split('T')[0];
    exportToCSV(`rekap-calon-siswa-gandawesi-${dateStr}`, headers, rows);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-forest-700 dark:text-forest-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-forest-600" />
            <span>Kaderisasi Tahap 1 · Wewenang ACC: Komandan Latihan (Danlat)</span>
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 dark:text-white">
            Kelola & Seleksi Calon Siswa
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Verifikasi berkas orang tua, catatan medis, hasil wawancara, dan keputusan ACC kelulusan ke tahap Siswa oleh <strong>Komandan Latihan (Danlat)</strong> — bukan Dewan Pengurus.
          </p>
        </div>

        {/* Periode filter dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-stone-500 font-medium">Periode:</label>
          <select
            value={selectedPeriode}
            onChange={(e) => setSelectedPeriode(e.target.value)}
            className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0f1814] px-3 py-2 text-xs text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-forest-500/40"
          >
            <option value="all">Semua Periode</option>
            {periodeList.map((p) => (
              <option key={p.id} value={p.id}>
                Angkatan {p.nomor_angkatan || '-'} ({p.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {feedback && (
        <Alert
          type={feedback.type}
          message={feedback.text}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Metric Cards */}
      <StatGrid columns={5}>
        <StatCard
          icon={UserCheck}
          label="Total Pendaftar"
          value={countTotal}
          color="forest"
        />
        <StatCard
          icon={HeartPulse}
          label="Surat Dokter Ada"
          value={countDokter}
          color="rose"
        />
        <StatCard
          icon={MessageSquare}
          label="Wawancara Selesai"
          value={countWawancara}
          color="blue"
        />
        <StatCard
          icon={CheckCircle2}
          label="Lolos (ACC Danlat)"
          value={countLolos}
          color="emerald"
        />
        <StatCard
          icon={XCircle}
          label="Gugur Seleksi"
          value={countGugur}
          color="stone"
        />
      </StatGrid>

      {/* Filter & Search Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Cari nama calon, NIM, atau program studi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0f1814] pl-9 pr-3.5 py-2 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-500/40"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between sm:justify-end w-full sm:w-auto">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs flex-1 sm:flex-none justify-center">
              {[
                { id: 'all', label: `Semua (${countTotal})` },
                { id: 'dalam_proses', label: `Ditinjau (${countTotal - countLolos - countGugur})` },
                { id: 'lolos', label: `Lolos Siswa (${countLolos})` },
                { id: 'gugur', label: `Arsip Gugur (${countGugur})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    statusFilter === tab.id
                      ? tab.id === 'gugur'
                        ? 'bg-rose-600 text-white shadow-xs font-bold'
                        : 'bg-white dark:bg-forest-900 text-stone-900 dark:text-white shadow-xs font-bold'
                      : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="text-xs font-bold gap-1.5 shrink-0 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:text-forest-600 cursor-pointer"
              title="Unduh seluruh rekap calon siswa ke Excel / CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Ekspor Excel</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* AD/ART Information Banner for Rejected / Gugur Applicants */}
      {statusFilter === 'gugur' && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 flex items-start gap-3 text-xs">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-amber-950 dark:text-amber-100">
                Arsip Calon Siswa yang Gugur Seleksi
              </h4>
              <span className="text-[10px] px-2 py-0.5 bg-amber-200/60 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 rounded-full font-semibold">
                AD/ART Gandawesi
              </span>
            </div>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
              Berdasarkan ketentuan AD/ART Gandawesi mengenai Kaderisasi & Keanggotaan, calon siswa yang dinyatakan gugur atau belum memenuhi syarat kelulusan seleksi ini <strong>berhak mendaftar kembali pada periode/angkatan berikutnya</strong>. Catatan evaluasi di bawah disimpan sebagai riwayat pembinaan dan referensi peninjauan berkas di masa mendatang. Danlat dapat meninjau atau merevisi status jika diperlukan.
            </p>
          </div>
        </div>
      )}

      {/* Applicants Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
          <Spinner size="lg" />
          <p className="text-xs text-stone-500">Memuat data calon siswa...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center gap-3">
          <UserCheck className="w-10 h-10 text-stone-400" />
          <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200">
            Tidak Ada Calon Siswa
          </h3>
          <p className="text-xs text-stone-500 max-w-sm">
            Tidak ditemukan calon siswa yang sesuai dengan filter periode atau status saat ini.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-stone-900/60 text-stone-500 font-semibold border-b border-stone-100 dark:border-stone-800 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Calon Siswa</th>
                  <th className="py-3 px-4">NIM / Jurusan</th>
                  <th className="py-3 px-4">Surat Ortu</th>
                  <th className="py-3 px-4">Tes Kesehatan</th>
                  <th className="py-3 px-4">Hasil Wawancara</th>
                  <th className="py-3 px-4">Status Tahap</th>
                  <th className="py-3 px-4 text-right">Aksi ACC Danlat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {filteredList.map((calon) => (
                  <tr key={calon.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/30">
                    {/* Calon Name & Contact */}
                    <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-white">
                      <p>{calon.nama}</p>
                      <span className="text-[11px] text-stone-400 font-normal">
                        {calon.no_hp || calon.email || '-'}
                      </span>
                    </td>

                    {/* NIM & Jurusan */}
                    <td className="py-3.5 px-4 text-stone-600 dark:text-stone-300">
                      <p className="font-medium">{calon.nim || '-'}</p>
                      <span className="text-[11px] text-stone-400">{calon.jurusan || '-'}</span>
                    </td>

                    {/* Surat Persetujuan Ortu */}
                    <td className="py-3.5 px-4">
                      {calon.file_persetujuan_ortu ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                          <FileCheck className="w-3.5 h-3.5" /> Terlampir
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-stone-400 text-[11px]">
                          Belum Ada
                        </span>
                      )}
                    </td>

                    {/* Tes Kesehatan */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        {calon.tes_kesehatan_awal?.file_surat_dokter ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 text-[11px] font-semibold">
                            <HeartPulse className="w-3.5 h-3.5" /> Surat Dokter Ada
                          </span>
                        ) : (
                          <span className="text-amber-600 text-[11px] font-semibold">
                            Belum Ada Surat
                          </span>
                        )}

                        {calon.tes_kesehatan_awal?.catatan_panitia ? (
                          <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-1 italic">
                            &quot;{calon.tes_kesehatan_awal.catatan_panitia}&quot;
                          </p>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => {
                            setHealthModalTarget(calon);
                            setHealthNoteText(calon.tes_kesehatan_awal?.catatan_panitia || '');
                          }}
                          className="text-[10px] text-forest-600 hover:text-forest-700 underline font-medium block cursor-pointer"
                        >
                          {calon.tes_kesehatan_awal?.catatan_panitia ? 'Edit Catatan Medis' : '+ Catatan Medis'}
                        </button>
                      </div>
                    </td>

                    {/* Hasil Wawancara */}
                    <td className="py-3.5 px-4 min-w-[200px]">
                      {calon.hasil_wawancara ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                (calon.hasil_wawancara.nilai_wawancara ?? 0) >= 80
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                  : (calon.hasil_wawancara.nilai_wawancara ?? 0) >= 70
                                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                  : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                              }`}
                            >
                              <Star className="w-3 h-3" />
                              Skor: {calon.hasil_wawancara.nilai_wawancara ?? '-'}/100
                            </span>
                            <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">
                              {calon.hasil_wawancara.rekomendasi === 'sangat_direkomendasikan'
                                ? 'Sangat Direkomendasikan'
                                : calon.hasil_wawancara.rekomendasi === 'direkomendasikan'
                                ? 'Direkomendasikan'
                                : calon.hasil_wawancara.rekomendasi === 'dipertimbangkan'
                                ? 'Dipertimbangkan'
                                : 'Tidak Direkomendasikan'}
                            </span>
                          </div>

                          {calon.hasil_wawancara.catatan_pewawancara && (
                            <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-1 italic">
                              &quot;{calon.hasil_wawancara.catatan_pewawancara}&quot;
                            </p>
                          )}

                          <div className="flex items-center justify-between text-[10px] text-stone-400 pt-0.5">
                            <span>Oleh: {calon.hasil_wawancara.pewawancara_nama || 'Danlat'}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setInterviewModalTarget(calon);
                                setInterviewForm({
                                  nilai_wawancara: calon.hasil_wawancara?.nilai_wawancara ?? 85,
                                  rekomendasi: calon.hasil_wawancara?.rekomendasi ?? 'sangat_direkomendasikan',
                                  catatan_pewawancara: calon.hasil_wawancara?.catatan_pewawancara ?? '',
                                  pewawancara_nama: calon.hasil_wawancara?.pewawancara_nama ?? 'Rian Hidayat (Danlat)',
                                });
                              }}
                              className="text-forest-600 hover:text-forest-700 underline font-medium cursor-pointer"
                            >
                              Edit Wawancara
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="text-amber-600 text-[11px] font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Belum Wawancara
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setInterviewModalTarget(calon);
                              setInterviewForm({
                                nilai_wawancara: 85,
                                rekomendasi: 'sangat_direkomendasikan',
                                catatan_pewawancara: '',
                                pewawancara_nama: 'Rian Hidayat (Danlat)',
                              });
                            }}
                            className="text-[10px] text-forest-600 hover:text-forest-700 underline font-medium block cursor-pointer"
                          >
                            + Input Wawancara
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Status Tahap */}
                    <td className="py-3.5 px-4">
                      {calon.keputusan_tahap?.status === 'lolos' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Lolos ke Siswa
                        </span>
                      ) : calon.keputusan_tahap?.status === 'gugur' ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                            <XCircle className="w-3.5 h-3.5" /> Gugur Seleksi
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] text-stone-600 dark:text-stone-300 font-medium bg-stone-100 dark:bg-stone-800/80 px-2 py-0.5 rounded-md">
                            <RotateCcw className="w-2.5 h-2.5 text-forest-600" />
                            Dapat Daftar Ulang Periode Depan
                          </span>
                          {calon.keputusan_tahap?.catatan && (
                            <p className="text-[10px] text-stone-500 italic line-clamp-1">
                              Alasan: &quot;{calon.keputusan_tahap.catatan}&quot;
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                          <Clock className="w-3.5 h-3.5" /> Sedang Ditinjau
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {calon.keputusan_tahap?.status === 'gugur' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setDecisionModalTarget(calon);
                            setDecisionType('gugur');
                            setDecisionNote(calon.keputusan_tahap?.catatan || '');
                          }}
                          className="text-xs font-semibold text-stone-600 hover:text-stone-900 dark:text-stone-300"
                        >
                          <Archive className="w-3.5 h-3.5 mr-1 text-rose-500" />
                          Tinjau / Re-evaluasi
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setDecisionModalTarget(calon);
                            setDecisionType(calon.keputusan_tahap?.status === 'gugur' ? 'gugur' : 'lolos');
                            setDecisionNote(calon.keputusan_tahap?.catatan || '');
                          }}
                          className="text-xs font-semibold"
                        >
                          <Award className="w-3.5 h-3.5 mr-1 text-forest-600" />
                          {calon.keputusan_tahap?.status === 'lolos' ? 'Ubah ACC Danlat' : 'ACC Danlat'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal 1: Catatan Medis Panitia */}
      <Modal
        isOpen={!!healthModalTarget}
        onClose={() => setHealthModalTarget(null)}
        title={
          <span className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-rose-500" />
            Catatan Medis: {healthModalTarget?.nama}
          </span>
        }
        description="Pencatatan evaluasi fisik dan rekomendasi medis tim kepanitiaan."
        maxWidth="md"
      >
        {healthModalTarget && (
          <form onSubmit={handleSaveHealthNote} className="space-y-3.5 text-xs">
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800">
              <span className="text-stone-400 block mb-0.5">Surat Keterangan Dokter:</span>
              <p className="font-semibold text-stone-800 dark:text-stone-200">
                {healthModalTarget.tes_kesehatan_awal?.file_surat_dokter
                  ? 'Sudah diunggah oleh calon siswa'
                  : 'Belum diunggah'}
              </p>
            </div>

            <div>
              <label className="font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 block mb-1">
                Catatan Evaluasi Fisik & Tim Medis Panitia
              </label>
              <textarea
                rows={4}
                required
                value={healthNoteText}
                onChange={(e) => setHealthNoteText(e.target.value)}
                placeholder="Contoh: Tekanan darah 120/80, riwayat cedera pergelangan kaki 2 tahun lalu, aman untuk bina jasmani sedang..."
                className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0f1814] px-3.5 py-2.5 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/40"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-100 dark:border-stone-800">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setHealthModalTarget(null)}
              >
                Batal
              </Button>
              <Button type="submit" size="sm" disabled={processingId === healthModalTarget.id}>
                {processingId === healthModalTarget.id ? 'Menyimpan...' : 'Simpan Catatan Medis'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal 2: Input / Edit Hasil Wawancara */}
      <Modal
        isOpen={!!interviewModalTarget}
        onClose={() => setInterviewModalTarget(null)}
        title={
          <span className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            Evaluasi Wawancara: {interviewModalTarget?.nama}
          </span>
        }
        description="Penilaian motivasi, pemahaman nilai pecinta alam, ketahanan mental, dan komitmen waktu latihan."
        maxWidth="md"
      >
        {interviewModalTarget && (
          <form onSubmit={handleSaveInterview} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 block mb-1">
                  Nilai / Skor Wawancara (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={interviewForm.nilai_wawancara}
                  onChange={(e) =>
                    setInterviewForm((prev) => ({
                      ...prev,
                      nilai_wawancara: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0f1814] px-3.5 py-2 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/40"
                />
              </div>

              <div>
                <label className="font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 block mb-1">
                  Rekomendasi Seleksi
                </label>
                <select
                  value={interviewForm.rekomendasi}
                  onChange={(e) =>
                    setInterviewForm((prev) => ({
                      ...prev,
                      rekomendasi: e.target.value as any,
                    }))
                  }
                  className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0f1814] px-3 py-2 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/40"
                >
                  <option value="sangat_direkomendasikan">Sangat Direkomendasikan</option>
                  <option value="direkomendasikan">Direkomendasikan</option>
                  <option value="dipertimbangkan">Dipertimbangkan</option>
                  <option value="tidak_direkomendasikan">Tidak Direkomendasikan</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 block mb-1">
                Pewawancara (Instruktur / Danlat)
              </label>
              <input
                type="text"
                required
                value={interviewForm.pewawancara_nama}
                onChange={(e) =>
                  setInterviewForm((prev) => ({
                    ...prev,
                    pewawancara_nama: e.target.value,
                  }))
                }
                placeholder="Nama instruktur / Danlat yang mewawancarai..."
                className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0f1814] px-3.5 py-2 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/40"
              />
            </div>

            <div>
              <label className="font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 block mb-1">
                Catatan Evaluasi Motivasi, Ketahanan Mental & Komitmen
              </label>
              <textarea
                rows={4}
                required
                value={interviewForm.catatan_pewawancara}
                onChange={(e) =>
                  setInterviewForm((prev) => ({
                    ...prev,
                    catatan_pewawancara: e.target.value,
                  }))
                }
                placeholder="Contoh: Motivasi tinggi, pemahaman nilai cinta alam baik, siap mengikuti komitmen bina jasmani 2x seminggu tanpa hambatan jadwal..."
                className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0f1814] px-3.5 py-2.5 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/40"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-100 dark:border-stone-800">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setInterviewModalTarget(null)}
              >
                Batal
              </Button>
              <Button type="submit" size="sm" disabled={processingId === interviewModalTarget.id}>
                {processingId === interviewModalTarget.id ? 'Menyimpan...' : 'Simpan Hasil Wawancara'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal 3: Keputusan Kelulusan Tahap (Wewenang Komandan Latihan / DANLAT) */}
      <Modal
        isOpen={!!decisionModalTarget}
        onClose={() => setDecisionModalTarget(null)}
        title={
          <span className="flex items-center gap-2">
            <Award className="w-4 h-4 text-forest-600" />
            Wewenang ACC Danlat: {decisionModalTarget?.nama}
          </span>
        }
        description="Penetapan keputusan kelulusan Calon Siswa menuju tahap Siswa oleh Komandan Latihan (Danlat) — bukan Dewan Pengurus (DP)."
        maxWidth="md"
      >
        {decisionModalTarget && (
          <form onSubmit={handleExecuteDecision} className="space-y-4 text-xs">
            {/* Briefing summary for Danlat */}
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 space-y-2">
              <span className="font-bold text-stone-700 dark:text-stone-300 block uppercase text-[10px] tracking-wider">
                Rekap Seleksi Calon Siswa:
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-stone-400 block">Surat Persetujuan Ortu:</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    {decisionModalTarget.file_persetujuan_ortu ? (
                      <a
                        href={decisionModalTarget.file_persetujuan_ortu}
                        target="_blank"
                        rel="noreferrer"
                        className="text-forest-600 dark:text-forest-400 hover:underline inline-flex items-center gap-1"
                      >
                        ✓ Terlampir (Lihat Berkas)
                      </a>
                    ) : (
                      '✗ Belum Ada'
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block">Surat Dokter:</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    {decisionModalTarget.tes_kesehatan_awal?.file_surat_dokter ? (
                      <a
                        href={decisionModalTarget.tes_kesehatan_awal.file_surat_dokter}
                        target="_blank"
                        rel="noreferrer"
                        className="text-forest-600 dark:text-forest-400 hover:underline inline-flex items-center gap-1"
                      >
                        ✓ Ada (Lihat Berkas)
                      </a>
                    ) : (
                      '✗ Belum Ada'
                    )}
                  </span>
                </div>
              </div>

              {decisionModalTarget.hasil_wawancara && (
                <div className="pt-2 border-t border-stone-200 dark:border-stone-800 text-[11px]">
                  <span className="text-stone-400 block">Hasil Wawancara Danlat/Panitia:</span>
                  <p className="font-semibold text-stone-800 dark:text-stone-200">
                    Skor: {decisionModalTarget.hasil_wawancara.nilai_wawancara}/100 ({decisionModalTarget.hasil_wawancara.rekomendasi.replace('_', ' ')})
                  </p>
                  {decisionModalTarget.hasil_wawancara.catatan_pewawancara && (
                    <p className="text-stone-500 italic mt-0.5">
                      &quot;{decisionModalTarget.hasil_wawancara.catatan_pewawancara}&quot;
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 block mb-2">
                Tentukan Hasil Kelulusan (Wewenang Danlat)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDecisionType('lolos')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    decisionType === 'lolos'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                      : 'border-stone-200 dark:border-stone-800 text-stone-500 hover:bg-stone-50'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold">ACC Lolos ke Siswa</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDecisionType('gugur')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    decisionType === 'gugur'
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 ring-2 ring-rose-500/20'
                      : 'border-stone-200 dark:border-stone-800 text-stone-500 hover:bg-stone-50'
                  }`}
                >
                  <XCircle className="w-5 h-5 text-rose-600" />
                  <span className="font-bold">Gugur</span>
                </button>
              </div>
            </div>

            <div>
              <label className="font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 block mb-1">
                Catatan Evaluasi / Alasan Keputusan Danlat
              </label>
              <textarea
                rows={3}
                required
                value={decisionNote}
                onChange={(e) => setDecisionNote(e.target.value)}
                placeholder="Contoh: Berkas lengkap, tes kebugaran memenuhi ambang batas, hasil wawancara meyakinkan, di-ACC oleh Danlat untuk kurikulum Siswa..."
                className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0f1814] px-3.5 py-2.5 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/40"
              />
            </div>

            {decisionType === 'gugur' ? (
              <div className="p-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-900/40 text-rose-900 dark:text-rose-200 text-[11px] space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5" /> Ketentuan AD/ART Gandawesi:
                </p>
                <p>
                  Calon siswa yang dinyatakan gugur tetap <strong>berhak mendaftar kembali pada periode seleksi berikutnya</strong>. Catatan evaluasi di atas akan tersimpan di arsip seleksi untuk referensi pembinaan.
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-[11px]">
                * Keputusan ACC kelulusan tahap Calon Siswa menuju Siswa adalah mandat prerogatif <strong>Komandan Latihan (Danlat)</strong>, bukan Dewan Pengurus (DP).
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-100 dark:border-stone-800">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setDecisionModalTarget(null)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={processingId === decisionModalTarget.id}
                className={decisionType === 'gugur' ? 'bg-rose-600 hover:bg-rose-700 text-white' : ''}
              >
                {processingId === decisionModalTarget.id
                  ? 'Memproses...'
                  : decisionType === 'lolos'
                  ? 'Konfirmasi ACC ke Siswa (Danlat)'
                  : 'Konfirmasi Gugur'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
