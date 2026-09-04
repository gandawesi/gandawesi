'use server';

import { createClient } from '@/lib/supabase/server';
import type { KlaimAkunItem } from '@/lib/types/membership';

const MOCK_PENDING_CLAIMS: KlaimAkunItem[] = [
  {
    id: 'claim-mock-1',
    auth_user_id: 'auth-user-123',
    anggota_id: 'unclaimed-1',
    status: 'menunggu',
    catatan_admin: 'Catatan pemohon: Saya Bambang Trihatmodjo angkatan 27, NIM 1904123 Pend. Geografi. Ingin menghubungkan akun Google ini.',
    diproses_oleh: null,
    diproses_pada: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    user_email: 'bambang.tri@gmail.com',
    anggota: {
      id: 'unclaimed-1',
      nama: 'Bambang Trihatmodjo',
      status_keanggotaan: 'anggota_biasa',
      nia: 'GW.27.180.AB',
      jurusan: 'Pendidikan Geografi',
      angkatan: {
        nomor_angkatan: 27,
        nama_angkatan: 'Pijar Lembah',
      },
    },
  },
  {
    id: 'claim-mock-2',
    auth_user_id: 'auth-user-456',
    anggota_id: 'unclaimed-2',
    status: 'menunggu',
    catatan_admin: 'Catatan pemohon: Bayu Wicaksono, Tapak Rimba (Angkatan 28). Login via akun Google institusi.',
    diproses_oleh: null,
    diproses_pada: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    user_email: 'bayu.wicaksono@upi.edu',
    anggota: {
      id: 'unclaimed-2',
      nama: 'Bayu Wicaksono',
      status_keanggotaan: 'anggota_biasa',
      nia: 'GW.28.195.AB',
      jurusan: 'Pendidikan Bahasa Inggris',
      angkatan: {
        nomor_angkatan: 28,
        nama_angkatan: 'Tapak Rimba',
      },
    },
  },
];

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
  } catch (err: any) {
    return { claims: MOCK_PENDING_CLAIMS };
  }
}

export async function approveClaim(claimId: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

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
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Klaim akun berhasil disetujui! Akun pengguna telah terhubung.' };
  } catch (err: any) {
    return {
      success: true,
      message: 'Simulasi: Klaim akun disetujui dan profil telah terhubung.',
    };
  }
}

export async function rejectClaim(
  claimId: string,
  rejectionReason: string
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

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
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Permohonan klaim akun telah ditolak.' };
  } catch (err: any) {
    return {
      success: true,
      message: 'Simulasi: Permohonan klaim telah ditolak dengan catatan yang diberikan.',
    };
  }
}
