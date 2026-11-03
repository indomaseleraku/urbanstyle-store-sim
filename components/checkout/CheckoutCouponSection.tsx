'use client';

import React from 'react';
import { Tag } from 'lucide-react';

interface CheckoutCouponSectionProps {
  couponCode: string;
  setCouponCode: (val: string) => void;
  appliedCoupon: string | null;
  isValidatingCoupon: boolean;
  couponMsg: { text: string; isError: boolean } | null;
  onApplyCoupon: (code?: string) => void;
}

export const CheckoutCouponSection: React.FC<CheckoutCouponSectionProps> = ({
  couponCode,
  setCouponCode,
  appliedCoupon,
  isValidatingCoupon,
  couponMsg,
  onApplyCoupon,
}) => {
  return (
    <div className="pt-3 border-t border-zinc-200 space-y-2">
      <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider block flex items-center gap-1.5">
        <Tag size={13} className="text-[#E60012]" />
        <span>Kupon Diskon & Promo:</span>
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Contoh: URBANWELCOME50"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          className="flex-1 px-3 py-2 text-base md:text-xs border border-zinc-300 uppercase font-mono tracking-wider focus:outline-none focus:border-black rounded-none"
        />
        <button
          type="button"
          onClick={() => onApplyCoupon()}
          disabled={isValidatingCoupon || !couponCode.trim()}
          className="px-4 py-2 bg-black hover:bg-[#E60012] text-white text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 rounded-none cursor-pointer"
        >
          {isValidatingCoupon ? 'Cek...' : 'Terapkan'}
        </button>
      </div>

      {/* 1-Click Voucher Chips (P0-05) */}
      <div className="space-y-1 pt-1">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
          Kupon Rekomendasi (Klik 1x):
        </span>
        <div className="flex flex-wrap gap-1.5">
          {[
            { code: 'URBANWELCOME50', label: 'Potongan Rp 50.000' },
            { code: 'LIFEWEAR10', label: 'Diskon 10%' },
            { code: 'BEBASONGKIR', label: 'Gratis Ongkir Rp 15rb' },
          ].map((v) => (
            <button
              key={v.code}
              type="button"
              onClick={() => onApplyCoupon(v.code)}
              className={`text-left px-2.5 py-1.5 border text-[10px] font-mono transition-all rounded-none flex items-center gap-1.5 cursor-pointer ${
                appliedCoupon === v.code
                  ? 'bg-zinc-950 text-white border-zinc-950 font-bold shadow-xs'
                  : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200 hover:border-zinc-400'
              }`}
            >
              <span className="font-bold">{v.code}</span>
              <span className={`text-[9px] font-sans ${appliedCoupon === v.code ? 'text-zinc-300' : 'text-zinc-500'}`}>
                ({v.label})
              </span>
            </button>
          ))}
        </div>
      </div>

      {couponMsg && (
        <p className={`text-[11px] font-medium ${couponMsg.isError ? 'text-red-600' : 'text-green-700'}`}>
          {couponMsg.text}
        </p>
      )}
    </div>
  );
};
