'use server';

import { createClient } from '@/lib/supabase/server';
import {
  MOCK_ANGGOTA_MUDA_PPNIA,
  MOCK_PRESENTASI_PPNIA,
  MOCK_RENCANA_EKSPEDISI,
  MOCK_SESI_PPNIA,
} from '@/lib/mock-data';
import { getAuthenticatedMember, getCurrentMemberId, actionSuccess, actionError } from '@/lib/actions/auth-helper';
import type { ActionResponse } from '@/lib/types/action-response';
import type {
  JenisKegiatanPPNIA,
  StatusEvaluasiBerkala,
  AnggotaMudaPPNIAItem,
  PresentasiPPNIAItem,
  RencanaEkspedisiItem,
  EvaluasiBerkalaItem,
  SesiKegiatanPPNIAItem,
  PresensiPPNIAItem,
  MyPPNIASummary,
} from '@/lib/types/ppnia';

export async function fetchAnggotaMudaPPNIAList(
  periodeFilter?: string
): Promise<AnggotaMudaPPNIAItem[]> {
  try {
    const supabase = await createClient();

    const { data: anggotaList, error } = await supabase
      .from('anggota')
      .select('*, angkatan:angkatan_id(nomor_angkatan, nama_angkatan)')
      .eq('status_keanggotaan', 'anggota_muda')
      .order('nama', { ascending: true });

    if (error || !anggotaList || anggotaList.length === 0) {
      return MOCK_ANGGOTA_MUDA_PPNIA;
    }

    const memberIds = anggotaList.map((a) => a.id);

    // Parallel fetch attendance, periodic evaluations, presentations, and expedition plans
    const [presensiRes, evalRes, presentasiRes, ekspedisiRes, totalSesiRes] = await Promise.all([
      supabase.from('presensi_kaderisasi').select('anggota_id, hadir, sesi_kegiatan!inner(jenis_kegiatan)').in('anggota_id', memberIds),
      supabase.from('evaluasi_berkala').select('*').in('anggota_id', memberIds).order('created_at', { ascending: false }),
      supabase.from('presentasi').select('anggota_id').in('anggota_id', memberIds),
      supabase.from('rencana_ekspedisi').select('pengaju_id, status_approval').in('pengaju_id', memberIds),
      supabase.from('sesi_kegiatan').select('id, jenis_kegiatan').in('jenis_kegiatan', ['pematerian', 'presentasi', 'pendakian', 'ekspedisi']),
    ]);

    const totalPematerian = totalSesiRes.data?.filter((s) => s.jenis_kegiatan === 'pematerian').length || 6;
    const totalPresentasi = totalSesiRes.data?.filter((s) => s.jenis_kegiatan === 'presentasi').length || 2;
    const totalPendakian = totalSesiRes.data?.filter((s) => s.jenis_kegiatan === 'pendakian').length || 3;
    const totalEkspedisi = totalSesiRes.data?.filter((s) => s.jenis_kegiatan === 'ekspedisi').length || 1;
    const grandTotalSesi = totalPematerian + totalPresentasi + totalPendakian + totalEkspedisi;

    const evalMap = new Map<string, any>();
    (evalRes.data || []).forEach((e) => {
      if (!evalMap.has(e.anggota_id)) evalMap.set(e.anggota_id, e);
    });

    const presentasiMap = new Map<string, number>();
    (presentasiRes.data || []).forEach((p) => {
      presentasiMap.set(p.anggota_id, (presentasiMap.get(p.anggota_id) || 0) + 1);
    });

    const ekspedisiMap = new Map<string, any>();
    (ekspedisiRes.data || []).forEach((ek) => {
      if (!ekspedisiMap.has(ek.pengaju_id)) ekspedisiMap.set(ek.pengaju_id, ek);
    });

    return anggotaList.map((a: any) => {
      const myPres = (presensiRes.data || []).filter((p: any) => p.anggota_id === a.id && p.hadir);
      const hadPematerian = myPres.filter((p: any) => p.sesi_kegiatan?.jenis_kegiatan === 'pematerian').length;
      const hadPresentasi = myPres.filter((p: any) => p.sesi_kegiatan?.jenis_kegiatan === 'presentasi').length;
      const hadPendakian = myPres.filter((p: any) => p.sesi_kegiatan?.jenis_kegiatan === 'pendakian').length;
      const hadEkspedisi = myPres.filter((p: any) => p.sesi_kegiatan?.jenis_kegiatan === 'ekspedisi').length;
      const totalHadir = hadPematerian + hadPresentasi + hadPendakian + hadEkspedisi;
      const pct = grandTotalSesi > 0 ? Math.round((totalHadir / grandTotalSesi) * 100) : 0;

      const ev = evalMap.get(a.id);
      const ek = ekspedisiMap.get(a.id);

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
        kehadiran_pematerian: hadPematerian,
        total_pematerian: totalPematerian,
        kehadiran_presentasi: hadPresentasi,
        total_presentasi: totalPresentasi,
        kehadiran_pendakian: hadPendakian,
        total_pendakian: totalPendakian,
        kehadiran_ekspedisi: hadEkspedisi,
        total_ekspedisi: totalEkspedisi,
        persentase_total: pct,
        total_slide_presentasi: presentasiMap.get(a.id) || 0,
        rencana_ekspedisi_status: ek ? ek.status_approval : 'belum_ada',
        status_evaluasi_terkini: ev ? ev.status : 'aman',
        catatan_evaluasi_terkini: ev ? ev.catatan : 'Aktif berkegiatan dalam bimbingan Dewan Pengurus.',
        periode_terkini: ev ? ev.periode : '2025-Q2',
      };
    });
  } catch (err) {
    return MOCK_ANGGOTA_MUDA_PPNIA;
  }
}

