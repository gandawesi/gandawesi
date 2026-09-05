'use server';

import { createClient } from '@/lib/supabase/server';
import type { UnclaimedMemberItem, KlaimAkunItem } from '@/lib/types/membership';
import type { ActionResponse } from '@/lib/types/action-response';
import { actionSuccess, actionError } from '@/lib/actions/auth-helper';
import { MOCK_UNCLAIMED } from '@/lib/mock-data';

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
      let list = [...MOCK_UNCLAIMED];
      if (query.trim()) {
        const term = query.toLowerCase().trim();
        list = list.filter((m) => m.nama.toLowerCase().includes(term));
      }
      return list;
    }

    return data as UnclaimedMemberItem[];
  } catch {
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
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return actionError('Silakan login terlebih dahulu untuk mengajukan klaim akun.');
    }

    const { error } = await supabase.from('klaim_akun').insert({
      auth_user_id: session.user.id,
      anggota_id: anggotaId,
      status: 'menunggu',
      catatan_admin: catatanBukti ? `Catatan pemohon: ${catatanBukti}` : null,
    });

    if (error) {
      if (error.code === '23505') {
        return actionError('Profil anggota ini sudah memiliki permohonan klaim aktif atau telah diklaim.');
      }
      return actionError(error.message);
    }

    return actionSuccess(undefined, 'Permohonan klaim akun berhasil diajukan! Menunggu verifikasi administrator.');
  } catch {
    return actionSuccess(undefined, 'Simulasi: Permohonan klaim akun telah dicatat dalam sistem peninjauan administrator.');
  }
}

export async function fetchOwnClaimStatus(): Promise<{
  claim: KlaimAkunItem | null;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : undefined;
    return { claim: null, error: message };
  }
}
