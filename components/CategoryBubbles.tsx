// components/CategoryBubbles.tsx
'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface CategoryTile {
  id: string;
  name: string;
  tagline: string;
  slug: string;
  imageUrl: string;
  isSpecial?: boolean;
}

const CATEGORY_TILES: CategoryTile[] = [
  {
    id: 'kaos',
    name: 'Kaos',
    tagline: 'Boxy 280 GSM',
    slug: 'kaos',
    imageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'kemeja',
    name: 'Kemeja',
    tagline: 'Flannel & Oxford',
    slug: 'kemeja',
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'polo',
    name: 'Polo Shirt',
    tagline: 'Kerah Rajut',
    slug: 'polo',
    imageUrl: 'https://images.unsplash.com/photo-1625910513413-7fc2a8536b3f?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'jaket',
    name: 'Jaket',
    tagline: 'Parka & Luaran',
    slug: 'jaket',
    imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'hoodie',
    name: 'Hoodie & Sweater',
    tagline: 'French Terry & Rajut',
    slug: 'hoodie',
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'celana-panjang',
    name: 'Celana Panjang',
    tagline: 'Chino & Ankle',
    slug: 'celana-panjang',
    imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'celana-pendek',
    name: 'Celana Pendek',
    tagline: 'Shorts Santai',
    slug: 'celana-pendek',
    imageUrl: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'sale',
    name: 'Promo 🔥',
    tagline: 'Hemat s/d 30%',
    slug: 'sale',
    imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=400&q=80',
    isSpecial: true,
  },
];

interface CategoryBubblesProps {
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  onScrollToCatalog?: () => void;
}

export default function CategoryBubbles({
  selectedCategory,
  onSelectCategory,
  onScrollToCatalog,
}: CategoryBubblesProps) {
  const handleClick = (slug: string) => {
    onSelectCategory(slug);
    if (onScrollToCatalog) {
      onScrollToCatalog();
    }
  };

  return (
    <section className="w-full bg-[#FAFAFA] border-b border-zinc-200 py-6 sm:py-8 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#E60012]" />
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-950">
              Kategori Busana Pilihan
            </h3>
            <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">
              • KOLEKSI HARIAN
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest hidden sm:inline">
            Pilih kategori untuk melihat koleksi
          </span>
        </div>

        {/* Circular Story Bubbles Container (Swipeable on Mobile, Centered on Desktop) */}
        <div className="flex items-center justify-start lg:justify-center gap-4 sm:gap-6 md:gap-7 overflow-x-auto no-scrollbar py-2 px-2 -mx-4 sm:mx-0 snap-x">
          {CATEGORY_TILES.map((cat) => {
            const isActive = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleClick(cat.slug)}
                className="group flex-shrink-0 flex flex-col items-center focus:outline-none snap-start cursor-pointer transition-transform"
              >
                {/* 1:1 Circular Avatar with Thin Border / Red Ring */}
                <div
                  className={`relative w-18 h-18 sm:w-22 sm:h-22 md:w-24 md:h-24 rounded-full p-1 border-2 transition-all duration-300 ${
                    isActive
                      ? 'border-[#E60012] ring-4 ring-[#E60012]/20 scale-105 shadow-md'
                      : cat.isSpecial
                      ? 'border-red-400 hover:border-[#E60012] hover:scale-105'
                      : 'border-zinc-200 hover:border-zinc-950 hover:scale-105'
                  }`}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-zinc-100">
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>

                  {cat.isSpecial && (
                    <span className="absolute -top-1 -right-1 bg-[#E60012] text-white text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full shadow-xs">
                      HOT
                    </span>
                  )}
                </div>

                {/* Text Label Below Circle */}
                <div className="text-center mt-2.5 max-w-[95px] sm:max-w-[115px] px-0.5">
                  <h4
                    className={`text-[11px] sm:text-xs font-black uppercase tracking-tight leading-tight transition-colors ${
                      isActive
                        ? 'text-[#E60012]'
                        : 'text-zinc-900 group-hover:text-[#E60012]'
                    }`}
                  >
                    {cat.name}
                  </h4>
                  <p className="text-[10px] text-zinc-500 font-medium truncate mt-0.5">
                    {cat.tagline}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
}
