'use client';

import React from 'react';
import { Product } from '@/lib/types';
import { Heart, Truck, RotateCcw, ShieldCheck } from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/utils';
import { ModalType } from '../InformationModals';

interface ProductModalGalleryProps {
  product: Product;
  mainDisplayImage: string;
  galleryList: string[];
  activeImageIndex: number;
  setActiveImageIndex: (idx: number) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onOpenInfoModal?: (type: ModalType) => void;
}

export const ProductModalGallery: React.FC<ProductModalGalleryProps> = ({
  product,
  mainDisplayImage,
  galleryList,
  activeImageIndex,
  setActiveImageIndex,
  isWishlisted,
  onToggleWishlist,
  onOpenInfoModal,
}) => {
  return (
    <div className="lg:col-span-7 p-4 sm:p-6 lg:p-8 bg-zinc-50 border-b lg:border-b-0 lg:border-r border-zinc-200 space-y-4">
      {/* Main Picture */}
      <div className="relative aspect-3/4 w-full bg-white border border-zinc-200 overflow-hidden">
        <img
          src={getOptimizedImageUrl(mainDisplayImage, 900, 80)}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-all duration-300"
        />

        {/* Tag Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
          {product.is_new && (
            <span className="bg-[#111111] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1">
              NEW ARRIVAL
            </span>
          )}
          {product.original_price && product.original_price > product.price && (
            <span className="bg-[#E60012] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1">
              LIMITED OFFER
            </span>
          )}
        </div>

        {/* Wishlist Floating Button */}
        <button
          onClick={() => onToggleWishlist(product)}
          className={`absolute top-3 right-3 p-2.5 border transition-all cursor-pointer ${
            isWishlisted
              ? 'bg-[#E60012] border-[#E60012] text-white'
              : 'bg-white/90 border-zinc-300 text-zinc-700 hover:text-[#E60012]'
          }`}
          title={isWishlisted ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
        >
          <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Thumbnail Gallery Strip */}
      {galleryList.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {galleryList.map((imgUrl, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImageIndex(idx)}
              className={`w-18 h-24 shrink-0 bg-white border-2 overflow-hidden transition-all cursor-pointer ${
                activeImageIndex === idx
                  ? 'border-[#E60012] ring-1 ring-[#E60012]'
                  : 'border-zinc-200 opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={getOptimizedImageUrl(imgUrl, 160, 70)}
                alt="Thumbnail"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Value Highlights */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-200 text-center">
        <button
          type="button"
          onClick={() => onOpenInfoModal?.('shipping')}
          className="p-2.5 bg-white border border-zinc-200 space-y-1 hover:border-zinc-400 hover:bg-zinc-50 transition-colors cursor-pointer text-center"
          title="Buka panduan pengiriman & gratis ongkir"
        >
          <Truck size={16} className="mx-auto text-zinc-800" />
          <p className="text-[10px] font-bold uppercase text-zinc-900">Bebas Ongkir</p>
          <p className="text-[9px] text-zinc-500">Min. Rp 400.000</p>
        </button>
        <button
          type="button"
          onClick={() => onOpenInfoModal?.('return')}
          className="p-2.5 bg-white border border-zinc-200 space-y-1 hover:border-zinc-400 hover:bg-zinc-50 transition-colors cursor-pointer text-center"
          title="Buka kebijakan retur garansi 30 hari"
        >
          <RotateCcw size={16} className="mx-auto text-zinc-800" />
          <p className="text-[10px] font-bold uppercase text-zinc-900">Garansi 30 Hari</p>
          <p className="text-[9px] text-zinc-500">Tukar Ukuran Bebas</p>
        </button>
        <button
          type="button"
          onClick={() => onOpenInfoModal?.('lifewear')}
          className="p-2.5 bg-white border border-zinc-200 space-y-1 hover:border-zinc-400 hover:bg-zinc-50 transition-colors cursor-pointer text-center"
          title="Buka filosofi desain LifeWear"
        >
          <ShieldCheck size={16} className="mx-auto text-zinc-800" />
          <p className="text-[10px] font-bold uppercase text-zinc-900">100% Otentik</p>
          <p className="text-[9px] text-zinc-500">Standar LifeWear</p>
        </button>
      </div>
    </div>
  );
};
