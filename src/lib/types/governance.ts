export interface JabatanOrganisasiItem {
  id: string;
  anggota_id: string;
  anggota_nama: string;
  anggota_nim: string | null;
  anggota_nia: string | null;
  foto_profil: string | null;
  nomor_angkatan: number | null;
  nama_angkatan: string | null;
  status_keanggotaan: string;
  jabatan: string;
  divisi: string | null;
  periode_mulai: string;
  periode_selesai: string | null;
  catatan: string | null;
  is_active: boolean;
}

export interface DewanPenasehatItem {
  id: string;
  anggota_id: string;
  anggota_nama: string;
  anggota_nim: string | null;
  anggota_nia: string | null;
  foto_profil: string | null;
  nomor_angkatan: number | null;
  nama_angkatan: string | null;
  status_keanggotaan: string; // Harus 'anggota_luar_biasa'
  periode_mulai: string;
  periode_selesai: string | null;
  catatan?: string | null;
}

export interface CandidateALBItem {
  id: string;
  nama: string;
  nim: string | null;
  nia: string | null;
  nomor_angkatan: number | null;
  nama_angkatan: string | null;
  jurusan: string | null;
  status_keanggotaan: string;
  tanggal_berubah_status: string | null;
  foto_profil?: string | null;
}

export interface TransisiALBPayload {
  anggota_id: string;
  tanggal_transisi: string;
  catatan: string;
}

export interface SertifikatItem {
  id: string;
  anggota_id: string;
  anggota_nama: string;
  anggota_nia: string | null;
  jenis: string;
  judul: string;
  nomor_sertifikat: string;
  tanggal_terbit: string;
  file: string | null;
  deskripsi: string | null;
}

export interface CreateSertifikatPayload {
  anggota_id: string;
  jenis: string;
  judul: string;
  nomor_sertifikat: string;
  tanggal_terbit: string;
  file: string | null;
  deskripsi?: string;
}

export interface KTADigitalData {
  has_nia: boolean;
  kta_id?: string;
  anggota_id: string;
  nama: string;
  nim: string | null;
  jurusan: string | null;
  nia: string | null;
  status_keanggotaan: string;
  nomor_angkatan: number | null;
  nama_angkatan: string | null;
  foto_profil: string | null;
  tanggal_terbit: string | null;
  qr_code_hash: string;
}

export interface StrukturOrganisasiPublicData {
  periode_aktif: string;
  pimpinan: JabatanOrganisasiItem[];
  bph: JabatanOrganisasiItem[];
  divisi_operasional: JabatanOrganisasiItem[];
  dewan_penasehat: DewanPenasehatItem[];
}
