// components/LifeWearStorySection.tsx
'use client';

import React from 'react';
import { Wind, Shield, Layers, ArrowRight, Check } from 'lucide-react';

interface LifeWearStorySectionProps {
  onExploreClick?: () => void;
  onSelectCategory?: (categorySlug: string) => void;
}

export default function LifeWearStorySection({ onExploreClick, onSelectCategory }: LifeWearStorySectionProps) {
  const handleCardClick = (slug: string) => {
    if (onSelectCategory) {
      onSelectCategory(slug);
      const el = document.getElementById('katalog');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (onExploreClick) {
      onExploreClick();
    }
  };
  return (
    <section className="w-full bg-white border-y border-zinc-200 py-12 sm:py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* 1. Left: Large Editorial Lifestyle Photo */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/5] bg-zinc-100 border border-zinc-200 overflow-hidden shadow-xs">
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80"
                alt="Model LifeWear Simple Made Better"
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
              
              {/* Japanese Seal / Watermark Badge */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs p-3 border border-zinc-200 shadow-sm max-w-[200px]">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-3.5 h-3.5 bg-[#E60012] text-white flex items-center justify-center text-[8px] font-black">
                    服
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-zinc-950">
                    LIFEWEAR TEXTILE
                  </span>
                </div>
                <p className="text-[10px] text-zinc-600 font-medium leading-tight">
                  Inovasi serat fungsional dirancang untuk keseharian tropis.
                </p>
              </div>

              {/* Bottom Quote Banner */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 text-white">
                <p className="text-xs font-mono tracking-widest uppercase text-amber-300">
                  FILOSOFI DESAIN
                </p>
                <p className="text-sm sm:text-base font-black uppercase tracking-tight mt-0.5">
                  "Simple Made Better — Keindahan dalam Kesederhanaan."
                </p>
              </div>
            </div>
          </div>

          {/* 2. Right: Fabric Philosophy & Innovation Story */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-red-50 border border-red-200 text-[#E60012] text-[10px] font-black uppercase tracking-widest">
                <span>NARASI TEKNOLOGI TEKSTIL</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-zinc-950 leading-tight">
                Bernapas Bebas di Cuaca Tropis: Kesederhanaan yang Dibuat Lebih Baik
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed pt-1">
                Pakaian bukan sekadar penutup raga, melainkan lapisan kedua yang memberi rasa tenang, kebebasan bergerak, dan kenyamanan sepanjang hari. Setiap serat dipilih melalui uji ketat tekstil presisi.
              </p>
            </div>

            {/* 3 Tech Feature Cards */}
            <div className="space-y-3.5 pt-2">
              
              {/* Feature 1: AIRism */}
              <button
                type="button"
                onClick={() => handleCardClick('kaos')}
                className="w-full text-left p-3.5 sm:p-4 bg-zinc-50 border border-zinc-200 flex items-start gap-3.5 hover:border-zinc-950 hover:bg-zinc-100/50 transition-all cursor-pointer group rounded-none"
              >
                <div className="w-9 h-9 bg-white border border-zinc-300 text-[#E60012] flex items-center justify-center shrink-0 shadow-2xs group-hover:border-zinc-950">
                  <Wind size={18} />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black uppercase tracking-wider text-zinc-950 group-hover:text-[#E60012] transition-colors">
                        AIRism Microfiber Quick-Dry
                      </h4>
                      <span className="text-[9px] font-bold text-[#E60012] bg-red-50 px-1.5 py-0.2 border border-red-200">
                        SEJUK
                      </span>
                    </div>
                    <span className="text-zinc-400 group-hover:text-[#E60012] group-hover:translate-x-0.5 transition-all text-xs font-bold">
                      →
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-600 leading-snug">
                    Serat mikro ultra-tipis yang menyerap keringat dan melepas kelembapan seketika. Terasa sejuk seperti sutra di kulit tanpa lengket.
                  </p>
                </div>
              </button>

              {/* Feature 2: Heavyweight Cotton */}
              <button
                type="button"
                onClick={() => handleCardClick('kaos')}
                className="w-full text-left p-3.5 sm:p-4 bg-zinc-50 border border-zinc-200 flex items-start gap-3.5 hover:border-zinc-950 hover:bg-zinc-100/50 transition-all cursor-pointer group rounded-none"
              >
                <div className="w-9 h-9 bg-white border border-zinc-300 text-zinc-900 flex items-center justify-center shrink-0 shadow-2xs group-hover:border-zinc-950">
                  <Shield size={18} />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black uppercase tracking-wider text-zinc-950 group-hover:text-[#E60012] transition-colors">
                        Heavyweight Cotton 280 GSM
                      </h4>
                      <span className="text-[9px] font-bold text-zinc-800 bg-zinc-200 px-1.5 py-0.2">
                        KOKOH
                      </span>
                    </div>
                    <span className="text-zinc-400 group-hover:text-[#E60012] group-hover:translate-x-0.5 transition-all text-xs font-bold">
                      →
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-600 leading-snug">
                    Katun murni berdensitas tinggi dengan siluet boxy modern. Tidak menerawang, anti melar di leher, dan tahan puluhan kali pencucian mesin.
                  </p>
                </div>
              </button>

              {/* Feature 3: Double-Brushed Flannel */}
              <button
                type="button"
                onClick={() => handleCardClick('kemeja')}
                className="w-full text-left p-3.5 sm:p-4 bg-zinc-50 border border-zinc-200 flex items-start gap-3.5 hover:border-zinc-950 hover:bg-zinc-100/50 transition-all cursor-pointer group rounded-none"
              >
                <div className="w-9 h-9 bg-white border border-zinc-300 text-zinc-900 flex items-center justify-center shrink-0 shadow-2xs group-hover:border-zinc-950">
                  <Layers size={18} />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black uppercase tracking-wider text-zinc-950 group-hover:text-[#E60012] transition-colors">
                        Double-Brushed Soft Flannel
                      </h4>
                      <span className="text-[9px] font-bold text-zinc-800 bg-zinc-200 px-1.5 py-0.2">
                        LEMBUT
                      </span>
                    </div>
                    <span className="text-zinc-400 group-hover:text-[#E60012] group-hover:translate-x-0.5 transition-all text-xs font-bold">
                      →
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-600 leading-snug">
                    Proses penyikatan ganda pada kedua sisi permukaan kain menghasilkan kelembutan beludru katun alami tanpa menimbulkan rasa gatal.
                  </p>
                </div>
              </button>

            </div>

            {/* Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onExploreClick}
                className="px-6 py-3 bg-[#111111] hover:bg-[#E60012] text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 shadow-xs rounded-none"
              >
                <span>Jelajahi Inovasi Kain Katalog</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
