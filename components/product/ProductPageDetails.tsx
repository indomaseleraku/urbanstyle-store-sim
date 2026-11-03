'use client';

import React from 'react';
import { Product, ColorVariant } from '@/lib/types';
import { Star, Truck, RotateCcw, ShieldCheck } from 'lucide-react';
import { ModalType } from '@/components/InformationModals';
import { ProductVariantSelector } from './ProductVariantSelector';

interface ProductPageDetailsProps {
  product: Product;
  currentColor: ColorVariant;
  selectedColorIndex: number;
  onSelectColor: (idx: number) => void;
  selectedSize: string;
  onSelectSize: (size: string) => void;
  onOpenSizeChart: () => void;
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  onAddToCart: () => void;
  onBuyNow: () => void;
  addedNotice: boolean;
  onOpenInfoModal: (type: ModalType) => void;
}

export const ProductPageDetails: React.FC<ProductPageDetailsProps> = ({
  product,
  currentColor,
  selectedColorIndex,
  onSelectColor,
  selectedSize,
  onSelectSize,
  onOpenSizeChart,
  quantity,
  setQuantity,
  onAddToCart,
  onBuyNow,
  addedNotice,
  onOpenInfoModal,
}) => {
  const hasDiscount = Boolean(product.original_price && product.original_price > product.price);

  return (
    <div className="space-y-5">
      <div className="space-y-1.5 border-b border-zinc-200 pb-4">
        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
          {product.category_name || 'Koleksi'} • {(product.gender || 'unisex').toUpperCase()}
        </span>
        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-950 leading-tight">
          {product.name}
        </h1>

        {/* Rating Summary */}
        <div className="flex items-center gap-2 pt-1">
          <div className="flex items-center text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                fill={i < Math.floor(product.rating || 5) ? 'currentColor' : 'none'}
                className={i < Math.floor(product.rating || 5) ? '' : 'text-zinc-300'}
              />
            ))}
          </div>
          <span className="text-xs font-bold font-mono text-zinc-800">{product.rating || 4.8}</span>
          <span className="text-xs text-zinc-400 font-mono">({product.reviews_count || 12} Ulasan)</span>
        </div>
      </div>

      {/* Price Box */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span
            className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
              hasDiscount ? 'text-[#E60012]' : 'text-zinc-950'
            }`}
          >
            Rp {product.price.toLocaleString('id-ID')}
          </span>
          {hasDiscount && (
            <span className="text-sm font-mono text-zinc-400 line-through">
              Rp {product.original_price?.toLocaleString('id-ID')}
            </span>
          )}
        </div>
        <span className="text-[11px] font-bold uppercase text-zinc-500 font-mono block">
          SKU: US-{product.id.toString().padStart(4, '0')} • LIFEWEAR ESSENTIAL
        </span>
      </div>

      {/* Variants, Sizes, Quantity & CTAs via ProductVariantSelector */}
      <ProductVariantSelector
        product={product}
        currentColor={currentColor}
        selectedColorIndex={selectedColorIndex}
        onSelectColor={onSelectColor}
        selectedSize={selectedSize}
        onSelectSize={onSelectSize}
        onOpenSizeChart={onOpenSizeChart}
        quantity={quantity}
        onQuantityChange={(q) => setQuantity(q)}
        onAddToCart={onAddToCart}
        onBuyNow={onBuyNow}
        addedNotice={addedNotice}
      />

      {/* Value Badges */}
      <div className="grid grid-cols-3 gap-2 py-3 border-y border-zinc-200 text-[10px] text-zinc-600 font-bold uppercase">
        <button
          type="button"
          onClick={() => onOpenInfoModal('shipping')}
          className="flex items-center gap-1.5 justify-center text-center hover:text-[#E60012] transition-colors cursor-pointer"
          title="Buka panduan pengiriman & gratis ongkir"
        >
          <Truck size={14} className="text-zinc-950 shrink-0" />
          <span>Bebas Ongkir &gt;400k</span>
        </button>
        <button
          type="button"
          onClick={() => onOpenInfoModal('return')}
          className="flex items-center gap-1.5 justify-center text-center border-x border-zinc-200 hover:text-[#E60012] transition-colors cursor-pointer"
          title="Buka kebijakan retur garansi 30 hari"
        >
          <RotateCcw size={14} className="text-zinc-950 shrink-0" />
          <span>Garansi Retur 30 Hari</span>
        </button>
        <button
          type="button"
          onClick={() => onOpenInfoModal('lifewear')}
          className="flex items-center gap-1.5 justify-center text-center hover:text-[#E60012] transition-colors cursor-pointer"
          title="Buka filosofi desain LifeWear"
        >
          <ShieldCheck size={14} className="text-zinc-950 shrink-0" />
          <span>100% Produk Original</span>
        </button>
      </div>
    </div>
  );
};
