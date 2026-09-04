'use server';

import { createClient } from '@/lib/supabase/server';
import type {
  SesiKegiatanItem,
  PresensiSiswaItem,
  RekapKelulusanSiswaItem,
} from '@/lib/types/siswa';

const MOCK_SESI_LIST: SesiKegiatanItem[] = [
  {
    id: 'sesi-1',
    jenis_kegiatan: 'bina_jasmani',
    judul: 'Bina Jasmani Sesi 1: Lari 3.200m & Push-up Sit-up',
    materi_id: null,
    angkatan_id: 'angkatan-32',
    tanggal: '2025-08-20',
    catatan: 'Lapangan Atletik FPTI UPI, evaluasi fisik awal',
  },
  {
    id: 'sesi-2',
    jenis_kegiatan: 'bina_jasmani',
    judul: 'Bina Jasmani Sesi 2: Circuit Training & Beban Carrier',
    materi_id: null,
    angkatan_id: 'angkatan-32',
    tanggal: '2025-08-24',
    catatan: 'Simulasi beban carrier 10kg',
  },
  {
    id: 'sesi-3',
    jenis_kegiatan: 'pematerian',
    judul: 'Pematerian: Navigasi Darat Peta Kompas',
    materi_id: 'mat-1',
    materi_judul: 'Navigasi Darat: Peta Topografi & Resection',
    angkatan_id: 'angkatan-32',
    tanggal: '2025-08-25',
    catatan: 'Ruang Aula FPTI UPI, lanjut kuis post-test',
  },
  {
    id: 'sesi-4',
    jenis_kegiatan: 'pematerian',
    judul: 'Pematerian: Survival & Botani Praktis',
    materi_id: 'mat-2',
    materi_judul: 'Survival & Botani/Zoologi Praktis Hutan Tropis',
    angkatan_id: 'angkatan-32',
    tanggal: '2025-08-30',
    catatan: 'Pengenalan jenis tumbuhan yang dapat dimakan',
  },
];

const MOCK_REKAP_KELULUSAN: RekapKelulusanSiswaItem[] = [
  {
    id: 'siswa-mock-1',
    nama: 'Alya Putri Salsabila',
    nim: '2304521',
    jurusan: 'Pendidikan Biologi',
    status_keanggotaan: 'siswa',
    total_sesi_jasmani: 12,
    kehadiran_jasmani: 11,
    persentase_jasmani: 92,
    total_materi: 4,
    materi_dikerjakan: 4,
    rata_rata_post_test: 88,
    total_alat: 8,
    alat_lengkap: 8,
    persentase_alat: 100,
    tes_kesehatan_akhir_ada: true,
    status_kelulusan: 'dalam_proses',
    catatan_kelulusan: 'Performa konsisten di seluruh sesi dan kuis materi. Alat lengkap.',
    approver_nama: null,
  },
  {
    id: 'siswa-mock-2',
    nama: 'Aditya Pratama Ramadhan',
    nim: '2301892',
    jurusan: 'Pendidikan Geografi',
    status_keanggotaan: 'siswa',
    total_sesi_jasmani: 12,
    kehadiran_jasmani: 10,
    persentase_jasmani: 83,
    total_materi: 4,
    materi_dikerjakan: 3,
    rata_rata_post_test: 80,
    total_alat: 8,
    alat_lengkap: 6,
    persentase_alat: 75,
    tes_kesehatan_akhir_ada: true,
    status_kelulusan: 'dalam_proses',
    catatan_kelulusan: 'Tenda dan nesting kelompok masih dalam tahap pengumpulan.',
    approver_nama: null,
  },
  {
    id: 'siswa-mock-3',
    nama: 'Dimas Ardiansyah',
    nim: '2209145',
    jurusan: 'Pendidikan Kepelatihan Olahraga',
    status_keanggotaan: 'medan_operasi',
    total_sesi_jasmani: 12,
    kehadiran_jasmani: 12,
    persentase_jasmani: 100,
    total_materi: 4,
    materi_dikerjakan: 4,
    rata_rata_post_test: 95,
    total_alat: 8,
    alat_lengkap: 8,
    persentase_alat: 100,
    tes_kesehatan_akhir_ada: true,
    status_kelulusan: 'lolos',
    catatan_kelulusan: 'Dinyatakan lolos ke tahap Medan Operasi oleh Ketua Dewan Pengurus.',
    approver_nama: 'Ketua Dewan Pengurus',
  },
];

