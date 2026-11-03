'use client';

import React from 'react';
import { Product, ColorVariant } from '@/lib/types';
import { Check, Ruler, ShoppingBag, ArrowRight } from 'lucide-react';

interface ProductVariantSelectorProps {
  product: Product;
  currentColor: ColorVariant;
  selectedColorIndex: number;
  onSelectColor: (idx: number) => void;
  selectedSize: string;
  onSelectSize: (size: string) => void;
  onOpenSizeChart: () => void;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  addedNotice: boolean;
  onOpenStoreAvailability?: () => void;
}

export const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
  product,
  currentColor,
  selectedColorIndex,
  onSelectColor,
  selectedSize,
  onSelectSize,
  onOpenSizeChart,
  quantity,
  onQuantityChange,
  onAddToCart,
  onBuyNow,
  addedNotice,
  onOpenStoreAvailability,
}) => {
  const isOutOfStock = product.stock <= 0;
  const isCriticalStock = product.stock > 0 && product.stock <= 5;
  const isLowStock = product.stock > 5 && product.stock <= 15;

  return (
    <div className="space-y-4">
      {/* Stock Status Indicator */}
      <div>
        {isOutOfStock ? (
          <div className="p-2 bg-zinc-900 text-white text-xs font-bold uppercase text-center">
            Habis Terjual
          </div>
        ) : isCriticalStock ? (
          <div className="p-2 bg-red-50 border border-red-200 text-[#E60012] text-xs font-bold uppercase flex items-center justify-between animate-pulse">
            <span>⚡ Stok Darurat Terbatas!</span>
            <span>Tersisa {product.stock} Unit di Gudang</span>
          </div>
        ) : isLowStock ? (
          <div className="p-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase flex items-center justify-between">
            <span>Stok Menipis</span>
            <span>Tersedia {product.stock} Unit</span>
          </div>
        ) : (
          <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold uppercase flex items-center justify-between">
            <span>Ketersediaan: Ready Stock</span>
            <span className="font-bold">{product.stock} Unit</span>
          </div>
        )}
      </div>

      {/* Color Swatch Selector */}
      <div className="space-y-2 pt-1 border-t border-zinc-200">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold uppercase tracking-wider text-zinc-700">Warna Terpilih:</span>
          <span className="font-mono font-bold text-zinc-950 uppercase">
            {currentColor.code ? `Warna: ${currentColor.code}` : currentColor.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {product.colors.map((c, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectColor(idx)}
              className={`relative w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                selectedColorIndex === idx
                  ? 'border-zinc-950 scale-110 shadow-sm'
                  : 'border-zinc-300 hover:scale-105'
              }`}
              style={{ backgroundColor: c.hex }}
              title={`Warna: ${c.code || c.name}`}
              aria-label={c.code || c.name}
            >
              {selectedColorIndex === idx && (
                <Check
                  size={14}
                  className={`absolute inset-0 m-auto ${
                    c.hex.toLowerCase() === '#ffffff' || c.hex.toLowerCase() === '#f8fafc'
                      ? 'text-zinc-950'
                      : 'text-white'
                  }`}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Size Selector & Size Guide Link */}
      <div className="space-y-2 pt-2 border-t border-zinc-200">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold uppercase tracking-wider text-zinc-700">Pilih Ukuran:</span>
          <button
            type="button"
            onClick={onOpenSizeChart}
            className="text-[#E60012] hover:underline font-bold flex items-center gap-1 text-[11px] uppercase tracking-wider cursor-pointer"
          >
            <Ruler size={13} />
            <span>Panduan Ukuran (cm)</span>
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {product.sizes.map((s) => {
            const isSelected = selectedSize === s;
            const isSizeDisabled = isOutOfStock || Boolean(product.out_of_stock_sizes?.includes(s));
            return (
              <button
                key={s}
                type="button"
                disabled={isSizeDisabled}
                onClick={() => {
                  if (!isSizeDisabled) onSelectSize(s);
                }}
                className={`relative px-4 py-3 text-xs font-bold uppercase transition-all border rounded-none min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer ${
                  isSizeDisabled
                    ? 'border-zinc-200 text-zinc-300 bg-zinc-50 cursor-not-allowed overflow-hidden after:content-[""] after:absolute after:inset-0 after:border-t after:border-zinc-300 after:rotate-45 after:translate-y-1/2'
                    : isSelected
                    ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs'
                    : 'bg-white text-zinc-800 border-zinc-300 hover:border-zinc-950'
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity Stepper */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-200 text-xs">
        <span className="font-bold uppercase tracking-wider text-zinc-700">Kuantitas:</span>
        <div className="flex items-center border border-zinc-300 rounded-none bg-white">
          <button
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className="w-10 h-10 flex items-center justify-center hover:bg-zinc-100 disabled:opacity-40 text-sm font-bold cursor-pointer"
            aria-label="Kurangi"
          >
            -
          </button>
          <span className="w-10 text-center font-bold font-mono text-zinc-950">{quantity}</span>
          <button
            onClick={() => onQuantityChange(Math.min(product.stock, quantity + 1))}
            disabled={quantity >= product.stock}
            className="w-10 h-10 flex items-center justify-center hover:bg-zinc-100 disabled:opacity-40 text-sm font-bold cursor-pointer"
            aria-label="Tambah"
          >
            +
          </button>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="space-y-2 pt-2">
        <button
          onClick={onAddToCart}
          disabled={isOutOfStock}
          className="w-full py-4 bg-[#111111] hover:bg-[#E60012] disabled:bg-zinc-300 text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 rounded-none min-h-[48px] shadow-sm cursor-pointer"
        >
          {addedNotice ? (
            <>
              <Check size={16} className="text-emerald-400" />
              <span>DIMASUKKAN KE TAS BELANJA!</span>
            </>
          ) : (
            <>
              <ShoppingBag size={16} />
              <span>+ MASUKKAN KE TAS BELANJA</span>
            </>
          )}
        </button>

        <button
          onClick={onBuyNow}
          disabled={isOutOfStock}
          className="w-full py-3.5 bg-white hover:bg-zinc-50 border border-zinc-950 text-zinc-950 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 rounded-none min-h-[44px] cursor-pointer"
        >
          <span>BELI SEKARANG (LANGSUNG CHECKOUT)</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
