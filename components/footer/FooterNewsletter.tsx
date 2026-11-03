'use client';

import React, { useState } from 'react';
import { Mail, Check, Sparkles } from 'lucide-react';

export default function FooterNewsletter() {
  const [emailInput, setEmailInput] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes('@')) return;
    setNewsletterSubscribed(true);
  };

  const copyCouponCode = () => {
    navigator.clipboard.writeText('URBANWELCOME50');
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2000);
  };

  return (
    <div className="border-b border-zinc-800 bg-[#18181B] py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#E60012] text-white text-[9px] font-black uppercase tracking-widest">
            <Sparkles size={11} />
            <span>VOUCHER SAMBUTAN MEMBER</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white">
            Dapatkan Diskon Rp 50.000 untuk Pesanan Pertama
          </h3>
          <p className="text-xs text-zinc-400 max-w-lg">
            Daftarkan email Anda untuk buletin LifeWear dan gunakan kode voucher <strong className="text-white font-mono">URBANWELCOME50</strong> saat checkout.
          </p>
        </div>

        <div className="w-full md:w-auto min-w-[280px] sm:min-w-[360px]">
          {newsletterSubscribed ? (
            <div className="p-3 bg-zinc-900 border border-zinc-700 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Check size={16} />
                <span>Kupon Aktif: <strong>URBANWELCOME50</strong></span>
              </div>
              <button
                type="button"
                onClick={copyCouponCode}
                className="px-3 py-1 bg-[#E60012] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-red-700 transition-colors"
              >
                {copiedCoupon ? 'Tersalin!' : 'Salin Kode'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex items-stretch gap-0">
              <div className="relative flex-1">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Masukkan alamat email Anda..."
                  className="w-full pl-10 pr-3 py-3 bg-zinc-900 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#E60012] rounded-none"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-3 bg-[#E60012] hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider transition-colors shrink-0 rounded-none shadow-xs"
              >
                Klaim
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
