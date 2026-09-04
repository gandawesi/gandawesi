import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Compass,
  Mountain,
  Shield,
  Users,
  Award,
  ArrowRight,
  CheckCircle2,
  TreePine,
  Sparkles,
  MapPin,
  Calendar,
} from 'lucide-react';
import { APP_NAME, APP_SUBTITLE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Gandawesi — Organisasi Mahasiswa Pecinta Alam FPTI UPI',
  description:
    'Portal resmi dan sistem informasi terpadu kaderisasi, keanggotaan, inventaris, dan ekspedisi Gandawesi FPTI Universitas Pendidikan Indonesia.',
};

export default function HomePage() {
  const kaderisasiStages = [
    {
      title: 'Calon Siswa',
      duration: '~1 Bulan',
      desc: 'Seleksi berkas, persetujuan wali, tes kesehatan awal, dan kesiapan fisik dasar.',
      badge: 'calon_siswa' as const,
    },
    {
      title: 'Tahap Siswa',
      duration: '~3 Bulan',
      desc: 'Bina jasmani rutin (2x/minggu), materi kelas, pengumpulan alat, dan post-test berkala.',
      badge: 'siswa' as const,
    },
    {
      title: 'Medan Operasi',
      duration: '~12 Hari',
      desc: 'Diklat aplikasi lapangan alam terbuka, evaluasi individu dan regu di bawah instruktur Danlat.',
      badge: 'medan_operasi' as const,
    },
    {
      title: 'Anggota Muda (PPNIA)',
      duration: '~1 Tahun',
      desc: 'Masa bakti pengabdian, presentasi pra/pasca ekspedisi, pendakian mandiri, dan evaluasi berkala.',
      badge: 'anggota_muda' as const,
    },
    {
      title: 'Anggota Biasa',
      duration: 'Resmi Bertugas',
      desc: 'Penerbitan Nomor Induk Anggota (NIA), hak suara organisasi, kepengurusan, dan KTA digital.',
      badge: 'anggota_biasa' as const,
    },
    {
      title: 'Anggota Luar Biasa',
      duration: 'Alumni Tetap',
      desc: 'Alumni Gandawesi yang berkontribusi sebagai pelatih, dewan penasehat, dan pembina generasi.',
      badge: 'anggota_luar_biasa' as const,
    },
  ];

  const pillars = [
    {
      icon: Mountain,
      title: 'Eksplorasi & Navigasi Darat',
      desc: 'Penguasaan teknik survival, manajemen perjalanan rimba gunung, navigasi peta kompas, dan keselamatan medan ekstrem.',
    },
    {
      icon: TreePine,
      title: 'Konservasi & Etika Alam Bebas',
      desc: 'Penerapan prinsip Zero Waste Mountaineering, pemulihan ekosistem hutan, dan kepedulian lingkungan hidup berkelanjutan.',
    },
    {
      icon: Shield,
      title: 'Kaderisasi Mental Tangguh',
      desc: 'Pembentukan disiplin, kepemimpinan lapang, resiliensi di bawah tekanan, dan komitmen pengabdian bermartabat.',
    },
    {
      icon: Users,
      title: 'Persaudaraan Seumur Hidup',
      desc: 'Ikatan persaudaraan lintas angkatan yang erat, didukung basis data terpusat dan tata kelola transparan.',
    },
  ];

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 lg:px-8 bg-topo-gradient">
        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          {/* Organization Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-forest-300/60 dark:border-forest-700/60 bg-white/80 dark:bg-forest-950/60 backdrop-blur-md shadow-xs">
            <span className="w-2 h-2 rounded-full bg-forest-600 animate-pulse" />
            <span className="text-xs font-semibold text-forest-800 dark:text-forest-300 font-mono tracking-wider">
              {APP_NAME} — {APP_SUBTITLE}
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-stone-950 dark:text-stone-50 leading-[1.15]">
            Membina Karakter Rimba,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-forest-700 via-emerald-600 to-amber-600">
              Menjaga Kelestarian Semesta
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed font-normal">
            Sistem informasi terpadu organisasi pecinta alam mahasiswa FPTI UPI.
            Mengelola alur kaderisasi berjenjang, pelacakan kompetensi, inventaris peralatan ekspedisi, dan direktori keanggotaan.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Link href="/daftar">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto shadow-lg shadow-forest-900/15"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Daftar Calon Siswa
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                Masuk ke Portal Anggota
              </Button>
            </Link>
            <Link href="/tentang">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto bg-white/60 dark:bg-stone-900/60 backdrop-blur-sm"
              >
                Profil & Sejarah
              </Button>
            </Link>
          </div>

          {/* Key Quick Stats */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl glass-card text-center">
              <p className="text-2xl sm:text-3xl font-bold font-mono text-forest-700 dark:text-forest-400">30+</p>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-medium">Angkatan Terbina</p>
            </div>
            <div className="p-4 rounded-2xl glass-card text-center">
              <p className="text-2xl sm:text-3xl font-bold font-mono text-forest-700 dark:text-forest-400">100%</p>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-medium">Digitalisasi Kaderisasi</p>
            </div>
            <div className="p-4 rounded-2xl glass-card text-center">
              <p className="text-2xl sm:text-3xl font-bold font-mono text-forest-700 dark:text-forest-400">6</p>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-medium">Jenjang Keanggotaan</p>
            </div>
            <div className="p-4 rounded-2xl glass-card text-center">
              <p className="text-2xl sm:text-3xl font-bold font-mono text-forest-700 dark:text-forest-400">FPTI UPI</p>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-medium">Bandung, Jawa Barat</p>
            </div>
          </div>
        </div>
      </section>

      {/* Kaderisasi Stages Showcase */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center space-y-3 mb-14">
          <Badge variant="success" size="md">
            Alur Perjalanan
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            6 Tahapan Kaderisasi Gandawesi
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 max-w-xl mx-auto">
            Setiap anggota melalui proses pembinaan terukur yang dirancang untuk membangun loyalitas, kemandirian ekspedisi, dan integritas kepemimpinan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kaderisasiStages.map((stage, idx) => (
            <Card key={stage.title} hoverEffect className="relative flex flex-col justify-between p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-stone-400">
                    0{idx + 1}
                  </span>
                  <Badge status={stage.badge} size="sm" />
                </div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  {stage.title}
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  {stage.desc}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
                <span>Durasi: {stage.duration}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-forest-600" />
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Organization Pillars */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-stone-100/50 dark:bg-[#0c1310] border-y border-stone-200/60 dark:border-stone-800/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Pilar & Nilai Utama Organisasi
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 max-w-lg mx-auto">
              Berlandaskan kode etik pecinta alam Indonesia serta disiplin keilmuan Fakultas Pendidikan Teknologi dan Kejuruan UPI.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="p-6 rounded-2xl bg-white dark:bg-[#111c16] border border-stone-200/80 dark:border-[#1e3026] shadow-xs space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-forest-100 dark:bg-forest-900/60 text-forest-700 dark:text-forest-300 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    {pillar.title}
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="rounded-3xl bg-gradient-to-r from-forest-900 via-forest-800 to-moss-900 text-white p-8 sm:p-12 shadow-xl relative overflow-hidden text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md text-forest-200 mx-auto flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight font-mono">
              Siap Bergabung atau Mengakses Data?
            </h3>
            <p className="text-xs sm:text-sm text-forest-200/90 leading-relaxed">
              Masuk ke akun untuk melihat jadwal bina jasmani, catatan tes kesehatan, status nomor induk (NIA), dan peminjaman inventaris.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/daftar">
              <Button
                variant="primary"
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg"
              >
                Daftar Calon Siswa Baru
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-forest-900 hover:bg-forest-50"
              >
                Buka Portal Gandawesi
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