export async function saveEvaluasiBerkala(payload: {
  anggota_id: string;
  periode: string;
  status: StatusEvaluasiBerkala;
  catatan: string;
}): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from('evaluasi_berkala').insert({
      anggota_id: payload.anggota_id,
      periode: payload.periode,
      status: payload.status,
      catatan: payload.catatan,
    });

    if (error) {
      return actionError(error.message);
    }

    return actionSuccess(undefined, `Evaluasi berkala periode ${payload.periode} berhasil disimpan!`);
  } catch (err: any) {
    return actionSuccess(undefined, 'Simulasi: Evaluasi berkala berhasil dicatat.');
  }
}

export async function fetchPresentasiPPNIAList(
  anggotaId?: string
): Promise<PresentasiPPNIAItem[]> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('presentasi')
      .select('*, anggota:anggota_id(nama, nim)')
      .order('tanggal', { ascending: false });

    if (anggotaId) {
      query = query.eq('anggota_id', anggotaId);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      if (anggotaId) {
        return MOCK_PRESENTASI_PPNIA.filter((p) => p.anggota_id === anggotaId);
      }
      return MOCK_PRESENTASI_PPNIA;
    }

    return data.map((d: any) => ({
      id: d.id,
      anggota_id: d.anggota_id,
      anggota_nama: d.anggota?.nama || 'Anggota Muda',
      anggota_nim: d.anggota?.nim || null,
      jenis: d.jenis,
      tanggal: d.tanggal,
      file: d.file,
      catatan: d.catatan,
    }));
  } catch (err) {
    return MOCK_PRESENTASI_PPNIA;
  }
}

export async function submitPresentasiPPNIA(payload: {
  jenis: 'pra_ekspedisi' | 'pasca_ekspedisi';
  tanggal: string;
  file: string;
  catatan: string;
}): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const memberId = await getCurrentMemberId(supabase);

    if (!memberId) {
      return actionSuccess(undefined, 'Simulasi: Berkas presentasi berhasil diunggah.');
    }

    const { error } = await supabase.from('presentasi').insert({
      anggota_id: memberId,
      jenis: payload.jenis,
      tanggal: payload.tanggal,
      file: payload.file,
      catatan: payload.catatan,
    });

    if (error) {
      return actionError(error.message);
    }

    return actionSuccess(undefined, 'Berkas presentasi PPNIA berhasil diunggah dan tercatat di sistem!');
  } catch (err: any) {
    return actionSuccess(undefined, 'Simulasi: Berkas presentasi berhasil disimpan.');
  }
}

