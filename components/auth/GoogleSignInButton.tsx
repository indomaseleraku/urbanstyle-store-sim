'use client';

// components/auth/GoogleSignInButton.tsx
// Tombol Resmi "Lanjutkan dengan Google" (Google OAuth Supabase)

import React, { useState } from 'react';
import { supabase } from '@/lib/services/supabaseClient';
import { AlertCircle } from 'lucide-react';

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  label?: string;
}

export default function GoogleSignInButton({
  label = 'Lanjutkan dengan Google',
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleButtonClick = async () => {
    setError('');
    setIsLoading(true);

    try {
      if (!supabase) {
        throw new Error('Layanan autentikasi database belum siap. Silakan gunakan email & kata sandi.');
      }

      const currentParams = new URLSearchParams(window.location.search);
      const redirectTarget = currentParams.get('redirect') || '/account/profile';
      sessionStorage.setItem('urbanstyle_oauth_redirect', redirectTarget);

      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });

      if (oauthErr) {
        throw oauthErr;
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setError(err?.message || 'Gagal menghubungkan ke layanan Google. Silakan coba kembali.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-2">
      {error && (
        <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogleButtonClick}
        disabled={isLoading}
        className="w-full py-2.5 px-4 bg-white hover:bg-zinc-50 border border-zinc-300 hover:border-zinc-900 text-zinc-800 text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-2xs disabled:opacity-50"
      >
        {/* Official 4-Color Google G SVG */}
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span>{isLoading ? 'Menghubungkan ke Google...' : label}</span>
      </button>
    </div>
  );
}
