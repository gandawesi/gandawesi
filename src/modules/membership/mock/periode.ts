import type { PeriodePendaftaranItem } from '@/lib/types/registration';

export const MOCK_ACTIVE_PERIODE: PeriodePendaftaranItem = {
  id: 'periode-aktif-32',
  angkatan_id: 'angkatan-32',
  nomor_angkatan: 32,
  nama_angkatan: 'Giri Wardhana',
  tanggal_buka: '2025-08-01',
  tanggal_tutup: '2025-09-30',
  status: 'buka',
  catatan: 'Penerimaan Calon Siswa Diklat Angkatan 32 Gandawesi FPTI UPI',
  created_at: '2025-08-01T00:00:00Z',
};

export const MOCK_PERIODE_LIST: PeriodePendaftaranItem[] = [
  MOCK_ACTIVE_PERIODE,
  {
    id: 'periode-31',
    angkatan_id: 'angkatan-31',
    nomor_angkatan: 31,
    nama_angkatan: 'Cakrawala Sunda',
    tanggal_buka: '2024-08-01',
    tanggal_tutup: '2024-09-30',
    status: 'tutup',
    catatan: 'Penerimaan Calon Siswa Diklat Angkatan 31',
    created_at: '2024-08-01T00:00:00Z',
  },
];
