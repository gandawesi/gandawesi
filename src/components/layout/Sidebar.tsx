'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import {
  LayoutDashboard,
  Users,
  Award,
  Calendar,
  Package,
  Wallet,
  FileText,
  ShieldCheck,
  LogOut,
  ChevronRight,
  ClipboardList,
  User,
  UserCheck,
  FileSpreadsheet,
  UserCog,
  Compass,
  BookOpen,
  ShieldAlert,
  Building,
  FileCheck,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { authUser, profile, isAdmin, isPanitiaOrAdmin, hasLinkedProfile, signOut } = useAuth();

  const mainNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/profil', label: 'Profil Saya', icon: User },
    { href: '/dashboard/kta', label: 'KTA Digital Resmi', icon: Award },
    { href: '/dashboard/sertifikat', label: 'Sertifikat Saya', icon: FileCheck },
    { href: '/dashboard/direktori', label: 'Direktori Anggota', icon: Users },
    {
      href: '/dashboard/klaim',
      label: 'Klaim Akun',
      icon: UserCheck,
      badge: !hasLinkedProfile ? 'Aktivasi' : undefined,
    },
    { href: '/dashboard/kaderisasi', label: 'Alur Kaderisasi', icon: Award },
    { href: '/dashboard/ppnia', label: 'Program PPNIA', icon: BookOpen },
    { href: '/dashboard/event', label: 'Kalender Kegiatan', icon: Calendar },
    { href: '/dashboard/inventaris', label: 'Peminjaman Alat', icon: Package },
    { href: '/dashboard/iuran', label: 'Status Iuran', icon: Wallet },
  ];

  const adminNavItems = [
    { href: '/dashboard/admin/klaim', label: 'Verifikasi Klaim', icon: UserCheck },
    { href: '/dashboard/admin/import', label: 'Impor Data CSV', icon: FileSpreadsheet },
    { href: '/dashboard/admin/roles', label: 'Kelola Hak Akses', icon: UserCog },
    { href: '/dashboard/admin/calon-siswa', label: 'Calon Anggota', icon: ClipboardList },
    { href: '/dashboard/admin/siswa', label: 'Tahap Siswa (DP)', icon: Award },
    { href: '/dashboard/admin/medan-operasi', label: 'Medan Operasi (Danlat)', icon: Compass },
    { href: '/dashboard/admin/ppnia', label: 'PPNIA (Dewan Pengurus)', icon: ShieldAlert },
    { href: '/dashboard/admin/nia', label: 'Sidang Akhir & NIA (DP)', icon: Award },
    { href: '/dashboard/admin/governance', label: 'Struktur & ALB (Governance)', icon: Building },
    { href: '/dashboard/admin/sertifikat', label: 'Penerbitan Sertifikat', icon: FileCheck },
    { href: '/dashboard/admin/approval', label: 'Persetujuan & Tahap', icon: ShieldCheck },
    { href: '/dashboard/admin/keuangan', label: 'Buku Kas & RAB', icon: Wallet },
    { href: '/dashboard/admin/artikel', label: 'Kurasi Artikel', icon: FileText },
  ];

  const isDashboardRoute = pathname.startsWith('/dashboard');

  if (!isDashboardRoute) {
    return null;
  }

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col border-r border-stone-200/80 dark:border-stone-800/80 bg-white/70 dark:bg-[#0c1410]/70 backdrop-blur-md min-h-[calc(100vh-4rem)]">
      {/* User Card */}
      <div className="p-4 border-b border-stone-100 dark:border-stone-800/80">
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-forest-50/70 dark:bg-forest-950/40 border border-forest-100 dark:border-forest-900/60">
          <Avatar
            src={profile?.foto_profil}
            name={profile?.nama || authUser?.email || 'User'}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
              {profile?.nama || 'Akun Anggota'}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {profile?.status_keanggotaan ? (
                <Badge status={profile.status_keanggotaan} size="sm" />
              ) : isAdmin ? (
                <span className="text-[10px] bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-bold px-1.5 py-0.5 rounded">
                  Admin
                </span>
              ) : (
                <span className="text-[10px] text-stone-500">Guest Terautentikasi</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Nav Link Groups */}
      <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        <div>
          <p className="px-3 text-[11px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2">
            Menu Anggota
          </p>
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-forest-700 text-white dark:bg-forest-600 shadow-sm'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-forest-50/60 dark:hover:bg-forest-950/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-forest-600 dark:text-forest-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-white animate-pulse">
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Admin & Panitia Section */}
        {(isAdmin || isPanitiaOrAdmin) && (
          <div>
            <div className="px-3 flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                Kelola Organisasi
              </p>
              <span className="text-[9px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold px-1.5 py-0.5 rounded uppercase">
                CMS
              </span>
            </div>
            <div className="space-y-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-amber-50/60 dark:hover:bg-amber-950/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-amber-600 dark:text-amber-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sign Out */}
      <div className="p-3 border-t border-stone-100 dark:border-stone-800/80">
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar dari Akun</span>
        </button>
      </div>
    </aside>
  );
}
