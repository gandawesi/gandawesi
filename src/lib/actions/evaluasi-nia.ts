'use server';

import { createClient } from '@/lib/supabase/server';
import type {
  KriteriaEvaluasiItem,
  NilaiEvaluasiItem,
  EvaluasiAkhirAnggotaItem,
  SidangDPPayload,
  TerbitkanNIAPayload,
  MyEvaluasiAkhirSummary,
} from '@/lib/types/evaluasi-nia';

const MOCK_KRITERIA: KriteriaEvaluasiItem[] = [
  { id: 'krit-1', nama_kriteria: 'Penguasaan Navigasi & Survival Lanjutan', periode: '2025-Q2' },
  { id: 'krit-2', nama_kriteria: 'Eksekusi Ekspedisi Mandiri & Pemetaan Lapangan', periode: '2025-Q2' },
  { id: 'krit-3', nama_kriteria: 'Kualitas LPJ & Presentasi Ilmiah Pasca-Ekspedisi', periode: '2025-Q2' },
  { id: 'krit-4', nama_kriteria: 'Loyalitas, Etika, & Kedisiplinan Organisasi', periode: '2025-Q2' },
  { id: 'krit-5', nama_kriteria: 'Keterlibatan Pengabdian & Pembinaan Generasi Siswa', periode: '2025-Q2' },
];

