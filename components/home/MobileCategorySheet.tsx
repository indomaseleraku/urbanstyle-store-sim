// components/home/MobileCategorySheet.tsx
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';

interface MobileCategorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGender: string;
  onSelectGender: (g: string) => void;
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  onReset: () => void;
}

const CATEGORY_ITEMS = [
  { name: 'Semua Koleksi Busana', slug: 'all', desc: 'Tampilkan seluruh ragam katalog pakaian LifeWear' },
  { name: 'Kemeja & Flannel', slug: 'kemeja', desc: 'Katun halus double-brushed, overshirt, & kasual' },
  { name: 'Kaos & AIRism', slug: 'kaos', desc: 'Katun heavyweight 280 GSM & serat sejuk bernapas' },
  { name: 'Celana Chino & Ankle', slug: 'celana', desc: 'Ultra Stretch fleksibel & siluet santai harian' },
  { name: 'Jaket & Outerwear', slug: 'jaket', desc: 'Parka proteksi UV saku lipat & French Terry Hoodie' },
  { name: 'Limited Offer 🔥', slug: 'sale', desc: 'Penawaran potongan harga khusus minggu ini' },
];

export default function MobileCategorySheet({
  isOpen,
  onClose,
  selectedGender,
  onSelectGender,
  selectedCategory,
  onSelectCategory,
  onReset,
}: MobileCategorySheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Slide-Up Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 bg-white border-t border-zinc-300 shadow-2xl max-h-[85vh] flex flex-col rounded-none z-10"
          >
            {/* Header */}
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#E60012] text-white flex items-center justify-center font-black text-xs">
                  US
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                    Pilih Kategori Busana
                  </h3>
                  <span className="text-[9px] text-zinc-400 font-mono tracking-widest uppercase">
                    KATALOG RESMI LIFEWEAR
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer"
                aria-label="Tutup menu kategori"
              >
                <X size={20} />
              </button>
            </div>

            {/* Gender Toggle Segment */}
            <div className="p-3 border-b border-zinc-200 bg-zinc-100/70">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                Target Gender:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: 'SEMUA', val: 'all' },
                  { label: 'PRIA', val: 'pria' },
                  { label: 'WANITA', val: 'wanita' },
                ].map((g) => (
                  <button
                    key={g.val}
                    type="button"
                    onClick={() => onSelectGender(g.val)}
                    className={`py-2 text-[11px] font-black uppercase tracking-wider text-center transition-colors rounded-none border cursor-pointer ${
                      selectedGender === g.val
                        ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs'
                        : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-500'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Buttons List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                Kategori Busana:
              </span>
              {CATEGORY_ITEMS.map((c) => {
                const isSelected = selectedCategory === c.slug;
                return (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => onSelectCategory(c.slug)}
                    className={`w-full text-left p-3 border transition-colors flex items-center justify-between rounded-none cursor-pointer ${
                      isSelected
                        ? 'border-zinc-950 bg-zinc-50 ring-1 ring-zinc-950'
                        : 'border-zinc-200 hover:border-zinc-400 bg-white'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-black uppercase tracking-tight ${
                            c.slug === 'sale' ? 'text-[#E60012]' : 'text-zinc-950'
                          }`}
                        >
                          {c.name}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] bg-zinc-950 text-white font-mono uppercase px-1.5 py-0.2">
                            AKTIF
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-500 font-medium">{c.desc}</p>
                    </div>
                    <ArrowRight size={14} className="text-zinc-400 shrink-0" />
                  </button>
                );
              })}
            </div>

            {/* Quick Actions Footer */}
            <div className="p-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={onReset}
                className="text-[11px] font-bold text-zinc-600 hover:text-[#E60012] uppercase tracking-wider cursor-pointer"
              >
                Reset Filter
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-zinc-950 text-white text-[11px] font-bold uppercase tracking-wider rounded-none cursor-pointer"
              >
                Lihat Hasil Katalog →
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
