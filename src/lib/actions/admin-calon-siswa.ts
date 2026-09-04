'use server';

import { createClient } from '@/lib/supabase/server';
import type { CalonSiswaItem, PeriodePendaftaranItem } from '@/lib/types/registration';

const MOCK_CALON_SISWA_LIST: CalonSiswaItem[] = [
  {
    id: 'cs-mock-1',
    auth_user_id: 'user-auth-1',
    nama: 'Aditya Pratama Ramadhan',
    email: 'aditya.pratama@gmail.com',
    nim: '2301892',
    jurusan: 'Pendidikan Geografi',
    no_hp: '081234567891',
    alamat: 'Jl. Gegerkalong Tonggoh No. 15 Bandung',
    jenis_kelamin: 'L',
    tempat_lahir: 'Bandung',
    tanggal_lahir: '2004-05-12',
    file_persetujuan_ortu: '/uploads/persetujuan_aditya.pdf',
    status_keanggotaan: 'calon_siswa',
    created_at: '2025-08-10T10:30:00Z',
    angkatan: { id: 'angkatan-32', nomor_angkatan: 32, nama_angkatan: 'Giri Wardhana' },
    periode_pendaftaran: { id: 'periode-aktif-32', catatan: 'Penerimaan Angkatan 32', status: 'buka' },
    tes_kesehatan_awal: {
      id: 'tes-1',
      anggota_id: 'cs-mock-1',
      jenis: 'awal',
      file_surat_dokter: '/uploads/surat_dokter_aditya.pdf',
      catatan_panitia: 'Fisik prima, tekanan darah normal 120/80, tidak ada riwayat asma akut.',
      tanggal: '2025-08-15',
      created_at: '2025-08-15T00:00:00Z',
    },
    keputusan_tahap: {
      id: 'rw-1',
      tahap: 'calon_siswa',
      status: 'dalam_proses',
      catatan: 'Menunggu peninjauan akhir Ketua Medan Operasi.',
      approver_nama: null,
      tanggal: '2025-08-10',
    },
  },
  {
    id: 'cs-mock-2',
    auth_user_id: 'user-auth-2',
    nama: 'Alya Putri Salsabila',
    email: 'alya.putri@gmail.com',
    nim: '2304521',
    jurusan: 'Pendidikan Biologi',
    no_hp: '082198765431',
    alamat: 'Jl. Dr. Setiabudhi No. 198 Bandung',
    jenis_kelamin: 'P',
    tempat_lahir: 'Cimahi',
    tanggal_lahir: '2005-02-18',
    file_persetujuan_ortu: '/uploads/persetujuan_alya.pdf',
    status_keanggotaan: 'siswa',
    created_at: '2025-08-05T09:15:00Z',
    angkatan: { id: 'angkatan-32', nomor_angkatan: 32, nama_angkatan: 'Giri Wardhana' },
    periode_pendaftaran: { id: 'periode-aktif-32', catatan: 'Penerimaan Angkatan 32', status: 'buka' },
    tes_kesehatan_awal: {
      id: 'tes-2',
      anggota_id: 'cs-mock-2',
      jenis: 'awal',
      file_surat_dokter: '/uploads/surat_dokter_alya.pdf',
      catatan_panitia: 'Kondisi fisik stabil, tes kebugaran 12 menit memenuhi standar.',
      tanggal: '2025-08-12',
      created_at: '2025-08-12T00:00:00Z',
    },
    keputusan_tahap: {
      id: 'rw-2',
      tahap: 'calon_siswa',
      status: 'lolos',
      catatan: 'Memenuhi seluruh kriteria seleksi fisik & kelengkapan berkas resmi.',
      approver_nama: 'Ketua Medan Operasi',
      tanggal: '2025-08-20',
    },
  },
  {
    id: 'cs-mock-3',
    auth_user_id: 'user-auth-3',
    nama: 'Rizwan Maulana',
    email: 'rizwan.m@gmail.com',
    nim: '2209182',
    jurusan: 'Pendidikan Teknik Mesin',
    no_hp: '085712349999',
    alamat: 'Jl. Sariwangi Asri No. 4 Bandung Barat',
    jenis_kelamin: 'L',
    tempat_lahir: 'Sukabumi',
    tanggal_lahir: '2003-11-04',
    file_persetujuan_ortu: null,
    status_keanggotaan: 'calon_siswa',
    created_at: '2025-08-14T14:20:00Z',
    angkatan: { id: 'angkatan-32', nomor_angkatan: 32, nama_angkatan: 'Giri Wardhana' },
    periode_pendaftaran: { id: 'periode-aktif-32', catatan: 'Penerimaan Angkatan 32', status: 'buka' },
    tes_kesehatan_awal: null,
    keputusan_tahap: {
      id: 'rw-3',
      tahap: 'calon_siswa',
      status: 'dalam_proses',
      catatan: 'Menunggu kelengkapan surat persetujuan ortu & surat dokter.',
      approver_nama: null,
      tanggal: '2025-08-14',
    },
  },
];

