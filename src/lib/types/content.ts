export type ArtikelKategori = 'berita' | 'laporan_ekspedisi' | 'tips';
export type ArtikelStatus = 'draft' | 'review' | 'published';

export interface ArtikelItem {
  id: string;
  penulis_id: string | null;
  judul: string;
  slug: string | null;
  konten: string;
  kategori: ArtikelKategori;
  thumbnail: string | null;
  status: ArtikelStatus;
  tanggal_publish: string | null;
  created_at: string;
  // Joined fields
  penulis_nama?: string;
  penulis_nia?: string | null;
  penulis_angkatan?: string | null;
}

export interface CreateArtikelPayload {
  judul: string;
  konten: string;
  kategori: ArtikelKategori;
  thumbnail?: string | null;
  status?: ArtikelStatus;
}

export interface UpdateArtikelPayload extends Partial<CreateArtikelPayload> {
  id: string;
  slug?: string | null;
}

export interface KontenStatisItem {
  id: string;
  slug: string;
  judul: string;
  konten: string | null;
  updated_at: string;
}

export interface RuteEkspedisiItem {
  id: string;
  nama: string;
  lokasi: string | null;
  tanggal: string | null;
  deskripsi: string | null;
  peserta: string | null;
  foto: string[] | null;
}

export interface CreateRuteEkspedisiPayload {
  nama: string;
  lokasi: string;
  tanggal?: string;
  deskripsi: string;
  peserta: string;
  foto?: string[];
}

export interface SponsorshipItem {
  id: string;
  nama_sponsor: string;
  jenis: 'sponsorship' | 'donasi';
  nominal: number | null;
  event_id: string | null;
  tanggal: string;
  event_nama?: string | null;
}

export interface CreateDonasiPayload {
  nama_sponsor: string;
  jenis: 'sponsorship' | 'donasi';
  nominal: number;
  event_id?: string | null;
  tanggal?: string;
}
