import type { ComponentType } from 'react';
import {
  LayoutDashboard,
  User,
  Award,
  FileCheck,
  Users,
  UserCheck,
  BookOpen,
  Calendar,
  Package,
  FileText,
  Wallet,
  FileSpreadsheet,
  UserCog,
  ClipboardList,
  Compass,
  ShieldAlert,
  Building,
  ShieldCheck,
} from 'lucide-react';

export interface NavLinkItem {
  href: string;
  label: string;
}

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
}

export const PUBLIC_NAV_LINKS: NavLinkItem[] = [
  { href: '/', label: 'Beranda' },
  { href: '/tentang', label: 'Tentang' },
  { href: '/struktur', label: 'Struktur' },
  { href: '/artikel', label: 'Warta' },
  { href: '/ekspedisi', label: 'Ekspedisi' },
  { href: '/donasi', label: 'Sponsorship' },
  { href: '/daftar', label: 'Pendaftaran' },
];

export const MEMBER_NAV_ITEMS: DashboardNavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/profil', label: 'Profil Saya', icon: User },
  { href: '/dashboard/kta', label: 'KTA Digital Resmi', icon: Award },
  { href: '/dashboard/sertifikat', label: 'Sertifikat Saya', icon: FileCheck },
  { href: '/dashboard/direktori', label: 'Direktori Anggota', icon: Users },
  { href: '/dashboard/klaim', label: 'Klaim Akun', icon: UserCheck },
  { href: '/dashboard/kaderisasi', label: 'Alur Kaderisasi', icon: Award },
  { href: '/dashboard/ppnia', label: 'Program PPNIA', icon: BookOpen },
  { href: '/dashboard/event', label: 'Kalender Kegiatan', icon: Calendar },
  { href: '/dashboard/inventaris', label: 'Peminjaman Alat', icon: Package },
  { href: '/dashboard/artikel', label: 'Artikel Saya', icon: FileText },
  { href: '/dashboard/iuran', label: 'Status Iuran', icon: Wallet },
];

export const ADMIN_NAV_ITEMS: DashboardNavItem[] = [
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
  { href: '/dashboard/admin/event', label: 'Kelola Event', icon: Calendar },
  { href: '/dashboard/admin/inventaris', label: 'Inventaris & Logistik', icon: Package },
  { href: '/dashboard/admin/approval', label: 'Persetujuan & Tahap', icon: ShieldCheck },
  { href: '/dashboard/admin/keuangan', label: 'Buku Kas & RAB', icon: Wallet },
  { href: '/dashboard/admin/artikel', label: 'Kurasi Artikel', icon: FileText },
];

export const MOBILE_NAV_ITEMS: DashboardNavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/direktori', label: 'Direktori', icon: Users },
  { href: '/dashboard/event', label: 'Kegiatan', icon: Calendar },
  { href: '/dashboard/iuran', label: 'Iuran', icon: Wallet },
  { href: '/dashboard/profil', label: 'Profil', icon: User },
];
