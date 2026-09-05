export interface DashboardAnalytics {
  keanggotaan: {
    total: number;
    calon_siswa: number;
    siswa: number;
    medan_operasi: number;
    anggota_muda: number;
    anggota_biasa: number;
    anggota_luar_biasa: number;
    angkatan_aktif: number;
    nama_angkatan_aktif: string;
  };
  keuangan: {
    saldo_kas: number;
    kas_masuk: number;
    kas_keluar: number;
    iuran_lunas_pct: number;
    total_tunggakan: number;
  };
  operasional: {
    event_aktif: number;
    peserta_terdaftar: number;
    alat_total_unit: number;
    alat_sedang_dipinjam: number;
  };
  publikasi: {
    artikel_terbit: number;
    rute_ekspedisi: number;
  };
}

export const MOCK_DASHBOARD_ANALYTICS: DashboardAnalytics = {
  keanggotaan: {
    total: 142,
    calon_siswa: 12,
    siswa: 16,
    medan_operasi: 14,
    anggota_muda: 8,
    anggota_biasa: 68,
    anggota_luar_biasa: 24,
    angkatan_aktif: 32,
    nama_angkatan_aktif: 'Giri Wardhana',
  },
  keuangan: {
    saldo_kas: 4350000,
    kas_masuk: 6000000,
    kas_keluar: 1650000,
    iuran_lunas_pct: 82,
    total_tunggakan: 275000,
  },
  operasional: {
    event_aktif: 3,
    peserta_terdaftar: 65,
    alat_total_unit: 58,
    alat_sedang_dipinjam: 5,
  },
  publikasi: {
    artikel_terbit: 3,
    rute_ekspedisi: 3,
  },
};
