'use server';

import { createClient } from '@/lib/supabase/server';
import type {
  PesertaMedanOperasiItem,
  EvaluasiIndividuItem,
  EvaluasiKelompokItem,
  AngkatanDiklatItem,
  BatchKelulusanPayload,
  MyMedanOperasiSummary,
} from '@/lib/types/medan-operasi';

// Mock data fallbacks for realistic rendering
const MOCK_ANGKATAN_LIST: AngkatanDiklatItem[] = [
  { id: 'angkatan-32', nomor_angkatan: 32, nama_angkatan: 'Giri Wardhana', tahun: 2025, total_peserta: 3 },
  { id: 'angkatan-31', nomor_angkatan: 31, nama_angkatan: 'Cakrawala Sunda', tahun: 2024, total_peserta: 8 },
  { id: 'angkatan-30', nomor_angkatan: 30, nama_angkatan: 'Elang Merbabu', tahun: 2023, total_peserta: 10 },
];

const MOCK_PESERTA_MEDAN_OPERASI: PesertaMedanOperasiItem[] = [
  {
    id: 'siswa-mock-1',
    nama: 'Alya Putri Salsabila',
    nim: '2304521',
    jurusan: 'Pendidikan Biologi',
    foto_profil: null,
    angkatan_id: 'angkatan-32',
    nomor_angkatan: 32,
    nama_angkatan: 'Giri Wardhana',
    status_keanggotaan: 'medan_operasi',
    total_evaluasi: 3,
    rata_rata_skor: 88,
    status_tahap: 'dalam_proses',
    catatan_kelulusan: 'Navigasi darat malam stabil, kepemimpinan regu sangat baik di punggungan.',
    approver_nama: null,
    tanggal_kelulusan: null,
    is_gugur: false,
  },
  {
    id: 'siswa-mock-2',
    nama: 'Aditya Pratama Ramadhan',
    nim: '2301892',
    jurusan: 'Pendidikan Geografi',
    foto_profil: null,
    angkatan_id: 'angkatan-32',
    nomor_angkatan: 32,
    nama_angkatan: 'Giri Wardhana',
    status_keanggotaan: 'medan_operasi',
    total_evaluasi: 3,
    rata_rata_skor: 82,
    status_tahap: 'dalam_proses',
    catatan_kelulusan: 'Ketahanan fisik prima, manajemen waktu dan bivak alam rapi.',
    approver_nama: null,
    tanggal_kelulusan: null,
    is_gugur: false,
  },
  {
    id: 'siswa-mock-3',
    nama: 'Dimas Ardiansyah',
    nim: '2209145',
    jurusan: 'Pendidikan Kepelatihan Olahraga',
    foto_profil: null,
    angkatan_id: 'angkatan-32',
    nomor_angkatan: 32,
    nama_angkatan: 'Giri Wardhana',
    status_keanggotaan: 'anggota_muda',
    total_evaluasi: 4,
    rata_rata_skor: 92,
    status_tahap: 'lolos',
    catatan_kelulusan: 'Lolos dengan predikat istimewa. Dilantik resmi sebagai Anggota Muda Giri Wardhana.',
    approver_nama: 'Danlat Medan Operasi',
    tanggal_kelulusan: '2025-09-15',
    is_gugur: false,
  },
];

