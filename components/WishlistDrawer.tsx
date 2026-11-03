// components/WishlistDrawer.tsx
'use client';

import React from 'react';
import { Product } from '@/lib/types';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: Product[];
  onRemoveFromWishlist: (productId: number) => void;
  onMoveToCart: (product: Product, size?: string) => void;
}

export default function WishlistDrawer({
  isOpen,
  onClose,
  items,
  onRemoveFromWishlist,
  onMoveToCart,
}: WishlistDrawerProps) {
  const [selectedSizes, setSelectedSizes] = React.useState<Record<number, string>>({});

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-zinc-300 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-red-100 text-[#E60012] flex items-center justify-center">
                <Heart size={18} fill="#E60012" />
              </div>
              <div>
                <h2 className="text-base font-black uppercase tracking-tight text-zinc-950">
                  Daftar Favorit ({items.length})
                </h2>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  WISHLIST ESSENTIALS
                </span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-zinc-200">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-16">
                <div className="w-16 h-16 bg-zinc-100 flex items-center justify-center text-zinc-300">
                  <Heart size={32} />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800">
                  Wishlist Anda Masih Kosong
                </h3>
                <p className="text-xs text-zinc-500 max-w-xs">
                  Simpan pakaian yang Anda sukai dengan menekan ikon hati pada kartu produk untuk membelinya nanti.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-5 py-2.5 bg-zinc-900 hover:bg-[#E60012] text-white text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Jelajahi Koleksi
                </button>
              </div>
            ) : (
              items.map((prod) => (
                <div key={prod.id} className="py-4 flex gap-4 items-center group">
                  <div className="w-20 h-24 bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200">
                    <img
                      src={prod.image_url}
                      alt={prod.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      {prod.category_name}
                    </p>
                    <h4 className="text-xs font-bold text-zinc-900 line-clamp-1">
                      {prod.name}
                    </h4>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-black text-zinc-950 font-mono">
                        Rp {prod.price.toLocaleString('id-ID')}
                      </span>
                      {prod.original_price && prod.original_price > prod.price && (
                        <span className="text-[11px] text-zinc-400 line-through font-mono">
                          Rp {prod.original_price.toLocaleString('id-ID')}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-500">
                      Stok: <span className="font-bold text-zinc-800">{prod.stock} unit</span>
                    </p>

                    {/* Selector Ukuran (TICKET-03) */}
                    <div className="pt-1.5 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-zinc-500 uppercase tracking-wider">Ukuran:</span>
                        <span className="font-mono font-bold text-zinc-900">
                          {selectedSizes[prod.id] || prod.sizes[0] || 'M'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {(prod.sizes && prod.sizes.length > 0 ? prod.sizes : ['S', 'M', 'L', 'XL']).map((sz) => {
                          const isChosen = (selectedSizes[prod.id] || prod.sizes[0] || 'M') === sz;
                          return (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => setSelectedSizes((prev) => ({ ...prev, [prod.id]: sz }))}
                              className={`px-2 py-0.5 text-[10px] font-bold uppercase transition-all border rounded-none min-w-[28px] text-center ${
                                isChosen
                                  ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs'
                                  : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-950'
                              }`}
                            >
                              {sz}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => onMoveToCart(prod, selectedSizes[prod.id] || prod.sizes[0] || 'M')}
                        className="px-3 py-1.5 bg-[#111111] hover:bg-[#E60012] text-white text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1 rounded-none shadow-xs"
                      >
                        <ShoppingBag size={12} />
                        <span>Ke Keranjang</span>
                      </button>
                      <button
                        onClick={() => onRemoveFromWishlist(prod.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-600 transition-colors"
                        title="Hapus dari favorit"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-4 border-t border-zinc-200 bg-zinc-50">
              <button
                onClick={onClose}
                className="w-full py-3 bg-zinc-900 hover:bg-[#E60012] text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <span>Lanjut Berbelanja</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
