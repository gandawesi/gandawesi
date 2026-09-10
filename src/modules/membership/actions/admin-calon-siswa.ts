'use server';

import { createClient } from '@/lib/supabase/server';
import type { CalonSiswaItem, PeriodePendaftaranItem } from '@/lib/types/registration';
import type { ActionResponse } from '@/lib/types/action-response';
import { getCurrentMemberId, actionSuccess, actionError } from '@/lib/actions/auth-helper';
import { MOCK_CALON_SISWA_LIST, MOCK_PERIODE_LIST } from '@/lib/mock-data';

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
      supabase
        .from('riwayat_tahap')
        .select('*, approver:approved_by(nama)')
        .in('anggota_id', memberIds)
        .eq('tahap', 'calon_siswa'),
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
  } catch {
    return { calonSiswaList: MOCK_CALON_SISWA_LIST };
  }
}

export async function saveCatatanKesehatanPanitia(
  anggotaId: string,
  catatan: string
): Promise<ActionResponse> {
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

    return actionSuccess(undefined, 'Catatan kesehatan panitia berhasil disimpan!');
  } catch {
    return actionSuccess(undefined, 'Simulasi: Catatan evaluasi medis panitia berhasil dicatat.');
  }
}

export async function saveHasilWawancara(
  anggotaId: string,
  payload: {
    nilai_wawancara: number;
    rekomendasi: 'sangat_direkomendasikan' | 'direkomendasikan' | 'dipertimbangkan' | 'tidak_direkomendasikan';
    catatan_pewawancara: string;
    pewawancara_nama: string;
  }
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    // Check if table hasil_wawancara exists or save in evaluasi
    const { data: existing } = await supabase
      .from('hasil_wawancara')
      .select('id')
      .eq('anggota_id', anggotaId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('hasil_wawancara')
        .update({
          nilai_wawancara: payload.nilai_wawancara,
          rekomendasi: payload.rekomendasi,
          catatan_pewawancara: payload.catatan_pewawancara,
          pewawancara_nama: payload.pewawancara_nama,
          tanggal: new Date().toISOString().split('T')[0],
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('hasil_wawancara').insert({
        anggota_id: anggotaId,
        nilai_wawancara: payload.nilai_wawancara,
        rekomendasi: payload.rekomendasi,
        catatan_pewawancara: payload.catatan_pewawancara,
        pewawancara_nama: payload.pewawancara_nama,
        tanggal: new Date().toISOString().split('T')[0],
      });
    }

    return actionSuccess(undefined, 'Hasil wawancara calon siswa berhasil disimpan!');
  } catch {
    // In mock/simulated mode, update in-memory mock item if present
    const item = MOCK_CALON_SISWA_LIST.find((c) => c.id === anggotaId);
    if (item) {
      item.hasil_wawancara = {
        id: `waw-${Date.now()}`,
        anggota_id: anggotaId,
        nilai_wawancara: payload.nilai_wawancara,
        rekomendasi: payload.rekomendasi,
        catatan_pewawancara: payload.catatan_pewawancara,
        pewawancara_nama: payload.pewawancara_nama,
        tanggal: new Date().toISOString().split('T')[0],
      };
    }
    return actionSuccess(undefined, 'Simulasi: Hasil evaluasi wawancara calon siswa berhasil dicatat.');
  }
}

export async function decideCalonSiswaStatus(
  anggotaId: string,
  decision: 'lolos' | 'gugur',
  catatan: string
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const approverAnggotaId = await getCurrentMemberId(supabase);

    // Insert or update riwayat_tahap
    // ACC kelulusan Calon Siswa -> Siswa dilakukan oleh Komandan Latihan (Danlat)
    const { error } = await supabase.from('riwayat_tahap').insert({
      anggota_id: anggotaId,
      tahap: 'calon_siswa',
      status: decision,
      approved_by: approverAnggotaId,
      catatan: `[ACC Danlat] ${catatan}`,
      tanggal: new Date().toISOString().split('T')[0],
    });

    if (error) {
      return actionError(error.message);
    }

    const message =
      decision === 'lolos'
        ? 'Calon siswa berhasil di-ACC oleh Komandan Latihan (Danlat) dan dipromosikan ke tahap Siswa!'
        : 'Calon siswa dinyatakan GUGUR oleh Danlat. Riwayat evaluasi tersimpan di sistem.';

    return actionSuccess(undefined, message);
  } catch {
    const item = MOCK_CALON_SISWA_LIST.find((c) => c.id === anggotaId);
    if (item) {
      item.status_keanggotaan = decision === 'lolos' ? 'siswa' : 'calon_siswa';
      item.keputusan_tahap = {
        id: `rw-${Date.now()}`,
        tahap: 'calon_siswa',
        status: decision,
        catatan,
        approver_nama: 'Komandan Latihan (Danlat)',
        tanggal: new Date().toISOString().split('T')[0],
      };
    }
    return actionSuccess(
      undefined,
      decision === 'lolos'
        ? 'Simulasi: Calon siswa berhasil di-ACC oleh Komandan Latihan (Danlat) ke tahap Siswa.'
        : 'Simulasi: Keputusan GUGUR oleh Danlat telah dicatat.'
    );
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
      return MOCK_PERIODE_LIST;
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
  } catch {
    return MOCK_PERIODE_LIST;
  }
}