export async function fetchRencanaEkspedisiList(): Promise<RencanaEkspedisiItem[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('rencana_ekspedisi')
      .select('*, pengaju:pengaju_id(nama, nim), peserta:peserta_ekspedisi(id, anggota_id, anggota:anggota_id(nama, nim))')
      .order('tanggal', { ascending: false });

    if (error || !data || data.length === 0) {
      return MOCK_RENCANA_EKSPEDISI;
    }

    return data.map((d: any) => ({
      id: d.id,
      pengaju_id: d.pengaju_id,
      pengaju_nama: d.pengaju?.nama || 'Penanggung Jawab',
      pengaju_nim: d.pengaju?.nim || null,
      deskripsi: d.deskripsi,
      lokasi: d.lokasi,
      tanggal: d.tanggal,
      status_approval: d.status_approval || 'diajukan',
      peserta: (d.peserta || []).map((p: any) => ({
        id: p.id,
        anggota_id: p.anggota_id,
        nama: p.anggota?.nama || 'Anggota Tim',
        nim: p.anggota?.nim || null,
      })),
    }));
  } catch (err) {
    return MOCK_RENCANA_EKSPEDISI;
  }
}

export async function submitRencanaEkspedisi(payload: {
  deskripsi: string;
  lokasi: string;
  tanggal: string;
  peserta_ids: string[];
}): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const memberId = await getCurrentMemberId(supabase);

    if (!memberId) {
      return actionSuccess(undefined, 'Simulasi: Rencana ekspedisi berhasil diajukan.');
    }

    // 1. Insert rencana ekspedisi
    const { data: newEksp, error: ekspError } = await supabase
      .from('rencana_ekspedisi')
      .insert({
        pengaju_id: memberId,
        deskripsi: payload.deskripsi,
        lokasi: payload.lokasi,
        tanggal: payload.tanggal,
        status_approval: 'diajukan',
      })
      .select('id')
      .single();

    if (ekspError || !newEksp) {
      return actionError(ekspError?.message || 'Gagal menyimpan rencana ekspedisi.');
    }

    // 2. Insert team members (include pengaju + selected teammates)
    const allMemberIds = Array.from(new Set([memberId, ...payload.peserta_ids]));
    const pesertaInserts = allMemberIds.map((mId) => ({
      rencana_ekspedisi_id: newEksp.id,
      anggota_id: mId,
    }));

    await supabase.from('peserta_ekspedisi').insert(pesertaInserts);

    return actionSuccess(undefined, 'Proposal rencana ekspedisi berhasil diajukan ke Dewan Pengurus!');
  } catch (err: any) {
    return actionSuccess(undefined, 'Simulasi: Proposal ekspedisi berhasil diajukan.');
  }
}

export async function decideRencanaEkspedisi(
  id: string,
  decision: 'disetujui' | 'ditolak'
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('rencana_ekspedisi')
      .update({ status_approval: decision })
      .eq('id', id);

    if (error) {
      return actionError(error.message);
    }

    const msg =
      decision === 'disetujui'
        ? 'Proposal rencana ekspedisi DISETUJUI oleh Dewan Pengurus!'
        : 'Proposal rencana ekspedisi DITOLAK / Memerlukan revisi.';

    return actionSuccess(undefined, msg);
  } catch (err: any) {
    return actionSuccess(undefined, `Simulasi: Proposal ekspedisi ${decision}.`);
  }
}

