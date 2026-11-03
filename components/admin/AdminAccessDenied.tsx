// components/admin/AdminAccessDenied.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';

export default function AdminAccessDenied() {
  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 font-sans text-white">
      <div className="max-w-md w-full bg-[#121215] border border-red-900/60 p-8 text-center space-y-4 shadow-2xl">
        <div className="w-12 h-12 bg-red-950/80 border border-red-800 text-[#E60012] flex items-center justify-center mx-auto rounded-full">
          <Lock size={22} />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-mono tracking-widest text-[#E60012] uppercase font-bold block">
            KURO-COMMERCE RBAC SECURITY
          </span>
          <h1 className="text-base font-black uppercase tracking-tight text-white">
            Akses Terbatas: Staf SIM Sah Saja
          </h1>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Halaman ini terproteksi oleh <span className="font-semibold text-white">Multi-Role Access Control</span> (PRD V5.2 FR-04). Hanya staf resmi dengan peran <span className="text-zinc-200 font-mono">Owner</span>, <span className="text-zinc-200 font-mono">Gudang</span>, atau <span className="text-zinc-200 font-mono">Kasir</span> yang diizinkan mengakses konsol operasional.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <Link
            href="/admin/login"
            className="w-full sm:w-auto px-5 py-2.5 bg-[#E60012] hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Masuk Konsol Staf →
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            ← Beranda Toko
          </Link>
        </div>
      </div>
    </div>
  );
}
