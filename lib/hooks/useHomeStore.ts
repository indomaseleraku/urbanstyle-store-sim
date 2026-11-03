// lib/hooks/useHomeStore.ts
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product, Category, CartItem } from '@/lib/types';
import { dataStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { ModalType } from '@/components/InformationModals';

export function useHomeStore() {
  const searchParams = useSearchParams();
  const { openAuthModal } = useAuth();

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

  // Cart & Drawers
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState('J&T Express (Reguler)');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [isGlobalSizeChartOpen, setIsGlobalSizeChartOpen] = useState(false);
  const [activeInfoModal, setActiveInfoModal] = useState<ModalType>(null);
  const [isMobileCategoryDrawerOpen, setIsMobileCategoryDrawerOpen] = useState(false);

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
    setWishlist(dataStore.getWishlist());
  }, []);

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
    async function loadData() {
      setIsLoading(true);
      const cats = await dataStore.getCategories();
      let prods = await dataStore.getProducts(selectedCategory, debouncedSearchQuery, selectedGender, sortBy);
      if (inStockOnly) {
        prods = prods.filter((p) => p.stock > 0);
      }
      setCategories(cats);
      setProducts(prods);
      setIsLoading(false);
    }
    loadData();
  }, [selectedCategory, selectedGender, debouncedSearchQuery, sortBy, inStockOnly]);

  const getCategoryDisplayName = (slug: string) => {
    switch (slug) {
      case 'sale': return 'Promo 🔥';
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
    dataStore.toggleWishlist(product);
    setWishlist(dataStore.getWishlist());
  };

  const handleMoveToCart = (product: Product, size?: string) => {
    const chosenSize = size || product.sizes[0] || 'M';
    handleAddToCart(product, chosenSize, product.colors[0]?.name || 'Standard', 1, false);
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
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (it) => it.product.id === product.id && it.selected_size === size && it.selected_color === colorName
      );
      if (existingIdx !== -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + quantity;
        if (newQty <= product.stock) {
          updated[existingIdx].quantity = newQty;
        }
        return updated;
      }
      return [...prev, { product, selected_size: size, selected_color: colorName, quantity }];
    });

    if (openDrawer) {
      setIsCartOpen(true);
    } else {
      setToast({ visible: true, productName: product.name, colorName, size });
    }
  };

  const handleInstantBuy = (product: Product, size: string, colorName: string, quantity: number = 1) => {
    setCartItems([{ product, selected_size: size, selected_color: colorName, quantity }]);
    setSelectedProductForDetail(null);
    setIsCheckoutOpen(true);
  };

  const handleUpdateQty = (index: number, newQty: number) => {
    setCartItems((prev) => {
      if (newQty <= 0) return prev.filter((_, i) => i !== index);
      const updated = [...prev];
      if (newQty <= updated[index].product.stock) updated[index].quantity = newQty;
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirmOrder = async (payload: any) => {
    const res = await dataStore.createOrder({ ...payload, cart_items: cartItems });
    if (res.success) {
      const prods = await dataStore.getProducts(selectedCategory, searchQuery, selectedGender, sortBy);
      setProducts(prods);
    }
    return res;
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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
    isCartOpen,
    setIsCartOpen,
    selectedCourier,
    setSelectedCourier,
    isCheckoutOpen,
    setIsCheckoutOpen,
    wishlist,
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
  };
}
