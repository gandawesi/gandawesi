'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  AlatItem,
  PeminjamanAlatItem,
  CreateAlatPayload,
  UpdateAlatPayload,
  AjukanPeminjamanPayload,
  PeminjamanStatus,
} from '@/lib/types/inventaris';

// Initial fallback mock data for testing & offline mode
let MOCK_ALAT: AlatItem[] = [
  {
    id: 'alt-1',
    nama_alat: 'Tali Kernmantle Dinamis 10.5mm 50m (Beal)',
    kategori: 'Tali & Webbing',
    kondisi: 'baik',
    stok: 4,
  },
  {
    id: 'alt-2',
    nama_alat: 'Tali Kernmantle Statis 11mm 100m (Tendon)',
    kategori: 'Tali & Webbing',
    kondisi: 'baik',
    stok: 2,
  },
  {
    id: 'alt-3',
    nama_alat: 'Sit Harness Petzl Corax (Size M-L)',
    kategori: 'Harness & Carabiner',
    kondisi: 'baik',
    stok: 8,
  },
  {
    id: 'alt-4',
    nama_alat: 'Carabiner Screwgate D-Shape (Black Diamond)',
    kategori: 'Harness & Carabiner',
    kondisi: 'baik',
    stok: 15,
  },
  {
    id: 'alt-5',
    nama_alat: 'Descender Petzl Simple (Caving/SRT)',
    kategori: 'Harness & Carabiner',
    kondisi: 'baik',
    stok: 6,
  },
  {
    id: 'alt-6',
    nama_alat: 'Tenda Dome Kapasitas 4 Orang (Consina Magnum 4)',
    kategori: 'Tenda & Camp',
    kondisi: 'baik',
    stok: 5,
  },
  {
    id: 'alt-7',
    nama_alat: 'Tenda Dome Kapasitas 2 Orang (Eiger Shira 2)',
    kategori: 'Tenda & Camp',
    kondisi: 'rusak_ringan',
    stok: 3,
  },
  {
    id: 'alt-8',
    nama_alat: 'Kompas Bidik Prisma Suunto KB-14',
    kategori: 'Navigasi & Kompas',
    kondisi: 'baik',
    stok: 5,
  },
  {
    id: 'alt-9',
    nama_alat: 'GPS Garmin GPSMAP 64s Handheld',
    kategori: 'Navigasi & Kompas',
    kondisi: 'baik',
    stok: 2,
  },
  {
    id: 'alt-10',
    nama_alat: 'Kompor Lapangan Windproof + Selang Gas',
    kategori: 'Alat Masak & Logistik',
    kondisi: 'baik',
    stok: 7,
  },
  {
    id: 'alt-11',
    nama_alat: 'Nesting DS-308 Camping Cookware 3-4 Orang',
    kategori: 'Alat Masak & Logistik',
    kondisi: 'baik',
    stok: 6,
  },
  {
    id: 'alt-12',
    nama_alat: 'Helm Panjat Petzl Elios White',
    kategori: 'P3K & Safety',
    kondisi: 'rusak_ringan',
    stok: 4,
  },
];

let MOCK_PEMINJAMAN: PeminjamanAlatItem[] = [
  {
    id: 'pinjam-1',
    anggota_id: 'am-1',
    alat_id: 'alt-6',
    jumlah: 2,
    tanggal_pinjam: '2025-06-15',
    tanggal_kembali: '2025-06-18',
    status: 'dipinjam',
    approved_by: 'am-admin',
    anggota_nama: 'Alya Putri Salsabila',
    anggota_nim: '2304521',
    anggota_nia: 'GW.32.235.GW',
    alat_nama: 'Tenda Dome Kapasitas 4 Orang (Consina Magnum 4)',
    alat_kategori: 'Tenda & Camp',
    approved_by_nama: 'Bambang Trihatmodjo',
  },
  {
    id: 'pinjam-2',
    anggota_id: 'am-2',
    alat_id: 'alt-1',
    jumlah: 1,
    tanggal_pinjam: '2025-06-20',
    tanggal_kembali: '2025-06-22',
    status: 'disetujui',
    approved_by: 'am-admin',
    anggota_nama: 'Aditya Pratama Ramadhan',
    anggota_nim: '2304522',
    anggota_nia: 'GW.32.236.GW',
    alat_nama: 'Tali Kernmantle Dinamis 10.5mm 50m (Beal)',
    alat_kategori: 'Tali & Webbing',
    approved_by_nama: 'Bambang Trihatmodjo',
  },
  {
    id: 'pinjam-3',
    anggota_id: 'am-3',
    alat_id: 'alt-8',
    jumlah: 2,
    tanggal_pinjam: '2025-06-25',
    tanggal_kembali: '2025-06-27',
    status: 'diajukan',
    approved_by: null,
    anggota_nama: 'Farhan Dwi Cahyo',
    anggota_nim: '2304523',
    anggota_nia: 'GW.32.237.GW',
    alat_nama: 'Kompas Bidik Prisma Suunto KB-14',
    alat_kategori: 'Navigasi & Kompas',
  },
  {
    id: 'pinjam-4',
    anggota_id: 'am-1',
    alat_id: 'alt-3',
    jumlah: 2,
    tanggal_pinjam: '2025-05-10',
    tanggal_kembali: '2025-05-13',
    status: 'dikembalikan',
    approved_by: 'am-admin',
    anggota_nama: 'Alya Putri Salsabila',
    anggota_nim: '2304521',
    anggota_nia: 'GW.32.235.GW',
    alat_nama: 'Sit Harness Petzl Corax (Size M-L)',
    alat_kategori: 'Harness & Carabiner',
    approved_by_nama: 'Bambang Trihatmodjo',
  },
];

