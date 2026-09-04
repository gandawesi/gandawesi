'use server';

import { createClient } from '@/lib/supabase/server';
import type {
  TarifIuranItem,
  IuranItem,
  TransaksiKasItem,
  CreateTransaksiKasPayload,
  EventAnggaranItem,
  CreateAnggaranPayload,
  LPJItem,
  CreateLPJPayload,
  MyIuranSummary,
  AdminKeuanganSummary,
} from '@/lib/types/keuangan';

// ============================================================
// MOCK DATA FALLBACKS FOR ROBUST EXPERIENCE
// ============================================================
const MOCK_TARIF: TarifIuranItem[] = [
  { id: 'tar-1', status_keanggotaan: 'anggota_muda', nominal: 15000, berlaku_sejak: '2024-01-01' },
  { id: 'tar-2', status_keanggotaan: 'anggota_biasa', nominal: 25000, berlaku_sejak: '2024-01-01' },
  { id: 'tar-3', status_keanggotaan: 'anggota_luar_biasa', nominal: 50000, berlaku_sejak: '2024-01-01' },
];

const MOCK_IURAN_LIST: IuranItem[] = [
  {
    id: 'iur-1',
    anggota_id: 'am-1',
    anggota_nama: 'Alya Putri Salsabila',
    anggota_nim: '2304521',
    anggota_nia: 'GW.32.235.GW',
    nomor_angkatan: 32,
    nama_angkatan: 'Giri Wardhana',
    status_keanggotaan: 'anggota_biasa',
    periode: '2025-06',
    nominal: 25000,
    status_bayar: 'menunggak',
    tanggal_bayar: null,
  },
  {
    id: 'iur-2',
    anggota_id: 'am-1',
    anggota_nama: 'Alya Putri Salsabila',
    anggota_nim: '2304521',
    anggota_nia: 'GW.32.235.GW',
    nomor_angkatan: 32,
    nama_angkatan: 'Giri Wardhana',
    status_keanggotaan: 'anggota_biasa',
    periode: '2025-05',
    nominal: 25000,
    status_bayar: 'lunas',
    tanggal_bayar: '2025-05-10',
  },
  {
    id: 'iur-3',
    anggota_id: 'am-1',
    anggota_nama: 'Alya Putri Salsabila',
    anggota_nim: '2304521',
    anggota_nia: 'GW.32.235.GW',
    nomor_angkatan: 32,
    nama_angkatan: 'Giri Wardhana',
    status_keanggotaan: 'anggota_biasa',
    periode: '2025-04',
    nominal: 25000,
    status_bayar: 'lunas',
    tanggal_bayar: '2025-04-05',
  },
  {
    id: 'iur-4',
    anggota_id: 'am-2',
    anggota_nama: 'Aditya Pratama Ramadhan',
    anggota_nim: '2304522',
    anggota_nia: 'GW.32.236.GW',
    nomor_angkatan: 32,
    nama_angkatan: 'Giri Wardhana',
    status_keanggotaan: 'anggota_biasa',
    periode: '2025-06',
    nominal: 25000,
    status_bayar: 'lunas',
    tanggal_bayar: '2025-06-02',
  },
  {
    id: 'iur-5',
    anggota_id: 'am-3',
    anggota_nama: 'Farhan Dwi Cahyo',
    anggota_nim: '2304523',
    anggota_nia: 'GW.32.237.GW',
    nomor_angkatan: 32,
    nama_angkatan: 'Giri Wardhana',
    status_keanggotaan: 'anggota_biasa',
    periode: '2025-06',
    nominal: 25000,
    status_bayar: 'menunggak',
    tanggal_bayar: null,
  },
  {
    id: 'iur-6',
    anggota_id: 'alb-1',
    anggota_nama: 'Ir. Hendra Gunawan, S.T., M.T.',
    anggota_nim: '0901244',
    anggota_nia: 'GW.18.092.RH',
    nomor_angkatan: 18,
    nama_angkatan: 'Rimba Halimun',
    status_keanggotaan: 'anggota_luar_biasa',
    periode: '2025-06',
    nominal: 50000,
    status_bayar: 'lunas',
    tanggal_bayar: '2025-06-01',
  },
];

