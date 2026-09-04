import React from 'react';
import Link from 'next/link';
import { FileText, Sparkles, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminArtikelPlaceholderPage() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-forest-50 dark:bg-forest-950/60 border border-forest-200 dark:border-forest-800/80 flex items-center justify-center text-forest-700 dark:text-forest-400 mx-auto shadow-sm">
        <FileText className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-[11px] font-bold text-amber-800 dark:text-amber-300">
          <Clock className="w-3.5 h-3.5" /> Dijadwalkan untuk Sprint 10
        </div>
        <h1 className="text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
          Kurasi Artikel & Publikasi Konten
        </h1>
        <p className="text-xs md:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
          Modul kurasi tulisan anggota (draft artikel, review admin, penerbitan dengan kategori dan slug) serta pengelolaan profil organisasi akan aktif pada <strong>Sprint 10: Konten Publik & Artikel</strong>.
        </p>
      </div>

      <div className="pt-4">
        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="text-xs gap-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
