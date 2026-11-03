// components/qris/QRISPaymentNotice.tsx
'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

const WALLETS = ['BCA Mobile', 'Livin Mandiri', 'BRImo', 'GoPay', 'OVO', 'ShopeePay', 'Dana', 'LinkAja'];

export default function QRISPaymentNotice() {
  return (
    <>
      <div className="p-2 bg-blue-50 border border-blue-200 text-left flex items-start gap-1.5 text-[9px] text-blue-900">
        <AlertCircle size={13} className="shrink-0 text-blue-600 mt-0.5" />
        <p className="leading-tight">
          <strong>Perhatian:</strong> Jangan membayar menggunakan akun GoPay milik pemilik toko itu sendiri (Bank Indonesia otomatis memblokir transaksi ke QRIS milik sendiri). Gunakan akun/rekening lain.
        </p>
      </div>

      <div className="pt-1 text-[10px] text-zinc-500 font-medium">
        <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-400 block mb-1">
          Bisa dipindai dari seluruh aplikasi perbankan & e-wallet:
        </span>
        <div className="flex flex-wrap justify-center gap-1 text-[10px] font-mono text-zinc-700">
          {WALLETS.map((w) => (
            <span key={w} className="px-1.5 py-0.5 bg-zinc-100 border border-zinc-200">
              {w}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