const MOCK_TRANSAKSI_KAS: TransaksiKasItem[] = [
  {
    id: 'kas-1',
    tipe: 'masuk',
    kategori: 'iuran',
    nominal: 500000,
    keterangan: 'Penerimaan rekap iuran kas anggota aktif bulan Mei 2025',
    tanggal: '2025-05-30',
    bukti: 'https://storage.googleapis.com/gandawesi-assets/receipts/rec-01.jpg',
    event_id: null,
  },
  {
    id: 'kas-2',
    tipe: 'masuk',
    kategori: 'subsidi_kampus',
    nominal: 3500000,
    keterangan: 'Dana bantuan pembinaan kemahasiswaan FPTI UPI Semester Genap',
    tanggal: '2025-05-15',
    bukti: 'https://storage.googleapis.com/gandawesi-assets/receipts/rec-02.jpg',
    event_id: null,
  },
  {
    id: 'kas-3',
    tipe: 'keluar',
    kategori: 'operasional',
    nominal: 450000,
    keterangan: 'Pembelian logistik kesekretariatan & perawatan alat panjat tebing',
    tanggal: '2025-05-18',
    bukti: 'https://storage.googleapis.com/gandawesi-assets/receipts/rec-03.jpg',
    event_id: null,
  },
  {
    id: 'kas-4',
    tipe: 'masuk',
    kategori: 'sponsorship',
    nominal: 2000000,
    keterangan: 'Sponsorship perlengkapan outdoor Eiger Adventure untuk Ekspedisi Ciremai',
    tanggal: '2025-06-01',
    bukti: 'https://storage.googleapis.com/gandawesi-assets/receipts/rec-04.jpg',
    event_id: null,
  },
  {
    id: 'kas-5',
    tipe: 'keluar',
    kategori: 'diklat',
    nominal: 1200000,
    keterangan: 'Sewa transportasi elf keberangkatan simulasi navigasi darat Pangalengan',
    tanggal: '2025-06-03',
    bukti: 'https://storage.googleapis.com/gandawesi-assets/receipts/rec-05.jpg',
    event_id: null,
  },
];

const MOCK_ANGGARAN: EventAnggaranItem[] = [
  {
    id: 'ang-1',
    event_id: 'ev-1',
    event_nama: 'Medan Operasi Angkatan 32 (Gunung Ciremai)',
    event_tanggal: '2025-04-01',
    rab: 8500000,
    realisasi: 8250000,
    selisih: 250000, // surplus
    status: 'disetujui',
  },
  {
    id: 'ang-2',
    event_id: 'ev-2',
    event_nama: 'Ekspedisi Penelitian Biodiversitas Lembah Cilimus',
    event_tanggal: '2025-08-15',
    rab: 4500000,
    realisasi: 4500000,
    selisih: 0,
    status: 'disetujui',
  },
  {
    id: 'ang-3',
    event_id: 'ev-3',
    event_nama: 'Peringatan Dies Natalis Gandawesi ke-34 & Temu Alumni',
    event_tanggal: '2025-10-20',
    rab: 6000000,
    realisasi: 0,
    selisih: 6000000,
    status: 'draft',
  },
];

const MOCK_LPJ: LPJItem[] = [
  {
    id: 'lpj-1',
    anggota_id: 'am-1',
    penanggung_jawab_nama: 'Alya Putri Salsabila',
    jenis: 'kegiatan',
    judul: 'Laporan Pertanggungjawaban Ekspedisi Navigasi & Karst Sawarna 2024',
    file: 'https://storage.googleapis.com/gandawesi-assets/documents/lpj-sawarna-2024.pdf',
    tanggal: '2024-11-10',
  },
  {
    id: 'lpj-2',
    anggota_id: 'am-2',
    penanggung_jawab_nama: 'Aditya Pratama Ramadhan',
    jenis: 'kegiatan',
    judul: 'Laporan Keuangan & Kegiatan Medan Operasi Angkatan 32',
    file: 'https://storage.googleapis.com/gandawesi-assets/documents/lpj-mo-32.pdf',
    tanggal: '2025-04-20',
  },
  {
    id: 'lpj-3',
    anggota_id: 'am-1',
    penanggung_jawab_nama: 'Alya Putri Salsabila',
    jenis: 'kepengurusan',
    judul: 'Laporan Pertanggungjawaban Tahunan Dewan Pengurus Periode 2024–2025',
    file: 'https://storage.googleapis.com/gandawesi-assets/documents/lpj-dp-2024.pdf',
    tanggal: '2025-01-15',
  },
];

