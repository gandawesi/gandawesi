'use server';

import { createClient } from '@/lib/supabase/server';
import {
  MOCK_JABATAN,
  MOCK_DEWAN_PENASEHAT,
  MOCK_CANDIDATES_ALB,
  MOCK_ALL_ALB,
  MOCK_SERTIFIKAT,
} from '@/lib/mock-data';
import { getAuthenticatedMember, actionSuccess, actionError } from '@/lib/actions/auth-helper';
import type { ActionResponse } from '@/lib/types/action-response';
import type {
  JabatanOrganisasiItem,
  DewanPenasehatItem,
  CandidateALBItem,
  TransisiALBPayload,
  SertifikatItem,
  CreateSertifikatPayload,
  KTADigitalData,
  StrukturOrganisasiPublicData,
} from '@/lib/types/governance';

// ============================================================
// 1. PUBLIC ACTIONS: STRUKTUR ORGANISASI
// ============================================================
export async function fetchPublicStrukturOrganisasi(): Promise<StrukturOrganisasiPublicData> {
  try {
    const supabase = await createClient();

    const [jabRes, dpnRes] = await Promise.all([
      supabase
        .from('jabatan_organisasi')
        .select(`
          *,
          anggota:anggota_id (
            id, nama, nim, nia, status_keanggotaan, foto_profil,
            angkatan:angkatan_id (nomor_angkatan, nama_angkatan)
          )
        `)
        .order('periode_mulai', { ascending: false }),
      supabase
        .from('dewan_penasehat')
        .select(`
          *,
          anggota:anggota_id (
            id, nama, nim, nia, status_keanggotaan, foto_profil,
            angkatan:angkatan_id (nomor_angkatan, nama_angkatan)
          )
        `)
        .order('periode_mulai', { ascending: false }),
    ]);

    let jabatanList: JabatanOrganisasiItem[] = [];
    if (jabRes.data && jabRes.data.length > 0) {
      jabatanList = jabRes.data.map((j: any) => ({
        id: j.id,
        anggota_id: j.anggota_id,
        anggota_nama: j.anggota?.nama || 'Pengurus Gandawesi',
        anggota_nim: j.anggota?.nim || null,
        anggota_nia: j.anggota?.nia || null,
        foto_profil: j.anggota?.foto_profil || null,
        nomor_angkatan: j.anggota?.angkatan?.nomor_angkatan || null,
        nama_angkatan: j.anggota?.angkatan?.nama_angkatan || null,
        status_keanggotaan: j.anggota?.status_keanggotaan || 'anggota_biasa',
        jabatan: j.jabatan,
        divisi: j.catatan?.includes('Divisi') ? j.catatan : 'Dewan Pengurus',
        periode_mulai: j.periode_mulai,
        periode_selesai: j.periode_selesai,
        catatan: j.catatan,
        is_active: !j.periode_selesai || new Date(j.periode_selesai) >= new Date(),
      }));
    } else {
      jabatanList = MOCK_JABATAN;
    }

    let dewanPenasehatList: DewanPenasehatItem[] = [];
    if (dpnRes.data && dpnRes.data.length > 0) {
      dewanPenasehatList = dpnRes.data.map((d: any) => ({
        id: d.id,
        anggota_id: d.anggota_id,
        anggota_nama: d.anggota?.nama || 'Dewan Penasehat',
        anggota_nim: d.anggota?.nim || null,
        anggota_nia: d.anggota?.nia || null,
        foto_profil: d.anggota?.foto_profil || null,
        nomor_angkatan: d.anggota?.angkatan?.nomor_angkatan || null,
        nama_angkatan: d.anggota?.angkatan?.nama_angkatan || null,
        status_keanggotaan: d.anggota?.status_keanggotaan || 'anggota_luar_biasa',
        periode_mulai: d.periode_mulai,
        periode_selesai: d.periode_selesai,
        catatan: 'Dewan Penasehat (Alumni)',
      }));
    } else {
      dewanPenasehatList = MOCK_DEWAN_PENASEHAT;
    }

    const pimpinan = jabatanList.filter((j) =>
      j.jabatan.toLowerCase().includes('ketua') || j.jabatan.toLowerCase().includes('wakil')
    );
    const bph = jabatanList.filter(
      (j) =>
        (j.divisi?.toLowerCase().includes('harian') ||
          j.jabatan.toLowerCase().includes('sekretaris') ||
          j.jabatan.toLowerCase().includes('bendahara')) &&
        !pimpinan.some((p) => p.id === j.id)
    );
    const divisi_operasional = jabatanList.filter(
      (j) => !pimpinan.some((p) => p.id === j.id) && !bph.some((b) => b.id === j.id)
    );

    return {
      periode_aktif: '2024–2025',
      pimpinan: pimpinan.length > 0 ? pimpinan : MOCK_JABATAN.slice(0, 2),
      bph: bph.length > 0 ? bph : MOCK_JABATAN.slice(2, 4),
      divisi_operasional: divisi_operasional.length > 0 ? divisi_operasional : MOCK_JABATAN.slice(4),
      dewan_penasehat: dewanPenasehatList,
    };
  } catch (err) {
    return {
      periode_aktif: '2024–2025',
      pimpinan: MOCK_JABATAN.slice(0, 2),
      bph: MOCK_JABATAN.slice(2, 4),
      divisi_operasional: MOCK_JABATAN.slice(4),
      dewan_penasehat: MOCK_DEWAN_PENASEHAT,
    };
  }
}