async function getCurrentAnggota(supabase: any) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data: anggota } = await supabase
    .from('anggota')
    .select('id, nama, nim, nia, is_admin')
    .eq('auth_user_id', session.user.id)
    .single();

  return anggota || null;
}

// ============================================================
// 1. GET ALAT LIST (PUBLIC / MEMBER / ADMIN)
// ============================================================
export async function getAlatList(kategori?: string): Promise<AlatItem[]> {
  try {
    const supabase = await createClient();

    let query = supabase.from('alat').select('*');
    if (kategori && kategori !== 'all') {
      query = query.eq('kategori', kategori);
    }

    const { data, error } = await query.order('nama_alat', { ascending: true });

    if (error || !data || data.length === 0) {
      if (kategori && kategori !== 'all') {
        return MOCK_ALAT.filter((a) => a.kategori === kategori);
      }
      return MOCK_ALAT;
    }

    return data;
  } catch {
    if (kategori && kategori !== 'all') {
      return MOCK_ALAT.filter((a) => a.kategori === kategori);
    }
    return MOCK_ALAT;
  }
}

// ============================================================
// 2. CREATE ALAT (ADMIN / LOGISTIK)
// ============================================================
export async function createAlat(
  payload: CreateAlatPayload
): Promise<{ success: boolean; data?: AlatItem; error?: string }> {
  try {
    const supabase = await createClient();

    const insertData = {
      nama_alat: payload.nama_alat.trim(),
      kategori: payload.kategori.trim(),
      kondisi: payload.kondisi,
      stok: Number(payload.stok),
    };

    const { data, error } = await supabase.from('alat').insert(insertData).select().single();

    if (error) {
      console.warn('DB createAlat fallback:', error.message);
      const newMock: AlatItem = {
        id: `alt-${Date.now()}`,
        ...insertData,
      };
      MOCK_ALAT.push(newMock);
      revalidatePath('/dashboard/inventaris');
      revalidatePath('/dashboard/admin/inventaris');
      return { success: true, data: newMock };
    }

    revalidatePath('/dashboard/inventaris');
    revalidatePath('/dashboard/admin/inventaris');
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menambahkan alat' };
  }
}

// ============================================================
// 3. UPDATE ALAT (ADMIN / LOGISTIK)
// ============================================================
export async function updateAlat(
  payload: UpdateAlatPayload
): Promise<{ success: boolean; data?: AlatItem; error?: string }> {
  try {
    const supabase = await createClient();

    const updateData: any = {};
    if (payload.nama_alat !== undefined) updateData.nama_alat = payload.nama_alat.trim();
    if (payload.kategori !== undefined) updateData.kategori = payload.kategori.trim();
    if (payload.kondisi !== undefined) updateData.kondisi = payload.kondisi;
    if (payload.stok !== undefined) updateData.stok = Number(payload.stok);

    const { data, error } = await supabase
      .from('alat')
      .update(updateData)
      .eq('id', payload.id)
      .select()
      .single();

    if (error) {
      console.warn('DB updateAlat fallback:', error.message);
      const idx = MOCK_ALAT.findIndex((a) => a.id === payload.id);
      if (idx !== -1) {
        MOCK_ALAT[idx] = { ...MOCK_ALAT[idx], ...updateData };
        revalidatePath('/dashboard/inventaris');
        revalidatePath('/dashboard/admin/inventaris');
        return { success: true, data: MOCK_ALAT[idx] };
      }
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/inventaris');
    revalidatePath('/dashboard/admin/inventaris');
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal memperbarui alat' };
  }
}

// ============================================================
// 4. DELETE ALAT (ADMIN / LOGISTIK)
// ============================================================
export async function deleteAlat(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('alat').delete().eq('id', id);

    if (error) {
      console.warn('DB deleteAlat fallback:', error.message);
      MOCK_ALAT = MOCK_ALAT.filter((a) => a.id !== id);
      revalidatePath('/dashboard/inventaris');
      revalidatePath('/dashboard/admin/inventaris');
      return { success: true };
    }

    revalidatePath('/dashboard/inventaris');
    revalidatePath('/dashboard/admin/inventaris');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menghapus alat' };
  }
}

