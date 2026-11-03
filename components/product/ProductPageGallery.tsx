'use client';

import React from 'react';
import { Product } from '@/lib/types';
import { Heart } from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/utils';

interface ProductPageGalleryProps {
  product: Product;
  mainDisplayImage: string;
  galleryList: string[];
  activeImageIndex: number;
  setActiveImageIndex: (idx: number) => void;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  hasDiscount: boolean;
}

export const ProductPageGallery: React.FC<ProductPageGalleryProps> = ({
  product,
  mainDisplayImage,
  galleryList,
  activeImageIndex,
  setActiveImageIndex,
  isWishlisted,
  onToggleWishlist,
  hasDiscount,
}) => {
  return (
    <div className="lg:col-span-7 space-y-4">
      <div className="relative aspect-[3/4] bg-[#F6F6F6] border border-zinc-200 overflow-hidden rounded-none">
        <img
          src={getOptimizedImageUrl(mainDisplayImage, 900, 80)}
          alt={product.name}
          className="w-full h-full object-cover object-center"
        />

        <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
          {product.is_new && (
            <span className="bg-[#111111] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-none shadow-xs">
              NEW ARRIVAL
            </span>
          )}
          {hasDiscount && (
            <span className="bg-[#E60012] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-none shadow-xs">
              LIMITED OFFER
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleWishlist}
          className={`absolute top-4 right-4 p-3 border transition-all rounded-none cursor-pointer ${
            isWishlisted
              ? 'bg-[#E60012] border-[#E60012] text-white'
              : 'bg-white/95 border-zinc-300 text-zinc-700 hover:text-[#E60012]'
          }`}
          aria-label="Wishlist"
        >
          <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Thumbnail Gallery Strip */}
      {galleryList.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {galleryList.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveImageIndex(idx)}
              className={`w-20 h-28 shrink-0 bg-[#F6F6F6] border-2 overflow-hidden transition-all rounded-none cursor-pointer ${
                activeImageIndex === idx
                  ? 'border-black ring-1 ring-black'
                  : 'border-zinc-200 opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={getOptimizedImageUrl(img, 160, 70)}
                alt="Thumbnail"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
