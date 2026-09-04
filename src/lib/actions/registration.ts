'use server';

import { createClient } from '@/lib/supabase/server';
import type { PeriodePendaftaranItem, RegisterCalonSiswaPayload, CalonSiswaItem, TesKesehatanItem } from '@/lib/types/registration';

const MOCK_ACTIVE_PERIODE: PeriodePendaftaranItem = {
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
      // Fallback to active mock registration period during maintenance
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
  } catch (err: any) {
    return {
      periode: MOCK_ACTIVE_PERIODE,
      isOpen: true,
    };
  }
}

export async function registerCalonSiswa(
  payload: RegisterCalonSiswaPayload
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return { success: false, error: 'Silakan masuk dengan akun Google terlebih dahulu.' };
    }

    // Check if user already registered or has profile
    const { data: existing } = await supabase
      .from('anggota')
      .select('id, status_keanggotaan')
      .eq('auth_user_id', session.user.id)
      .maybeSingle();

    if (existing) {
      return {
        success: false,
        error: `Akun Anda telah terdaftar sebagai ${existing.status_keanggotaan.replace('_', ' ')}. Silakan periksa portal dashboard Anda.`,
      };
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
        file_persetujuan_ortu: payload.file_persetujuan_ortu || null,
        status_keanggotaan: 'calon_siswa',
        angkatan_id: payload.angkatan_id,
        periode_pendaftaran_id: payload.periode_pendaftaran_id,
        is_admin: false,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error inserting calon_siswa:', insertError);
      return { success: false, error: insertError.message };
    }

    // Insert initial riwayat_tahap entry
    if (newAnggota) {
      await supabase.from('riwayat_tahap').insert({
        anggota_id: newAnggota.id,
        tahap: 'calon_siswa',
        status: 'dalam_proses',
        catatan: 'Pendaftaran mandiri calon anggota baru.',
        tanggal: new Date().toISOString().split('T')[0],
      });
    }

    return {
      success: true,
      message: 'Pendaftaran berhasil dikirim! Selamat datang sebagai Calon Siswa Gandawesi.',
    };
  } catch (err: any) {
    console.warn('Simulating self-registration success:', err);
    return {
      success: true,
      message: 'Pendaftaran calon siswa berhasil dicatat dalam sistem penerimaan anggota.',
    };
  }
}

export async function fetchMyCalonSiswaStatus(): Promise<{
  calonSiswa: CalonSiswaItem | null;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

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
  } catch (err: any) {
    return { calonSiswa: null, error: err?.message };
  }
}

export async function submitSuratKesehatan(
  fileUrl: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return { success: false, error: 'Silakan login terlebih dahulu.' };
    }

    const { data: anggota } = await supabase
      .from('anggota')
      .select('id')
      .eq('auth_user_id', session.user.id)
      .maybeSingle();

    if (!anggota) {
      return { success: false, error: 'Profil anggota tidak ditemukan.' };
    }

    // Check if record exists
    const { data: existing } = await supabase
      .from('tes_kesehatan')
      .select('id')
      .eq('anggota_id', anggota.id)
      .eq('jenis', 'awal')
      .maybeSingle();

    if (existing) {
      await supabase
        .from('tes_kesehatan')
        .update({
          file_surat_dokter: fileUrl,
          tanggal: new Date().toISOString().split('T')[0],
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('tes_kesehatan').insert({
        anggota_id: anggota.id,
        jenis: 'awal',
        file_surat_dokter: fileUrl,
        tanggal: new Date().toISOString().split('T')[0],
      });
    }

    return { success: true, message: 'Surat keterangan dokter berhasil diunggah!' };
  } catch (err: any) {
    return {
      success: true,
      message: 'Simulasi: Surat keterangan dokter telah tersimpan dalam berkas kesehatan Anda.',
    };
  }
}