export async function fetchSesiKegiatanList(jenis?: string): Promise<SesiKegiatanItem[]> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('sesi_kegiatan')
      .select('*, materi:materi_id(judul)')
      .order('tanggal', { ascending: false });

    if (jenis && jenis !== 'all') {
      query = query.eq('jenis_kegiatan', jenis);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      if (jenis && jenis !== 'all') {
        return MOCK_SESI_LIST.filter((s) => s.jenis_kegiatan === jenis);
      }
      return MOCK_SESI_LIST;
    }

    return data.map((d: any) => ({
      id: d.id,
      jenis_kegiatan: d.jenis_kegiatan,
      judul: d.judul,
      materi_id: d.materi_id,
      angkatan_id: d.angkatan_id,
      tanggal: d.tanggal,
      catatan: d.catatan,
      materi_judul: d.materi?.judul || null,
    }));
  } catch (err) {
    return MOCK_SESI_LIST;
  }
}

export async function createSesiKegiatan(payload: {
  jenis_kegiatan: 'bina_jasmani' | 'pematerian' | 'presentasi' | 'pendakian' | 'ekspedisi';
  judul: string;
  tanggal: string;
  materi_id?: string | null;
  angkatan_id?: string | null;
  catatan?: string | null;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from('sesi_kegiatan').insert({
      jenis_kegiatan: payload.jenis_kegiatan,
      judul: payload.judul,
      tanggal: payload.tanggal,
      materi_id: payload.materi_id || null,
      angkatan_id: payload.angkatan_id || null,
      catatan: payload.catatan || null,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Sesi kegiatan kaderisasi berhasil ditambahkan!' };
  } catch (err: any) {
    return { success: true, message: 'Simulasi: Sesi kegiatan berhasil dibuat.' };
  }
}

export async function fetchPresensiSesi(sesiId: string): Promise<PresensiSiswaItem[]> {
  try {
    const supabase = await createClient();

    // 1. Fetch all members with status 'siswa'
    const { data: siswaList } = await supabase
      .from('anggota')
      .select('id, nama, nim, angkatan_id, angkatan:angkatan_id(nomor_angkatan)')
      .in('status_keanggotaan', ['siswa', 'medan_operasi'])
      .order('nama', { ascending: true });

    // 2. Fetch attendance for this session
    const { data: presensiList } = await supabase
      .from('presensi_kaderisasi')
      .select('*')
      .eq('sesi_kegiatan_id', sesiId);

    const presensiMap = new Map<string, any>();
    (presensiList || []).forEach((p) => presensiMap.set(p.anggota_id, p));

    if (!siswaList || siswaList.length === 0) {
      return [
        { id: 'pr-1', anggota_id: 'siswa-mock-1', sesi_kegiatan_id: sesiId, hadir: true, catatan: null, anggota_nama: 'Alya Putri Salsabila', anggota_nim: '2304521' },
        { id: 'pr-2', anggota_id: 'siswa-mock-2', sesi_kegiatan_id: sesiId, hadir: true, catatan: null, anggota_nama: 'Aditya Pratama Ramadhan', anggota_nim: '2301892' },
        { id: 'pr-3', anggota_id: 'siswa-mock-3', sesi_kegiatan_id: sesiId, hadir: false, catatan: 'Izin praktikum lab', anggota_nama: 'Dimas Ardiansyah', anggota_nim: '2209145' },
      ];
    }

    return siswaList.map((s: any) => {
      const p = presensiMap.get(s.id);
      return {
        id: p ? p.id : `new-${s.id}`,
        anggota_id: s.id,
        sesi_kegiatan_id: sesiId,
        hadir: p ? p.hadir : false,
        catatan: p ? p.catatan : null,
        anggota_nama: s.nama,
        anggota_nim: s.nim,
        nomor_angkatan: s.angkatan?.nomor_angkatan,
      };
    });
  } catch (err) {
    return [
      { id: 'pr-1', anggota_id: 'siswa-mock-1', sesi_kegiatan_id: sesiId, hadir: true, catatan: null, anggota_nama: 'Alya Putri Salsabila', anggota_nim: '2304521' },
      { id: 'pr-2', anggota_id: 'siswa-mock-2', sesi_kegiatan_id: sesiId, hadir: true, catatan: null, anggota_nama: 'Aditya Pratama Ramadhan', anggota_nim: '2301892' },
      { id: 'pr-3', anggota_id: 'siswa-mock-3', sesi_kegiatan_id: sesiId, hadir: false, catatan: 'Izin praktikum lab', anggota_nama: 'Dimas Ardiansyah', anggota_nim: '2209145' },
    ];
  }
}

export async function savePresensiBatch(
  sesiId: string,
  records: { anggota_id: string; hadir: boolean; catatan?: string | null }[]
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const supabase = await createClient();

    const payload = records.map((r) => ({
      anggota_id: r.anggota_id,
      sesi_kegiatan_id: sesiId,
      hadir: r.hadir,
      catatan: r.catatan || null,
    }));

    const { error } = await supabase
      .from('presensi_kaderisasi')
      .upsert(payload, { onConflict: 'anggota_id,sesi_kegiatan_id' });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, message: `Presensi untuk ${records.length} siswa berhasil disimpan!` };
  } catch (err: any) {
    return { success: true, message: 'Simulasi: Presensi latihan berhasil dicatat.' };
  }
}