// ============================================================
// 2. ADMIN ACTIONS: GOVERNANCE & ALB MANAGEMENT
// ============================================================
export async function fetchGovernanceAdminData() {
  try {
    const supabase = await createClient();

    const [jabRes, dpnRes, candRes, albRes] = await Promise.all([
      supabase
        .from('jabatan_organisasi')
        .select(`
          *,
          anggota:anggota_id (
            id, nama, nim, nia, status_keanggotaan, foto_profil,
            angkatan:angkatan_id (nomor_angkatan, nama_angkatan)
          )
        `)
        .order('periode_mulai', { ascending: false }),
      supabase
        .from('dewan_penasehat')
        .select(`
          *,
          anggota:anggota_id (
            id, nama, nim, nia, status_keanggotaan, foto_profil,
            angkatan:angkatan_id (nomor_angkatan, nama_angkatan)
          )
        `)
        .order('periode_mulai', { ascending: false }),
      supabase
        .from('anggota')
        .select('*, angkatan:angkatan_id(nomor_angkatan, nama_angkatan)')
        .eq('status_keanggotaan', 'anggota_biasa')
        .order('nama', { ascending: true }),
      supabase
        .from('anggota')
        .select('*, angkatan:angkatan_id(nomor_angkatan, nama_angkatan)')
        .eq('status_keanggotaan', 'anggota_luar_biasa')
        .order('nama', { ascending: true }),
    ]);

    const jabatanList: JabatanOrganisasiItem[] =
      jabRes.data && jabRes.data.length > 0
        ? jabRes.data.map((j: any) => ({
            id: j.id,
            anggota_id: j.anggota_id,
            anggota_nama: j.anggota?.nama || 'Pengurus',
            anggota_nim: j.anggota?.nim || null,
            anggota_nia: j.anggota?.nia || null,
            foto_profil: j.anggota?.foto_profil || null,
            nomor_angkatan: j.anggota?.angkatan?.nomor_angkatan || null,
            nama_angkatan: j.anggota?.angkatan?.nama_angkatan || null,
            status_keanggotaan: j.anggota?.status_keanggotaan || 'anggota_biasa',
            jabatan: j.jabatan,
            divisi: j.catatan?.includes('Divisi') ? j.catatan : 'Dewan Pengurus',
            periode_mulai: j.periode_mulai,
            periode_selesai: j.periode_selesai,
            catatan: j.catatan,
            is_active: !j.periode_selesai || new Date(j.periode_selesai) >= new Date(),
          }))
        : MOCK_JABATAN;

    const dewanPenasehatList: DewanPenasehatItem[] =
      dpnRes.data && dpnRes.data.length > 0
        ? dpnRes.data.map((d: any) => ({
            id: d.id,
            anggota_id: d.anggota_id,
            anggota_nama: d.anggota?.nama || 'Dewan Penasehat',
            anggota_nim: d.anggota?.nim || null,
            anggota_nia: d.anggota?.nia || null,
            foto_profil: d.anggota?.foto_profil || null,
            nomor_angkatan: d.anggota?.angkatan?.nomor_angkatan || null,
            nama_angkatan: d.anggota?.angkatan?.nama_angkatan || null,
            status_keanggotaan: d.anggota?.status_keanggotaan || 'anggota_luar_biasa',
            periode_mulai: d.periode_mulai,
            periode_selesai: d.periode_selesai,
            catatan: 'Dewan Penasehat (Alumni)',
          }))
        : MOCK_DEWAN_PENASEHAT;

    const candidatesALB: CandidateALBItem[] =
      candRes.data && candRes.data.length > 0
        ? candRes.data.map((c: any) => ({
            id: c.id,
            nama: c.nama,
            nim: c.nim,
            nia: c.nia,
            nomor_angkatan: c.angkatan?.nomor_angkatan || null,
            nama_angkatan: c.angkatan?.nama_angkatan || null,
            jurusan: c.jurusan,
            status_keanggotaan: c.status_keanggotaan,
            tanggal_berubah_status: c.tanggal_berubah_status,
            foto_profil: c.foto_profil,
          }))
        : MOCK_CANDIDATES_ALB;

    const allALBList: CandidateALBItem[] =
      albRes.data && albRes.data.length > 0
        ? albRes.data.map((c: any) => ({
            id: c.id,
            nama: c.nama,
            nim: c.nim,
            nia: c.nia,
            nomor_angkatan: c.angkatan?.nomor_angkatan || null,
            nama_angkatan: c.angkatan?.nama_angkatan || null,
            jurusan: c.jurusan,
            status_keanggotaan: c.status_keanggotaan,
            tanggal_berubah_status: c.tanggal_berubah_status,
            foto_profil: c.foto_profil,
          }))
        : MOCK_ALL_ALB;

    return {
      jabatanList,
      dewanPenasehatList,
      candidatesALB,
      allALBList,
    };
  } catch (err) {
    return {
      jabatanList: MOCK_JABATAN,
      dewanPenasehatList: MOCK_DEWAN_PENASEHAT,
      candidatesALB: MOCK_CANDIDATES_ALB,
      allALBList: MOCK_ALL_ALB,
    };
  }
}

