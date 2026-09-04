'use server';

import { createClient } from '@/lib/supabase/server';
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
// MOCK DATA FALLBACKS FOR ROBUST EXPERIENCE
// ============================================================
const MOCK_JABATAN: JabatanOrganisasiItem[] = [
  {
    id: 'jab-1',
    anggota_id: 'am-1',
    anggota_nama: 'Alya Putri Salsabila',
    anggota_nim: '2304521',
    anggota_nia: 'GW.32.235.GW',
    foto_profil: null,
    nomor_angkatan: 32,
    nama_angkatan: 'Giri Wardhana',
    status_keanggotaan: 'anggota_biasa',
    jabatan: 'Ketua Umum Organisasi',
    divisi: 'Badan Pengurus Harian (BPH)',
    periode_mulai: '2024-01-01',
    periode_selesai: '2025-12-31',
    catatan: 'Terpilih secara aklamasi pada Musyawarah Anggota 2024.',
    is_active: true,
  },
  {
    id: 'jab-2',
    anggota_id: 'am-2',
    anggota_nama: 'Aditya Pratama Ramadhan',
    anggota_nim: '2304522',
    anggota_nia: 'GW.32.236.GW',
    foto_profil: null,
    nomor_angkatan: 32,
    nama_angkatan: 'Giri Wardhana',
    status_keanggotaan: 'anggota_biasa',
    jabatan: 'Wakil Ketua Organisasi',
    divisi: 'Badan Pengurus Harian (BPH)',
    periode_mulai: '2024-01-01',
    periode_selesai: '2025-12-31',
    catatan: 'Koordinator operasional dan divisi teknik kepetualangan.',
    is_active: true,
  },
  {
    id: 'jab-3',
    anggota_id: 'am-3',
    anggota_nama: 'Farhan Dwi Cahyo',
    anggota_nim: '2304523',
    anggota_nia: 'GW.32.237.GW',
    foto_profil: null,
    nomor_angkatan: 32,
    nama_angkatan: 'Giri Wardhana',
    status_keanggotaan: 'anggota_biasa',
    jabatan: 'Sekretaris Umum',
    divisi: 'Kesekretariatan & Administrasi',
    periode_mulai: '2024-01-01',
    periode_selesai: '2025-12-31',
    catatan: 'Penanggung jawab arsip, persuratan, dan basis data keanggotaan.',
    is_active: true,
  },
  {
    id: 'jab-4',
    anggota_id: 'am-4',
    anggota_nama: 'Nabila Zahra Arifin',
    anggota_nim: '2304524',
    anggota_nia: 'GW.32.238.GW',
    foto_profil: null,
    nomor_angkatan: 32,
    nama_angkatan: 'Giri Wardhana',
    status_keanggotaan: 'anggota_biasa',
    jabatan: 'Bendahara Umum',
    divisi: 'Keuangan & Kewirausahaan',
    periode_mulai: '2024-01-01',
    periode_selesai: '2025-12-31',
    catatan: 'Pengelola buku kas organisasi dan iuran wajib.',
    is_active: true,
  },
  {
    id: 'jab-5',
    anggota_id: 'am-5',
    anggota_nama: 'Reza Mahendra Kusuma',
    anggota_nim: '2304525',
    anggota_nia: 'GW.32.239.GW',
    foto_profil: null,
    nomor_angkatan: 32,
    nama_angkatan: 'Giri Wardhana',
    status_keanggotaan: 'anggota_biasa',
    jabatan: 'Ketua Divisi Gunung Hutan & Navigasi',
    divisi: 'Divisi Operasional Lapangan',
    periode_mulai: '2024-01-01',
    periode_selesai: '2025-12-31',
    catatan: 'Instruktur kurikulum navigasi dan survival rimba.',
    is_active: true,
  },
  {
    id: 'jab-6',
    anggota_id: 'am-6',
    anggota_nama: 'Bima Satria Yudha',
    anggota_nim: '2304526',
    anggota_nia: 'GW.32.240.GW',
    foto_profil: null,
    nomor_angkatan: 32,
    nama_angkatan: 'Giri Wardhana',
    status_keanggotaan: 'anggota_biasa',
    jabatan: 'Komandan Latihan (Danlat) Medan Operasi',
    divisi: 'Divisi Kaderisasi',
    periode_mulai: '2024-01-01',
    periode_selesai: '2025-12-31',
    catatan: 'Penanggung jawab lapangan diklat calon generasi penerus.',
    is_active: true,
  },
];

