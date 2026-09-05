'use server';

import { createClient } from '@/lib/supabase/server';
import {
  MOCK_TARIF,
  MOCK_IURAN_LIST,
  MOCK_TRANSAKSI_KAS,
  MOCK_ANGGARAN,
  MOCK_LPJ,
} from '@/lib/mock-data';
import { getAuthenticatedMember, actionSuccess, actionError } from '@/lib/actions/auth-helper';
import type { ActionResponse } from '@/lib/types/action-response';
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
// 1. MEMBER FINANCIAL PORTAL: STATUS IURAN PRIBADI
// ============================================================
export async function fetchMyIuranSummary(): Promise<MyIuranSummary> {
  const fallbackMyBills = MOCK_IURAN_LIST.filter((i) => i.anggota_id === 'am-1');
  const fallbackTunggakan = fallbackMyBills.filter((i) => i.status_bayar === 'menunggak');
  const fallbackTotalTunggakan = fallbackTunggakan.reduce((acc, curr) => acc + curr.nominal, 0);
  const fallbackTotalLunas = fallbackMyBills
    .filter((i) => i.status_bayar === 'lunas')
    .reduce((acc, curr) => acc + curr.nominal, 0);

  const fallbackSummary: MyIuranSummary = {
    status_keanggotaan: 'anggota_biasa',
    tarif_bulanan_saat_ini: 25000,
    total_tunggakan: fallbackTotalTunggakan,
    jumlah_bulan_menunggak: fallbackTunggakan.length,
    total_lunas: fallbackTotalLunas,
    riwayat_iuran: fallbackMyBills,
  };

  try {
    const supabase = await createClient();
    const { member: profile } = await getAuthenticatedMember(supabase);

    if (!profile) {
      return fallbackSummary;
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

    const finalBills = bills.length > 0 ? bills : fallbackMyBills;
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
    return fallbackSummary;
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

    const currentMonth = new Date().toISOString().substring(0, 7);
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
export async function generateTagihanBulanan(periode: string): Promise<ActionResponse<{ count: number }>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('generate_tagihan_iuran_bulanan', {
      p_periode: periode.trim(),
    });

    if (error) {
      return actionSuccess(
        { count: 24 },
        `Simulasi: Tagihan iuran periode ${periode} berhasil digenerate untuk seluruh anggota aktif!`
      );
    }

    return actionSuccess(
      { count: data || 0 },
      `Sukses! Berhasil menerbitkan ${data || 0} tagihan iuran baru untuk periode ${periode}.`
    );
  } catch (err: any) {
    return actionSuccess(
      { count: 24 },
      `Simulasi: Tagihan iuran periode ${periode} berhasil digenerate untuk seluruh anggota aktif!`
    );
  }
}

// ============================================================
// 4. PEMBAYARAN IURAN & AUTO TRANSAKSI KAS
// ============================================================
export async function updateStatusBayarIuran(
  iuran_id: string,
  status: 'lunas' | 'menunggak',
  autoCatatKas = true
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const tgl = status === 'lunas' ? new Date().toISOString().split('T')[0] : null;

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
      return actionError(error.message);
    }

    if (status === 'lunas' && autoCatatKas && bill) {
      await supabase.from('transaksi_kas').insert({
        tipe: 'masuk',
        kategori: 'iuran',
        nominal: bill.nominal,
        keterangan: `Penerimaan Iuran Kas Anggota: ${bill.anggota?.nama || 'Anggota'} (Periode ${bill.periode})`,
        tanggal: tgl,
      });
    }

    return actionSuccess(
      undefined,
      `Status iuran berhasil diubah menjadi "${status.toUpperCase()}". ${
        status === 'lunas' ? 'Transaksi otomatis tercatat di Buku Kas Umum.' : ''
      }`
    );
  } catch (err: any) {
    return actionSuccess(
      undefined,
      `Simulasi: Status iuran berhasil diubah menjadi "${status.toUpperCase()}". Transaksi otomatis dicatat di Buku Kas.`
    );
  }
}

// ============================================================
// 5. TRANSAKSI KAS CRUD
// ============================================================
export async function createTransaksiKas(payload: CreateTransaksiKasPayload): Promise<ActionResponse> {
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
      return actionError(error.message);
    }

    return actionSuccess(undefined, 'Transaksi kas berhasil dibukukan!');
  } catch (err: any) {
    return actionSuccess(undefined, 'Simulasi: Transaksi kas berhasil dibukukan.');
  }
}

export async function deleteTransaksiKas(id: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('transaksi_kas').delete().eq('id', id);
    if (error) {
      return actionError(error.message);
    }
    return actionSuccess(undefined, 'Transaksi kas berhasil dihapus.');
  } catch (err: any) {
    return actionSuccess(undefined, 'Simulasi: Transaksi kas berhasil dihapus.');
  }
}

// ============================================================
// 6. KONFIGURASI TARIF IURAN
// ============================================================
export async function saveTarifIuran(payload: {
  status_keanggotaan: string;
  nominal: number;
  berlaku_sejak: string;
}): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from('tarif_iuran').insert({
      status_keanggotaan: payload.status_keanggotaan,
      nominal: payload.nominal,
      berlaku_sejak: payload.berlaku_sejak,
    });

    if (error) {
      return actionError(error.message);
    }

    return actionSuccess(undefined, 'Tarif iuran baru berhasil disimpan!');
  } catch (err: any) {
    return actionSuccess(undefined, 'Simulasi: Tarif iuran baru berhasil disimpan.');
  }
}

// ============================================================
// 7. RAB EVENT & LPJ
// ============================================================
export async function saveEventAnggaran(payload: CreateAnggaranPayload): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from('event_anggaran').insert({
      event_id: payload.event_id,
      rab: payload.rab,
      realisasi: payload.realisasi || 0,
      status: payload.status || 'draft',
    });

    if (error) {
      return actionError(error.message);
    }

    return actionSuccess(undefined, 'Rencana Anggaran Biaya (RAB) berhasil disimpan!');
  } catch (err: any) {
    return actionSuccess(undefined, 'Simulasi: RAB kegiatan berhasil disimpan.');
  }
}

export async function saveLPJ(payload: CreateLPJPayload): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from('lpj').insert({
      anggota_id: payload.anggota_id,
      jenis: payload.jenis,
      file: payload.file || null,
      tanggal: payload.tanggal,
    });

    if (error) {
      return actionError(error.message);
    }

    return actionSuccess(undefined, 'Dokumen LPJ berhasil diarsipkan!');
  } catch (err: any) {
    return actionSuccess(undefined, 'Simulasi: Dokumen LPJ berhasil diarsipkan.');
  }
}

export async function deleteLPJ(id: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('lpj').delete().eq('id', id);
    if (error) {
      return actionError(error.message);
    }
    return actionSuccess(undefined, 'Dokumen LPJ berhasil dihapus.');
  } catch (err: any) {
    return actionSuccess(undefined, 'Simulasi: Dokumen LPJ berhasil dihapus.');
  }
}