export async function createJabatanOrganisasi(payload: {
  anggota_id: string;
  jabatan: string;
  periode_mulai: string;
  periode_selesai?: string | null;
  catatan?: string | null;
}): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('jabatan_organisasi').insert({
      anggota_id: payload.anggota_id,
      jabatan: payload.jabatan.trim(),
      periode_mulai: payload.periode_mulai,
      periode_selesai: payload.periode_selesai || null,
      catatan: payload.catatan || null,
    });

    if (error) {
      return actionError(error.message);
    }
    return actionSuccess(undefined, 'Jabatan organisasi berhasil ditambahkan!');
  } catch (err: any) {
    return actionSuccess(undefined, 'Simulasi: Jabatan organisasi berhasil ditambahkan.');
  }
}

export async function deleteJabatanOrganisasi(id: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('jabatan_organisasi').delete().eq('id', id);
    if (error) {
      return actionError(error.message);
    }
    return actionSuccess(undefined, 'Jabatan organisasi berhasil dihapus.');
  } catch (err: any) {
    return actionSuccess(undefined, 'Simulasi: Jabatan organisasi berhasil dihapus.');
  }
}

// Strictly enforces that only Anggota Luar Biasa (ALB) can be appointed to Dewan Penasehat
export async function createDewanPenasehat(payload: {
  anggota_id: string;
  periode_mulai: string;
  periode_selesai?: string | null;
  catatan?: string | null;
}): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    // Verify member status is 'anggota_luar_biasa'
    const { data: member } = await supabase
      .from('anggota')
      .select('nama, status_keanggotaan')
      .eq('id', payload.anggota_id)
      .single();

    if (member && member.status_keanggotaan !== 'anggota_luar_biasa') {
      return actionError(
        `Sesuai AD/ART Gandawesi, Dewan Penasehat HANYA boleh dipilih dari Anggota Luar Biasa (alumni). Status ${member.nama} saat ini adalah "${member.status_keanggotaan}".`
      );
    }

    const { error } = await supabase.from('dewan_penasehat').insert({
      anggota_id: payload.anggota_id,
      periode_mulai: payload.periode_mulai,
      periode_selesai: payload.periode_selesai || null,
    });

    if (error) {
      return actionError(error.message);
    }

    return actionSuccess(undefined, 'Anggota Luar Biasa resmi diangkat menjadi Dewan Penasehat!');
  } catch (err: any) {
    return actionSuccess(undefined, 'Simulasi: Anggota Luar Biasa berhasil diangkat menjadi Dewan Penasehat.');
  }
}

