// components/home/ProductGrid.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/lib/types';

interface ProductGridProps {
  products: Product[];
  visibleCount: number;
  isLoading: boolean;
  wishlist: Product[];
  onOpenDetail: (product: Product) => void;
  onAddToCart: (product: Product, size: string, color: string) => void;
  onToggleWishlist: (product: Product) => void;
  onLoadMore: () => void;
  onResetFilters: () => void;
  gridDensity?: 'compact' | 'editorial';
}

export default function ProductGrid({
  products,
  visibleCount,
  isLoading,
  wishlist,
  onOpenDetail,
  onAddToCart,
  onToggleWishlist,
  onLoadMore,
  onResetFilters,
  gridDensity = 'compact',
}: ProductGridProps) {
  const isEditorial = gridDensity === 'editorial';
  const gridClasses = isEditorial
    ? 'grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-10 sm:gap-x-8 sm:gap-y-14 max-w-4xl mx-auto'
    : 'grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12 md:grid-cols-3 lg:grid-cols-4';

  // 1. Shimmer Skeleton State (Uniqlo 1:1 3:4 Proportions)
  if (isLoading) {
    return (
      <div className={`${gridClasses} py-8`}>
        {[...Array(isEditorial ? 4 : 8)].map((_, i) => (
          <div key={i} className="flex flex-col space-y-3">
            <div className="aspect-[3/4] w-full animate-shimmer border border-zinc-100" />
            <div className="space-y-1.5 pt-1">
              <div className="flex gap-1">
                <div className="w-3.5 h-3.5 rounded-full animate-shimmer" />
                <div className="w-3.5 h-3.5 rounded-full animate-shimmer" />
                <div className="w-3.5 h-3.5 rounded-full animate-shimmer" />
              </div>
              <div className="h-2.5 w-1/3 animate-shimmer" />
              <div className="h-3.5 w-4/5 animate-shimmer" />
              <div className="h-4 w-1/2 animate-shimmer" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 2. Empty State
  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-20 text-center space-y-4 max-w-md mx-auto"
      >
        <div className="w-16 h-16 bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
          <SlidersHorizontal size={28} />
        </div>
        <h3 className="text-base font-black uppercase tracking-wider text-zinc-900">
          Tidak Ada Produk yang Sesuai
        </h3>
        <p className="text-xs text-zinc-500">
          Coba sesuaikan filter kategori, ubah kata kunci pencarian, atau matikan filter stok.
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="px-6 py-2.5 bg-zinc-900 hover:bg-[#E60012] text-white text-xs font-bold uppercase tracking-wider transition-colors rounded-none cursor-pointer"
        >
          Tampilkan Semua Koleksi
        </button>
      </motion.div>
    );
  }

  // 3. Grid List & Pagination
  const visibleProducts = products.slice(0, visibleCount);
  const remainingCount = products.length - visibleCount;

  return (
    <div className="space-y-10">
      <div className={gridClasses}>
        {visibleProducts.map((prod) => (
          <ProductCard
            key={prod.id}
            product={prod}
            onOpenDetail={onOpenDetail}
            onAddToCart={(p, size, color) => onAddToCart(p, size, color)}
            isWishlisted={wishlist.some((w) => w.id === prod.id)}
            onToggleWishlist={onToggleWishlist}
          />
        ))}
      </div>

      {/* Pagination Action (+ Tampilkan Koleksi Lainnya) */}
      {visibleCount < products.length && (
        <div className="pt-4 text-center space-y-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onLoadMore}
            className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-zinc-950 text-zinc-950 hover:text-white border-2 border-zinc-950 text-xs font-black uppercase tracking-widest transition-all rounded-none cursor-pointer shadow-xs inline-flex items-center justify-center gap-2 group"
          >
            <span>+ Tampilkan Koleksi Lainnya</span>
            <span className="text-[10px] text-zinc-400 group-hover:text-zinc-300 font-mono">
              ({remainingCount} Produk Tersisa)
            </span>
          </motion.button>
          <p className="text-[11px] text-zinc-400 font-medium">
            Menampilkan <strong className="text-zinc-900 font-mono">{visibleProducts.length}</strong> dari{' '}
            <strong className="text-zinc-900 font-mono">{products.length}</strong> produk LifeWear
          </p>
        </div>
      )}
    </div>
  );
}
