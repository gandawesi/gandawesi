'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Filter,
  Sparkles,
  CalendarDays,
  BookmarkCheck,
  X,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { EventItem } from '@/lib/types/event';
import { getEvents, registerEvent, cancelRegistration } from '@/lib/actions/event';

export default function MemberEventPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'all' | 'upcoming' | 'registered' | 'selesai'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
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

  const handleRegister = (event: EventItem) => {
    setActionError(null);
    setActionSuccess(null);
    startTransition(async () => {
      const res = await registerEvent(event.id);
      if (res.success) {
        setActionSuccess(`Berhasil mendaftar untuk kegiatan "${event.nama}"!`);
        await loadData();
        // Update selected modal item
        setSelectedEvent((prev) =>
          prev && prev.id === event.id
            ? { ...prev, user_registered: true, pendaftar_count: prev.pendaftar_count + 1 }
            : prev
        );
      } else {
        setActionError(res.error || 'Gagal mendaftar kegiatan');
      }
    });
  };

  const handleCancel = (event: EventItem) => {
    setActionError(null);
    setActionSuccess(null);
    startTransition(async () => {
      const res = await cancelRegistration(event.id);
      if (res.success) {
        setActionSuccess(`Pendaftaran untuk kegiatan "${event.nama}" telah dibatalkan.`);
        await loadData();
        // Update selected modal item
        setSelectedEvent((prev) =>
          prev && prev.id === event.id
            ? { ...prev, user_registered: false, pendaftar_count: Math.max(0, prev.pendaftar_count - 1) }
            : prev
        );
      } else {
        setActionError(res.error || 'Gagal membatalkan pendaftaran');
      }
    });
  };

  // Filtered items
  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.lokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.jenis.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === 'upcoming') return e.status === 'upcoming' || e.status === 'ongoing';
    if (filterTab === 'registered') return e.user_registered;
    if (filterTab === 'selesai') return e.status === 'selesai';
    return true;
  });

  // Statistics
  const registeredCount = events.filter((e) => e.user_registered).length;
  const upcomingCount = events.filter((e) => e.status === 'upcoming').length;
  const attendedCount = events.filter((e) => e.user_hadir).length;

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-900 via-forest-800 to-moss-900 p-6 md:p-8 text-white shadow-xl shadow-forest-950/20">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold tracking-wide text-forest-200 mb-4">
            <CalendarDays className="w-3.5 h-3.5 text-forest-300" />
            Agenda & Kegiatan Reguler
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
            Kalender Kegiatan Gandawesi
          </h1>
          <p className="text-sm md:text-base text-forest-100/90 leading-relaxed">
            Ikuti latihan rutin, ekspedisi alam terbuka, bakti sosial, dan agenda organisasi. Daftarkan diri Anda dan pantau kuota serta status kehadiran secara real-time.
          </p>
        </div>

        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-forest-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-20 w-60 h-60 bg-moss-400/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-800/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-forest-50 dark:bg-forest-950/60 border border-forest-100 dark:border-forest-900/60 flex items-center justify-center text-forest-700 dark:text-forest-400 shrink-0">
            <BookmarkCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Kegiatan Terdaftar
            </p>
            <p className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-0.5">
              {registeredCount} <span className="text-xs font-normal text-stone-500">Event</span>
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-800/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900/60 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Mendatang
            </p>
            <p className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-0.5">
              {upcomingCount} <span className="text-xs font-normal text-stone-500">Event Aktif</span>
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-800/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Presensi Hadir
            </p>
            <p className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-0.5">
              {attendedCount} <span className="text-xs font-normal text-stone-500">Kegiatan</span>
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3 text-emerald-900 dark:text-emerald-200 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm font-medium">{actionSuccess}</div>
          <button
            onClick={() => setActionSuccess(null)}
            className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-50/90 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-start gap-3 text-rose-900 dark:text-rose-200 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm font-medium">{actionError}</div>
          <button
            onClick={() => setActionError(null)}
            className="text-rose-600 hover:text-rose-800 dark:text-rose-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Controls & Filter */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-stone-100 dark:bg-stone-900/80 border border-stone-200/60 dark:border-stone-800/80 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterTab === 'all'
                ? 'bg-white dark:bg-stone-800 text-forest-700 dark:text-forest-400 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            Semua ({events.length})
          </button>
          <button
            onClick={() => setFilterTab('upcoming')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterTab === 'upcoming'
                ? 'bg-white dark:bg-stone-800 text-forest-700 dark:text-forest-400 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            Akan Datang ({upcomingCount})
          </button>
          <button
            onClick={() => setFilterTab('registered')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterTab === 'registered'
                ? 'bg-white dark:bg-stone-800 text-forest-700 dark:text-forest-400 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            Terdaftar Saya ({registeredCount})
          </button>
          <button
            onClick={() => setFilterTab('selesai')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterTab === 'selesai'
                ? 'bg-white dark:bg-stone-800 text-forest-700 dark:text-forest-400 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            Selesai
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Cari kegiatan atau lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 text-xs font-medium text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
          />
          <Compass className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Spinner size="lg" />
          <p className="text-xs font-medium text-stone-500">Memuat agenda kegiatan...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-stone-200 dark:border-stone-800 bg-white/40 dark:bg-stone-900/40">
          <Calendar className="w-12 h-12 text-stone-400 mx-auto mb-3 opacity-60" />
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
            Tidak ada kegiatan ditemukan
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Silakan ganti kata kunci pencarian atau pilih tab filter lain.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const isFull = event.kuota !== null && event.pendaftar_count >= event.kuota;
            const quotaPercent = event.kuota
              ? Math.min(100, Math.round((event.pendaftar_count / event.kuota) * 100))
              : 0;

            const dateStr = new Date(event.tanggal).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={event.id}
                className="group relative rounded-3xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-800/80 p-5 hover:shadow-xl hover:border-forest-400/50 dark:hover:border-forest-600/50 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Badge Row */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-xl bg-forest-50 dark:bg-forest-950/60 text-forest-700 dark:text-forest-400 border border-forest-100 dark:border-forest-900/50 text-[10px] font-bold tracking-wide">
                      {event.jenis}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {event.user_registered && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Terdaftar
                        </span>
                      )}
                      {event.user_hadir && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-[10px] font-bold">
                          Hadir
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          event.status === 'upcoming'
                            ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                            : event.status === 'ongoing'
                            ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 animate-pulse'
                            : event.status === 'selesai'
                            ? 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                            : 'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300'
                        }`}
                      >
                        {event.status === 'upcoming'
                          ? 'Akan Datang'
                          : event.status === 'ongoing'
                          ? 'Berlangsung'
                          : event.status === 'selesai'
                          ? 'Selesai'
                          : 'Batal'}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 line-clamp-2 group-hover:text-forest-700 dark:group-hover:text-forest-400 transition-colors">
                    {event.nama}
                  </h3>

                  {/* Info Row */}
                  <div className="mt-3 space-y-1.5 text-xs text-stone-600 dark:text-stone-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-forest-600 dark:text-forest-400 shrink-0" />
                      <span>
                        {dateStr}
                        {event.tanggal_selesai && (
                          <span className="text-stone-400">
                            {' '}
                            –{' '}
                            {new Date(event.tanggal_selesai).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">{event.lokasi}</span>
                    </div>
                  </div>

                  {/* Description snippet */}
                  {event.deskripsi && (
                    <p className="mt-3 text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                      {event.deskripsi}
                    </p>
                  )}
                </div>

                {/* Bottom Quota & Action */}
                <div className="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800/80 space-y-3">
                  {/* Quota Progress */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold mb-1 text-stone-500 dark:text-stone-400">
                      <span>Kapasitas Peserta</span>
                      <span>
                        {event.pendaftar_count} / {event.kuota ? `${event.kuota}` : '∞'} Peserta
                      </span>
                    </div>
                    {event.kuota && (
                      <div className="w-full h-1.5 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            quotaPercent >= 100
                              ? 'bg-rose-500'
                              : quotaPercent >= 80
                              ? 'bg-amber-500'
                              : 'bg-forest-600'
                          }`}
                          style={{ width: `${quotaPercent}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedEvent(event)}
                      className="flex-1 text-xs"
                    >
                      Detail Acara
                    </Button>

                    {event.status === 'upcoming' && (
                      event.user_registered ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleCancel(event)}
                          className="text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          Batal
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          disabled={isPending || isFull}
                          onClick={() => handleRegister(event)}
                          className="text-xs bg-forest-700 hover:bg-forest-800 text-white"
                        >
                          {isFull ? 'Penuh' : 'Daftar'}
                        </Button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Detail Event */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 md:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
              <div>
                <span className="px-2.5 py-1 rounded-xl bg-forest-50 dark:bg-forest-950/60 text-forest-700 dark:text-forest-400 border border-forest-100 dark:border-forest-900/50 text-xs font-bold">
                  {selectedEvent.jenis}
                </span>
                <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-100 mt-2">
                  {selectedEvent.nama}
                </h2>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-4 space-y-4 overflow-y-auto flex-1 text-sm text-stone-600 dark:text-stone-300">
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/50 border border-stone-100 dark:border-stone-800 text-xs">
                <div>
                  <p className="text-stone-400 uppercase tracking-wider font-semibold text-[10px]">
                    Tanggal Pelaksanaan
                  </p>
                  <p className="font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                    {new Date(selectedEvent.tanggal).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  {selectedEvent.tanggal_selesai && (
                    <p className="text-stone-500 text-[11px]">
                      s.d.{' '}
                      {new Date(selectedEvent.tanggal_selesai).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-stone-400 uppercase tracking-wider font-semibold text-[10px]">
                    Lokasi Kegiatan
                  </p>
                  <p className="font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                    {selectedEvent.lokasi}
                  </p>
                </div>
                <div>
                  <p className="text-stone-400 uppercase tracking-wider font-semibold text-[10px]">
                    Kuota & Pendaftar
                  </p>
                  <p className="font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                    {selectedEvent.pendaftar_count} /{' '}
                    {selectedEvent.kuota ? `${selectedEvent.kuota} Orang` : 'Tidak Terbatas'}
                  </p>
                </div>
                <div>
                  <p className="text-stone-400 uppercase tracking-wider font-semibold text-[10px]">
                    Status Saya
                  </p>
                  <p className="font-bold mt-0.5">
                    {selectedEvent.user_registered ? (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        Terdaftar {selectedEvent.user_hadir ? '(Hadir)' : ''}
                      </span>
                    ) : (
                      <span className="text-stone-400">Belum Terdaftar</span>
                    )}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
                  Deskripsi & Rincian Agenda
                </h4>
                <p className="text-xs md:text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                  {selectedEvent.deskripsi || 'Tidak ada keterangan tambahan.'}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setSelectedEvent(null)}>
                Tutup
              </Button>
              {selectedEvent.status === 'upcoming' && (
                selectedEvent.user_registered ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleCancel(selectedEvent)}
                    className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                  >
                    {isPending ? <Spinner size="sm" /> : 'Batalkan Pendaftaran'}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    disabled={
                      isPending ||
                      (selectedEvent.kuota !== null &&
                        selectedEvent.pendaftar_count >= selectedEvent.kuota)
                    }
                    onClick={() => handleRegister(selectedEvent)}
                    className="bg-forest-700 hover:bg-forest-800 text-white"
                  >
                    {isPending ? (
                      <Spinner size="sm" />
                    ) : selectedEvent.kuota !== null &&
                      selectedEvent.pendaftar_count >= selectedEvent.kuota ? (
                      'Kuota Penuh'
                    ) : (
                      'Daftar Kegiatan Sekarang'
                    )}
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
