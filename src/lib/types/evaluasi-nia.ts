export interface KriteriaEvaluasiItem {
  id: string;
  nama_kriteria: string;
  periode: string; // mis. "2025-Q2"
  created_at?: string;
}

export interface NilaiEvaluasiItem {
  id: string;
  anggota_id: string;
  kriteria_id: string;
  skor: number | null;
  catatan: string | null;
  nama_kriteria?: string;
}

export interface EvaluasiAkhirAnggotaItem {
  id: string;
  nama: string;
  nim: string | null;
  jurusan: string | null;
  foto_profil?: string | null;
  angkatan_id: string | null;
  nomor_angkatan: number | null;
  nama_angkatan: string | null;
  status_keanggotaan: string; // 'anggota_muda' | 'anggota_biasa'
  nia: string | null;
  nilai_list: NilaiEvaluasiItem[];
  rata_rata_skor: number;
  kriteria_dinilai: number;
  total_kriteria: number;
  status_sidang: 'lolos' | 'tunda' | 'belum_sidang';
  catatan_sidang: string | null;
  tanggal_sidang: string | null;
  approver_nama: string | null;
}

export interface SidangDPPayload {
  anggota_id: string;
  keputusan: 'lolos' | 'tunda';
  catatan: string;
}

export interface TerbitkanNIAPayload {
  anggota_id: string;
  nia: string;
}

export interface MyEvaluasiAkhirSummary {
  status_keanggotaan: string;
  nomor_angkatan: number | null;
  nama_angkatan: string | null;
  nia: string | null;
  status_sidang: 'lolos' | 'tunda' | 'belum_sidang';
  catatan_sidang: string | null;
  tanggal_nia_terbit: string | null;
  rata_rata_skor: number;
  transkrip_nilai: NilaiEvaluasiItem[];
}
