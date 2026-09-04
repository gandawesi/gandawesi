'use server';

import { createClient } from '@/lib/supabase/server';
import type { AnggotaDirektoriItem, AngkatanItem } from '@/lib/types/membership';
import type { MemberStatus } from '@/lib/constants';

export interface DirectoryFilterParams {
  q?: string;
  angkatanId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface DirectoryResponse {
  data: AnggotaDirektoriItem[];
  total: number;
  page: number;
  totalPages: number;
  isFallback?: boolean;
}

// Fallback mock data when Supabase database is unreachable or during maintenance
const MOCK_ANGGOTA: AnggotaDirektoriItem[] = [
  {
    id: 'mock-1',
    nama: 'Rian Pratama Putra',
    angkatan_id: 'angkatan-28',
    nomor_angkatan: 28,
    nama_angkatan: 'Tapak Rimba',
    status_keanggotaan: 'anggota_biasa',
    nia: 'GW.28.192.AB',
    foto_profil: null,
    jurusan: 'Pendidikan Geografi',
  },
  {
    id: 'mock-2',
    nama: 'Nabila Azzahra',
    angkatan_id: 'angkatan-29',
    nomor_angkatan: 29,
    nama_angkatan: 'Kabut Lembah',
    status_keanggotaan: 'anggota_biasa',
    nia: 'GW.29.205.AB',
    foto_profil: null,
    jurusan: 'Pendidikan Biologi',
  },
  {
    id: 'mock-3',
    nama: 'Fajar Nugraha',
    angkatan_id: 'angkatan-30',
    nomor_angkatan: 30,
    nama_angkatan: 'Elang Merbabu',
    status_keanggotaan: 'anggota_muda',
    nia: null,
    foto_profil: null,
    jurusan: 'Pendidikan Kepelatihan Olahraga',
  },
  {
    id: 'mock-4',
    nama: 'Dimas Ardiansyah',
    angkatan_id: 'angkatan-31',
    nomor_angkatan: 31,
    nama_angkatan: 'Cakrawala Sunda',
    status_keanggotaan: 'medan_operasi',
    nia: null,
    foto_profil: null,
    jurusan: 'Pendidikan Geografi',
  },
  {
    id: 'mock-5',
    nama: 'Siti Sarah Rahmawati',
    angkatan_id: 'angkatan-31',
    nomor_angkatan: 31,
    nama_angkatan: 'Cakrawala Sunda',
    status_keanggotaan: 'siswa',
    nia: null,
    foto_profil: null,
    jurusan: 'Pendidikan Seni Rupa',
  },
  {
    id: 'mock-6',
    nama: 'Ilham Kusuma Jaya',
    angkatan_id: 'angkatan-26',
    nomor_angkatan: 26,
    nama_angkatan: 'Badai Puncak',
    status_keanggotaan: 'anggota_luar_biasa',
    nia: 'GW.26.175.AB',
    foto_profil: null,
    jurusan: 'Pendidikan Teknik Mesin',
  },
  {
    id: 'mock-7',
    nama: 'Aditya Pratama',
    angkatan_id: 'angkatan-32',
    nomor_angkatan: 32,
    nama_angkatan: 'Giri Wardhana',
    status_keanggotaan: 'calon_siswa',
    nia: null,
    foto_profil: null,
    jurusan: 'Ilmu Komputer',
  },
  {
    id: 'mock-8',
    nama: 'Prof. Dr. Ir. Hendra Gunawan',
    angkatan_id: null,
    nomor_angkatan: null,
    nama_angkatan: null,
    status_keanggotaan: 'anggota_kehormatan',
    nia: 'GW.HON.003',
    foto_profil: null,
    jurusan: 'FPTI UPI',
  },
];

const MOCK_ANGKATAN: AngkatanItem[] = [
  { id: 'angkatan-32', nomor_angkatan: 32, nama_angkatan: 'Giri Wardhana', tahun: 2025 },
  { id: 'angkatan-31', nomor_angkatan: 31, nama_angkatan: 'Cakrawala Sunda', tahun: 2024 },
  { id: 'angkatan-30', nomor_angkatan: 30, nama_angkatan: 'Elang Merbabu', tahun: 2023 },
  { id: 'angkatan-29', nomor_angkatan: 29, nama_angkatan: 'Kabut Lembah', tahun: 2022 },
  { id: 'angkatan-28', nomor_angkatan: 28, nama_angkatan: 'Tapak Rimba', tahun: 2021 },
  { id: 'angkatan-26', nomor_angkatan: 26, nama_angkatan: 'Badai Puncak', tahun: 2019 },
];

export async function fetchDirectory(params: DirectoryFilterParams): Promise<DirectoryResponse> {
  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? params.limit : 12;
  const offset = (page - 1) * limit;

  try {
    const supabase = await createClient();

    let query = supabase
      .from('v_anggota_direktori')
      .select('*', { count: 'exact' });

    if (params.q && params.q.trim() !== '') {
      query = query.ilike('nama', `%${params.q.trim()}%`);
    }

    if (params.angkatanId && params.angkatanId !== 'all') {
      query = query.eq('angkatan_id', params.angkatanId);
    }

    if (params.status && params.status !== 'all') {
      query = query.eq('status_keanggotaan', params.status);
    }

    query = query
      .order('nomor_angkatan', { ascending: false, nullsFirst: false })
      .order('nama', { ascending: true })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error || !data || data.length === 0) {
      // If error (e.g. Supabase maintenance or table empty), provide filtered mock data
      return filterMockData(params, page, limit);
    }

    const total = count ?? data.length;
    return {
      data: data as AnggotaDirektoriItem[],
      total,
      page,
      totalPages: Math.ceil(total / limit),
      isFallback: false,
    };
  } catch (err) {
    console.warn('Falling back to mock directory data:', err);
    return filterMockData(params, page, limit);
  }
}

function filterMockData(params: DirectoryFilterParams, page: number, limit: number): DirectoryResponse {
  let filtered = [...MOCK_ANGGOTA];

  if (params.q && params.q.trim() !== '') {
    const term = params.q.trim().toLowerCase();
    filtered = filtered.filter(
      (m) =>
        m.nama.toLowerCase().includes(term) ||
        (m.nia && m.nia.toLowerCase().includes(term)) ||
        (m.jurusan && m.jurusan.toLowerCase().includes(term))
    );
  }

  if (params.angkatanId && params.angkatanId !== 'all') {
    filtered = filtered.filter((m) => m.angkatan_id === params.angkatanId);
  }

  if (params.status && params.status !== 'all') {
    filtered = filtered.filter((m) => m.status_keanggotaan === params.status);
  }

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  return {
    data: paginated,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
    isFallback: true,
  };
}

export async function fetchAngkatanList(): Promise<AngkatanItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('angkatan')
      .select('*')
      .order('nomor_angkatan', { ascending: false });

    if (error || !data || data.length === 0) {
      return MOCK_ANGKATAN;
    }

    return data as AngkatanItem[];
  } catch (err) {
    return MOCK_ANGKATAN;
  }
}