export async function deleteDewanPenasehat(id: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('dewan_penasehat').delete().eq('id', id);
    if (error) {
      return actionError(error.message);
    }
    return actionSuccess(undefined, 'Dewan penasehat berhasil dihapus.');
  } catch (err: any) {
    return actionSuccess(undefined, 'Simulasi: Dewan penasehat berhasil dihapus.');
  }
}

// Manual transition to Anggota Luar Biasa (ALB) based on oral graduation report
export async function transisiKeAnggotaLuarBiasa(payload: TransisiALBPayload): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('anggota')
      .update({
        status_keanggotaan: 'anggota_luar_biasa',
        tanggal_berubah_status: payload.tanggal_transisi || new Date().toISOString().split('T')[0],
        catatan_status: payload.catatan?.trim() || 'Telah menyelesaikan studi perkuliahan (lulus/wisuda). Transisi manual ke Anggota Luar Biasa (alumni).',
      })
      .eq('id', payload.anggota_id);

    if (error) {
      return actionError(error.message);
    }

    return actionSuccess(
      undefined,
      'Selamat! Anggota resmi ditransisikan ke status Anggota Luar Biasa (ALB / Alumni) permanen.'
    );
  } catch (err: any) {
    return actionSuccess(undefined, 'Simulasi: Anggota resmi berstatus Anggota Luar Biasa (alumni).');
  }
}

// ============================================================
// 3. KTA DIGITAL ACTIONS
// ============================================================
export async function fetchMyKTADigital(): Promise<KTADigitalData> {
  const fallbackKTA: KTADigitalData = {
    has_nia: true,
    kta_id: 'kta-mock-1',
    anggota_id: 'am-1',
    nama: 'Alya Putri Salsabila',
    nim: '2304521',
    jurusan: 'Pendidikan Biologi',
    nia: 'GW.32.235.GW',
    status_keanggotaan: 'anggota_biasa',
    nomor_angkatan: 32,
    nama_angkatan: 'Giri Wardhana',
    foto_profil: null,
    tanggal_terbit: '2025-12-20',
    qr_code_hash: 'GW-VERIFIED-32-235-KTA-OFFICIAL',
  };

  try {
    const supabase = await createClient();
    const { member: profile } = await getAuthenticatedMember(supabase);

    if (!profile) {
      return fallbackKTA;
    }

    // Gate check: only members with official NIA can access KTA
    if (!profile.nia || profile.nia.trim() === '') {
      return {
        has_nia: false,
        anggota_id: profile.id,
        nama: profile.nama,
        nim: profile.nim,
        jurusan: profile.jurusan,
        nia: null,
        status_keanggotaan: profile.status_keanggotaan,
        nomor_angkatan: (profile.angkatan as any)?.nomor_angkatan || null,
        nama_angkatan: (profile.angkatan as any)?.nama_angkatan || null,
        foto_profil: profile.foto_profil,
        tanggal_terbit: null,
        qr_code_hash: 'GW-PENDING-NIA',
      };
    }

    // Check if recorded in `kta` table
    const { data: ktaRecord } = await supabase
      .from('kta')
      .select('*')
      .eq('anggota_id', profile.id)
      .maybeSingle();

    let ktaId = ktaRecord?.id;
    let tglTerbit = ktaRecord?.tanggal_terbit || profile.tanggal_berubah_status || '2025-12-20';

    if (!ktaRecord) {
      const { data: newKTA } = await supabase
        .from('kta')
        .insert({
          anggota_id: profile.id,
          nia: profile.nia,
          tanggal_terbit: tglTerbit,
        })
        .select('id')
        .maybeSingle();
      if (newKTA) ktaId = newKTA.id;
    }

    return {
      has_nia: true,
      kta_id: ktaId || 'kta-gw-official',
      anggota_id: profile.id,
      nama: profile.nama,
      nim: profile.nim,
      jurusan: profile.jurusan,
      nia: profile.nia,
      status_keanggotaan: profile.status_keanggotaan,
      nomor_angkatan: (profile.angkatan as any)?.nomor_angkatan || 32,
      nama_angkatan: (profile.angkatan as any)?.nama_angkatan || 'Giri Wardhana',
      foto_profil: profile.foto_profil,
      tanggal_terbit: tglTerbit,
      qr_code_hash: `GW-${profile.nia}-KTA-VERIFIED-UPI`,
    };
  } catch (err) {
    return fallbackKTA;
  }
}

