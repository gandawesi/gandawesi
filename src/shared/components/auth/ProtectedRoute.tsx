'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/shared/hooks/useAuth';
import { Spinner } from '@/shared/components/ui/Spinner';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { authUser, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading && !authUser) {
      router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`);
    }
  }, [loading, authUser, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" className="text-forest-600" />
        <p className="text-xs text-stone-500 font-medium tracking-wide animate-pulse">
          Memeriksa sesi login...
        </p>
      </div>
    );
  }

  if (!authUser) {
    return null;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-2xl glass-card text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
          Akses Terbatas
        </h3>
        <p className="text-xs text-stone-600 dark:text-stone-400">
          Halaman ini khusus untuk Pengurus / Administrator yang memiliki wewenang aktif.
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => router.push('/dashboard')}
        >
          Kembali ke Dashboard
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
