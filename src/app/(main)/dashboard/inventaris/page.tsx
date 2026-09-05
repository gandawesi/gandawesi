'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  Package,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Filter,
  ShieldAlert,
  ArrowRight,
  ClipboardList,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { StatCard, StatGrid } from '@/components/ui/StatCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatDateIndo } from '@/lib/utils/format';
import { AlatItem, PeminjamanAlatItem, KondisiAlat } from '@/lib/types/inventaris';
import { getAlatList, getMyPeminjaman, ajukanPeminjaman } from '@/lib/actions/inventaris';

const KATEGORI_OPTIONS = [
  'Semua Kategori',
  'Tali & Webbing',
  'Harness & Carabiner',
  'Tenda & Camp',
  'Navigasi & Kompas',
  'Alat Masak & Logistik',
  'P3K & Safety',
];

export default function MemberInventarisPage() {
  const [activeTab, setActiveTab] = useState<'katalog' | 'peminjaman_saya'>('katalog');
  const [alatList, setAlatList] = useState<AlatItem[]>([]);
  const [myLoans, setMyLoans] = useState<PeminjamanAlatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKategori, setSelectedKategori] = useState('Semua Kategori');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal Pinjam state
  const [selectedAlat, setSelectedAlat] = useState<AlatItem | null>(null);
  const [jumlahPinjam, setJumlahPinjam] = useState(1);
  const [tglPinjam, setTglPinjam] = useState('');
  const [tglKembali, setTglKembali] = useState('');

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadData = async () => {
    try {
      setLoading(true);
      const [alatData, loanData] = await Promise.all([getAlatList(), getMyPeminjaman()]);
      setAlatList(alatData);
      setMyLoans(loanData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Default tomorrow date for dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const inThreeDays = new Date(today);
    inThreeDays.setDate(inThreeDays.getDate() + 4);

    setTglPinjam(tomorrow.toISOString().split('T')[0]);
    setTglKembali(inThreeDays.toISOString().split('T')[0]);
  }, []);

  const handleOpenPinjamModal = (alat: AlatItem) => {
    setSelectedAlat(alat);
    setJumlahPinjam(1);
    setActionError(null);
  };

  const handleSubmitPinjam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlat) return;

    if (jumlahPinjam <= 0) {
      setActionError('Jumlah alat minimal 1 unit');
      return;
    }
    if (jumlahPinjam > selectedAlat.stok) {
      setActionError(`Jumlah melebihi stok yang tersedia (maksimal ${selectedAlat.stok} unit)`);
      return;
    }
    if (!tglPinjam) {
      setActionError('Pilih tanggal mulai pinjam');
      return;
    }

    setActionError(null);
    startTransition(async () => {
      const res = await ajukanPeminjaman({
        alat_id: selectedAlat.id,
        jumlah: jumlahPinjam,
        tanggal_pinjam: tglPinjam,
        tanggal_kembali: tglKembali || null,
      });

      if (res.success) {
        setActionSuccess(
          `Pengajuan peminjaman ${jumlahPinjam} unit "${selectedAlat.nama_alat}" berhasil dikirim! Menunggu persetujuan dewan pengurus/logistik.`
        );
        setSelectedAlat(null);
        await loadData();
        setActiveTab('peminjaman_saya');
      } else {
        setActionError(res.error || 'Gagal mengajukan peminjaman');
      }
    });
  };

  // Filtered tools
  const filteredAlat = alatList.filter((a) => {
    const matchesKategori =
      selectedKategori === 'Semua Kategori' || a.kategori === selectedKategori;
    const matchesSearch =
      a.nama_alat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.kategori || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesKategori && matchesSearch;
  });

  // Loan status counts
  const activeLoans = myLoans.filter((l) => l.status === 'dipinjam' || l.status === 'disetujui');
  const pendingLoans = myLoans.filter((l) => l.status === 'diajukan');

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <PageHeader
        variant="hero"
        badge={{ icon: Package, text: 'Logistik & Inventaris Organisasi' }}
        title="Peminjaman Alat Lapangan"
        description="Katalog perlengkapan caving, climbing, mountaineering, dan perkemahan. Ajukan permohonan pinjam alat secara digital dan pantau persetujuan pengurus."
      />

      {/* Stats Cards */}
      <StatGrid columns={3}>
        <StatCard
          icon={Layers}
          label="Katalog Peralatan"
          value={alatList.length}
          subtext="Jenis Alat"
          color="forest"
        />
        <StatCard
          icon={Clock}
          label="Menunggu Disetujui"
          value={pendingLoans.length}
          subtext="Permohonan"
          color="amber"
        />
        <StatCard
          icon={Package}
          label="Aktif Saya Pinjam"
          value={activeLoans.length}
          subtext="Peminjaman"
          color="emerald"
        />
      </StatGrid>

      {/* Notification */}
      {actionSuccess && (
        <Alert
          type="success"
          message={actionSuccess}
          onClose={() => setActionSuccess(null)}
        />
      )}

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
        <button
          onClick={() => setActiveTab('katalog')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'katalog'
              ? 'bg-forest-700 text-white shadow-md shadow-forest-900/20'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          Katalog Alat Lapangan ({alatList.length})
        </button>
        <button
          onClick={() => setActiveTab('peminjaman_saya')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'peminjaman_saya'
              ? 'bg-forest-700 text-white shadow-md shadow-forest-900/20'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          Peminjaman Saya ({myLoans.length})
        </button>
      </div>

      {/* Tab Content 1: Katalog */}
      {activeTab === 'katalog' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Category Select */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {KATEGORI_OPTIONS.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedKategori(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedKategori === cat
                      ? 'bg-forest-100 dark:bg-forest-950 text-forest-800 dark:text-forest-300 border border-forest-300 dark:border-forest-800'
                      : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:bg-stone-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-64 shrink-0">
              <input
                type="text"
                placeholder="Cari nama alat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Spinner size="lg" />
              <p className="text-xs text-stone-500">Memuat katalog inventaris...</p>
            </div>
          ) : filteredAlat.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Tidak ada alat yang cocok"
              description="Silakan ubah filter kategori atau kata kunci pencarian."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredAlat.map((alat) => {
                const isOutOfStock = alat.stok <= 0;
                return (
                  <div
                    key={alat.id}
                    className="rounded-3xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-800/80 p-5 flex flex-col justify-between hover:border-forest-400/50 dark:hover:border-forest-600/50 hover:shadow-lg transition-all"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                          {alat.kategori}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            alat.kondisi === 'baik'
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                              : alat.kondisi === 'rusak_ringan'
                              ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {alat.kondisi === 'baik'
                            ? 'Kondisi Baik'
                            : alat.kondisi === 'rusak_ringan'
                            ? 'Rusak Ringan'
                            : 'Rusak Berat'}
                        </span>
                      </div>

                      {/* Tool Name */}
                      <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 mt-2 line-clamp-2">
                        {alat.nama_alat}
                      </h4>
                    </div>

                    {/* Stock & Action */}
                    <div className="mt-5 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-stone-400">
                          Stok Tersedia
                        </p>
                        <p
                          className={`text-sm font-extrabold ${
                            isOutOfStock
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-stone-900 dark:text-stone-100'
                          }`}
                        >
                          {isOutOfStock ? 'Habis' : `${alat.stok} Unit`}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        disabled={isOutOfStock}
                        onClick={() => handleOpenPinjamModal(alat)}
                        className={`text-xs ${
                          isOutOfStock
                            ? 'bg-stone-200 dark:bg-stone-800 text-stone-400'
                            : 'bg-forest-700 hover:bg-forest-800 text-white'
                        }`}
                      >
                        Pinjam Alat
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 2: Peminjaman Saya */}
      {activeTab === 'peminjaman_saya' && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Spinner size="lg" />
              <p className="text-xs text-stone-500">Memuat data peminjaman...</p>
            </div>
          ) : myLoans.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="Belum ada riwayat peminjaman"
              description="Pilih perlengkapan dari tab Katalog Alat Lapangan untuk mengajukan peminjaman pertama Anda."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('katalog')}
                  className="text-xs"
                >
                  Buka Katalog Alat
                </Button>
              }
            />
          ) : (
            <div className="rounded-3xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-800/80 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 dark:bg-stone-950/60 border-b border-stone-200 dark:border-stone-800 text-stone-500 uppercase font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Nama Alat</th>
                      <th className="py-3.5 px-4">Jumlah</th>
                      <th className="py-3.5 px-4">Tanggal Pinjam</th>
                      <th className="py-3.5 px-4">Rencana Kembali</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Persetujuan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                    {myLoans.map((loan) => (
                      <tr key={loan.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-stone-100">
                          {loan.alat_nama}
                          <span className="block text-[11px] font-normal text-stone-500">
                            {loan.alat_kategori}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-stone-800 dark:text-stone-200">
                          {loan.jumlah} Unit
                        </td>
                        <td className="py-3.5 px-4 text-stone-600 dark:text-stone-400">
                          {formatDateIndo(loan.tanggal_pinjam)}
                        </td>
                        <td className="py-3.5 px-4 text-stone-600 dark:text-stone-400">
                          {formatDateIndo(loan.tanggal_kembali)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              loan.status === 'diajukan'
                                ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                                : loan.status === 'disetujui'
                                ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300'
                                : loan.status === 'dipinjam'
                                ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300'
                                : loan.status === 'dikembalikan'
                                ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
                                : 'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300'
                            }`}
                          >
                            {loan.status === 'diajukan'
                              ? 'Menunggu Persetujuan'
                              : loan.status === 'disetujui'
                              ? 'Disetujui (Siap Diambil)'
                              : loan.status === 'dipinjam'
                              ? 'Sedang Dipinjam'
                              : loan.status === 'dikembalikan'
                              ? 'Selesai Dikembalikan'
                              : 'Ditolak'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-stone-500">
                          {loan.approved_by_nama ? (
                            <span className="text-[11px] font-medium text-stone-700 dark:text-stone-300">
                              {loan.approved_by_nama}
                            </span>
                          ) : (
                            <span className="text-[11px] text-stone-400">Menunggu</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Pengajuan Pinjam */}
      {selectedAlat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 md:p-7 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-stone-100 dark:border-stone-800">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-forest-50 dark:bg-forest-950 text-forest-700 dark:text-forest-400">
                  {selectedAlat.kategori}
                </span>
                <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100 mt-1">
                  Formulir Peminjaman Alat
                </h3>
              </div>
              <button
                onClick={() => setSelectedAlat(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Alert */}
            {actionError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmitPinjam} className="mt-4 space-y-4">
              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-950/50 border border-stone-100 dark:border-stone-800">
                <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  {selectedAlat.nama_alat}
                </p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Stok Fisik Tersedia: <strong className="text-forest-600">{selectedAlat.stok} unit</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Jumlah Unit yang Dipinjam
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedAlat.stok}
                  value={jumlahPinjam}
                  onChange={(e) => setJumlahPinjam(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Tanggal Pinjam
                  </label>
                  <input
                    type="date"
                    value={tglPinjam}
                    onChange={(e) => setTglPinjam(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Rencana Kembali
                  </label>
                  <input
                    type="date"
                    value={tglKembali}
                    onChange={(e) => setTglKembali(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-forest-50 dark:bg-forest-950/40 border border-forest-100 dark:border-forest-900/60 text-[11px] text-forest-800 dark:text-forest-300 leading-relaxed">
                Peminjam bertanggung jawab penuh atas keutuhan dan kebersihan alat sebelum dan sesudah kegiatan.
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAlat(null)}
                  className="text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending}
                  className="text-xs bg-forest-700 hover:bg-forest-800 text-white"
                >
                  {isPending ? <Spinner size="sm" /> : 'Kirim Permohonan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
