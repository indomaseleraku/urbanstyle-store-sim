'use client';

// app/account/coupons/page.tsx
// Dompet Kupon Diskon Member UrbanStyle Store

import React, { useState, useEffect } from 'react';
import { dataStore } from '@/lib/store';
import { Coupon } from '@/lib/types';
import { Tag, Copy, Check, Sparkles } from 'lucide-react';

export default function MemberCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    async function loadCoupons() {
      const list = await dataStore.getCoupons();
      setCoupons(list);
    }
    loadCoupons();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="bg-white border border-zinc-200 p-6 sm:p-8 space-y-6">
      <div>
        <h1 className="text-lg font-black uppercase tracking-tight text-zinc-950">
          Dompet Kupon & Promo Member
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Koleksi voucher potongan harga resmi. Salin kode kupon dan masukkan pada slide-over keranjang atau saat checkout.
        </p>
      </div>

      {coupons.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-zinc-300 text-xs text-zinc-500 space-y-2">
          <Tag className="w-8 h-8 mx-auto text-zinc-400" />
          <p className="font-semibold text-zinc-700">Belum ada kupon aktif saat ini.</p>
          <p className="text-[11px] text-zinc-400">Nantikan promo dan voucher eksklusif member berikutnya.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coupons.map((c) => {
            const isRemaining = c.usage_limit - c.used_count;
            return (
              <div
                key={c.id}
                className="border border-zinc-200 bg-white p-5 hover:border-zinc-950 transition-all flex flex-col justify-between gap-4 rounded-none shadow-xs relative overflow-hidden group"
              >
                {/* Red accent top indicator */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#E60012]" />

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-black px-2.5 py-1 bg-black text-white tracking-widest uppercase rounded-none">
                      {c.code}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-red-50 text-[#E60012] border border-red-200 px-2 py-0.5 rounded-none">
                      {c.type === 'fixed' 
                        ? `Potongan Rp ${new Intl.NumberFormat('id-ID').format(c.discount_amount)}`
                        : `Diskon ${c.discount_amount}%`
                      }
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-zinc-950 leading-snug">{c.description}</h3>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Min. Belanja: <span className="font-semibold text-zinc-700">Rp {new Intl.NumberFormat('id-ID').format(c.min_purchase)}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-zinc-400 font-mono text-[10px]">
                    Sisa Kuota: <strong className="text-zinc-700 font-semibold">{isRemaining}</strong> kupon
                  </span>

                  <button
                    type="button"
                    onClick={() => handleCopy(c.code)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-300 hover:border-black bg-zinc-50 hover:bg-black hover:text-white text-xs font-bold uppercase tracking-wider text-zinc-800 transition-colors shrink-0 cursor-pointer rounded-none min-h-[36px]"
                  >
                    {copiedCode === c.code ? (
                      <>
                        <Check size={13} className="text-emerald-500" />
                        <span className="text-emerald-600 font-bold">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Salin Kode</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
