import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  UserCheck,
  Award,
  Compass,
  ShieldAlert,
  ArrowRight,
  ClipboardList,
} from 'lucide-react';

export default function AdminApprovalHubPage() {
  const approvalModules = [
    {
      title: 'Calon Anggota & Berkas',
      description: 'Verifikasi biodata calon siswa, surat persetujuan orang tua, dan formulir pendaftaran.',
      href: '/dashboard/admin/calon-siswa',
      icon: ClipboardList,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50',
    },
    {
      title: 'Tahap Siswa (Dewan Pengurus)',
      description: 'Kelola materi, evaluasi berkala, presensi sesi materi, dan keputusan lulus materi.',
      href: '/dashboard/admin/siswa',
      icon: Award,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50',
    },
    {
      title: 'Medan Operasi (Danlat)',
      description: 'Evaluasi lapangan individu & regu, pencatatan tes kesehatan, dan kelulusan Medan Operasi.',
      href: '/dashboard/admin/medan-operasi',
      icon: Compass,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50',
    },
    {
      title: 'Program PPNIA (Dewan Pengurus)',
      description: 'Verifikasi proposal ekspedisi mandiri, jadwal presentasi, dan evaluasi berkala calon anggota biasa.',
      href: '/dashboard/admin/ppnia',
      icon: ShieldAlert,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50',
    },
    {
      title: 'Sidang Akhir & Penerbitan NIA',
      description: 'Keputusan sidang pleno Dewan Pengurus, penetapan format NIA resmi, dan promosi Anggota Biasa.',
      href: '/dashboard/admin/nia',
      icon: ShieldCheck,
      color: 'text-forest-600 bg-forest-50 dark:bg-forest-950/50',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
          Pusat Persetujuan & Alur Kaderisasi
        </h1>
        <p className="text-xs md:text-sm text-stone-500 mt-1">
          Persetujuan tahapan anggota telah terintegrasi langsung pada masing-masing modul jenjang kaderisasi di bawah ini:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {approvalModules.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="p-5 rounded-3xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-800/80 hover:border-forest-400 dark:hover:border-forest-600 hover:shadow-lg transition-all group flex items-start justify-between"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl shrink-0 ${item.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 group-hover:text-forest-700 dark:group-hover:text-forest-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-forest-600 group-hover:translate-x-1 transition-all shrink-0 mt-3" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
