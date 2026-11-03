// components/payment/PaymentSuccessBanner.tsx
import React from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

interface PaymentSuccessBannerProps {
  orderNumber: string;
  justSettled: boolean;
  showDetails?: boolean;
}

export const PaymentSuccessBanner: React.FC<PaymentSuccessBannerProps> = ({
  orderNumber,
  justSettled,
  showDetails = true,
}) => {
  return (
    <div
      className={`p-4 bg-emerald-50 border-2 border-emerald-500 text-left space-y-2 animate-in fade-in duration-300 ${
        justSettled ? 'ring-4 ring-emerald-300' : ''
      }`}
    >
      <div className="flex items-center gap-2 text-emerald-800">
        <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
        <div>
          <p className="text-xs font-black uppercase tracking-wider">
            Pembayaran Berhasil Diverifikasi Otomatis!
          </p>
          <p className="text-[11px] text-emerald-700 font-medium">
            Sistem backend telah memvalidasi pelunasan tagihan #{orderNumber}.
          </p>
        </div>
      </div>
      {showDetails && (
        <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[10px] text-emerald-800 font-mono">
          <span className="flex items-center gap-1">
            <ShieldCheck size={12} /> Terverifikasi: Sistem UrbanStyle TPS
          </span>
          <span className="bg-emerald-600 text-white px-2 py-0.5 font-bold uppercase">
            STATUS: LUNAS
          </span>
        </div>
      )}
    </div>
  );
};
