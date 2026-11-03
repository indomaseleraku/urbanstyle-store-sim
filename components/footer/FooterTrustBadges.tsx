'use client';

import React from 'react';

export default function FooterTrustBadges() {
  return (
    <>
      {/* LAYER 4: Trust Badge Logos Pembayaran & Kurir Ekspedisi */}
      <div className="border-t border-zinc-800 bg-[#0A0A0A] py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          {/* Mitra Pembayaran */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 block">
              METODE PEMBAYARAN RESMI
            </span>
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-[10px] font-mono font-bold text-zinc-300">
                QRIS DINAMIS
              </span>
              <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-[10px] font-mono font-bold text-zinc-300">
                BCA
              </span>
              <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-[10px] font-mono font-bold text-zinc-300">
                MANDIRI
              </span>
              <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-[10px] font-mono font-bold text-zinc-300">
                BNI
              </span>
              <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-[10px] font-mono font-bold text-zinc-300">
                BRI
              </span>
            </div>
          </div>

          {/* Mitra Ekspedisi */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 block">
              KURIR LOGISTIK RESMI
            </span>
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-[10px] font-mono font-bold text-zinc-300">
                J&T EXPRESS
              </span>
              <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-[10px] font-mono font-bold text-zinc-300">
                JNE REGULER
              </span>
              <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-[10px] font-mono font-bold text-zinc-300">
                SICEPAT EKSPRES
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* LAYER 5: Bottom Legal Bar */}
      <div className="border-t border-zinc-900 py-4 px-4 text-center text-[11px] text-zinc-500">
        <p>Copyright © 2026 UrbanStyle LifeWear Tokyo. Seluruh Hak Cipta Dilindungi Undang-Undang.</p>
      </div>
    </>
  );
}