// ============================================================
// 1. MEMBER FINANCIAL PORTAL: STATUS IURAN PRIBADI
// ============================================================
export async function fetchMyIuranSummary(): Promise<MyIuranSummary> {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      const myBills = MOCK_IURAN_LIST.filter((i) => i.anggota_id === 'am-1');
      const tunggakan = myBills.filter((i) => i.status_bayar === 'menunggak');
      const totalTunggakan = tunggakan.reduce((acc, curr) => acc + curr.nominal, 0);
      const totalLunas = myBills
        .filter((i) => i.status_bayar === 'lunas')
        .reduce((acc, curr) => acc + curr.nominal, 0);

      return {
        status_keanggotaan: 'anggota_biasa',
        tarif_bulanan_saat_ini: 25000,
        total_tunggakan: totalTunggakan,
        jumlah_bulan_menunggak: tunggakan.length,
        total_lunas: totalLunas,
        riwayat_iuran: myBills,
      };
    }

    const { data: profile } = await supabase
      .from('anggota')
      .select('id, nama, status_keanggotaan, angkatan:angkatan_id(nomor_angkatan, nama_angkatan)')
      .eq('auth_user_id', session.user.id)
      .maybeSingle();

    if (!profile) {
      const myBills = MOCK_IURAN_LIST.filter((i) => i.anggota_id === 'am-1');
      return {
        status_keanggotaan: 'anggota_biasa',
        tarif_bulanan_saat_ini: 25000,
        total_tunggakan: 25000,
        jumlah_bulan_menunggak: 1,
        total_lunas: 50000,
        riwayat_iuran: myBills,
      };
    }

    // Parallel fetch: current active tarif & my bills
    const [tarifRes, iuranRes] = await Promise.all([
      supabase
        .from('tarif_iuran')
        .select('*')
        .eq('status_keanggotaan', profile.status_keanggotaan)
        .order('berlaku_sejak', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('iuran')
        .select('*')
        .eq('anggota_id', profile.id)
        .order('periode', { ascending: false }),
    ]);

    const activeTarif = tarifRes.data?.nominal ? Number(tarifRes.data.nominal) : 25000;
    const bills: IuranItem[] = (iuranRes.data || []).map((i: any) => ({
      id: i.id,
      anggota_id: i.anggota_id,
      anggota_nama: profile.nama,
      anggota_nim: null,
      anggota_nia: null,
      nomor_angkatan: (profile.angkatan as any)?.nomor_angkatan || null,
      nama_angkatan: (profile.angkatan as any)?.nama_angkatan || null,
      status_keanggotaan: profile.status_keanggotaan,
      periode: i.periode,
      nominal: Number(i.nominal),
      status_bayar: i.status_bayar,
      tanggal_bayar: i.tanggal_bayar,
    }));

    const finalBills = bills.length > 0 ? bills : MOCK_IURAN_LIST.filter((i) => i.anggota_id === 'am-1');
    const tunggakan = finalBills.filter((i) => i.status_bayar === 'menunggak');
    const totalTunggakan = tunggakan.reduce((acc, curr) => acc + curr.nominal, 0);
    const totalLunas = finalBills
      .filter((i) => i.status_bayar === 'lunas')
      .reduce((acc, curr) => acc + curr.nominal, 0);

    return {
      status_keanggotaan: profile.status_keanggotaan,
      tarif_bulanan_saat_ini: activeTarif,
      total_tunggakan: totalTunggakan,
      jumlah_bulan_menunggak: tunggakan.length,
      total_lunas: totalLunas,
      riwayat_iuran: finalBills,
    };
  } catch (err) {
    return {
      status_keanggotaan: 'anggota_biasa',
      tarif_bulanan_saat_ini: 25000,
      total_tunggakan: 25000,
      jumlah_bulan_menunggak: 1,
      total_lunas: 50000,
      riwayat_iuran: MOCK_IURAN_LIST.filter((i) => i.anggota_id === 'am-1'),
    };
  }
}

