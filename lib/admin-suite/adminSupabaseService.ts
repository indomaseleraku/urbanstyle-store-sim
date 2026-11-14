import { supabase } from '@/lib/services/supabaseClient';
import {
  Product,
  Order,
  Employee,
  InboundShipment,
  ExpenseItem,
  ActivityLog,
  StockAdjustment,
  PromoVoucher,
  Role,
  OrderStatus,
  AdminCustomerReview,
  StoreSettings,
} from './types';

async function getDb() {
  if (typeof window === 'undefined') {
    const { supabaseAdmin } = await import('@/lib/supabaseAdmin');
    return supabaseAdmin;
  }
  return supabase;
}

const mapRole = (r: string): Role => {
  if (r === 'kasir') return 'store_admin';
  if (r === 'gudang') return 'warehouse_admin';
  return 'superadmin';
};

const formatDateShort = (raw?: string | null): string => {
  if (!raw) return new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return String(raw);
  return parsed.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDateTimeShort = (raw?: string | null): string => {
  if (!raw) return '-';
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return String(raw);
  return parsed.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

export const adminSupabaseService = {
  async getProducts(): Promise<Product[]> {
    const db = await getDb();
    const [{ data, error }, { data: soldItems }] = await Promise.all([
      db.from('products').select('*').order('id', { ascending: true }),
      db
        .from('order_items')
        .select('product_id, quantity, orders!inner(status, payment_status)')
        .neq('orders.status', 'cancelled'),
    ]);

    if (error || !data) return [];

    const salesByProduct = new Map<string, number>();
    if (Array.isArray(soldItems)) {
      for (const item of soldItems as Array<{
        product_id: number | string;
        quantity: number;
        orders?: { status?: string; payment_status?: string } | Array<{ status?: string; payment_status?: string }>;
      }>) {
        const orderMeta = Array.isArray(item.orders) ? item.orders[0] : item.orders;
        if (orderMeta?.status === 'pending_payment' && orderMeta?.payment_status !== 'paid') continue;
        const pid = String(item.product_id);
        salesByProduct.set(pid, (salesByProduct.get(pid) || 0) + Number(item.quantity || 0));
      }
    }

    return data.map((p) => {
      const idStr = String(p.id);
      return {
        id: idStr,
        sku: p.sku || `SKU-${p.id}`,
        name: p.name,
        category: p.category,
        price: Number(p.price),
        originalPrice: p.original_price ? Number(p.original_price) : undefined,
        stock: Number(p.stock || 0),
        safetyStock: Number(p.safety_stock || 10),
        rackLocation: p.rack_location || 'Rak A-01 / Bin 01',
        status: (p.status as Product['status']) || 'active',
        salesCount: salesByProduct.get(idStr) ?? 0,
        rating: Number(p.rating ?? 0),
        imageUrl: p.image_url || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=85',
        description: p.description || '',
      };
    });
  },

  async getOrders(): Promise<Order[]> {
    const db = await getDb();
    const { data, error } = await db
      .from('orders')
      .select(`*, order_items (*)`)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    const statusMap: Record<string, OrderStatus> = {
      'Menunggu Pembayaran': 'pending_payment',
      'Sedang Diproses': 'processing',
      'Dikemas Gudang': 'packing',
      'Dikirim': 'shipped',
      'Selesai': 'delivered',
      'Dibatalkan': 'cancelled',
      pending_payment: 'pending_payment',
      processing: 'processing',
      packing: 'packing',
      shipped: 'shipped',
      delivered: 'delivered',
      cancelled: 'cancelled',
    };

    return data.map((o) => {
      const shippingAddr = o.shipping_address || '';
      const addrParts = shippingAddr.split(',').map((s: string) => s.trim()).filter(Boolean);
      const city = addrParts.length > 1 ? addrParts[addrParts.length - 1] : 'Jakarta';

      return {
        id: String(o.id),
        orderNumber: o.order_number,
        createdAt: formatDateShort(o.created_at),
        rawCreatedAt: o.created_at,
        customerName: o.customer_name || 'Pelanggan UrbanStyle',
        customerPhone: o.customer_phone || '-',
        customerEmail: o.customer_email || '',
        shippingAddress: shippingAddr,
        city,
        courier: o.courier || 'JNE Reguler',
        trackingNumber: o.tracking_number || undefined,
        paymentMethod: o.payment_method || 'QRIS',
        paymentStatus:
          o.payment_status === 'paid' ||
          ['Sedang Diproses', 'Dikemas Gudang', 'Dikirim', 'Selesai'].includes(o.status)
            ? 'paid'
            : 'pending',
        status: statusMap[o.status] || 'processing',
        items: (o.order_items || []).map((item: {
          product_id: number | string;
          sku?: string;
          product_name: string;
          price: number;
          quantity: number;
          image_url?: string;
        }) => ({
          productId: String(item.product_id),
          sku: item.sku || `SKU-${item.product_id}`,
          name: item.product_name,
          price: Number(item.price),
          quantity: Number(item.quantity),
          imageUrl: item.image_url || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=85',
        })),
        subtotal: Number(o.subtotal || 0),
        shippingCost: Number(o.shipping_cost || 0),
        discount: Number(o.discount_amount || 0),
        total: Number(o.total_amount || 0),
      };
    });
  },

  async getEmployees(): Promise<Employee[]> {
    const db = await getDb();
    const { data, error } = await db.from('staff_users').select('*').order('id', { ascending: true });
    if (error || !data) return [];

    return data.map((s) => {
      const normalizedStatus: Employee['status'] =
        s.status === 'leave'
          ? 'leave'
          : s.is_active === false || s.status === 'inactive'
            ? 'inactive'
            : 'active';

      return {
        id: String(s.id),
        name: s.name || s.full_name || 'Staf',
        email: s.email,
        phone: s.phone || '+62 812-0000-0000',
        role: mapRole(s.role),
        roleLabel: s.role_label || (s.role === 'owner' ? 'Owner & Direksi' : 'Staf Operasional'),
        department: s.department || 'Operasional',
        branch: s.branch || 'Jakarta Pusat',
        status: normalizedStatus,
        lastLogin: formatDateTimeShort(s.last_login || s.updated_at || s.created_at),
        avatarUrl: s.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
        salary: Number(s.salary || 5500000),
      };
    });
  },

  async getInboundShipments(): Promise<InboundShipment[]> {
    const db = await getDb();
    const { data, error } = await db.from('inbound_shipments').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];

    return data.map((i) => ({
      id: String(i.id),
      poNumber: i.po_number,
      supplierName: i.supplier_name,
      expectedDate: i.expected_date || formatDateShort(i.created_at),
      status: (i.status as InboundShipment['status']) || 'pending',
      totalItems: Number(i.total_items || 1),
      totalUnits: Number(i.total_units || 0),
      itemsSummary: i.items_summary || '-',
    }));
  },

  async getExpenses(): Promise<ExpenseItem[]> {
    const db = await getDb();
    const { data, error } = await db.from('expenses').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];

    return data.map((e) => ({
      id: String(e.id),
      date: formatDateShort(e.date || e.created_at),
      rawDate: e.created_at || e.date,
      category: e.category as ExpenseItem['category'],
      description: e.description,
      amount: Number(e.amount),
      approvedBy: e.approved_by || 'Owner Store (Superadmin)',
    }));
  },

  async getActivityLogs(): Promise<ActivityLog[]> {
    const db = await getDb();
    const { data, error } = await db
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !data) return [];

    return data.map((l) => ({
      id: String(l.id),
      timestamp: formatDateTimeShort(l.created_at),
      userName: l.user_name,
      userRole: mapRole(l.user_role),
      action: l.action,
      target: l.target,
      type: (l.type as ActivityLog['type']) || 'system',
    }));
  },

  async getStockAdjustments(): Promise<StockAdjustment[]> {
    const db = await getDb();
    const { data, error } = await db
      .from('stock_adjustments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !data) return [];

    return data.map((a) => ({
      id: String(a.id),
      date: formatDateTimeShort(a.created_at),
      rawDate: a.created_at,
      productSku: a.product_sku,
      productName: a.product_name,
      prevStock: Number(a.prev_stock),
      newStock: Number(a.new_stock),
      diff: Number(a.diff),
      reason: a.reason as StockAdjustment['reason'],
      adjustedBy: a.adjusted_by,
    }));
  },

  async getPromos(): Promise<PromoVoucher[]> {
    const db = await getDb();
    const { data, error } = await db.from('coupons').select('*').order('id', { ascending: true });
    if (error || !data) return [];

    return data.map((c) => {
      const normalizedType = c.discount_type === 'fixed' ? 'fixed' : 'percentage';
      return {
        id: String(c.id),
        code: c.code,
        discountType: normalizedType,
        discountValue: Number(c.discount_value),
        minPurchase: Number(c.min_purchase || 0),
        usageCount: Number(c.used_count || 0),
        quota: Number(c.usage_limit || 100),
        validUntil: c.expires_at ? new Date(c.expires_at).toISOString().split('T')[0] : '2027-12-31',
        status: c.is_active ? 'active' : 'expired',
      };
    });
  },

  async getReviews(): Promise<AdminCustomerReview[]> {
    const db = await getDb();
    const { data, error } = await db
      .from('reviews')
      .select('id, product_id, user_name, rating, comment, created_at, products (name)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data) return [];

    return data.map((r) => {
      const prodRel = r.products as { name?: string } | Array<{ name?: string }> | null;
      const prodName = Array.isArray(prodRel) ? prodRel[0]?.name : prodRel?.name;
      return {
        id: String(r.id),
        productId: String(r.product_id),
        productName: prodName || `Produk #${r.product_id}`,
        customerName: r.user_name || 'Pelanggan',
        rating: Number(r.rating || 5),
        comment: r.comment || '',
        createdAt: formatDateShort(r.created_at),
      };
    });
  },

  async getSettings(): Promise<StoreSettings> {
    const db = await getDb();
    const { data, error } = await db
      .from('store_settings')
      .select('value')
      .eq('key', 'finance_tax_config')
      .maybeSingle();

    if (error || !data?.value || typeof data.value !== 'object') {
      return { ppnRate: 11, approvalLimit: 10000000 };
    }

    const val = data.value as { ppnRate?: unknown; approvalLimit?: unknown };
    const ppnRate = Number(val.ppnRate);
    const approvalLimit = Number(val.approvalLimit);
    return {
      ppnRate: Number.isFinite(ppnRate) && ppnRate >= 0 && ppnRate <= 100 ? ppnRate : 11,
      approvalLimit: Number.isFinite(approvalLimit) && approvalLimit >= 0 ? approvalLimit : 10000000,
    };
  },
};
