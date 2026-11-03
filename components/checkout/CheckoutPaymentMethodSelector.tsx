'use client';

import React from 'react';
import { QrCode, ShieldCheck } from 'lucide-react';
import { BANK_ACCOUNTS } from '@/lib/types';

interface CheckoutPaymentMethodSelectorProps {
  paymentMethod: 'QRIS' | 'Bank Transfer';
  setPaymentMethod: (method: 'QRIS' | 'Bank Transfer') => void;
  selectedBank: keyof typeof BANK_ACCOUNTS;
  setSelectedBank: (bank: keyof typeof BANK_ACCOUNTS) => void;
}

export const CheckoutPaymentMethodSelector: React.FC<CheckoutPaymentMethodSelectorProps> = ({
  paymentMethod,
  setPaymentMethod,
  selectedBank,
  setSelectedBank,
}) => {
  return (
    <div className="pt-2 border-t border-zinc-200">
      <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider block mb-2">
        Metode Pembayaran Digital:
      </label>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setPaymentMethod('QRIS')}
          className={`p-3 border text-left flex items-start gap-2.5 transition-all rounded-none cursor-pointer ${
            paymentMethod === 'QRIS'
              ? 'border-zinc-950 bg-zinc-50 ring-2 ring-zinc-950'
              : 'border-zinc-200 hover:border-zinc-300'
          }`}
        >
          <QrCode size={20} className="text-[#E60012] shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black uppercase text-zinc-900">QRIS Dinamis</p>
            <p className="text-[10px] text-zinc-500 font-medium">Instan semua e-wallet & m-banking</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setPaymentMethod('Bank Transfer')}
          className={`p-3 border text-left flex items-start gap-2.5 transition-all rounded-none cursor-pointer ${
            paymentMethod === 'Bank Transfer'
              ? 'border-zinc-950 bg-zinc-50 ring-2 ring-zinc-950'
              : 'border-zinc-200 hover:border-zinc-300'
          }`}
        >
          <ShieldCheck size={20} className="text-zinc-700 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black uppercase text-zinc-900">Transfer Bank</p>
            <p className="text-[10px] text-zinc-500 font-medium">BCA, Mandiri, BNI, BRI</p>
          </div>
        </button>
      </div>

      {/* Sub-selector for Bank Destination */}
      {paymentMethod === 'Bank Transfer' && (
        <div className="mt-3 p-3 bg-zinc-50 border border-zinc-200 space-y-2 animate-in fade-in duration-150">
          <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider block">
            Pilih Bank Rekening Tujuan:
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['BCA', 'Mandiri', 'BRI', 'BNI'] as const).map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setSelectedBank(b)}
                className={`py-2 px-1 text-center border text-xs font-bold transition-all cursor-pointer ${
                  selectedBank === b
                    ? 'border-zinc-950 bg-zinc-950 text-white ring-1 ring-zinc-950'
                    : 'border-zinc-200 bg-white hover:border-zinc-400 text-zinc-800'
                }`}
              >
                <span className="block">{b}</span>
                <span className="block text-[8px] font-mono font-normal opacity-75">0% Fee</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-zinc-500 pt-1">
            ℹ️ Sistem akan menambahkan <strong>3 digit kode unik acak</strong> pada nominal transfer untuk identifikasi otomatis (PRD V5.2 FR-13).
          </p>
        </div>
      )}
    </div>
  );
};
