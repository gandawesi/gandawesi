export interface PeriodePendaftaranItem {
  id: string;
  angkatan_id: string;
  nomor_angkatan?: number;
  nama_angkatan?: string | null;
  tanggal_buka: string;
  tanggal_tutup: string;
  status: 'buka' | 'tutup';
  catatan: string | null;
  created_at: string;
}

export interface TesKesehatanItem {
  id: string;
  anggota_id: string;
  jenis: 'awal' | 'akhir';
  catatan_panitia: string | null;
  file_surat_dokter: string | null;
  tanggal: string;
  created_at: string;
}

export interface CalonSiswaItem {
  id: string;
  auth_user_id: string | null;
  nama: string;
  email: string | null;
  nim: string | null;
  jurusan: string | null;
  no_hp: string | null;
  alamat: string | null;
  jenis_kelamin: 'L' | 'P' | null;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  file_persetujuan_ortu: string | null;
  status_keanggotaan: string;
  created_at: string;
  angkatan?: {
    id: string;
    nomor_angkatan: number;
    nama_angkatan: string | null;
  } | null;
  periode_pendaftaran?: {
    id: string;
    catatan: string | null;
    status: string;
  } | null;
  tes_kesehatan_awal?: TesKesehatanItem | null;
  keputusan_tahap?: {
    id: string;
    tahap: string;
    status: 'dalam_proses' | 'lolos' | 'gugur';
    catatan: string | null;
    approver_nama: string | null;
    tanggal: string;
  } | null;
}

export interface RegisterCalonSiswaPayload {
  nama: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: 'L' | 'P';
  no_hp: string;
  alamat: string;
  nim: string;
  jurusan: string;
  file_persetujuan_ortu?: string | null;
  periode_pendaftaran_id: string;
  angkatan_id: string;
}
