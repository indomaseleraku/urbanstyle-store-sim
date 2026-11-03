// components/home/MobileBottomNav.tsx
'use client';

import React from 'react';
import { Home, SlidersHorizontal, Heart, ShoppingBag, User } from 'lucide-react';

interface MobileBottomNavProps {
  isHomeActive: boolean;
  isCategoryActive: boolean;
  isWishlistActive: boolean;
  isCartActive: boolean;
  wishlistCount: number;
  totalCartCount: number;
  onGoHome: () => void;
  onOpenCategories: () => void;
  onOpenWishlist: () => void;
  onOpenCart: () => void;
  onOpenAccount: () => void;
}

export default function MobileBottomNav({
  isHomeActive,
  isCategoryActive,
  isWishlistActive,
  isCartActive,
  wishlistCount,
  totalCartCount,
  onGoHome,
  onOpenCategories,
  onOpenWishlist,
  onOpenCart,
  onOpenAccount,
}: MobileBottomNavProps) {
  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 md:hidden flex justify-around items-center py-1.5 px-1 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
    >
      {/* Tab 1: Beranda */}
      <button
        type="button"
        onClick={onGoHome}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
          isHomeActive ? 'text-[#E60012] font-black' : 'text-zinc-600 hover:text-zinc-950'
        }`}
      >
        <Home size={19} className={isHomeActive ? 'stroke-[2.5]' : ''} />
        <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Beranda</span>
        <span className={`w-1 h-1 rounded-full mt-0.5 ${isHomeActive ? 'bg-[#E60012]' : 'bg-transparent'}`} />
      </button>

      {/* Tab 2: Kategori */}
      <button
        type="button"
        onClick={onOpenCategories}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
          isCategoryActive ? 'text-[#E60012] font-black' : 'text-zinc-600 hover:text-zinc-950'
        }`}
      >
        <SlidersHorizontal size={19} className={isCategoryActive ? 'stroke-[2.5]' : ''} />
        <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Kategori</span>
        <span className={`w-1 h-1 rounded-full mt-0.5 ${isCategoryActive ? 'bg-[#E60012]' : 'bg-transparent'}`} />
      </button>

      {/* Tab 3: Favorit */}
      <button
        type="button"
        onClick={onOpenWishlist}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors relative ${
          isWishlistActive ? 'text-[#E60012] font-black' : 'text-zinc-600 hover:text-zinc-950'
        }`}
      >
        <div className="relative">
          <Heart
            size={19}
            fill={wishlistCount > 0 ? '#E60012' : 'none'}
            className={wishlistCount > 0 ? 'text-[#E60012]' : ''}
          />
          {wishlistCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-[#E60012] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center font-mono">
              {wishlistCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Favorit</span>
        <span className={`w-1 h-1 rounded-full mt-0.5 ${isWishlistActive ? 'bg-[#E60012]' : 'bg-transparent'}`} />
      </button>

      {/* Tab 4: Tas Belanja */}
      <button
        type="button"
        onClick={onOpenCart}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors relative ${
          isCartActive ? 'text-[#E60012] font-black' : 'text-zinc-600 hover:text-zinc-950'
        }`}
      >
        <div className="relative">
          <ShoppingBag size={19} className={isCartActive ? 'stroke-[2.5]' : ''} />
          {totalCartCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-[#E60012] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center font-mono">
              {totalCartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Tas</span>
        <span className={`w-1 h-1 rounded-full mt-0.5 ${isCartActive ? 'bg-[#E60012]' : 'bg-transparent'}`} />
      </button>

      {/* Tab 5: Akun */}
      <button
        type="button"
        onClick={onOpenAccount}
        className="flex flex-col items-center justify-center flex-1 py-1 text-zinc-600 hover:text-[#E60012] active:text-[#E60012] transition-colors"
      >
        <User size={19} />
        <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Akun</span>
        <span className="w-1 h-1 rounded-full mt-0.5 bg-transparent" />
      </button>
    </nav>
  );
}
