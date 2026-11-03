'use client';

// app/auth/callback/page.tsx
// Penangan Callback OAuth Google dari Supabase Auth (PKCE & Implicit Flow)

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/services/supabaseClient';
import { useAuth } from '@/lib/auth-context';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const handledRef = useRef(false);

  useEffect(() => {
    async function finalizeUserSession(email: string, fullName: string) {
      if (handledRef.current) return;
      handledRef.current = true;
      await loginWithGoogle(email, fullName);
      const target =
        (typeof window !== 'undefined' && sessionStorage.getItem('urbanstyle_oauth_redirect')) ||
        '/account/profile';
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('urbanstyle_oauth_redirect');
      }
      router.replace(target);
    }

    async function handleOAuthSession() {
      if (!supabase) {
        router.replace('/account/login');
        return;
      }

      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        if (code) {
          const { data: exchangeData } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeData?.session?.user) {
            const u = exchangeData.session.user;
            if (!u.email) {
              router.replace('/account/login?error=email_not_provided');
              return;
            }
            const email = u.email;
            const fullName =
              u.user_metadata?.full_name ||
              u.user_metadata?.name ||
              email.split('@')[0].toUpperCase();
            await finalizeUserSession(email, fullName);
            return;
          }
        }

        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          const u = data.session.user;
          if (!u.email) {
            router.replace('/account/login?error=email_not_provided');
            return;
          }
          const email = u.email;
          const fullName =
            u.user_metadata?.full_name ||
            u.user_metadata?.name ||
            email.split('@')[0].toUpperCase();
          await finalizeUserSession(email, fullName);
          return;
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
      }
    }

    handleOAuthSession();

    const sub = supabase?.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        const u = session.user;
        if (u.email) {
          const email = u.email;
          const fullName =
            u.user_metadata?.full_name ||
            u.user_metadata?.name ||
            email.split('@')[0].toUpperCase();
          await finalizeUserSession(email, fullName);
        }
      }
    });

    const fallbackTimer = setTimeout(() => {
      if (!handledRef.current) {
        router.replace('/account/login');
      }
    }, 6000);

    return () => {
      sub?.data.subscription.unsubscribe();
      clearTimeout(fallbackTimer);
    };
  }, [loginWithGoogle, router]);

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
