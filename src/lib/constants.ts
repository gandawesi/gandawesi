/**
 * Application Constants for Gandawesi
 * Based on schema-gandawesi.sql, prd-gandawesi.md, and spesifikasi-fitur-gandawesi.md
 */

export const APP_NAME = "GANDAWESI";
export const APP_SUBTITLE = "Organisasi Mahasiswa Pecinta Alam FPTI UPI";
export const APP_DESCRIPTION = "Sistem Informasi Manajemen Keanggotaan, Kaderisasi, dan Tata Kelola Organisasi Gandawesi FPTI UPI";

export type MemberStatus =
  | 'calon_siswa'
  | 'siswa'
  | 'medan_operasi'
  | 'anggota_muda'
  | 'anggota_biasa'
  | 'anggota_luar_biasa'
  | 'anggota_kehormatan'
  | 'dicabut';

export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  calon_siswa: 'Calon Siswa',
  siswa: 'Siswa',
  medan_operasi: 'Medan Operasi',
  anggota_muda: 'Anggota Muda',
  anggota_biasa: 'Anggota Biasa',
  anggota_luar_biasa: 'Anggota Luar Biasa',
  anggota_kehormatan: 'Anggota Kehormatan',
  dicabut: 'Status Dicabut',
};

export const MEMBER_STATUS_COLORS: Record<MemberStatus, { bg: string; text: string; border: string }> = {
  calon_siswa: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
  siswa: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  medan_operasi: { bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' },
  anggota_muda: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
  anggota_biasa: { bg: 'bg-forest-50 dark:bg-forest-950/50', text: 'text-forest-700 dark:text-forest-300', border: 'border-forest-200 dark:border-forest-800' },
  anggota_luar_biasa: { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
  anggota_kehormatan: { bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800' },
  dicabut: { bg: 'bg-red-50 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800' },
};

export type FunctionalRole =
  | 'admin'
  | 'ketua_organisasi'
  | 'ketua_medan_operasi'
  | 'danlat'
  | 'ketua_dp'
  | 'pengurus_dp'
  | 'panitia';

export const USER_ROLE_LABELS: Record<FunctionalRole, string> = {
  admin: 'Super Admin',
  ketua_organisasi: 'Ketua Organisasi',
  ketua_medan_operasi: 'Ketua Medan Operasi',
  danlat: 'Komandan Latihan',
  ketua_dp: 'Ketua Dewan Pengurus',
  pengurus_dp: 'Pengurus Dewan Pengurus',
  panitia: 'Panitia Kaderisasi',
};

export const SUPABASE_STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  DOCUMENTS: 'documents',
  SLIDES: 'slides',
  ARTICLES: 'articles',
  CERTIFICATES: 'certificates',
  RECEIPTS: 'receipts',
  EXPEDITIONS: 'expeditions',
} as const;
