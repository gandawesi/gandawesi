'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  X,
  Search,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import {
  EventItem,
  CreateEventPayload,
  UpdateEventPayload,
  PendaftaranEventItem,
} from '@/lib/types/event';
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventParticipants,
  updatePresensi,
} from '@/lib/actions/event';

export default function AdminEventPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [formData, setFormData] = useState<CreateEventPayload>({
    nama: '',
    jenis: 'Latihan Alam',
    lokasi: '',
    tanggal: '',
    tanggal_selesai: '',
    kuota: 30,
    deskripsi: '',
    is_public: true,
    status: 'upcoming',
  });

  // Participant & Attendance Modal State
  const [selectedEventForPeserta, setSelectedEventForPeserta] = useState<EventItem | null>(null);
  const [participants, setParticipants] = useState<PendaftaranEventItem[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingEvent(null);
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      nama: '',
      jenis: 'Latihan Alam',
      lokasi: 'Tebing Citatah / Sekretariat Gandawesi',
      tanggal: today,
      tanggal_selesai: '',
      kuota: 25,
      deskripsi: '',
      is_public: true,
      status: 'upcoming',
    });
    setIsFormOpen(true);
  };

  const openEditModal = (event: EventItem) => {
    setEditingEvent(event);
    setFormData({
      nama: event.nama,
      jenis: event.jenis,
      lokasi: event.lokasi,
      tanggal: event.tanggal,
      tanggal_selesai: event.tanggal_selesai || '',
      kuota: event.kuota || null,
      deskripsi: event.deskripsi || '',
      is_public: event.is_public,
      status: event.status,
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim() || !formData.tanggal || !formData.lokasi.trim()) {
      setNotification({ type: 'error', message: 'Harap isi semua field bertanda bintang (*)' });
      return;
    }

    startTransition(async () => {
      if (editingEvent) {
        const res = await updateEvent({
          id: editingEvent.id,
          ...formData,
        });
        if (res.success) {
          setNotification({ type: 'success', message: 'Kegiatan berhasil diperbarui!' });
          setIsFormOpen(false);
          await loadData();
        } else {
          setNotification({ type: 'error', message: res.error || 'Gagal memperbarui kegiatan' });
        }
      } else {
        const res = await createEvent(formData);
        if (res.success) {
          setNotification({ type: 'success', message: 'Kegiatan baru berhasil dibuat!' });
          setIsFormOpen(false);
          await loadData();
        } else {
          setNotification({ type: 'error', message: res.error || 'Gagal membuat kegiatan' });
        }
      }
    });
  };

  const handleDelete = (id: string, nama: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kegiatan "${nama}"?`)) return;

    startTransition(async () => {
      const res = await deleteEvent(id);
      if (res.success) {
        setNotification({ type: 'success', message: `Kegiatan "${nama}" telah dihapus.` });
        await loadData();
      } else {
        setNotification({ type: 'error', message: res.error || 'Gagal menghapus kegiatan' });
      }
    });
  };

  const openPesertaModal = async (event: EventItem) => {
    setSelectedEventForPeserta(event);
    setLoadingParticipants(true);
    try {
      const list = await getEventParticipants(event.id);
      setParticipants(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const handleTogglePresensi = (anggotaId: string, currentHadir: boolean) => {
    if (!selectedEventForPeserta) return;

    startTransition(async () => {
      const nextHadir = !currentHadir;
      const res = await updatePresensi(selectedEventForPeserta.id, anggotaId, nextHadir);
      if (res.success) {
        setParticipants((prev) =>
          prev.map((p) => (p.anggota_id === anggotaId ? { ...p, hadir: nextHadir } : p))
        );
      } else {
        alert(res.error || 'Gagal memperbarui presensi');
      }
    });
  };

  // Filtered
  const filteredEvents = events.filter((e) => {
    const matchSearch =
      e.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.lokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.jenis.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
            Manajemen Kegiatan & Presensi
          </h1>
          <p className="text-xs md:text-sm text-stone-500 mt-1">
            Kelola agenda kegiatan, atur kuota pendaftaran anggota, dan pantau presensi kehadiran peserta.
          </p>
        </div>

        <Button
          size="sm"
          onClick={openCreateModal}
          className="bg-forest-700 hover:bg-forest-800 text-white gap-2 text-xs font-bold shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Tambah Kegiatan
        </Button>
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

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-x-auto">
          {['all', 'upcoming', 'ongoing', 'selesai', 'batal'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                statusFilter === s
                  ? 'bg-white dark:bg-stone-800 text-forest-700 dark:text-forest-400 shadow-sm'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              {s === 'all' ? 'Semua' : s === 'upcoming' ? 'Mendatang' : s}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Cari event / lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-medium text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Events Table */}
      <div className="rounded-3xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-800/80 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Spinner size="lg" />
            <p className="text-xs text-stone-500">Memuat data kegiatan...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-stone-500">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">Tidak ada kegiatan ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-stone-950/60 border-b border-stone-200 dark:border-stone-800 text-stone-500 uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Nama Kegiatan</th>
                  <th className="py-3.5 px-4">Jenis</th>
                  <th className="py-3.5 px-4">Waktu & Lokasi</th>
                  <th className="py-3.5 px-4">Kuota / Pendaftar</th>
                  <th className="py-3.5 px-4">Visibilitas</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                {filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-stone-100 max-w-xs">
                      {evt.nama}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-[10px]">
                        {evt.jenis}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 dark:text-stone-400">
                      <div>
                        {new Date(evt.tanggal).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        <span className="truncate max-w-[150px]">{evt.lokasi}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-stone-800 dark:text-stone-200">
                        {evt.pendaftar_count}
                      </span>{' '}
                      <span className="text-stone-400">/ {evt.kuota ? `${evt.kuota} org` : '∞'}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {evt.is_public ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                          <Eye className="w-3.5 h-3.5" /> Publik
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-stone-400 font-semibold text-[11px]">
                          <EyeOff className="w-3.5 h-3.5" /> Internal
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          evt.status === 'upcoming'
                            ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                            : evt.status === 'ongoing'
                            ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
                            : evt.status === 'selesai'
                            ? 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                            : 'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300'
                        }`}
                      >
                        {evt.status === 'upcoming'
                          ? 'Mendatang'
                          : evt.status === 'ongoing'
                          ? 'Berjalan'
                          : evt.status === 'selesai'
                          ? 'Selesai'
                          : 'Batal'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openPesertaModal(evt)}
                        className="text-[11px] h-7 px-2.5"
                      >
                        <Users className="w-3.5 h-3.5 mr-1 text-forest-600" /> Presensi ({evt.pendaftar_count})
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(evt)}
                        className="h-7 w-7 p-0 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleDelete(evt.id, evt.nama)}
                        className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Buat / Edit Event */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 md:p-7 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
                {editingEvent ? 'Edit Data Kegiatan' : 'Buat Kegiatan Baru'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4 overflow-y-auto flex-1 pr-1 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Nama Kegiatan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Mis. Latihan SRT Tebing Citatah"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Jenis Kegiatan
                  </label>
                  <select
                    value={formData.jenis}
                    onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
                  >
                    <option value="Latihan Alam">Latihan Alam</option>
                    <option value="Ekspedisi">Ekspedisi</option>
                    <option value="Kompetisi Internal">Kompetisi Internal</option>
                    <option value="Pengabdian Masyarakat">Pengabdian Masyarakat</option>
                    <option value="Rapat Organisasi">Rapat Organisasi</option>
                    <option value="Workshop & Seminar">Workshop & Seminar</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Status Kegiatan
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
                  >
                    <option value="upcoming">Akan Datang (Upcoming)</option>
                    <option value="ongoing">Sedang Berlangsung (Ongoing)</option>
                    <option value="selesai">Selesai</option>
                    <option value="batal">Batal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Lokasi Pelaksanaan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Mis. Tebing Citatah 125, Padalarang"
                  value={formData.lokasi}
                  onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Tanggal Mulai *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    value={formData.tanggal_selesai || ''}
                    onChange={(e) => setFormData({ ...formData, tanggal_selesai: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Batas Kuota
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Kosong = bebas"
                    value={formData.kuota ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        kuota: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Deskripsi & Instruksi Peserta
                </label>
                <textarea
                  rows={3}
                  placeholder="Keterangan agenda, peralatan yang wajib dibawa, CP..."
                  value={formData.deskripsi || ''}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  className="w-4 h-4 rounded text-forest-600 focus:ring-forest-500"
                />
                <label htmlFor="is_public" className="font-semibold text-stone-700 dark:text-stone-300">
                  Tampilkan ke Publik / Calon Anggota (Halaman Web Utama)
                </label>
              </div>

              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFormOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending}
                  className="bg-forest-700 hover:bg-forest-800 text-white font-bold"
                >
                  {isPending ? <Spinner size="sm" /> : editingEvent ? 'Simpan Perubahan' : 'Buat Event'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kelola Peserta & Presensi */}
      {selectedEventForPeserta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 md:p-7 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-forest-50 dark:bg-forest-950 text-forest-700 dark:text-forest-400">
                  Presensi Peserta
                </span>
                <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100 mt-1">
                  {selectedEventForPeserta.nama}
                </h3>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Total Terdaftar: {participants.length} Peserta | Hadir:{' '}
                  <strong className="text-emerald-600">
                    {participants.filter((p) => p.hadir).length}
                  </strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedEventForPeserta(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 overflow-y-auto flex-1">
              {loadingParticipants ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Spinner size="md" />
                  <p className="text-xs text-stone-500">Memuat daftar peserta...</p>
                </div>
              ) : participants.length === 0 ? (
                <div className="p-8 text-center text-stone-500">
                  <UserCheck className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-semibold">Belum ada anggota yang mendaftar pada kegiatan ini</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 dark:bg-stone-950/60 text-stone-500 font-semibold border-b border-stone-200 dark:border-stone-800">
                    <tr>
                      <th className="py-2.5 px-3">Nama Anggota</th>
                      <th className="py-2.5 px-3">NIM / NIA</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-center">Presensi Hadir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800/50">
                    {participants.map((p) => (
                      <tr key={p.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                        <td className="py-3 px-3 font-bold text-stone-900 dark:text-stone-100">
                          {p.anggota_nama}
                        </td>
                        <td className="py-3 px-3 text-stone-500">
                          {p.anggota_nia || p.anggota_nim || '–'}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-[10px] font-semibold capitalize">
                            {p.status_keanggotaan.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleTogglePresensi(p.anggota_id, !!p.hadir)}
                            disabled={isPending}
                            className={`px-3 py-1 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 transition-all ${
                              p.hadir
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200'
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-700'
                            }`}
                          >
                            {p.hadir ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                Hadir
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-stone-400" />
                                Belum
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedEventForPeserta(null)}
                className="text-xs"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