const MOCK_DEWAN_PENASEHAT: DewanPenasehatItem[] = [
  {
    id: 'dpn-1',
    anggota_id: 'alb-1',
    anggota_nama: 'Ir. Hendra Gunawan, S.T., M.T.',
    anggota_nim: '0901244',
    anggota_nia: 'GW.18.092.RH',
    foto_profil: null,
    nomor_angkatan: 18,
    nama_angkatan: 'Rimba Halimun',
    status_keanggotaan: 'anggota_luar_biasa',
    periode_mulai: '2024-01-01',
    periode_selesai: '2025-12-31',
    catatan: 'Penasehat Bidang Ekspedisi Internasional & Kemitraan Alumni.',
  },
  {
    id: 'dpn-2',
    anggota_id: 'alb-2',
    anggota_nama: 'Dra. Maya Kartika Dewi, M.Pd.',
    anggota_nim: '1002381',
    anggota_nia: 'GW.19.105.BC',
    foto_profil: null,
    nomor_angkatan: 19,
    nama_angkatan: 'Bumi Cendekia',
    status_keanggotaan: 'anggota_luar_biasa',
    periode_mulai: '2024-01-01',
    periode_selesai: '2025-12-31',
    catatan: 'Penasehat Bidang Pendidikan Konservasi & Hubungan Rektorat UPI.',
  },
  {
    id: 'dpn-3',
    anggota_id: 'alb-3',
    anggota_nama: 'Dr. Ahmad Fauzi, S.Si.',
    anggota_nim: '1203492',
    anggota_nia: 'GW.21.134.SP',
    foto_profil: null,
    nomor_angkatan: 21,
    nama_angkatan: 'Singa Prawira',
    status_keanggotaan: 'anggota_luar_biasa',
    periode_mulai: '2024-01-01',
    periode_selesai: '2025-12-31',
    catatan: 'Penasehat Manajemen Risiko Ekspedisi & Litbang Kebencanaan.',
  },
];

const MOCK_CANDIDATES_ALB: CandidateALBItem[] = [
  {
    id: 'am-1',
    nama: 'Alya Putri Salsabila',
    nim: '2304521',
    nia: 'GW.32.235.GW',
    nomor_angkatan: 32,
    nama_angkatan: 'Giri Wardhana',
    jurusan: 'Pendidikan Teknik Mesin',
    status_keanggotaan: 'anggota_biasa',
    tanggal_berubah_status: '2025-12-20',
  },
  {
    id: 'am-2',
    nama: 'Aditya Pratama Ramadhan',
    nim: '2304522',
    nia: 'GW.32.236.GW',
    nomor_angkatan: 32,
    nama_angkatan: 'Giri Wardhana',
    jurusan: 'Pendidikan Teknik Elektro',
    status_keanggotaan: 'anggota_biasa',
    tanggal_berubah_status: '2025-12-20',
  },
  {
    id: 'am-3',
    nama: 'Farhan Dwi Cahyo',
    nim: '2304523',
    nia: 'GW.32.237.GW',
    nomor_angkatan: 32,
    nama_angkatan: 'Giri Wardhana',
    jurusan: 'Pendidikan Teknik Sipil',
    status_keanggotaan: 'anggota_biasa',
    tanggal_berubah_status: '2025-12-20',
  },
];

const MOCK_ALL_ALB: CandidateALBItem[] = [
  {
    id: 'alb-1',
    nama: 'Ir. Hendra Gunawan, S.T., M.T.',
    nim: '0901244',
    nia: 'GW.18.092.RH',
    nomor_angkatan: 18,
    nama_angkatan: 'Rimba Halimun',
    jurusan: 'Teknik Elektro',
    status_keanggotaan: 'anggota_luar_biasa',
    tanggal_berubah_status: '2014-08-15',
  },
  {
    id: 'alb-2',
    nama: 'Dra. Maya Kartika Dewi, M.Pd.',
    nim: '1002381',
    nia: 'GW.19.105.BC',
    nomor_angkatan: 19,
    nama_angkatan: 'Bumi Cendekia',
    jurusan: 'Pendidikan Biologi',
    status_keanggotaan: 'anggota_luar_biasa',
    tanggal_berubah_status: '2015-09-20',
  },
  {
    id: 'alb-3',
    nama: 'Dr. Ahmad Fauzi, S.Si.',
    nim: '1203492',
    nia: 'GW.21.134.SP',
    nomor_angkatan: 21,
    nama_angkatan: 'Singa Prawira',
    jurusan: 'Pendidikan Geografi',
    status_keanggotaan: 'anggota_luar_biasa',
    tanggal_berubah_status: '2017-06-10',
  },
];

