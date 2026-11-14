'use client';

// lib/wishlist-context.tsx
// Hybrid Wishlist Context: localStorage for Guests, synced to Supabase `wishlists` table for Logged-in Members

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from './types';
import { useAuth } from './auth-context';

const WISHLIST_STORAGE_KEY = 'urbanstyle_wishlist';

interface WishlistContextType {
  wishlist: Product[];
  isWishlisted: (productId: number) => boolean;
  toggleWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  wishlistError: string | null;
  clearWishlistError: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

function readGuestWishlist(): Product[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeGuestWishlist(items: Product[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [wishlistError, setWishlistError] = useState<string | null>(null);
  const wishlistRef = React.useRef<Product[]>([]);
  const prevUserIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    wishlistRef.current = wishlist;
  }, [wishlist]);

  useEffect(() => {
    if (authLoading) return;
    let active = true;

    async function hydrateWishlist() {
      setWishlistError(null);
      if (!isAuthenticated || !user?.id) {
        prevUserIdRef.current = null;
        if (active) setWishlist(readGuestWishlist());
        return;
      }

      if (prevUserIdRef.current !== user.id) {
        prevUserIdRef.current = user.id;
        setWishlist([]);
      }

      const guestItems = readGuestWishlist();
      const guestIds = guestItems.map((p) => Number(p.id)).filter((id) => id > 0);

      try {
        if (guestIds.length > 0) {
          const res = await fetch('/api/account/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_ids: guestIds }),
          });
          if (res.ok) {
            const json = await res.json();
            if (active && json?.success && Array.isArray(json.data)) {
              setWishlist(json.data);
              writeGuestWishlist([]);
              return;
            }
          }
        }

        const res = await fetch('/api/account/wishlist', { cache: 'no-store' });
        if (res.status === 401) {
          if (active) setWishlist([]);
          return;
        }
        if (res.ok) {
          const json = await res.json();
          if (active && json?.success && Array.isArray(json.data)) {
            setWishlist(json.data);
            return;
          }
        }
      } catch {
        if (active) setWishlistError('Gagal menyinkronkan wishlist dengan server.');
      }
    }

    hydrateWishlist();
    return () => {
      active = false;
    };
  }, [authLoading, isAuthenticated, user?.id]);

  const toggleWishlist = useCallback(
    async (product: Product) => {
      setWishlistError(null);
      const current = wishlistRef.current;
      const exists = current.some((p) => p.id === product.id);
      const nextList = exists
        ? current.filter((p) => p.id !== product.id)
        : [product, ...current];
      setWishlist(nextList);

      if (!isAuthenticated || !user?.id) {
        writeGuestWishlist(nextList);
        return;
      }

      try {
        const res = await fetch('/api/account/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: product.id }),
        });
        if (!res.ok) {
          setWishlist(current);
          setWishlistError('Gagal memperbarui favorit ke server.');
          return;
        }
        const json = await res.json();
        if (json?.success && Array.isArray(json.data)) {
          setWishlist(json.data);
        }
      } catch {
        setWishlist(current);
        setWishlistError('Koneksi gagal saat memperbarui favorit.');
      }
    },
    [isAuthenticated, user?.id]
  );

  const removeFromWishlist = useCallback(
    async (productId: number) => {
      setWishlistError(null);
      const current = wishlistRef.current;
      const nextList = current.filter((p) => p.id !== productId);
      setWishlist(nextList);

      if (!isAuthenticated || !user?.id) {
        writeGuestWishlist(nextList);
        return;
      }

      try {
        const res = await fetch(`/api/account/wishlist?product_id=${encodeURIComponent(String(productId))}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          setWishlist(current);
          setWishlistError('Gagal menghapus produk dari favorit.');
          return;
        }
        const json = await res.json();
        if (json?.success && Array.isArray(json.data)) {
          setWishlist(json.data);
        }
      } catch {
        setWishlist(current);
        setWishlistError('Koneksi gagal saat menghapus favorit.');
      }
    },
    [isAuthenticated, user?.id]
  );

  const clearWishlistError = useCallback(() => {
    setWishlistError(null);
  }, []);

  const isWishlisted = useCallback(
    (productId: number) => wishlist.some((p) => p.id === productId),
    [wishlist]
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isWishlisted,
        toggleWishlist,
        removeFromWishlist,
        wishlistError,
        clearWishlistError,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};
