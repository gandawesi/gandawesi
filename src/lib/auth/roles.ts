import type { SupabaseClient } from '@supabase/supabase-js';
import type { AnggotaProfile, AppUserContext, UserRoleRecord } from './types';
import type { FunctionalRole } from '../constants';

/**
 * Fetches the full context of the currently authenticated user,
 * including their profile in `anggota` and active roles in `user_roles`.
 */
export async function getCurrentUserContext(supabase: SupabaseClient): Promise<AppUserContext> {
  const defaultContext: AppUserContext = {
    authUser: null,
    session: null,
    profile: null,
    roles: [],
    isAdmin: false,
    isAnggotaAktif: false,
    isPanitiaOrAdmin: false,
    isGuest: true,
  };

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      return defaultContext;
    }

    const authUser = session.user;

    // Fetch anggota record by auth_user_id
    const { data: profileData, error: profileError } = await supabase
      .from('anggota')
      .select('*, angkatan:angkatan_id(*)')
      .eq('auth_user_id', authUser.id)
      .maybeSingle();

    if (profileError || !profileData) {
      // User is logged into Supabase Auth but has not linked/claimed an anggota profile yet
      return {
        ...defaultContext,
        authUser,
        session,
        isGuest: false,
      };
    }

    const profile = profileData as AnggotaProfile;

    // Fetch active functional roles
    const { data: roleRecords } = await supabase
      .from('user_roles')
      .select('*')
      .eq('anggota_id', profile.id)
      .eq('is_active', true);

    const roles: FunctionalRole[] = ((roleRecords as UserRoleRecord[]) || []).map((r) => r.role);

    const isAdmin = profile.is_admin === true || roles.includes('admin');
    const activeStatuses = ['anggota_muda', 'anggota_biasa', 'anggota_luar_biasa', 'anggota_kehormatan'];
    const isAnggotaAktif = activeStatuses.includes(profile.status_keanggotaan);
    const isPanitiaOrAdmin = isAdmin || roles.includes('panitia') || roles.includes('ketua_medan_operasi') || roles.includes('danlat');

    return {
      authUser,
      session,
      profile,
      roles,
      isAdmin,
      isAnggotaAktif,
      isPanitiaOrAdmin,
      isGuest: false,
    };
  } catch (err) {
    console.error('Error in getCurrentUserContext:', err);
    return defaultContext;
  }
}
