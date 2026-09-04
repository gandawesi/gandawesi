'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Settings,
  Calendar,
  Search,
  X,
  FileText,
  DollarSign,
  Download,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import {
  fetchAdminKeuanganSummary,
  generateTagihanBulanan,
  updateStatusBayarIuran,
  createTransaksiKas,
  deleteTransaksiKas,
  saveTarifIuran,
  saveEventAnggaran,
  saveLPJ,
  deleteLPJ,
} from '@/lib/actions/keuangan';
import type {
  AdminKeuanganSummary,
  TransaksiKasItem,
  IuranItem,
  TarifIuranItem,
  EventAnggaranItem,
  LPJItem,
} from '@/lib/types/keuangan';

export default function AdminKeuanganPage() {
  const [summary, setSummary] = useState<AdminKeuanganSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'buku_kas' | 'iuran' | 'tarif' | 'rab_lpj'>('buku_kas');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters
  const [iuranFilter, setIuranFilter] = useState<'all' | 'menunggak' | 'lunas'>('all');
  const [iuranSearch, setIuranSearch] = useState('');

  // Pagination
  const [kasPage, setKasPage] = useState(1);
  const KAS_PAGE_SIZE = 8;
  const [iuranPage, setIuranPage] = useState(1);
  const IURAN_PAGE_SIZE = 8;

  // Modals State
  const [showKasModal, setShowKasModal] = useState(false);
  const [kasForm, setKasForm] = useState({
    tipe: 'masuk' as 'masuk' | 'keluar',
    kategori: 'iuran',
    nominal: 50000,
    keterangan: '',
    tanggal: new Date().toISOString().split('T')[0],
    bukti: '',
  });
  const [submittingKas, setSubmittingKas] = useState(false);

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generatePeriode, setGeneratePeriode] = useState(new Date().toISOString().substring(0, 7));
  const [generating, setGenerating] = useState(false);

  const [showTarifModal, setShowTarifModal] = useState(false);
  const [tarifForm, setTarifForm] = useState({
    status_keanggotaan: 'anggota_biasa',
    nominal: 25000,
    berlaku_sejak: new Date().toISOString().split('T')[0],
  });
  const [savingTarif, setSavingTarif] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const res = await fetchAdminKeuanganSummary();
    setSummary(res);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Create Cash Transaction
  const handleSaveKas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kasForm.keterangan || kasForm.nominal <= 0) return;

    setSubmittingKas(true);
    const res = await createTransaksiKas({
      tipe: kasForm.tipe,
      kategori: kasForm.kategori,
      nominal: kasForm.nominal,
      keterangan: kasForm.keterangan,
      tanggal: kasForm.tanggal,
      bukti: kasForm.bukti || null,
    });
    setSubmittingKas(false);

    if (res.success) {
      setFeedback({ type: 'success', text: res.message || 'Transaksi berhasil dicatat ke Buku Kas!' });
      setShowKasModal(false);
      setKasForm({
        tipe: 'masuk',
        kategori: 'iuran',
        nominal: 50000,
        keterangan: '',
        tanggal: new Date().toISOString().split('T')[0],
        bukti: '',
      });
      loadData();
    } else {
      setFeedback({ type: 'error', text: res.error || 'Gagal mencatat transaksi kas.' });
    }
  };

  // Handle Delete Cash Transaction
  const handleDeleteKas = async (id: string) => {
    if (!confirm('Hapus transaksi kas ini?')) return;
    const res = await deleteTransaksiKas(id);
    if (res.success) {
      setFeedback({ type: 'success', text: 'Transaksi berhasil dihapus.' });
      loadData();
    }
  };

  // Handle Generate Monthly Bills via RPC
  const handleGenerateBills = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    const res = await generateTagihanBulanan(generatePeriode);
    setGenerating(false);

    if (res.success) {
      setFeedback({ type: 'success', text: res.message || `Tagihan periode ${generatePeriode} berhasil digenerate!` });
      setShowGenerateModal(false);
      loadData();
    } else {
      setFeedback({ type: 'error', text: 'Gagal generate tagihan bulanan.' });
    }
  };

  // Handle Mark Bill as Paid
  const handleToggleIuranStatus = async (iuran: IuranItem) => {
    const nextStatus = iuran.status_bayar === 'lunas' ? 'menunggak' : 'lunas';
    const confirmMsg =
      nextStatus === 'lunas'
        ? `Tandai iuran ${iuran.anggota_nama} periode ${iuran.periode} sebagai LUNAS? (Transaksi kas otomatis dibuat)`
        : `Ubah kembali iuran ${iuran.anggota_nama} periode ${iuran.periode} menjadi MENUNGGAK?`;

    if (!confirm(confirmMsg)) return;

    const res = await updateStatusBayarIuran(iuran.id, nextStatus, true);
    if (res.success) {
      setFeedback({ type: 'success', text: res.message || 'Status iuran berhasil diperbarui.' });
      loadData();
    }
  };

  // Handle Save Tarif
  const handleSaveTarif = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTarif(true);
    const res = await saveTarifIuran(tarifForm);
    setSavingTarif(false);

    if (res.success) {
      setFeedback({ type: 'success', text: res.message || 'Tarif iuran baru berhasil disimpan!' });
      setShowTarifModal(false);
      loadData();
    } else {
      setFeedback({ type: 'error', text: res.error || 'Gagal menyimpan tarif.' });
    }
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (loading || !summary) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-stone-400">
        <Spinner className="w-8 h-8 text-emerald-500 mb-3" />
        <p className="text-sm font-medium">Memuat pembukuan kas & data keuangan organisasi...</p>
      </div>
    );
  }

  const filteredIuran = summary.iuran_list.filter((i) => {
    const matchStatus = iuranFilter === 'all' || i.status_bayar === iuranFilter;
    const matchSearch =
      i.anggota_nama.toLowerCase().includes(iuranSearch.toLowerCase()) ||
      i.periode.toLowerCase().includes(iuranSearch.toLowerCase()) ||
      (i.anggota_nia && i.anggota_nia.toLowerCase().includes(iuranSearch.toLowerCase()));
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-stone-900 via-forest-950 to-slate-900 border border-emerald-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                <Wallet className="w-3.5 h-3.5" /> Modul Keuangan & Pembukuan Kas
              </span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Bendahara Umum
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-mono">
              BUKU KAS UMUM, IURAN & RAB KEGIATAN
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Manajemen arus kas transaksi masuk/keluar, penerbitan tagihan iuran otomatis via RPC function PostgreSQL, konfigurasi tarif per status anggota, dan evaluasi rencana vs realisasi anggaran (RAB).
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="secondary"
              onClick={() => setShowGenerateModal(true)}
              className="text-xs flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-white cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Generate Tagihan (RPC)
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowKasModal(true)}
              className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Catat Transaksi Kas
            </Button>
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
              : 'bg-rose-950/80 text-rose-300 border border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-stone-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-semibold uppercase tracking-wider">Saldo Kas Organisasi</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {formatIDR(summary.saldo_kas_saat_ini)}
          </p>
          <span className="text-[11px] text-stone-400">Kas bersih umum & operasional</span>
        </Card>

        <Card className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-semibold uppercase tracking-wider">Pemasukan Bulan Ini</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-xl">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
            {formatIDR(summary.pemasukan_bulan_ini)}
          </p>
          <span className="text-[11px] text-stone-400">Iuran, sponsorship, dan hibah</span>
        </Card>

        <Card className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-semibold uppercase tracking-wider">Pengeluaran Bulan Ini</span>
            <div className="p-2 bg-rose-500/10 text-rose-600 rounded-xl">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
            {formatIDR(summary.pengeluaran_bulan_ini)}
          </p>
          <span className="text-[11px] text-stone-400">Operasional dan logistik diklat</span>
        </Card>

        <Card className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-semibold uppercase tracking-wider">Total Tunggakan Iuran</span>
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {formatIDR(summary.total_tunggakan_organisasi)}
          </p>
          <span className="text-[11px] text-stone-400">Catatan administratif anggota</span>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-stone-200 dark:border-stone-800 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('buku_kas')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'buku_kas'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-500/5'
              : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <Wallet className="w-4 h-4" />
          Buku Kas Umum ({summary.transaksi_list.length})
        </button>
        <button
          onClick={() => setActiveTab('iuran')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'iuran'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-500/5'
              : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-amber-500" />
          Manajemen Iuran ({summary.iuran_list.length})
        </button>
        <button
          onClick={() => setActiveTab('tarif')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'tarif'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/5'
              : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <Settings className="w-4 h-4 text-indigo-500" />
          Konfigurasi Tarif Iuran ({summary.tarif_list.length})
        </button>
        <button
          onClick={() => setActiveTab('rab_lpj')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'rab_lpj'
              ? 'border-forest-500 text-forest-600 dark:text-forest-400 bg-forest-50/50 dark:bg-forest-500/5'
              : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <FileText className="w-4 h-4 text-forest-500" />
          RAB Event & LPJ ({summary.anggaran_list.length + summary.lpj_list.length})
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: BUKU KAS UMUM                                         */}
      {/* ============================================================ */}
      {activeTab === 'buku_kas' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Catatan Arus Transaksi Kas Masuk & Keluar
              </h3>
              <p className="text-xs text-stone-500">
                Pencatatan mutasi kas riil organisasi dilengkapi kategori dan tautan bukti nota/struk.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-400 font-mono">
                Total Transaksi: {summary.transaksi_list.length}
              </span>
            </div>
          </div>

          <Card className="overflow-hidden border border-stone-200 dark:border-stone-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Tipe & Kategori</th>
                    <th className="py-3 px-4">Keterangan Transaksi</th>
                    <th className="py-3 px-4 text-right">Nominal</th>
                    <th className="py-3 px-4 text-center">Bukti Nota</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                  {summary.transaksi_list
                    .slice((kasPage - 1) * KAS_PAGE_SIZE, kasPage * KAS_PAGE_SIZE)
                    .map((t) => (
                    <tr key={t.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/30">
                      <td className="py-3 px-4 font-mono text-stone-500">{t.tanggal}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                            t.tipe === 'masuk'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {t.tipe === 'masuk' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          {t.tipe.toUpperCase()} • {t.kategori.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-stone-800 dark:text-stone-200 max-w-sm">
                        {t.keterangan}
                      </td>
                      <td className={`py-3 px-4 font-mono font-bold text-right ${
                        t.tipe === 'masuk' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {t.tipe === 'masuk' ? '+' : '-'}{formatIDR(t.nominal)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {t.bukti ? (
                          <a
                            href={t.bukti}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-bold text-indigo-500 hover:underline inline-flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" /> Struk
                          </a>
                        ) : (
                          <span className="text-[10px] text-stone-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteKas(t.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-500 transition-colors cursor-pointer"
                          title="Hapus Transaksi"
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

          {/* Pagination Buku Kas */}
          <Pagination
            currentPage={kasPage}
            totalPages={Math.ceil((summary.transaksi_list.length || 0) / KAS_PAGE_SIZE) || 1}
            onPageChange={setKasPage}
            totalItems={summary.transaksi_list.length}
            pageSize={KAS_PAGE_SIZE}
          />
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: MANAJEMEN IURAN ANGGOTA & TAGIHAN                     */}
      {/* ============================================================ */}
      {activeTab === 'iuran' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Rekapitulasi Tagihan Iuran Anggota Aktif
              </h3>
              <p className="text-xs text-stone-500">
                Verifikasi pembayaran iuran dan sinkronisasi otomatis ke buku kas masuk.
              </p>
            </div>

            {/* Filter Pills & Search */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => {
                    setIuranFilter('all');
                    setIuranPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    iuranFilter === 'all' ? 'bg-white dark:bg-stone-900 shadow-sm text-emerald-500' : 'text-stone-400'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => {
                    setIuranFilter('menunggak');
                    setIuranPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    iuranFilter === 'menunggak' ? 'bg-white dark:bg-stone-900 shadow-sm text-amber-500' : 'text-stone-400'
                  }`}
                >
                  Menunggak
                </button>
                <button
                  onClick={() => {
                    setIuranFilter('lunas');
                    setIuranPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    iuranFilter === 'lunas' ? 'bg-white dark:bg-stone-900 shadow-sm text-emerald-500' : 'text-stone-400'
                  }`}
                >
                  Lunas
                </button>
              </div>

              <div className="w-48 relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Cari anggota / periode..."
                  value={iuranSearch}
                  onChange={(e) => {
                    setIuranSearch(e.target.value);
                    setIuranPage(1);
                  }}
                  className="w-full pl-8 pr-2.5 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          <Card className="overflow-hidden border border-stone-200 dark:border-stone-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Nama Anggota & NIA</th>
                    <th className="py-3 px-4">Status & Angkatan</th>
                    <th className="py-3 px-4">Periode</th>
                    <th className="py-3 px-4">Nominal</th>
                    <th className="py-3 px-4 text-center">Status Bayar</th>
                    <th className="py-3 px-4 text-right">Aksi Bendahara</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                  {filteredIuran
                    .slice((iuranPage - 1) * IURAN_PAGE_SIZE, iuranPage * IURAN_PAGE_SIZE)
                    .map((i) => (
                    <tr key={i.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/30">
                      <td className="py-3 px-4">
                        <p className="font-bold text-stone-900 dark:text-stone-100">{i.anggota_nama}</p>
                        <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                          {i.anggota_nia || '-'}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold capitalize text-stone-700 dark:text-stone-300">
                          {i.status_keanggotaan.replace('_', ' ')}
                        </p>
                        <p className="text-[10px] text-stone-400">
                          Angkatan {i.nomor_angkatan || '-'}
                        </p>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-stone-800 dark:text-stone-200">
                        {i.periode}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-stone-900 dark:text-stone-100">
                        {formatIDR(i.nominal)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            i.status_bayar === 'lunas'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {i.status_bayar.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleToggleIuranStatus(i)}
                          className={`text-xs py-1 cursor-pointer ${
                            i.status_bayar === 'menunggak'
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                              : 'text-stone-500 hover:text-amber-600'
                          }`}
                        >
                          {i.status_bayar === 'menunggak' ? 'Tandai Lunas' : 'Batalkan Lunas'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination Iuran */}
          <Pagination
            currentPage={iuranPage}
            totalPages={Math.ceil(filteredIuran.length / IURAN_PAGE_SIZE) || 1}
            onPageChange={setIuranPage}
            totalItems={filteredIuran.length}
            pageSize={IURAN_PAGE_SIZE}
          />
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: KONFIGURASI TARIF IURAN                               */}
      {/* ============================================================ */}
      {activeTab === 'tarif' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Konfigurasi Tarif Iuran Bulanan
              </h3>
              <p className="text-xs text-stone-500">
                Tarif berlaku efektif per tanggal mulai berlaku untuk generasi tagihan otomatis via RPC.
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowTarifModal(true)}
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 self-start cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Perbarui / Tambah Tarif
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {summary.tarif_list.map((t) => (
              <Card
                key={t.id}
                className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    {t.status_keanggotaan.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-mono text-stone-400">
                    Sejak {t.berlaku_sejak}
                  </span>
                </div>
                <h4 className="text-2xl font-black text-stone-900 dark:text-stone-100 font-mono">
                  {formatIDR(t.nominal)}
                  <span className="text-xs font-normal text-stone-400"> / bulan</span>
                </h4>
                <p className="text-xs text-stone-500">
                  {t.status_keanggotaan === 'anggota_muda'
                    ? 'Mulai wajib iuran sejak dilantik di Medan Operasi.'
                    : t.status_keanggotaan === 'anggota_biasa'
                    ? 'Tarif penuh anggota biasa ber-NIA aktif.'
                    : 'Tarif kontribusi alumni Anggota Luar Biasa.'}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: RAB EVENT & LPJ                                       */}
      {/* ============================================================ */}
      {activeTab === 'rab_lpj' && (
        <div className="space-y-8">
          {/* Section 1: RAB Event */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider font-mono">
              Rencana Anggaran Biaya (RAB) vs Realisasi
            </h3>
            <Card className="overflow-hidden border border-stone-200 dark:border-stone-800">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Nama Kegiatan & Tanggal</th>
                      <th className="py-3 px-4 text-right">Plafon RAB</th>
                      <th className="py-3 px-4 text-right">Realisasi Aktual</th>
                      <th className="py-3 px-4 text-right">Selisih (Surplus/Defisit)</th>
                      <th className="py-3 px-4 text-center">Status RAB</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                    {summary.anggaran_list.map((a) => (
                      <tr key={a.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/30">
                        <td className="py-3 px-4">
                          <p className="font-bold text-stone-900 dark:text-stone-100">{a.event_nama}</p>
                          <p className="text-[10px] text-stone-400 font-mono">{a.event_tanggal || 'Tanggal Direncanakan'}</p>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-stone-800 dark:text-stone-200">
                          {formatIDR(a.rab)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-stone-800 dark:text-stone-200">
                          {formatIDR(a.realisasi)}
                        </td>
                        <td className={`py-3 px-4 text-right font-mono font-bold ${
                          a.selisih >= 0 ? 'text-emerald-500' : 'text-rose-500'
                        }`}>
                          {a.selisih >= 0 ? `+${formatIDR(a.selisih)} (Surplus)` : `${formatIDR(a.selisih)} (Defisit)`}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 uppercase">
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Section 2: Arsip LPJ */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider font-mono">
              Arsip Laporan Pertanggungjawaban (LPJ) Resmi
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {summary.lpj_list.map((lpj) => (
                <Card
                  key={lpj.id}
                  className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold uppercase px-2 py-0.5 rounded bg-forest-500/10 text-forest-600 dark:text-forest-400">
                        LPJ {lpj.jenis}
                      </span>
                      <span className="font-mono text-stone-400">{lpj.tanggal}</span>
                    </div>
                    <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 line-clamp-2 pt-1">
                      {lpj.judul}
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      PJ: {lpj.penanggung_jawab_nama}
                    </p>
                  </div>
                  {lpj.file && (
                    <a
                      href={lpj.file}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline pt-2 border-t border-stone-100 dark:border-stone-800"
                    >
                      <Download className="w-3.5 h-3.5" /> Unduh Dokumen LPJ
                    </a>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: CATAT TRANSAKSI KAS                                 */}
      {/* ============================================================ */}
      {showKasModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-emerald-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2 text-emerald-400">
                <Wallet className="w-4 h-4" />
                Catat Transaksi Buku Kas
              </h3>
              <button onClick={() => setShowKasModal(false)} className="text-stone-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveKas} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tipe Arus Kas:</label>
                  <select
                    value={kasForm.tipe}
                    onChange={(e) => setKasForm((p) => ({ ...p, tipe: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-emerald-500"
                  >
                    <option value="masuk">Pemasukan (+)</option>
                    <option value="keluar">Pengeluaran (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kategori:</label>
                  <select
                    value={kasForm.kategori}
                    onChange={(e) => setKasForm((p) => ({ ...p, kategori: e.target.value }))}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-emerald-500"
                  >
                    {kasForm.tipe === 'masuk' ? (
                      <>
                        <option value="iuran">Iuran Anggota</option>
                        <option value="sponsorship">Sponsorship Brand</option>
                        <option value="donasi">Donasi Alumni / Luar</option>
                        <option value="subsidi_kampus">Subsidi Kemahasiswaan UPI</option>
                        <option value="usaha_mandiri">Usaha Mandiri / Merchandise</option>
                      </>
                    ) : (
                      <>
                        <option value="operasional">Operasional & Kesekretariatan</option>
                        <option value="diklat">Kegiatan Diklat & Kaderisasi</option>
                        <option value="logistik">Logistik & Pemeliharaan Alat</option>
                        <option value="konsumsi">Konsumsi Pertemuan / Rapat</option>
                        <option value="lainnya">Pengeluaran Lainnya</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nominal (Rp):</label>
                <input
                  type="number"
                  required
                  min="1000"
                  value={kasForm.nominal}
                  onChange={(e) => setKasForm((p) => ({ ...p, nominal: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Keterangan Transaksi:</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Pembelian tali karmantel & carabiner..."
                  value={kasForm.keterangan}
                  onChange={(e) => setKasForm((p) => ({ ...p, keterangan: e.target.value }))}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tanggal Transaksi:</label>
                <input
                  type="date"
                  required
                  value={kasForm.tanggal}
                  onChange={(e) => setKasForm((p) => ({ ...p, tanggal: e.target.value }))}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tautan Bukti Struk / Nota:</label>
                <input
                  type="url"
                  placeholder="https://storage.googleapis.com/..."
                  value={kasForm.bukti}
                  onChange={(e) => setKasForm((p) => ({ ...p, bukti: e.target.value }))}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
                <Button type="button" variant="secondary" onClick={() => setShowKasModal(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" disabled={submittingKas} className="bg-emerald-600 text-white">
                  {submittingKas ? <Spinner className="w-3.5 h-3.5 mr-1" /> : <Plus className="w-3.5 h-3.5 mr-1" />}
                  Bukukan Transaksi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: GENERATE TAGIHAN BULANAN VIA RPC                    */}
      {/* ============================================================ */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2 text-amber-400">
                <RefreshCw className="w-4 h-4" />
                Generate Tagihan Iuran Bulanan
              </h3>
              <button onClick={() => setShowGenerateModal(false)} className="text-stone-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGenerateBills} className="space-y-4 text-xs">
              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-300 leading-relaxed">
                Memanggil fungsi RPC PostgreSQL <code>generate_tagihan_iuran_bulanan()</code>. Tagihan akan diterbitkan secara idempoten untuk seluruh anggota berstatus <strong>Anggota Muda</strong>, <strong>Anggota Biasa</strong>, dan <strong>Anggota Luar Biasa</strong>.
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Pilih Periode Tagihan:</label>
                <input
                  type="month"
                  required
                  value={generatePeriode}
                  onChange={(e) => setGeneratePeriode(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-amber-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
                <Button type="button" variant="secondary" onClick={() => setShowGenerateModal(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" disabled={generating} className="bg-amber-600 hover:bg-amber-500 text-white">
                  {generating ? <Spinner className="w-3.5 h-3.5 mr-1" /> : <RefreshCw className="w-3.5 h-3.5 mr-1" />}
                  Terbitkan Tagihan Massal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: KONFIGURASI TARIF IURAN                             */}
      {/* ============================================================ */}
      {showTarifModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-indigo-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2 text-indigo-400">
                <Settings className="w-4 h-4" />
                Perbarui Kebijakan Tarif Iuran
              </h3>
              <button onClick={() => setShowTarifModal(false)} className="text-stone-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTarif} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Status Keanggotaan:</label>
                <select
                  value={tarifForm.status_keanggotaan}
                  onChange={(e) => setTarifForm((p) => ({ ...p, status_keanggotaan: e.target.value }))}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-indigo-500"
                >
                  <option value="anggota_muda">Anggota Muda</option>
                  <option value="anggota_biasa">Anggota Biasa (Penuh)</option>
                  <option value="anggota_luar_biasa">Anggota Luar Biasa (Alumni)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nominal Iuran Baru (Rp):</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="5000"
                  value={tarifForm.nominal}
                  onChange={(e) => setTarifForm((p) => ({ ...p, nominal: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Berlaku Efektif Sejak:</label>
                <input
                  type="date"
                  required
                  value={tarifForm.berlaku_sejak}
                  onChange={(e) => setTarifForm((p) => ({ ...p, berlaku_sejak: e.target.value }))}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
                <Button type="button" variant="secondary" onClick={() => setShowTarifModal(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" disabled={savingTarif} className="bg-indigo-600 hover:bg-indigo-500 text-white">
                  {savingTarif ? <Spinner className="w-3.5 h-3.5 mr-1" /> : <Settings className="w-3.5 h-3.5 mr-1" />}
                  Simpan Kebijakan Tarif
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
