// lib/admin-suite/adminSupabaseService.ts
// Supabase Data Connectors & Mappers untuk UrbanStyle Operations Suite

import { supabase, isSupabaseConfigured } from '@/lib/services/supabaseClient';
import { 
  Product, Order, Employee, PromoVoucher, 
  InboundShipment, ExpenseItem, StockAdjustment, ActivityLog, OrderStatus 
} from './types';

// Helper Mapping Status Pesanan Antara Store & Admin
export function mapDbStatusToAdminStatus(dbStatus: string): OrderStatus {
  const s = (dbStatus || '').toLowerCase();
  if (s.includes('menunggu') || s === 'pending_payment') return 'pending_payment';
  if (s.includes('packing') || s.includes('dipacking')) return 'packing';
  if (s.includes('kirim') || s === 'shipped') return 'shipped';
  if (s.includes('selesai') || s === 'delivered') return 'delivered';
  if (s.includes('batal') || s === 'cancelled') return 'cancelled';
  return 'processing';
}

export function mapAdminStatusToDbStatus(adminStatus: OrderStatus): string {
  switch (adminStatus) {
    case 'pending_payment': return 'Menunggu Pembayaran';
    case 'processing': return 'Diproses';
    case 'packing': return 'Dipacking';
    case 'shipped': return 'Dikirim';
    case 'delivered': return 'Selesai';
    case 'cancelled': return 'Dibatalkan';
    default: return 'Diproses';
  }
}