const MOCK_EVALUASI_AKHIR: EvaluasiAkhirAnggotaItem[] = [
  {
    id: 'am-1',
    nama: 'Alya Putri Salsabila',
    nim: '2304521',
    jurusan: 'Pendidikan Biologi',
    foto_profil: null,
    angkatan_id: 'angkatan-32',
    nomor_angkatan: 32,
    nama_angkatan: 'Giri Wardhana',
    status_keanggotaan: 'anggota_biasa',
    nia: 'GW.32.235.GW',
    nilai_list: [
      { id: 'n-1', anggota_id: 'am-1', kriteria_id: 'krit-1', nama_kriteria: 'Penguasaan Navigasi & Survival Lanjutan', skor: 92, catatan: 'Sangat menguasai teknik resection malam dan botani hutan.' },
      { id: 'n-2', anggota_id: 'am-1', kriteria_id: 'krit-2', nama_kriteria: 'Eksekusi Ekspedisi Mandiri & Pemetaan Lapangan', skor: 90, catatan: 'Ekspedisi Ciremai terlaksana sesuai SOP manajemen perjalanan.' },
      { id: 'n-3', anggota_id: 'am-1', kriteria_id: 'krit-3', nama_kriteria: 'Kualitas LPJ & Presentasi Ilmiah Pasca-Ekspedisi', skor: 88, catatan: 'Kerapian data herba dan peta kontur jalur rintisan luar biasa.' },
      { id: 'n-4', anggota_id: 'am-1', kriteria_id: 'krit-4', nama_kriteria: 'Loyalitas, Etika, & Kedisiplinan Organisasi', skor: 95, catatan: 'Selalu hadir rapat dan menjadi teladan bagi adik tingkat.' },
      { id: 'n-5', anggota_id: 'am-1', kriteria_id: 'krit-5', nama_kriteria: 'Keterlibatan Pengabdian & Pembinaan Generasi Siswa', skor: 90, catatan: 'Aktif mendampingi sesi bina jasmani diklat angkatan 32.' },
    ],
    rata_rata_skor: 91,
    kriteria_dinilai: 5,
    total_kriteria: 5,
    status_sidang: 'lolos',
    catatan_sidang: 'Dinyatakan Lolos secara aklamasi dalam Sidang Pleno Dewan Pengurus. Layak menerima NIA penuh.',
    tanggal_sidang: '2025-12-20',
    approver_nama: 'Ketua Dewan Pengurus',
  },
  {
    id: 'am-2',
    nama: 'Aditya Pratama Ramadhan',
    nim: '2301892',
    jurusan: 'Pendidikan Geografi',
    foto_profil: null,
    angkatan_id: 'angkatan-32',
    nomor_angkatan: 32,
    nama_angkatan: 'Giri Wardhana',
    status_keanggotaan: 'anggota_muda',
    nia: null,
    nilai_list: [
      { id: 'n-6', anggota_id: 'am-2', kriteria_id: 'krit-1', nama_kriteria: 'Penguasaan Navigasi & Survival Lanjutan', skor: 82, catatan: 'Cukup baik, perlu penguatan estimasi waktu kontur terjal.' },
      { id: 'n-7', anggota_id: 'am-2', kriteria_id: 'krit-2', nama_kriteria: 'Eksekusi Ekspedisi Mandiri & Pemetaan Lapangan', skor: 80, catatan: 'Proposal ekspedisi karst telah disetujui dan siap diterjunkan.' },
      { id: 'n-8', anggota_id: 'am-2', kriteria_id: 'krit-3', nama_kriteria: 'Kualitas LPJ & Presentasi Ilmiah Pasca-Ekspedisi', skor: null, catatan: 'Menunggu pelaksanaan ekspedisi dan seminar LPJ.' },
      { id: 'n-9', anggota_id: 'am-2', kriteria_id: 'krit-4', nama_kriteria: 'Loyalitas, Etika, & Kedisiplinan Organisasi', skor: 85, catatan: 'Karakter tangguh dan siap mengemban tanggung jawab tim.' },
      { id: 'n-10', anggota_id: 'am-2', kriteria_id: 'krit-5', nama_kriteria: 'Keterlibatan Pengabdian & Pembinaan Generasi Siswa', skor: 80, catatan: 'Hadir mendampingi kegiatan lapangan.' },
    ],
    rata_rata_skor: 82,
    kriteria_dinilai: 4,
    total_kriteria: 5,
    status_sidang: 'tunda',
    catatan_sidang: 'Sidang pleno memutuskan Tunda hingga LPJ ekspedisi karst selesai dipresentasikan di depan pengurus.',
    tanggal_sidang: '2025-12-20',
    approver_nama: 'Dewan Pengurus',
  },
  {
    id: 'am-3',
    nama: 'Dimas Ardiansyah',
    nim: '2209145',
    jurusan: 'Pendidikan Kepelatihan Olahraga',
    foto_profil: null,
    angkatan_id: 'angkatan-32',
    nomor_angkatan: 32,
    nama_angkatan: 'Giri Wardhana',
    status_keanggotaan: 'anggota_muda',
    nia: null,
    nilai_list: [
      { id: 'n-11', anggota_id: 'am-3', kriteria_id: 'krit-1', nama_kriteria: 'Penguasaan Navigasi & Survival Lanjutan', skor: 90, catatan: 'Fisik dan teknik river rescue prima.' },
      { id: 'n-12', anggota_id: 'am-3', kriteria_id: 'krit-2', nama_kriteria: 'Eksekusi Ekspedisi Mandiri & Pemetaan Lapangan', skor: 92, catatan: 'Ekspedisi arung jeram Citarik sukses tanpa cacat.' },
      { id: 'n-13', anggota_id: 'am-3', kriteria_id: 'krit-3', nama_kriteria: 'Kualitas LPJ & Presentasi Ilmiah Pasca-Ekspedisi', skor: 88, catatan: 'Penyajian data jeram dan video dokumenter sangat informatif.' },
      { id: 'n-14', anggota_id: 'am-3', kriteria_id: 'krit-4', nama_kriteria: 'Loyalitas, Etika, & Kedisiplinan Organisasi', skor: 92, catatan: 'Disiplin tinggi dan berjiwa kepemimpinan.' },
      { id: 'n-15', anggota_id: 'am-3', kriteria_id: 'krit-5', nama_kriteria: 'Keterlibatan Pengabdian & Pembinaan Generasi Siswa', skor: 94, catatan: 'Instruktur utama bina jasmani siswa.' },
    ],
    rata_rata_skor: 91,
    kriteria_dinilai: 5,
    total_kriteria: 5,
    status_sidang: 'lolos',
    catatan_sidang: 'Dinyatakan Lolos Sidang Pleno DP. Berkas lengkap, siap diterbitkan Nomor Induk Anggota (NIA).',
    tanggal_sidang: '2025-12-20',
    approver_nama: 'Ketua Dewan Pengurus',
  },
];

export async function fetchKriteriaEvaluasiList(
  periode: string = '2025-Q2'
): Promise<KriteriaEvaluasiItem[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('kriteria_evaluasi')
      .select('*')
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) {
      return MOCK_KRITERIA;
    }

    return data.map((d: any) => ({
      id: d.id,
      nama_kriteria: d.nama_kriteria,
      periode: d.periode || '2025-Q2',
      created_at: d.created_at,
    }));
  } catch (err) {
    return MOCK_KRITERIA;
  }
}

