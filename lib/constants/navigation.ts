// lib/constants/navigation.ts

export interface MegaMenuLink {
  label: string;
  category: string;
  search?: string;
  sort?: string;
  badge?: string;
  badgeStyle?: 'red' | 'black' | 'gray' | 'blue' | 'yellow';
}

export interface MegaMenuColumn {
  title: string;
  enTitle: string;
  links: MegaMenuLink[];
}

export interface MegaMenuData {
  genderTitle: string;
  subtitle: string;
  columns: MegaMenuColumn[];
  lookbook: {
    tag: string;
    title: string;
    subtitle: string;
    desc: string;
    imageUrl: string;
    category: string;
    search?: string;
  };
}

export const POPULAR_KEYWORDS = ['Flannel', 'AIRism', 'Chino', 'Parka', 'Heavyweight', 'Oversized'];

export const MEN_MEGA_MENU: MegaMenuData = {
  genderTitle: 'PRIA',
  subtitle: 'Siluet Esensial & Busana Harian Minimalis Tokyo',
  columns: [
    {
      title: 'ATASAN',
      enTitle: 'Tops',
      links: [
        { label: 'Semua Atasan', category: 'all', search: 'atasan' },
        { label: 'Kaos & T-Shirt Santai', category: 'kaos', search: '' },
        { label: 'Kaos AIRism Serat Sejuk', category: 'kaos', search: 'AIRism', badge: 'AIRism', badgeStyle: 'blue' },
        { label: 'Kemeja Flannel Kotak', category: 'kemeja', search: 'Flannel', badge: 'Populer', badgeStyle: 'gray' },
        { label: 'Kemeja Kerja & Oxford', category: 'kemeja', search: 'Oxford' },
        { label: 'Polo Shirt Katun', category: 'kaos', search: 'Polo' },
        { label: 'Sweatshirt & Hoodie', category: 'jaket', search: 'Hoodie' },
      ],
    },
    {
      title: 'BAWAHAN',
      enTitle: 'Bottoms',
      links: [
        { label: 'Semua Bawahan', category: 'celana', search: '' },
        { label: 'Celana Chino & Ankle', category: 'celana', search: 'Chino', badge: 'Stretch', badgeStyle: 'gray' },
        { label: 'Celana Smart Pants', category: 'celana', search: 'Ankle' },
        { label: 'Jeans & Selvedge Denim', category: 'celana', search: 'Jeans' },
        { label: 'Celana Pendek (Shorts)', category: 'celana', search: 'Short' },
        { label: 'Celana Rileks & Jogger', category: 'celana', search: 'Jogger' },
        { label: 'Celana Kargo & Utilitas', category: 'celana', search: 'Kargo' },
      ],
    },
    {
      title: 'LUARAN',
      enTitle: 'Outerwear',
      links: [
        { label: 'Semua Luaran', category: 'jaket', search: '' },
        { label: 'Parka Saku Proteksi UV', category: 'jaket', search: 'Parka', badge: 'UV Cut', badgeStyle: 'yellow' },
        { label: 'Jaket Kasual & Workwear', category: 'jaket', search: 'Jaket' },
        { label: 'Jaket Fleece Hangat', category: 'jaket', search: 'Fleece' },
        { label: 'Cardigan & Sweater Rajut', category: 'jaket', search: 'Cardigan' },
        { label: 'Luaran Tahan Air & Angin', category: 'jaket', search: 'Windproof' },
      ],
    },
    {
      title: 'KOLEKSI KHUSUS',
      enTitle: 'Featured & Offers',
      links: [
        { label: 'Limited Offer (Penawaran Spesial)', category: 'sale', badge: 'LIMITED OFFER', badgeStyle: 'red' },
        { label: 'Koleksi Terbaru (New Arrivals)', category: 'all', sort: 'newest', badge: 'NEW', badgeStyle: 'black' },
        { label: 'Best of LifeWear (Paling Dicari)', category: 'all', sort: 'popular', badge: '★ 4.8+', badgeStyle: 'yellow' },
        { label: 'Filosofi Katun LifeWear', category: 'kemeja' },
        { label: 'Lihat Semua Produk Pria', category: 'all' },
      ],
    },
  ],
  lookbook: {
    tag: 'LOOKBOOK 2026',
    title: 'Koleksi Esensial Pria',
    subtitle: 'SILUET ESENSIAL HARIAN',
    desc: 'Paduan kemeja flannel katun murni double-brushed dan celana chino elastis untuk kenyamanan aktivitas setiap hari.',
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=700&q=80',
    category: 'all',
  },
};

