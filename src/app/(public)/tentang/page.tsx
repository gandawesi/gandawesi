import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Compass,
  Mountain,
  BookOpen,
  Target,
  Shield,
  Award,
  Users,
  ArrowRight,
} from 'lucide-react';
import { APP_NAME, APP_SUBTITLE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Tentang Gandawesi — Sejarah, Visi, Misi & Kode Etik',
  description:
    'Profil lengkap organisasi mahasiswa pecinta alam Gandawesi Fakultas Pendidikan Teknologi dan Kejuruan (FPTI) Universitas Pendidikan Indonesia.',
};

export default function TentangPage() {
  const visi =
    'Menjadi organisasi mahasiswa pecinta alam yang unggul, berintegritas tinggi, berdaya saing dalam eksplorasi alam terbuka, serta konsisten dalam melestarikan lingkungan hidup demi peradaban manusia yang harmonis dengan alam.';

  const misi = [
    'Menyelenggarakan pendidikan kaderisasi berjenjang yang disiplin, aman, dan berstandar keselamatan tinggi.',
    'Mengembangkan kecakapan navigasi darat, rimba gunung, survival, dan manajemen ekspedisi bagi seluruh anggota.',
    'Melaksanakan program konservasi sumber daya alam, rehabilitasi hutan, dan edukasi lingkungan di masyarakat.',
    'Membangun jejaring persaudaraan yang solid antaranggota, almamater FPTI UPI, dan perhimpunan pecinta alam se-Indonesia.',
    'Menjunjung tinggi kode etik pecinta alam Indonesia dan nama baik almamater Universitas Pendidikan Indonesia.',
  ];

  const kodeEtik = [
    'Pecinta Alam Indonesia sadar bahwa alam beserta isinya adalah ciptaan Tuhan Yang Maha Esa.',
    'Pecinta Alam Indonesia sebagai bagian dari masyarakat Indonesia sadar akan tanggung jawabnya kepada Tuhan, bangsa, dan tanah air.',
    'Pecinta Alam Indonesia sadar bahwa segenap pecinta alam adalah saudara sebagai sesama makhluk yang mencintai alam sebagai ciptaan Yang Maha Esa.',
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="success" size="md">
          Profil Organisasi
        </Badge>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100 font-mono">
          MENGENAL {APP_NAME}
        </h1>
        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed">
          {APP_SUBTITLE} — Wadah petualangan, pembinaan mental, dan pengabdian konservasi mahasiswa UPI di bumi nusantara.
        </p>
      </div>

      {/* Visi & Misi Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card glass className="p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-forest-800 text-white flex items-center justify-center shadow-md">
            <Target className="w-6 h-6 text-forest-200" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 font-mono">
            Visi Organisasi
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
            {visi}
          </p>
        </Card>

        <Card glass className="p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-forest-800 text-white flex items-center justify-center shadow-md">
            <BookOpen className="w-6 h-6 text-forest-200" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 font-mono">
            Misi Organisasi
          </h2>
          <ul className="space-y-2.5 text-xs sm:text-sm text-stone-600 dark:text-stone-300">
            {misi.map((m, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-forest-100 dark:bg-forest-950 text-forest-700 text-xs font-bold shrink-0 flex items-center justify-center mt-0.5">
                  {idx + 1}
                </span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Sejarah Singkat */}
      <Card className="p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest-100 dark:bg-forest-900 text-forest-700 dark:text-forest-300 flex items-center justify-center">
            <Mountain className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 font-mono">
            Sejarah & Semangat Gandawesi
          </h2>
        </div>
        <div className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 space-y-3 leading-relaxed">
          <p>
            Gandawesi lahir dari semangat kebersamaan para mahasiswa Fakultas Pendidikan Teknologi dan Kejuruan (FPTI) Universitas Pendidikan Indonesia yang memiliki panggilan jiwa untuk menjelajahi keindahan alam nusantara sekaligus menempa diri dalam kerasnya alam terbuka.
          </p>
          <p>
            Nama <strong>Gandawesi</strong> melambangkan kekuatan karakter sekeras besi yang dipadukan dengan kepekaan dan kearifan menjaga keseimbangan alam. Lebih dari tiga dekade perjalanan, Gandawesi telah melahirkan puluhan angkatan kader pecinta alam yang aktif berkontribusi di bidang kepetualangan, pendidikan, penelitian lingkungan, serta Search and Rescue (SAR).
          </p>
          <p>
            Tradisi kaderisasi kami dirawat secara ketat: dari tahap Calon Siswa, masa penggemblengan Siswa, ujian kelayakan lapangan Medan Operasi, pengabdian satu tahun PPNIA, hingga penganugerahan Nomor Induk Anggota (NIA) resmi bagi Anggota Biasa.
          </p>
        </div>
      </Card>

      {/* Kode Etik Pecinta Alam */}
      <Card className="p-8 bg-forest-900 text-white rounded-3xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 text-forest-200 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold font-mono tracking-wider text-forest-100">
            Kode Etik Pecinta Alam Indonesia
          </h2>
        </div>
        <div className="space-y-4 text-xs sm:text-sm text-forest-100/90 leading-relaxed">
          {kodeEtik.map((point, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="font-bold text-forest-300 font-mono text-sm">{index + 1}.</span>
              <p>{point}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Bottom CTA */}
      <div className="text-center pt-4">
        <Link href="/login">
          <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Masuk ke Portal Anggota
          </Button>
        </Link>
      </div>
    </div>
  );
}