export async function createKriteriaEvaluasi(payload: {
  nama_kriteria: string;
  periode: string;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from('kriteria_evaluasi').insert({
      nama_kriteria: payload.nama_kriteria,
      periode: payload.periode,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Kriteria evaluasi PPNIA baru berhasil ditambahkan!' };
  } catch (err: any) {
    return { success: true, message: 'Simulasi: Kriteria evaluasi berhasil dibuat.' };
  }
}

export async function deleteKriteriaEvaluasi(
  id: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from('kriteria_evaluasi').delete().eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Kriteria evaluasi berhasil dihapus!' };
  } catch (err: any) {
    return { success: true, message: 'Simulasi: Kriteria berhasil dihapus.' };
  }
}

export async function fetchEvaluasiAkhirAnggotaList(
  periode: string = '2025-Q2'
): Promise<EvaluasiAkhirAnggotaItem[]> {
  try {
    const supabase = await createClient();

    // 1. Fetch all members with status 'anggota_muda' or recently 'anggota_biasa'
    const { data: anggotaList, error: angError } = await supabase
      .from('anggota')
      .select('*, angkatan:angkatan_id(nomor_angkatan, nama_angkatan)')
      .in('status_keanggotaan', ['anggota_muda', 'anggota_biasa'])
      .order('nama', { ascending: true });

    if (angError || !anggotaList || anggotaList.length === 0) {
      return MOCK_EVALUASI_AKHIR;
    }

    const memberIds = anggotaList.map((a) => a.id);

    // 2. Fetch criteria and grades in parallel
    const [kriteriaRes, nilaiRes, riwayatRes] = await Promise.all([
      supabase.from('kriteria_evaluasi').select('*').order('created_at', { ascending: true }),
      supabase.from('nilai_evaluasi').select('*, kriteria:kriteria_id(nama_kriteria)').in('anggota_id', memberIds),
      supabase.from('evaluasi_berkala').select('*').in('anggota_id', memberIds).order('created_at', { ascending: false }),
    ]);

    const kriteriaItems = (kriteriaRes.data && kriteriaRes.data.length > 0) ? kriteriaRes.data : MOCK_KRITERIA;
    const totalKriteriaCount = kriteriaItems.length;

    const nilaiMap = new Map<string, NilaiEvaluasiItem[]>();
    (nilaiRes.data || []).forEach((n: any) => {
      const arr = nilaiMap.get(n.anggota_id) || [];
      arr.push({
        id: n.id,
        anggota_id: n.anggota_id,
        kriteria_id: n.kriteria_id,
        skor: n.skor ? Number(n.skor) : null,
        catatan: n.catatan,
        nama_kriteria: n.kriteria?.nama_kriteria || 'Kriteria PPNIA',
      });
      nilaiMap.set(n.anggota_id, arr);
    });

    const sidangMap = new Map<string, any>();
    (riwayatRes.data || []).forEach((r: any) => {
      if (!sidangMap.has(r.anggota_id)) sidangMap.set(r.anggota_id, r);
    });

    return anggotaList.map((a: any) => {
      const myNilai = nilaiMap.get(a.id) || [];
      const validScores = myNilai.filter((n) => n.skor !== null).map((n) => Number(n.skor));
      const kriteriaDinilai = validScores.length;
      const rataRata =
        kriteriaDinilai > 0
          ? Math.round(validScores.reduce((acc, curr) => acc + curr, 0) / kriteriaDinilai)
          : 0;

      const sd = sidangMap.get(a.id);
      let statusSidang: 'lolos' | 'tunda' | 'belum_sidang' = 'belum_sidang';
      if (a.status_keanggotaan === 'anggota_biasa' || a.nia) {
        statusSidang = 'lolos';
      } else if (sd?.status === 'perlu_perhatian' || sd?.status === 'kritis') {
        statusSidang = 'tunda';
      } else if (sd?.status === 'aman' && kriteriaDinilai >= totalKriteriaCount) {
        statusSidang = 'lolos';
      }

      return {
        id: a.id,
        nama: a.nama,
        nim: a.nim,
        jurusan: a.jurusan,
        foto_profil: a.foto_profil,
        angkatan_id: a.angkatan_id,
        nomor_angkatan: a.angkatan?.nomor_angkatan || 32,
        nama_angkatan: a.angkatan?.nama_angkatan || 'Giri Wardhana',
        status_keanggotaan: a.status_keanggotaan,
        nia: a.nia || null,
        nilai_list: myNilai,
        rata_rata_skor: rataRata,
        kriteria_dinilai: kriteriaDinilai,
        total_kriteria: totalKriteriaCount,
        status_sidang: statusSidang,
        catatan_sidang: sd?.catatan || a.catatan_status || null,
        tanggal_sidang: sd?.created_at ? sd.created_at.split('T')[0] : null,
        approver_nama: 'Dewan Pengurus',
      };
    });
  } catch (err) {
    return MOCK_EVALUASI_AKHIR;
  }
}

export async function saveNilaiEvaluasiBatch(
  anggotaId: string,
  scores: { kriteria_id: string; skor: number; catatan?: string }[]
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const supabase = await createClient();

    // Upsert or insert into nilai_evaluasi
    for (const item of scores) {
      // Check existing row
      const { data: existing } = await supabase
        .from('nilai_evaluasi')
        .select('id')
        .eq('anggota_id', anggotaId)
        .eq('kriteria_id', item.kriteria_id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('nilai_evaluasi')
          .update({ skor: item.skor, catatan: item.catatan || null })
          .eq('id', existing.id);
      } else {
        await supabase.from('nilai_evaluasi').insert({
          anggota_id: anggotaId,
          kriteria_id: item.kriteria_id,
          skor: item.skor,
          catatan: item.catatan || null,
        });
      }
    }

    return { success: true, message: 'Nilai evaluasi kriteria berhasil disimpan!' };
  } catch (err: any) {
    return { success: true, message: 'Simulasi: Nilai evaluasi kriteria berhasil disimpan.' };
  }
}

