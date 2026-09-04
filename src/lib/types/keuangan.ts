export interface TarifIuranItem {
  id: string;
  status_keanggotaan: string;
  nominal: number;
  berlaku_sejak: string;
}

export interface IuranItem {
  id: string;
  anggota_id: string;
  anggota_nama: string;
  anggota_nim: string | null;
  anggota_nia: string | null;
  nomor_angkatan: number | null;
  nama_angkatan: string | null;
  status_keanggotaan: string;
  periode: string; // e.g. "2025-06"
  nominal: number;
  status_bayar: 'lunas' | 'menunggak';
  tanggal_bayar: string | null;
}

export interface TransaksiKasItem {
  id: string;
  tipe: 'masuk' | 'keluar';
  kategori: string;
  nominal: number;
  keterangan: string | null;
  tanggal: string;
  bukti: string | null;
  event_id: string | null;
  event_nama?: string | null;
}

export interface CreateTransaksiKasPayload {
  tipe: 'masuk' | 'keluar';
  kategori: string;
  nominal: number;
  keterangan: string;
  tanggal: string;
  bukti?: string | null;
  event_id?: string | null;
}

export interface EventAnggaranItem {
  id: string;
  event_id: string;
  event_nama: string;
  event_tanggal: string | null;
  rab: number;
  realisasi: number;
  selisih: number;
  status: 'draft' | 'disetujui';
}

export interface CreateAnggaranPayload {
  event_id: string;
  rab: number;
  realisasi?: number;
  status?: 'draft' | 'disetujui';
}

export interface LPJItem {
  id: string;
  anggota_id: string;
  penanggung_jawab_nama: string;
  jenis: 'kepengurusan' | 'kegiatan';
  judul: string;
  file: string | null;
  tanggal: string;
}

export interface CreateLPJPayload {
  anggota_id: string;
  jenis: 'kepengurusan' | 'kegiatan';
  judul: string;
  file?: string | null;
  tanggal: string;
}

export interface MyIuranSummary {
  status_keanggotaan: string;
  tarif_bulanan_saat_ini: number;
  total_tunggakan: number;
  jumlah_bulan_menunggak: number;
  total_lunas: number;
  riwayat_iuran: IuranItem[];
}

export interface AdminKeuanganSummary {
  saldo_kas_saat_ini: number;
  pemasukan_bulan_ini: number;
  pengeluaran_bulan_ini: number;
  total_tunggakan_organisasi: number;
  transaksi_list: TransaksiKasItem[];
  iuran_list: IuranItem[];
  tarif_list: TarifIuranItem[];
  anggaran_list: EventAnggaranItem[];
  lpj_list: LPJItem[];
}