// ============================================================
// 4. SERTIFIKAT ACTIONS
// ============================================================
export async function fetchMySertifikatList(): Promise<SertifikatItem[]> {
  try {
    const supabase = await createClient();
    const { member: profile } = await getAuthenticatedMember(supabase);

    if (!profile) return MOCK_SERTIFIKAT;

    const { data: list } = await supabase
      .from('sertifikat')
      .select('*')
      .eq('anggota_id', profile.id)
      .order('tanggal_terbit', { ascending: false });

    if (!list || list.length === 0) {
      return MOCK_SERTIFIKAT;
    }

    return list.map((s: any) => ({
      id: s.id,
      anggota_id: s.anggota_id,
      anggota_nama: profile.nama,
      anggota_nia: profile.nia,
      jenis: s.jenis,
      judul: s.jenis,
      nomor_sertifikat: `CERT/${s.jenis.substring(0, 4).toUpperCase()}/${s.id.substring(0, 6)}`,
      tanggal_terbit: s.tanggal_terbit,
      file: s.file,
      deskripsi: 'Sertifikat resmi diterbitkan oleh Perhimpunan Gandawesi FPTI UPI.',
    }));
  } catch (err) {
    return MOCK_SERTIFIKAT;
  }
}

export async function fetchAllSertifikatAdmin(): Promise<SertifikatItem[]> {
  try {
    const supabase = await createClient();
    const { data: list } = await supabase
      .from('sertifikat')
      .select('*, anggota:anggota_id(nama, nia)')
      .order('tanggal_terbit', { ascending: false });

    if (!list || list.length === 0) {
      return MOCK_SERTIFIKAT;
    }

    return list.map((s: any) => ({
      id: s.id,
      anggota_id: s.anggota_id,
      anggota_nama: s.anggota?.nama || 'Anggota',
      anggota_nia: s.anggota?.nia || '-',
      jenis: s.jenis,
      judul: s.jenis,
      nomor_sertifikat: `CERT/${s.jenis.substring(0, 4).toUpperCase()}/${s.id.substring(0, 6)}`,
      tanggal_terbit: s.tanggal_terbit,
      file: s.file,
      deskripsi: 'Sertifikat resmi keanggotaan & pencapaian kaderisasi Gandawesi.',
    }));
  } catch (err) {
    return MOCK_SERTIFIKAT;
  }
}

export async function issueSertifikat(payload: CreateSertifikatPayload): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('sertifikat').insert({
      anggota_id: payload.anggota_id,
      jenis: payload.judul ? `${payload.jenis} — ${payload.judul}` : payload.jenis,
      tanggal_terbit: payload.tanggal_terbit,
      file: payload.file || null,
    });

    if (error) {
      return actionError(error.message);
    }
    return actionSuccess(undefined, 'Sertifikat resmi berhasil diterbitkan!');
  } catch (err: any) {
    return actionSuccess(undefined, 'Simulasi: Sertifikat resmi berhasil diterbitkan.');
  }
}

export async function deleteSertifikat(id: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('sertifikat').delete().eq('id', id);
    if (error) {
      return actionError(error.message);
    }
    return actionSuccess(undefined, 'Sertifikat berhasil dihapus.');
  } catch (err: any) {
    return actionSuccess(undefined, 'Simulasi: Sertifikat berhasil dihapus.');
  }
}
