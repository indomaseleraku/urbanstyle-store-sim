// lib/services/productMapper.ts
// Shared mapper converting Supabase `products` + joined `categories` & `reviews` into storefront `Product`

import { Product, Review } from '../types';

const IMAGE_REPLACEMENTS: Record<string, string> = {
  'photo-1551028719-00167b16eac5': 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80',
  'photo-1521572267360-ee0c2909d518': 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80',
  'photo-1550614000-4895a10e1bfd': 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80',
};

const VALID_FIT_RATINGS: Review['fit_rating'][] = [
  'Pas Sesuai Ukuran',
  'Agak Longgar',
  'Agak Sempit',
];

export function sanitizeLifeWearImage(url?: string): string {
  if (!url) return '';
  for (const [key, replacement] of Object.entries(IMAGE_REPLACEMENTS)) {
    if (url.includes(key)) return replacement;
  }
  return url;
}

export function normalizeFitRating(value?: string | null): Review['fit_rating'] {
  if (value && VALID_FIT_RATINGS.includes(value as Review['fit_rating'])) {
    return value as Review['fit_rating'];
  }
  return 'Pas Sesuai Ukuran';
}

export function mapDbReview(row: any): Review {
  return {
    id: Number(row.id),
    reviewer_name: String(row.reviewer_name || 'Pelanggan'),
    rating: Math.min(5, Math.max(1, Number(row.rating) || 5)),
    size_purchased: String(row.size_purchased || 'M'),
    fit_rating: normalizeFitRating(row.fit_rating),
    comment: String(row.comment || ''),
    created_at: row.created_at ? String(row.created_at).slice(0, 10) : '',
  };
}

export function mapDbProduct(item: any): Product {
  const mainImg = sanitizeLifeWearImage(item.image_url);
  const rawGallery: string[] =
    Array.isArray(item.gallery_images) && item.gallery_images.length > 0
      ? item.gallery_images
      : mainImg
      ? [mainImg]
      : [];
  const gallery = rawGallery.map((g) => sanitizeLifeWearImage(g)).filter(Boolean);

  const rawColors = Array.isArray(item.colors) ? item.colors : [];
  const colors = rawColors.map((c: any) => ({
    ...c,
    image_url: sanitizeLifeWearImage(c?.image_url) || mainImg,
  }));

  const rawReviews = Array.isArray(item.reviews) ? item.reviews : [];
  const reviews = [...rawReviews]
    .sort((a, b) => Number(b.id || 0) - Number(a.id || 0))
    .map(mapDbReview);

  const price = Number(item.price) || 0;
  const originalPrice = item.original_price != null ? Number(item.original_price) : undefined;

  return {
    id: Number(item.id),
    category_id: Number(item.category_id) || 0,
    category_name: item.categories?.name || item.category_name || 'Koleksi',
    name: String(item.name || ''),
    slug: String(item.slug || ''),
    gender: (item.gender as Product['gender']) || 'unisex',
    price,
    original_price: originalPrice,
    stock: Number(item.stock) || 0,
    description: String(item.description || ''),
    fabric_details: String(item.fabric_details || '100% Katun Pilihan LifeWear'),
    care_instructions: String(
      item.care_instructions || 'Cuci dengan air dingin di bawah 30°C. Jangan gunakan pemutih.'
    ),
    colors,
    sizes: Array.isArray(item.sizes) && item.sizes.length > 0 ? item.sizes : ['S', 'M', 'L', 'XL'],
    out_of_stock_sizes: Array.isArray(item.out_of_stock_sizes) ? item.out_of_stock_sizes : [],
    size_measurements: Array.isArray(item.size_measurements) ? item.size_measurements : [],
    image_url: mainImg,
    gallery_images: gallery,
    rating: item.rating != null ? Number(item.rating) : 0,
    reviews_count: item.reviews_count != null ? Number(item.reviews_count) : reviews.length,
    reviews,
    is_new: Boolean(item.is_new),
    is_featured: Boolean(item.is_featured),
    is_sale: Boolean(item.is_sale || (originalPrice && originalPrice > price)),
  };
}
