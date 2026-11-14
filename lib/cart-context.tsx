'use client';

// lib/cart-context.tsx
// Persistent Cart Context backed by browser localStorage + multi-tab storage sync

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, CartItem } from './types';

const CART_STORAGE_KEY = 'urbanstyle_cart';
const COURIER_STORAGE_KEY = 'urbanstyle_courier';

interface CartContextType {
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  selectedCourier: string;
  setSelectedCourier: (courier: string) => void;
  totalCartCount: number;
  addToCart: (product: Product, size: string, colorName: string, quantity?: number) => void;
  setInstantCartItem: (product: Product, size: string, colorName: string, quantity?: number) => void;
  updateCartQty: (index: number, newQty: number) => void;
  removeCartItem: (index: number) => void;
  clearCart: () => void;
  syncCartWithProducts: (catalog: Product[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function readStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCourier, setSelectedCourierState] = useState<string>('J&T Express (Reguler)');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCartItems(readStoredCart());
    try {
      const savedCourier = localStorage.getItem(COURIER_STORAGE_KEY);
      if (savedCourier) setSelectedCourierState(savedCourier);
    } catch {}
    setHydrated(true);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY) {
        setCartItems(readStoredCart());
      } else if (e.key === COURIER_STORAGE_KEY && e.newValue) {
        setSelectedCourierState(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {}
  }, [cartItems, hydrated]);

  const setSelectedCourier = useCallback((courier: string) => {
    setSelectedCourierState(courier);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(COURIER_STORAGE_KEY, courier);
      } catch {}
    }
  }, []);

  const addToCart = useCallback(
    (product: Product, size: string, colorName: string, quantity: number = 1) => {
      if (product.stock <= 0 || product.out_of_stock_sizes?.includes(size)) {
        return;
      }
      const safeQty = Math.max(1, quantity);
      setCartItems((prev) => {
        const existingIdx = prev.findIndex(
          (it) =>
            it.product.id === product.id &&
            it.selected_size === size &&
            it.selected_color === colorName
        );
        const otherQty = prev.reduce(
          (sum, it, idx) =>
            idx !== existingIdx && it.product.id === product.id ? sum + it.quantity : sum,
          0
        );
        const maxAllowed = Math.max(0, product.stock - otherQty);
        if (maxAllowed <= 0) return prev;

        if (existingIdx !== -1) {
          const updated = [...prev];
          const nextQty = Math.min(updated[existingIdx].quantity + safeQty, maxAllowed);
          updated[existingIdx] = {
            ...updated[existingIdx],
            product,
            quantity: nextQty,
          };
          return updated;
        }
        return [
          ...prev,
          {
            product,
            selected_size: size,
            selected_color: colorName,
            quantity: Math.min(safeQty, maxAllowed),
          },
        ];
      });
    },
    []
  );

  const setInstantCartItem = useCallback(
    (product: Product, size: string, colorName: string, quantity: number = 1) => {
      if (product.stock <= 0 || product.out_of_stock_sizes?.includes(size)) {
        return;
      }
      setCartItems([
        {
          product,
          selected_size: size,
          selected_color: colorName,
          quantity: Math.max(1, Math.min(quantity, product.stock)),
        },
      ]);
    },
    []
  );

  const updateCartQty = useCallback((index: number, newQty: number) => {
    setCartItems((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      if (newQty <= 0) return prev.filter((_, i) => i !== index);
      const target = prev[index];
      const otherQty = prev.reduce(
        (sum, it, i) => (i !== index && it.product.id === target.product.id ? sum + it.quantity : sum),
        0
      );
      const maxAllowed = Math.max(0, target.product.stock - otherQty);
      if (maxAllowed <= 0) {
        return prev.filter((_, i) => i !== index);
      }
      const updated = [...prev];
      updated[index] = { ...target, quantity: Math.min(newQty, maxAllowed) };
      return updated;
    });
  }, []);

  const removeCartItem = useCallback((index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const syncCartWithProducts = useCallback((catalog: Product[]) => {
    if (!catalog || catalog.length === 0) return;
    const catalogMap = new Map<number, Product>(catalog.map((p) => [p.id, p]));
    setCartItems((prev) => {
      if (prev.length === 0) return prev;
      const usedStock = new Map<number, number>();
      let changed = false;
      const synced: CartItem[] = [];

      for (const item of prev) {
        const fresh = catalogMap.get(item.product.id);
        if (!fresh || fresh.stock <= 0 || fresh.out_of_stock_sizes?.includes(item.selected_size)) {
          changed = true;
          continue;
        }
        const alreadyUsed = usedStock.get(fresh.id) || 0;
        const remaining = Math.max(0, fresh.stock - alreadyUsed);
        if (remaining <= 0) {
          changed = true;
          continue;
        }
        const clampedQty = Math.min(item.quantity, remaining);
        usedStock.set(fresh.id, alreadyUsed + clampedQty);

        if (
          clampedQty !== item.quantity ||
          fresh.price !== item.product.price ||
          fresh.stock !== item.product.stock ||
          fresh.name !== item.product.name
        ) {
          changed = true;
        }
        synced.push({ ...item, product: fresh, quantity: clampedQty });
      }

      if (!changed && synced.length === prev.length) return prev;
      return synced;
    });
  }, []);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
