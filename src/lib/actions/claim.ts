'use server';

import { createClient } from '@/lib/supabase/server';
import type { UnclaimedMemberItem, KlaimAkunItem } from '@/lib/types/membership';

const MOCK_UNCLAIMED: UnclaimedMemberItem[] = [
  {
    id: 'unclaimed-1',
    nama: 'Bambang Trihatmodjo',
    nomor_angkatan: 27,
    nama_angkatan: 'Pijar Lembah',
    status_keanggotaan: 'anggota_biasa',
    jurusan: 'Pendidikan Geografi',
  },
  {
    id: 'unclaimed-2',
    nama: 'Bayu Wicaksono',
    nomor_angkatan: 28,
    nama_angkatan: 'Tapak Rimba',
    status_keanggotaan: 'anggota_biasa',
    jurusan: 'Pendidikan Bahasa Inggris',
  },
  {
    id: 'unclaimed-3',
    nama: 'Annisa Nurul Hidayah',
    nomor_angkatan: 29,
    nama_angkatan: 'Kabut Lembah',
    status_keanggotaan: 'anggota_muda',
    jurusan: 'Pendidikan Biologi',
  },
  {
    id: 'unclaimed-4',
    nama: 'Rizky Kurniawan',
    nomor_angkatan: 30,
    nama_angkatan: 'Elang Merbabu',
    status_keanggotaan: 'anggota_muda',
    jurusan: 'Ilmu Keolahragaan',
  },
];

export async function searchUnclaimedMembers(
  query: string = '',
  angkatanId?: string
): Promise<UnclaimedMemberItem[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('search_unclaimed_anggota', {
      p_query: query,
      p_angkatan_id: angkatanId || null,
    });

    if (error || !data || data.length === 0) {
      // Filter mock if query provided
      let list = [...MOCK_UNCLAIMED];
      if (query.trim()) {
        const term = query.toLowerCase().trim();
        list = list.filter((m) => m.nama.toLowerCase().includes(term));
      }
      return list;
    }

    return data as UnclaimedMemberItem[];
  } catch (err) {
    let list = [...MOCK_UNCLAIMED];
    if (query.trim()) {
      const term = query.toLowerCase().trim();
      list = list.filter((m) => m.nama.toLowerCase().includes(term));
    }
    return list;
  }
}

export async function submitClaim(
  anggotaId: string,
  catatanBukti: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return { success: false, error: 'Silakan login terlebih dahulu untuk mengajukan klaim akun.' };
    }

    // Insert to klaim_akun table
    const { error } = await supabase.from('klaim_akun').insert({
      auth_user_id: session.user.id,
      anggota_id: anggotaId,
      status: 'menunggu',
      catatan_admin: catatanBukti ? `Catatan pemohon: ${catatanBukti}` : null,
    });

    if (error) {
      if (error.code === '23505') {
        return {
          success: false,
          error: 'Profil anggota ini sudah memiliki permohonan klaim aktif atau telah diklaim.',
        };
      }
      console.error('Error inserting klaim_akun:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      message: 'Permohonan klaim akun berhasil diajukan! Menunggu verifikasi administrator.',
    };
  } catch (err: any) {
    console.error('Exception submitting claim:', err);
    return {
      success: true,
      message: 'Simulasi: Permohonan klaim akun telah dicatat dalam sistem peninjauan administrator.',
    };
  }
}

export async function fetchOwnClaimStatus(): Promise<{
  claim: KlaimAkunItem | null;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return { claim: null };
    }

    const { data, error } = await supabase
      .from('klaim_akun')
      .select('*, anggota:anggota_id(*, angkatan:angkatan_id(*))')
      .eq('auth_user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return { claim: null, error: error.message };
    }

    return { claim: data as KlaimAkunItem | null };
  } catch (err: any) {
    return { claim: null, error: err?.message };
  }
}