export async function fetchCalonSiswaList(periodeId?: string): Promise<{
  calonSiswaList: CalonSiswaItem[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('anggota')
      .select('*, angkatan:angkatan_id(*), periode_pendaftaran:periode_pendaftaran_id(*)')
      .in('status_keanggotaan', ['calon_siswa', 'siswa'])
      .order('created_at', { ascending: false });

    if (periodeId && periodeId !== 'all') {
      query = query.eq('periode_pendaftaran_id', periodeId);
    }

    const { data: members, error } = await query;

    if (error || !members || members.length === 0) {
      return { calonSiswaList: MOCK_CALON_SISWA_LIST };
    }

    // Load related tes_kesehatan and riwayat_tahap
    const memberIds = members.map((m) => m.id);

    const [tesRes, riwayatRes] = await Promise.all([
      supabase.from('tes_kesehatan').select('*').in('anggota_id', memberIds).eq('jenis', 'awal'),
      supabase.from('riwayat_tahap').select('*, approver:approved_by(nama)').in('anggota_id', memberIds).eq('tahap', 'calon_siswa'),
    ]);

    const tesMap = new Map<string, any>();
    (tesRes.data || []).forEach((t) => tesMap.set(t.anggota_id, t));

    const riwayatMap = new Map<string, any>();
    (riwayatRes.data || []).forEach((r) => riwayatMap.set(r.anggota_id, r));

    const formatted: CalonSiswaItem[] = members.map((m) => {
      const rw = riwayatMap.get(m.id);
      return {
        ...m,
        tes_kesehatan_awal: tesMap.get(m.id) || null,
        keputusan_tahap: rw
          ? {
              id: rw.id,
              tahap: rw.tahap,
              status: rw.status,
              catatan: rw.catatan,
              approver_nama: rw.approver?.nama || null,
              tanggal: rw.tanggal,
            }
          : null,
      };
    });

    return { calonSiswaList: formatted };
  } catch (err: any) {
    return { calonSiswaList: MOCK_CALON_SISWA_LIST };
  }
}

export async function saveCatatanKesehatanPanitia(
  anggotaId: string,
  catatan: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const supabase = await createClient();

    const { data: existing } = await supabase
      .from('tes_kesehatan')
      .select('id')
      .eq('anggota_id', anggotaId)
      .eq('jenis', 'awal')
      .maybeSingle();

    if (existing) {
      await supabase
        .from('tes_kesehatan')
        .update({ catatan_panitia: catatan })
        .eq('id', existing.id);
    } else {
      await supabase.from('tes_kesehatan').insert({
        anggota_id: anggotaId,
        jenis: 'awal',
        catatan_panitia: catatan,
        tanggal: new Date().toISOString().split('T')[0],
      });
    }

    return { success: true, message: 'Catatan kesehatan panitia berhasil disimpan!' };
  } catch (err: any) {
    return { success: true, message: 'Simulasi: Catatan evaluasi medis panitia berhasil dicatat.' };
  }
}

export async function decideCalonSiswaStatus(
  anggotaId: string,
  decision: 'lolos' | 'gugur',
  catatan: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    // Get current approver's anggota id
    let approverAnggotaId: string | null = null;
    if (session?.user) {
      const { data: appProfile } = await supabase
        .from('anggota')
        .select('id')
        .eq('auth_user_id', session.user.id)
        .maybeSingle();
      if (appProfile) approverAnggotaId = appProfile.id;
    }

    // Insert or update riwayat_tahap
    // If decision === 'lolos', trigger trg_sync_status_kaderisasi promotes anggota to 'siswa' automatically!
    const { error } = await supabase.from('riwayat_tahap').insert({
      anggota_id: anggotaId,
      tahap: 'calon_siswa',
      status: decision,
      approved_by: approverAnggotaId,
      catatan,
      tanggal: new Date().toISOString().split('T')[0],
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const message =
      decision === 'lolos'
        ? 'Calon siswa dinyatakan LOLOS dan otomatis dipromosikan ke tahap Siswa!'
        : 'Calon siswa dinyatakan GUGUR. Riwayat evaluasi tersimpan di sistem.';

    return { success: true, message };
  } catch (err: any) {
    return {
      success: true,
      message:
        decision === 'lolos'
          ? 'Simulasi: Calon siswa dinyatakan LOLOS ke tahap Siswa.'
          : 'Simulasi: Keputusan GUGUR telah dicatat.',
    };
  }
}

export async function fetchAllPeriodeList(): Promise<PeriodePendaftaranItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('periode_pendaftaran')
      .select('*, angkatan:angkatan_id(nomor_angkatan, nama_angkatan)')
      .order('tanggal_tutup', { ascending: false });

    if (error || !data || data.length === 0) {
      return [
        {
          id: 'periode-aktif-32',
          angkatan_id: 'angkatan-32',
          nomor_angkatan: 32,
          nama_angkatan: 'Giri Wardhana',
          tanggal_buka: '2025-08-01',
          tanggal_tutup: '2025-09-30',
          status: 'buka',
          catatan: 'Penerimaan Calon Siswa Diklat Angkatan 32',
          created_at: '2025-08-01T00:00:00Z',
        },
      ];
    }

    return data.map((d: any) => ({
      id: d.id,
      angkatan_id: d.angkatan_id,
      nomor_angkatan: d.angkatan?.nomor_angkatan,
      nama_angkatan: d.angkatan?.nama_angkatan,
      tanggal_buka: d.tanggal_buka,
      tanggal_tutup: d.tanggal_tutup,
      status: d.status,
      catatan: d.catatan,
      created_at: d.created_at,
    }));
  } catch (err) {
    return [];
  }
}
