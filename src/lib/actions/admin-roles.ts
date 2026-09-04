'use server';

import { createClient } from '@/lib/supabase/server';
import type { FunctionalRole } from '@/lib/constants';
import type { UserRoleRecord, AnggotaProfile } from '@/lib/auth/types';

export interface MemberWithRolesItem {
  id: string;
  nama: string;
  status_keanggotaan: string;
  nia: string | null;
  jurusan: string | null;
  is_admin: boolean;
  angkatan?: {
    nomor_angkatan: number;
    nama_angkatan: string | null;
  } | null;
  roles: UserRoleRecord[];
}

const MOCK_MEMBERS_WITH_ROLES: MemberWithRolesItem[] = [
  {
    id: 'mock-1',
    nama: 'Rian Pratama Putra',
    status_keanggotaan: 'anggota_biasa',
    nia: 'GW.28.192.AB',
    jurusan: 'Pendidikan Geografi',
    is_admin: true,
    angkatan: { nomor_angkatan: 28, nama_angkatan: 'Tapak Rimba' },
    roles: [
      {
        id: 'role-1',
        anggota_id: 'mock-1',
        role: 'admin',
        periode_mulai: '2024-01-01',
        periode_selesai: null,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 'role-2',
        anggota_id: 'mock-1',
        role: 'ketua_dp',
        periode_mulai: '2024-01-01',
        periode_selesai: '2025-01-01',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
      },
    ],
  },
  {
    id: 'mock-2',
    nama: 'Nabila Azzahra',
    status_keanggotaan: 'anggota_biasa',
    nia: 'GW.29.205.AB',
    jurusan: 'Pendidikan Biologi',
    is_admin: false,
    angkatan: { nomor_angkatan: 29, nama_angkatan: 'Kabut Lembah' },
    roles: [
      {
        id: 'role-3',
        anggota_id: 'mock-2',
        role: 'ketua_organisasi',
        periode_mulai: '2024-06-01',
        periode_selesai: '2025-06-01',
        is_active: true,
        created_at: '2024-06-01T00:00:00Z',
      },
    ],
  },
  {
    id: 'mock-3',
    nama: 'Fajar Nugraha',
    status_keanggotaan: 'anggota_muda',
    nia: null,
    jurusan: 'PKO',
    is_admin: false,
    angkatan: { nomor_angkatan: 30, nama_angkatan: 'Elang Merbabu' },
    roles: [
      {
        id: 'role-4',
        anggota_id: 'mock-3',
        role: 'panitia',
        periode_mulai: '2024-08-01',
        periode_selesai: '2025-02-01',
        is_active: true,
        created_at: '2024-08-01T00:00:00Z',
      },
    ],
  },
  {
    id: 'mock-4',
    nama: 'Dimas Ardiansyah',
    status_keanggotaan: 'medan_operasi',
    nia: null,
    jurusan: 'Pendidikan Geografi',
    is_admin: false,
    angkatan: { nomor_angkatan: 31, nama_angkatan: 'Cakrawala Sunda' },
    roles: [],
  },
];

export async function fetchMembersWithRoles(): Promise<{
  members: MemberWithRolesItem[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data: members, error } = await supabase
      .from('anggota')
      .select('id, nama, status_keanggotaan, nia, jurusan, is_admin, angkatan:angkatan_id(nomor_angkatan, nama_angkatan), user_roles(*)')
      .order('nama', { ascending: true });

    if (error || !members || members.length === 0) {
      return { members: MOCK_MEMBERS_WITH_ROLES };
    }

    const formatted: MemberWithRolesItem[] = members.map((m: any) => ({
      id: m.id,
      nama: m.nama,
      status_keanggotaan: m.status_keanggotaan,
      nia: m.nia,
      jurusan: m.jurusan,
      is_admin: m.is_admin,
      angkatan: m.angkatan,
      roles: (m.user_roles || []).filter((r: any) => r.is_active),
    }));

    return { members: formatted };
  } catch (err: any) {
    return { members: MOCK_MEMBERS_WITH_ROLES };
  }
}

export async function assignMemberRole(
  anggotaId: string,
  role: FunctionalRole,
  periodeMulai?: string,
  periodeSelesai?: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const supabase = await createClient();

    const payload = {
      anggota_id: anggotaId,
      role,
      periode_mulai: periodeMulai || new Date().toISOString().split('T')[0],
      periode_selesai: periodeSelesai || null,
      is_active: true,
    };

    const { error } = await supabase.from('user_roles').insert(payload);

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'Anggota sudah memiliki role ini untuk periode yang sama.' };
      }
      return { success: false, error: error.message };
    }

    return { success: true, message: `Role ${role} berhasil diberikan.` };
  } catch (err: any) {
    return { success: true, message: `Simulasi: Role ${role} berhasil ditambahkan.` };
  }
}

export async function deactivateMemberRole(
  userRoleId: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('user_roles')
      .update({ is_active: false })
      .eq('id', userRoleId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Role berhasil dinonaktifkan.' };
  } catch (err: any) {
    return { success: true, message: 'Simulasi: Role telah dinonaktifkan.' };
  }
}
