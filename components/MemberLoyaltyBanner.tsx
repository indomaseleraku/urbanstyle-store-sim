// components/MemberLoyaltyBanner.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Copy, Check, ArrowRight, UserCheck, ShieldCheck, Tag, QrCode } from 'lucide-react';
import { UserProfile } from '@/lib/types';

interface MemberLoyaltyBannerProps {
  user: UserProfile | null;
  onOpenAuthModal: () => void;
}

export default function MemberLoyaltyBanner({ user, onOpenAuthModal }: MemberLoyaltyBannerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText('URBANWELCOME50');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Visual Barcode Bars generator (Alternating widths pattern for Uniqlo barcode)
  const barcodePattern = [
    3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 3, 1, 2, 1, 4, 2, 3, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4, 1, 3, 2, 4, 1, 2, 3, 1, 2, 4, 1, 3, 2
  ];

  const memberIdSuffix = user?.id ? user.id.replace(/-/g, '').slice(0, 6).toUpperCase() : '8829';
  const fullMemberCode = `US-MEMBER-${memberIdSuffix}-2026`;

  return (
    <section className="bg-[#111111] text-white border-y border-zinc-800 relative overflow-hidden py-12 sm:py-16">
      {/* Decorative Watermark Katakana Background */}
      <div className="absolute -right-8 -bottom-10 text-zinc-800/30 font-black text-8xl sm:text-9xl select-none pointer-events-none tracking-widest font-mono">
        ライフウェア
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Kolom Kiri: Narasi Keuntungan Member & Voucher Box */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#E60012] text-white text-[9px] font-black uppercase tracking-widest rounded-none shadow-xs">
                <Sparkles size={11} className="text-amber-300" />
                <span>KEANGGOTAAN DIGITAL RESMI • LIFEWEAR PASS</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white leading-tight">
                Nikmati Seluruh Keuntungan Eksklusif Member UrbanStyle
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
                Bergabunglah dengan ekosistem keanggotaan LifeWear. Dapatkan barcode digital pribadi, voucher belanja selamat datang, serta poin akumulasi setiap pembelian busana esensial.
              </p>
            </div>

            {/* Voucher Highlight Box */}
            <div className="p-4 sm:p-5 bg-zinc-900/90 border border-zinc-700/80 rounded-none space-y-3 max-w-xl">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-[#E60012]" />
                  <span className="text-xs font-black uppercase tracking-wider text-zinc-200">
                    Voucher Pembelian Pertama
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 border border-amber-400/20">
                  POTONGAN RP 50.000
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 bg-black/60 p-2.5 sm:p-3 border border-zinc-800">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-zinc-400 font-mono uppercase block">KODE KUPON KLAIM:</span>
                  <span className="text-sm sm:text-base font-black font-mono tracking-widest text-white">
                    URBANWELCOME50
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className={`px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 rounded-none cursor-pointer ${
                    copied 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-white hover:bg-zinc-200 text-zinc-950 shadow-xs'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check size={13} />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Salin Kode</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-zinc-500 font-mono">
                *Berlaku untuk minimum transaksi Rp 200.000 pada seluruh koleksi etalase.
              </p>
            </div>

            {/* 3 Value Pillars */}
            <div className="grid grid-cols-3 gap-3 pt-1 max-w-xl text-[10px] sm:text-[11px] text-zinc-400 font-bold uppercase">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#E60012] shrink-0" />
                <span>Poin Tiap Belanja</span>
              </div>
              <div className="flex items-center gap-1.5 border-x border-zinc-800 px-2 text-center justify-center">
                <span className="w-1.5 h-1.5 bg-[#E60012] shrink-0" />
                <span>Retur Mudah 30 Hari</span>
              </div>
              <div className="flex items-center gap-1.5 text-right justify-end">
                <span className="w-1.5 h-1.5 bg-[#E60012] shrink-0" />
                <span>Bebas Ongkir &gt;400k</span>
              </div>
            </div>

            {/* CTA Action */}
            <div className="pt-2">
              {user ? (
                <Link
                  href="/account/profile"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#E60012] hover:bg-red-700 text-white text-xs font-black uppercase tracking-widest rounded-none shadow-md transition-colors"
                >
                  <UserCheck size={15} />
                  <span>Buka Profil & Barcode Member Saya</span>
                  <ArrowRight size={14} />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={onOpenAuthModal}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#E60012] hover:bg-red-700 text-white text-xs font-black uppercase tracking-widest rounded-none shadow-md transition-colors cursor-pointer"
                >
                  <span>Daftar / Masuk Member Sekarang</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>

          </div>

          {/* Kolom Kanan: Visual Card Simulation (Uniqlo LifeWear Digital Pass) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-md bg-gradient-to-br from-[#1c1c1f] via-[#121214] to-[#0a0a0c] border-2 border-zinc-700 p-5 sm:p-6 shadow-2xl relative overflow-hidden rounded-none group hover:border-zinc-500 transition-colors">
              
              {/* Background Watermark in Card */}
              <div className="absolute -right-4 -bottom-4 text-zinc-800/40 font-black text-6xl select-none pointer-events-none font-mono tracking-widest">
                ライフウェア
              </div>

              <div className="relative z-10 space-y-4">
                
                {/* Header Card */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-1">
                      <div className="w-7 h-7 bg-[#E60012] text-white font-black text-xs flex items-center justify-center">
                        US
                      </div>
                      <div className="w-7 h-7 bg-[#E60012] text-white font-black text-[9px] flex items-center justify-center leading-none text-center">
                        ユニ
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white leading-tight">
                        URBANSTYLE LIFEWEAR
                      </p>
                      <p className="text-[8px] text-zinc-400 font-mono tracking-wider">
                        DIGITAL MEMBER PASS
                      </p>
                    </div>
                  </div>

                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-white/10 text-amber-400 border border-amber-400/30">
                    VIP ACCESS
                  </span>
                </div>

                {/* Member Identity Details */}
                <div className="flex justify-between items-end text-xs pt-1">
                  <div>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">
                      Nama Anggota
                    </span>
                    <span className="font-black uppercase tracking-wide text-zinc-100 font-sans text-sm">
                      {user?.full_name || 'KIMY EKA ARDIANSYAH'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">
                      Poin Terkumpul
                    </span>
                    <span className="font-mono font-black text-amber-400 text-sm">
                      1.250 PTS
                    </span>
                  </div>
                </div>

                {/* High-Precision Barcode Visual */}
                <div className="bg-white p-3 text-zinc-950 flex flex-col items-center justify-center space-y-1.5 border border-zinc-300 rounded-none shadow-inner">
                  <div className="flex items-center justify-center gap-[2.5px] h-10 sm:h-12 w-full max-w-xs overflow-hidden py-0.5">
                    {barcodePattern.map((w, idx) => (
                      <div
                        key={idx}
                        className="bg-black h-full shrink-0"
                        style={{ width: `${w * 1.5}px` }}
                      />
                    ))}
                  </div>
                  <p className="font-mono text-[11px] sm:text-xs font-bold tracking-[0.25em] text-zinc-900 text-center uppercase">
                    {fullMemberCode}
                  </p>
                </div>

                {/* Card Footer Microtext */}
                <div className="flex items-center justify-between text-[9px] text-zinc-400 pt-1 font-mono">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[#E60012] inline-block" />
                    <span>Scan di kasir & checkout</span>
                  </span>
                  <span>EXP: 12/2026</span>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