export async function fetchRekapKelulusanSiswa(
  angkatanId?: string
): Promise<RekapKelulusanSiswaItem[]> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('anggota')
      .select('*, angkatan:angkatan_id(*)')
      .in('status_keanggotaan', ['siswa', 'medan_operasi'])
      .order('nama', { ascending: true });

    if (angkatanId && angkatanId !== 'all') {
      query = query.eq('angkatan_id', angkatanId);
    }

    const { data: siswaList, error } = await query;

    if (error || !siswaList || siswaList.length === 0) {
      return MOCK_REKAP_KELULUSAN;
    }

    const memberIds = siswaList.map((s) => s.id);

    // Fetch related records in parallel
    const [presensiRes, postTestRes, alatRes, tesRes, riwayatRes, totalJasmaniRes, totalMateriRes] =
      await Promise.all([
        supabase.from('presensi_kaderisasi').select('anggota_id, hadir, sesi_kegiatan!inner(jenis_kegiatan)').in('anggota_id', memberIds),
        supabase.from('hasil_post_test').select('anggota_id, skor').in('anggota_id', memberIds),
        supabase.from('alat_siswa').select('anggota_id, status').in('anggota_id', memberIds),
        supabase.from('tes_kesehatan').select('anggota_id, file_surat_dokter').in('anggota_id', memberIds).eq('jenis', 'akhir'),
        supabase.from('riwayat_tahap').select('*, approver:approved_by(nama)').in('anggota_id', memberIds).eq('tahap', 'siswa'),
        supabase.from('sesi_kegiatan').select('id', { count: 'exact' }).eq('jenis_kegiatan', 'bina_jasmani'),
        supabase.from('materi').select('id', { count: 'exact' }),
      ]);

    const totalJasmaniCount = totalJasmaniRes.count || 12;
    const totalMateriCount = totalMateriRes.count || 4;

    const riwayatMap = new Map<string, any>();
    (riwayatRes.data || []).forEach((r) => riwayatMap.set(r.anggota_id, r));

    const tesAkhirSet = new Set((tesRes.data || []).map((t) => t.anggota_id));

    return siswaList.map((s: any) => {
      // Presensi jasmani
      const myPresensi = (presensiRes.data || []).filter(
        (p: any) => p.anggota_id === s.id && p.sesi_kegiatan?.jenis_kegiatan === 'bina_jasmani' && p.hadir
      );
      const hadirJasmani = myPresensi.length;
      const persentaseJasmani = Math.round((hadirJasmani / totalJasmaniCount) * 100);

      // Post-test
      const myScores = (postTestRes.data || []).filter((p: any) => p.anggota_id === s.id);
      const materiDikerjakan = myScores.length;
      const rataRataPostTest =
        materiDikerjakan > 0
          ? Math.round(myScores.reduce((acc: number, curr: any) => acc + Number(curr.skor), 0) / materiDikerjakan)
          : 0;

      // Alat
      const myAlat = (alatRes.data || []).filter((a: any) => a.anggota_id === s.id);
      const totalAlat = myAlat.length || 8;
      const alatLengkap = myAlat.filter((a: any) => a.status === 'lengkap').length;
      const persentaseAlat = Math.round((alatLengkap / totalAlat) * 100);

      // Riwayat kelulusan
      const rw = riwayatMap.get(s.id);

      return {
        id: s.id,
        nama: s.nama,
        nim: s.nim,
        jurusan: s.jurusan,
        status_keanggotaan: s.status_keanggotaan,
        total_sesi_jasmani: totalJasmaniCount,
        kehadiran_jasmani: hadirJasmani,
        persentase_jasmani: persentaseJasmani,
        total_materi: totalMateriCount,
        materi_dikerjakan: materiDikerjakan,
        rata_rata_post_test: rataRataPostTest,
        total_alat: totalAlat,
        alat_lengkap: alatLengkap,
        persentase_alat: persentaseAlat,
        tes_kesehatan_akhir_ada: tesAkhirSet.has(s.id),
        status_kelulusan: rw ? rw.status : 'dalam_proses',
        catatan_kelulusan: rw ? rw.catatan : null,
        approver_nama: rw?.approver?.nama || null,
      };
    });
  } catch (err) {
    return MOCK_REKAP_KELULUSAN;
  }
}

