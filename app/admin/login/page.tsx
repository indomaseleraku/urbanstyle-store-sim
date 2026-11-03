// app/admin/login/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Lock, ArrowRight, Eye, EyeOff, AlertCircle, ArrowLeft, Terminal
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/admin';

  const { isAuthenticated, isStaff, staffLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Jika sudah login sebagai staf, otomatis ke /admin
  useEffect(() => {
    if (isAuthenticated && isStaff) {
      router.replace(redirectTarget);
    }
  }, [isAuthenticated, isStaff, redirectTarget, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Email staf dan kata sandi wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    const res = await staffLogin(email.trim(), password.trim());
    setIsSubmitting(false);

    if (res.success) {
      window.location.href = redirectTarget;
    } else {
      setErrorMsg(res.message || 'Kredensial staf salah atau akun tidak memiliki wewenang operasional.');
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans flex flex-col justify-between selection:bg-[#E60012] selection:text-white">
      
      {/* Top Bar Terminal Header */}
      <header className="border-b border-zinc-800 bg-[#0d0d10] px-4 sm:px-8 py-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono font-black text-white">
            <span className="w-2.5 h-2.5 bg-[#E60012] inline-block animate-pulse" />
            <span className="tracking-widest uppercase">URBANSTYLE</span>
            <span className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 border border-zinc-700">
              Commerce OS
            </span>
          </div>
          <span className="hidden sm:inline text-zinc-600">|</span>
          <span className="hidden sm:inline text-zinc-400 font-mono text-[11px]">
            PORTAL OTORISASI STAF OPERASIONAL
          </span>
        </div>

        <Link
          href="/"
          className="text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors font-mono text-[11px]"
        >
          <ArrowLeft size={13} />
          <span>Ke Etalase Toko</span>
        </Link>
      </header>

      {/* Main Console Box */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md bg-[#121215] border border-zinc-800 shadow-2xl relative overflow-hidden">
          
          {/* Accent Top Border */}
          <div className="h-1 bg-gradient-to-r from-[#E60012] via-red-600 to-zinc-800" />

          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Header Title & Branding */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono tracking-widest text-[#E60012] uppercase font-bold flex items-center gap-1">
                  <Terminal size={12} />
                  <span>INTERNAL OPERATIONS CONSOLE</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  運営コンソール
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                Masuk Konsol Staf
              </h1>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Autentikasi terisolasi untuk Owner Toko, Staf Gudang (Logistik), dan Staf Kasir (Finance).
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="bg-red-950/60 border border-red-800 text-red-200 text-xs p-3 flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle size={15} className="text-[#E60012] shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMsg}</span>
              </div>
            )}

            {/* Credentials Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-400 tracking-wider mb-1.5">
                  ID Email Staf
                </label>
                <input
                  type="email"
                  required
                  autoComplete="username"
                  placeholder="email.staf@urbanstyle.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 min-h-[42px] bg-[#18181c] border border-zinc-700 text-white text-xs font-mono focus:outline-none focus:border-[#E60012] transition-colors placeholder:text-zinc-600 rounded-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-400 tracking-wider mb-1.5">
                  Kata Sandi Staf
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 min-h-[42px] bg-[#18181c] border border-zinc-700 text-white text-xs font-mono focus:outline-none focus:border-[#E60012] transition-colors placeholder:text-zinc-600 rounded-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                    title={showPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 min-h-[46px] bg-[#E60012] hover:bg-red-700 text-white text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer rounded-none"
              >
                <span>{isSubmitting ? 'Memvalidasi...' : 'Masuk Workspace Operasional'}</span>
                <ArrowRight size={14} />
              </button>
            </form>

            {/* Security Notice Footer */}
            <div className="pt-2 flex items-center justify-center gap-2 text-[10px] text-zinc-500 font-mono">
              <Lock size={11} className="text-zinc-600" />
              <span>Multi-Role Access Control terenkripsi sesi aman</span>
            </div>

          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="border-t border-zinc-900 bg-[#070709] px-4 py-3 text-center text-[10px] font-mono text-zinc-600">
        UrbanStyle Commerce OS • Hak Cipta © 2026 UrbanStyle Indonesia. All rights reserved.
      </footer>

    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-white font-mono text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 border-2 border-[#E60012] border-t-transparent rounded-full animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