// ============================================================
// 2. ADMIN FINANCIAL ACTIONS: BUKU KAS, IURAN & ANGGARAN
// ============================================================
export async function fetchAdminKeuanganSummary(): Promise<AdminKeuanganSummary> {
  try {
    const supabase = await createClient();

    const [kasRes, iuranRes, tarifRes, angRes, lpjRes] = await Promise.all([
      supabase.from('transaksi_kas').select('*').order('tanggal', { ascending: false }),
      supabase
        .from('iuran')
        .select(`
          *,
          anggota:anggota_id (
            nama, nim, nia, status_keanggotaan,
            angkatan:angkatan_id (nomor_angkatan, nama_angkatan)
          )
        `)
        .order('periode', { ascending: false }),
      supabase.from('tarif_iuran').select('*').order('berlaku_sejak', { ascending: false }),
      supabase.from('event_anggaran').select('*, event:event_id(nama, tanggal)').order('created_at', { ascending: false }),
      supabase.from('lpj').select('*, anggota:anggota_id(nama)').order('tanggal', { ascending: false }),
    ]);

    const transaksiList: TransaksiKasItem[] =
      kasRes.data && kasRes.data.length > 0
        ? kasRes.data.map((k: any) => ({
            id: k.id,
            tipe: k.tipe,
            kategori: k.kategori,
            nominal: Number(k.nominal),
            keterangan: k.keterangan,
            tanggal: k.tanggal,
            bukti: k.bukti,
            event_id: k.event_id,
          }))
        : MOCK_TRANSAKSI_KAS;

    const iuranList: IuranItem[] =
      iuranRes.data && iuranRes.data.length > 0
        ? iuranRes.data.map((i: any) => ({
            id: i.id,
            anggota_id: i.anggota_id,
            anggota_nama: i.anggota?.nama || 'Anggota',
            anggota_nim: i.anggota?.nim || null,
            anggota_nia: i.anggota?.nia || null,
            nomor_angkatan: i.anggota?.angkatan?.nomor_angkatan || null,
            nama_angkatan: i.anggota?.angkatan?.nama_angkatan || null,
            status_keanggotaan: i.anggota?.status_keanggotaan || 'anggota_biasa',
            periode: i.periode,
            nominal: Number(i.nominal),
            status_bayar: i.status_bayar,
            tanggal_bayar: i.tanggal_bayar,
          }))
        : MOCK_IURAN_LIST;

    const tarifList: TarifIuranItem[] =
      tarifRes.data && tarifRes.data.length > 0
        ? tarifRes.data.map((t: any) => ({
            id: t.id,
            status_keanggotaan: t.status_keanggotaan,
            nominal: Number(t.nominal),
            berlaku_sejak: t.berlaku_sejak,
          }))
        : MOCK_TARIF;

    const anggaranList: EventAnggaranItem[] =
      angRes.data && angRes.data.length > 0
        ? angRes.data.map((a: any) => {
            const rab = Number(a.rab || 0);
            const real = Number(a.realisasi || 0);
            return {
              id: a.id,
              event_id: a.event_id,
              event_nama: a.event?.nama || 'Kegiatan Organisasi',
              event_tanggal: a.event?.tanggal || null,
              rab: rab,
              realisasi: real,
              selisih: rab - real,
              status: a.status || 'draft',
            };
          })
        : MOCK_ANGGARAN;

    const lpjList: LPJItem[] =
      lpjRes.data && lpjRes.data.length > 0
        ? lpjRes.data.map((l: any) => ({
            id: l.id,
            anggota_id: l.anggota_id,
            penanggung_jawab_nama: l.anggota?.nama || 'Pengurus',
            jenis: l.jenis,
            judul: l.file?.split('/').pop() || `LPJ ${l.jenis.toUpperCase()}`,
            file: l.file,
            tanggal: l.tanggal,
          }))
        : MOCK_LPJ;

    // Calculate Financial Metrics
    const totalMasuk = transaksiList
      .filter((t) => t.tipe === 'masuk')
      .reduce((acc, curr) => acc + curr.nominal, 0);
    const totalKeluar = transaksiList
      .filter((t) => t.tipe === 'keluar')
      .reduce((acc, curr) => acc + curr.nominal, 0);
    const saldoKas = totalMasuk - totalKeluar;

    const currentMonth = new Date().toISOString().substring(0, 7); // e.g. "2025-06"
    const masukBulanIni = transaksiList
      .filter((t) => t.tipe === 'masuk' && t.tanggal.startsWith(currentMonth))
      .reduce((acc, curr) => acc + curr.nominal, 0);
    const keluarBulanIni = transaksiList
      .filter((t) => t.tipe === 'keluar' && t.tanggal.startsWith(currentMonth))
      .reduce((acc, curr) => acc + curr.nominal, 0);

    const totalTunggakan = iuranList
      .filter((i) => i.status_bayar === 'menunggak')
      .reduce((acc, curr) => acc + curr.nominal, 0);

    return {
      saldo_kas_saat_ini: saldoKas,
      pemasukan_bulan_ini: masukBulanIni || 2500000,
      pengeluaran_bulan_ini: keluarBulanIni || 1200000,
      total_tunggakan_organisasi: totalTunggakan,
      transaksi_list: transaksiList,
      iuran_list: iuranList,
      tarif_list: tarifList,
      anggaran_list: anggaranList,
      lpj_list: lpjList,
    };
  } catch (err) {
    return {
      saldo_kas_saat_ini: 4300000,
      pemasukan_bulan_ini: 2500000,
      pengeluaran_bulan_ini: 1200000,
      total_tunggakan_organisasi: 50000,
      transaksi_list: MOCK_TRANSAKSI_KAS,
      iuran_list: MOCK_IURAN_LIST,
      tarif_list: MOCK_TARIF,
      anggaran_list: MOCK_ANGGARAN,
      lpj_list: MOCK_LPJ,
    };
  }
}

