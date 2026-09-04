import type { User, Session } from '@supabase/supabase-js';
import type { MemberStatus, FunctionalRole } from '../constants';

export interface AnggotaProfile {
  id: string;
  auth_user_id: string | null;
  nama: string;
  email: string | null;
  angkatan_id: string | null;
  periode_pendaftaran_id: string | null;
  status_keanggotaan: MemberStatus;
  nia: string | null;
  is_admin: boolean;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  jenis_kelamin: 'L' | 'P' | null;
  no_hp: string | null;
  alamat: string | null;
  nim: string | null;
  jurusan: string | null;
  foto_profil: string | null;
  file_persetujuan_ortu: string | null;
  tanggal_berubah_status: string | null;
  catatan_status: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  angkatan?: {
    id: string;
    nomor_angkatan: number;
    nama_angkatan: string | null;
    tahun: number | null;
  } | null;
}

export interface UserRoleRecord {
  id: string;
  anggota_id: string;
  role: FunctionalRole;
  periode_mulai: string | null;
  periode_selesai: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AppUserContext {
  authUser: User | null;
  session: Session | null;
  profile: AnggotaProfile | null;
  roles: FunctionalRole[];
  isAdmin: boolean;
  isAnggotaAktif: boolean;
  isPanitiaOrAdmin: boolean;
  isGuest: boolean;
}