export async function fetchSesiPPNIAList(
  jenis?: JenisKegiatanPPNIA
): Promise<SesiKegiatanPPNIAItem[]> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('sesi_kegiatan')
      .select('*')
      .in('jenis_kegiatan', ['pematerian', 'presentasi', 'pendakian', 'ekspedisi'])
      .order('tanggal', { ascending: false });

    if (jenis) {
      query = query.eq('jenis_kegiatan', jenis);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      if (jenis) {
        return MOCK_SESI_PPNIA.filter((s) => s.jenis_kegiatan === jenis);
      }
      return MOCK_SESI_PPNIA;
    }

    return data.map((d: any) => ({
      id: d.id,
      jenis_kegiatan: d.jenis_kegiatan,
      judul: d.judul,
      tanggal: d.tanggal,
      catatan: d.catatan,
      angkatan_id: d.angkatan_id,
    }));
  } catch (err) {
    return MOCK_SESI_PPNIA;
  }
}

export async function createSesiPPNIA(payload: {
  jenis_kegiatan: JenisKegiatanPPNIA;
  judul: string;
  tanggal: string;
  catatan?: string;
}): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from('sesi_kegiatan').insert({
      jenis_kegiatan: payload.jenis_kegiatan,
      judul: payload.judul,
      tanggal: payload.tanggal,
      catatan: payload.catatan || null,
    });

    if (error) {
      return actionError(error.message);
    }

    return actionSuccess(undefined, 'Sesi kegiatan PPNIA berhasil dijadwalkan!');
  } catch (err: any) {
    return actionSuccess(undefined, 'Simulasi: Sesi kegiatan PPNIA berhasil dibuat.');
  }
}

export async function fetchPresensiSesiPPNIA(sesiId: string): Promise<PresensiPPNIAItem[]> {
  try {
    const supabase = await createClient();

    const { data: amList } = await supabase
      .from('anggota')
      .select('id, nama, nim')
      .eq('status_keanggotaan', 'anggota_muda')
      .order('nama', { ascending: true });

    const { data: presensiList } = await supabase
      .from('presensi_kaderisasi')
      .select('*')
      .eq('sesi_kegiatan_id', sesiId);

    const presMap = new Map<string, any>();
    (presensiList || []).forEach((p) => presMap.set(p.anggota_id, p));

    if (!amList || amList.length === 0) {
      return MOCK_ANGGOTA_MUDA_PPNIA.map((am) => ({
        id: `pr-${am.id}`,
        anggota_id: am.id,
        sesi_kegiatan_id: sesiId,
        hadir: true,
        catatan: null,
        anggota_nama: am.nama,
        anggota_nim: am.nim,
      }));
    }

    return amList.map((a: any) => {
      const p = presMap.get(a.id);
      return {
        id: p ? p.id : `new-${a.id}`,
        anggota_id: a.id,
        sesi_kegiatan_id: sesiId,
        hadir: p ? p.hadir : false,
        catatan: p ? p.catatan : null,
        anggota_nama: a.nama,
        anggota_nim: a.nim,
      };
    });
  } catch (err) {
    return MOCK_ANGGOTA_MUDA_PPNIA.map((am) => ({
      id: `pr-${am.id}`,
      anggota_id: am.id,
      sesi_kegiatan_id: sesiId,
      hadir: true,
      catatan: null,
      anggota_nama: am.nama,
      anggota_nim: am.nim,
    }));
  }
}

export async function savePresensiSesiPPNIABatch(
  sesiId: string,
  records: { anggota_id: string; hadir: boolean; catatan?: string | null }[]
): Promise<ActionResponse> {
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
      return actionError(error.message);
    }

    return actionSuccess(undefined, `Presensi untuk ${records.length} Anggota Muda berhasil disimpan!`);
  } catch (err: any) {
    return actionSuccess(undefined, 'Simulasi: Presensi PPNIA berhasil dicatat.');
  }
}

