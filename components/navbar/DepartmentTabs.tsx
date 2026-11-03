// components/navbar/DepartmentTabs.tsx
'use client';

import React from 'react';
import { GENDER_TABS } from '@/lib/constants/navigation';

interface DepartmentTabsProps {
  selectedCategory: string;
  selectedGender: string;
  onTabClick: (tabValue: string) => void;
  variant?: 'desktop' | 'mobile';
}

export default function DepartmentTabs({
  selectedCategory,
  selectedGender,
  onTabClick,
  variant = 'desktop',
}: DepartmentTabsProps) {
  if (variant === 'mobile') {
    return (
      <div className="sm:hidden border-t border-zinc-100 bg-white overflow-x-auto no-scrollbar px-3 py-1 flex items-center gap-1.5 w-full">
        {GENDER_TABS.map((tab) => {
          const isActive = tab.value === 'sale'
            ? selectedCategory === 'sale'
            : selectedGender === tab.value && selectedCategory !== 'sale';
          const label = tab.label.replace(' 🔥', '');
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onTabClick(tab.value)}
              className={`px-3 py-1 text-[11px] font-bold tracking-wider uppercase transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                isActive
                  ? tab.highlight
                    ? 'bg-[#E60012] text-white font-black'
                    : 'bg-zinc-950 text-white font-black'
                  : tab.highlight
                  ? 'text-[#E60012] bg-red-50 hover:bg-red-100'
                  : 'text-zinc-600 hover:text-zinc-950 bg-zinc-100'
              }`}
            >
              <span>{label}</span>
              {tab.highlight && <span className="ml-1 text-[10px]">🔥</span>}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <nav className="hidden sm:flex items-center gap-0.5 sm:gap-1.5 h-full overflow-x-auto">
      {GENDER_TABS.map((tab) => {
        const isActive = tab.value === 'sale'
          ? selectedCategory === 'sale'
          : selectedGender === tab.value && selectedCategory !== 'sale';
        const label = tab.label.replace(' 🔥', '');
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onTabClick(tab.value)}
            className={`px-2 sm:px-3 h-full text-xs sm:text-[13px] font-bold tracking-wider uppercase transition-all relative flex items-center cursor-pointer shrink-0 whitespace-nowrap ${
              isActive
                ? tab.highlight ? 'text-[#E60012] font-black' : 'text-zinc-950 font-black'
                : tab.highlight ? 'text-[#E60012]/85 hover:text-[#E60012]' : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <span>{label}</span>
            {tab.highlight && <span className="ml-1 text-[11px]">🔥</span>}
            {isActive && (
              <span className={`absolute bottom-0 left-0 right-0 h-[2.5px] ${tab.highlight ? 'bg-[#E60012]' : 'bg-zinc-950'}`} />
            )}
          </button>
        );
      })}
    </nav>
  );
}
