// lib/hooks/useHomeStore.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product, Category } from '@/lib/types';
import { dataStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { ModalType } from '@/components/InformationModals';

export function useHomeStore() {
  const searchParams = useSearchParams();
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
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [visibleCount, setVisibleCount] = useState<number>(8);
  const [gridDensity, setGridDensity] = useState<'compact' | 'editorial'>('compact');

  // UI Drawers & Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [pendingInstantCheckout, setPendingInstantCheckout] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [isGlobalSizeChartOpen, setIsGlobalSizeChartOpen] = useState(false);
  const [activeInfoModal, setActiveInfoModal] = useState<ModalType>(null);
  const [isMobileCategoryDrawerOpen, setIsMobileCategoryDrawerOpen] = useState(false);

  useEffect(() => {
    if (user && pendingInstantCheckout) {
      setPendingInstantCheckout(false);
      setIsCheckoutOpen(true);
    }
  }, [user, pendingInstantCheckout]);

  const refreshProducts = useCallback(async () => {
    dataStore.invalidateCache();
    const rawProds = await dataStore.getProducts(selectedCategory, debouncedSearchQuery, selectedGender, sortBy);
    const prods = inStockOnly ? rawProds.filter((p) => p.stock > 0) : rawProds;
    setProducts(prods);
    setSelectedProductForDetail((prev) => (prev ? rawProds.find((p) => p.id === prev.id) || prev : null));
  }, [selectedCategory, debouncedSearchQuery, selectedGender, sortBy, inStockOnly]);

  // Toast
  const [toast, setToast] = useState({
    visible: false,
    productName: '',
    colorName: '',
    size: '',
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setVisibleCount(8);
  }, [selectedCategory, selectedGender, debouncedSearchQuery, sortBy, inStockOnly]);

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  useEffect(() => {
    const cat = searchParams.get('category');
    const gen = searchParams.get('gender');
    const q = searchParams.get('search');
    const loginReq = searchParams.get('login');
    if (cat) setSelectedCategory(cat);
    if (gen) setSelectedGender(gen);
    if (q) setSearchQuery(q);
    if (loginReq === 'required') openAuthModal();
  }, [searchParams, openAuthModal]);

  useEffect(() => {
    let active = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const isUnfilteredCatalog =
          selectedCategory === 'all' &&
          selectedGender === 'all' &&
          debouncedSearchQuery.trim() === '' &&
          !inStockOnly;
        const [cats, rawProds] = await Promise.all([
          dataStore.getCategories(),
          dataStore.getProducts(selectedCategory, debouncedSearchQuery, selectedGender, sortBy),
        ]);
        if (!active) return;
        if (isUnfilteredCatalog) {
          syncCartWithProducts(rawProds);
        }
        const prods = inStockOnly ? rawProds.filter((p) => p.stock > 0) : rawProds;
        setCategories(cats);
        setProducts(prods);
      } catch (err) {
        console.warn('Gagal memuat katalog produk:', err);
      } finally {
        if (active) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, [selectedCategory, selectedGender, debouncedSearchQuery, sortBy, inStockOnly, syncCartWithProducts]);

  const getCategoryDisplayName = (slug: string) => {
    switch (slug) {
      case 'sale': return 'Promo';
      case 'kaos': return 'Kaos';
      case 'kemeja': return 'Kemeja';
      case 'polo': return 'Polo Shirt';
      case 'jaket': return 'Jaket';
      case 'hoodie': return 'Hoodie & Sweater';
      case 'celana-panjang': return 'Celana Panjang';
      case 'celana-pendek': return 'Celana Pendek';
      case 'celana': return 'Celana';
      default: return categories.find((c) => c.slug === slug)?.name || slug;
    }
  };

  const handleToggleWishlist = (product: Product) => {
    toggleWishlist(product);
  };

  const handleMoveToCart = (product: Product, size?: string) => {
    if (product.stock <= 0) {
      setSelectedProductForDetail(product);
      setIsWishlistOpen(false);
      return;
    }
    const availableSizes = product.sizes.filter((sz) => !product.out_of_stock_sizes?.includes(sz));
    const chosenSize =
      (size && availableSizes.includes(size) ? size : availableSizes[0]) || product.sizes[0] || 'M';
    if (product.out_of_stock_sizes?.includes(chosenSize)) {
      setSelectedProductForDetail(product);
      setIsWishlistOpen(false);
      return;
    }
    handleAddToCart(product, chosenSize, product.colors[0]?.name || 'Standard', 1, false);
    void removeFromWishlist(product.id);
    setIsWishlistOpen(false);
    setIsCartOpen(true);
  };

  const handleAddToCart = (
    product: Product,
    size: string,
    colorName: string,
    quantity: number = 1,
    openDrawer: boolean = false
  ) => {
    addToCart(product, size, colorName, quantity);
    if (openDrawer) {
      setIsCartOpen(true);
    } else {
      setToast({ visible: true, productName: product.name, colorName, size });
    }
  };

  const handleInstantBuy = (product: Product, size: string, colorName: string, quantity: number = 1) => {
    if (product.stock <= 0 || product.out_of_stock_sizes?.includes(size)) return;
    setInstantCartItem(product, size, colorName, quantity);
    setSelectedProductForDetail(null);
    if (!user) {
      setPendingInstantCheckout(true);
      openAuthModal();
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleUpdateQty = (index: number, newQty: number) => {
    updateCartQty(index, newQty);
  };

  const handleRemoveItem = (index: number) => {
    removeCartItem(index);
  };

  const handleConfirmOrder = async (payload: any) => {
    const res = await dataStore.createOrder({ ...payload, cart_items: cartItems });
    if (res.success) {
      dataStore.invalidateCache();
      let prods = await dataStore.getProducts(selectedCategory, debouncedSearchQuery, selectedGender, sortBy);
      if (inStockOnly) {
        prods = prods.filter((p) => p.stock > 0);
      }
      setProducts(prods);
    }
    return res;
  };

  const limitedOfferProducts = products
    .filter((p) => p.is_sale || (p.original_price && p.original_price > p.price))
    .slice(0, 4);
  const limitedOfferIds = new Set(limitedOfferProducts.map((p) => p.id));
  const bestOfLifeWearProducts = products
    .filter((p) => !limitedOfferIds.has(p.id) && ((p.rating || 0) >= 4.6 || p.is_featured))
    .slice(0, 4);

  return {
    categories,
    products,
    selectedCategory,
    setSelectedCategory,
    selectedGender,
    setSelectedGender,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    inStockOnly,
    setInStockOnly,
    isLoading,
    visibleCount,
    setVisibleCount,
    cartItems,
    setCartItems,
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
    selectedProductForDetail,
    setSelectedProductForDetail,
    isGlobalSizeChartOpen,
    setIsGlobalSizeChartOpen,
    activeInfoModal,
    setActiveInfoModal,
    isMobileCategoryDrawerOpen,
    setIsMobileCategoryDrawerOpen,
    toast,
    setToast,
    getCategoryDisplayName,
    handleToggleWishlist,
    handleMoveToCart,
    handleAddToCart,
    handleInstantBuy,
    handleUpdateQty,
    handleRemoveItem,
    handleConfirmOrder,
    totalCartCount,
    limitedOfferProducts,
    bestOfLifeWearProducts,
    gridDensity,
    setGridDensity,
    refreshProducts,
  };
}