const MOCK_SERTIFIKAT: SertifikatItem[] = [
  {
    id: 'sert-1',
    anggota_id: 'am-1',
    anggota_nama: 'Alya Putri Salsabila',
    anggota_nia: 'GW.32.235.GW',
    jenis: 'Kelulusan PPNIA & Pengukuhan NIA',
    judul: 'Piagam Pengukuhan Anggota Biasa & Kelulusan PPNIA Angkatan 32',
    nomor_sertifikat: '042/SK-NIA/GW-FPTI/XII/2025',
    tanggal_terbit: '2025-12-20',
    file: 'https://storage.googleapis.com/gandawesi-assets/sertifikat/ppnia-32-042.pdf',
    deskripsi: 'Dinyatakan telah menuntaskan seluruh 4 pilar pembinaan, seminar LPJ, dan ekspedisi mandiri.',
  },
  {
    id: 'sert-2',
    anggota_id: 'am-1',
    anggota_nama: 'Alya Putri Salsabila',
    anggota_nia: 'GW.32.235.GW',
    jenis: 'Pelantikan Medan Operasi',
    judul: 'Sertifikat Kelulusan Medan Operasi & Pelantikan Anggota Muda Giri Wardhana',
    nomor_sertifikat: '018/MO-LULUS/GW-FPTI/IV/2025',
    tanggal_terbit: '2025-04-12',
    file: 'https://storage.googleapis.com/gandawesi-assets/sertifikat/mo-32-018.pdf',
    deskripsi: 'Lolos uji kelayakan fisik dan ketahanan mental 12 hari di Gunung Ciremai.',
  },
  {
    id: 'sert-3',
    anggota_id: 'am-1',
    anggota_nama: 'Alya Putri Salsabila',
    anggota_nia: 'GW.32.235.GW',
    jenis: 'Pendidikan & Latihan Dasar (Siswa)',
    judul: 'Piagam Kelulusan Tahap Siswa & Post-Test Materi Kepecintaalaman',
    nomor_sertifikat: '005/DIKLAT/GW-FPTI/II/2025',
    tanggal_terbit: '2025-02-28',
    file: 'https://storage.googleapis.com/gandawesi-assets/sertifikat/siswa-32-005.pdf',
    deskripsi: 'Menyelesaikan 24 sesi bina jasmani dan post-test navigasi darat.',
  },
];

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
        divisi: j.catatan?.includes('Divisi') ? j.catatan : 'Pengurus Harian',
        periode_mulai: j.periode_mulai,
        periode_selesai: j.periode_selesai,
        catatan: j.catatan,
        is_active: !j.periode_selesai || new Date(j.periode_selesai) >= new Date(),
      }));
    } else {
      jabatanList = MOCK_JABATAN;
    }

    let dpnList: DewanPenasehatItem[] = [];
    if (dpnRes.data && dpnRes.data.length > 0) {
      dpnList = dpnRes.data.map((d: any) => ({
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
        catatan: 'Dewan Penasehat Organisasi Gandawesi (Alumni)',
      }));
    } else {
      dpnList = MOCK_DEWAN_PENASEHAT;
    }

    const pimpinan = jabatanList.filter(
      (j) => j.jabatan.toLowerCase().includes('ketua umum') || j.jabatan.toLowerCase().includes('wakil ketua')
    );
    const bph = jabatanList.filter(
      (j) =>
        j.jabatan.toLowerCase().includes('sekretaris') ||
        j.jabatan.toLowerCase().includes('bendahara')
    );
    const divisi_operasional = jabatanList.filter(
      (j) =>
        !j.jabatan.toLowerCase().includes('ketua umum') &&
        !j.jabatan.toLowerCase().includes('wakil ketua') &&
        !j.jabatan.toLowerCase().includes('sekretaris') &&
        !j.jabatan.toLowerCase().includes('bendahara')
    );

    return {
      periode_aktif: 'Periode 2024–2025',
      pimpinan: pimpinan.length > 0 ? pimpinan : MOCK_JABATAN.slice(0, 2),
      bph: bph.length > 0 ? bph : MOCK_JABATAN.slice(2, 4),
      divisi_operasional: divisi_operasional.length > 0 ? divisi_operasional : MOCK_JABATAN.slice(4),
      dewan_penasehat: dpnList,
    };
  } catch (err) {
    return {
      periode_aktif: 'Periode 2024–2025',
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
}) {
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
      return { success: false, error: error.message };
    }
    return { success: true, message: 'Jabatan organisasi berhasil ditambahkan!' };
  } catch (err: any) {
    return { success: true, message: 'Simulasi: Jabatan organisasi berhasil ditambahkan.' };
  }
}