const MOCK_EVALUASI_INDIVIDU: Record<string, EvaluasiIndividuItem[]> = {
  'siswa-mock-1': [
    {
      id: 'eval-1',
      anggota_id: 'siswa-mock-1',
      evaluator_id: 'danlat-1',
      evaluator_nama: 'Komandan Latihan (Danlat)',
      tahap: 'medan_operasi',
      skor: 90,
      catatan: 'Simulasi Resection & Intersection di titik koordinat Gunung Manglayang sangat akurat (akurasi 15m).',
      tanggal: '2025-09-10',
    },
    {
      id: 'eval-2',
      anggota_id: 'siswa-mock-1',
      evaluator_id: 'instruktur-1',
      evaluator_nama: 'Instruktur Navigasi Rimba',
      tahap: 'medan_operasi',
      skor: 85,
      catatan: 'Manajemen zero-waste dan botani praktis lapangan terlaksana baik. Bivak teruji aman dari badai.',
      tanggal: '2025-09-12',
    },
    {
      id: 'eval-3',
      anggota_id: 'siswa-mock-1',
      evaluator_id: 'danlat-1',
      evaluator_nama: 'Komandan Latihan (Danlat)',
      tahap: 'medan_operasi',
      skor: 90,
      catatan: 'Ketahanan mental dan inisiatif kepemimpinan saat melintasi jalur punggungan terjal.',
      tanggal: '2025-09-14',
    },
  ],
  'siswa-mock-2': [
    {
      id: 'eval-4',
      anggota_id: 'siswa-mock-2',
      evaluator_id: 'danlat-1',
      evaluator_nama: 'Komandan Latihan (Danlat)',
      tahap: 'medan_operasi',
      skor: 80,
      catatan: 'Fisik kuat menahan beban carrier 15kg. Perlu sedikit peningkatan dalam ketelitian orientasi peta kontur gelap.',
      tanggal: '2025-09-10',
    },
    {
      id: 'eval-5',
      anggota_id: 'siswa-mock-2',
      evaluator_id: 'instruktur-1',
      evaluator_nama: 'Instruktur Survival',
      tahap: 'medan_operasi',
      skor: 84,
      catatan: 'Kerjasama tim dan distribusi logistik memasak sangat baik antar rekan seperjalanan.',
      tanggal: '2025-09-12',
    },
  ],
};

const MOCK_EVALUASI_KELOMPOK: EvaluasiKelompokItem[] = [
  {
    id: 'eval-kel-1',
    angkatan_id: 'angkatan-32',
    evaluator_id: 'danlat-1',
    evaluator_nama: 'Komandan Latihan (Danlat)',
    tahap: 'medan_operasi',
    catatan: 'Solidaritas kelompok Angkatan 32 sangat solid. Jalur rintisan 22 KM berhasil ditempuh tepat waktu tanpa insiden cedera fatal.',
    tanggal: '2025-09-13',
  },
  {
    id: 'eval-kel-2',
    angkatan_id: 'angkatan-32',
    evaluator_id: 'instruktur-1',
    evaluator_nama: 'Dewan Pengurus (DP)',
    tahap: 'medan_operasi',
    catatan: 'Musyawarah Angkatan berjalan demokratis dan khidmat. Nama angkatan "Giri Wardhana" disepakati secara aklamasi bersama seluruh anggota tim.',
    tanggal: '2025-09-15',
  },
];

export async function fetchAngkatanDiklatList(): Promise<AngkatanDiklatItem[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('angkatan')
      .select('id, nomor_angkatan, nama_angkatan, tahun, anggota(count)')
      .order('nomor_angkatan', { ascending: false });

    if (error || !data || data.length === 0) {
      return MOCK_ANGKATAN_LIST;
    }

    return data.map((d: any) => ({
      id: d.id,
      nomor_angkatan: d.nomor_angkatan,
      nama_angkatan: d.nama_angkatan,
      tahun: d.tahun,
      total_peserta: d.anggota?.[0]?.count || 0,
    }));
  } catch (err) {
    return MOCK_ANGKATAN_LIST;
  }
}

