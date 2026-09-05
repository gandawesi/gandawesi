'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchCalonSiswaList,
  saveCatatanKesehatanPanitia,
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
} from 'lucide-react';

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

  // Decision Modal state
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
      setFeedback({ type: 'success', text: res.message || 'Keputusan berhasil dieksekusi!' });
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
  const countLolos = calonList.filter((c) => c.keputusan_tahap?.status === 'lolos').length;
  const countGugur = calonList.filter((c) => c.keputusan_tahap?.status === 'gugur').length;
  const countDokter = calonList.filter((c) => c.tes_kesehatan_awal?.file_surat_dokter).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-forest-700 dark:text-forest-400 uppercase tracking-wider mb-1">
            <ClipboardList className="w-4 h-4" />
            <span>Kaderisasi Tahap 1</span>
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 dark:text-white">
            Kelola & Seleksi Calon Siswa
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Verifikasi berkas orang tua, input evaluasi medis panitia, dan putuskan kelulusan ke tahap Siswa
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
      <StatGrid columns={4}>
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
          icon={CheckCircle2}
          label="Lolos ke Siswa"
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

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs self-stretch sm:self-auto justify-center">
            {(['all', 'dalam_proses', 'lolos', 'gugur'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-medium capitalize transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white dark:bg-forest-900 text-stone-900 dark:text-white shadow-xs'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                {st === 'all' ? 'Semua' : st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </Card>

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
                  <th className="py-3 px-4">Tes Kesehatan Awal</th>
                  <th className="py-3 px-4">Status Tahap</th>
                  <th className="py-3 px-4 text-right">Aksi Keputusan</th>
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

                    {/* Status Tahap */}
                    <td className="py-3.5 px-4">
                      {calon.keputusan_tahap?.status === 'lolos' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Lolos ke Siswa
                        </span>
                      ) : calon.keputusan_tahap?.status === 'gugur' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                          <XCircle className="w-3.5 h-3.5" /> Gugur
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                          <Clock className="w-3.5 h-3.5" /> Sedang Ditinjau
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDecisionModalTarget(calon);
                          setDecisionType('lolos');
                          setDecisionNote(calon.keputusan_tahap?.catatan || '');
                        }}
                        className="text-xs"
                      >
                        <Award className="w-3.5 h-3.5 mr-1 text-forest-600" />
                        Putuskan
                      </Button>
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

      {/* Modal 2: Keputusan Kelulusan Tahap (Ketua Medan Operasi / DANLAT) */}
      <Modal
        isOpen={!!decisionModalTarget}
        onClose={() => setDecisionModalTarget(null)}
        title={
          <span className="flex items-center gap-2">
            <Award className="w-4 h-4 text-forest-600" />
            Keputusan Seleksi: {decisionModalTarget?.nama}
          </span>
        }
        description="Penetapan status kelulusan peserta seleksi calon siswa."
        maxWidth="md"
      >
        {decisionModalTarget && (
          <form onSubmit={handleExecuteDecision} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 block mb-2">
                Tentukan Hasil Kelulusan
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
                  <span className="font-bold">Lolos ke Siswa</span>
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
                Catatan Evaluasi / Alasan Keputusan
              </label>
              <textarea
                rows={3}
                required
                value={decisionNote}
                onChange={(e) => setDecisionNote(e.target.value)}
                placeholder="Contoh: Berkas lengkap, tes kebugaran memenuhi ambang batas, dinyatakan siap mengikuti kurikulum tahap Siswa..."
                className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0f1814] px-3.5 py-2.5 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/40"
              />
            </div>

            {decisionType === 'lolos' && (
              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200 text-[11px]">
                * Status anggota akan otomatis diperbarui menjadi <strong>&quot;Siswa&quot;</strong> via trigger database `trg_sync_status_kaderisasi`.
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
                  ? 'Konfirmasi Lolos ke Siswa'
                  : 'Konfirmasi Gugur'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
