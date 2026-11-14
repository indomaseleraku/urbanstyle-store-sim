'use client';

// lib/hooks/useProductPageStore.ts
import { useState, useEffect, useCallback } from 'react';
import { Product, Category, ColorVariant } from '@/lib/types';
import { dataStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { ModalType } from '@/components/InformationModals';

export function useProductPageStore(productId: number) {
  const { user, openAuthModal } = useAuth();
  const {
    cartItems,
    setCartItems,
    selectedCourier,
    setSelectedCourier,
    totalCartCount,
    addToCart,
    setInstantCartItem,
    updateCartQty,
    removeCartItem,
    clearCart,
    syncCartWithProducts,
  } = useCart();
  const { wishlist, toggleWishlist, removeFromWishlist } = useWishlist();

  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [pendingInstantCheckout, setPendingInstantCheckout] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [activeInfoModal, setActiveInfoModal] = useState<ModalType>(null);

  useEffect(() => {
    if (user && pendingInstantCheckout) {
      setPendingInstantCheckout(false);
      setIsCheckoutOpen(true);
    }
  }, [user, pendingInstantCheckout]);

  useEffect(() => {
    let active = true;
    async function load() {
      setIsLoading(true);
      try {
        const [p, cats, allProds] = await Promise.all([
          dataStore.getProductById(productId),
          dataStore.getCategories(),
          dataStore.getProducts(),
        ]);
        if (!active) return;
        setProduct(p);
        setCategories(cats);
        if (p && p.sizes.length > 0) {
          const availableSize =
            p.sizes.find((sz) => !p.out_of_stock_sizes?.includes(sz)) || p.sizes[0];
          setSelectedSize(availableSize);
        }
        if (allProds) {
          syncCartWithProducts(allProds);
          const others = allProds.filter((it) => it.id !== productId);
          const sameCat = p ? others.filter((it) => it.category_id === p.category_id) : [];
          const rest = p ? others.filter((it) => it.category_id !== p.category_id) : others;
          setRelatedProducts([...sameCat, ...rest].slice(0, 4));
        }
      } catch (err) {
        console.warn('Gagal memuat detail produk:', err);
      } finally {
        if (active) setIsLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [productId, syncCartWithProducts]);

  const refreshProduct = useCallback(async () => {
    dataStore.invalidateCache();
    const updated = await dataStore.getProductById(productId);
    if (updated) {
      setProduct(updated);
    }
  }, [productId]);

  const currentColor: ColorVariant = product?.colors[selectedColorIndex] || {
    name: 'Standard',
    code: '09 BLACK',
    hex: '#000000',
    image_url: product?.image_url || '',
  };

  const galleryList =
    product?.gallery_images && product.gallery_images.length > 0
      ? [
          currentColor.image_url,
          ...product.gallery_images.filter((img) => img !== currentColor.image_url),
        ]
      : [currentColor.image_url];

  const mainDisplayImage = galleryList[activeImageIndex] || currentColor.image_url;

  const handleAddToCart = () => {
    if (!product || product.stock <= 0 || product.out_of_stock_sizes?.includes(selectedSize)) return;
    addToCart(product, selectedSize, currentColor.name, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
    setIsCartOpen(true);
  };

  const handleBuyNow = () => {
    if (!product || product.stock <= 0 || product.out_of_stock_sizes?.includes(selectedSize)) return;
    setInstantCartItem(product, selectedSize, currentColor.name, quantity);
    if (!user) {
      setPendingInstantCheckout(true);
      openAuthModal();
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    toggleWishlist(product);
  };

  const handleMoveToCart = (prod: Product, sz?: string) => {
    if (prod.stock <= 0) return;
    const availableSizes = prod.sizes.filter((s) => !prod.out_of_stock_sizes?.includes(s));
    const chosenSize = (sz && availableSizes.includes(sz) ? sz : availableSizes[0]) || prod.sizes[0] || 'M';
    if (prod.out_of_stock_sizes?.includes(chosenSize)) return;
    addToCart(prod, chosenSize, prod.colors[0]?.name || 'Standard', 1);
    void removeFromWishlist(prod.id);
    setIsWishlistOpen(false);
    setIsCartOpen(true);
  };

  const handleConfirmOrder = async (payload: any) => {
    const res = await dataStore.createOrder({ ...payload, cart_items: cartItems });
    if (res.success) {
      dataStore.invalidateCache();
      const updated = await dataStore.getProductById(productId);
      if (updated) setProduct(updated);
    }
    return res;
  };

  const handleSelectColor = (idx: number) => {
    setSelectedColorIndex(idx);
    setActiveImageIndex(0);
  };

  const isWishlisted = Boolean(product && wishlist.some((w) => w.id === product.id));

  return {
    product,
    categories,
    relatedProducts,
    isLoading,
    selectedColorIndex,
    selectedSize,
    setSelectedSize,
    quantity,
    setQuantity,
    activeImageIndex,
    setActiveImageIndex,
    isSizeChartOpen,
    setIsSizeChartOpen,
    isStoreModalOpen,
    setIsStoreModalOpen,
    addedNotice,
    currentColor,
    galleryList,
    mainDisplayImage,
    cartItems,
    setCartItems,
    totalCartCount,
    updateCartQty,
    removeCartItem,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    selectedCourier,
    setSelectedCourier,
    isCheckoutOpen,
    setIsCheckoutOpen,
    wishlist,
    removeFromWishlist,
    isWishlistOpen,
    setIsWishlistOpen,
    activeInfoModal,
    setActiveInfoModal,
    isWishlisted,
    handleAddToCart,
    handleBuyNow,
    handleToggleWishlist,
    handleMoveToCart,
    handleConfirmOrder,
    handleSelectColor,
    refreshProduct,
  };
}