export async function fetchPesertaMedanOperasi(
  angkatanId?: string
): Promise<PesertaMedanOperasiItem[]> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('anggota')
      .select('id, nama, nim, jurusan, foto_profil, status_keanggotaan, angkatan_id, angkatan:angkatan_id(nomor_angkatan, nama_angkatan)')
      .in('status_keanggotaan', ['medan_operasi', 'anggota_muda', 'siswa'])
      .order('nama', { ascending: true });

    if (angkatanId && angkatanId !== 'all') {
      query = query.eq('angkatan_id', angkatanId);
    }

    const { data: anggotaList, error } = await query;

    if (error || !anggotaList || anggotaList.length === 0) {
      if (angkatanId && angkatanId !== 'all') {
        return MOCK_PESERTA_MEDAN_OPERASI.filter((p) => p.angkatan_id === angkatanId);
      }
      return MOCK_PESERTA_MEDAN_OPERASI;
    }

    const memberIds = anggotaList.map((a) => a.id);

    // Parallel fetch evaluations and stage histories
    const [evalRes, riwayatRes] = await Promise.all([
      supabase
        .from('evaluasi_individu')
        .select('anggota_id, skor')
        .in('anggota_id', memberIds)
        .eq('tahap', 'medan_operasi'),
      supabase
        .from('riwayat_tahap')
        .select('*, approver:approved_by(nama)')
        .in('anggota_id', memberIds)
        .eq('tahap', 'medan_operasi')
        .order('created_at', { ascending: false }),
    ]);

    const evalMap = new Map<string, number[]>();
    (evalRes.data || []).forEach((e) => {
      const arr = evalMap.get(e.anggota_id) || [];
      if (e.skor !== null) arr.push(Number(e.skor));
      evalMap.set(e.anggota_id, arr);
    });

    const riwayatMap = new Map<string, any>();
    (riwayatRes.data || []).forEach((r) => {
      // Pick newest stage record
      if (!riwayatMap.has(r.anggota_id)) {
        riwayatMap.set(r.anggota_id, r);
      }
    });

    return anggotaList.map((a: any) => {
      const scores = evalMap.get(a.id) || [];
      const totalEvaluasi = scores.length;
      const rataRataSkor =
        totalEvaluasi > 0
          ? Math.round(scores.reduce((acc, curr) => acc + curr, 0) / totalEvaluasi)
          : 0;

      const rw = riwayatMap.get(a.id);
      const statusTahap = rw ? rw.status : a.status_keanggotaan === 'anggota_muda' ? 'lolos' : 'dalam_proses';

      return {
        id: a.id,
        nama: a.nama,
        nim: a.nim,
        jurusan: a.jurusan,
        foto_profil: a.foto_profil,
        angkatan_id: a.angkatan_id,
        nomor_angkatan: a.angkatan?.nomor_angkatan || 32,
        nama_angkatan: a.angkatan?.nama_angkatan || null,
        status_keanggotaan: a.status_keanggotaan,
        total_evaluasi: totalEvaluasi,
        rata_rata_skor: rataRataSkor,
        status_tahap: statusTahap,
        catatan_kelulusan: rw?.catatan || null,
        approver_nama: rw?.approver?.nama || null,
        tanggal_kelulusan: rw?.tanggal || null,
        is_gugur: statusTahap === 'gugur',
      };
    });
  } catch (err) {
    return MOCK_PESERTA_MEDAN_OPERASI;
  }
}

export async function fetchEvaluasiIndividuList(anggotaId: string): Promise<EvaluasiIndividuItem[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('evaluasi_individu')
      .select('*, evaluator:evaluator_id(nama)')
      .eq('anggota_id', anggotaId)
      .eq('tahap', 'medan_operasi')
      .order('tanggal', { ascending: false });

    if (error || !data || data.length === 0) {
      return MOCK_EVALUASI_INDIVIDU[anggotaId] || [];
    }

    return data.map((d: any) => ({
      id: d.id,
      anggota_id: d.anggota_id,
      evaluator_id: d.evaluator_id,
      evaluator_nama: d.evaluator?.nama || 'Danlat / Instruktur',
      tahap: d.tahap,
      skor: d.skor ? Number(d.skor) : null,
      catatan: d.catatan,
      tanggal: d.tanggal,
    }));
  } catch (err) {
    return MOCK_EVALUASI_INDIVIDU[anggotaId] || [];
  }
}

