// components/home/FilterSortBar.tsx
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown, Filter, X, LayoutGrid, Columns } from 'lucide-react';

interface QuickCategory {
  id: string;
  name: string;
  slug: string;
}

const QUICK_CATEGORIES: QuickCategory[] = [
  { id: 'all', name: 'Semua', slug: 'all' },
  { id: 'kaos', name: 'Kaos', slug: 'kaos' },
  { id: 'kemeja', name: 'Kemeja', slug: 'kemeja' },
  { id: 'polo', name: 'Polo', slug: 'polo' },
  { id: 'jaket', name: 'Jaket', slug: 'jaket' },
  { id: 'hoodie', name: 'Hoodie & Sweater', slug: 'hoodie' },
  { id: 'celana-panjang', name: 'Celana Panjang', slug: 'celana-panjang' },
  { id: 'celana-pendek', name: 'Celana Pendek', slug: 'celana-pendek' },
  { id: 'sale', name: 'Promo 🔥', slug: 'sale' },
];

interface FilterSortBarProps {
  totalCount: number;
  inStockOnly: boolean;
  onToggleInStock: (val: boolean) => void;
  sortBy: string;
  onSortChange: (val: string) => void;
  selectedGender: string;
  onClearGender: () => void;
  selectedCategory: string;
  categoryDisplayName: string;
  onClearCategory: () => void;
  onSelectCategory?: (slug: string) => void;
  searchQuery: string;
  onClearSearch: () => void;
  onResetAllFilters: () => void;
  gridDensity?: 'compact' | 'editorial';
  onToggleGridDensity?: (density: 'compact' | 'editorial') => void;
}

export default function FilterSortBar({
  totalCount,
  inStockOnly,
  onToggleInStock,
  sortBy,
  onSortChange,
  selectedGender,
  onClearGender,
  selectedCategory,
  categoryDisplayName,
  onClearCategory,
  onSelectCategory,
  searchQuery,
  onClearSearch,
  onResetAllFilters,
  gridDensity = 'compact',
  onToggleGridDensity,
}: FilterSortBarProps) {
  const hasActiveFilters = Boolean(
    selectedGender !== 'all' || selectedCategory !== 'all' || inStockOnly || searchQuery
  );

  return (
    <div className="space-y-3.5">
      {/* 1. Quick Category Strip (Instant 1-Tap Switching) */}
      {onSelectCategory && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {QUICK_CATEGORIES.map((q) => {
            const isActive = selectedCategory === q.slug;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => onSelectCategory(q.slug)}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all rounded-none cursor-pointer shrink-0 border ${
                  isActive
                    ? 'bg-zinc-950 text-white border-zinc-950 shadow-2xs'
                    : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                }`}
              >
                {q.name}
              </button>
            );
          })}
        </div>
      )}

      {/* 2. Main Controls Bar: Counts, In-Stock, Sort, and Grid Density */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full border-t border-zinc-200 pt-3">
        <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
          Menampilkan <strong className="text-zinc-950 font-mono font-bold">{totalCount}</strong> Produk LifeWear
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* In-Stock Toggle */}
          <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 uppercase tracking-wider cursor-pointer select-none border border-zinc-200 px-3 py-2 bg-zinc-50 hover:bg-zinc-100 rounded-none transition-colors">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => onToggleInStock(e.target.checked)}
              className="rounded-none text-[#E60012] focus:ring-0 w-3.5 h-3.5 cursor-pointer"
            />
            <span className="hidden sm:inline">Hanya Ready Stock</span>
            <span className="sm:hidden">Ready</span>
          </label>

          {/* Sort Dropdown */}
          <div className="flex items-center border border-zinc-300 bg-white px-3 py-2 text-xs rounded-none">
            <ArrowUpDown size={13} className="text-zinc-500 mr-2 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-transparent font-bold text-zinc-900 uppercase focus:outline-none cursor-pointer rounded-none"
            >
              <option value="featured">Rekomendasi (Featured)</option>
              <option value="popular">Paling Populer (Rating)</option>
              <option value="price-asc">Harga: Rendah ke Tinggi</option>
              <option value="price-desc">Harga: Tinggi ke Rendah</option>
              <option value="newest">Koleksi Terbaru</option>
            </select>
          </div>

          {/* Grid View Switcher (Desktop 4-Col vs 2-Col Editorial) */}
          {onToggleGridDensity && (
            <div className="hidden sm:flex items-center border border-zinc-300 bg-white p-0.5 rounded-none">
              <button
                type="button"
                onClick={() => onToggleGridDensity('compact')}
                className={`p-1.5 transition-colors cursor-pointer ${
                  gridDensity === 'compact' ? 'bg-zinc-950 text-white' : 'text-zinc-500 hover:text-zinc-950'
                }`}
                title="Tampilan Grid 4 Kolom"
                aria-label="Tampilan 4 Kolom"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                type="button"
                onClick={() => onToggleGridDensity('editorial')}
                className={`p-1.5 transition-colors cursor-pointer ${
                  gridDensity === 'editorial' ? 'bg-zinc-950 text-white' : 'text-zinc-500 hover:text-zinc-950'
                }`}
                title="Tampilan Editorial 2 Kolom Lebar"
                aria-label="Tampilan 2 Kolom"
              >
                <Columns size={15} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Lower Bar: Active Filter Badges */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 bg-zinc-50 border border-zinc-200 flex flex-wrap items-center justify-between gap-2 text-xs overflow-hidden"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mr-1 flex items-center gap-1">
                <Filter size={12} />
                <span>Filter Aktif:</span>
              </span>

              {selectedGender !== 'all' && (
                <button
                  type="button"
                  onClick={onClearGender}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-300 text-[11px] font-bold uppercase tracking-wider transition-colors rounded-none cursor-pointer group shadow-2xs"
                >
                  <span>Gender: {selectedGender === 'pria' ? 'Pria' : 'Wanita'}</span>
                  <X size={12} className="text-zinc-400 group-hover:text-[#E60012]" />
                </button>
              )}

              {selectedCategory !== 'all' && (
                <button
                  type="button"
                  onClick={onClearCategory}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-300 text-[11px] font-bold uppercase tracking-wider transition-colors rounded-none cursor-pointer group shadow-2xs"
                >
                  <span>Kategori: {categoryDisplayName}</span>
                  <X size={12} className="text-zinc-400 group-hover:text-[#E60012]" />
                </button>
              )}

              {inStockOnly && (
                <button
                  type="button"
                  onClick={() => onToggleInStock(false)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-300 text-[11px] font-bold uppercase tracking-wider transition-colors rounded-none cursor-pointer group shadow-2xs"
                >
                  <span>Hanya Ready Stock</span>
                  <X size={12} className="text-zinc-400 group-hover:text-[#E60012]" />
                </button>
              )}

              {searchQuery && (
                <button
                  type="button"
                  onClick={onClearSearch}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-300 text-[11px] font-bold uppercase tracking-wider transition-colors rounded-none cursor-pointer group shadow-2xs"
                >
                  <span>Cari: "{searchQuery}"</span>
                  <X size={12} className="text-zinc-400 group-hover:text-[#E60012]" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onResetAllFilters}
              className="text-[11px] font-bold text-[#E60012] hover:underline uppercase tracking-wider cursor-pointer ml-auto"
            >
              Reset Semua Filter ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
