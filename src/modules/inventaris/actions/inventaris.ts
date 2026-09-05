'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type {
  AlatItem,
  PeminjamanAlatItem,
  CreateAlatPayload,
  UpdateAlatPayload,
  AjukanPeminjamanPayload,
  PeminjamanStatus,
} from '@/lib/types/inventaris';
import type { ActionResponse } from '@/lib/types/action-response';
import { getAuthenticatedMember, actionSuccess, actionError } from '@/lib/actions/auth-helper';
import { MOCK_ALAT, MOCK_PEMINJAMAN } from '@/lib/mock-data';

// Mutable runtime state for mock fallback in offline / maintenance mode
let mockAlatStore: AlatItem[] = [...MOCK_ALAT];
let mockPeminjamanStore: PeminjamanAlatItem[] = [...MOCK_PEMINJAMAN];

function revalidateInventarisPaths() {
  revalidatePath('/dashboard/inventaris');
  revalidatePath('/dashboard/admin/inventaris');
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
        return mockAlatStore.filter((a) => a.kategori === kategori);
      }
      return mockAlatStore;
    }

    return data;
  } catch {
    if (kategori && kategori !== 'all') {
      return mockAlatStore.filter((a) => a.kategori === kategori);
    }
    return mockAlatStore;
  }
}

// ============================================================
// 2. CREATE ALAT (ADMIN / LOGISTIK)
// ============================================================
export async function createAlat(payload: CreateAlatPayload): Promise<ActionResponse<AlatItem>> {
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
      mockAlatStore.push(newMock);
      revalidateInventarisPaths();
      return actionSuccess(newMock);
    }

    revalidateInventarisPaths();
    return actionSuccess(data);
  } catch (err: unknown) {
    return actionError(err, 'Gagal menambahkan alat');
  }
}

// ============================================================
// 3. UPDATE ALAT (ADMIN / LOGISTIK)
// ============================================================
export async function updateAlat(payload: UpdateAlatPayload): Promise<ActionResponse<AlatItem>> {
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
      const idx = mockAlatStore.findIndex((a) => a.id === payload.id);
      if (idx !== -1) {
        mockAlatStore[idx] = { ...mockAlatStore[idx], ...updateData };
        revalidateInventarisPaths();
        return actionSuccess(mockAlatStore[idx]);
      }
      return actionError(error.message);
    }

    revalidateInventarisPaths();
    return actionSuccess(data);
  } catch (err: unknown) {
    return actionError(err, 'Gagal memperbarui alat');
  }
}

// ============================================================
// 4. DELETE ALAT (ADMIN / LOGISTIK)
// ============================================================
export async function deleteAlat(id: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('alat').delete().eq('id', id);

    if (error) {
      console.warn('DB deleteAlat fallback:', error.message);
      mockAlatStore = mockAlatStore.filter((a) => a.id !== id);
      revalidateInventarisPaths();
      return actionSuccess();
    }

    revalidateInventarisPaths();
    return actionSuccess();
  } catch (err: unknown) {
    return actionError(err, 'Gagal menghapus alat');
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
        return mockPeminjamanStore.filter((p) => p.status === status);
      }
      return mockPeminjamanStore;
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
      return mockPeminjamanStore.filter((p) => p.status === status);
    }
    return mockPeminjamanStore;
  }
}

// ============================================================
// 6. GET MY PEMINJAMAN (MEMBER)
// ============================================================
export async function getMyPeminjaman(): Promise<PeminjamanAlatItem[]> {
  try {
    const supabase = await createClient();
    const { member } = await getAuthenticatedMember(supabase);

    if (!member) {
      return mockPeminjamanStore.filter((p) => p.anggota_id === 'am-1' || p.anggota_id === 'am-curr');
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
      .eq('anggota_id', member.id)
      .order('tanggal_pinjam', { ascending: false });

    if (error || !data || data.length === 0) {
      return mockPeminjamanStore.filter((p) => p.anggota_id === member.id || p.anggota_id === 'am-1');
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
      anggota_nama: member.nama,
      anggota_nim: member.nim,
      anggota_nia: member.nia,
      alat_nama: item.alat?.nama_alat || 'Alat',
      alat_kategori: item.alat?.kategori || 'Umum',
      approved_by_nama: item.approver?.nama || null,
    }));
  } catch {
    return mockPeminjamanStore.filter((p) => p.anggota_id === 'am-1' || p.anggota_id === 'am-curr');
  }
}

