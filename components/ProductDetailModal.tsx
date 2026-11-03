// components/ProductDetailModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product, ColorVariant } from '@/lib/types';
import { X, Star } from 'lucide-react';
import SizeChartModal from './SizeChartModal';
import { ModalType } from './InformationModals';
import { ProductModalGallery } from './product/ProductModalGallery';
import { ProductVariantSelector } from './product/ProductVariantSelector';
import { ProductAccordionSection } from './product/ProductAccordionSection';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, colorName: string, quantity: number) => void;
  onInstantBuy: (product: Product, size: string, colorName: string, quantity: number) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onOpenInfoModal?: (type: ModalType) => void;
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onInstantBuy,
  isWishlisted,
  onToggleWishlist,
  onOpenInfoModal,
}: ProductDetailModalProps) {
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    if (product && product.sizes.length > 0) {
      const avail = product.sizes.find((sz) => !product.out_of_stock_sizes?.includes(sz)) || product.sizes[0];
      setSelectedSize(avail);
      setSelectedColorIndex(0);
      setActiveImageIndex(0);
      setQuantity(1);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const currentColor: ColorVariant = product.colors[selectedColorIndex] || {
    name: 'Standard',
    code: '09 BLACK',
    hex: '#000000',
    image_url: product.image_url,
  };

  const galleryList =
    product.gallery_images && product.gallery_images.length > 0
      ? [currentColor.image_url, ...product.gallery_images.filter((img) => img !== currentColor.image_url)]
      : [currentColor.image_url];

  const mainDisplayImage = galleryList[activeImageIndex] || currentColor.image_url;

  const handleColorChange = (idx: number) => {
    setSelectedColorIndex(idx);
    setActiveImageIndex(0);
  };

  const handleAdd = () => {
    if (product.stock <= 0) return;
    onAddToCart(product, selectedSize, currentColor.name, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const handleBuyNow = () => {
    if (product.stock <= 0) return;
    onInstantBuy(product, selectedSize, currentColor.name, quantity);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 lg:p-6 animate-in fade-in duration-200">
      <div className="bg-white border border-zinc-300 w-full max-w-5xl overflow-hidden shadow-2xl relative my-auto">
        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20 p-2 bg-white/90 hover:bg-zinc-950 hover:text-white border border-zinc-200 transition-colors cursor-pointer"
          aria-label="Tutup detail produk"
        >
          <X size={20} />
        </button>

        {/* Modal Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[90vh] overflow-y-auto">
          {/* LEFT: Multi-Angle Gallery */}
          <ProductModalGallery
            product={product}
            mainDisplayImage={mainDisplayImage}
            galleryList={galleryList}
            activeImageIndex={activeImageIndex}
            setActiveImageIndex={setActiveImageIndex}
            isWishlisted={isWishlisted}
            onToggleWishlist={onToggleWishlist}
            onOpenInfoModal={onOpenInfoModal}
          />

          {/* RIGHT: Product Purchase & Information Panel */}
          <div className="lg:col-span-5 p-5 sm:p-7 space-y-5 flex flex-col justify-between">
            <div className="space-y-5">
              {/* Category & Rating */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  <span>
                    {product.category_name || 'Koleksi'} • {(product.gender || 'unisex').toUpperCase()}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">SKU: US-{product.id.toString().padStart(4, '0')}</span>
                    <Link
                      href={`/product/${product.id}`}
                      className="text-zinc-500 hover:text-[#E60012] transition-colors underline uppercase text-[10px] font-bold"
                      title="Buka Halaman Mandiri Produk"
                    >
                      Buka Halaman Produk Penuh ↗
                    </Link>
                  </div>
                </div>

                <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-zinc-950 leading-snug">
                  {product.name}
                </h1>

                {/* Rating Stars */}
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < Math.floor(product.rating || 5) ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-zinc-800 font-mono">
                    {product.rating || 4.8} / 5.0
                  </span>
                  <span className="text-[11px] text-zinc-400">({product.reviews_count || 24} Ulasan)</span>
                </div>
              </div>

              {/* Price Block */}
              <div className="p-3.5 bg-zinc-50 border border-zinc-200 flex items-baseline justify-between">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-xl sm:text-2xl font-black text-[#E60012] font-mono">
                    Rp {product.price.toLocaleString('id-ID')}
                  </span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-xs text-zinc-400 line-through font-mono">
                      Rp {product.original_price.toLocaleString('id-ID')}
                    </span>
                  )}
                </div>

                {product.original_price && product.original_price > product.price && (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-red-100 text-[#E60012]">
                    HEMAT {Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                  </span>
                )}
              </div>

              {/* Variants, Sizes, Qty & CTA Buttons */}
              <ProductVariantSelector
                product={product}
                currentColor={currentColor}
                selectedColorIndex={selectedColorIndex}
                onSelectColor={handleColorChange}
                selectedSize={selectedSize}
                onSelectSize={setSelectedSize}
                onOpenSizeChart={() => setIsSizeChartOpen(true)}
                quantity={quantity}
                onQuantityChange={setQuantity}
                onAddToCart={handleAdd}
                onBuyNow={handleBuyNow}
                addedNotice={addedNotice}
              />

              {/* Accordions (Deskripsi, Bahan, Perawatan, Ulasan) */}
              <ProductAccordionSection product={product} selectedSize={selectedSize} />
            </div>
          </div>
        </div>
      </div>

      {/* Nested Size Chart Modal */}
      <SizeChartModal
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
        productName={product.name}
        categoryName={product.category_name}
        measurements={product.size_measurements}
        onSelectSize={setSelectedSize}
      />
    </div>
  );
}