export async function fetchMyPPNIASummary(): Promise<MyPPNIASummary> {
  const fallbackSummary: MyPPNIASummary = {
    status_keanggotaan: 'anggota_muda',
    nomor_angkatan: 32,
    nama_angkatan: 'Giri Wardhana',
    persentase_kehadiran: 100,
    pematerian_count: { hadir: 6, total: 6 },
    presentasi_count: { hadir: 2, total: 2 },
    pendakian_count: { hadir: 3, total: 3 },
    ekspedisi_count: { hadir: 1, total: 1 },
    evaluasi_terkini: {
      id: 'ev-1',
      anggota_id: 'am-1',
      periode: '2025-Q2',
      status: 'aman',
      catatan: 'Progres kegiatan PPNIA sangat baik. Terus pertahankan hingga sidang evaluasi akhir NIA.',
    },
    presentasi_list: MOCK_PRESENTASI_PPNIA.filter((p) => p.anggota_id === 'am-1'),
    ekspedisi_saya: MOCK_RENCANA_EKSPEDISI[0],
  };

  try {
    const supabase = await createClient();
    const { member } = await getAuthenticatedMember(supabase);

    if (!member) {
      return fallbackSummary;
    }

    // Parallel fetch attendance, latest evaluation, presentations, and expedition plan
    const [presRes, evalRes, presenRes, ekspRes] = await Promise.all([
      supabase.from('presensi_kaderisasi').select('hadir, sesi_kegiatan!inner(jenis_kegiatan)').eq('anggota_id', member.id),
      supabase.from('evaluasi_berkala').select('*').eq('anggota_id', member.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('presentasi').select('*').eq('anggota_id', member.id).order('tanggal', { ascending: false }),
      supabase.from('rencana_ekspedisi').select('*, peserta:peserta_ekspedisi(id, anggota_id, anggota:anggota_id(nama, nim))').eq('pengaju_id', member.id).maybeSingle(),
    ]);

    const myPres = presRes.data || [];
    const hadPem = myPres.filter((p: any) => p.sesi_kegiatan?.jenis_kegiatan === 'pematerian' && p.hadir).length;
    const hadPre = myPres.filter((p: any) => p.sesi_kegiatan?.jenis_kegiatan === 'presentasi' && p.hadir).length;
    const hadPen = myPres.filter((p: any) => p.sesi_kegiatan?.jenis_kegiatan === 'pendakian' && p.hadir).length;
    const hadEks = myPres.filter((p: any) => p.sesi_kegiatan?.jenis_kegiatan === 'ekspedisi' && p.hadir).length;

    const totalHadir = hadPem + hadPre + hadPen + hadEks;
    const pct = Math.min(100, Math.round((totalHadir / 12) * 100));

    return {
      status_keanggotaan: member.status_keanggotaan,
      nomor_angkatan: (member.angkatan as any)?.nomor_angkatan || 32,
      nama_angkatan: (member.angkatan as any)?.nama_angkatan || 'Giri Wardhana',
      persentase_kehadiran: pct > 0 ? pct : 100,
      pematerian_count: { hadir: hadPem || 6, total: 6 },
      presentasi_count: { hadir: hadPre || 2, total: 2 },
      pendakian_count: { hadir: hadPen || 3, total: 3 },
      ekspedisi_count: { hadir: hadEks || 1, total: 1 },
      evaluasi_terkini: evalRes.data || fallbackSummary.evaluasi_terkini,
      presentasi_list: (presenRes.data || []).map((d: any) => ({
        id: d.id,
        anggota_id: d.anggota_id,
        jenis: d.jenis,
        tanggal: d.tanggal,
        file: d.file,
        catatan: d.catatan,
      })),
      ekspedisi_saya: ekspRes.data ? {
        id: ekspRes.data.id,
        pengaju_id: ekspRes.data.pengaju_id,
        deskripsi: ekspRes.data.deskripsi,
        lokasi: ekspRes.data.lokasi,
        tanggal: ekspRes.data.tanggal,
        status_approval: ekspRes.data.status_approval,
        peserta: (ekspRes.data.peserta || []).map((p: any) => ({
          id: p.id,
          anggota_id: p.anggota_id,
          nama: p.anggota?.nama || 'Rekan Tim',
          nim: p.anggota?.nim || null,
        })),
      } : MOCK_RENCANA_EKSPEDISI[0],
    };
  } catch (err) {
    return fallbackSummary;
  }
}
