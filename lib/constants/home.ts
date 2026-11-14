// lib/constants/home.ts
// Data statis untuk komponen beranda (CategoryBubbles & LookbookSlider)

export interface CategoryTile {
  id: string;
  name: string;
  tagline: string;
  slug: string;
  imageUrl: string;
  isSpecial?: boolean;
}

export const CATEGORY_TILES: CategoryTile[] = [
  {
    id: 'kaos',
    name: 'Kaos',
    tagline: 'Boxy 280 GSM',
    slug: 'kaos',
    imageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'kemeja',
    name: 'Kemeja',
    tagline: 'Flannel & Oxford',
    slug: 'kemeja',
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'polo',
    name: 'Polo Shirt',
    tagline: 'Kerah Rajut',
    slug: 'polo',
    imageUrl: 'https://images.unsplash.com/photo-1625910513413-7fc2a8536b3f?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'jaket',
    name: 'Jaket',
    tagline: 'Parka & Luaran',
    slug: 'jaket',
    imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'hoodie',
    name: 'Hoodie & Sweater',
    tagline: 'French Terry & Rajut',
    slug: 'hoodie',
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'celana-panjang',
    name: 'Celana Panjang',
    tagline: 'Chino & Ankle',
    slug: 'celana-panjang',
    imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'celana-pendek',
    name: 'Celana Pendek',
    tagline: 'Shorts Santai',
    slug: 'celana-pendek',
    imageUrl: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'sale',
    name: 'Promo',
    tagline: 'Hemat s/d 30%',
    slug: 'sale',
    imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=400&q=80',
    isSpecial: true,
  },
];

export interface LookbookSlide {
  id: number;
  tag: string;
  title: string;
  subtitle: string;
  categorySlug: string;
  bgImage: string;
  ctaText: string;
}

export const LOOKBOOK_SLIDES: LookbookSlide[] = [
  {
    id: 1,
    tag: 'AUTUMN / WINTER 2026 • LIFEWEAR DROP',
    title: 'Modern Utility Essentials',
    subtitle: 'Kemeja Flannel Double-Brushed & Celana Ankle Ultra Stretch untuk gaya hidup dinamis kampus dan kerja.',
    categorySlug: 'kemeja',
    bgImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1280&q=75&fm=webp',
    ctaText: 'Lihat Koleksi Kemeja',
  },
  {
    id: 2,
    tag: 'INOVASI TEKNOLOGI TEKSTIL',
    title: 'AIRism & Heavyweight Cotton',
    subtitle: 'Siluet Boxy 280 GSM tebal tahan kusut dan polo berpori sejuk yang siap menemani cuaca tropis sepanjang hari.',
    categorySlug: 'kaos',
    bgImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1280&q=75&fm=webp',
    ctaText: 'Belanja Kaos & AIRism',
  },
  {
    id: 3,
    tag: 'PERLINDUNGAN CUACA RINGAN',
    title: 'Ultra-Light Outerwear Series',
    subtitle: 'Jaket Parka Proteksi UV UPF 40+ saku lipat dan French Terry Hoodie katun murni untuk kenyamanan tanpa batas.',
    categorySlug: 'jaket',
    bgImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1280&q=75&fm=webp',
    ctaText: 'Eksplorasi Outerwear',
  },
];
