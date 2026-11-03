// app/account/login/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import EmailOtpAuthForm from '@/components/auth/EmailOtpAuthForm';

function MemberLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/account/profile';

  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (isAuthenticated) router.replace(redirectTarget);
  }, [isAuthenticated, redirectTarget, router]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans flex flex-col justify-between">
      <header className="bg-white border-b border-zinc-200 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link
          href="/"
          className="text-zinc-600 hover:text-black flex items-center gap-1.5 text-xs font-semibold tracking-wide transition-colors shrink-0"
          title="Kembali ke Beranda"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Kembali ke Beranda</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 sm:w-7 sm:h-7 bg-black flex items-center justify-center text-white font-black text-[10px] sm:text-xs">
            US
          </div>
          <span className="font-black text-xs sm:text-sm uppercase tracking-tight text-zinc-900">
            UrbanStyle LifeWear
          </span>
        </div>
        <div className="w-4 sm:w-28 shrink-0" />
      </header>

      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 my-4 sm:my-8">
        <div className="w-full max-w-md bg-white border border-zinc-200 shadow-sm relative">
          <div className="p-5 sm:p-8 space-y-4 sm:space-y-5">
            <div>
              <p className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase font-bold">
                AKUN PELANGGAN
              </p>
              <h1 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-zinc-950 mt-1">
                {activeTab === 'login' ? 'Masuk ke Akun Anda' : 'Daftar Akun Baru'}
              </h1>
            </div>

            {/* Opsi A: Login dengan Google OAuth 2.0 */}
            <GoogleSignInButton onSuccess={() => router.push(redirectTarget)} />

            <div className="relative flex items-center justify-center">
              <div className="border-t border-zinc-200 w-full" />
              <span className="bg-white px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 shrink-0">
                ATAU DENGAN EMAIL
              </span>
              <div className="border-t border-zinc-200 w-full" />
            </div>

            {/* Opsi B: Login / Daftar Manual dengan Verifikasi OTP 6 Digit via Gmail */}
            <EmailOtpAuthForm
              onSuccess={() => router.push(redirectTarget)}
              onTabChange={(tab) => setActiveTab(tab)}
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200 bg-white px-4 py-3 text-center text-[10px] font-mono text-zinc-500">
        UrbanStyle LifeWear Tokyo • Hak Cipta © 2026. All rights reserved.
      </footer>
    </div>
  );
}

export default function MemberLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center text-xs font-mono text-zinc-500">
          Memuat...
        </div>
      }
    >
      <MemberLoginForm />
    </Suspense>
  );
}