export const adminSupabaseService = {
  // 1. Produk & Katalog
  async getProducts(): Promise<Product[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('id', { ascending: true });
      if (error || !data) return null;

      return data.map(p => ({
        id: String(p.id),
        sku: p.sku || `UB-${String(p.id).padStart(4, '0')}`,
        name: p.name,
        category: p.categories?.name || 'Pakaian Pria',
        price: Number(p.price) || 0,
        originalPrice: p.original_price ? Number(p.original_price) : undefined,
        stock: Number(p.stock) || 0,
        safetyStock: Number(p.safety_stock) || 10,
        rackLocation: p.rack_location || 'A-01-01',
        status: (p.status as any) || 'active',
        imageUrl: p.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500',
        salesCount: Number(p.reviews_count) || 8,
        rating: Number(p.rating) || 4.8,
        description: p.description || ''
      }));
    } catch {
      return null;
    }
  },

  // 2. Pesanan & Order Items
  async getOrders(): Promise<Order[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('id', { ascending: false });
      if (error || !data) return null;

      return data.map((o: any) => {
        let adminStatus = mapDbStatusToAdminStatus(o.status);
        if (adminStatus === 'pending_payment' && o.created_at) {
          const elapsed = Date.now() - new Date(o.created_at).getTime();
          if (elapsed >= 20 * 60 * 1000) {
            adminStatus = 'cancelled';
          }
        }
        const isPaid = adminStatus === 'processing' || adminStatus === 'packing' || 
                       adminStatus === 'shipped' || adminStatus === 'delivered';
        const items = (o.order_items || []).map((it: any) => ({
          productId: String(it.product_id || it.id),
          sku: `UB-${String(it.product_id || 1).padStart(4, '0')}`,
          name: it.product_name || 'Produk Busana',
          price: Number(it.price) || 0,
          quantity: Number(it.quantity) || 1,
          imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200'
        }));

        const total = Number(o.total_amount) || 0;
        const shippingCost = Number(o.shipping_cost) || 15000;
        const discount = Number(o.discount_amount) || 0;

        return {
          id: String(o.id),
          orderNumber: o.order_number,
          customerName: o.customer_name || 'Pelanggan UrbanStyle',
          customerPhone: o.customer_phone || '-',
          customerEmail: o.customer_email || 'customer@urbanstyle.com',
          shippingAddress: o.customer_address || 'Jl. Jend. Sudirman, Jakarta',
          city: 'DKI Jakarta',
          courier: (o.shipping_courier as any) || 'JNE Reguler',
          trackingNumber: o.tracking_number || undefined,
          paymentMethod: (o.payment_method as any) || 'QRIS',
          paymentStatus: isPaid ? 'paid' : (adminStatus === 'cancelled' ? 'refunded' : 'unpaid'),
          items,
          subtotal: Math.max(0, total - shippingCost + discount),
          shippingCost,
          discount,
          total,
          status: adminStatus,
          createdAt: o.created_at ? new Date(o.created_at).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
          }) : '14 Okt 2026'
        };
      });
    } catch {
      return null;
    }
  },

  // 3. Staf & Karyawan
  async getEmployees(): Promise<Employee[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase.from('staff_users').select('*').order('created_at', { ascending: true });
      if (error || !data) return null;

      return data.map(s => {
        const role = s.role === 'owner' ? 'superadmin' : s.role === 'gudang' ? 'warehouse_admin' : 'store_admin';
        return {
          id: s.id,
          name: s.name,
          email: s.email,
          phone: s.phone || '-',
          role,
          roleLabel: role === 'superadmin' ? 'Superadmin / Owner' : role === 'warehouse_admin' ? 'Warehouse Admin' : 'Store Admin',
          department: s.department || 'Operasional Toko',
          branch: s.branch || 'DC-1 Cikarang',
          status: s.is_active ? 'active' : 'inactive',
          salary: Number(s.salary) || 6000000,
          lastLogin: s.last_login ? new Date(s.last_login).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Hari ini',
          avatarUrl: s.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
        };
      });
    } catch {
      return null;
    }
  },

  // 4. Promo & Kupon
  async getPromos(): Promise<PromoVoucher[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase.from('coupons').select('*').order('id', { ascending: true });
      if (error || !data) return null;

      return data.map(c => ({
        id: String(c.id),
        code: c.code,
        discountType: c.type === 'percent' || c.type === 'percentage' ? 'percentage' : 'fixed',
        discountValue: Number(c.discount_amount),
        minPurchase: Number(c.min_purchase) || 0,
        usageCount: Number(c.used_count) || 0,
        quota: Number(c.usage_limit) || 100,
        validUntil: c.valid_until ? new Date(c.valid_until).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '31 Des 2026',
        status: c.is_active ? 'active' : 'expired'
      }));
    } catch {
      return null;
    }
  },

  // 5. Inbound Shipments
  async getInbound(): Promise<InboundShipment[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase.from('admin_inbound_shipments').select('*').order('created_at', { ascending: false });
      if (error || !data) return null;
      return data.map(d => ({
        id: d.id,
        poNumber: d.po_number,
        supplierName: d.supplier_name,
        itemCount: d.item_count,
        totalUnits: d.total_units,
        expectedDate: d.expected_date,
        status: d.status,
        itemsSummary: d.items_summary,
        destinationWarehouse: d.destination_warehouse
      }));
    } catch {
      return null;
    }
  },

  // 6. Expenses
  async getExpenses(): Promise<ExpenseItem[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase.from('admin_expenses').select('*').order('created_at', { ascending: false });
      if (error || !data) return null;
      return data.map(e => ({
        id: e.id,
        category: e.category,
        description: e.description,
        amount: Number(e.amount),
        date: e.date,
        approvedBy: e.approved_by,
        status: e.status
      }));
    } catch {
      return null;
    }
  },

  // 7. Stock Adjustments
  async getStockAdjustments(): Promise<StockAdjustment[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase.from('admin_stock_adjustments').select('*').order('created_at', { ascending: false });
      if (error || !data) return null;
      return data.map(a => ({
        id: a.id,
        sku: a.sku,
        productName: a.product_name,
        previousStock: a.previous_stock,
        adjustedStock: a.adjusted_stock,
        diff: a.diff,
        reason: a.reason,
        date: a.date,
        adjustedBy: a.adjusted_by
      }));
    } catch {
      return null;
    }
  },

  // 8. Activity Logs
  async getActivityLogs(): Promise<ActivityLog[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase.from('admin_activity_logs').select('*').order('created_at', { ascending: false });
      if (error || !data) return null;
      return data.map(l => ({
        id: l.id,
        timestamp: l.timestamp,
        userName: l.user_name,
        userRole: l.user_role,
        action: l.action,
        details: l.details,
        category: l.category
      }));
    } catch {
      return null;
    }
  }
};
