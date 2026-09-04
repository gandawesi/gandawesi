export interface SesiKegiatanItem {
  id: string;
  jenis_kegiatan: 'bina_jasmani' | 'pematerian' | 'presentasi' | 'pendakian' | 'ekspedisi';
  judul: string;
  materi_id: string | null;
  angkatan_id: string | null;
  tanggal: string;
  catatan: string | null;
  materi_judul?: string | null;
}

export interface PresensiSiswaItem {
  id: string;
  anggota_id: string;
  sesi_kegiatan_id: string;
  hadir: boolean;
  catatan: string | null;
  anggota_nama?: string;
  anggota_nim?: string;
  nomor_angkatan?: number;
}

export interface MateriKaderisasiItem {
  id: string;
  judul: string;
  angkatan_id: string | null;
  tanggal: string | null;
  total_soal?: number;
  skor_siswa?: number | null;
  sudah_dikerjakan?: boolean;
}

export interface SoalPostTestItem {
  id: string;
  materi_id: string;
  pertanyaan: string;
  pilihan: string[];
}

export interface HasilPostTestItem {
  id: string;
  anggota_id: string;
  materi_id: string;
  skor: number;
  dikerjakan_pada: string;
  materi_judul?: string;
}

export interface AlatSiswaItem {
  id: string;
  anggota_id: string;
  nama_alat: string;
  jenis: 'pribadi' | 'kelompok';
  sumber: 'beli' | 'pinjam_luar' | 'pinjam_gandawesi';
  status: 'lengkap' | 'belum';
  tanggal_kembali: string | null;
}

export interface RekapKelulusanSiswaItem {
  id: string;
  nama: string;
  nim: string | null;
  jurusan: string | null;
  status_keanggotaan: string;
  total_sesi_jasmani: number;
  kehadiran_jasmani: number;
  persentase_jasmani: number;
  total_materi: number;
  materi_dikerjakan: number;
  rata_rata_post_test: number;
  total_alat: number;
  alat_lengkap: number;
  persentase_alat: number;
  tes_kesehatan_akhir_ada: boolean;
  status_kelulusan: 'dalam_proses' | 'lolos' | 'gugur';
  catatan_kelulusan: string | null;
  approver_nama: string | null;
}
