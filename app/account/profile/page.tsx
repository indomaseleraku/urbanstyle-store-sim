'use client';

// app/account/profile/page.tsx
// Halaman Pengaturan Profil & Kartu Digital Member Barcode Uniqlo LifeWear

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { User, Phone, Mail, CheckCircle2, Ruler, Sparkles, QrCode } from 'lucide-react';

import DigitalMembershipCard from '@/components/account/DigitalMembershipCard';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [preferredSize, setPreferredSize] = useState<'S' | 'M' | 'L' | 'XL'>(user?.preferred_size || 'L');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
      if (user.preferred_size) setPreferredSize(user.preferred_size);
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      full_name: fullName,
      phone,
      preferred_size: preferredSize,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 1. DIGITAL MEMBERSHIP CARD (UNIQLO LIFEWEAR STYLE) */}
      <DigitalMembershipCard user={user} />

      {/* ======================================================== */}
      {/* 2. FORM PROFIL & PREFERENSI UKURAN                        */}
      {/* ======================================================== */}
      <div className="bg-white border border-zinc-200 p-6 sm:p-8 space-y-6 rounded-none">
        <div>
          <h1 className="text-base sm:text-lg font-black uppercase tracking-tight text-zinc-950">
            Profil Member & Preferensi Busana
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Kelola informasi identitas akun keanggotaan Anda dan ukuran pakaian esensial LifeWear pilihan.
          </p>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold flex items-center gap-2 rounded-none">
            <CheckCircle2 size={16} />
            <span>Profil berhasil diperbarui dan tersimpan di database!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
              Nama Lengkap
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Contoh: Kimy Eka Ardiansyah"
                className="w-full pl-9 pr-3 py-2.5 border border-zinc-300 text-base md:text-xs focus:outline-none focus:border-black font-medium rounded-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
              Alamat Email (Akun Terdaftar)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full pl-9 pr-3 py-2.5 border border-zinc-200 bg-zinc-50 text-base md:text-xs text-zinc-500 cursor-not-allowed font-medium rounded-none"
              />
            </div>
            <span className="text-[10px] text-zinc-400 mt-1 block">Email tidak dapat diubah karena terikat ke ID Keanggotaan.</span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
              Nomor WhatsApp Aktif
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="081234567890"
                className="w-full pl-9 pr-3 py-2.5 border border-zinc-300 text-base md:text-xs focus:outline-none focus:border-black font-medium rounded-none"
              />
            </div>
          </div>

          {/* Preferensi Ukuran Pakaian LifeWear */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5 flex items-center gap-1.5">
              <Ruler size={14} />
              <span>Ukuran Pakaian Pilihan (Default Recommendation)</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['S', 'M', 'L', 'XL'] as const).map((sz) => (
                <button
                  type="button"
                  key={sz}
                  onClick={() => setPreferredSize(sz)}
                  className={`py-3 text-xs font-bold uppercase border transition-colors rounded-none min-h-[44px] ${
                    preferredSize === sz
                      ? 'bg-zinc-950 text-white border-zinc-950'
                      : 'border-zinc-300 text-zinc-700 hover:border-black bg-white'
                  }`}
                >
                  Ukuran {sz}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-zinc-500 mt-1.5 block">
              Ukuran ini akan diprioritaskan otomatis saat Anda membuka halaman katalog dan detail produk.
            </span>
          </div>

          <div className="pt-4 border-t border-zinc-200">
            <button
              type="submit"
              className="px-6 py-3 bg-black hover:bg-[#E60012] text-white text-xs font-bold uppercase tracking-wider transition-colors rounded-none min-h-[44px]"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
