import type { MemberStatus, FunctionalRole } from '../constants';

export interface AnggotaDirektoriItem {
  id: string;
  nama: string;
  angkatan_id: string | null;
  nomor_angkatan: number | null;
  nama_angkatan: string | null;
  status_keanggotaan: MemberStatus;
  nia: string | null;
  foto_profil: string | null;
  jurusan: string | null;
}

export interface AngkatanItem {
  id: string;
  nomor_angkatan: number;
  nama_angkatan: string | null;
  tahun: number | null;
}

export interface KlaimAkunItem {
  id: string;
  auth_user_id: string;
  anggota_id: string;
  status: 'menunggu' | 'disetujui' | 'ditolak';
  catatan_admin: string | null;
  diproses_oleh: string | null;
  diproses_pada: string | null;
  created_at: string;
  // Joined fields
  anggota?: {
    id: string;
    nama: string;
    status_keanggotaan: MemberStatus;
    nia: string | null;
    jurusan: string | null;
    angkatan?: {
      nomor_angkatan: number;
      nama_angkatan: string | null;
    } | null;
  } | null;
  user_email?: string | null;
}

export interface RiwayatTahapItem {
  id: string;
  anggota_id: string;
  tahap: 'calon_siswa' | 'siswa' | 'medan_operasi';
  status: 'dalam_proses' | 'lolos' | 'gugur';
  approved_by: string | null;
  approver_nama?: string | null;
  tanggal: string;
  catatan: string | null;
  created_at: string;
}

export interface JabatanOrganisasiItem {
  id: string;
  anggota_id: string;
  jabatan: string;
  periode_mulai: string;
  periode_selesai: string | null;
  catatan: string | null;
  created_at: string;
}

export interface UnclaimedMemberItem {
  id: string;
  nama: string;
  nomor_angkatan: number | null;
  nama_angkatan: string | null;
  status_keanggotaan: string;
  jurusan: string | null;
}

export interface ImportAnggotaRow {
  nama: string;
  nomor_angkatan: number;
  status_keanggotaan: MemberStatus;
  nia?: string;
  jenis_kelamin?: 'L' | 'P';
  nim?: string;
  jurusan?: string;
  no_hp?: string;
  alamat?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  isValid: boolean;
  errors: string[];
}
