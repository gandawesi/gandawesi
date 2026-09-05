export type EventStatus = 'upcoming' | 'ongoing' | 'selesai' | 'batal';

export interface EventItem {
  id: string;
  nama: string;
  jenis: string;
  lokasi: string;
  tanggal: string; // YYYY-MM-DD
  tanggal_selesai?: string | null;
  kuota: number | null;
  deskripsi: string | null;
  is_public: boolean;
  status: EventStatus;
  created_at: string;
  // Computed / Joined fields
  pendaftar_count: number;
  user_registered?: boolean;
  user_hadir?: boolean;
}

export interface PendaftaranEventItem {
  id: string;
  anggota_id: string;
  event_id: string;
  status: 'terdaftar' | 'batal';
  created_at: string;
  // Joined fields
  anggota_nama: string;
  anggota_nim: string | null;
  anggota_nia: string | null;
  status_keanggotaan: string;
  foto_profil?: string | null;
  hadir?: boolean;
}

export interface PresensiEventItem {
  id: string;
  anggota_id: string;
  event_id: string;
  hadir: boolean;
  anggota_nama: string;
  anggota_nim: string | null;
  anggota_nia: string | null;
}

export interface CreateEventPayload {
  nama: string;
  jenis: string;
  lokasi: string;
  tanggal: string;
  tanggal_selesai?: string | null;
  kuota?: number | null;
  deskripsi?: string | null;
  is_public?: boolean;
  status?: EventStatus;
}

export interface UpdateEventPayload extends Partial<CreateEventPayload> {
  id: string;
}
