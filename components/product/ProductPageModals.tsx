'use client';

import React from 'react';
import { Product } from '@/lib/types';
import SizeChartModal from '@/components/SizeChartModal';
import WishlistDrawer from '@/components/WishlistDrawer';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import InformationModals, { ModalType } from '@/components/InformationModals';
import { AuthModal } from '@/components/AuthModal';

interface ProductPageModalsProps {
  product: Product;
  isSizeChartOpen: boolean;
  onCloseSizeChart: () => void;
  onSelectSize?: (size: string) => void;
  isWishlistOpen: boolean;
  onCloseWishlist: () => void;
  wishlist: Product[];
  onRemoveFromWishlist: (id: number) => void;
  onMoveToCart: (product: Product, size?: string) => void;
  isCartOpen: boolean;
  onCloseCart: () => void;
  cartItems: any[];
  onUpdateCartQty: (idx: number, q: number) => void;
  onRemoveCartItem: (idx: number) => void;
  selectedCourier: string;
  onSelectCourier: (courier: string) => void;
  onOpenCheckout: () => void;
  isCheckoutOpen: boolean;
  onCloseCheckout: () => void;
  onConfirmOrder: (payload: any) => Promise<any>;
  onOrderSuccess: () => void;
  activeInfoModal: ModalType;
  onCloseInfoModal: () => void;
  selectedSize?: string;
  currentColor?: string;
}

export const ProductPageModals: React.FC<ProductPageModalsProps> = ({
  product,
  isSizeChartOpen,
  onCloseSizeChart,
  onSelectSize,
  isWishlistOpen,
  onCloseWishlist,
  wishlist,
  onRemoveFromWishlist,
  onMoveToCart,
  isCartOpen,
  onCloseCart,
  cartItems,
  onUpdateCartQty,
  onRemoveCartItem,
  selectedCourier,
  onSelectCourier,
  onOpenCheckout,
  isCheckoutOpen,
  onCloseCheckout,
  onConfirmOrder,
  onOrderSuccess,
  activeInfoModal,
  onCloseInfoModal,
  selectedSize = 'M',
  currentColor = 'Standard',
}) => {
  return (
    <>
      <SizeChartModal
        isOpen={isSizeChartOpen}
        onClose={onCloseSizeChart}
        productName={product.name}
        categoryName={product.category_name}
        measurements={product.size_measurements}
        onSelectSize={onSelectSize}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={onCloseWishlist}
        items={wishlist}
        onRemoveFromWishlist={onRemoveFromWishlist}
        onMoveToCart={onMoveToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={onCloseCart}
        items={cartItems}
        onUpdateQty={onUpdateCartQty}
        onRemoveItem={onRemoveCartItem}
        selectedCourier={selectedCourier}
        onSelectCourier={onSelectCourier}
        onOpenCheckout={onOpenCheckout}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={onCloseCheckout}
        items={cartItems}
        selectedCourier={selectedCourier}
        onConfirmOrder={onConfirmOrder}
        onOrderSuccess={onOrderSuccess}
      />

      <InformationModals type={activeInfoModal} onClose={onCloseInfoModal} />

      <AuthModal />
    </>
  );
};
