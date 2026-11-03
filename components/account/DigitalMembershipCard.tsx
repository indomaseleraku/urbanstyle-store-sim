// components/account/DigitalMembershipCard.tsx
'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { UserProfile } from '@/lib/types';

interface DigitalMembershipCardProps {
  user: UserProfile | null;
}

export default function DigitalMembershipCard({ user }: DigitalMembershipCardProps) {
  const memberIdSuffix = user?.id ? user.id.replace(/-/g, '').slice(0, 6).toUpperCase() : '8829';
  const fullMemberCode = `US-MEMBER-${memberIdSuffix}-2026`;

  // Visual Barcode Bars generator (Alternating widths pattern for high-fidelity Uniqlo barcode)
  const barcodePattern = [
    3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 3, 1, 2, 1, 4, 2, 3, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4, 1, 3, 2, 4, 1, 2, 3, 1, 2, 4, 1, 3, 2
  ];

  return (
    <div className="bg-gradient-to-br from-[#111111] via-[#1a1a1a] to-[#0a0a0a] text-white border-2 border-zinc-900 p-4 sm:p-7 relative overflow-hidden shadow-xl rounded-none">
      {/* Decorative Watermark Katakana Background */}
      <div className="absolute -right-6 -bottom-6 text-zinc-800/30 font-black text-6xl sm:text-7xl select-none pointer-events-none tracking-widest font-mono">
        ライフウェア
      </div>

      <div className="relative z-10 space-y-4 sm:space-y-5">
        {/* Top Bar: Dual Red Logo & Membership Level */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 sm:pb-4 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex items-center gap-1">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#E60012] text-white font-black text-xs sm:text-sm flex items-center justify-center leading-none">
                US
              </div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#E60012] text-white font-black text-[9px] sm:text-[10px] flex items-center justify-center leading-none text-center">
                ユニ
              </div>
            </div>
            <div>
              <p className="text-[10px] sm:text-[11px] font-black tracking-widest uppercase text-white">
                URBANSTYLE LIFEWEAR
              </p>
              <p className="text-[8px] sm:text-[9px] text-zinc-400 font-mono tracking-wider">
                MEMBER PASS • ID KEANGGOTAAN
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 bg-white/10 border border-white/15 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#E60012] shrink-0">
            <Sparkles size={11} className="text-amber-400" />
            <span className="text-white">{user?.role === 'admin' ? 'ADMIN • VIP' : 'ACTIVE MEMBER'}</span>
          </div>
        </div>

        {/* Member Name & Points */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <p className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              NAMA ANGGOTA
            </p>
            <h2 className="text-base sm:text-xl font-black uppercase tracking-wide text-white font-sans mt-0.5 truncate">
              {user?.full_name || 'MEMBER LIFEWEAR'}
            </h2>
          </div>
          <div className="sm:text-right">
            <p className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              POIN LIFEWEAR
            </p>
            <p className="text-sm sm:text-base font-black font-mono text-amber-400">
              1.250 PTS
            </p>
          </div>
        </div>

        {/* Barcode Visual Module (High-Precision Simulation) */}
        <div className="bg-white p-3 sm:p-4 text-zinc-950 flex flex-col items-center justify-center space-y-1.5 sm:space-y-2 border border-zinc-300 rounded-none shadow-inner">
          <div className="flex items-center justify-center gap-[2px] sm:gap-[3px] h-10 sm:h-14 w-full max-w-sm overflow-hidden py-1">
            {barcodePattern.map((w, idx) => (
              <div
                key={idx}
                className="bg-black h-full shrink-0"
                style={{ width: `${w * 1.4}px` }}
              />
            ))}
          </div>
          <p className="font-mono text-[11px] sm:text-sm font-bold tracking-[0.2em] sm:tracking-[0.25em] text-zinc-900 text-center uppercase">
            {fullMemberCode}
          </p>
        </div>

        {/* Micro Helper Text */}
        <p className="text-[9px] sm:text-[10px] text-zinc-400 tracking-wide text-center sm:text-left flex items-center justify-center sm:justify-start gap-1.5">
          <span className="w-1.5 h-1.5 bg-[#E60012] inline-block shrink-0" />
          <span>Scan barcode ini saat bertransaksi di kasir atau gunakan untuk klaim kupon online eksklusif.</span>
        </p>
      </div>
    </div>
  );
}
