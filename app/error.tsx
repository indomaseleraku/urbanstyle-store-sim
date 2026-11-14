'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[UrbanStyle] Route error:', error);
  }, [error]);

  return (
    <main className="min-h-[70vh] flex items-center justify-center bg-white px-4 py-16">
      <div className="w-full max-w-lg border border-zinc-200">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3 bg-zinc-50">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">UrbanStyle Store</span>
          <span className="font-mono text-[11px] font-bold text-[#E60012]">
            {error.digest ? `REF ${error.digest.slice(0, 10)}` : 'RUNTIME ERROR'}
          </span>
        </div>
        <div className="px-6 py-10 sm:px-10 text-center space-y-4">
          <AlertTriangle size={40} strokeWidth={1.5} className="mx-auto text-[#E60012]" aria-hidden="true" />
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-950">
            Terjadi Gangguan
          </h1>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Halaman gagal dimuat. Data keranjang kamu tetap aman. Silakan coba muat ulang.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-zinc-950 text-white text-xs font-black uppercase tracking-wider hover:bg-[#E60012] transition-colors cursor-pointer"
            >
              <RotateCcw size={14} aria-hidden="true" />
              <span>Coba Lagi</span>
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-5 py-3 border border-zinc-300 text-zinc-900 text-xs font-black uppercase tracking-wider hover:border-zinc-950 transition-colors"
            >
              Ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
