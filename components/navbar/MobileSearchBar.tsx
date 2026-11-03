// components/navbar/MobileSearchBar.tsx
'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { POPULAR_KEYWORDS } from '@/lib/constants/navigation';

interface MobileSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClose: () => void;
}

export default function MobileSearchBar({
  searchQuery,
  onSearchChange,
  onClose,
}: MobileSearchBarProps) {
  return (
    <div className="p-4 bg-zinc-100 border-t border-zinc-200 xl:hidden space-y-3 animate-in slide-in-from-top-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
        <input
          type="text"
          autoFocus
          placeholder="Cari pakaian (misal: Flannel, AIRism, Chino)..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-9 py-2.5 text-base md:text-xs border border-zinc-300 bg-white focus:outline-none focus:border-zinc-950 rounded-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
            title="Hapus teks"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <span className="font-bold text-zinc-400 uppercase tracking-wider shrink-0">Tren:</span>
        {POPULAR_KEYWORDS.map((kw) => (
          <button
            key={kw}
            type="button"
            onClick={() => {
              onSearchChange(kw);
              onClose();
            }}
            className="px-2 py-1 bg-white border border-zinc-300 text-zinc-700 hover:border-zinc-950 shrink-0 text-xs cursor-pointer"
          >
            {kw}
          </button>
        ))}
      </div>
    </div>
  );
}
