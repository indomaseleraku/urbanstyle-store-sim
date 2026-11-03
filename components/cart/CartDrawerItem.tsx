// components/cart/CartDrawerItem.tsx
'use client';

import React from 'react';
import { CartItem } from '@/lib/types';
import { getOptimizedImageUrl } from '@/lib/utils';
import { Trash2, Plus, Minus } from 'lucide-react';

interface CartDrawerItemProps {
  item: CartItem;
  index: number;
  onUpdateQty: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
}

export default function CartDrawerItem({
  item,
  index,
  onUpdateQty,
  onRemoveItem,
}: CartDrawerItemProps) {
  return (
    <div className="pt-4 first:pt-0 flex gap-3.5 items-start">
      {/* Thumbnail with studio bg and sharp border */}
      <img
        src={getOptimizedImageUrl(item.product.image_url, 160, 75)}
        alt={item.product.name}
        className="w-16 h-20 sm:w-20 sm:h-24 object-cover bg-[#F6F6F6] border border-zinc-200 shrink-0 rounded-none"
      />

      {/* Info */}
      <div className="flex-1 space-y-1">
        <h3 className="text-xs sm:text-sm font-bold text-zinc-950 leading-snug uppercase line-clamp-2">
          {item.product.name}
        </h3>
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 font-medium pt-0.5">
          <span className="px-1.5 py-0.5 bg-zinc-100 border border-zinc-200 text-zinc-800 font-bold uppercase rounded-none">
            {item.selected_color}
          </span>
          <span className="px-1.5 py-0.5 bg-zinc-950 text-white font-bold uppercase rounded-none">
            Ukuran {item.selected_size}
          </span>
        </div>
        <p className="text-xs sm:text-sm font-mono font-black text-zinc-950 pt-1">
          Rp {item.product.price.toLocaleString('id-ID')}
        </p>

        {/* Quantity Controls - Sharp Stepper */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center border border-zinc-300 bg-white rounded-none">
            <button
              onClick={() => onUpdateQty(index, item.quantity - 1)}
              className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100 text-zinc-700 transition-colors"
              title="Kurangi kuantitas"
              aria-label="Kurangi"
            >
              <Minus size={12} />
            </button>
            <span className="w-8 text-center text-xs font-mono font-bold text-zinc-950">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQty(index, item.quantity + 1)}
              disabled={item.quantity >= item.product.stock}
              className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100 text-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Tambah kuantitas"
              aria-label="Tambah"
            >
              <Plus size={12} />
            </button>
          </div>

          <button
            onClick={() => onRemoveItem(index)}
            className="text-zinc-400 hover:text-[#E60012] p-1.5 transition-colors"
            title="Hapus dari tas"
            aria-label="Hapus item"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
