import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Calendar,
  User,
  ArrowLeft,
  Share2,
  Bookmark,
  Compass,
  Clock,
  ChevronRight,
  Shield,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getArticleBySlug, getPublicArticles } from '@/lib/actions/content';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: 'Artikel Tidak Ditemukan — Gandawesi' };

  return {
    title: `${article.judul} — Gandawesi FPTI UPI`,
    description: article.konten.slice(0, 160),
  };
}

export default async function PublicArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const related = (await getPublicArticles(article.kategori))
    .filter((a) => a.slug !== slug)
    .slice(0, 2);

  const dateFormatted = article.tanggal_publish
    ? new Date(article.tanggal_publish).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Belum dipublikasi';

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between gap-4 text-xs text-stone-500">
        <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-forest-600 transition-colors">
            Beranda
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <Link href="/artikel" className="hover:text-forest-600 transition-colors">
            Warta & Artikel
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-800 dark:text-stone-200 font-bold capitalize">
            {article.kategori.replace('_', ' ')}
          </span>
        </div>

        <Link href="/artikel">
          <Button variant="ghost" size="sm" className="text-xs gap-1.5 text-stone-600">
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali
          </Button>
        </Link>
      </div>

      {/* Article Header */}
      <div className="space-y-4">
        <span className="px-3 py-1 rounded-xl bg-forest-100 dark:bg-forest-950 text-forest-800 dark:text-forest-300 text-xs font-extrabold uppercase tracking-wide">
          {article.kategori === 'laporan_ekspedisi'
            ? 'Laporan Ekspedisi'
            : article.kategori === 'tips'
            ? 'Tips & Panduan'
            : 'Berita Organisasi'}
        </span>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight leading-tight">
          {article.judul}
        </h1>

        {/* Author & Meta Row */}
        <div className="flex items-center gap-4 py-3 border-y border-stone-200/80 dark:border-stone-800/80 text-xs text-stone-600 dark:text-stone-400">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-forest-800 text-white flex items-center justify-center font-bold text-sm">
              {article.penulis_nama?.charAt(0) || 'G'}
            </div>
            <div>
              <p className="font-bold text-stone-900 dark:text-stone-100">
                {article.penulis_nama}
              </p>
              <p className="text-[11px] text-stone-400">
                {article.penulis_nia || 'Kader Gandawesi'}
              </p>
            </div>
          </div>

          <span className="text-stone-300 dark:text-stone-700">•</span>

          <div className="flex items-center gap-1.5 text-stone-500">
            <Calendar className="w-3.5 h-3.5 text-forest-600" />
            <span>{dateFormatted}</span>
          </div>
        </div>
      </div>

      {/* Hero Cover Image */}
      {article.thumbnail && (
        <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-video w-full bg-stone-900">
          <img
            src={article.thumbnail}
            alt={article.judul}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article Body Content */}
      <div className="prose prose-stone dark:prose-invert max-w-none text-stone-800 dark:text-stone-200 text-sm md:text-base leading-relaxed space-y-5 whitespace-pre-line font-serif">
        {article.konten}
      </div>

      {/* Author Card */}
      <div className="p-6 rounded-3xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-forest-800 text-white flex items-center justify-center font-bold text-lg shrink-0">
          {article.penulis_nama?.charAt(0) || 'G'}
        </div>
        <div className="space-y-1">
          <p className="text-xs uppercase font-semibold text-stone-400 tracking-wider">
            Ditulis oleh
          </p>
          <h4 className="text-base font-bold text-stone-900 dark:text-stone-100">
            {article.penulis_nama}
          </h4>
          <p className="text-xs text-stone-500 leading-relaxed">
            Anggota resmi perhimpunan mahasiswa pecinta alam Gandawesi FPTI Universitas Pendidikan Indonesia.
          </p>
        </div>
      </div>

      {/* Related Articles */}
      {related.length > 0 && (
        <div className="pt-8 border-t border-stone-200 dark:border-stone-800 space-y-4">
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Catatan Terkait Lainnya
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {related.map((rel) => (
              <Link
                key={rel.id}
                href={`/artikel/${rel.slug}`}
                className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-forest-500 transition-all block group"
              >
                <p className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-forest-600 transition-colors line-clamp-2">
                  {rel.judul}
                </p>
                <p className="text-[11px] text-stone-400 mt-1">
                  Oleh {rel.penulis_nama}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
