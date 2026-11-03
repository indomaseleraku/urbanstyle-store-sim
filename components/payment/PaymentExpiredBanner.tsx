// components/payment/PaymentExpiredBanner.tsx
import React from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

interface PaymentExpiredBannerProps {
  orderNumber: string;
}

export const PaymentExpiredBanner: React.FC<PaymentExpiredBannerProps> = ({ orderNumber }) => {
  return (
    <div className="p-4 bg-rose-50 border-2 border-rose-500 text-left space-y-2 animate-in fade-in duration-300">
      <div className="flex items-center gap-2 text-rose-800">
        <AlertTriangle size={18} className="text-rose-600 shrink-0" />
        <div>
          <p className="text-xs font-black uppercase tracking-wider">
            Batas Waktu Pembayaran Telah Berakhir
          </p>
          <p className="text-[11px] text-rose-700 font-medium">
            Pesanan #{orderNumber} dibatalkan otomatis oleh sistem (melewati batas 20 menit). Kuota stok pakaian telah dikembalikan ke etalase toko.
          </p>
        </div>
      </div>
      <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between text-[10px] text-rose-800 font-mono">
        <span>Status: Dibatalkan / Expired</span>
        <Link href="/" className="font-bold underline text-rose-900 hover:text-black flex items-center gap-1">
          <ArrowLeft size={11} /> Kembali Belanja
        </Link>
      </div>
    </div>
  );
};
