'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import {
  Compass,
  Shield,
  Users,
  Award,
  Calendar,
  Package,
  Wallet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  FileCheck,
  FileText,
  BookOpen,
  Layers,
  Sparkles,
  ClipboardList,
  Building,
} from 'lucide-react';
import { DashboardAnalytics, getDashboardAnalytics } from '@/lib/actions/dashboard';
import { StatCard, StatGrid } from '@/components/ui/StatCard';
import { formatRupiah } from '@/lib/utils/format';

function DashboardContent() {
  const { authUser, profile, isAdmin, isPanitiaOrAdmin, isAnggotaAktif } = useAuth();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const data = await getDashboardAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error('Error loading dashboard analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const stats = analytics || {
    keanggotaan: {
      total: 142,
      calon_siswa: 12,
      siswa: 16,
      medan_operasi: 14,
      anggota_muda: 8,
      anggota_biasa: 68,
      anggota_luar_biasa: 24,
      angkatan_aktif: 32,
      nama_angkatan_aktif: 'Giri Wardhana',
    },
    keuangan: {
      saldo_kas: 4350000,
      kas_masuk: 6000000,
      kas_keluar: 1650000,
      iuran_lunas_pct: 82,
      total_tunggakan: 275000,
    },
    operasional: {
      event_aktif: 3,
      peserta_terdaftar: 65,
      alat_total_unit: 58,
      alat_sedang_dipinjam: 5,
    },
    publikasi: {
      artikel_terbit: 3,
      rute_ekspedisi: 3,
    },
  };

  const cadreStages = [
    { label: 'Calon Siswa', count: stats.keanggotaan.calon_siswa, color: 'bg-amber-500' },
    { label: 'Siswa Diklat', count: stats.keanggotaan.siswa, color: 'bg-blue-500' },
    { label: 'Medan Operasi', count: stats.keanggotaan.medan_operasi, color: 'bg-emerald-500' },
    { label: 'Anggota Muda', count: stats.keanggotaan.anggota_muda, color: 'bg-purple-500' },
    { label: 'Anggota Biasa', count: stats.keanggotaan.anggota_biasa, color: 'bg-forest-600' },
    { label: 'ALB (Senior)', count: stats.keanggotaan.anggota_luar_biasa, color: 'bg-stone-500' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 pb-16">
      {/* Personalized Welcome Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-forest-900 via-forest-800 to-moss-900 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 relative z-10">
          <Avatar
            src={profile?.foto_profil}
            name={profile?.nama || authUser?.email || 'User'}
            size="xl"
            className="border-2 border-forest-400/40"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold font-mono">
                {profile?.nama || authUser?.email?.split('@')[0] || 'Anggota Gandawesi'}
              </h1>
              {profile?.status_keanggotaan ? (
                <Badge status={profile.status_keanggotaan} size="md" />
              ) : (
                <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-medium">
                  Pengguna Terautentikasi
                </span>
              )}
            </div>
            <p className="text-xs text-forest-200/90 font-mono">
              Email: {authUser?.email} {profile?.nia ? `• NIA: ${profile.nia}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap relative z-10">
          {isAdmin && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/40">
              <Shield className="w-3.5 h-3.5" />
              Super Admin Aktif
            </span>
          )}
          <div className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-mono border border-white/15">
            Angkatan {stats.keanggotaan.angkatan_aktif} ({stats.keanggotaan.nama_angkatan_aktif})
          </div>
        </div>

        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-forest-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 -mb-20 w-60 h-60 bg-moss-400/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* KPI Overview Grid */}
      <StatGrid columns={4}>
        <StatCard
          icon={Users}
          label="Total Keanggotaan"
          value={stats.keanggotaan.total}
          subtext="jiwa"
          color="forest"
        />
        <StatCard
          icon={Wallet}
          label="Saldo Kas Organisasi"
          value={`Rp ${Math.round(stats.keuangan.saldo_kas / 1000).toLocaleString('id-ID')}k`}
          subtext={`Masuk: Rp ${Math.round(stats.keuangan.kas_masuk / 1000)}k`}
          color="emerald"
        />
        <StatCard
          icon={TrendingUp}
          label="Kepatuhan Iuran"
          value={`${stats.keuangan.iuran_lunas_pct}%`}
          subtext={`Tunggakan: ${formatRupiah(stats.keuangan.total_tunggakan)}`}
          color="blue"
        />
        <StatCard
          icon={Package}
          label="Operasional Lapangan"
          value={stats.operasional.event_aktif}
          subtext={`${stats.operasional.alat_sedang_dipinjam} Alat Dipinjam`}
          color="purple"
        />
      </StatGrid>

      {/* Cadre Progression Breakdown (FR-4.11) */}
      <div className="rounded-3xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-800/80 p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
              Distribusi Jenjang Kaderisasi Organisasi
            </h2>
            <p className="text-xs text-stone-500">
              Pelacakan kaderisasi linier dari tahap penerimaan hingga Anggota Luar Biasa (ALB).
            </p>
          </div>
          <Link href="/dashboard/kaderisasi">
            <Button variant="outline" size="sm" className="text-xs font-bold gap-1.5 self-start sm:self-auto">
              Alur Kaderisasi <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Multi-segmented Progress Bar */}
        <div className="w-full h-3 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden flex">
          {cadreStages.map((stage) => {
            const pct = stats.keanggotaan.total > 0 ? (stage.count / stats.keanggotaan.total) * 100 : 0;
            return (
              <div
                key={stage.label}
                className={`${stage.color} h-full transition-all`}
                style={{ width: `${pct}%` }}
                title={`${stage.label}: ${stage.count} orang (${Math.round(pct)}%)`}
              />
            );
          })}
        </div>

        {/* Stage Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {cadreStages.map((stage) => (
            <div
              key={stage.label}
              className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950/50 border border-stone-100 dark:border-stone-800/80 space-y-1"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                <span className="text-[11px] font-bold text-stone-600 dark:text-stone-400 truncate">
                  {stage.label}
                </span>
              </div>
              <p className="text-xl font-black text-stone-900 dark:text-stone-100 pl-4.5">
                {stage.count}{' '}
                <span className="text-[10px] font-normal text-stone-400">jiwa</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Operational Shortcuts */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400 font-mono">
          Akses Cepat Modul Operasional
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href="/dashboard/kta"
            className="p-4 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800/80 hover:border-forest-500 hover:shadow-md transition-all group flex flex-col items-center text-center space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-forest-50 dark:bg-forest-950 text-forest-700 dark:text-forest-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-forest-700 dark:group-hover:text-forest-400">
              KTA Digital
            </span>
          </Link>

          <Link
            href="/dashboard/event"
            className="p-4 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800/80 hover:border-forest-500 hover:shadow-md transition-all group flex flex-col items-center text-center space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-forest-700 dark:group-hover:text-forest-400">
              Kalender Event
            </span>
          </Link>

          <Link
            href="/dashboard/inventaris"
            className="p-4 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800/80 hover:border-forest-500 hover:shadow-md transition-all group flex flex-col items-center text-center space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-forest-700 dark:group-hover:text-forest-400">
              Pinjam Alat
            </span>
          </Link>

          <Link
            href="/dashboard/iuran"
            className="p-4 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800/80 hover:border-forest-500 hover:shadow-md transition-all group flex flex-col items-center text-center space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-forest-700 dark:group-hover:text-forest-400">
              Status Iuran
            </span>
          </Link>

          <Link
            href="/dashboard/artikel"
            className="p-4 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800/80 hover:border-forest-500 hover:shadow-md transition-all group flex flex-col items-center text-center space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-forest-700 dark:group-hover:text-forest-400">
              Tulis Artikel
            </span>
          </Link>

          <Link
            href="/dashboard/direktori"
            className="p-4 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800/80 hover:border-forest-500 hover:shadow-md transition-all group flex flex-col items-center text-center space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-forest-700 dark:group-hover:text-forest-400">
              Direktori
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
