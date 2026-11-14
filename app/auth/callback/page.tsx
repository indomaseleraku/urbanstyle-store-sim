'use client';

// app/auth/callback/page.tsx
// Penangan Callback OAuth Google dari Supabase Auth (PKCE & Implicit Flow)

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/services/supabaseClient';
import { useAuth } from '@/lib/auth-context';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const handledRef = useRef(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function finalizeUserSession(email: string, fullName: string, accessToken: string) {
      if (handledRef.current) return;
      handledRef.current = true;
      const res = await loginWithGoogle(email, fullName, accessToken);
      if (!res.success) {
        setErrorMsg(res.message || 'Gagal menyelesaikan sesi login Google.');
        return;
      }
      const rawTarget =
        (typeof window !== 'undefined' && sessionStorage.getItem('urbanstyle_oauth_redirect')) ||
        '/account/profile';
      const safeTarget = rawTarget.startsWith('/') && !rawTarget.startsWith('//') ? rawTarget : '/account/profile';
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('urbanstyle_oauth_redirect');
      }
      router.replace(safeTarget);
    }

    async function handleOAuthSession() {
      if (!supabase) {
        setErrorMsg('Konfigurasi layanan autentikasi belum tersedia.');
        return;
      }

      try {
        const params = new URLSearchParams(window.location.search);
        const oauthError = params.get('error_description') || params.get('error');
        if (oauthError) {
          setErrorMsg('Autentikasi Google dibatalkan atau ditolak.');
          return;
        }

        const code = params.get('code');
        if (code) {
          const { data: exchangeData, error: exErr } = await supabase.auth.exchangeCodeForSession(code);
          if (exErr) {
            setErrorMsg(exErr.message || 'Gagal memverifikasi kode otorisasi Google.');
            return;
          }
          if (exchangeData?.session?.user && exchangeData.session.access_token) {
            const u = exchangeData.session.user;
            if (!u.email) {
              setErrorMsg('Akun Google Anda tidak membagikan alamat email yang valid.');
              return;
            }
            const fullName =
              u.user_metadata?.full_name ||
              u.user_metadata?.name ||
              u.email.split('@')[0].toUpperCase();
            await finalizeUserSession(u.email, fullName, exchangeData.session.access_token);
            return;
          }
        }

        const { data } = await supabase.auth.getSession();
        if (data?.session?.user && data.session.access_token) {
          const u = data.session.user;
          if (!u.email) {
            setErrorMsg('Akun Google Anda tidak membagikan alamat email yang valid.');
            return;
          }
          const fullName =
            u.user_metadata?.full_name ||
            u.user_metadata?.name ||
            u.email.split('@')[0].toUpperCase();
          await finalizeUserSession(u.email, fullName, data.session.access_token);
          return;
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setErrorMsg('Terjadi kesalahan saat memproses respon Google.');
      }
    }

    handleOAuthSession();

    const sub = supabase?.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user && session.access_token) {
        const u = session.user;
        if (u.email) {
          const fullName =
            u.user_metadata?.full_name ||
            u.user_metadata?.name ||
            u.email.split('@')[0].toUpperCase();
          await finalizeUserSession(u.email, fullName, session.access_token);
        }
      }
    });

    const fallbackTimer = setTimeout(() => {
      if (!handledRef.current) {
        setErrorMsg('Waktu verifikasi login Google habis. Silakan coba masuk kembali.');
      }
    }, 8000);

    return () => {
      sub?.data.subscription.unsubscribe();
      clearTimeout(fallbackTimer);
    };
  }, [loginWithGoogle, router]);

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-10 h-10 bg-[#E60012] text-white font-black text-xs flex items-center justify-center">
          US
        </div>
        <h1 className="text-base font-black uppercase tracking-tight text-zinc-950">
          Autentikasi Google Gagal
        </h1>
        <p className="text-xs text-zinc-600 max-w-sm">{errorMsg}</p>
        <div className="flex gap-3">
          <Link
            href="/account/login"
            className="px-4 py-2.5 bg-zinc-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-[#E60012] transition-colors"
          >
            Kembali ke Login
          </Link>
          <Link
            href="/"
            className="px-4 py-2.5 border border-zinc-300 text-xs font-bold uppercase tracking-wider text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center space-y-3">
      <div className="w-8 h-8 bg-[#E60012] text-white font-black text-xs flex items-center justify-center animate-pulse">
        US
      </div>
      <p className="text-xs font-mono uppercase tracking-widest text-zinc-600">
        Menyelesaikan Autentikasi...
      </p>
    </div>
  );
}