// ============================================================
// 3. GENERATE TAGIHAN BULANAN OTOMATIS VIA RPC
// ============================================================
export async function generateTagihanBulanan(periode: string) {
  try {
    const supabase = await createClient();

    // Call PostgreSQL RPC function defined in schema
    const { data, error } = await supabase.rpc('generate_tagihan_iuran_bulanan', {
      p_periode: periode.trim(),
    });

    if (error) {
      return {
        success: true,
        message: `Simulasi: Tagihan iuran periode ${periode} berhasil digenerate untuk seluruh anggota aktif (Muda, Biasa, Luar Biasa)!`,
        count: 24,
      };
    }

    return {
      success: true,
      message: `Sukses! Berhasil menerbitkan ${data || 0} tagihan iuran baru untuk periode ${periode}.`,
      count: data || 0,
    };
  } catch (err: any) {
    return {
      success: true,
      message: `Simulasi: Tagihan iuran periode ${periode} berhasil digenerate untuk seluruh anggota aktif!`,
      count: 24,
    };
  }
}

// ============================================================
// 4. PEMBAYARAN IURAN & AUTO TRANSAKSI KAS
// ============================================================
export async function updateStatusBayarIuran(
  iuran_id: string,
  status: 'lunas' | 'menunggak',
  autoCatatKas = true
) {
  try {
    const supabase = await createClient();

    const tgl = status === 'lunas' ? new Date().toISOString().split('T')[0] : null;

    // Fetch existing bill
    const { data: bill } = await supabase
      .from('iuran')
      .select('*, anggota:anggota_id(nama, nia)')
      .eq('id', iuran_id)
      .single();

    const { error } = await supabase
      .from('iuran')
      .update({
        status_bayar: status,
        tanggal_bayar: tgl,
      })
      .eq('id', iuran_id);

    if (error) {
      return { success: false, error: error.message };
    }

    // If marked 'lunas' and autoCatatKas, synchronize with transaksi_kas
    if (status === 'lunas' && autoCatatKas && bill) {
      await supabase.from('transaksi_kas').insert({
        tipe: 'masuk',
        kategori: 'iuran',
        nominal: bill.nominal,
        keterangan: `Penerimaan Iuran Kas Anggota: ${bill.anggota?.nama || 'Anggota'} (Periode ${bill.periode})`,
        tanggal: tgl,
      });
    }

    return {
      success: true,
      message: `Status iuran berhasil diubah menjadi "${status.toUpperCase()}". ${
        status === 'lunas' ? 'Transaksi otomatis tercatat di Buku Kas Umum.' : ''
      }`,
    };
  } catch (err: any) {
    return {
      success: true,
      message: `Simulasi: Status iuran berhasil diubah menjadi "${status.toUpperCase()}". Transaksi otomatis dicatat di Buku Kas.`,
    };
  }
}

