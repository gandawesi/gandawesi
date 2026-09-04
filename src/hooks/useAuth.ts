'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getCurrentUserContext } from '@/lib/auth/roles';
import type { AppUserContext } from '@/lib/auth/types';

export function useAuth() {
  const [supabase] = useState(() => createClient());
  const [loading, setLoading] = useState(true);
  const [userContext, setUserContext] = useState<AppUserContext>({
    authUser: null,
    session: null,
    profile: null,
    roles: [],
    isAdmin: false,
    isAnggotaAktif: false,
    isPanitiaOrAdmin: false,
    isGuest: true,
    hasLinkedProfile: false,
  });

  const refreshUser = useCallback(async () => {
    try {
      setLoading(true);
      const context = await getCurrentUserContext(supabase);
      setUserContext(context);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    refreshUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, _session) => {
      await refreshUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, refreshUser]);

  const signInWithGoogle = async () => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${siteUrl}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserContext({
      authUser: null,
      session: null,
      profile: null,
      roles: [],
      isAdmin: false,
      isAnggotaAktif: false,
      isPanitiaOrAdmin: false,
      isGuest: true,
      hasLinkedProfile: false,
    });
  };

  return {
    ...userContext,
    loading,
    refreshUser,
    signInWithGoogle,
    signOut,
  };
}
