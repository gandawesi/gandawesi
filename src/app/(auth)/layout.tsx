import React from 'react';
import Link from 'next/link';
import { Compass, ArrowLeft } from 'lucide-react';
import { APP_NAME, APP_SUBTITLE } from '@/lib/constants';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-topo-gradient relative overflow-hidden">
      {/* Top bar with back to home */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-forest-800 text-white flex items-center justify-center">
            <Compass className="w-4 h-4 text-forest-200" />
          </div>
          <span className="font-bold text-xs font-mono tracking-wider text-stone-800 dark:text-stone-200">
            {APP_NAME}
          </span>
        </div>
      </div>

      {/* Auth Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Subtle bottom copyright */}
      <div className="py-4 text-center text-[11px] text-stone-400 z-10">
        {APP_NAME} — {APP_SUBTITLE}
      </div>
    </div>
  );
}