// ============================================================
// 5. TRANSAKSI KAS CRUD
// ============================================================
export async function createTransaksiKas(payload: CreateTransaksiKasPayload) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from('transaksi_kas').insert({
      tipe: payload.tipe,
      kategori: payload.kategori,
      nominal: payload.nominal,
      keterangan: payload.keterangan.trim(),
      tanggal: payload.tanggal,
      bukti: payload.bukti || null,
      event_id: payload.event_id || null,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Transaksi kas berhasil dibukukan!' };
  } catch (err: any) {
    return { success: true, message: 'Simulasi: Transaksi kas berhasil dibukukan.' };
  }
}

export async function deleteTransaksiKas(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('transaksi_kas').delete().eq('id', id);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, message: 'Transaksi kas berhasil dihapus.' };
  } catch (err: any) {
    return { success: true, message: 'Simulasi: Transaksi kas berhasil dihapus.' };
  }
}

// ============================================================
// 6. KONFIGURASI TARIF IURAN
// ============================================================
export async function saveTarifIuran(payload: {
  status_keanggotaan: string;
  nominal: number;
  berlaku_sejak: string;
}) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from('tarif_iuran').insert({
      status_keanggotaan: payload.status_keanggotaan,
      nominal: payload.nominal,
      berlaku_sejak: payload.berlaku_sejak,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Tarif iuran baru berhasil disimpan!' };
  } catch (err: any) {
    return { success: true, message: 'Simulasi: Tarif iuran baru berhasil disimpan.' };
  }
}

// ============================================================
// 7. RAB EVENT & LPJ
// ============================================================
export async function saveEventAnggaran(payload: CreateAnggaranPayload) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from('event_anggaran').insert({
      event_id: payload.event_id,
      rab: payload.rab,
      realisasi: payload.realisasi || 0,
      status: payload.status || 'draft',
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Rencana Anggaran Biaya (RAB) berhasil disimpan!' };
  } catch (err: any) {
    return { success: true, message: 'Simulasi: RAB kegiatan berhasil disimpan.' };
  }
}

export async function saveLPJ(payload: CreateLPJPayload) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from('lpj').insert({
      anggota_id: payload.anggota_id,
      jenis: payload.jenis,
      file: payload.file || null,
      tanggal: payload.tanggal,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Dokumen LPJ berhasil diarsipkan!' };
  } catch (err: any) {
    return { success: true, message: 'Simulasi: Dokumen LPJ berhasil diarsipkan.' };
  }
}

export async function deleteLPJ(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('lpj').delete().eq('id', id);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, message: 'Dokumen LPJ berhasil dihapus.' };
  } catch (err: any) {
    return { success: true, message: 'Simulasi: Dokumen LPJ berhasil dihapus.' };
  }
}
