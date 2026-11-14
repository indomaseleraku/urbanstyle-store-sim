// lib/services/productService.ts
// Product & Category Domain Service (Supabase Single Source of Truth)

import { Product, Category, Review } from '../types';
import { INITIAL_CATEGORIES } from '../data/categories.data';
import { INITIAL_PRODUCTS as OFFLINE_SEED_PRODUCTS } from '../data/products.data';
import { supabase, isSupabaseConfigured, checkSupabaseConfigured } from './supabaseClient';
import { mapDbProduct, sanitizeLifeWearImage } from './productMapper';

export { sanitizeLifeWearImage } from './productMapper';

// Local Memory State strictly for offline / unconfigured fallback
let localProducts: Product[] = [...OFFLINE_SEED_PRODUCTS];
let localWishlist: Product[] = [];

// In-Memory Performance Cache (TTL 60 detik)
let cachedCategories: Category[] | null = null;
let cachedRawProducts: Product[] | null = null;
let lastProductsFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000;

export const productService = {
  invalidateCache() {
    cachedCategories = null;
    cachedRawProducts = null;
    lastProductsFetchTime = 0;
  },

  async getCategories(): Promise<Category[]> {
    if (cachedCategories && cachedCategories.length > 0) {
      return cachedCategories;
    }
    if (checkSupabaseConfigured() && isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('id', { ascending: true });
        if (!error && data && data.length > 0) {
          cachedCategories = [{ id: 0, name: 'Semua Koleksi', slug: 'all' }, ...data];
          return cachedCategories;
        }
      } catch (err) {
        console.warn('Gagal mengambil kategori dari Supabase, memakai fallback lokal:', err);
      }
    }
    cachedCategories = [{ id: 0, name: 'Semua Koleksi', slug: 'all' }, ...INITIAL_CATEGORIES];
    return cachedCategories;
  },

  async getProducts(
    categorySlug: string = 'all',
    query: string = '',
    gender: string = 'all',
    sortBy: string = 'featured'
  ): Promise<Product[]> {
    const now = Date.now();
    const shouldRefresh = !cachedRawProducts || now - lastProductsFetchTime > CACHE_TTL_MS;

    if (shouldRefresh && checkSupabaseConfigured() && isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, categories(name, slug), reviews(*)')
          .order('id', { ascending: false });

        if (!error && data) {
          // Hanya tampilkan produk berstatus active (atau status NULL) di etalase
          const activeRows = data.filter((item: any) => !item.status || item.status === 'active');
          cachedRawProducts = activeRows.map(mapDbProduct);
          lastProductsFetchTime = now;
          localProducts = [...cachedRawProducts];
        }
      } catch (err) {
        console.warn('Supabase fetch products error:', err);
      }
    }

    if (!cachedRawProducts) {
      cachedRawProducts = localProducts.map((p) => ({
        ...p,
        image_url: sanitizeLifeWearImage(p.image_url),
        gallery_images:
          p.gallery_images?.map((g) => sanitizeLifeWearImage(g)) || [
            sanitizeLifeWearImage(p.image_url),
          ],
      }));
      lastProductsFetchTime = now;
    }

    let list = [...cachedRawProducts];

    if (categorySlug && categorySlug !== 'all') {
      if (categorySlug === 'sale') {
        list = list.filter((p) => p.is_sale || (p.original_price && p.original_price > p.price));
      } else if (categorySlug === 'pria') {
        list = list.filter((p) => p.gender === 'pria' || p.gender === 'unisex');
      } else if (categorySlug === 'wanita') {
        list = list.filter((p) => p.gender === 'wanita' || p.gender === 'unisex');
      } else if (categorySlug === 'polo') {
        list = list.filter((p) => p.category_id === 2 && p.name.toLowerCase().includes('polo'));
      } else if (categorySlug === 'kaos') {
        list = list.filter((p) => p.category_id === 2 && !p.name.toLowerCase().includes('polo'));
      } else if (categorySlug === 'hoodie') {
        list = list.filter(
          (p) =>
            p.category_id === 4 &&
            (p.name.toLowerCase().includes('hoodie') ||
              p.name.toLowerCase().includes('sweater') ||
              p.name.toLowerCase().includes('cardigan'))
        );
      } else if (categorySlug === 'jaket') {
        list = list.filter(
          (p) =>
            p.category_id === 4 &&
            !p.name.toLowerCase().includes('hoodie') &&
            !p.name.toLowerCase().includes('sweater') &&
            !p.name.toLowerCase().includes('cardigan')
        );
      } else if (categorySlug === 'celana-pendek') {
        list = list.filter(
          (p) =>
            p.category_id === 3 &&
            (p.name.toLowerCase().includes('short') || p.name.toLowerCase().includes('pendek'))
        );
      } else if (categorySlug === 'celana-panjang') {
        list = list.filter(
          (p) =>
            p.category_id === 3 &&
            !p.name.toLowerCase().includes('short') &&
            !p.name.toLowerCase().includes('pendek')
        );
      } else {
        const cats = cachedCategories || INITIAL_CATEGORIES;
        const cat = cats.find((c) => c.slug === categorySlug);
        list = list.filter((p) => p.category_id === cat?.id);
      }
    }

    if (gender && gender !== 'all') {
      if (gender === 'sale') {
        list = list.filter((p) => p.is_sale || (p.original_price && p.original_price > p.price));
      } else {
        list = list.filter((p) => p.gender === gender || p.gender === 'unisex');
      }
    }

    if (query && query.trim() !== '') {
      const qLower = query.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(qLower) ||
          p.description.toLowerCase().includes(qLower) ||
          p.fabric_details.toLowerCase().includes(qLower) ||
          p.colors.some(
            (c) =>
              c.name.toLowerCase().includes(qLower) ||
              (c.code && c.code.toLowerCase().includes(qLower))
          )
      );
    }

    switch (sortBy) {
      case 'price_low':
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
      case 'popular':
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        list.sort((a, b) => (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0));
        break;
      case 'featured':
      default:
        list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
    }

    return list;
  },

  async getProductById(id: number): Promise<Product | null> {
    if (checkSupabaseConfigured() && isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, categories(name, slug), reviews(*)')
          .eq('id', id)
          .single();
        if (!error && data) {
          return mapDbProduct(data);
        }
      } catch (err) {
        console.warn('Supabase fetch product by id error:', err);
      }
    }
    return localProducts.find((item) => item.id === id) || null;
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (checkSupabaseConfigured() && isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, categories(name, slug), reviews(*)')
          .eq('slug', slug)
          .single();
        if (!error && data) {
          return mapDbProduct(data);
        }
      } catch (err) {
        console.warn('Supabase fetch product by slug error:', err);
      }
    }
    return localProducts.find((item) => item.slug === slug) || null;
  },

  getWishlist(): Product[] {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('urbanstyle_wishlist');
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    return localWishlist;
  },

  toggleWishlist(product: Product): { inWishlist: boolean; count: number } {
    const current = this.getWishlist();
    const exists = current.some((p) => p.id === product.id);
    const updated = exists
      ? current.filter((p) => p.id !== product.id)
      : [...current, product];

    localWishlist = updated;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('urbanstyle_wishlist', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
    }

    return { inWishlist: !exists, count: updated.length };
  },

  async addReview(
    productId: number,
    review: Omit<Review, 'id' | 'created_at'>
  ): Promise<Review> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch(`/api/products/${productId}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(review),
        });
        const json = await res.json();
        if (res.ok && json?.success && json.review) {
          this.invalidateCache();
          return json.review as Review;
        }
        throw new Error(json?.message || 'Gagal mengirim ulasan ke server.');
      } catch (err) {
        if (err instanceof Error) throw err;
        throw new Error('Gagal terhubung ke server ulasan.');
      }
    } else if (checkSupabaseConfigured() && isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          product_id: productId,
          reviewer_name: review.reviewer_name,
          rating: review.rating,
          size_purchased: review.size_purchased,
          fit_rating: review.fit_rating,
          comment: review.comment,
        })
        .select('*')
        .single();

      if (!error && data) {
        this.invalidateCache();
        return {
          ...review,
          id: Number(data.id),
          created_at: String(data.created_at || new Date().toISOString()).slice(0, 10),
        };
      }
      throw new Error(error?.message || 'Gagal menyimpan ulasan ke Supabase.');
    }

    return {
      ...review,
      id: Date.now(),
      created_at: new Date().toISOString().split('T')[0],
    };
  },

  async updateStock(productId: number, newStock: number): Promise<boolean> {
    const val = Math.max(0, newStock);
    const p = localProducts.find((item) => item.id === productId);
    if (p) p.stock = val;
    if (cachedRawProducts) {
      const cachedP = cachedRawProducts.find((item) => item.id === productId);
      if (cachedP) cachedP.stock = val;
    }
    if (checkSupabaseConfigured() && isSupabaseConfigured && supabase) {
      try {
        await supabase.from('products').update({ stock: val }).eq('id', productId);
      } catch (err) {
        console.warn('Update stock cloud error:', err);
      }
    }
    return true;
  },

  async addProduct(newP: Omit<Product, 'id'>): Promise<Product> {
    const created: Product = { ...newP, id: localProducts.length + 1 };
    localProducts.unshift(created);
    if (checkSupabaseConfigured() && isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .insert({
            category_id: newP.category_id,
            name: newP.name,
            slug: newP.slug,
            price: newP.price,
            original_price: newP.original_price,
            stock: newP.stock,
            description: newP.description,
            fabric_details: newP.fabric_details,
            colors: newP.colors,
            sizes: newP.sizes,
            image_url: newP.image_url,
            is_new: newP.is_new,
            is_featured: newP.is_featured,
          })
          .select()
          .single();
        if (!error && data) created.id = data.id;
      } catch (err) {
        console.warn('Gagal simpan produk baru ke Supabase:', err);
      }
    }
    this.invalidateCache();
    return created;
  },

  async updateProduct(
    productId: number,
    updateData: Partial<Product>
  ): Promise<Product | null> {
    const p = localProducts.find((item) => item.id === productId);
    if (p) Object.assign(p, updateData);
    if (checkSupabaseConfigured() && isSupabaseConfigured && supabase) {
      try {
        await supabase.from('products').update(updateData).eq('id', productId);
      } catch (err) {
        console.warn('Gagal perbarui produk di Supabase:', err);
      }
    }
    this.invalidateCache();
    return p || null;
  },

  async deleteProduct(productId: number): Promise<boolean> {
    localProducts = localProducts.filter((item) => item.id !== productId);
    if (checkSupabaseConfigured() && isSupabaseConfigured && supabase) {
      try {
        await supabase.from('products').delete().eq('id', productId);
      } catch (err) {
        console.warn('Gagal hapus produk di Supabase:', err);
      }
    }
    this.invalidateCache();
    return true;
  },

  _getLocalProducts(): Product[] {
    return localProducts;
  },
  _getCachedRawProducts(): Product[] | null {
    return cachedRawProducts;
  },
};