// ============================================================
// 5. GET PEMINJAMAN LIST (ADMIN)
// ============================================================
export async function getPeminjamanList(status?: string): Promise<PeminjamanAlatItem[]> {
  try {
    const supabase = await createClient();

    let query = supabase.from('peminjaman_alat').select(`
      id,
      anggota_id,
      alat_id,
      jumlah,
      tanggal_pinjam,
      tanggal_kembali,
      status,
      approved_by,
      anggota:anggota_id (
        id,
        nama,
        nim,
        nia
      ),
      alat:alat_id (
        id,
        nama_alat,
        kategori
      ),
      approver:approved_by (
        id,
        nama
      )
    `);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('tanggal_pinjam', { ascending: false });

    if (error || !data || data.length === 0) {
      if (status && status !== 'all') {
        return MOCK_PEMINJAMAN.filter((p) => p.status === status);
      }
      return MOCK_PEMINJAMAN;
    }

    return data.map((item: any) => ({
      id: item.id,
      anggota_id: item.anggota_id,
      alat_id: item.alat_id,
      jumlah: item.jumlah,
      tanggal_pinjam: item.tanggal_pinjam,
      tanggal_kembali: item.tanggal_kembali,
      status: item.status,
      approved_by: item.approved_by,
      anggota_nama: item.anggota?.nama || 'Anggota',
      anggota_nim: item.anggota?.nim || null,
      anggota_nia: item.anggota?.nia || null,
      alat_nama: item.alat?.nama_alat || 'Alat',
      alat_kategori: item.alat?.kategori || 'Umum',
      approved_by_nama: item.approver?.nama || null,
    }));
  } catch {
    if (status && status !== 'all') {
      return MOCK_PEMINJAMAN.filter((p) => p.status === status);
    }
    return MOCK_PEMINJAMAN;
  }
}

// ============================================================
// 6. GET MY PEMINJAMAN (MEMBER)
// ============================================================
export async function getMyPeminjaman(): Promise<PeminjamanAlatItem[]> {
  try {
    const supabase = await createClient();
    const current = await getCurrentAnggota(supabase);

    if (!current) {
      return MOCK_PEMINJAMAN.filter((p) => p.anggota_id === 'am-1' || p.anggota_id === 'am-curr');
    }

    const { data, error } = await supabase
      .from('peminjaman_alat')
      .select(`
        id,
        anggota_id,
        alat_id,
        jumlah,
        tanggal_pinjam,
        tanggal_kembali,
        status,
        approved_by,
        alat:alat_id (
          id,
          nama_alat,
          kategori
        ),
        approver:approved_by (
          id,
          nama
        )
      `)
      .eq('anggota_id', current.id)
      .order('tanggal_pinjam', { ascending: false });

    if (error || !data || data.length === 0) {
      return MOCK_PEMINJAMAN.filter((p) => p.anggota_id === current.id || p.anggota_id === 'am-1');
    }

    return data.map((item: any) => ({
      id: item.id,
      anggota_id: item.anggota_id,
      alat_id: item.alat_id,
      jumlah: item.jumlah,
      tanggal_pinjam: item.tanggal_pinjam,
      tanggal_kembali: item.tanggal_kembali,
      status: item.status,
      approved_by: item.approved_by,
      anggota_nama: current.nama,
      anggota_nim: current.nim,
      anggota_nia: current.nia,
      alat_nama: item.alat?.nama_alat || 'Alat',
      alat_kategori: item.alat?.kategori || 'Umum',
      approved_by_nama: item.approver?.nama || null,
    }));
  } catch {
    return MOCK_PEMINJAMAN.filter((p) => p.anggota_id === 'am-1' || p.anggota_id === 'am-curr');
  }
}

