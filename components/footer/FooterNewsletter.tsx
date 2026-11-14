'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Check, Sparkles } from 'lucide-react';
import { Coupon } from '@/lib/types';
import { dataStore } from '@/lib/store';
import { copyToClipboard } from '@/lib/utils/clipboard';

export default function FooterNewsletter() {
  const [emailInput, setEmailInput] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [welcomeCoupon, setWelcomeCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    let active = true;
    dataStore.getCoupons().then((list) => {
      if (!active || list.length === 0) return;
      const featured = list.find((c) => c.type === 'fixed') || list[0];
      setWelcomeCoupon(featured);
    });
    return () => {
      active = false;
    };
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newsletterError, setNewsletterError] = useState('');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = emailInput.trim();
    if (!cleaned || !cleaned.includes('@')) {
      setNewsletterError('Masukkan alamat email yang valid.');
      return;
    }
    setNewsletterError('');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleaned }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setNewsletterError(json?.message || 'Gagal mendaftar newsletter. Coba lagi.');
        return;
      }
      setNewsletterSubscribed(true);
    } catch {
      setNewsletterError('Koneksi gagal saat mendaftarkan newsletter.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCouponCode = async () => {
    if (!welcomeCoupon) return;
    if (await copyToClipboard(welcomeCoupon.code)) {
      setCopiedCoupon(true);
      setTimeout(() => setCopiedCoupon(false), 2000);
    }
  };

  return (
    <div className="border-b border-zinc-800 bg-[#18181B] py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#E60012] text-white text-[9px] font-black uppercase tracking-widest">
            <Sparkles size={11} />
            <span>BULETIN & PROMO MEMBER</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white">
            {welcomeCoupon
              ? `Gunakan Kupon ${welcomeCoupon.code} untuk Hemat Belanja`
              : 'Berlangganan Pembaruan Koleksi LifeWear'}
          </h3>
          <p className="text-xs text-zinc-400 max-w-lg">
            {welcomeCoupon
              ? `${welcomeCoupon.description} Gunakan kode voucher `
              : 'Daftarkan email Anda untuk menerima kabar perilisan koleksi terbaru dan penawaran eksklusif member.'}
            {welcomeCoupon && <strong className="text-white font-mono">{welcomeCoupon.code}</strong>}
            {welcomeCoupon ? ' saat checkout.' : ''}
          </p>
        </div>

        <div className="w-full md:w-auto min-w-[280px] sm:min-w-[360px]">
          {newsletterSubscribed ? (
            <div className="p-3 bg-zinc-900 border border-zinc-700 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Check size={16} />
                <span>
                  {welcomeCoupon ? (
                    <>Kupon Aktif: <strong>{welcomeCoupon.code}</strong></>
                  ) : (
                    'Terima kasih! Email Anda telah terdaftar.'
                  )}
                </span>
              </div>
              {welcomeCoupon && (
                <button
                  type="button"
                  onClick={copyCouponCode}
                  className="px-3 py-1 bg-[#E60012] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-red-700 transition-colors cursor-pointer"
                >
                  {copiedCoupon ? 'Tersalin!' : 'Salin Kode'}
                </button>
              )}
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
                disabled={isSubmitting}
                className="px-5 py-3 bg-[#E60012] hover:bg-red-700 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider transition-colors shrink-0 rounded-none shadow-xs cursor-pointer"
              >
                {isSubmitting ? '...' : 'Klaim'}
              </button>
            </form>
          )}
          {newsletterError && !newsletterSubscribed && (
            <p className="text-[11px] font-semibold text-red-400 mt-1.5">{newsletterError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
