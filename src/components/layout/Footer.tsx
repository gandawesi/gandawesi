import React from 'react';
import Link from 'next/link';
import { Compass, MapPin, Mail, ShieldAlert, Mountain } from 'lucide-react';
import { APP_NAME, APP_SUBTITLE } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="border-t border-stone-200/60 dark:border-stone-800/60 bg-white/40 dark:bg-[#070b09]/60 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Identity */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-forest-800 text-white flex items-center justify-center shadow-sm">
                <Mountain className="w-5 h-5 text-forest-200" />
              </div>
              <div>
                <h4 className="font-bold text-base text-stone-900 dark:text-stone-100 font-mono tracking-wider">
                  {APP_NAME}
                </h4>
                <p className="text-xs text-forest-700 dark:text-forest-400 font-medium">
                  {APP_SUBTITLE}
                </p>
              </div>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed max-w-md">
              Wadah pembinaan karakter, kecintaan alam, dan kepemimpinan mahasiswa FPTI UPI
              melalui alur kaderisasi berjenjang, kegiatan konservasi, dan ekspedisi alam bebas.
            </p>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <MapPin className="w-4 h-4 text-forest-600 shrink-0" />
              <span>Sekretariat Gandawesi, Kampus FPTI Universitas Pendidikan Indonesia, Bandung</span>
            </div>
          </div>

          {/* Col 2: Alur & Navigasi */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 mb-3">
              Kaderisasi
            </h5>
            <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-400">
              <li>
                <Link href="/daftar" className="hover:text-forest-600 transition-colors">
                  Pendaftaran Calon Siswa
                </Link>
              </li>
              <li>
                <Link href="/artikel" className="hover:text-forest-600 transition-colors">
                  Warta & Laporan Ekspedisi
                </Link>
              </li>
              <li>
                <Link href="/ekspedisi" className="hover:text-forest-600 transition-colors">
                  Galeri Peta Rute Alam
                </Link>
              </li>
              <li>
                <Link href="/donasi" className="hover:text-forest-600 transition-colors">
                  Sponsorship & Donasi
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal & Akun */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 mb-3">
              Sistem Informasi
            </h5>
            <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-400">
              <li>
                <Link href="/login" className="hover:text-forest-600 transition-colors">
                  Masuk Portal Anggota
                </Link>
              </li>
              <li>
                <Link href="/tentang" className="hover:text-forest-600 transition-colors">
                  Tentang Organisasi
                </Link>
              </li>
              <li>
                <Link href="/dashboard/direktori" className="hover:text-forest-600 transition-colors">
                  Direktori Anggota
                </Link>
              </li>
              <li className="flex items-center gap-1.5 text-forest-700 dark:text-forest-400 font-medium pt-1">
                <Compass className="w-3.5 h-3.5" />
                <span>Eksplorasi Lestari</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-stone-200/60 dark:border-stone-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} Gandawesi FPTI UPI. Seluruh hak cipta dilindungi.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="inline-flex items-center gap-1 text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sistem Aktif (Next.js 15 & Supabase)
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
