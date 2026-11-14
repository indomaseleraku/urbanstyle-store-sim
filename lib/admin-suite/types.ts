export type Role = 'superadmin' | 'store_admin' | 'warehouse_admin';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  stock: number;
  safetyStock: number;
  rackLocation: string;
  status: 'active' | 'draft' | 'archived';
  salesCount: number;
  rating: number;
  imageUrl: string;
  description: string;
}

export type OrderStatus =
  | 'pending_payment'
  | 'processing'
  | 'packing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  productId: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  rawCreatedAt?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  city: string;
  courier: 'JNE Reguler' | 'SiCepat Kilat' | 'GoSend Instant' | string;
  trackingNumber?: string;
  paymentMethod: 'QRIS' | 'Transfer Bank BCA' | 'COD' | 'Kartu Kredit' | 'Transfer Bank Mandiri' | string;
  paymentStatus: 'paid' | 'pending' | 'failed';
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  roleLabel: string;
  department: string;
  branch: string;
  status: 'active' | 'inactive' | 'leave';
  lastLogin: string;
  avatarUrl: string;
  salary: number;
}

export interface InboundShipment {
  id: string;
  poNumber: string;
  supplierName: string;
  expectedDate: string;
  status: 'pending' | 'in_qc' | 'received';
  totalItems: number;
  totalUnits: number;
  itemsSummary: string;
}

export interface ExpenseItem {
  id: string;
  date: string;
  rawDate?: string;
  category:
    | 'Gaji Karyawan'
    | 'Sewa Gudang & Listrik'
    | 'Biaya Pengiriman/Logistik'
    | 'Pemasaran & Iklan'
    | 'Server & Software'
    | 'Lain-lain';
  description: string;
  amount: number;
  approvedBy: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: Role;
  action: string;
  target: string;
  type: 'order' | 'inventory' | 'finance' | 'employee' | 'system';
}

export interface StockAdjustment {
  id: string;
  date: string;
  rawDate?: string;
  productSku: string;
  productName: string;
  prevStock: number;
  newStock: number;
  diff: number;
  reason: 'Audit Fisik' | 'Barang Rusak' | 'Retur Pelanggan' | 'Restock Masuk';
  adjustedBy: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'warning' | 'info' | 'success';
}

export interface PromoVoucher {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase: number;
  usageCount: number;
  quota: number;
  validUntil: string;
  status: 'active' | 'expired';
}

export interface AdminCustomerReview {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface StoreSettings {
  ppnRate: number;
  approvalLimit: number;
}
