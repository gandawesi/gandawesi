'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Compass, AlertCircle, Sparkles, ShieldCheck, UserCheck } from 'lucide-react';

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    errorParam ? 'Terjadi kendala saat autentikasi. Silakan coba kembali.' : null
  );

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      await signInWithGoogle();
    } catch (err: unknown) {
      console.error('Login error:', err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Gagal mengarahkan ke layanan Google. Pastikan URL Supabase sudah dikonfigurasi.'
      );
      setLoading(false);
    }
  };

  return (
    <Card glass className="p-8 shadow-2xl relative overflow-hidden">
      {/* Decorative top ambient bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-forest-600 via-emerald-500 to-amber-500" />

      <CardContent className="space-y-6 pt-2">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-forest-800 text-white mx-auto flex items-center justify-center shadow-lg shadow-forest-900/20">
            <Compass className="w-8 h-8 text-forest-200" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-mono">
            PORTAL GANDAWESI
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
            Masuk untuk mengakses biodata, riwayat kaderisasi, inventaris alat, dan status iuran.
          </p>
        </div>

        {/* Error notice if any */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="space-y-3 pt-2">
          <Button
            variant="outline"
            size="lg"
            className="w-full bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-100 border-stone-300 dark:border-stone-700 shadow-sm py-3"
            leftIcon={<GoogleIcon />}
            isLoading={loading}
            onClick={handleGoogleLogin}
          >
            Lanjutkan dengan Akun Google
          </Button>

          <p className="text-[11px] text-center text-stone-400 dark:text-stone-500 leading-relaxed">
            Gunakan akun Google yang aktif. Anggota lama dapat melakukan klaim biodata setelah berhasil masuk.
          </p>
        </div>

        {/* Security / System Features Note */}
        <div className="pt-4 border-t border-stone-100 dark:border-stone-800/60 space-y-2.5">
          <div className="flex items-center gap-2 text-[11px] text-stone-600 dark:text-stone-400">
            <ShieldCheck className="w-4 h-4 text-forest-600 shrink-0" />
            <span>Keamanan Row Level Security (RLS) terisolasi per anggota</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-stone-600 dark:text-stone-400">
            <UserCheck className="w-4 h-4 text-forest-600 shrink-0" />
            <span>Terintegrasi dengan alur kaderisasi resmi FPTI UPI</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