// ============================================================
// 7. AJUKAN PEMINJAMAN (MEMBER)
// ============================================================
export async function ajukanPeminjaman(
  payload: AjukanPeminjamanPayload
): Promise<ActionResponse<PeminjamanAlatItem>> {
  try {
    const supabase = await createClient();
    const { member } = await getAuthenticatedMember(supabase);

    // Validate requested quantity
    const jumlah = Number(payload.jumlah);
    if (isNaN(jumlah) || jumlah <= 0) {
      return actionError('Jumlah alat yang dipinjam harus lebih dari 0');
    }

    // Check availability in mock
    const targetAlat = mockAlatStore.find((a) => a.id === payload.alat_id);

    if (!member) {
      // Offline fallback
      if (targetAlat && targetAlat.stok < jumlah) {
        return actionError(`Stok tidak mencukupi (sisa: ${targetAlat.stok} unit, diminta: ${jumlah} unit)`);
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

      mockPeminjamanStore.unshift(newPinjam);
      revalidateInventarisPaths();
      return actionSuccess(newPinjam);
    }

    // Check DB stock
    const { data: dbAlat } = await supabase
      .from('alat')
      .select('stok, nama_alat, kategori')
      .eq('id', payload.alat_id)
      .single();

    if (dbAlat && dbAlat.stok < jumlah) {
      return actionError(`Stok alat tidak mencukupi (sisa: ${dbAlat.stok} unit, diminta: ${jumlah} unit)`);
    }

    const { data, error } = await supabase
      .from('peminjaman_alat')
      .insert({
        anggota_id: member.id,
        alat_id: payload.alat_id,
        jumlah: jumlah,
        tanggal_pinjam: payload.tanggal_pinjam,
        tanggal_kembali: payload.tanggal_kembali || null,
        status: 'diajukan',
      })
      .select()
      .single();

    if (error) {
      return actionError(error.message);
    }

    revalidateInventarisPaths();
    return actionSuccess({
      id: data.id,
      anggota_id: member.id,
      alat_id: payload.alat_id,
      jumlah: jumlah,
      tanggal_pinjam: payload.tanggal_pinjam,
      tanggal_kembali: payload.tanggal_kembali || null,
      status: 'diajukan',
      approved_by: null,
      anggota_nama: member.nama,
      anggota_nim: member.nim,
      anggota_nia: member.nia,
      alat_nama: dbAlat?.nama_alat || 'Alat Lapangan',
      alat_kategori: dbAlat?.kategori || 'Umum',
    });
  } catch (err: unknown) {
    return actionError(err, 'Gagal mengajukan peminjaman');
  }
}

// ============================================================
// 8. UPDATE STATUS PEMINJAMAN (ADMIN / APPROVAL)
// ============================================================
export async function updateStatusPeminjaman(
  peminjamanId: string,
  newStatus: PeminjamanStatus
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { member } = await getAuthenticatedMember(supabase);

    const { error } = await supabase
      .from('peminjaman_alat')
      .update({
        status: newStatus,
        approved_by: member?.id || null,
      })
      .eq('id', peminjamanId)
      .select()
      .single();

    if (error) {
      console.warn('DB updateStatusPeminjaman fallback:', error.message);
      const pinjam = mockPeminjamanStore.find((p) => p.id === peminjamanId);
      if (pinjam) {
        const oldStatus = pinjam.status;
        pinjam.status = newStatus;
        if (member) {
          pinjam.approved_by = member.id;
          pinjam.approved_by_nama = member.nama;
        }

        const alat = mockAlatStore.find((a) => a.id === pinjam.alat_id);
        if (alat) {
          if (
            (newStatus === 'disetujui' || newStatus === 'dipinjam') &&
            (oldStatus === 'diajukan' || oldStatus === 'ditolak')
          ) {
            alat.stok = Math.max(0, alat.stok - pinjam.jumlah);
          } else if (
            (newStatus === 'dikembalikan' || newStatus === 'ditolak') &&
            (oldStatus === 'disetujui' || oldStatus === 'dipinjam')
          ) {
            alat.stok = alat.stok + pinjam.jumlah;
          }
        }
      }
    }

    revalidateInventarisPaths();
    return actionSuccess();
  } catch (err: unknown) {
    return actionError(err, 'Gagal memperbarui status peminjaman');
  }
}
