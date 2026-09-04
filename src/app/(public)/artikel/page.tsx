import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  FileText,
  Calendar,
  User,
  ArrowRight,
  Compass,
  Bookmark,
  Sparkles,
  Search,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getPublicArticles } from '@/lib/actions/content';

export const metadata: Metadata = {
  title: 'Warta & Laporan Ekspedisi — Gandawesi FPTI UPI',
  description:
    'Kumpulan catatan ekspedisi alam bebas, warta kegiatan organisasi, dan tips panduan berkegiatan di alam terbuka dari perhimpunan mahasiswa pecinta alam Gandawesi FPTI UPI.',
};

export default async function PublicArtikelPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const params = await searchParams;
  const activeKategori = params.kategori || 'all';
  const articles = await getPublicArticles(activeKategori);

  const featured = articles[0];
  const list = articles.slice(1);

  const kategoriTabs = [
    { label: 'Semua Tulisan', val: 'all' },
    { label: 'Laporan Ekspedisi', val: 'laporan_ekspedisi' },
    { label: 'Tips & Panduan', val: 'tips' },
    { label: 'Berita Organisasi', val: 'berita' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 dark:bg-forest-950/60 border border-forest-200 dark:border-forest-800 text-xs font-bold text-forest-800 dark:text-forest-300">
          <FileText className="w-3.5 h-3.5" /> Jurnal & Publikasi Alam Terbuka
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100 font-mono">
          WARTA & REKAM JEJAK
        </h1>
        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed">
          Catatan penjelajahan rimba gunung, penelusuran gua, olahraga arus deras, serta warta resmi pengabdian konservasi civitas akademika Gandawesi.
        </p>
      </div>

      {/* Featured Article Card */}
      {featured && (
        <div className="relative rounded-3xl overflow-hidden bg-white/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800/80 shadow-xl group transition-all">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            <div className="lg:col-span-7 relative min-h-[280px] lg:min-h-[420px] overflow-hidden bg-stone-900">
              <img
                src={featured.thumbnail || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'}
                alt={featured.judul}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:hidden" />
            </div>

            <div className="lg:col-span-5 p-6 md:p-8 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-forest-100 dark:bg-forest-950 text-forest-800 dark:text-forest-300 text-xs font-extrabold tracking-wide uppercase">
                    {featured.kategori === 'laporan_ekspedisi'
                      ? 'Laporan Ekspedisi'
                      : featured.kategori === 'tips'
                      ? 'Tips & Panduan'
                      : 'Berita Organisasi'}
                  </span>
                  <span className="text-[11px] text-stone-400 font-medium">Artikel Unggulan</span>
                </div>

                <h2 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-100 group-hover:text-forest-700 dark:group-hover:text-forest-400 transition-colors leading-snug">
                  <Link href={`/artikel/${featured.slug}`}>
                    {featured.judul}
                  </Link>
                </h2>

                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 line-clamp-3 leading-relaxed">
                  {featured.konten}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-forest-800 text-white flex items-center justify-center font-bold text-xs">
                    {featured.penulis_nama?.charAt(0) || 'G'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      {featured.penulis_nama}
                    </p>
                    <p className="text-[10px] text-stone-400">
                      {featured.penulis_nia || 'Kader Gandawesi'}
                    </p>
                  </div>
                </div>

                <Link href={`/artikel/${featured.slug}`}>
                  <Button size="sm" className="bg-forest-700 hover:bg-forest-800 text-white gap-1.5 text-xs">
                    Baca Catatan <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {kategoriTabs.map((tab) => {
          const isActive = activeKategori === tab.val;
          return (
            <Link
              key={tab.val}
              href={tab.val === 'all' ? '/artikel' : `/artikel?kategori=${tab.val}`}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-forest-700 text-white shadow-md shadow-forest-900/20'
                  : 'bg-white/80 dark:bg-stone-900/80 text-stone-600 dark:text-stone-400 border border-stone-200/80 dark:border-stone-800/80 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Grid of Articles */}
      {articles.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-stone-200 dark:border-stone-800 bg-white/40 dark:bg-stone-900/40">
          <FileText className="w-12 h-12 text-stone-400 mx-auto mb-3 opacity-60" />
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
            Belum ada tulisan di kategori ini
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Silakan pilih tab kategori lain untuk membaca artikel menarik lainnya.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((item) => {
            const dateFormatted = item.tanggal_publish
              ? new Date(item.tanggal_publish).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Baru saja';

            return (
              <div
                key={item.id}
                className="rounded-3xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-800/80 overflow-hidden hover:border-forest-400/50 dark:hover:border-forest-600/50 hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Thumbnail Cover */}
                  <div className="relative h-48 w-full bg-stone-900 overflow-hidden">
                    <img
                      src={item.thumbnail || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'}
                      alt={item.judul}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white border border-white/20 text-[10px] font-bold uppercase tracking-wider">
                        {item.kategori === 'laporan_ekspedisi'
                          ? 'Ekspedisi'
                          : item.kategori === 'tips'
                          ? 'Tips'
                          : 'Berita'}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center gap-2 text-[11px] text-stone-400">
                      <Calendar className="w-3.5 h-3.5 text-forest-600" />
                      <span>{dateFormatted}</span>
                    </div>

                    <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 group-hover:text-forest-700 dark:group-hover:text-forest-400 transition-colors line-clamp-2">
                      <Link href={`/artikel/${item.slug}`}>
                        {item.judul}
                      </Link>
                    </h3>

                    <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-3 leading-relaxed">
                      {item.konten}
                    </p>
                  </div>
                </div>

                {/* Footer Meta */}
                <div className="p-5 pt-0 mt-2 flex items-center justify-between border-t border-stone-100 dark:border-stone-800/80 pt-4">
                  <div className="text-[11px] text-stone-500">
                    Penulis: <strong className="text-stone-700 dark:text-stone-300">{item.penulis_nama}</strong>
                  </div>

                  <Link
                    href={`/artikel/${item.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-forest-700 dark:text-forest-400 hover:text-forest-800 group-hover:translate-x-0.5 transition-transform"
                  >
                    Baca <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