export const WOMEN_MEGA_MENU: MegaMenuData = {
  genderTitle: 'WANITA',
  subtitle: 'Kenyamanan Anggun & Siluet Esensial Wanita',
  columns: [
    {
      title: 'ATASAN',
      enTitle: 'Tops',
      links: [
        { label: 'Semua Atasan Wanita', category: 'all', search: 'atasan' },
        { label: 'Kaos Katun Lembut & T-Shirt', category: 'kaos', search: '' },
        { label: 'Atasan & Kamisol AIRism', category: 'kaos', search: 'AIRism', badge: 'AIRism', badgeStyle: 'blue' },
        { label: 'Kemeja Flannel & Blus Rileks', category: 'kemeja', search: 'Flannel', badge: 'Populer', badgeStyle: 'gray' },
        { label: 'Blus Rayon Sutra Sintetis', category: 'kemeja', search: 'Blus' },
        { label: 'Cardigan & Sweater Rajut', category: 'jaket', search: 'Cardigan' },
        { label: 'Sweat & Hoodie Santai', category: 'jaket', search: 'Hoodie' },
      ],
    },
    {
      title: 'BAWAHAN',
      enTitle: 'Bottoms',
      links: [
        { label: 'Semua Bawahan Wanita', category: 'celana', search: '' },
        { label: 'Celana Ankle & Smart Trousers', category: 'celana', search: 'Ankle', badge: 'Favorit', badgeStyle: 'gray' },
        { label: 'Celana Lebar (Wide Pants)', category: 'celana', search: 'Wide' },
        { label: 'Rok Kasual & Lipit (Skirts)', category: 'celana', search: 'Rok' },
        { label: 'Jeans & Stretch Denim', category: 'celana', search: 'Jeans' },
        { label: 'Celana Rileks & Loungewear', category: 'celana', search: 'Rileks' },
        { label: 'Celana Pendek Santai', category: 'celana', search: 'Short' },
      ],
    },
    {
      title: 'LUARAN',
      enTitle: 'Outerwear',
      links: [
        { label: 'Semua Luaran Wanita', category: 'jaket', search: '' },
        { label: 'Parka Saku UV Protection', category: 'jaket', search: 'Parka', badge: 'UV Cut', badgeStyle: 'yellow' },
        { label: 'Jaket Kasual & Windproof', category: 'jaket', search: 'Jaket' },
        { label: 'Cardigan Rajut Ringan', category: 'jaket', search: 'Cardigan' },
        { label: 'Jaket Fleece Hangat Lembut', category: 'jaket', search: 'Fleece' },
        { label: 'Blazer Kasual Santai', category: 'jaket', search: 'Blazer' },
      ],
    },
    {
      title: 'KOLEKSI KHUSUS',
      enTitle: 'Featured & Offers',
      links: [
        { label: 'Limited Offer (Penawaran Spesial)', category: 'sale', badge: 'LIMITED OFFER', badgeStyle: 'red' },
        { label: 'Koleksi Terbaru (New Arrivals)', category: 'all', sort: 'newest', badge: 'NEW', badgeStyle: 'black' },
        { label: 'Best of LifeWear Wanita', category: 'all', sort: 'popular', badge: '★ 4.8+', badgeStyle: 'yellow' },
        { label: 'Sentuhan Alami & Sejuk', category: 'kaos', search: 'AIRism' },
        { label: 'Lihat Semua Produk Wanita', category: 'all' },
      ],
    },
  ],
  lookbook: {
    tag: 'LOOKBOOK 2026',
    title: 'Kenyamanan Anggun & Bersih',
    subtitle: 'SILUET MENGALIR & SEJUK',
    desc: 'Sentuhan serat alami bernapas dengan potongan santai yang anggun untuk mobilitas sepanjang hari.',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80',
    category: 'all',
  },
};

export interface GenderTab {
  label: string;
  value: string;
  highlight?: boolean;
}

export const GENDER_TABS: GenderTab[] = [
  { label: 'SEMUA', value: 'all' },
  { label: 'WANITA', value: 'wanita' },
  { label: 'PRIA', value: 'pria' },
  { label: 'LIMITED OFFER 🔥', value: 'sale', highlight: true },
];

export interface NavbarProps {
  categories: import('@/lib/types').Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  selectedGender: string;
  onSelectGender: (gender: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  wishlistCount: number;
  onOpenWishlist: () => void;
  onOpenInfoModal: (type: import('@/components/InformationModals').ModalType) => void;
  onSelectSort?: (sortBy: string) => void;
}
