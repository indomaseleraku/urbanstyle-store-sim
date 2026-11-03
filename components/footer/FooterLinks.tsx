'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ModalType } from '../InformationModals';

interface FooterLinksProps {
  onOpenInfoModal?: (type: ModalType) => void;
  onOpenSizeChart?: () => void;
  onSelectCategory?: (categorySlug: string) => void;
}

export default function FooterLinks({ onOpenInfoModal, onOpenSizeChart, onSelectCategory }: FooterLinksProps) {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    about: false,
    help: false,
    categories: false,
    developer: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCategoryNav = (slug: string) => {
    if (onSelectCategory) {
      onSelectCategory(slug);
      const el = document.getElementById('katalog');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Brand Info & Mission Statement */}
        <div className="md:col-span-4 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#E60012] text-white font-black text-sm flex items-center justify-center">
              US
            </div>
            <div className="w-8 h-8 bg-[#E60012] text-white font-black text-[9px] flex items-center justify-center text-center leading-none">
              アー<br />バン
            </div>
            <span className="font-black text-xl tracking-tight uppercase ml-1">
              URBANSTYLE STORE
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
            UrbanStyle LifeWear menghadirkan pakaian esensial harian dengan kesederhanaan desain, mutu serat alami, dan detail kenyamanan yang terus disempurnakan.
          </p>
          <div className="pt-1 flex items-center gap-2 text-xs text-zinc-400">
            <span className="font-mono text-[10px] bg-zinc-900 border border-zinc-800 px-2 py-1 text-zinc-300">
              LIFEWEAR TOKYO
            </span>
            <span className="font-mono text-[10px] text-zinc-500">
              EST. 2026 • INDONESIA
            </span>
          </div>
        </div>

        {/* Kolom 2: Bantuan & Panduan */}
        <div className="md:col-span-3 border-t md:border-t-0 border-zinc-800 pt-3 md:pt-0">
          <button
            type="button"
            onClick={() => toggleSection('help')}
            className="w-full flex items-center justify-between text-left md:pointer-events-none pb-2 md:pb-0"
          >
            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-200">
              Bantuan & Panduan
            </h4>
            <span className="md:hidden text-zinc-400">
              {openSections.help ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </button>
          <ul className={`space-y-2.5 text-xs text-zinc-400 pt-2 ${openSections.help ? 'block' : 'hidden md:block'}`}>
            <li>
              <button
                type="button"
                onClick={() => onOpenSizeChart && onOpenSizeChart()}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Panduan Ukuran (Size Chart cm)
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenInfoModal && onOpenInfoModal('return')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Kebijakan Pengembalian & Retur 30 Hari
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenInfoModal && onOpenInfoModal('shipping')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Panduan Bebas Ongkir & Ekspedisi
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenInfoModal && onOpenInfoModal('help')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Layanan Bantuan Konsumen & FAQ
              </button>
            </li>
          </ul>
        </div>

        {/* Kolom 3: Filosofi & Koleksi */}
        <div className="md:col-span-2 border-t md:border-t-0 border-zinc-800 pt-3 md:pt-0">
          <button
            type="button"
            onClick={() => toggleSection('categories')}
            className="w-full flex items-center justify-between text-left md:pointer-events-none pb-2 md:pb-0"
          >
            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-200">
              Filosofi & Toko
            </h4>
            <span className="md:hidden text-zinc-400">
              {openSections.categories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </button>
          <ul className={`space-y-2.5 text-xs text-zinc-400 pt-2 ${openSections.categories ? 'block' : 'hidden md:block'}`}>
            <li>
              <button
                type="button"
                onClick={() => onOpenInfoModal && onOpenInfoModal('lifewear')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Tentang Filosofi LifeWear
              </button>
            </li>
            {[
              { slug: 'kemeja', label: 'Koleksi Kemeja & Flannel' },
              { slug: 'kaos', label: 'Kaos Katun & AIRism' },
              { slug: 'celana', label: 'Celana Chino & Ankle' },
              { slug: 'jaket', label: 'Jaket Parka & Outerwear' },
            ].map((cat) => (
              <li key={cat.slug}>
                {onSelectCategory ? (
                  <button
                    type="button"
                    onClick={() => handleCategoryNav(cat.slug)}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {cat.label}
                  </button>
                ) : (
                  <Link href={`/?category=${cat.slug}#katalog`} className="hover:text-white transition-colors">
                    {cat.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Kolom 4: Jaminan Pelanggan */}
        <div className="md:col-span-3 border-t md:border-t-0 border-zinc-800 pt-3 md:pt-0">
          <button
            type="button"
            onClick={() => toggleSection('developer')}
            className="w-full flex items-center justify-between text-left md:pointer-events-none pb-2 md:pb-0"
          >
            <h4 className="text-xs font-black uppercase tracking-widest text-[#E60012]">
              Jaminan Pelanggan
            </h4>
            <span className="md:hidden text-zinc-400">
              {openSections.developer ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </button>
          <div className={`pt-2 ${openSections.developer ? 'block' : 'hidden md:block'}`}>
            <div className="p-3.5 bg-zinc-900 border border-zinc-800 text-xs space-y-1.5 text-zinc-300">
              <p className="font-bold text-white uppercase text-[11px]">
                Standar Mutu LifeWear
              </p>
              <p className="text-[10px] text-zinc-400 leading-relaxed">
                Setiap pakaian melewati kontrol mutu ketat, garansi keaslian 100%, serta proteksi pertukaran ukuran dan retur 30 hari.
              </p>
              <div className="pt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono text-zinc-400">Layanan Pelanggan Aktif</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