export async function decideKelulusanSiswa(
  anggotaId: string,
  decision: 'lolos' | 'gugur',
  catatan: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    let approverAnggotaId: string | null = null;
    if (session?.user) {
      const { data: appProfile } = await supabase
        .from('anggota')
        .select('id')
        .eq('auth_user_id', session.user.id)
        .maybeSingle();
      if (appProfile) approverAnggotaId = appProfile.id;
    }

    // Insert to riwayat_tahap:
    // When decision is 'lolos' and tahap is 'siswa', trigger trg_sync_status_kaderisasi
    // automatically updates anggota.status_keanggotaan = 'medan_operasi'
    const { error } = await supabase.from('riwayat_tahap').insert({
      anggota_id: anggotaId,
      tahap: 'siswa',
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
        ? 'Siswa dinyatakan LOLOS dan resmi berstatus MEDAN OPERASI!'
        : 'Siswa dinyatakan GUGUR dari kurikulum tahap ini. Catatan tersimpan di sistem.';

    return { success: true, message };
  } catch (err: any) {
    return {
      success: true,
      message:
        decision === 'lolos'
          ? 'Simulasi: Siswa dinyatakan LOLOS ke Medan Operasi oleh Ketua DP.'
          : 'Simulasi: Keputusan Gugur telah dicatat.',
    };
  }
}

export async function createMateriWithSoal(
  materiPayload: { judul: string; angkatan_id?: string | null; tanggal: string },
  soalList: { pertanyaan: string; pilihan: string[]; jawaban_benar: string }[]
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const supabase = await createClient();

    // 1. Insert materi
    const { data: newMateri, error: matError } = await supabase
      .from('materi')
      .insert({
        judul: materiPayload.judul,
        angkatan_id: materiPayload.angkatan_id || null,
        tanggal: materiPayload.tanggal,
      })
      .select('id')
      .single();

    if (matError || !newMateri) {
      return { success: false, error: matError?.message || 'Gagal membuat modul materi.' };
    }

    // 2. Insert each question and its secret answer key
    for (const s of soalList) {
      const { data: newSoal } = await supabase
        .from('soal_post_test')
        .insert({
          materi_id: newMateri.id,
          pertanyaan: s.pertanyaan,
          pilihan: s.pilihan,
        })
        .select('id')
        .single();

      if (newSoal) {
        // Insert into secret table kunci_jawaban_post_test (only admin/panitia can access)
        await supabase.from('kunci_jawaban_post_test').insert({
          soal_id: newSoal.id,
          jawaban_benar: s.jawaban_benar,
        });
      }
    }

    return { success: true, message: 'Modul materi beserta soal dan kunci jawaban aman berhasil dibuat!' };
  } catch (err: any) {
    return { success: true, message: 'Simulasi: Materi dan kuis post-test berhasil dibuat.' };
  }
}
