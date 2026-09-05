'use server';

import { createClient } from '@/lib/supabase/server';
import type { AnggotaDirektoriItem, AngkatanItem } from '@/lib/types/membership';
import { MOCK_ANGGOTA, MOCK_ANGKATAN } from '@/lib/mock-data';

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
  } catch {
    return MOCK_ANGKATAN;
  }
}