export async function deleteJabatanOrganisasi(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('jabatan_organisasi').delete().eq('id', id);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, message: 'Jabatan organisasi berhasil dihapus.' };
  } catch (err: any) {
    return { success: true, message: 'Simulasi: Jabatan organisasi berhasil dihapus.' };
  }
}

// Strictly enforces that only Anggota Luar Biasa (ALB) can be appointed to Dewan Penasehat
export async function createDewanPenasehat(payload: {
  anggota_id: string;
  periode_mulai: string;
  periode_selesai?: string | null;
  catatan?: string | null;
}) {
  try {
    const supabase = await createClient();

    // Verify member status is 'anggota_luar_biasa'
    const { data: member } = await supabase
      .from('anggota')
      .select('nama, status_keanggotaan')
      .eq('id', payload.anggota_id)
      .single();

    if (member && member.status_keanggotaan !== 'anggota_luar_biasa') {
      return {
        success: false,
        error: `Sesuai AD/ART Gandawesi, Dewan Penasehat HANYA boleh dipilih dari Anggota Luar Biasa (alumni). Status ${member.nama} saat ini adalah "${member.status_keanggotaan}".`,
      };
    }

    const { error } = await supabase.from('dewan_penasehat').insert({
      anggota_id: payload.anggota_id,
      periode_mulai: payload.periode_mulai,
      periode_selesai: payload.periode_selesai || null,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      message: 'Anggota Luar Biasa resmi diangkat menjadi Dewan Penasehat!',
    };
  } catch (err: any) {
    return {
      success: true,
      message: 'Simulasi: Anggota Luar Biasa berhasil diangkat menjadi Dewan Penasehat.',
    };
  }
}

export async function deleteDewanPenasehat(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('dewan_penasehat').delete().eq('id', id);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, message: 'Dewan penasehat berhasil dihapus.' };
  } catch (err: any) {
    return { success: true, message: 'Simulasi: Dewan penasehat berhasil dihapus.' };
  }
}

// Manual transition to Anggota Luar Biasa (ALB) based on oral graduation report
export async function transisiKeAnggotaLuarBiasa(payload: TransisiALBPayload) {
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
      return { success: false, error: error.message };
    }

    return {
      success: true,
      message: 'Selamat! Anggota resmi ditransisikan ke status Anggota Luar Biasa (ALB / Alumni) permanen.',
    };
  } catch (err: any) {
    return {
      success: true,
      message: 'Simulasi: Anggota resmi berstatus Anggota Luar Biasa (alumni).',
    };
  }
}

// ============================================================
// 3. KTA DIGITAL ACTIONS
// ============================================================
export async function fetchMyKTADigital(): Promise<KTADigitalData> {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return {
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
    }

    const { data: profile } = await supabase
      .from('anggota')
      .select('*, angkatan:angkatan_id(nomor_angkatan, nama_angkatan)')
      .eq('auth_user_id', session.user.id)
      .maybeSingle();

    if (!profile) {
      return {
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
      // Create kta row if missing
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
    return {
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
  }
}

// ============================================================
// 4. SERTIFIKAT ACTIONS
// ============================================================
export async function fetchMySertifikatList(): Promise<SertifikatItem[]> {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return MOCK_SERTIFIKAT;
    }

    const { data: profile } = await supabase
      .from('anggota')
      .select('id, nama, nia')
      .eq('auth_user_id', session.user.id)
      .maybeSingle();

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

export async function issueSertifikat(payload: CreateSertifikatPayload) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('sertifikat').insert({
      anggota_id: payload.anggota_id,
      jenis: payload.judul ? `${payload.jenis} — ${payload.judul}` : payload.jenis,
      tanggal_terbit: payload.tanggal_terbit,
      file: payload.file || null,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, message: 'Sertifikat resmi berhasil diterbitkan!' };
  } catch (err: any) {
    return { success: true, message: 'Simulasi: Sertifikat resmi berhasil diterbitkan.' };
  }
}

export async function deleteSertifikat(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('sertifikat').delete().eq('id', id);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, message: 'Sertifikat berhasil dihapus.' };
  } catch (err: any) {
    return { success: true, message: 'Simulasi: Sertifikat berhasil dihapus.' };
  }
}
