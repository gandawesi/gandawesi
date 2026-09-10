import type { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Mountain,
  BookOpen,
  Target,
  Shield,
  Award,
  ArrowRight,
  Building2,
  Calendar,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { APP_NAME, APP_SUBTITLE } from '@/lib/constants';
import { getKontenStatis } from '@/lib/actions/content';
import { fetchOrganizationAwards } from '@/lib/actions/governance';

export const metadata: Metadata = {
  title: 'Tentang Gandawesi — Sejarah, Visi, Misi & Kode Etik',
  description:
    'Profil lengkap organisasi mahasiswa pecinta alam Gandawesi Fakultas Pendidikan Teknologi dan Kejuruan (FPTI) Universitas Pendidikan Indonesia.',
};

export default async function TentangPage() {
  const [visiMisiData, sejarahData, orgAwards] = await Promise.all([
    getKontenStatis('visi-misi'),
    getKontenStatis('sejarah'),
    fetchOrganizationAwards(),
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

      {/* Prestasi & Rekognisi Lembaga (Institusional Awards) */}
      {orgAwards && orgAwards.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-stone-200 dark:border-stone-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> Rekognisi Mitra &amp; Apresiasi Kampus
                </span>
              </div>
              <h2 className="text-2xl font-black text-stone-900 dark:text-stone-100 font-mono mt-1">
                PRESTASI &amp; PENGHARGAAN LEMBAGA
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                Piagam kehormatan dan pengakuan resmi yang dianugerahkan oleh kementerian, balai konservasi, dan rektorat UPI kepada institusi Gandawesi.
              </p>
            </div>
            <Link
              href="/verifikasi/sertifikat"
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 shrink-0"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Portal Verifikasi Sertifikat
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orgAwards.map((award) => (
              <Card
                key={award.id}
                className="p-6 bg-gradient-to-br from-white via-amber-50/20 to-stone-50 dark:from-stone-900 dark:via-stone-900/90 dark:to-amber-950/10 border border-amber-200/60 dark:border-amber-900/30 hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> {award.jenis.split('—')[0].trim()}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-stone-400 font-mono">
                      <Calendar className="w-3 h-3" /> {award.tanggal_terbit}
                    </div>
                  </div>

                  <h3 className="text-base font-black text-stone-900 dark:text-stone-100 leading-snug">
                    {award.judul}
                  </h3>

                  {award.lembaga_penerbit && (
                    <div className="text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 bg-amber-50/80 dark:bg-amber-950/40 p-2 rounded-xl border border-amber-200/50 dark:border-amber-800/40">
                      <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{award.lembaga_penerbit}</span>
                    </div>
                  )}

                  {award.deskripsi && (
                    <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                      {award.deskripsi}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-stone-200/60 dark:border-stone-800 flex items-center justify-between gap-2 text-xs">
                  <span className="font-mono text-[10px] text-stone-500 bg-white dark:bg-stone-950 px-2 py-0.5 rounded border border-stone-200 dark:border-stone-800">
                    No: {award.nomor_sertifikat}
                  </span>
                  <Link
                    href={`/verifikasi/sertifikat?nomor=${encodeURIComponent(award.nomor_sertifikat)}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors"
                  >
                    <span>Cek Keabsahan</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

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
