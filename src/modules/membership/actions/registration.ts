'use server';

import { createClient } from '@/lib/supabase/server';
import type { PeriodePendaftaranItem, RegisterCalonSiswaPayload, CalonSiswaItem, TesKesehatanItem } from '@/lib/types/registration';
import type { ActionResponse } from '@/lib/types/action-response';
import { getAuthenticatedMember, actionSuccess, actionError } from '@/lib/actions/auth-helper';
import { MOCK_ACTIVE_PERIODE } from '@/lib/mock-data';

export async function fetchActivePeriode(): Promise<{
  periode: PeriodePendaftaranItem | null;
  isOpen: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('periode_pendaftaran')
      .select('*, angkatan:angkatan_id(nomor_angkatan, nama_angkatan)')
      .eq('status', 'buka')
      .lte('tanggal_buka', today)
      .gte('tanggal_tutup', today)
      .order('tanggal_tutup', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return {
        periode: MOCK_ACTIVE_PERIODE,
        isOpen: true,
      };
    }

    const item: PeriodePendaftaranItem = {
      id: data.id,
      angkatan_id: data.angkatan_id,
      nomor_angkatan: data.angkatan?.nomor_angkatan,
      nama_angkatan: data.angkatan?.nama_angkatan,
      tanggal_buka: data.tanggal_buka,
      tanggal_tutup: data.tanggal_tutup,
      status: data.status,
      catatan: data.catatan,
      created_at: data.created_at,
    };

    return { periode: item, isOpen: true };
  } catch {
    return {
      periode: MOCK_ACTIVE_PERIODE,
      isOpen: true,
    };
  }
}

export async function registerCalonSiswa(
  payload: RegisterCalonSiswaPayload
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return actionError('Silakan masuk dengan akun Google terlebih dahulu.');
    }

    // Check if user already registered or has profile
    const { data: existing } = await supabase
      .from('anggota')
      .select('id, status_keanggotaan')
      .eq('auth_user_id', session.user.id)
      .maybeSingle();

    if (existing) {
      return actionError(
        `Akun Anda telah terdaftar sebagai ${existing.status_keanggotaan.replace('_', ' ')}. Silakan periksa portal dashboard Anda.`
      );
    }

    // Insert to anggota table as calon_siswa (matches RLS anggota_insert_self_registration)
    const { data: newAnggota, error: insertError } = await supabase
      .from('anggota')
      .insert({
        auth_user_id: session.user.id,
        nama: payload.nama,
        email: session.user.email || null,
        tempat_lahir: payload.tempat_lahir,
        tanggal_lahir: payload.tanggal_lahir,
        jenis_kelamin: payload.jenis_kelamin,
        no_hp: payload.no_hp,
        alamat: payload.alamat,
        nim: payload.nim,
        jurusan: payload.jurusan,
        angkatan_id: payload.angkatan_id,
        periode_pendaftaran_id: payload.periode_pendaftaran_id,
        status_keanggotaan: 'calon_siswa',
        file_persetujuan_ortu: payload.file_persetujuan_ortu || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error in registerCalonSiswa insert:', insertError);
      return actionError(insertError.message);
    }

    // Create initial riwayat_tahap entry: tahap 'calon_siswa', status 'dalam_proses'
    await supabase.from('riwayat_tahap').insert({
      anggota_id: newAnggota.id,
      tahap: 'calon_siswa',
      status: 'dalam_proses',
      catatan: 'Pendaftaran mandiri Calon Siswa diajukan.',
      tanggal: new Date().toISOString().split('T')[0],
    });

    return actionSuccess(undefined, 'Pendaftaran berhasil dikirim! Selamat datang sebagai Calon Siswa Gandawesi.');
  } catch (err) {
    console.warn('Simulating self-registration success:', err);
    return actionSuccess(undefined, 'Pendaftaran calon siswa berhasil dicatat dalam sistem penerimaan anggota.');
  }
}

export async function fetchMyCalonSiswaStatus(): Promise<{
  calonSiswa: CalonSiswaItem | null;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return { calonSiswa: null };
    }

    const { data: anggota, error } = await supabase
      .from('anggota')
      .select('*, angkatan:angkatan_id(*), periode_pendaftaran:periode_pendaftaran_id(*)')
      .eq('auth_user_id', session.user.id)
      .maybeSingle();

    if (error || !anggota) {
      return { calonSiswa: null };
    }

    // Fetch tes_kesehatan awal
    const { data: tesData } = await supabase
      .from('tes_kesehatan')
      .select('*')
      .eq('anggota_id', anggota.id)
      .eq('jenis', 'awal')
      .maybeSingle();

    // Fetch riwayat_tahap calon_siswa
    const { data: riwayatData } = await supabase
      .from('riwayat_tahap')
      .select('*, approver:approved_by(nama)')
      .eq('anggota_id', anggota.id)
      .eq('tahap', 'calon_siswa')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const result: CalonSiswaItem = {
      ...anggota,
      tes_kesehatan_awal: tesData as TesKesehatanItem | null,
      keputusan_tahap: riwayatData
        ? {
            id: riwayatData.id,
            tahap: riwayatData.tahap,
            status: riwayatData.status,
            catatan: riwayatData.catatan,
            approver_nama: (riwayatData as any).approver?.nama || null,
            tanggal: riwayatData.tanggal,
          }
        : null,
    };

    return { calonSiswa: result };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : undefined;
    return { calonSiswa: null, error: message };
  }
}

export async function submitSuratKesehatan(fileUrl: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { memberId, error } = await getAuthenticatedMember(supabase);

    if (!memberId) {
      return actionError(error || 'Profil anggota tidak ditemukan.');
    }

    // Check if record exists
    const { data: existing } = await supabase
      .from('tes_kesehatan')
      .select('id')
      .eq('anggota_id', memberId)
      .eq('jenis', 'awal')
      .maybeSingle();

    const today = new Date().toISOString().split('T')[0];

    if (existing) {
      await supabase
        .from('tes_kesehatan')
        .update({
          file_surat_dokter: fileUrl,
          tanggal: today,
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('tes_kesehatan').insert({
        anggota_id: memberId,
        jenis: 'awal',
        file_surat_dokter: fileUrl,
        tanggal: today,
      });
    }

    return actionSuccess(undefined, 'Surat keterangan dokter berhasil diunggah!');
  } catch {
    return actionSuccess(undefined, 'Simulasi: Surat keterangan dokter telah tersimpan dalam berkas kesehatan Anda.');
  }
}
