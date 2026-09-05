import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import type { ActionResponse } from '@/lib/types/action-response';

export interface AuthenticatedMemberResult {
  supabase: SupabaseClient;
  userId: string | null;
  memberId: string | null;
  member: any | null;
  error?: string;
}

/**
 * Retrieves the currently logged-in user and their corresponding anggota profile record.
 * Eliminates repetitive session + anggota query boilerplate across server actions.
 */
export async function getAuthenticatedMember(
  supabaseClient?: SupabaseClient
): Promise<AuthenticatedMemberResult> {
  const supabase = supabaseClient || (await createClient());
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return { supabase, userId: null, memberId: null, member: null, error: 'Sesi pengguna tidak ditemukan' };
    }

    const userId = session.user.id;
    const { data: member, error: memberError } = await supabase
      .from('anggota')
      .select('*, angkatan:angkatan_id(*)')
      .eq('auth_user_id', userId)
      .maybeSingle();

    if (memberError) {
      return { supabase, userId, memberId: null, member: null, error: memberError.message };
    }

    return {
      supabase,
      userId,
      memberId: member?.id ?? null,
      member: member ?? null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal memverifikasi akun pengguna';
    return { supabase, userId: null, memberId: null, member: null, error: message };
  }
}

/**
 * Convenience helper to get the member ID (approver / author / user ID) for the logged in user.
 */
export async function getCurrentMemberId(supabaseClient?: SupabaseClient): Promise<string | null> {
  const result = await getAuthenticatedMember(supabaseClient);
  return result.memberId;
}

/**
 * Standardized success response builder for Server Actions.
 * Supports both actionSuccess("Message") and actionSuccess(data, "Message").
 */
export function actionSuccess(): ActionResponse<void>;
export function actionSuccess(message: string): ActionResponse<void>;
export function actionSuccess<T>(data: T, message?: string): ActionResponse<T>;
export function actionSuccess<T = void>(dataOrMessage?: T | string, message?: string): ActionResponse<any> {
  if (typeof dataOrMessage === 'string' && message === undefined) {
    return {
      success: true,
      message: dataOrMessage,
    };
  }
  return {
    success: true,
    ...(dataOrMessage !== undefined ? { data: dataOrMessage as T } : {}),
    ...(message ? { message } : {}),
  };
}

/**
 * Standardized error response builder for Server Actions.
 */
export function actionError(
  error: unknown,
  defaultMessage = 'Terjadi kesalahan sistem. Silakan coba lagi.'
): ActionResponse<never> {
  const errorMessage =
    typeof error === 'string'
      ? error
      : error instanceof Error
      ? error.message
      : (error as { message?: string })?.message || defaultMessage;

  return {
    success: false,
    error: errorMessage,
  };
}
