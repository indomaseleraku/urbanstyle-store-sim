// app/product/[id]/page.tsx
'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowLeft } from 'lucide-react';
import { useProductPageStore } from '@/lib/hooks/useProductPageStore';
import { ProductPageGallery } from '@/components/product/ProductPageGallery';
import { ProductPageDetails } from '@/components/product/ProductPageDetails';
import { ProductPageAccordions } from '@/components/product/ProductPageAccordions';
import { ProductRelatedSection } from '@/components/product/ProductRelatedSection';
import { ProductMobileBottomBar } from '@/components/product/ProductMobileBottomBar';
import { ProductPageModals } from '@/components/product/ProductPageModals';
import ProductDetailSkeleton from '@/components/product/ProductDetailSkeleton';
import { dataStore } from '@/lib/store';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const productId = Number(resolvedParams.id);

  const store = useProductPageStore(productId);

  if (store.isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!store.product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-xl font-black uppercase text-zinc-950">Produk Tidak Ditemukan</h1>
          <p className="text-xs text-zinc-500">Busana yang Anda cari mungkin sudah habis atau tautan tidak valid.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-zinc-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-[#E60012] transition-colors rounded-none"
          >
            <ArrowLeft size={14} /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const { product } = store;
  const isOutOfStock = product.stock <= 0;
  const hasDiscount = Boolean(product.original_price && product.original_price > product.price);

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col justify-between selection:bg-[#E60012] selection:text-white font-sans">
      {/* Top Navbar */}
      <Navbar
        categories={store.categories}
        selectedCategory="all"
        onSelectCategory={(slug) => router.push(slug === 'all' ? '/' : `/?category=${slug}`)}
        selectedGender="all"
        onSelectGender={(g) => router.push(g === 'all' ? '/' : `/?gender=${g}`)}
        searchQuery=""
        onSearchChange={(q) => router.push(`/?search=${encodeURIComponent(q)}`)}
        cartCount={store.cartItems.reduce((s, it) => s + it.quantity, 0)}
        onOpenCart={() => store.setIsCartOpen(true)}
        wishlistCount={store.wishlist.length}
        onOpenWishlist={() => store.setIsWishlistOpen(true)}
        onOpenInfoModal={(t) => store.setActiveInfoModal(t)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1 pb-28 md:pb-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-6 flex-wrap">
          <Link href="/" className="hover:text-zinc-950 flex items-center gap-1">
            <ArrowLeft size={13} /> Beranda
          </Link>
          <span>/</span>
          <span className="text-zinc-800">{product.category_name}</span>
          <span>/</span>
          <span className="text-[#E60012] line-clamp-1">{product.name}</span>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Gallery Column (UI-02: Sticky Split View) */}
          <ProductPageGallery
            product={product}
            mainDisplayImage={store.mainDisplayImage}
            galleryList={store.galleryList}
            activeImageIndex={store.activeImageIndex}
            setActiveImageIndex={store.setActiveImageIndex}
            isWishlisted={store.isWishlisted}
            onToggleWishlist={store.handleToggleWishlist}
            hasDiscount={hasDiscount}
          />

          {/* Details & Accordions Column */}
          <div className="lg:col-span-5 space-y-5">
            <ProductPageDetails
              product={product}
              currentColor={store.currentColor}
              selectedColorIndex={store.selectedColorIndex}
              onSelectColor={store.handleSelectColor}
              selectedSize={store.selectedSize}
              onSelectSize={store.setSelectedSize}
              onOpenSizeChart={() => store.setIsSizeChartOpen(true)}
              quantity={store.quantity}
              setQuantity={store.setQuantity}
              onAddToCart={store.handleAddToCart}
              onBuyNow={store.handleBuyNow}
              addedNotice={store.addedNotice}
              onOpenInfoModal={(t) => store.setActiveInfoModal(t)}
            />

            <ProductPageAccordions product={product} selectedSize={store.selectedSize} />
          </div>
        </div>

        {/* STYLEHINT: Inspirasi Padu Padan Gaya LifeWear (UI-03) */}
        <ProductRelatedSection relatedProducts={store.relatedProducts} />
      </main>

      {/* Sticky Bottom Buy Bar on Mobile Viewport (UI-08) */}
      <ProductMobileBottomBar
        product={product}
        selectedSize={store.selectedSize}
        currentColor={store.currentColor}
        isWishlisted={store.isWishlisted}
        onToggleWishlist={store.handleToggleWishlist}
        onAddToCart={store.handleAddToCart}
        isOutOfStock={isOutOfStock}
        addedNotice={store.addedNotice}
      />

      <Footer
        onOpenInfoModal={(t) => store.setActiveInfoModal(t)}
        onOpenSizeChart={() => store.setIsSizeChartOpen(true)}
        onSelectCategory={(slug) => router.push(`/?category=${slug}`)}
      />

      {/* Modals & Drawers */}
      <ProductPageModals
        product={product}
        isSizeChartOpen={store.isSizeChartOpen}
        onCloseSizeChart={() => store.setIsSizeChartOpen(false)}
        onSelectSize={store.setSelectedSize}
        isWishlistOpen={store.isWishlistOpen}
        onCloseWishlist={() => store.setIsWishlistOpen(false)}
        wishlist={store.wishlist}
        onRemoveFromWishlist={(id) => {
          const p = store.wishlist.find((it) => it.id === id);
          if (p) dataStore.toggleWishlist(p);
          store.setWishlist(dataStore.getWishlist());
        }}
        onMoveToCart={(p, sz) => {
          store.setCartItems((prev) => [
            ...prev,
            {
              product: p,
              selected_size: sz || p.sizes[0] || 'M',
              selected_color: p.colors[0]?.name || 'Standard',
              quantity: 1,
            },
          ]);
          store.setIsWishlistOpen(false);
          store.setIsCartOpen(true);
        }}
        isCartOpen={store.isCartOpen}
        onCloseCart={() => store.setIsCartOpen(false)}
        cartItems={store.cartItems}
        onUpdateCartQty={(idx, q) => {
          store.setCartItems((prev) => {
            if (q <= 0) return prev.filter((_, i) => i !== idx);
            const u = [...prev];
            u[idx].quantity = q;
            return u;
          });
        }}
        onRemoveCartItem={(idx) => store.setCartItems((prev) => prev.filter((_, i) => i !== idx))}
        selectedCourier={store.selectedCourier}
        onSelectCourier={store.setSelectedCourier}
        onOpenCheckout={() => {
          store.setIsCartOpen(false);
          store.setIsCheckoutOpen(true);
        }}
        isCheckoutOpen={store.isCheckoutOpen}
        onCloseCheckout={() => store.setIsCheckoutOpen(false)}
        onConfirmOrder={store.handleConfirmOrder}
        onOrderSuccess={() => store.setCartItems([])}
        activeInfoModal={store.activeInfoModal}
        onCloseInfoModal={() => store.setActiveInfoModal(null)}
        selectedSize={store.selectedSize}
        currentColor={store.currentColor.name}
      />
    </div>
  );
}
