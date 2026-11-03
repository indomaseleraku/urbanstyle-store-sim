// components/home/HomeModalsAndDrawers.tsx
'use client';

import React from 'react';
import ProductDetailModal from '@/components/ProductDetailModal';
import SizeChartModal from '@/components/SizeChartModal';
import InformationModals from '@/components/InformationModals';
import { AuthModal } from '@/components/AuthModal';
import WishlistDrawer from '@/components/WishlistDrawer';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import FloatingCartToast from '@/components/home/FloatingCartToast';
import MobileBottomNav from '@/components/home/MobileBottomNav';
import MobileCategorySheet from '@/components/home/MobileCategorySheet';
import { useHomeStore } from '@/lib/hooks/useHomeStore';

interface HomeModalsAndDrawersProps {
  store: ReturnType<typeof useHomeStore>;
  user: any;
  openAuthModal: () => void;
  router: any;
  scrollToCatalog: () => void;
}

export default function HomeModalsAndDrawers({
  store: s,
  user,
  openAuthModal,
  router,
  scrollToCatalog,
}: HomeModalsAndDrawersProps) {
  const isHomeActive =
    s.selectedCategory === 'all' &&
    s.selectedGender === 'all' &&
    !s.searchQuery &&
    !s.inStockOnly &&
    !s.isWishlistOpen &&
    !s.isCartOpen;

  const isCategoryActive =
    (s.selectedCategory !== 'all' || s.selectedGender !== 'all') &&
    !s.isWishlistOpen &&
    !s.isCartOpen;

  return (
    <>
      <ProductDetailModal
        product={s.selectedProductForDetail}
        isOpen={Boolean(s.selectedProductForDetail)}
        onClose={() => s.setSelectedProductForDetail(null)}
        onAddToCart={(p, size, color, qty) => s.handleAddToCart(p, size, color, qty, true)}
        onInstantBuy={(p, size, color, qty) => {
          if (!user) {
            s.handleAddToCart(p, size, color, qty, false);
            s.setSelectedProductForDetail(null);
            openAuthModal();
            return;
          }
          s.handleInstantBuy(p, size, color, qty);
        }}
        isWishlisted={
          s.selectedProductForDetail ? s.wishlist.some((w) => w.id === s.selectedProductForDetail?.id) : false
        }
        onToggleWishlist={s.handleToggleWishlist}
        onOpenInfoModal={s.setActiveInfoModal}
      />

      <SizeChartModal
        isOpen={s.isGlobalSizeChartOpen}
        onClose={() => s.setIsGlobalSizeChartOpen(false)}
        productName="Standar Ukuran Busana Universal"
        categoryName="Kemeja & Celana"
      />

      <InformationModals type={s.activeInfoModal} onClose={() => s.setActiveInfoModal(null)} />
      <AuthModal />

      <WishlistDrawer
        isOpen={s.isWishlistOpen}
        onClose={() => s.setIsWishlistOpen(false)}
        items={s.wishlist}
        onRemoveFromWishlist={(id) => {
          const prod = s.wishlist.find((p) => p.id === id);
          if (prod) s.handleToggleWishlist(prod);
        }}
        onMoveToCart={s.handleMoveToCart}
      />

      <CartDrawer
        isOpen={s.isCartOpen}
        onClose={() => s.setIsCartOpen(false)}
        items={s.cartItems}
        onUpdateQty={s.handleUpdateQty}
        onRemoveItem={s.handleRemoveItem}
        selectedCourier={s.selectedCourier}
        onSelectCourier={s.setSelectedCourier}
        onOpenCheckout={() => {
          if (!user) {
            s.setIsCartOpen(false);
            openAuthModal();
            return;
          }
          s.setIsCartOpen(false);
          s.setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={s.isCheckoutOpen}
        onClose={() => s.setIsCheckoutOpen(false)}
        items={s.cartItems}
        selectedCourier={s.selectedCourier}
        onConfirmOrder={s.handleConfirmOrder}
        onOrderSuccess={() => s.setCartItems([])}
      />

      <FloatingCartToast
        toast={s.toast}
        onClose={() => s.setToast((prev) => ({ ...prev, visible: false }))}
        onOpenCart={() => {
          s.setToast((prev) => ({ ...prev, visible: false }));
          s.setIsCartOpen(true);
        }}
      />

      <MobileBottomNav
        isHomeActive={isHomeActive}
        isCategoryActive={isCategoryActive}
        isWishlistActive={s.isWishlistOpen}
        isCartActive={s.isCartOpen}
        wishlistCount={s.wishlist.length}
        totalCartCount={s.totalCartCount}
        onGoHome={() => {
          s.setSelectedCategory('all');
          s.setSelectedGender('all');
          s.setSearchQuery('');
          s.setInStockOnly(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCategories={() => s.setIsMobileCategoryDrawerOpen(true)}
        onOpenWishlist={() => s.setIsWishlistOpen(true)}
        onOpenCart={() => s.setIsCartOpen(true)}
        onOpenAccount={() => {
          if (user) router.push('/account');
          else openAuthModal();
        }}
      />

      <MobileCategorySheet
        isOpen={s.isMobileCategoryDrawerOpen}
        onClose={() => s.setIsMobileCategoryDrawerOpen(false)}
        selectedGender={s.selectedGender}
        onSelectGender={s.setSelectedGender}
        selectedCategory={s.selectedCategory}
        onSelectCategory={(slug) => {
          s.setSelectedCategory(slug);
          s.setIsMobileCategoryDrawerOpen(false);
          setTimeout(() => scrollToCatalog(), 100);
        }}
        onReset={() => {
          s.setSelectedCategory('all');
          s.setSelectedGender('all');
          s.setIsMobileCategoryDrawerOpen(false);
          scrollToCatalog();
        }}
      />
    </>
  );
}