// ============================================================
// 7. AJUKAN PEMINJAMAN (MEMBER)
// ============================================================
export async function ajukanPeminjaman(
  payload: AjukanPeminjamanPayload
): Promise<{ success: boolean; data?: PeminjamanAlatItem; error?: string }> {
  try {
    const supabase = await createClient();
    const current = await getCurrentAnggota(supabase);

    // Validate requested quantity
    const jumlah = Number(payload.jumlah);
    if (isNaN(jumlah) || jumlah <= 0) {
      return { success: false, error: 'Jumlah alat yang dipinjam harus lebih dari 0' };
    }

    // Check availability
    let targetAlat = MOCK_ALAT.find((a) => a.id === payload.alat_id);

    if (!current) {
      // Offline fallback
      if (targetAlat && targetAlat.stok < jumlah) {
        return {
          success: false,
          error: `Stok tidak mencukupi (sisa: ${targetAlat.stok} unit, diminta: ${jumlah} unit)`,
        };
      }

      const newPinjam: PeminjamanAlatItem = {
        id: `pinjam-${Date.now()}`,
        anggota_id: 'am-curr',
        alat_id: payload.alat_id,
        jumlah: jumlah,
        tanggal_pinjam: payload.tanggal_pinjam,
        tanggal_kembali: payload.tanggal_kembali || null,
        status: 'diajukan',
        approved_by: null,
        anggota_nama: 'Saya (Anggota Aktif)',
        anggota_nim: '2304521',
        anggota_nia: 'GW.32.235.GW',
        alat_nama: targetAlat?.nama_alat || 'Alat Lapangan',
        alat_kategori: targetAlat?.kategori || 'Umum',
      };

      MOCK_PEMINJAMAN.unshift(newPinjam);
      revalidatePath('/dashboard/inventaris');
      revalidatePath('/dashboard/admin/inventaris');
      return { success: true, data: newPinjam };
    }

    // Check DB stock
    const { data: dbAlat } = await supabase
      .from('alat')
      .select('stok, nama_alat, kategori')
      .eq('id', payload.alat_id)
      .single();

    if (dbAlat && dbAlat.stok < jumlah) {
      return {
        success: false,
        error: `Stok alat tidak mencukupi (sisa: ${dbAlat.stok} unit, diminta: ${jumlah} unit)`,
      };
    }

    const { data, error } = await supabase
      .from('peminjaman_alat')
      .insert({
        anggota_id: current.id,
        alat_id: payload.alat_id,
        jumlah: jumlah,
        tanggal_pinjam: payload.tanggal_pinjam,
        tanggal_kembali: payload.tanggal_kembali || null,
        status: 'diajukan',
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/inventaris');
    revalidatePath('/dashboard/admin/inventaris');
    return {
      success: true,
      data: {
        id: data.id,
        anggota_id: current.id,
        alat_id: payload.alat_id,
        jumlah: jumlah,
        tanggal_pinjam: payload.tanggal_pinjam,
        tanggal_kembali: payload.tanggal_kembali || null,
        status: 'diajukan',
        approved_by: null,
        anggota_nama: current.nama,
        anggota_nim: current.nim,
        anggota_nia: current.nia,
        alat_nama: dbAlat?.nama_alat || 'Alat Lapangan',
        alat_kategori: dbAlat?.kategori || 'Umum',
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal mengajukan peminjaman' };
  }
}

// ============================================================
// 8. UPDATE STATUS PEMINJAMAN (ADMIN / APPROVAL)
// ============================================================
export async function updateStatusPeminjaman(
  peminjamanId: string,
  newStatus: PeminjamanStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const current = await getCurrentAnggota(supabase);

    const { data, error } = await supabase
      .from('peminjaman_alat')
      .update({
        status: newStatus,
        approved_by: current?.id || null,
      })
      .eq('id', peminjamanId)
      .select()
      .single();

    if (error) {
      console.warn('DB updateStatusPeminjaman fallback:', error.message);
      // Fallback mock logic with stock adjustments
      const pinjam = MOCK_PEMINJAMAN.find((p) => p.id === peminjamanId);
      if (pinjam) {
        const oldStatus = pinjam.status;
        pinjam.status = newStatus;
        if (current) {
          pinjam.approved_by = current.id;
          pinjam.approved_by_nama = current.nama;
        }

        const alat = MOCK_ALAT.find((a) => a.id === pinjam.alat_id);
        if (alat) {
          // If moving to disetujui / dipinjam from diajukan / ditolak -> decrease stock
          if (
            (newStatus === 'disetujui' || newStatus === 'dipinjam') &&
            (oldStatus === 'diajukan' || oldStatus === 'ditolak')
          ) {
            alat.stok = Math.max(0, alat.stok - pinjam.jumlah);
          }
          // If returning or rejecting after previously approved -> restore stock
          else if (
            (newStatus === 'dikembalikan' || newStatus === 'ditolak') &&
            (oldStatus === 'disetujui' || oldStatus === 'dipinjam')
          ) {
            alat.stok = alat.stok + pinjam.jumlah;
          }
        }
      }
    }

    revalidatePath('/dashboard/inventaris');
    revalidatePath('/dashboard/admin/inventaris');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal memperbarui status peminjaman' };
  }
}
