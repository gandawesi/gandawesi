'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  FileText,
  Plus,
  Send,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Eye,
  AlertCircle,
  X,
  Calendar,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ArtikelItem, CreateArtikelPayload, ArtikelKategori } from '@/lib/types/content';
import { getMyArticles, createArticle, submitArticleForReview } from '@/lib/actions/content';

export default function MemberArtikelPage() {
  const [articles, setArticles] = useState<ArtikelItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Tulis State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateArtikelPayload>({
    judul: '',
    kategori: 'laporan_ekspedisi',
    thumbnail: '',
    konten: '',
    status: 'draft',
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getMyArticles();
      setArticles(data);
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
    setFormData({
      judul: '',
      kategori: 'laporan_ekspedisi',
      thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      konten: '',
      status: 'draft',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (statusToSave: 'draft' | 'review') => {
    if (!formData.judul.trim() || !formData.konten.trim()) {
      setNotification({ type: 'error', message: 'Harap lengkapi judul dan konten artikel' });
      return;
    }

    startTransition(async () => {
      const res = await createArticle({
        ...formData,
        status: statusToSave,
      });

      if (res.success) {
        setNotification({
          type: 'success',
          message:
            statusToSave === 'review'
              ? 'Artikel berhasil dikirim untuk review dewan pengurus!'
              : 'Draft artikel berhasil disimpan!',
        });
        setIsModalOpen(false);
        await loadData();
      } else {
        setNotification({ type: 'error', message: res.error || 'Gagal menyimpan artikel' });
      }
    });
  };

  const handleSendForReview = (id: string, judul: string) => {
    startTransition(async () => {
      const res = await submitArticleForReview(id);
      if (res.success) {
        setNotification({
          type: 'success',
          message: `Artikel "${judul}" telah diajukan ke dewan pengurus untuk kurasi!`,
        });
        await loadData();
      } else {
        setNotification({ type: 'error', message: res.error || 'Gagal mengajukan artikel' });
      }
    });
  };

  // Stats
  const publishedCount = articles.filter((a) => a.status === 'published').length;
  const reviewCount = articles.filter((a) => a.status === 'review').length;
  const draftCount = articles.filter((a) => a.status === 'draft').length;

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
            Ruang Penulisan Artikel Anggota
          </h1>
          <p className="text-xs md:text-sm text-stone-500 mt-1">
            Bagikan rekam jejak ekspedisi, tips navigasi alam terbuka, dan warta kegiatan untuk dipublikasikan di situs resmi Gandawesi.
          </p>
        </div>

        <Button
          size="sm"
          onClick={openCreateModal}
          className="bg-forest-700 hover:bg-forest-800 text-white gap-2 text-xs font-bold self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Tulis Catatan Baru
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-800/80">
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
            Diterbitkan ke Publik
          </p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {publishedCount} <span className="text-xs font-normal text-stone-400">artikel</span>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-800/80">
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
            Sedang Ditinjau Admin
          </p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {reviewCount} <span className="text-xs font-normal text-stone-400">artikel</span>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-800/80">
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
            Draft Pribadi
          </p>
          <p className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-1">
            {draftCount} <span className="text-xs font-normal text-stone-400">catatan</span>
          </p>
        </div>
      </div>

      {/* Articles Table */}
      <div className="rounded-3xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-800/80 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Spinner size="lg" />
            <p className="text-xs text-stone-500">Memuat tulisan saya...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="p-12 text-center text-stone-500">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold">Anda belum menulis catatan atau artikel</p>
            <Button
              variant="outline"
              size="sm"
              onClick={openCreateModal}
              className="mt-4 text-xs font-bold"
            >
              Mulai Tulis Artikel
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-stone-950/60 border-b border-stone-200 dark:border-stone-800 text-stone-500 uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Judul Artikel</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4">Tanggal Buat</th>
                  <th className="py-3.5 px-4">Status Publikasi</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                {articles.map((art) => (
                  <tr key={art.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                    <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-stone-100 max-w-sm">
                      {art.judul}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-[10px] capitalize">
                        {art.kategori.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-500">
                      {new Date(art.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          art.status === 'published'
                            ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
                            : art.status === 'review'
                            ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                        }`}
                      >
                        {art.status === 'published'
                          ? 'Diterbitkan ke Publik'
                          : art.status === 'review'
                          ? 'Menunggu Review'
                          : 'Draft'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                      {art.status === 'draft' && (
                        <Button
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleSendForReview(art.id, art.judul)}
                          className="bg-forest-700 hover:bg-forest-800 text-white text-[11px] h-7 px-2.5"
                        >
                          <Send className="w-3 h-3 mr-1" /> Ajukan Review
                        </Button>
                      )}
                      {art.status === 'published' && (
                        <a
                          href={`/artikel/${art.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center text-forest-700 hover:text-forest-800 text-xs font-bold"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> Lihat di Web
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tulis Artikel */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 md:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
                Tulis Catatan / Laporan Ekspedisi Baru
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 overflow-y-auto flex-1 pr-1 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Judul Artikel *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Mis. Catatan Perjalanan Menembus Hutan Sawarna..."
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Kategori
                  </label>
                  <select
                    value={formData.kategori}
                    onChange={(e: any) => setFormData({ ...formData, kategori: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
                  >
                    <option value="laporan_ekspedisi">Laporan Ekspedisi</option>
                    <option value="tips">Tips & Panduan Alam</option>
                    <option value="berita">Berita Organisasi</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    URL Gambar Cover (Thumbnail)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.thumbnail || ''}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Konten & Catatan Lapangan *
                </label>
                <textarea
                  rows={8}
                  required
                  placeholder="Tuliskan pengalaman, kondisi medan, kronologi, catatan teknis atau tips keselamatan..."
                  value={formData.konten}
                  onChange={(e) => setFormData({ ...formData, konten: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/30 font-serif leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleSubmit('draft')}
                >
                  Simpan Draft
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleSubmit('review')}
                  className="bg-forest-700 hover:bg-forest-800 text-white font-bold"
                >
                  {isPending ? <Spinner size="sm" /> : 'Kirim untuk Review'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