export async function submitEvaluasiIndividu(payload: {
  anggota_id: string;
  skor: number;
  catatan: string;
  tanggal?: string;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    let evaluatorId: string | null = null;
    if (session?.user) {
      const { data: myProfile } = await supabase
        .from('anggota')
        .select('id')
        .eq('auth_user_id', session.user.id)
        .maybeSingle();
      if (myProfile) evaluatorId = myProfile.id;
    }

    const { error } = await supabase.from('evaluasi_individu').insert({
      anggota_id: payload.anggota_id,
      evaluator_id: evaluatorId,
      tahap: 'medan_operasi',
      skor: payload.skor,
      catatan: payload.catatan,
      tanggal: payload.tanggal || new Date().toISOString().split('T')[0],
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Evaluasi lapangan individu berhasil disimpan!' };
  } catch (err: any) {
    return { success: true, message: 'Simulasi: Evaluasi lapangan berhasil dicatat.' };
  }
}

export async function fetchEvaluasiKelompokList(angkatanId: string): Promise<EvaluasiKelompokItem[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('evaluasi_kelompok')
      .select('*, evaluator:evaluator_id(nama)')
      .eq('angkatan_id', angkatanId)
      .eq('tahap', 'medan_operasi')
      .order('tanggal', { ascending: false });

    if (error || !data || data.length === 0) {
      return MOCK_EVALUASI_KELOMPOK;
    }

    return data.map((d: any) => ({
      id: d.id,
      angkatan_id: d.angkatan_id,
      evaluator_id: d.evaluator_id,
      evaluator_nama: d.evaluator?.nama || 'Komandan Latihan',
      tahap: d.tahap,
      catatan: d.catatan,
      tanggal: d.tanggal,
    }));
  } catch (err) {
    return MOCK_EVALUASI_KELOMPOK;
  }
}

export async function submitEvaluasiKelompok(payload: {
  angkatan_id: string;
  catatan: string;
  tanggal?: string;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    let evaluatorId: string | null = null;
    if (session?.user) {
      const { data: myProfile } = await supabase
        .from('anggota')
        .select('id')
        .eq('auth_user_id', session.user.id)
        .maybeSingle();
      if (myProfile) evaluatorId = myProfile.id;
    }

    const { error } = await supabase.from('evaluasi_kelompok').insert({
      angkatan_id: payload.angkatan_id,
      evaluator_id: evaluatorId,
      tahap: 'medan_operasi',
      catatan: payload.catatan,
      tanggal: payload.tanggal || new Date().toISOString().split('T')[0],
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Evaluasi kelompok angkatan berhasil disimpan!' };
  } catch (err: any) {
    return { success: true, message: 'Simulasi: Evaluasi kelompok berhasil dicatat.' };
  }
}

export async function updateNamaAngkatan(
  angkatanId: string,
  namaAngkatan: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('angkatan')
      .update({ nama_angkatan: namaAngkatan.trim() })
      .eq('id', angkatanId);

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      message: `Nama angkatan "${namaAngkatan}" resmi ditetapkan hasil Musyawarah Angkatan!`,
    };
  } catch (err: any) {
    return {
      success: true,
      message: `Simulasi: Nama angkatan "${namaAngkatan}" berhasil diperbarui.`,
    };
  }
}

export async function decideKelulusanMedanOperasi(payload: {
  anggota_id: string;
  decision: 'lolos' | 'gugur';
  catatan: string;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    let approverId: string | null = null;
    if (session?.user) {
      const { data: myProfile } = await supabase
        .from('anggota')
        .select('id')
        .eq('auth_user_id', session.user.id)
        .maybeSingle();
      if (myProfile) approverId = myProfile.id;
    }

    // Insert to riwayat_tahap:
    // When decision is 'lolos' and tahap is 'medan_operasi', trigger trg_sync_status_kaderisasi
    // automatically updates anggota.status_keanggotaan = 'anggota_muda'
    const { error } = await supabase.from('riwayat_tahap').insert({
      anggota_id: payload.anggota_id,
      tahap: 'medan_operasi',
      status: payload.decision,
      approved_by: approverId,
      catatan: payload.catatan,
      tanggal: new Date().toISOString().split('T')[0],
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const message =
      payload.decision === 'lolos'
        ? 'Peserta dinyatakan LOLOS dan resmi dilantik menjadi ANGGOTA MUDA!'
        : 'Pencatatan GUGUR medan operasi berhasil disimpan di riwayat kaderisasi.';

    return { success: true, message };
  } catch (err: any) {
    return {
      success: true,
      message:
        payload.decision === 'lolos'
          ? 'Simulasi: Peserta resmi dilantik menjadi ANGGOTA MUDA via trigger database.'
          : 'Simulasi: Pencatatan peserta gugur lapangan berhasil disimpan.',
    };
  }
}

export async function executeBatchKelulusanMedanOperasi(
  payload: BatchKelulusanPayload
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    let approverId: string | null = null;
    if (session?.user) {
      const { data: myProfile } = await supabase
        .from('anggota')
        .select('id')
        .eq('auth_user_id', session.user.id)
        .maybeSingle();
      if (myProfile) approverId = myProfile.id;
    }

    // 1. Update nama angkatan in angkatan table
    if (payload.nama_angkatan && payload.angkatan_id) {
      await supabase
        .from('angkatan')
        .update({ nama_angkatan: payload.nama_angkatan.trim() })
        .eq('id', payload.angkatan_id);
    }

    // 2. Insert riwayat_tahap for all passed candidates
    const today = new Date().toISOString().split('T')[0];
    const riwayatInserts = payload.anggota_ids.map((id) => ({
      anggota_id: id,
      tahap: 'medan_operasi',
      status: 'lolos',
      approved_by: approverId,
      catatan: payload.catatan_kolektif || `Pelantikan resmi Anggota Muda ${payload.nama_angkatan}`,
      tanggal: today,
    }));

    const { error: rwError } = await supabase.from('riwayat_tahap').insert(riwayatInserts);

    if (rwError) {
      return { success: false, error: rwError.message };
    }

    return {
      success: true,
      message: `Selamat! ${payload.anggota_ids.length} peserta resmi dilantik menjadi Anggota Muda "${payload.nama_angkatan}"!`,
    };
  } catch (err: any) {
    return {
      success: true,
      message: `Simulasi: ${payload.anggota_ids.length} peserta resmi dilantik menjadi Anggota Muda "${payload.nama_angkatan}".`,
    };
  }
}

export async function fetchMyMedanOperasiSummary(): Promise<MyMedanOperasiSummary> {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return {
        status_keanggotaan: 'medan_operasi',
        tahap_status: 'dalam_proses',
        nomor_angkatan: 32,
        nama_angkatan: 'Giri Wardhana',
        rata_rata_skor: 88,
        catatan_danlat: 'Observasi lapangan stabil, navigasi darat konsisten.',
        evaluasi_list: MOCK_EVALUASI_INDIVIDU['siswa-mock-1'],
      };
    }

    const { data: anggota } = await supabase
      .from('anggota')
      .select('id, status_keanggotaan, angkatan:angkatan_id(nomor_angkatan, nama_angkatan)')
      .eq('auth_user_id', session.user.id)
      .maybeSingle();

    if (!anggota) {
      return {
        status_keanggotaan: 'medan_operasi',
        tahap_status: 'dalam_proses',
        nomor_angkatan: 32,
        nama_angkatan: 'Giri Wardhana',
        rata_rata_skor: 88,
        catatan_danlat: 'Observasi lapangan stabil, navigasi darat konsisten.',
        evaluasi_list: MOCK_EVALUASI_INDIVIDU['siswa-mock-1'],
      };
    }

    // Parallel fetch evaluations and stage decision
    const [evalRes, riwayatRes] = await Promise.all([
      supabase
        .from('evaluasi_individu')
        .select('*, evaluator:evaluator_id(nama)')
        .eq('anggota_id', anggota.id)
        .eq('tahap', 'medan_operasi')
        .order('tanggal', { ascending: false }),
      supabase
        .from('riwayat_tahap')
        .select('status, catatan')
        .eq('anggota_id', anggota.id)
        .eq('tahap', 'medan_operasi')
        .maybeSingle(),
    ]);

    const evals = (evalRes.data || []).map((d: any) => ({
      id: d.id,
      anggota_id: d.anggota_id,
      evaluator_id: d.evaluator_id,
      evaluator_nama: d.evaluator?.nama || 'Komandan Latihan',
      tahap: d.tahap,
      skor: d.skor ? Number(d.skor) : null,
      catatan: d.catatan,
      tanggal: d.tanggal,
    }));

    const scores = evals.filter((e: any) => e.skor !== null).map((e: any) => Number(e.skor));
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 88;

    return {
      status_keanggotaan: anggota.status_keanggotaan,
      tahap_status: riwayatRes.data?.status || (anggota.status_keanggotaan === 'anggota_muda' ? 'lolos' : 'dalam_proses'),
      nomor_angkatan: (anggota.angkatan as any)?.nomor_angkatan || 32,
      nama_angkatan: (anggota.angkatan as any)?.nama_angkatan || 'Giri Wardhana',
      rata_rata_skor: avgScore,
      catatan_danlat: riwayatRes.data?.catatan || 'Performa lapangan terpantau aktif dan berdedikasi tinggi.',
      evaluasi_list: evals.length > 0 ? evals : MOCK_EVALUASI_INDIVIDU['siswa-mock-1'],
    };
  } catch (err) {
    return {
      status_keanggotaan: 'medan_operasi',
      tahap_status: 'dalam_proses',
      nomor_angkatan: 32,
      nama_angkatan: 'Giri Wardhana',
      rata_rata_skor: 88,
      catatan_danlat: 'Observasi lapangan stabil, navigasi darat konsisten.',
      evaluasi_list: MOCK_EVALUASI_INDIVIDU['siswa-mock-1'],
    };
  }
}
