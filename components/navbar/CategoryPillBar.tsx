// components/navbar/CategoryPillBar.tsx
'use client';

import React from 'react';

interface CategoryPillBarProps {
  selectedGender: string;
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  isScrolled: boolean;
}

interface CategoryPillItem {
  name: string;
  slug: string;
}

export default function CategoryPillBar({
  selectedGender,
  selectedCategory,
  onSelectCategory,
  isScrolled,
}: CategoryPillBarProps) {
  const getPills = (): CategoryPillItem[] => {
    if (selectedGender === 'pria') {
      return [
        { name: 'Semua Pria', slug: 'all' },
        { name: 'Kemeja & Flannel', slug: 'kemeja' },
        { name: 'Kaos & AIRism', slug: 'kaos' },
        { name: 'Celana Chino & Ankle', slug: 'celana' },
        { name: 'Jaket & Outerwear', slug: 'jaket' },
        { name: 'Limited Offer 🔥', slug: 'sale' },
      ];
    }
    if (selectedGender === 'wanita') {
      return [
        { name: 'Semua Wanita', slug: 'all' },
        { name: 'Kemeja & Blus', slug: 'kemeja' },
        { name: 'Kaos & AIRism', slug: 'kaos' },
        { name: 'Celana & Bawahan', slug: 'celana' },
        { name: 'Jaket & Outerwear', slug: 'jaket' },
        { name: 'Limited Offer 🔥', slug: 'sale' },
      ];
    }
    return [
      { name: 'Semua Koleksi', slug: 'all' },
      { name: 'Kemeja & Flannel', slug: 'kemeja' },
      { name: 'Kaos & AIRism', slug: 'kaos' },
      { name: 'Celana Chino & Ankle', slug: 'celana' },
      { name: 'Jaket & Outerwear', slug: 'jaket' },
      { name: 'Limited Offer 🔥', slug: 'sale' },
    ];
  };

  const pills = getPills();

  const handlePillClick = (slug: string) => {
    onSelectCategory(slug);
    if (slug === 'sale') {
      const el = document.getElementById('limited-offer') || document.getElementById('katalog');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      const el = document.getElementById('katalog');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      className={`w-full transition-all border-t ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-zinc-200 shadow-xs'
          : selectedGender !== 'all'
            ? 'bg-zinc-950/90 backdrop-blur-md border-white/10'
            : 'hidden'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center overflow-x-auto no-scrollbar gap-2 py-2">
          {pills.map((pill) => {
            const isActive = selectedCategory === pill.slug;
            return (
              <button
                key={pill.slug}
                type="button"
                onClick={() => handlePillClick(pill.slug)}
                className={`whitespace-nowrap px-3.5 py-1 text-xs font-bold uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-zinc-950 text-white'
                    : isScrolled
                      ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                      : 'bg-white/15 hover:bg-white/25 text-white'
                }`}
              >
                {pill.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
