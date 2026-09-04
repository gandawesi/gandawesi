export type JenisKegiatanPPNIA = 'pematerian' | 'presentasi' | 'pendakian' | 'ekspedisi';
export type StatusEvaluasiBerkala = 'aman' | 'perlu_perhatian' | 'kritis';

export interface EvaluasiBerkalaItem {
  id: string;
  anggota_id: string;
  periode: string; // mis. "2025-Q1", "2025-Q2"
  status: StatusEvaluasiBerkala;
  catatan: string | null;
  created_at?: string;
}

export interface AnggotaMudaPPNIAItem {
  id: string;
  nama: string;
  nim: string | null;
  jurusan: string | null;
  foto_profil?: string | null;
  angkatan_id: string | null;
  nomor_angkatan: number | null;
  nama_angkatan: string | null;
  status_keanggotaan: string;
  // Activity Attendance Counts
  kehadiran_pematerian: number;
  total_pematerian: number;
  kehadiran_presentasi: number;
  total_presentasi: number;
  kehadiran_pendakian: number;
  total_pendakian: number;
  kehadiran_ekspedisi: number;
  total_ekspedisi: number;
  persentase_total: number;
  // Submissions
  total_slide_presentasi: number;
  rencana_ekspedisi_status: 'belum_ada' | 'diajukan' | 'disetujui' | 'ditolak';
  // Periodic Evaluation Watchlist
  status_evaluasi_terkini: StatusEvaluasiBerkala;
  catatan_evaluasi_terkini: string | null;
  periode_terkini: string | null;
}

export interface PresentasiPPNIAItem {
  id: string;
  anggota_id: string;
  anggota_nama?: string;
  anggota_nim?: string | null;
  jenis: 'pra_ekspedisi' | 'pasca_ekspedisi';
  tanggal: string | null;
  file: string | null; // URL / path file slide
  catatan: string | null;
}

export interface PesertaEkspedisiItem {
  id: string;
  anggota_id: string;
  nama: string;
  nim: string | null;
}

export interface RencanaEkspedisiItem {
  id: string;
  pengaju_id: string;
  pengaju_nama?: string;
  pengaju_nim?: string | null;
  deskripsi: string | null;
  lokasi: string | null;
  tanggal: string | null;
  status_approval: 'diajukan' | 'disetujui' | 'ditolak';
  peserta: PesertaEkspedisiItem[];
}

export interface SesiKegiatanPPNIAItem {
  id: string;
  jenis_kegiatan: JenisKegiatanPPNIA;
  judul: string;
  tanggal: string;
  catatan: string | null;
  angkatan_id?: string | null;
}

export interface PresensiPPNIAItem {
  id: string;
  anggota_id: string;
  sesi_kegiatan_id: string;
  hadir: boolean;
  catatan: string | null;
  anggota_nama: string;
  anggota_nim?: string | null;
}

export interface MyPPNIASummary {
  status_keanggotaan: string;
  nomor_angkatan: number | null;
  nama_angkatan: string | null;
  persentase_kehadiran: number;
  pematerian_count: { hadir: number; total: number };
  presentasi_count: { hadir: number; total: number };
  pendakian_count: { hadir: number; total: number };
  ekspedisi_count: { hadir: number; total: number };
  evaluasi_terkini: EvaluasiBerkalaItem | null;
  presentasi_list: PresentasiPPNIAItem[];
  ekspedisi_saya: RencanaEkspedisiItem | null;
}
