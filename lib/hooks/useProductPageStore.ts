'use client';

import { useState, useEffect } from 'react';
import { Product, Category, ColorVariant } from '@/lib/types';
import { dataStore } from '@/lib/store';
import { ModalType } from '@/components/InformationModals';

export function useProductPageStore(productId: number) {
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

  // Cart & Wishlist state
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState('J&T Express (Reguler)');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [activeInfoModal, setActiveInfoModal] = useState<ModalType>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const [p, cats, allProds] = await Promise.all([
        dataStore.getProductById(productId),
        dataStore.getCategories(),
        dataStore.getProducts(),
      ]);
      setProduct(p);
      setCategories(cats);
      if (p && p.sizes.length > 0) {
        const availableSize = p.sizes.find((sz) => !p.out_of_stock_sizes?.includes(sz)) || p.sizes[0];
        setSelectedSize(availableSize);
      }
      if (allProds) {
        setRelatedProducts(allProds.filter((it) => it.id !== productId).slice(0, 4));
      }
      setIsLoading(false);
      setWishlist(dataStore.getWishlist());
    }
    load();
  }, [productId]);

  const currentColor: ColorVariant = product?.colors[selectedColorIndex] || {
    name: 'Standard',
    code: '09 BLACK',
    hex: '#000000',
    image_url: product?.image_url || '',
  };

  const galleryList =
    product?.gallery_images && product.gallery_images.length > 0
      ? [currentColor.image_url, ...product.gallery_images.filter((img) => img !== currentColor.image_url)]
      : [currentColor.image_url];

  const mainDisplayImage = galleryList[activeImageIndex] || currentColor.image_url;

  const handleAddToCart = () => {
    if (!product || product.stock <= 0) return;
    setCartItems((prev) => {
      const idx = prev.findIndex(
        (it) =>
          it.product.id === product.id &&
          it.selected_size === selectedSize &&
          it.selected_color === currentColor.name
      );
      if (idx !== -1) {
        const u = [...prev];
        u[idx].quantity += quantity;
        return u;
      }
      return [...prev, { product, selected_size: selectedSize, selected_color: currentColor.name, quantity }];
    });
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
    setIsCartOpen(true);
  };

  const handleBuyNow = () => {
    if (!product || product.stock <= 0) return;
    setCartItems([{ product, selected_size: selectedSize, selected_color: currentColor.name, quantity }]);
    setIsCheckoutOpen(true);
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    dataStore.toggleWishlist(product);
    setWishlist(dataStore.getWishlist());
  };

  const handleConfirmOrder = async (payload: any) => {
    const res = await dataStore.createOrder({ ...payload, cart_items: cartItems });
    if (res.success) {
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
    isCartOpen,
    setIsCartOpen,
    selectedCourier,
    setSelectedCourier,
    isCheckoutOpen,
    setIsCheckoutOpen,
    wishlist,
    setWishlist,
    isWishlistOpen,
    setIsWishlistOpen,
    activeInfoModal,
    setActiveInfoModal,
    isWishlisted,
    handleAddToCart,
    handleBuyNow,
    handleToggleWishlist,
    handleConfirmOrder,
    handleSelectColor,
  };
}
