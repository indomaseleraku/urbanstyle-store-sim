// components/LookbookSlider.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/utils';

interface Slide {
  id: number;
  tag: string;
  title: string;
  subtitle: string;
  categorySlug: string;
  bgImage: string;
  ctaText: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    tag: 'AUTUMN / WINTER 2026 • LIFEWEAR DROP',
    title: 'Modern Utility Essentials',
    subtitle: 'Kemeja Flannel Double-Brushed & Celana Ankle Ultra Stretch untuk gaya hidup dinamis kampus dan kerja.',
    categorySlug: 'kemeja',
    bgImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1280&q=75&fm=webp',
    ctaText: 'Lihat Koleksi Kemeja',
  },
  {
    id: 2,
    tag: 'INOVASI TEKNOLOGI TEKSTIL',
    title: 'AIRism & Heavyweight Cotton',
    subtitle: 'Siluet Boxy 280 GSM tebal tahan kusut dan polo berpori sejuk yang siap menemani cuaca tropis sepanjang hari.',
    categorySlug: 'kaos',
    bgImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1280&q=75&fm=webp',
    ctaText: 'Belanja Kaos & AIRism',
  },
  {
    id: 3,
    tag: 'PERLINDUNGAN CUACA RINGAN',
    title: 'Ultra-Light Outerwear Series',
    subtitle: 'Jaket Parka Proteksi UV UPF 40+ saku lipat dan French Terry Hoodie katun murni untuk kenyamanan tanpa batas.',
    categorySlug: 'jaket',
    bgImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1280&q=75&fm=webp',
    ctaText: 'Eksplorasi Outerwear',
  },
];

interface LookbookSliderProps {
  onSelectCategory: (slug: string) => void;
}

export default function LookbookSlider({ onSelectCategory }: LookbookSliderProps) {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[currentIdx];

  return (
    <section className="relative bg-zinc-950 text-white overflow-hidden border-b border-zinc-200">
      
      {/* Background Image Container */}
      <div className="relative h-[460px] sm:h-[520px] lg:h-[560px] w-full">
        {SLIDES.map((s, idx) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentIdx ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={getOptimizedImageUrl(s.bgImage, 1280, 75)}
              alt={s.title}
              className="w-full h-full object-cover object-center"
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
            {/* Subtle editorial scrim for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent pointer-events-none" />
          </div>
        ))}

        {/* Content Container (Vertically centered) */}
        <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center py-12">
          <div className="max-w-xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500" key={currentIdx}>
            
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#E60012] text-white text-[10px] font-black uppercase tracking-widest">
              <Sparkles size={12} />
              <span>{slide.tag}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
              {slide.title}
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-zinc-300 font-medium leading-relaxed">
              {slide.subtitle}
            </p>

            {/* CTA Button */}
            <div className="pt-2">
              <button
                onClick={() => onSelectCategory(slide.categorySlug)}
                className="inline-flex items-center gap-2.5 px-6 py-3 bg-white text-zinc-950 hover:bg-[#E60012] hover:text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg group"
              >
                <span>{slide.ctaText}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>
        </div>

        {/* Navigation Arrow Controls */}
        <button
          onClick={() => setCurrentIdx((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/80 text-white flex items-center justify-center transition-colors border border-white/20"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={() => setCurrentIdx((prev) => (prev + 1) % SLIDES.length)}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/80 text-white flex items-center justify-center transition-colors border border-white/20"
          aria-label="Next slide"
        >
          <ChevronRight size={20} />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              className={`h-1 transition-all ${
                idx === currentIdx ? 'w-8 bg-[#E60012]' : 'w-3 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>

    </section>
  );
}
