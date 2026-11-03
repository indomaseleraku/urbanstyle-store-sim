// lib/services/productService.ts
// Product & Category Domain Service (CRUD, Image Sanitization, Memory Cache)

import { Product, Category, Review } from '../types';
import { INITIAL_CATEGORIES } from '../data/categories.data';
import { INITIAL_PRODUCTS as SEED_PRODUCTS } from '../data/products.data';
import { supabase, isSupabaseConfigured } from './supabaseClient';

// Local Memory State untuk Zero-Crash Fallback
let localProducts: Product[] = [...SEED_PRODUCTS];
let localWishlist: Product[] = [];

// In-Memory Performance Cache (TTL 60 detik)
let cachedCategories: Category[] | null = null;
let cachedRawProducts: Product[] | null = null;
let lastProductsFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000;

// Peta Penggantian Gambar Supabase Cloud untuk Konsistensi Estetika LifeWear Uniqlo
const IMAGE_REPLACEMENTS: Record<string, string> = {
  'photo-1551028719-00167b16eac5': 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80',
  'photo-1521572267360-ee0c2909d518': 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80',
  'photo-1550614000-4895a10e1bfd': 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80',
};

export function sanitizeLifeWearImage(url?: string): string {
  if (!url) return '';
  for (const [key, replacement] of Object.entries(IMAGE_REPLACEMENTS)) {
    if (url.includes(key)) return replacement;
  }
  return url;
}

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
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('categories').select('*').order('id', { ascending: true });
        if (!error && data && data.length > 0) {
          cachedCategories = [{ id: 0, name: 'Semua Koleksi', slug: 'all' }, ...data];
          return cachedCategories;
        }
      } catch (err) {
        console.warn('Gagal koneksi Supabase, beralih ke local storage:', err);
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

    if (!cachedRawProducts || now - lastProductsFetchTime > CACHE_TTL_MS) {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('products')
            .select('*, categories(name, slug)')
            .order('id', { ascending: false });

          if (!error && data && data.length > 0) {
            cachedRawProducts = data.map((item: any) => {
              const rich = SEED_PRODUCTS.find(p => p.id === item.id || p.slug === item.slug);
              const mainImg = sanitizeLifeWearImage(rich?.image_url || item.image_url);
              const gallery = (rich?.gallery_images || item.gallery_images || [mainImg]).map((g: string) => sanitizeLifeWearImage(g));
              return {
                ...rich,
                ...item,
                image_url: mainImg,
                gender: item.gender || rich?.gender || 'unisex',
                care_instructions: item.care_instructions || rich?.care_instructions || 'Cuci dengan air dingin di bawah 30°C. Jangan gunakan pemutih.',
                gallery_images: gallery,
                colors: (rich?.colors || item.colors || []).map((c: any) => ({
                  ...c,
                  image_url: sanitizeLifeWearImage(c.image_url),
                })),
                size_measurements: item.size_measurements || rich?.size_measurements || [],
                reviews: item.reviews || rich?.reviews || [],
                rating: item.rating || rich?.rating || 4.8,
                reviews_count: item.reviews_count || rich?.reviews_count || 15,
                category_name: item.categories?.name || rich?.category_name || 'Koleksi',
              };
            });
            const dbIds = new Set(data.map((item: any) => item.id));
            const missingInDb = SEED_PRODUCTS.filter(p => !dbIds.has(p.id));
            if (missingInDb.length > 0) {
              const sanitizedMissing = missingInDb.map(p => ({
                ...p,
                image_url: sanitizeLifeWearImage(p.image_url),
                gallery_images: p.gallery_images?.map((g: string) => sanitizeLifeWearImage(g)) || [sanitizeLifeWearImage(p.image_url)],
              }));
              cachedRawProducts = [...cachedRawProducts, ...sanitizedMissing];
            }
            lastProductsFetchTime = now;
            localProducts = [...cachedRawProducts];
          }
        } catch (err) {
          console.warn('Supabase fetch error, using local fallback:', err);
        }
      }

      if (!cachedRawProducts) {
        cachedRawProducts = localProducts.map(p => ({
          ...p,
          image_url: sanitizeLifeWearImage(p.image_url),
          gallery_images: p.gallery_images?.map((g: string) => sanitizeLifeWearImage(g)) || [sanitizeLifeWearImage(p.image_url)],
        }));
        lastProductsFetchTime = now;
      }
    }

    let list = [...(cachedRawProducts || localProducts)];

    if (categorySlug && categorySlug !== 'all') {
      if (categorySlug === 'sale') {
        list = list.filter(p => p.is_sale || (p.original_price && p.original_price > p.price));
      } else if (categorySlug === 'pria') {
        list = list.filter(p => p.gender === 'pria' || p.gender === 'unisex');
      } else if (categorySlug === 'wanita') {
        list = list.filter(p => p.gender === 'wanita' || p.gender === 'unisex');
      } else if (categorySlug === 'polo') {
        list = list.filter(p => p.category_id === 2 && p.name.toLowerCase().includes('polo'));
      } else if (categorySlug === 'kaos') {
        list = list.filter(p => p.category_id === 2 && !p.name.toLowerCase().includes('polo'));
      } else if (categorySlug === 'hoodie') {
        list = list.filter(p => p.category_id === 4 && (p.name.toLowerCase().includes('hoodie') || p.name.toLowerCase().includes('sweater') || p.name.toLowerCase().includes('cardigan')));
      } else if (categorySlug === 'jaket') {
        list = list.filter(p => p.category_id === 4 && !p.name.toLowerCase().includes('hoodie') && !p.name.toLowerCase().includes('sweater') && !p.name.toLowerCase().includes('cardigan'));
      } else if (categorySlug === 'celana-pendek') {
        list = list.filter(p => p.category_id === 3 && (p.name.toLowerCase().includes('short') || p.name.toLowerCase().includes('pendek')));
      } else if (categorySlug === 'celana-panjang') {
        list = list.filter(p => p.category_id === 3 && !p.name.toLowerCase().includes('short') && !p.name.toLowerCase().includes('pendek'));
      } else {
        list = list.filter(p => {
          const cat = INITIAL_CATEGORIES.find(c => c.slug === categorySlug);
          return p.category_id === cat?.id;
        });
      }
    }

    if (gender && gender !== 'all') {
      if (gender === 'sale') {
        list = list.filter(p => p.is_sale || (p.original_price && p.original_price > p.price));
      } else {
        list = list.filter(p => p.gender === gender || p.gender === 'unisex');
      }
    }

    if (query && query.trim() !== '') {
      const qLower = query.toLowerCase().trim();
      list = list.filter(p => 
        p.name.toLowerCase().includes(qLower) ||
        p.description.toLowerCase().includes(qLower) ||
        p.fabric_details.toLowerCase().includes(qLower) ||
        p.colors.some(c => c.name.toLowerCase().includes(qLower) || (c.code && c.code.toLowerCase().includes(qLower)))
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
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, categories(name, slug)')
          .eq('id', id)
          .single();
        if (!error && data) {
          const rich = SEED_PRODUCTS.find(p => p.id === data.id || p.slug === data.slug);
          return {
            ...rich,
            ...data,
            gender: data.gender || rich?.gender || 'unisex',
            care_instructions: data.care_instructions || rich?.care_instructions || 'Cuci dengan air dingin di bawah 30°C. Jangan gunakan pemutih.',
            gallery_images: (data.gallery_images && data.gallery_images.length > 0)
              ? data.gallery_images
              : (rich?.gallery_images || [data.image_url]),
            size_measurements: data.size_measurements || rich?.size_measurements || [],
            reviews: data.reviews || rich?.reviews || [],
            rating: data.rating || rich?.rating || 4.8,
            reviews_count: data.reviews_count || rich?.reviews_count || 15,
            category_name: data.categories?.name || rich?.category_name || 'Koleksi',
          };
        }
      } catch (err) {
        console.warn('Supabase fetch product by id error, fallback to local:', err);
      }
    }
    const p = localProducts.find(item => item.id === id);
    return p || null;
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, categories(name, slug)')
          .eq('slug', slug)
          .single();
        if (!error && data) {
          const rich = SEED_PRODUCTS.find(p => p.id === data.id || p.slug === data.slug);
          return {
            ...rich,
            ...data,
            gender: data.gender || rich?.gender || 'unisex',
            care_instructions: data.care_instructions || rich?.care_instructions || 'Cuci dengan air dingin di bawah 30°C. Jangan gunakan pemutih.',
            gallery_images: (data.gallery_images && data.gallery_images.length > 0)
              ? data.gallery_images
              : (rich?.gallery_images || [data.image_url]),
            size_measurements: data.size_measurements || rich?.size_measurements || [],
            reviews: data.reviews || rich?.reviews || [],
            rating: data.rating || rich?.rating || 4.8,
            reviews_count: data.reviews_count || rich?.reviews_count || 15,
            category_name: data.categories?.name || rich?.category_name || 'Koleksi',
          };
        }
      } catch (err) {
        console.warn('Supabase fetch product by slug error, fallback to local:', err);
      }
    }
    const p = localProducts.find(item => item.slug === slug);
    return p || null;
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
    let current = this.getWishlist();
    const exists = current.some(p => p.id === product.id);
    let updated: Product[];

    if (exists) {
      updated = current.filter(p => p.id !== product.id);
    } else {
      updated = [...current, product];
    }

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

  async addReview(productId: number, review: Omit<Review, 'id' | 'created_at'>): Promise<Review> {
    const targetProd = localProducts.find(p => p.id === productId);
    const newRev: Review = {
      ...review,
      id: Date.now(),
      created_at: new Date().toISOString().split('T')[0],
    };

    if (targetProd) {
      if (!targetProd.reviews) targetProd.reviews = [];
      targetProd.reviews.unshift(newRev);
      targetProd.reviews_count = targetProd.reviews.length;
      const totalR = targetProd.reviews.reduce((s, r) => s + r.rating, 0);
      targetProd.rating = Number((totalR / targetProd.reviews.length).toFixed(1));
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('reviews').insert({
          product_id: productId,
          reviewer_name: review.reviewer_name,
          rating: review.rating,
          comment: review.comment,
        });
      } catch (err) {
        console.warn('Gagal sinkron ulasan ke Supabase:', err);
      }
    }

    return newRev;
  },

  async updateStock(productId: number, newStock: number): Promise<boolean> {
    const val = Math.max(0, newStock);
    const p = localProducts.find(item => item.id === productId);
    if (p) {
      p.stock = val;
    }
    if (cachedRawProducts) {
      const cachedP = cachedRawProducts.find(item => item.id === productId);
      if (cachedP) {
        cachedP.stock = val;
      }
    }
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('products').update({ stock: Math.max(0, newStock) }).eq('id', productId);
      } catch (err) {
        console.warn('Update stock cloud error:', err);
      }
    }
    return true;
  },

  async addProduct(newP: Omit<Product, 'id'>): Promise<Product> {
    const created: Product = {
      ...newP,
      id: localProducts.length + 1,
    };
    localProducts.unshift(created);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('products').insert({
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
        }).select().single();
        if (!error && data) {
          created.id = data.id;
        }
      } catch (err) {
        console.warn('Gagal simpan produk baru ke Supabase:', err);
      }
    }

    return created;
  },

  async updateProduct(productId: number, updateData: Partial<Product>): Promise<Product | null> {
    const p = localProducts.find(item => item.id === productId);
    if (p) {
      Object.assign(p, updateData);
    }
    if (cachedRawProducts) {
      const cachedP = cachedRawProducts.find(item => item.id === productId);
      if (cachedP) {
        Object.assign(cachedP, updateData);
      }
    }
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('products').update(updateData).eq('id', productId);
      } catch (err) {
        console.warn('Gagal perbarui produk di Supabase:', err);
      }
    }
    return p || null;
  },

  async deleteProduct(productId: number): Promise<boolean> {
    localProducts = localProducts.filter(item => item.id !== productId);
    if (cachedRawProducts) {
      cachedRawProducts = cachedRawProducts.filter(item => item.id !== productId);
    }
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('products').delete().eq('id', productId);
      } catch (err) {
        console.warn('Gagal hapus produk di Supabase:', err);
      }
    }
    return true;
  },

  // Helper internal untuk orderService
  _getLocalProducts(): Product[] {
    return localProducts;
  },
  _getCachedRawProducts(): Product[] | null {
    return cachedRawProducts;
  }
};
