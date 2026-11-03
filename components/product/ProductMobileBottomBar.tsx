'use client';

import React from 'react';
import { Product, ColorVariant } from '@/lib/types';
import { Heart, Check, ShoppingBag } from 'lucide-react';

interface ProductMobileBottomBarProps {
  product: Product;
  selectedSize: string;
  currentColor: ColorVariant;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  onAddToCart: () => void;
  isOutOfStock: boolean;
  addedNotice: boolean;
}

export const ProductMobileBottomBar: React.FC<ProductMobileBottomBarProps> = ({
  product,
  selectedSize,
  currentColor,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  isOutOfStock,
  addedNotice,
}) => {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-zinc-200 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] flex md:hidden items-center justify-between shadow-2xl rounded-none">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleWishlist}
          className={`p-2.5 border rounded-none transition-colors cursor-pointer ${
            isWishlisted
              ? 'bg-[#E60012] border-[#E60012] text-white'
              : 'bg-white border-zinc-300 text-zinc-700'
          }`}
          aria-label="Wishlist"
        >
          <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
        <div>
          <span className="text-[10px] text-zinc-400 font-bold uppercase block leading-none font-mono">
            {selectedSize} • {currentColor.name}
          </span>
          <span className="font-mono font-black text-sm text-zinc-950">
            Rp {product.price.toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onAddToCart}
        disabled={isOutOfStock}
        className="py-3 px-5 bg-zinc-950 hover:bg-[#E60012] disabled:bg-zinc-300 text-white text-xs font-bold uppercase tracking-wider rounded-none transition-colors flex items-center gap-1.5 cursor-pointer"
      >
        {addedNotice ? (
          <>
            <Check size={14} className="text-emerald-400" />
            <span>Tersimpan!</span>
          </>
        ) : isOutOfStock ? (
          <span>Stok Habis</span>
        ) : (
          <>
            <ShoppingBag size={14} />
            <span>+ Masuk Tas</span>
          </>
        )}
      </button>
    </div>
  );
};