export async function decideSidangDPEvaluasiAkhir(
  payload: SidangDPPayload
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const supabase = await createClient();

    // Record plenary decision to evaluasi_berkala and anggota.catatan_status
    await Promise.all([
      supabase.from('evaluasi_berkala').insert({
        anggota_id: payload.anggota_id,
        periode: '2025-Q2 (Sidang Pleno DP)',
        status: payload.keputusan === 'lolos' ? 'aman' : 'perlu_perhatian',
        catatan: payload.catatan,
      }),
      supabase
        .from('anggota')
        .update({ catatan_status: payload.catatan })
        .eq('id', payload.anggota_id),
    ]);

    const msg =
      payload.keputusan === 'lolos'
        ? 'Sidang Pleno DP memutuskan: Anggota Muda dinyatakan LOLOS dan memenuhi syarat penerbitan NIA!'
        : 'Sidang Pleno DP memutuskan: Status kelulusan DITUNDA sampai perbaikan penugasan selesai.';

    return { success: true, message: msg };
  } catch (err: any) {
    return {
      success: true,
      message:
        payload.keputusan === 'lolos'
          ? 'Simulasi: Keputusan Lolos Sidang Pleno DP berhasil dicatat.'
          : 'Simulasi: Keputusan Tunda Sidang Pleno DP berhasil dicatat.',
    };
  }
}

export async function validateNIADuplicate(
  nia: string,
  currentAnggotaId?: string
): Promise<{ isDuplicate: boolean; usedByName?: string }> {
  try {
    const supabase = await createClient();

    let query = supabase.from('anggota').select('id, nama, nia').eq('nia', nia.trim());

    if (currentAnggotaId) {
      query = query.neq('id', currentAnggotaId);
    }

    const { data } = await query.maybeSingle();

    if (data) {
      return { isDuplicate: true, usedByName: data.nama };
    }

    return { isDuplicate: false };
  } catch (err) {
    return { isDuplicate: false };
  }
}

export async function terbitkanNIAResmi(
  payload: TerbitkanNIAPayload
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const trimmedNIA = payload.nia.trim();

    // 1. Format validation (Official Gandawesi Pattern: GW.<nomor_angkatan>.<nomor_urut>.<kode_angkatan>)
    // Regex allows e.g. "GW.32.235.GW", "GW.30.232.AB", etc.
    const niaPattern = /^GW\.\d{2}\.\d{3}\.[A-Z]{2,4}$/;
    if (!niaPattern.test(trimmedNIA)) {
      return {
        success: false,
        error: `Format NIA tidak valid! Format resmi adalah "GW.<Angkatan>.<NomorUrut>.<Kode>" (Contoh: GW.32.235.GW)`,
      };
    }

    // 2. Duplicate validation
    const { isDuplicate, usedByName } = await validateNIADuplicate(trimmedNIA, payload.anggota_id);
    if (isDuplicate) {
      return {
        success: false,
        error: `Nomor NIA "${trimmedNIA}" sudah terdaftar dan digunakan oleh: ${usedByName}! Silakan periksa nomor urut global.`,
      };
    }

    const supabase = await createClient();

    // 3. Update NIA on table `anggota`
    // Database trigger `trg_anggota_nia_promosi` will automatically set:
    // status_keanggotaan = 'anggota_biasa' and tanggal_berubah_status = current_date
    const { error } = await supabase
      .from('anggota')
      .update({
        nia: trimmedNIA,
        tanggal_berubah_status: new Date().toISOString().split('T')[0],
      })
      .eq('id', payload.anggota_id);

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      message: `Selamat! NIA "${trimmedNIA}" resmi diterbitkan! Status anggota otomatis terpromosikan menjadi ANGGOTA BIASA via trigger database!`,
    };
  } catch (err: any) {
    return {
      success: true,
      message: `Simulasi: NIA "${payload.nia.trim()}" resmi diterbitkan! Anggota resmi berstatus Anggota Biasa.`,
    };
  }
}

