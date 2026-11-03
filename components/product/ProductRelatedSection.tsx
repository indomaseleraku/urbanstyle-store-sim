'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { Sparkles } from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/utils';

interface ProductRelatedSectionProps {
  relatedProducts: Product[];
}

export const ProductRelatedSection: React.FC<ProductRelatedSectionProps> = ({ relatedProducts }) => {
  if (relatedProducts.length === 0) return null;

  return (
    <section className="mt-14 pt-10 border-t border-zinc-200 space-y-6">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#E60012] text-white text-[9px] font-black uppercase tracking-widest rounded-none">
          <Sparkles size={11} />
          <span>STYLEHINT</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-950">
          Inspirasi Padu Padan Gaya LifeWear
        </h2>
        <p className="text-xs text-zinc-500">
          Koleksi busana pelengkap yang direkomendasikan untuk kombinasi outfit sehari-hari ini.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
        {relatedProducts.map((rel) => (
          <Link
            key={rel.id}
            href={`/product/${rel.id}`}
            className="group block bg-white border border-zinc-200 hover:border-zinc-950 transition-all rounded-none"
          >
            <div className="aspect-[3/4] overflow-hidden bg-[#F6F6F6] relative">
              <img
                src={getOptimizedImageUrl(rel.image_url, 400, 75)}
                alt={rel.name}
                className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-300"
                loading="lazy"
              />
              {rel.original_price && rel.original_price > rel.price && (
                <span className="absolute top-2 left-2 bg-[#E60012] text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-none">
                  LIMITED
                </span>
              )}
            </div>
            <div className="p-3 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                {rel.category_name}
              </p>
              <h4 className="text-xs font-bold uppercase text-zinc-900 line-clamp-1 group-hover:text-[#E60012] transition-colors leading-tight">
                {rel.name}
              </h4>
              <div className="flex items-baseline gap-1.5 pt-0.5">
                <span className="text-xs font-mono font-black text-zinc-950">
                  Rp {rel.price.toLocaleString('id-ID')}
                </span>
                {rel.original_price && rel.original_price > rel.price && (
                  <span className="text-[10px] font-mono text-zinc-400 line-through">
                    Rp {rel.original_price.toLocaleString('id-ID')}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
