'use server';

import { createClient } from '@/lib/supabase/server';
import type { FunctionalRole } from '@/lib/constants';
import type { ActionResponse } from '@/lib/types/action-response';
import { MOCK_MEMBERS_WITH_ROLES, type MemberWithRolesItem } from '@/lib/mock-data';

export type { MemberWithRolesItem };

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
): Promise<ActionResponse> {
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
): Promise<ActionResponse> {
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
