import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
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
  Sparkles,
} from 'lucide-react';
import { APP_NAME, APP_SUBTITLE } from '@/lib/constants';
import { getKontenStatis } from '@/lib/actions/content';

export const metadata: Metadata = {
  title: 'Tentang Gandawesi — Sejarah, Visi, Misi & Kode Etik',
  description:
    'Profil lengkap organisasi mahasiswa pecinta alam Gandawesi Fakultas Pendidikan Teknologi dan Kejuruan (FPTI) Universitas Pendidikan Indonesia.',
};

export default async function TentangPage() {
  const [visiMisiData, sejarahData] = await Promise.all([
    getKontenStatis('visi-misi'),
    getKontenStatis('sejarah'),
  ]);

  const defaultVisi =
    'Menjadi organisasi mahasiswa pecinta alam yang unggul, berintegritas tinggi, berdaya saing dalam eksplorasi alam terbuka, serta konsisten dalam melestarikan lingkungan hidup demi peradaban manusia yang harmonis dengan alam.';

  const defaultMisi = [
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
    'Pecinta Alam Indonesia merasa terpanggil untuk melestarikan alam beserta isinya serta menggunakan sumber daya alam secara bijaksana.',
    'Pecinta Alam Indonesia menyatakan bahwa pengabdian kepada alam adalah sarana pengabdian kepada Tuhan, bangsa, dan tanah air.',
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
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line">
            {visiMisiData?.konten ? visiMisiData.konten.split('### Misi')[0].replace('### Visi', '').trim() : defaultVisi}
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
            {defaultMisi.map((m, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-forest-100 dark:bg-forest-900 text-forest-800 dark:text-forest-200 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Sejarah Perjalanan */}
      <Card glass className="p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest-800 text-white flex items-center justify-center">
            <Mountain className="w-5 h-5 text-forest-200" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 font-mono">
              Sejarah & Nilai Dasar Gandawesi
            </h2>
            <p className="text-xs text-stone-500">
              Lebih dari tiga dekade mengabdi untuk kelestarian alam nusantara
            </p>
          </div>
        </div>

        <div className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed space-y-4 whitespace-pre-line">
          {sejarahData?.konten || `Gandawesi didirikan di lingkungan Fakultas Pendidikan Teknologi dan Kejuruan (FPTK / FPTI) Universitas Pendidikan Indonesia (UPI) Bandung oleh para mahasiswa pecinta rimba yang terpanggil untuk mengintegrasikan keilmuan keteknikan dan kecintaan mendalam terhadap kelestarian alam nusantara.

Nama "Gandawesi" melambangkan ketangguhan jiwa layaknya wesi (besi) dan keharuman budi pekerti (ganda) dalam mengarungi belantara, mendaki puncak gunung tertinggi, menelusuri lorong terdalam bumi, serta mengarungi jeram sungai terderas di Indonesia.

Hingga saat ini, Gandawesi telah melahirkan lebih dari 32 angkatan resmi yang mengabdi di berbagai bidang kepecintaalaman, riset lingkungan, mitigasi bencana, dan pemetaan geografis.`}
        </div>
      </Card>

      {/* Kode Etik Pecinta Alam */}
      <div className="rounded-3xl bg-forest-950 text-white p-8 md:p-10 space-y-6 border border-forest-900 shadow-xl">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-forest-400" />
          <h2 className="text-xl font-bold font-mono tracking-wider text-forest-100">
            KODE ETIK PECINTA ALAM INDONESIA
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-forest-200/90 leading-relaxed">
          {kodeEtik.map((etik, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-forest-900/50 border border-forest-800/60">
              <span className="font-mono font-bold text-forest-400 shrink-0">0{idx + 1}.</span>
              <p>{etik}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Call to action */}
      <div className="text-center space-y-4 pt-4">
        <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 font-mono">
          Tertarik Bergabung dengan Keluarga Besar Gandawesi?
        </h3>
        <div className="flex items-center justify-center gap-3">
          <Link href="/daftar">
            <Button size="md" className="bg-forest-800 hover:bg-forest-900 text-white gap-2 font-bold text-xs">
              Daftar Calon Siswa Diklat <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/ekspedisi">
            <Button variant="outline" size="md" className="text-xs font-bold">
              Lihat Rekam Jejak Ekspedisi
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
