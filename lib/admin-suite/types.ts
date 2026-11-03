// lib/admin-suite/types.ts
// Tipe Data Terpadu untuk UrbanStyle Commerce OS - Operations Suite

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
  imageUrl: string;
  salesCount: number;
  rating: number;
  description: string;
}

export type OrderStatus = 'pending_payment' | 'processing' | 'packing' | 'shipped' | 'delivered' | 'cancelled';

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
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  city: string;
  courier: 'JNE Reguler' | 'SiCepat Kilat' | 'J&T Express' | 'GoSend Instant' | 'AnterAja';
  trackingNumber?: string;
  paymentMethod: 'QRIS' | 'Transfer Bank BCA' | 'Transfer Bank Mandiri' | 'COD' | 'Kartu Kredit';
  paymentStatus: 'paid' | 'unpaid' | 'refunded';
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  notes?: string;
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
  status: 'active' | 'leave' | 'inactive';
  salary: number;
  lastLogin: string;
  avatarUrl: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: Role;
  action: string;
  details: string;
  category: 'order' | 'inventory' | 'finance' | 'employee' | 'system';
}

export interface InboundShipment {
  id: string;
  poNumber: string;
  supplierName: string;
  itemCount: number;
  totalUnits: number;
  expectedDate: string;
  status: 'pending' | 'in_qc' | 'received' | 'cancelled';
  itemsSummary: string;
  destinationWarehouse: string;
}

export interface StockAdjustment {
  id: string;
  sku: string;
  productName: string;
  previousStock: number;
  adjustedStock: number;
  diff: number;
  reason: 'Audit Fisik' | 'Barang Rusak' | 'Retur Pelanggan' | 'Koreksi Sistem';
  date: string;
  adjustedBy: string;
}

export interface FinancialMetric {
  totalRevenue: number;
  grossProfit: number;
  operatingExpenses: number;
  netProfit: number;
  cogs: number;
  taxAmount: number;
  pendingReceivables: number;
  cashBalance: number;
}

export interface ExpenseItem {
  id: string;
  category: 'Gaji Karyawan' | 'Sewa Gudang & Listrik' | 'Biaya Pengiriman/Logistik' | 'Pemasaran & Iklan' | 'Server & Software' | 'Lain-lain';
  description: string;
  amount: number;
  date: string;
  approvedBy: string;
  status: 'approved' | 'pending';
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
