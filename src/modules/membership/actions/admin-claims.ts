'use server';

import { createClient } from '@/lib/supabase/server';
import type { KlaimAkunItem } from '@/lib/types/membership';
import type { ActionResponse } from '@/lib/types/action-response';
import { actionSuccess, actionError } from '@/lib/actions/auth-helper';
import { MOCK_PENDING_CLAIMS } from '@/lib/mock-data';

export async function fetchPendingClaims(): Promise<{
  claims: KlaimAkunItem[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('klaim_akun')
      .select('*, anggota:anggota_id(*, angkatan:angkatan_id(*))')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return { claims: MOCK_PENDING_CLAIMS };
    }

    return { claims: data as KlaimAkunItem[] };
  } catch {
    return { claims: MOCK_PENDING_CLAIMS };
  }
}

export async function approveClaim(claimId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Trigger trg_proses_klaim_akun will automatically set anggota.auth_user_id
    const { error } = await supabase
      .from('klaim_akun')
      .update({
        status: 'disetujui',
        diproses_oleh: session?.user?.id || null,
        diproses_pada: new Date().toISOString(),
      })
      .eq('id', claimId);

    if (error) {
      return actionError(error.message);
    }

    return actionSuccess(undefined, 'Klaim akun berhasil disetujui! Akun pengguna telah terhubung.');
  } catch {
    return actionSuccess(undefined, 'Simulasi: Klaim akun disetujui dan profil telah terhubung.');
  }
}

export async function rejectClaim(
  claimId: string,
  rejectionReason: string
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { error } = await supabase
      .from('klaim_akun')
      .update({
        status: 'ditolak',
        catatan_admin: rejectionReason,
        diproses_oleh: session?.user?.id || null,
        diproses_pada: new Date().toISOString(),
      })
      .eq('id', claimId);

    if (error) {
      return actionError(error.message);
    }

    return actionSuccess(undefined, 'Permohonan klaim akun telah ditolak.');
  } catch {
    return actionSuccess(undefined, 'Simulasi: Permohonan klaim telah ditolak dengan catatan yang diberikan.');
  }
}
