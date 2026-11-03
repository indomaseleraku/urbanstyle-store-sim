// lib/types.ts
// Definisi Tipe Data TypeScript (Type-Safe) untuk UrbanStyle Store (Uniqlo LifeWear Experience V3.0)

export type StaffRole = 'owner' | 'gudang' | 'kasir';
export type UserRole = 'customer' | 'admin' | StaffRole;

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  staff_role?: StaffRole;
  address_line?: string;
  city?: string;
  postal_code?: string;
  preferred_size?: 'S' | 'M' | 'L' | 'XL';
  created_at?: string;
}

export interface StaffUser {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: StaffRole;
  is_active: boolean;
  created_at: string;
}

export interface UserAddress {
  id: string;
  user_id: string;
  label: string; // 'Rumah' | 'Kantor' | 'Kos'
  recipient_name: string;
  phone: string;
  address_line: string;
  city: string;
  postal_code: string;
  is_default: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  gender?: 'all' | 'pria' | 'wanita';
  icon?: string;
}

export interface ColorVariant {
  name: string;
  code?: string; // Misal: "09 BLACK", "68 BLUE", "00 WHITE"
  hex: string;
  image_url: string;
}

export interface SizeMeasurement {
  size: string; // "S", "M", "L", "XL"
  chest_width: number; // Lebar dada (cm)
  body_length: number; // Panjang pakaian (cm)
  sleeve_length: number; // Panjang lengan (cm)
  shoulder_width: number; // Lebar bahu (cm)
  waist?: number; // Lingkar pinggang (cm, khusus celana)
}

export interface Review {
  id: number;
  reviewer_name: string;
  rating: number; // 1 - 5
  size_purchased: string;
  fit_rating: 'Pas Sesuai Ukuran' | 'Agak Longgar' | 'Agak Sempit';
  comment: string;
  created_at: string;
}

export interface Product {
  id: number;
  category_id: number;
  category_name?: string;
  name: string;
  slug: string;
  gender: 'pria' | 'wanita' | 'unisex';
  price: number;
  original_price?: number;
  stock: number;
  description: string;
  fabric_details: string; // Detail teknologi tekstil (AIRism, Heavyweight Cotton, dll)
  care_instructions: string; // Petunjuk pencucian & perawatan
  colors: ColorVariant[];
  sizes: string[]; // ["S", "M", "L", "XL"]
  out_of_stock_sizes?: string[]; // Ukuran yang stoknya 0 untuk efek coret diagonal individual
  size_measurements?: SizeMeasurement[];
  image_url: string;
  gallery_images: string[]; // Galeri foto multi-sudut
  rating?: number;
  reviews_count?: number;
  reviews?: Review[];
  is_new?: boolean;
  is_featured?: boolean;
  is_sale?: boolean;
}

export interface CartItem {
  product: Product;
  selected_size: string;
  selected_color: string;
  quantity: number;
}

export interface WishlistItem {
  product: Product;
  added_at: string;
}

export interface Coupon {
  id: number;
  code: string;
  type: 'fixed' | 'percentage';
  discount_amount: number;
  min_purchase: number;
  max_discount?: number;
  usage_limit: number;
  used_count: number;
  valid_until?: string;
  is_active: boolean;
  description: string;
}

export interface OrderItem {
  id?: number;
  order_id?: number;
  product_id: number;
  product_name: string;
  selected_size: string;
  selected_color: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export type OrderStatus = 'Menunggu Pembayaran' | 'Dibayar' | 'Dikemas' | 'Dikirim' | 'Selesai' | 'Dibatalkan';

export interface TrackingEvent {
  title: string;
  description: string;
  timestamp: string;
  is_completed: boolean;
}

export interface Order {
  id: number;
  user_id?: string;
  customer_email?: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  shipping_courier: string;
  shipping_cost: number;
  tracking_number?: string;
  coupon_id?: number;
  coupon_code?: string;
  discount_amount?: number;
  payment_method: 'QRIS' | 'Bank Transfer' | 'COD';
  bank_name?: string;
  unique_code?: number;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  items: OrderItem[];
  invoice_email_sent?: boolean;
}

export const BANK_ACCOUNTS: Record<string, { bankName: string; accountNumber: string; holderName: string }> = {
  BCA: {
    bankName: 'Bank Central Asia (BCA)',
    accountNumber: '8830192844',
    holderName: 'KIMY EKA ARDIANSYAH / URBANSTYLE',
  },
  Mandiri: {
    bankName: 'Bank Mandiri',
    accountNumber: '164009928101',
    holderName: 'KIMY EKA ARDIANSYAH / URBANSTYLE',
  },
  BRI: {
    bankName: 'Bank Rakyat Indonesia (BRI)',
    accountNumber: '012301001928502',
    holderName: 'KIMY EKA ARDIANSYAH',
  },
  BNI: {
    bankName: 'Bank Negara Indonesia (BNI)',
    accountNumber: '0992814401',
    holderName: 'URBANSTYLE STORE OFFICIAL',
  },
};
