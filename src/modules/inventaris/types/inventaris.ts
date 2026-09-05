export type KondisiAlat = 'baik' | 'rusak_ringan' | 'rusak_berat';
export type PeminjamanStatus = 'diajukan' | 'disetujui' | 'dipinjam' | 'dikembalikan' | 'ditolak';

export interface AlatItem {
  id: string;
  nama_alat: string;
  kategori: string;
  kondisi: KondisiAlat;
  stok: number;
}

export interface PeminjamanAlatItem {
  id: string;
  anggota_id: string;
  alat_id: string;
  jumlah: number;
  tanggal_pinjam: string;
  tanggal_kembali: string | null;
  status: PeminjamanStatus;
  approved_by: string | null;
  // Joined fields
  anggota_nama: string;
  anggota_nim: string | null;
  anggota_nia: string | null;
  alat_nama: string;
  alat_kategori: string;
  approved_by_nama?: string | null;
}

export interface CreateAlatPayload {
  nama_alat: string;
  kategori: string;
  kondisi: KondisiAlat;
  stok: number;
}

export interface UpdateAlatPayload extends Partial<CreateAlatPayload> {
  id: string;
}

export interface AjukanPeminjamanPayload {
  alat_id: string;
  jumlah: number;
  tanggal_pinjam: string;
  tanggal_kembali?: string | null;
}
