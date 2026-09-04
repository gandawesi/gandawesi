'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Check,
  X,
  Search,
  Layers,
  ArrowRight,
  RotateCcw,
  Handshake,
  AlertCircle,
  FolderOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import {
  AlatItem,
  PeminjamanAlatItem,
  CreateAlatPayload,
  UpdateAlatPayload,
  PeminjamanStatus,
  KondisiAlat,
} from '@/lib/types/inventaris';
import {
  getAlatList,
  createAlat,
  updateAlat,
  deleteAlat,
  getPeminjamanList,
  updateStatusPeminjaman,
} from '@/lib/actions/inventaris';

export default function AdminInventarisPage() {
  const [activeTab, setActiveTab] = useState<'alat' | 'peminjaman'>('peminjaman');
  const [alatList, setAlatList] = useState<AlatItem[]>([]);
  const [loans, setLoans] = useState<PeminjamanAlatItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchAlat, setSearchAlat] = useState('');
  const [loanStatusFilter, setLoanStatusFilter] = useState('all');

  // Tool Form Modal
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const [editingAlat, setEditingAlat] = useState<AlatItem | null>(null);
  const [toolFormData, setToolFormData] = useState<CreateAlatPayload>({
    nama_alat: '',
    kategori: 'Tali & Webbing',
    kondisi: 'baik',
    stok: 1,
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  const loadData = async () => {
    try {
      setLoading(true);
      const [alatData, loanData] = await Promise.all([
        getAlatList(),
        getPeminjamanList(),
      ]);
      setAlatList(alatData);
      setLoans(loanData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateToolModal = () => {
    setEditingAlat(null);
    setToolFormData({
      nama_alat: '',
      kategori: 'Tali & Webbing',
      kondisi: 'baik',
      stok: 5,
    });
    setIsToolModalOpen(true);
  };

  const openEditToolModal = (alat: AlatItem) => {
    setEditingAlat(alat);
    setToolFormData({
      nama_alat: alat.nama_alat,
      kategori: alat.kategori,
      kondisi: alat.kondisi,
      stok: alat.stok,
    });
    setIsToolModalOpen(true);
  };

  const handleToolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolFormData.nama_alat.trim()) return;

    startTransition(async () => {
      if (editingAlat) {
        const res = await updateAlat({
          id: editingAlat.id,
          ...toolFormData,
        });
        if (res.success) {
          setNotification({ type: 'success', message: 'Data alat berhasil diperbarui!' });
          setIsToolModalOpen(false);
          await loadData();
        } else {
          setNotification({ type: 'error', message: res.error || 'Gagal mengubah alat' });
        }
      } else {
        const res = await createAlat(toolFormData);
        if (res.success) {
          setNotification({ type: 'success', message: 'Alat baru berhasil ditambahkan ke inventaris!' });
          setIsToolModalOpen(false);
          await loadData();
        } else {
          setNotification({ type: 'error', message: res.error || 'Gagal menambahkan alat' });
        }
      }
    });
  };

  const handleDeleteTool = (id: string, nama: string) => {
    if (!confirm(`Hapus alat "${nama}" dari inventaris?`)) return;

    startTransition(async () => {
      const res = await deleteAlat(id);
      if (res.success) {
        setNotification({ type: 'success', message: `Alat "${nama}" berhasil dihapus.` });
        await loadData();
      } else {
        setNotification({ type: 'error', message: res.error || 'Gagal menghapus alat' });
      }
    });
  };

  const handleUpdateLoanStatus = (loanId: string, nextStatus: PeminjamanStatus) => {
    startTransition(async () => {
      const res = await updateStatusPeminjaman(loanId, nextStatus);
      if (res.success) {
        const labels: Record<string, string> = {
          disetujui: 'Peminjaman disetujui (stok otomatis dikurangi)!',
          dipinjam: 'Alat telah diserahkan (status sedang dipinjam).',
          dikembalikan: 'Alat telah dikembalikan (stok otomatis dipulihkan)!',
          ditolak: 'Peminjaman ditolak.',
        };
        setNotification({ type: 'success', message: labels[nextStatus] || 'Status berhasil diperbarui' });
        await loadData();
      } else {
        setNotification({ type: 'error', message: res.error || 'Gagal memperbarui status peminjaman' });
      }
    });
  };

  // Filtered tools
  const filteredAlat = alatList.filter((a) =>
    a.nama_alat.toLowerCase().includes(searchAlat.toLowerCase()) ||
    a.kategori.toLowerCase().includes(searchAlat.toLowerCase())
  );

  // Filtered loans
  const filteredLoans = loans.filter((l) =>
    loanStatusFilter === 'all' ? true : l.status === loanStatusFilter
  );

  // Stats
  const totalUnits = alatList.reduce((acc, curr) => acc + curr.stok, 0);
  const pendingCount = loans.filter((l) => l.status === 'diajukan').length;
  const borrowedCount = loans.filter((l) => l.status === 'dipinjam').length;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
            Inventaris & Pengelolaan Logistik
          </h1>
          <p className="text-xs md:text-sm text-stone-500 mt-1">
            Kelola data peralatan lapangan, verifikasi permohonan peminjaman, dan pantau rotasi barang organisasi.
          </p>
        </div>

        {activeTab === 'alat' && (
          <Button
            size="sm"
            onClick={openCreateToolModal}
            className="bg-forest-700 hover:bg-forest-800 text-white gap-2 text-xs font-bold self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Tambah Alat Baru
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-800/80">
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
            Total Jenis Alat
          </p>
          <p className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-1">
            {alatList.length} <span className="text-xs font-normal text-stone-400">item</span>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-800/80">
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
            Total Stok Fisik
          </p>
          <p className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-1">
            {totalUnits} <span className="text-xs font-normal text-stone-400">unit</span>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-800/80">
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
            Menunggu Approval
          </p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {pendingCount} <span className="text-xs font-normal text-stone-400">permohonan</span>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-800/80">
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
            Sedang Dipinjam
          </p>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {borrowedCount} <span className="text-xs font-normal text-stone-400">aktif</span>
          </p>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold animate-in fade-in duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}
        >
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
        <button
          onClick={() => setActiveTab('peminjaman')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'peminjaman'
              ? 'bg-forest-700 text-white shadow-md shadow-forest-900/20'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          Kelola Peminjaman ({loans.length})
        </button>
        <button
          onClick={() => setActiveTab('alat')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'alat'
              ? 'bg-forest-700 text-white shadow-md shadow-forest-900/20'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          Katalog & Stok Fisik ({alatList.length})
        </button>
      </div>

      {/* TAB 1: KELOLA PEMINJAMAN */}
      {activeTab === 'peminjaman' && (
        <div className="space-y-4">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-x-auto">
            {['all', 'diajukan', 'disetujui', 'dipinjam', 'dikembalikan', 'ditolak'].map((s) => (
              <button
                key={s}
                onClick={() => setLoanStatusFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                  loanStatusFilter === s
                    ? 'bg-white dark:bg-stone-800 text-forest-700 dark:text-forest-400 shadow-sm'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                {s === 'all'
                  ? 'Semua Status'
                  : s === 'diajukan'
                  ? 'Menunggu Approval'
                  : s === 'disetujui'
                  ? 'Disetujui'
                  : s === 'dipinjam'
                  ? 'Sedang Dipinjam'
                  : s === 'dikembalikan'
                  ? 'Selesai Dikembalikan'
                  : 'Ditolak'}
              </button>
            ))}
          </div>

          {/* Loans Table */}
          <div className="rounded-3xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-800/80 overflow-hidden shadow-sm">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Spinner size="lg" />
                <p className="text-xs text-stone-500">Memuat data peminjaman...</p>
              </div>
            ) : filteredLoans.length === 0 ? (
              <div className="p-12 text-center text-stone-500">
                <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold">Tidak ada data peminjaman pada filter ini</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 dark:bg-stone-950/60 border-b border-stone-200 dark:border-stone-800 text-stone-500 uppercase font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Peminjam</th>
                      <th className="py-3.5 px-4">Alat & Jumlah</th>
                      <th className="py-3.5 px-4">Jadwal Pinjam</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Approver</th>
                      <th className="py-3.5 px-4 text-right">Tindakan Logistik</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                    {filteredLoans.map((loan) => (
                      <tr key={loan.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                        <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-stone-100">
                          {loan.anggota_nama}
                          <span className="block text-[11px] font-normal text-stone-500">
                            {loan.anggota_nia || loan.anggota_nim || '–'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-stone-900 dark:text-stone-100">
                            {loan.alat_nama}
                          </span>
                          <span className="block text-[11px] text-forest-700 dark:text-forest-400 font-semibold">
                            {loan.jumlah} Unit ({loan.alat_kategori})
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-stone-600 dark:text-stone-400">
                          <div>
                            Mulai:{' '}
                            {new Date(loan.tanggal_pinjam).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </div>
                          {loan.tanggal_kembali && (
                            <div className="text-stone-400 text-[11px]">
                              Kembali:{' '}
                              {new Date(loan.tanggal_kembali).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </div>
                          )}
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
                              ? 'Menunggu Approval'
                              : loan.status === 'disetujui'
                              ? 'Disetujui'
                              : loan.status === 'dipinjam'
                              ? 'Sedang Dipinjam'
                              : loan.status === 'dikembalikan'
                              ? 'Dikembalikan'
                              : 'Ditolak'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-stone-500">
                          {loan.approved_by_nama || '–'}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                          {loan.status === 'diajukan' && (
                            <>
                              <Button
                                size="sm"
                                disabled={isPending}
                                onClick={() => handleUpdateLoanStatus(loan.id, 'disetujui')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] h-7 px-2.5"
                              >
                                <Check className="w-3.5 h-3.5 mr-1" /> Setujui
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isPending}
                                onClick={() => handleUpdateLoanStatus(loan.id, 'ditolak')}
                                className="text-rose-600 border-rose-200 hover:bg-rose-50 text-[11px] h-7 px-2.5"
                              >
                                <X className="w-3.5 h-3.5 mr-1" /> Tolak
                              </Button>
                            </>
                          )}

                          {loan.status === 'disetujui' && (
                            <Button
                              size="sm"
                              disabled={isPending}
                              onClick={() => handleUpdateLoanStatus(loan.id, 'dipinjam')}
                              className="bg-purple-600 hover:bg-purple-700 text-white text-[11px] h-7 px-2.5"
                            >
                              <Handshake className="w-3.5 h-3.5 mr-1" /> Serahkan Alat
                            </Button>
                          )}

                          {loan.status === 'dipinjam' && (
                            <Button
                              size="sm"
                              disabled={isPending}
                              onClick={() => handleUpdateLoanStatus(loan.id, 'dikembalikan')}
                              className="bg-forest-700 hover:bg-forest-800 text-white text-[11px] h-7 px-2.5"
                            >
                              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Terima Kembali
                            </Button>
                          )}

                          {(loan.status === 'dikembalikan' || loan.status === 'ditolak') && (
                            <span className="text-[11px] text-stone-400 italic">Selesai</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: KATALOG & STOK FISIK */}
      {activeTab === 'alat' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Cari alat inventaris..."
                value={searchAlat}
                onChange={(e) => setSearchAlat(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-medium text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="rounded-3xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-800/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-stone-950/60 border-b border-stone-200 dark:border-stone-800 text-stone-500 uppercase font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Nama Peralatan</th>
                    <th className="py-3.5 px-4">Kategori</th>
                    <th className="py-3.5 px-4">Kondisi Fisik</th>
                    <th className="py-3.5 px-4">Stok Gudang</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                  {filteredAlat.map((alat) => (
                    <tr key={alat.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                      <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-stone-100">
                        {alat.nama_alat}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-semibold text-[10px]">
                          {alat.kategori}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
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
                            ? 'Baik'
                            : alat.kondisi === 'rusak_ringan'
                            ? 'Rusak Ringan'
                            : 'Rusak Berat'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-black text-xs ${
                            alat.stok <= 0 ? 'text-rose-600' : 'text-stone-900 dark:text-stone-100'
                          }`}
                        >
                          {alat.stok} Unit
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditToolModal(alat)}
                          className="h-7 w-7 p-0 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleDeleteTool(alat.id, alat.nama_alat)}
                          className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah / Edit Alat */}
      {isToolModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 md:p-7 shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
                {editingAlat ? 'Edit Data Alat' : 'Tambah Alat ke Gudang'}
              </h3>
              <button
                onClick={() => setIsToolModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleToolSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Nama Alat *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Mis. Tali Dinamis Beal 10.5mm"
                  value={toolFormData.nama_alat}
                  onChange={(e) =>
                    setToolFormData({ ...toolFormData, nama_alat: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Kategori
                  </label>
                  <select
                    value={toolFormData.kategori}
                    onChange={(e) =>
                      setToolFormData({ ...toolFormData, kategori: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
                  >
                    <option value="Tali & Webbing">Tali & Webbing</option>
                    <option value="Harness & Carabiner">Harness & Carabiner</option>
                    <option value="Tenda & Camp">Tenda & Camp</option>
                    <option value="Navigasi & Kompas">Navigasi & Kompas</option>
                    <option value="Alat Masak & Logistik">Alat Masak & Logistik</option>
                    <option value="P3K & Safety">P3K & Safety</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Kondisi Fisik
                  </label>
                  <select
                    value={toolFormData.kondisi}
                    onChange={(e: any) =>
                      setToolFormData({ ...toolFormData, kondisi: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
                  >
                    <option value="baik">Kondisi Baik</option>
                    <option value="rusak_ringan">Rusak Ringan</option>
                    <option value="rusak_berat">Rusak Berat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Stok Fisik Tersedia *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={toolFormData.stok}
                  onChange={(e) =>
                    setToolFormData({ ...toolFormData, stok: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsToolModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending}
                  className="bg-forest-700 hover:bg-forest-800 text-white font-bold"
                >
                  {isPending ? <Spinner size="sm" /> : editingAlat ? 'Simpan Perubahan' : 'Tambah Alat'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
