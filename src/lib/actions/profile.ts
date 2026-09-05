'use server';

import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedMember } from '@/lib/actions/auth-helper';
import type { AnggotaProfile } from '@/lib/auth/types';
import type { RiwayatTahapItem, JabatanOrganisasiItem } from '@/lib/types/membership';

export interface UpdateProfileInput {
  nama?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: 'L' | 'P';
  no_hp?: string;
  alamat?: string;
  nim?: string;
  jurusan?: string;
  foto_profil?: string;
}

export async function fetchOwnProfile(): Promise<{ profile: AnggotaProfile | null; error?: string }> {
  try {
    const { supabase, member } = await getAuthenticatedMember();

    if (!member) {
      return { profile: null, error: 'Belum login' };
    }

    const { data, error } = await supabase
      .from('anggota')
      .select('*, angkatan:angkatan_id(*)')
      .eq('id', member.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return { profile: null, error: error.message };
    }

    return { profile: data as AnggotaProfile };
  } catch (err: any) {
    console.error('Server error fetching profile:', err);
    return { profile: null, error: err?.message || 'Gagal memuat profil' };
  }
}

export async function updateProfile(input: UpdateProfileInput): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, member } = await getAuthenticatedMember();

    if (!member) {
      return { success: false, error: 'Sesi tidak valid. Silakan login kembali.' };
    }

    // Call safe RPC update_profil_anggota
    const { error } = await supabase.rpc('update_profil_anggota', {
      p_nama: input.nama || null,
      p_tempat_lahir: input.tempat_lahir || null,
      p_tanggal_lahir: input.tanggal_lahir || null,
      p_jenis_kelamin: input.jenis_kelamin || null,
      p_no_hp: input.no_hp || null,
      p_alamat: input.alamat || null,
      p_nim: input.nim || null,
      p_jurusan: input.jurusan || null,
      p_foto_profil: input.foto_profil || null,
    });

    if (error) {
      console.error('Error calling update_profil_anggota:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Server exception updating profile:', err);
    return { success: false, error: err?.message || 'Terjadi kesalahan sistem saat memperbarui profil' };
  }
}

export async function fetchOwnRiwayat(anggotaId: string): Promise<{
  tahap: RiwayatTahapItem[];
  jabatan: JabatanOrganisasiItem[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const [tahapRes, jabatanRes] = await Promise.all([
      supabase
        .from('riwayat_tahap')
        .select('*, approver:approved_by(nama)')
        .eq('anggota_id', anggotaId)
        .order('tanggal', { ascending: false }),
      supabase
        .from('jabatan_organisasi')
        .select('*')
        .eq('anggota_id', anggotaId)
        .order('periode_mulai', { ascending: false }),
    ]);

    const tahap: RiwayatTahapItem[] = (tahapRes.data || []).map((row: any) => ({
      ...row,
      approver_nama: row.approver?.nama,
    }));

    const jabatan: JabatanOrganisasiItem[] = jabatanRes.data || [];

    return { tahap, jabatan };
  } catch (err: any) {
    console.error('Error fetching member history:', err);
    return { tahap: [], jabatan: [], error: err?.message };
  }
}
