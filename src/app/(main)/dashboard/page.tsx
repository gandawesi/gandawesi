'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import {
  Compass,
  Shield,
  Users,
  Award,
  Calendar,
  Package,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  Lock,
  Server,
  FileSpreadsheet,
} from 'lucide-react';
import { USER_ROLE_LABELS } from '@/lib/constants';

function DashboardContent() {
  const { authUser, profile, roles, isAdmin, isPanitiaOrAdmin, isAnggotaAktif } = useAuth();

  const isSupabaseConfigured =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

  const readinessChecklist = [
    {
      label: 'Fondasi Next.js 15 (App Router & SSR)',
      status: 'complete',
      desc: 'TypeScript, Tailwind CSS v4, dan struktur project modular aktif.',
    },
    {
      label: 'Desain Sistem & Navigasi Terpadu',
      status: 'complete',
      desc: 'Palet alam rimba gunung, sidebar adaptif, dan responsif mobile.',
    },
    {
      label: 'Skema Database Gandawesi (29 Tabel)',
      status: 'ready',
      desc: 'Tersedia di docs/schema-gandawesi.sql siap dijalankan di Supabase SQL Editor.',
    },
    {
      label: 'Row Level Security (13 Kebijakan RLS)',
      status: 'ready',
      desc: 'Tersedia di docs/rls-policy-gandawesi.sql untuk proteksi PII dan hak akses.',
    },
    {
      label: 'Koneksi Supabase & Google OAuth',
      status: isSupabaseConfigured ? 'complete' : 'pending',
      desc: isSupabaseConfigured
        ? 'Terhubung dengan endpoint Supabase live.'
        : 'Silakan masukkan NEXT_PUBLIC_SUPABASE_URL & ANON_KEY di file .env.local.',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Greeting Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-forest-900 via-forest-800 to-moss-900 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
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

        <div className="flex items-center gap-2 flex-wrap">
          {isAdmin && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/40">
              <Shield className="w-3.5 h-3.5" />
              Super Admin Aktif
            </span>
          )}
          {roles.map((r) => (
            <span
              key={r}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-forest-700/60 text-forest-200 text-xs font-medium border border-forest-600/40"
            >
              {USER_ROLE_LABELS[r] || r}
            </span>
          ))}
        </div>
      </div>

      {/* Admin Quick Control Hub */}
      {(isAdmin || isPanitiaOrAdmin) && (
        <Card className="border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-600" />
                <CardTitle className="text-base text-amber-900 dark:text-amber-200">
                  Panel Kendali Pengurus & Administrator
                </CardTitle>
              </div>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                Sprint 0–11 Hub
              </span>
            </div>
            <CardDescription className="text-xs">
              Akses cepat ke titik-titik persetujuan kaderisasi dan administrasi operasional Gandawesi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-white dark:bg-[#111914] border border-amber-200/60 dark:border-amber-900/40">
                <p className="text-[11px] text-stone-500 font-medium">Calon Siswa Masuk</p>
                <p className="text-lg font-bold font-mono text-stone-900 dark:text-stone-100 mt-1">0</p>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-[#111914] border border-amber-200/60 dark:border-amber-900/40">
                <p className="text-[11px] text-stone-500 font-medium">Siswa Aktif</p>
                <p className="text-lg font-bold font-mono text-stone-900 dark:text-stone-100 mt-1">0</p>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-[#111914] border border-amber-200/60 dark:border-amber-900/40">
                <p className="text-[11px] text-stone-500 font-medium">Alat Terpinjam</p>
                <p className="text-lg font-bold font-mono text-stone-900 dark:text-stone-100 mt-1">0</p>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-[#111914] border border-amber-200/60 dark:border-amber-900/40">
                <p className="text-[11px] text-stone-500 font-medium">Saldo Kas Umum</p>
                <p className="text-lg font-bold font-mono text-stone-900 dark:text-stone-100 mt-1">Rp 0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Module 1: Direktori Anggota */}
        <Card hoverEffect className="flex flex-col justify-between">
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-forest-50 dark:bg-forest-950 text-forest-700 dark:text-forest-400 flex items-center justify-center mb-2">
              <Users className="w-5 h-5" />
            </div>
            <CardTitle>Direktori Anggota</CardTitle>
            <CardDescription>
              Akses daftar anggota per angkatan dan status keanggotaan melalui secure view terproteksi (PII aman).
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-forest-700 dark:text-forest-400">
              Sprint 1 Ready <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </CardContent>
        </Card>

        {/* Module 2: Alur Kaderisasi */}
        <Card hoverEffect className="flex flex-col justify-between">
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-forest-50 dark:bg-forest-950 text-forest-700 dark:text-forest-400 flex items-center justify-center mb-2">
              <Award className="w-5 h-5" />
            </div>
            <CardTitle>Tracking Kaderisasi</CardTitle>
            <CardDescription>
              Presensi bina jasmani, post-test materi HP-friendly, catatan kesehatan, dan evaluasi lapangan Danlat.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-forest-700 dark:text-forest-400">
              Sprint 2–6 Ready <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </CardContent>
        </Card>

        {/* Module 3: Keuangan & Iuran */}
        <Card hoverEffect className="flex flex-col justify-between">
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-forest-50 dark:bg-forest-950 text-forest-700 dark:text-forest-400 flex items-center justify-center mb-2">
              <Wallet className="w-5 h-5" />
            </div>
            <CardTitle>Keuangan & Iuran</CardTitle>
            <CardDescription>
              Tagihan bulanan otomatis via RPC, transparansi saldo kas, dan pencatatan RAB event terstruktur.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-forest-700 dark:text-forest-400">
              Sprint 8 Ready <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Sprint 0 Technical Readiness Checklist */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-forest-700" />
            <CardTitle>Status Kesiapan Fondasi Sistem (Sprint 0)</CardTitle>
          </div>
          <CardDescription>
            Dokumentasi komponen teknis yang telah diinisialisasi dan siap diintegrasikan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {readinessChecklist.map((item) => (
              <div
                key={item.label}
                className="flex items-start justify-between p-3.5 rounded-2xl bg-stone-50 dark:bg-[#121c17] border border-stone-200/60 dark:border-stone-800/60 gap-4"
              >
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    {item.label}
                  </p>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    {item.desc}
                  </p>
                </div>
                <div>
                  {item.status === 'complete' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Siap
                    </span>
                  ) : item.status === 'ready' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-forest-700 dark:text-forest-300 bg-forest-50 dark:bg-forest-950/60 px-2 py-0.5 rounded-full border border-forest-200 dark:border-forest-800">
                      <Database className="w-3.5 h-3.5" /> File DDL Ada
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                      <AlertTriangle className="w-3.5 h-3.5" /> Konfigurasi ENV
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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
