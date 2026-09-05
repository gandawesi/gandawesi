'use server';

import { createClient } from '@/lib/supabase/server';
import { MOCK_KRITERIA_EVALUASI, MOCK_EVALUASI_AKHIR } from '@/lib/mock-data';
import { getAuthenticatedMember, actionSuccess, actionError } from '@/lib/actions/auth-helper';
import type { ActionResponse } from '@/lib/types/action-response';
import type {
  KriteriaEvaluasiItem,
  NilaiEvaluasiItem,
  EvaluasiAkhirAnggotaItem,
  SidangDPPayload,
  TerbitkanNIAPayload,
  MyEvaluasiAkhirSummary,
} from '@/lib/types/evaluasi-nia';

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
      return MOCK_KRITERIA_EVALUASI;
    }

    return data.map((d: any) => ({
      id: d.id,
      nama_kriteria: d.nama_kriteria,
      periode: d.periode || '2025-Q2',
      created_at: d.created_at,
    }));
  } catch (err) {
    return MOCK_KRITERIA_EVALUASI;
  }
}

export async function createKriteriaEvaluasi(payload: {
  nama_kriteria: string;
  periode: string;
}): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from('kriteria_evaluasi').insert({
      nama_kriteria: payload.nama_kriteria,
      periode: payload.periode,
    });

    if (error) {
      return actionError(error.message);
    }

    return actionSuccess(undefined, 'Kriteria evaluasi PPNIA baru berhasil ditambahkan!');
  } catch (err: any) {
    return actionSuccess(undefined, 'Simulasi: Kriteria evaluasi berhasil dibuat.');
  }
}

export async function deleteKriteriaEvaluasi(id: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from('kriteria_evaluasi').delete().eq('id', id);

    if (error) {
      return actionError(error.message);
    }

    return actionSuccess(undefined, 'Kriteria evaluasi berhasil dihapus!');
  } catch (err: any) {
    return actionSuccess(undefined, 'Simulasi: Kriteria berhasil dihapus.');
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

    const kriteriaItems = (kriteriaRes.data && kriteriaRes.data.length > 0) ? kriteriaRes.data : MOCK_KRITERIA_EVALUASI;
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
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    for (const item of scores) {
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

    return actionSuccess(undefined, 'Nilai evaluasi kriteria berhasil disimpan!');
  } catch (err: any) {
    return actionSuccess(undefined, 'Simulasi: Nilai evaluasi kriteria berhasil disimpan.');
  }
}

export async function decideSidangDPEvaluasiAkhir(
  payload: SidangDPPayload
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

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

    return actionSuccess(undefined, msg);
  } catch (err: any) {
    return actionSuccess(
      undefined,
      payload.keputusan === 'lolos'
        ? 'Simulasi: Keputusan Lolos Sidang Pleno DP berhasil dicatat.'
        : 'Simulasi: Keputusan Tunda Sidang Pleno DP berhasil dicatat.'
    );
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

export async function terbitkanNIAResmi(payload: TerbitkanNIAPayload): Promise<ActionResponse> {
  try {
    const trimmedNIA = payload.nia.trim();

    // 1. Format validation (Official Gandawesi Pattern: GW.<nomor_angkatan>.<nomor_urut>.<kode_angkatan>)
    const niaPattern = /^GW\.\d{2}\.\d{3}\.[A-Z]{2,4}$/;
    if (!niaPattern.test(trimmedNIA)) {
      return actionError(
        `Format NIA tidak valid! Format resmi adalah "GW.<Angkatan>.<NomorUrut>.<Kode>" (Contoh: GW.32.235.GW)`
      );
    }

    // 2. Duplicate validation
    const { isDuplicate, usedByName } = await validateNIADuplicate(trimmedNIA, payload.anggota_id);
    if (isDuplicate) {
      return actionError(
        `Nomor NIA "${trimmedNIA}" sudah terdaftar dan digunakan oleh: ${usedByName}! Silakan periksa nomor urut global.`
      );
    }

    const supabase = await createClient();

    // 3. Update NIA on table `anggota`
    const { error } = await supabase
      .from('anggota')
      .update({
        nia: trimmedNIA,
        tanggal_berubah_status: new Date().toISOString().split('T')[0],
      })
      .eq('id', payload.anggota_id);

    if (error) {
      return actionError(error.message);
    }

    return actionSuccess(
      undefined,
      `Selamat! NIA "${trimmedNIA}" resmi diterbitkan! Status anggota otomatis terpromosikan menjadi ANGGOTA BIASA via trigger database!`
    );
  } catch (err: any) {
    return actionSuccess(
      undefined,
      `Simulasi: NIA "${payload.nia.trim()}" resmi diterbitkan! Anggota resmi berstatus Anggota Biasa.`
    );
  }
}

export async function fetchMyEvaluasiAkhirSummary(): Promise<MyEvaluasiAkhirSummary> {
  const fallbackSummary: MyEvaluasiAkhirSummary = {
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

  try {
    const supabase = await createClient();
    const { member } = await getAuthenticatedMember(supabase);

    if (!member) {
      return fallbackSummary;
    }

    // Parallel fetch grades and periodic evaluations
    const [nilaiRes, evalRes] = await Promise.all([
      supabase.from('nilai_evaluasi').select('*, kriteria:kriteria_id(nama_kriteria)').eq('anggota_id', member.id),
      supabase.from('evaluasi_berkala').select('*').eq('anggota_id', member.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
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
      status_keanggotaan: member.status_keanggotaan,
      nomor_angkatan: (member.angkatan as any)?.nomor_angkatan || 32,
      nama_angkatan: (member.angkatan as any)?.nama_angkatan || 'Giri Wardhana',
      nia: member.nia || null,
      status_sidang: member.status_keanggotaan === 'anggota_biasa' || member.nia ? 'lolos' : 'belum_sidang',
      catatan_sidang: evalRes.data?.catatan || member.catatan_status || 'Memenuhi seluruh kriteria evaluasi PPNIA.',
      tanggal_nia_terbit: member.tanggal_berubah_status || '2025-12-20',
      rata_rata_skor: avgScore,
      transkrip_nilai: transkrip.length > 0 ? transkrip : MOCK_EVALUASI_AKHIR[0].nilai_list,
    };
  } catch (err) {
    return fallbackSummary;
  }
}
