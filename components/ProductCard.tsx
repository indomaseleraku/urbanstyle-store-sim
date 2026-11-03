// components/ProductCard.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Product } from '@/lib/types';
import { getOptimizedImageUrl } from '@/lib/utils';
import { Heart, Star, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenDetail?: (product: Product) => void;
  onAddToCart?: (product: Product, size: string, colorName: string) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
}

export default function ProductCard({
  product,
  onOpenDetail,
  isWishlisted,
  onToggleWishlist,
}: ProductCardProps) {
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  const currentColor = product.colors[selectedColorIndex] || {
    name: 'Standard',
    code: '09 BLACK',
    hex: '#000000',
    image_url: product.image_url,
  };

  const secondaryImage = product.gallery_images && product.gallery_images.length > 1
    ? product.gallery_images[1]
    : currentColor.image_url;

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onToggleWishlist(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onOpenDetail) onOpenDetail(product);
  };

  const hasDiscount = Boolean(product.original_price && product.original_price > product.price);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="group border-none bg-transparent rounded-none flex flex-col relative select-none"
    >
      {/* 1. FRAME FOTO VERTIKAL 3:4 DUAL-IMAGE CROSSFADE */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F6F6F6] rounded-none">
        <Link href={`/product/${product.id}`} className="block w-full h-full relative">
          <img
            src={getOptimizedImageUrl(currentColor.image_url, 450, 75)}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-opacity duration-500 ease-out group-hover:opacity-0"
            loading="lazy"
          />
          <img
            src={getOptimizedImageUrl(secondaryImage, 450, 75)}
            alt={`${product.name} alternate view`}
            className="w-full h-full object-cover object-center absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
            loading="lazy"
          />
        </Link>

        {/* Pojok Kiri Atas: Badge Tipis Uniqlo */}
        {hasDiscount ? (
          <div className="absolute top-2 left-2 z-10 pointer-events-none">
            <span className="bg-[#E60012] text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-none shadow-xs">
              LIMITED OFFER
            </span>
          </div>
        ) : product.is_new ? (
          <div className="absolute top-2 left-2 z-10 pointer-events-none">
            <span className="bg-[#111111] text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-none shadow-xs">
              NEW
            </span>
          </div>
        ) : null}

        {/* Pojok Kanan Atas: Tombol Wishlist Taktil */}
        <div className="absolute top-2 right-2 z-10">
          <motion.button
            whileTap={{ scale: 0.82 }}
            whileHover={{ scale: 1.08 }}
            transition={{ type: 'spring', stiffness: 450, damping: 16 }}
            type="button"
            onClick={handleWishlist}
            className={`p-1.5 rounded-none transition-colors duration-200 cursor-pointer ${
              isWishlisted
                ? 'text-[#E60012] bg-white/90 shadow-xs'
                : 'text-zinc-500 hover:text-[#E60012] bg-white/60 hover:bg-white/90'
            }`}
            title={isWishlisted ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
            aria-label="Wishlist"
          >
            <Heart size={17} strokeWidth={1.5} fill={isWishlisted ? '#E60012' : 'none'} />
          </motion.button>
        </div>

        {/* Hover Quick View Slide-Up */}
        {onOpenDetail && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={handleQuickView}
            className="absolute inset-x-0 bottom-0 py-2.5 bg-black/75 hover:bg-black/90 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-1.5 z-10 cursor-pointer"
          >
            <Eye size={13} />
            <span>Lihat Cepat (Quick View)</span>
          </motion.button>
        )}
      </div>

      {/* 2. BLOK INFORMASI AIRY & CLEAN */}
      <div className="pt-2.5 space-y-1.5 flex flex-col">
        {/* Baris 1: Color Swatches Bar */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              {product.colors.map((c, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setSelectedColorIndex(idx);
                  }}
                  className="p-0.5 transition-all flex items-center justify-center cursor-pointer"
                  title={`Warna: ${c.code || c.name}`}
                  aria-label={c.code || c.name}
                >
                  <span
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border transition-all block ${
                      selectedColorIndex === idx
                        ? 'ring-1 ring-zinc-950 ring-offset-1 scale-105 border-zinc-400'
                        : 'border-zinc-300 opacity-80 hover:opacity-100 hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                </button>
              ))}
            </div>
            <span className="text-[10px] text-zinc-400 font-mono shrink-0">
              {product.colors.length} Warna
            </span>
          </div>
        )}

        {/* Baris 2: Sub-Kategori Mikro */}
        <div className="text-zinc-500 text-[11px] font-medium uppercase tracking-wider truncate">
          {product.gender ? product.gender.toUpperCase() : 'UNISEX'}
          {product.category_name ? ` • ${product.category_name}` : ''}
        </div>

        {/* Baris 3: Judul Produk */}
        <Link href={`/product/${product.id}`} className="block">
          <h3 className="font-medium text-xs sm:text-[13px] text-zinc-950 line-clamp-2 leading-snug group-hover:text-[#E60012] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Baris 4: Blok Harga Tabular Uniqlo */}
        <div className="flex items-baseline gap-1.5 flex-wrap pt-0.5">
          {hasDiscount ? (
            <>
              <span className="text-[#E60012] font-mono font-bold text-sm sm:text-base tabular-nums">
                Rp {product.price.toLocaleString('id-ID')}
              </span>
              <span className="text-zinc-400 line-through text-xs font-mono tabular-nums">
                Rp {product.original_price?.toLocaleString('id-ID')}
              </span>
            </>
          ) : (
            <span className="text-zinc-950 font-mono font-bold text-sm sm:text-base tabular-nums">
              Rp {product.price.toLocaleString('id-ID')}
            </span>
          )}
        </div>

        {/* Baris 5: Rating Bintang */}
        <div className="flex items-center gap-1 text-[11px] text-zinc-400 pt-0.5">
          <Star size={10} className="fill-amber-400 text-amber-400 shrink-0" />
          <span className="font-medium text-zinc-700 font-mono tabular-nums">
            {(product.rating || 4.8).toFixed(1)}
          </span>
          <span className="text-zinc-400 font-mono tabular-nums">
            ({product.reviews_count || 12})
          </span>
        </div>
      </div>
    </motion.div>
  );
}