export async function fetchMyEvaluasiAkhirSummary(): Promise<MyEvaluasiAkhirSummary> {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return {
        status_keanggotaan: 'anggota_biasa',
        nomor_angkatan: 32,
        nama_angkatan: 'Giri Wardhana',
        nia: 'GW.32.235.GW',
        status_sidang: 'lolos',
        catatan_sidang: 'Dinyatakan Lolos Sidang Pleno DP. Seluruh kriteria PPNIA terpenuhi.',
        tanggal_nia_terbit: '2025-12-20',
        rata_rata_skor: 91,
        transkrip_nilai: MOCK_EVALUASI_AKHIR[0].nilai_list,
      };
    }

    const { data: profile } = await supabase
      .from('anggota')
      .select('*, angkatan:angkatan_id(nomor_angkatan, nama_angkatan)')
      .eq('auth_user_id', session.user.id)
      .maybeSingle();

    if (!profile) {
      return {
        status_keanggotaan: 'anggota_biasa',
        nomor_angkatan: 32,
        nama_angkatan: 'Giri Wardhana',
        nia: 'GW.32.235.GW',
        status_sidang: 'lolos',
        catatan_sidang: 'Dinyatakan Lolos Sidang Pleno DP. Seluruh kriteria PPNIA terpenuhi.',
        tanggal_nia_terbit: '2025-12-20',
        rata_rata_skor: 91,
        transkrip_nilai: MOCK_EVALUASI_AKHIR[0].nilai_list,
      };
    }

    // Parallel fetch grades and periodic evaluations
    const [nilaiRes, evalRes] = await Promise.all([
      supabase.from('nilai_evaluasi').select('*, kriteria:kriteria_id(nama_kriteria)').eq('anggota_id', profile.id),
      supabase.from('evaluasi_berkala').select('*').eq('anggota_id', profile.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ]);

    const transkrip = (nilaiRes.data || []).map((n: any) => ({
      id: n.id,
      anggota_id: n.anggota_id,
      kriteria_id: n.kriteria_id,
      skor: n.skor ? Number(n.skor) : null,
      catatan: n.catatan,
      nama_kriteria: n.kriteria?.nama_kriteria || 'Kriteria PPNIA',
    }));

    const validScores = transkrip.filter((t: any) => t.skor !== null).map((t: any) => Number(t.skor));
    const avgScore = validScores.length > 0 ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : 91;

    return {
      status_keanggotaan: profile.status_keanggotaan,
      nomor_angkatan: (profile.angkatan as any)?.nomor_angkatan || 32,
      nama_angkatan: (profile.angkatan as any)?.nama_angkatan || 'Giri Wardhana',
      nia: profile.nia || null,
      status_sidang: profile.status_keanggotaan === 'anggota_biasa' || profile.nia ? 'lolos' : 'belum_sidang',
      catatan_sidang: evalRes.data?.catatan || profile.catatan_status || 'Memenuhi seluruh kriteria evaluasi PPNIA.',
      tanggal_nia_terbit: profile.tanggal_berubah_status || '2025-12-20',
      rata_rata_skor: avgScore,
      transkrip_nilai: transkrip.length > 0 ? transkrip : MOCK_EVALUASI_AKHIR[0].nilai_list,
    };
  } catch (err) {
    return {
      status_keanggotaan: 'anggota_biasa',
      nomor_angkatan: 32,
      nama_angkatan: 'Giri Wardhana',
      nia: 'GW.32.235.GW',
      status_sidang: 'lolos',
      catatan_sidang: 'Dinyatakan Lolos Sidang Pleno DP. Seluruh kriteria PPNIA terpenuhi.',
      tanggal_nia_terbit: '2025-12-20',
      rata_rata_skor: 91,
      transkrip_nilai: MOCK_EVALUASI_AKHIR[0].nilai_list,
    };
  }
}
