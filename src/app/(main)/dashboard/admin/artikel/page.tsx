'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  Compass,
  Edit2,
  Trash2,
  Plus,
  X,
  Sparkles,
  BookOpen,
  Check,
  Send,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import {
  ArtikelItem,
  KontenStatisItem,
  RuteEkspedisiItem,
  CreateRuteEkspedisiPayload,
  ArtikelKategori,
} from '@/lib/types/content';
import {
  getAdminArticles,
  reviewArticle,
  getAllKontenStatis,
  updateKontenStatis,
  getRuteEkspedisiList,
  createRuteEkspedisi,
} from '@/lib/actions/content';

export default function AdminArtikelCurationPage() {
  const [activeTab, setActiveTab] = useState<'kurasi' | 'cms' | 'ekspedisi'>('kurasi');
  const [articles, setArticles] = useState<ArtikelItem[]>([]);
  const [kontenList, setKontenList] = useState<KontenStatisItem[]>([]);
  const [ruteList, setRuteList] = useState<RuteEkspedisiItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [selectedArticle, setSelectedArticle] = useState<ArtikelItem | null>(null);
  const [reviewSlug, setReviewSlug] = useState('');
  const [reviewKategori, setReviewKategori] = useState<ArtikelKategori>('laporan_ekspedisi');

  // CMS Edit Modal State
  const [editingKonten, setEditingKonten] = useState<KontenStatisItem | null>(null);
  const [cmsJudul, setCmsJudul] = useState('');
  const [cmsBody, setCmsBody] = useState('');

  // Ekspedisi Form Modal State
  const [isRuteModalOpen, setIsRuteModalOpen] = useState(false);
  const [ruteFormData, setRuteFormData] = useState<CreateRuteEkspedisiPayload>({
    nama: '',
    lokasi: '',
    tanggal: '',
    deskripsi: '',
    peserta: '',
    foto: [],
  });
  const [ruteFotoInput, setRuteFotoInput] = useState('');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  const loadData = async () => {
    try {
      setLoading(true);
      const [artData, cmsData, expData] = await Promise.all([
        getAdminArticles(),
        getAllKontenStatis(),
        getRuteEkspedisiList(),
      ]);
      setArticles(artData);
      setKontenList(cmsData);
      setRuteList(expData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openReviewModal = (article: ArtikelItem) => {
    setSelectedArticle(article);
    setReviewSlug(
      article.slug ||
        article.judul
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
    );
    setReviewKategori(article.kategori);
  };

  const handleApprove = () => {
    if (!selectedArticle) return;
    startTransition(async () => {
      const res = await reviewArticle(selectedArticle.id, 'publish', {
        slug: reviewSlug.trim(),
        kategori: reviewKategori,
      });

      if (res.success) {
        setNotification({
          type: 'success',
          message: `Artikel "${selectedArticle.judul}" berhasil diterbitkan ke publik!`,
        });
        setSelectedArticle(null);
        await loadData();
      } else {
        setNotification({ type: 'error', message: res.error || 'Gagal menerbitkan artikel' });
      }
    });
  };

  const handleReject = () => {
    if (!selectedArticle) return;
    startTransition(async () => {
      const res = await reviewArticle(selectedArticle.id, 'reject');
      if (res.success) {
        setNotification({
          type: 'success',
          message: `Artikel dikembalikan ke status draft untuk perbaikan penulis.`,
        });
        setSelectedArticle(null);
        await loadData();
      } else {
        setNotification({ type: 'error', message: res.error || 'Gagal memproses review' });
      }
    });
  };

  const openCmsEdit = (item: KontenStatisItem) => {
    setEditingKonten(item);
    setCmsJudul(item.judul);
    setCmsBody(item.konten || '');
  };

  const handleCmsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKonten) return;

    startTransition(async () => {
      const res = await updateKontenStatis(editingKonten.slug, cmsJudul, cmsBody);
      if (res.success) {
        setNotification({ type: 'success', message: 'Konten profil berhasil diperbarui!' });
        setEditingKonten(null);
        await loadData();
      } else {
        setNotification({ type: 'error', message: res.error || 'Gagal menyimpan konten profil' });
      }
    });
  };

  const handleCreateRute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruteFormData.nama.trim() || !ruteFormData.lokasi.trim()) return;

    const fotoArray = ruteFotoInput
      .split('\n')
      .map((u) => u.trim())
      .filter(Boolean);

    startTransition(async () => {
      const res = await createRuteEkspedisi({
        ...ruteFormData,
        foto: fotoArray,
      });

      if (res.success) {
        setNotification({ type: 'success', message: 'Rute ekspedisi baru berhasil ditambahkan!' });
        setIsRuteModalOpen(false);
        setRuteFormData({ nama: '', lokasi: '', tanggal: '', deskripsi: '', peserta: '', foto: [] });
        setRuteFotoInput('');
        await loadData();
      } else {
        setNotification({ type: 'error', message: res.error || 'Gagal menambahkan rute ekspedisi' });
      }
    });
  };

  // Filtered
  const pendingReviews = articles.filter((a) => a.status === 'review');
  const publishedArticles = articles.filter((a) => a.status === 'published');

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
            Kurasi Artikel & CMS Konten Publik
          </h1>
          <p className="text-xs md:text-sm text-stone-500 mt-1">
            Tinjau draf tulisan anggota sebelum dipublikasikan, kelola halaman profil organisasi, dan rekam rute ekspedisi.
          </p>
        </div>

        {activeTab === 'ekspedisi' && (
          <Button
            size="sm"
            onClick={() => setIsRuteModalOpen(true)}
            className="bg-forest-700 hover:bg-forest-800 text-white gap-2 text-xs font-bold self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Tambah Rute Ekspedisi
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-800/80">
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
            Menunggu Kurasi Review
          </p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {pendingReviews.length} <span className="text-xs font-normal text-stone-400">antrean</span>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-800/80">
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
            Artikel Tayang di Publik
          </p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {publishedArticles.length} <span className="text-xs font-normal text-stone-400">artikel</span>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-800/80">
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
            Galeri Rute Ekspedisi
          </p>
          <p className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-1">
            {ruteList.length} <span className="text-xs font-normal text-stone-400">rekam jejak</span>
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

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
        <button
          onClick={() => setActiveTab('kurasi')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'kurasi'
              ? 'bg-forest-700 text-white shadow-md shadow-forest-900/20'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          Kurasi Artikel Anggota ({articles.length})
        </button>
        <button
          onClick={() => setActiveTab('cms')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'cms'
              ? 'bg-forest-700 text-white shadow-md shadow-forest-900/20'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          Kelola Halaman Profil (CMS)
        </button>
        <button
          onClick={() => setActiveTab('ekspedisi')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'ekspedisi'
              ? 'bg-forest-700 text-white shadow-md shadow-forest-900/20'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          Rute & Ekspedisi ({ruteList.length})
        </button>
      </div>

      {/* TAB 1: KURASI ARTIKEL */}
      {activeTab === 'kurasi' && (
        <div className="rounded-3xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-800/80 overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Spinner size="lg" />
              <p className="text-xs text-stone-500">Memuat artikel...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="p-12 text-center text-stone-500">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold">Belum ada artikel yang masuk</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-stone-950/60 border-b border-stone-200 dark:border-stone-800 text-stone-500 uppercase font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Judul Artikel</th>
                    <th className="py-3.5 px-4">Penulis</th>
                    <th className="py-3.5 px-4">Kategori</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Tindakan Kurasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                  {articles.map((art) => (
                    <tr key={art.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                      <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-stone-100 max-w-sm">
                        {art.judul}
                        {art.slug && (
                          <span className="block text-[11px] font-mono text-stone-400 font-normal">
                            /{art.slug}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-stone-800 dark:text-stone-200">
                          {art.penulis_nama}
                        </span>
                        <span className="block text-[10px] text-stone-400">
                          {art.penulis_nia || 'Kader'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-[10px] capitalize">
                          {art.kategori.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            art.status === 'published'
                              ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
                              : art.status === 'review'
                              ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 animate-pulse'
                              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                          }`}
                        >
                          {art.status === 'published'
                            ? 'Tayang di Publik'
                            : art.status === 'review'
                            ? 'Menunggu Review'
                            : 'Draft'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                        <Button
                          size="sm"
                          onClick={() => openReviewModal(art)}
                          className="bg-forest-700 hover:bg-forest-800 text-white text-[11px] h-7 px-2.5"
                        >
                          <BookOpen className="w-3.5 h-3.5 mr-1" /> Review & Terbitkan
                        </Button>
                        {art.status === 'published' && (
                          <a
                            href={`/artikel/${art.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center text-forest-700 hover:text-forest-800 text-xs font-bold pl-2"
                          >
                            <Eye className="w-3.5 h-3.5" />
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
      )}

      {/* TAB 2: KELOLA KONTEN STATIS (CMS) */}
      {activeTab === 'cms' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {kontenList.map((item) => (
              <div
                key={item.slug}
                className="rounded-3xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-800/80 p-6 flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-500 font-bold">
                      slug: {item.slug}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      Update: {new Date(item.updated_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                    {item.judul}
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-4 leading-relaxed whitespace-pre-line">
                    {item.konten}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openCmsEdit(item)}
                  className="w-full text-xs font-bold gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Konten Ini
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: RUTE EKSPEDISI */}
      {activeTab === 'ekspedisi' && (
        <div className="rounded-3xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-800/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-stone-950/60 border-b border-stone-200 dark:border-stone-800 text-stone-500 uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Nama Ekspedisi</th>
                  <th className="py-3.5 px-4">Lokasi</th>
                  <th className="py-3.5 px-4">Tanggal</th>
                  <th className="py-3.5 px-4">Tim & Peserta</th>
                  <th className="py-3.5 px-4 text-center">Foto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                {ruteList.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                    <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-stone-100">
                      {r.nama}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 dark:text-stone-400">
                      {r.lokasi}
                    </td>
                    <td className="py-3.5 px-4 text-stone-500">
                      {r.tanggal || '–'}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 dark:text-stone-400 max-w-xs truncate">
                      {r.peserta}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-forest-700">
                        {r.foto?.length || 0} foto
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Review Artikel */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 md:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-forest-50 dark:bg-forest-950 text-forest-700 dark:text-forest-400">
                  Kurasi Tulisan Anggota
                </span>
                <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100 mt-1">
                  {selectedArticle.judul}
                </h3>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Penulis: {selectedArticle.penulis_nama} ({selectedArticle.penulis_nia || 'Kader'})
                </p>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Slug URL Publik
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewSlug}
                    onChange={(e) => setReviewSlug(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/30 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Kategori Tulisan
                  </label>
                  <select
                    value={reviewKategori}
                    onChange={(e: any) => setReviewKategori(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
                  >
                    <option value="laporan_ekspedisi">Laporan Ekspedisi</option>
                    <option value="tips">Tips & Panduan Alam</option>
                    <option value="berita">Berita Organisasi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Isi / Naskah Artikel
                </label>
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 font-serif leading-relaxed whitespace-pre-line max-h-64 overflow-y-auto">
                  {selectedArticle.konten}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedArticle(null)}
              >
                Batal
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={handleReject}
                className="text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                Kembalikan ke Draft
              </Button>
              <Button
                size="sm"
                disabled={isPending}
                onClick={handleApprove}
                className="bg-forest-700 hover:bg-forest-800 text-white font-bold"
              >
                {isPending ? <Spinner size="sm" /> : 'Setujui & Terbitkan ke Publik'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit CMS Profil */}
      {editingKonten && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 md:p-8 shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-500 font-bold">
                  slug: {editingKonten.slug}
                </span>
                <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100 mt-1">
                  Edit Konten Profil Organisasi
                </h3>
              </div>
              <button
                onClick={() => setEditingKonten(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCmsSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Judul Halaman
                </label>
                <input
                  type="text"
                  required
                  value={cmsJudul}
                  onChange={(e) => setCmsJudul(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Isi Teks Profil (Mendukung Markdown)
                </label>
                <textarea
                  rows={8}
                  required
                  value={cmsBody}
                  onChange={(e) => setCmsBody(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/30 font-serif leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingKonten(null)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending}
                  className="bg-forest-700 hover:bg-forest-800 text-white font-bold"
                >
                  {isPending ? <Spinner size="sm" /> : 'Simpan Konten Profil'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Rute Ekspedisi */}
      {isRuteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 md:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
                Tambah Catatan Rute Ekspedisi
              </h3>
              <button
                onClick={() => setIsRuteModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRute} className="mt-4 space-y-4 text-xs overflow-y-auto flex-1 pr-1">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Nama Ekspedisi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Mis. Ekspedisi Gua Bawah Tanah Sawarna"
                  value={ruteFormData.nama}
                  onChange={(e) => setRuteFormData({ ...ruteFormData, nama: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Lokasi Kawasan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Mis. Bayah, Lebak, Banten"
                  value={ruteFormData.lokasi}
                  onChange={(e) => setRuteFormData({ ...ruteFormData, lokasi: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Tanggal Kegiatan
                  </label>
                  <input
                    type="date"
                    value={ruteFormData.tanggal || ''}
                    onChange={(e) => setRuteFormData({ ...ruteFormData, tanggal: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Tim Partisipan
                  </label>
                  <input
                    type="text"
                    placeholder="Mis. Angkatan 32 (8 Org)"
                    value={ruteFormData.peserta}
                    onChange={(e) => setRuteFormData({ ...ruteFormData, peserta: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Deskripsi & Karakteristik Jalur
                </label>
                <textarea
                  rows={3}
                  placeholder="Catatan teknis medan, elevasi, grade jeram..."
                  value={ruteFormData.deskripsi}
                  onChange={(e) => setRuteFormData({ ...ruteFormData, deskripsi: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  URL Foto Galeri (1 link per baris)
                </label>
                <textarea
                  rows={2}
                  placeholder="https://..."
                  value={ruteFotoInput}
                  onChange={(e) => setRuteFotoInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/30 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRuteModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending}
                  className="bg-forest-700 hover:bg-forest-800 text-white font-bold"
                >
                  {isPending ? <Spinner size="sm" /> : 'Simpan Rute'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
