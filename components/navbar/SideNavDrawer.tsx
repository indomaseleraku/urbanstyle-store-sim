// components/navbar/SideNavDrawer.tsx
'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { X, User, ChevronRight } from 'lucide-react';
import { MEN_MEGA_MENU, WOMEN_MEGA_MENU } from '@/lib/constants/navigation';
import { useAuth } from '@/lib/auth-context';
import { ModalType } from '../InformationModals';
import SideNavFooter from './SideNavFooter';

interface SideNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  drawerGender: 'pria' | 'wanita';
  onSelectDrawerGender: (gender: 'pria' | 'wanita') => void;
  onSubCategoryClick: (
    gender: string,
    category: string,
    keyword?: string,
    sort?: string
  ) => void;
  onOpenInfoModal: (type: ModalType) => void;
}

export default function SideNavDrawer({
  isOpen,
  onClose,
  drawerGender,
  onSelectDrawerGender,
  onSubCategoryClick,
  onOpenInfoModal,
}: SideNavDrawerProps) {
  const { user, openAuthModal } = useAuth();

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const menuData = drawerGender === 'pria' ? MEN_MEGA_MENU : WOMEN_MEGA_MENU;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      />

      {/* Drawer Panel */}
      <aside className="fixed inset-y-0 left-0 max-w-md w-full bg-white shadow-2xl z-50 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-300">
        <div>
          {/* Top Header of Drawer */}
          <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#E60012] text-white font-black text-xs tracking-tighter flex items-center justify-center">
                US
              </div>
              <div className="w-8 h-8 bg-[#E60012] text-white font-black text-[9px] tracking-tight flex items-center justify-center leading-none text-center font-sans">
                アー<br/>バン
              </div>
              <div className="ml-1">
                <span className="font-black text-sm uppercase tracking-tight block text-zinc-950">URBANSTYLE</span>
                <span className="text-[8px] font-bold tracking-[0.2em] uppercase text-zinc-400 block -mt-1">LIFEWEAR DIRECTORY</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer"
              title="Tutup Menu"
              aria-label="Tutup Menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Member Login / Profile Section inside Drawer */}
          <div className="px-4 py-2.5 bg-zinc-100 border-b border-zinc-200 flex items-center justify-between text-xs">
            {user ? (
              <Link
                href="/account/profile"
                onClick={onClose}
                className="flex items-center gap-2 hover:text-[#E60012] transition-colors w-full justify-between"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-zinc-950 text-white font-black text-[9px] flex items-center justify-center shrink-0">
                    {user.full_name?.slice(0, 2).toUpperCase() || 'US'}
                  </div>
                  <span className="font-bold text-zinc-900 truncate uppercase text-[11px]">
                    {user.full_name?.split(' ')[0]} (Akun Saya)
                  </span>
                </div>
                <ChevronRight size={14} className="text-zinc-400 shrink-0" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => { onClose(); openAuthModal(); }}
                className="flex items-center gap-2 text-zinc-800 hover:text-[#E60012] font-black uppercase tracking-wider text-[11px] cursor-pointer w-full"
              >
                <User size={15} />
                <span>Masuk ke Akun Member / Daftar</span>
              </button>
            )}
          </div>

          {/* Gender Segmented Switcher inside Drawer */}
          <div className="p-4 bg-zinc-50 border-b border-zinc-200">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onSelectDrawerGender('pria')}
                className={`py-2 text-xs font-black uppercase tracking-wider transition-all text-center cursor-pointer ${
                  drawerGender === 'pria'
                    ? 'bg-zinc-950 text-white shadow-xs'
                    : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-400'
                }`}
              >
                PRIA
              </button>
              <button
                type="button"
                onClick={() => onSelectDrawerGender('wanita')}
                className={`py-2 text-xs font-black uppercase tracking-wider transition-all text-center cursor-pointer ${
                  drawerGender === 'wanita'
                    ? 'bg-zinc-950 text-white shadow-xs'
                    : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-400'
                }`}
              >
                WANITA
              </button>
            </div>
          </div>

          {/* Category Directory Tree */}
          <div className="p-4 sm:p-5 space-y-6">
            {menuData.columns.map((col, colIdx) => (
              <div key={colIdx} className="space-y-2">
                <div className="pb-1.5 border-b border-zinc-950 flex items-baseline justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                    {col.title}
                  </h4>
                  <span className="text-[10px] text-zinc-400 font-mono uppercase">
                    {col.enTitle}
                  </span>
                </div>
                <ul className="divide-y divide-zinc-100">
                  {col.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <button
                        type="button"
                        onClick={() => onSubCategoryClick(drawerGender, link.category, link.search, link.sort)}
                        className="w-full text-left py-2 text-xs text-zinc-700 hover:text-[#E60012] transition-colors flex items-center justify-between group cursor-pointer"
                      >
                        <span className="inline-flex items-center gap-2 truncate">
                          <span className="w-1.5 h-1.5 bg-zinc-300 group-hover:bg-[#E60012] rounded-full transition-colors shrink-0" />
                          <span className="font-medium group-hover:translate-x-0.5 transition-transform">{link.label}</span>
                        </span>
                        {link.badge && (
                          <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 shrink-0 ${
                            link.badgeStyle === 'red' ? 'bg-[#E60012] text-white' :
                            link.badgeStyle === 'blue' ? 'bg-sky-50 text-sky-700 border border-sky-100' :
                            link.badgeStyle === 'yellow' ? 'bg-amber-100 text-amber-900' :
                            link.badgeStyle === 'black' ? 'bg-zinc-950 text-white' :
                            'bg-zinc-100 text-zinc-600'
                          }`}>
                            {link.badge}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Lookbook 2026 Visual Editorial Card */}
            <div className="pt-2">
              <div
                onClick={() => onSubCategoryClick(drawerGender, menuData.lookbook.category, menuData.lookbook.search)}
                className="group relative aspect-[16/9] sm:aspect-[4/3] overflow-hidden bg-zinc-100 cursor-pointer border border-zinc-200 shadow-xs"
              >
                <img
                  src={menuData.lookbook.imageUrl}
                  alt={menuData.lookbook.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute top-2.5 left-2.5 z-10">
                  <span className="bg-[#E60012] text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 shadow-xs">
                    {menuData.lookbook.tag}
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-4 flex flex-col justify-end text-white">
                  <span className="text-[9px] font-mono text-zinc-300 uppercase tracking-widest mb-0.5">
                    {menuData.lookbook.subtitle}
                  </span>
                  <h5 className="text-sm font-black uppercase tracking-tight leading-snug">
                    {menuData.lookbook.title}
                  </h5>
                  <p className="text-[10px] text-zinc-300 mt-1 line-clamp-2 leading-relaxed">
                    {menuData.lookbook.desc}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-white group-hover:text-[#E60012] transition-colors">
                    <span>Jelajahi Gaya Lengkap</span>
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Service Strip & Guarantees at Bottom of Drawer */}
        <SideNavFooter onOpenInfoModal={onOpenInfoModal} onClose={onClose} />
      </aside>
    </div>
  );
}
