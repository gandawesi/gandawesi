export interface EvaluasiIndividuItem {
  id: string;
  anggota_id: string;
  evaluator_id: string | null;
  evaluator_nama?: string | null;
  tahap: 'medan_operasi' | 'ppnia';
  skor: number | null;
  catatan: string | null;
  tanggal: string;
  created_at?: string;
}

export interface EvaluasiKelompokItem {
  id: string;
  angkatan_id: string;
  evaluator_id: string | null;
  evaluator_nama?: string | null;
  tahap: 'medan_operasi' | 'ppnia';
  catatan: string | null;
  tanggal: string;
  created_at?: string;
}

export interface PesertaMedanOperasiItem {
  id: string;
  nama: string;
  nim: string | null;
  jurusan: string | null;
  foto_profil?: string | null;
  angkatan_id: string | null;
  nomor_angkatan: number | null;
  nama_angkatan: string | null;
  status_keanggotaan: string; // 'siswa' | 'medan_operasi' | 'anggota_muda'
  total_evaluasi: number;
  rata_rata_skor: number;
  status_tahap: 'dalam_proses' | 'lolos' | 'gugur';
  catatan_kelulusan: string | null;
  approver_nama: string | null;
  tanggal_kelulusan: string | null;
  is_gugur: boolean;
}

export interface AngkatanDiklatItem {
  id: string;
  nomor_angkatan: number;
  nama_angkatan: string | null;
  tahun: number | null;
  total_peserta?: number;
}

export interface BatchKelulusanPayload {
  angkatan_id: string;
  nama_angkatan: string;
  anggota_ids: string[];
  catatan_kolektif: string;
}

export interface MyMedanOperasiSummary {
  status_keanggotaan: string;
  tahap_status: 'dalam_proses' | 'lolos' | 'gugur';
  nomor_angkatan: number | null;
  nama_angkatan: string | null;
  rata_rata_skor: number;
  catatan_danlat: string | null;
  evaluasi_list: EvaluasiIndividuItem[];
}
