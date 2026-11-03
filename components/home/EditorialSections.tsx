// components/home/EditorialSections.tsx
'use client';

import { Sparkles, ArrowRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/lib/types';
import { STYLE_HINT_LOOKS } from '@/lib/constants/editorial';

interface EditorialSectionsProps {
  limitedOfferProducts: Product[];
  bestOfLifeWearProducts: Product[];
  wishlist: Product[];
  onOpenDetail: (p: Product) => void;
  onAddToCart: (p: Product, size: string, color: string) => void;
  onToggleWishlist: (p: Product) => void;
  onSelectCategory: (slug: string) => void;
  onSortPopular: () => void;
}

export default function EditorialSections({
  limitedOfferProducts,
  bestOfLifeWearProducts,
  wishlist,
  onOpenDetail,
  onAddToCart,
  onToggleWishlist,
  onSelectCategory,
  onSortPopular,
}: EditorialSectionsProps) {
  return (
    <>
      {/* 1. Curated Section 1: LIMITED OFFER 🔥 */}
      {limitedOfferProducts.length > 0 && (
        <section id="limited-offer" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 border-b border-zinc-200">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#E60012] text-white text-[9px] font-black uppercase tracking-widest mb-1.5">
                <Sparkles size={11} />
                <span>PENAWARAN TERBATAS MINGGU INI</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-950 flex items-center gap-2">
                <span>LIMITED OFFER</span>
                <span className="text-[#E60012]">🔥</span>
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Koleksi pilihan dengan potongan harga khusus untuk waktu terbatas.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelectCategory('sale')}
              className="text-xs font-bold uppercase tracking-wider text-[#E60012] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Seluruh Penawaran</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12 md:grid-cols-4">
            {limitedOfferProducts.map((prod) => (
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
        </section>
      )}

      {/* 2. Curated Section 2: BEST OF LIFEWEAR ⭐ */}
      {bestOfLifeWearProducts.length > 0 && (
        <section id="best-seller" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 border-b border-zinc-200">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-zinc-900 text-white text-[9px] font-black uppercase tracking-widest mb-1.5">
                <span>PILIHAN TERBAIK KONSUMEN</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-950 flex items-center gap-2">
                <span>BEST OF LIFEWEAR</span>
                <span className="text-amber-500">⭐</span>
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Koleksi paling dicari dengan tingkat kepuasan pelanggan tertinggi di atas 4.8 bintang.
              </p>
            </div>
            <button
              type="button"
              onClick={onSortPopular}
              className="text-xs font-bold uppercase tracking-wider text-zinc-800 hover:text-[#E60012] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Urutkan Terpopuler</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12 md:grid-cols-4">
            {bestOfLifeWearProducts.map((prod) => (
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
        </section>
      )}

      {/* 3. Inspirasi Gaya OOTD (StyleHint Community) */}
      <section className="bg-zinc-50 border-b border-zinc-200 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#E60012] font-mono">
              STYLEHINT COMMUNITY
            </span>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-950">
              Inspirasi Padu Padan Gaya Hidup Nyata
            </h3>
            <p className="text-xs text-zinc-500">
              Temukan inspirasi padu padan outfit fungsional dari komunitas pengguna LifeWear.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {STYLE_HINT_LOOKS.map((look, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectCategory(look.category)}
                className="group relative aspect-[3/4] bg-zinc-200 overflow-hidden border border-zinc-200 text-left cursor-pointer focus:outline-none"
                title={`Lihat inspirasi koleksi ${look.title}`}
              >
                <img
                  src={look.img}
                  alt={look.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3.5 flex flex-col justify-end text-white">
                  <span className="text-[9px] font-mono text-zinc-300 uppercase tracking-widest">
                    {look.tag}
                  </span>
                  <div className="flex items-center justify-between mt-0.5">
                    <h4 className="text-xs font-bold uppercase tracking-tight">{look.title}</h4>
                    <span className="text-[10px] font-mono text-zinc-300 group-hover:text-white group-hover:translate-x-0.5 transition-all">
                      Lihat →
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
