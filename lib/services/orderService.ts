// lib/services/orderService.ts
// Transaction Processing System (TPS) & Order Domain Service (Supabase Single Source of Truth)

import crypto from 'crypto';
import { Order, OrderItem, CartItem, OrderStatus } from '../types';
import { INITIAL_ORDERS } from '../data/orders.data';
import { checkSupabaseConfigured } from './supabaseClient';
import { productService } from './productService';
import { couponService } from './couponService';
import { orderExpirationService } from './orderExpirationService';
import { resolveAuthoritativeShippingCost } from '../constants/shipping';

const localOrders: Order[] = [...INITIAL_ORDERS];

async function rollbackDeductedStock(
  deducted: { productId: number; quantity: number }[]
): Promise<void> {
  if (deducted.length === 0 || typeof window !== 'undefined' || !checkSupabaseConfigured()) return;
  const { supabaseAdmin } = await import('../supabaseAdmin');
  for (const prev of deducted) {
    await supabaseAdmin.rpc('atomic_increment_stock', {
      p_product_id: prev.productId,
      p_qty: prev.quantity,
    });
  }
  productService.invalidateCache();
}

export const orderService = {
  async getOrders(userId?: string): Promise<Order[]> {
    if (typeof window !== 'undefined') {
      try {
        const url = userId ? '/api/orders?mine=1' : '/api/orders';
        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json?.success && Array.isArray(json.data)) {
            return json.data as Order[];
          }
        }
      } catch (err) {
        console.warn('API fetch orders error:', err);
      }
      return [];
    }

    const dbReady = checkSupabaseConfigured();
    if (dbReady) {
      try {
        const { supabaseAdmin } = await import('../supabaseAdmin');
        let q = supabaseAdmin
          .from('orders')
          .select('*, order_items(*)')
          .order('id', { ascending: false });
        if (userId) q = q.eq('user_id', userId);
        const { data, error } = await q;
        if (!error && data) {
          const dbOrders: Order[] = data.map((d: any) => ({
            ...d,
            items: d.order_items || [],
          }));
          await orderExpirationService.checkAndExpireBatch(dbOrders);
          return dbOrders;
        }
        throw new Error(error?.message || 'Gagal memuat pesanan dari Supabase.');
      } catch (err) {
        console.warn('Supabase fetch orders error:', err);
        return [];
      }
    }

    const list = userId
      ? localOrders.filter((o) => o.user_id === userId)
      : [...localOrders];
    await orderExpirationService.checkAndExpireBatch(list);
    return list;
  },

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch(`/api/tracking/${encodeURIComponent(orderNumber)}`, {
          cache: 'no-store',
        });
        if (res.ok) {
          const json = await res.json();
          if (json?.success && json.order) {
            return json.order as Order;
          }
        }
      } catch {}
      return null;
    }

    const dbReady = checkSupabaseConfigured();
    if (dbReady) {
      try {
        const { supabaseAdmin } = await import('../supabaseAdmin');
        const { data, error } = await supabaseAdmin
          .from('orders')
          .select('*, order_items(*)')
          .eq('order_number', orderNumber)
          .maybeSingle();
        if (!error && data) {
          return {
            ...data,
            items: data.order_items || [],
          };
        }
      } catch (err) {
        console.warn('Supabase fetch order by number error:', err);
      }
      return null;
    }

    return localOrders.find((item) => item.order_number === orderNumber) || null;
  },

  async createOrder(orderPayload: {
    user_id?: string;
    customer_email?: string;
    customer_name: string;
    customer_phone: string;
    customer_address: string;
    shipping_courier: string;
    shipping_cost: number;
    coupon_code?: string;
    discount_amount?: number;
    payment_method: 'QRIS' | 'Bank Transfer' | 'COD';
    bank_name?: string;
    cart_items: CartItem[];
  }): Promise<{ success: boolean; order?: Order; message?: string }> {
    if (!Array.isArray(orderPayload.cart_items) || orderPayload.cart_items.length === 0) {
      return { success: false, message: 'Keranjang belanja Anda kosong.' };
    }

    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload),
        });
        const json = await res.json();
        if (res.ok && json?.success && json.order) {
          return { success: true, order: json.order as Order };
        }
        return {
          success: false,
          message: json?.message || 'Gagal memproses pesanan.',
        };
      } catch {
        return {
          success: false,
          message: 'Koneksi ke server pesanan gagal. Coba beberapa saat lagi.',
        };
      }
    }

    for (const item of orderPayload.cart_items) {
      if (
        !item?.product ||
        !Number.isInteger(Number(item.product.id)) ||
        Number(item.product.id) <= 0 ||
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) <= 0
      ) {
        return { success: false, message: 'Kuantitas atau item produk tidak valid.' };
      }
    }

    const dbReady = checkSupabaseConfigured();
    if (!dbReady) {
      return { success: false, message: 'Layanan database tidak tersedia.' };
    }

    const { supabaseAdmin } = await import('../supabaseAdmin');
    const verifiedItems: OrderItem[] = [];
    const deducted: { productId: number; quantity: number }[] = [];

    const productIds = Array.from(
      new Set(orderPayload.cart_items.map((it) => Number(it.product.id)))
    );
    const { data: dbProducts, error: fetchErr } = await supabaseAdmin
      .from('products')
      .select('id, name, price, stock, status, sizes, out_of_stock_sizes')
      .in('id', productIds);

    if (fetchErr || !dbProducts) {
      return { success: false, message: 'Gagal memeriksa stok produk di database.' };
    }

    const dbMap = new Map(dbProducts.map((p: any) => [Number(p.id), p]));
    const requestedTotals = new Map<number, number>();

    for (const item of orderPayload.cart_items) {
      const prodId = Number(item.product.id);
      const dbP = dbMap.get(prodId);
      if (!dbP) {
        return {
          success: false,
          message: `Produk "${item.product.name}" tidak ditemukan dalam inventaris.`,
        };
      }
      if (dbP.status && dbP.status !== 'active') {
        return {
          success: false,
          message: `Produk "${dbP.name}" saat ini tidak tersedia untuk dibeli.`,
        };
      }
      const oosSizes: string[] = Array.isArray(dbP.out_of_stock_sizes) ? dbP.out_of_stock_sizes : [];
      const availSizes: string[] = Array.isArray(dbP.sizes) ? dbP.sizes : ['S', 'M', 'L', 'XL'];
      if (!availSizes.includes(item.selected_size) || oosSizes.includes(item.selected_size)) {
        return {
          success: false,
          message: `Ukuran ${item.selected_size} untuk "${dbP.name}" sedang habis.`,
        };
      }
      const nextTotal = (requestedTotals.get(prodId) || 0) + Number(item.quantity);
      requestedTotals.set(prodId, nextTotal);
      if (Number(dbP.stock) < nextTotal) {
        return {
          success: false,
          message: `Stok untuk "${dbP.name}" tidak mencukupi (Tersisa: ${dbP.stock} unit, Permintaan: ${nextTotal} unit).`,
        };
      }
    }

    const provisionalSubtotal = orderPayload.cart_items.reduce((sum, item) => {
      const dbP = dbMap.get(Number(item.product.id))!;
      return sum + Number(dbP.price) * Number(item.quantity);
    }, 0);

    const shippingCheck = resolveAuthoritativeShippingCost(
      orderPayload.shipping_courier,
      provisionalSubtotal
    );
    if (!shippingCheck.valid) {
      return {
        success: false,
        message: 'Metode pengiriman tidak dikenali. Pilih kurir yang tersedia.',
      };
    }

    let verifiedDiscount = 0;
    let appliedCouponId: number | null = null;
    if (orderPayload.coupon_code && orderPayload.coupon_code.trim()) {
      const couponValidation = await couponService.validateCoupon(
        orderPayload.coupon_code,
        provisionalSubtotal
      );
      if (!couponValidation.valid || !couponValidation.coupon || couponValidation.discount_amount <= 0) {
        return {
          success: false,
          message: couponValidation.message || 'Kode kupon tidak valid atau tidak memenuhi syarat.',
        };
      }
      verifiedDiscount = couponValidation.discount_amount;
      appliedCouponId = couponValidation.coupon.id;
    }

    // Deduksi stok atomik agregat per produk lalu klaim kupon
    for (const [prodId, qty] of requestedTotals.entries()) {
      const { error: rpcErr } = await supabaseAdmin.rpc('atomic_deduct_stock', {
        p_product_id: prodId,
        p_quantity: qty,
      });
      if (rpcErr) {
        await rollbackDeductedStock(deducted);
        return {
          success: false,
          message: rpcErr.message || 'Stok tidak mencukupi saat memproses pesanan.',
        };
      }
      deducted.push({ productId: prodId, quantity: qty });
    }
    productService.invalidateCache();

    let couponClaimed = false;
    if (appliedCouponId) {
      couponClaimed = await couponService.claimCouponInDb(appliedCouponId);
      if (!couponClaimed) {
        await rollbackDeductedStock(deducted);
        return {
          success: false,
          message: 'Kuota penggunaan kupon promo baru saja habis.',
        };
      }
    }

    for (const item of orderPayload.cart_items) {
      const prodId = Number(item.product.id);
      const dbP = dbMap.get(prodId)!;
      const unitPrice = Number(dbP.price);
      verifiedItems.push({
        product_id: prodId,
        product_name: String(dbP.name),
        selected_size: item.selected_size,
        selected_color: item.selected_color,
        price: unitPrice,
        quantity: Number(item.quantity),
        subtotal: unitPrice * Number(item.quantity),
      });
    }

    const subtotal = verifiedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const uniqueCode =
      orderPayload.payment_method === 'Bank Transfer' ? crypto.randomInt(100, 1000) : 0;

    const grandTotal = Math.max(
      0,
      subtotal - verifiedDiscount + shippingCheck.cost + uniqueCode
    );

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const entropy = crypto.randomBytes(3).toString('hex').toUpperCase();
    const orderNumber = `ORD-${dateStr}-${entropy}`;

    const newOrder: Order = {
      id: Date.now(),
      user_id: orderPayload.user_id,
      customer_email: orderPayload.customer_email,
      order_number: orderNumber,
      customer_name: orderPayload.customer_name,
      customer_phone: orderPayload.customer_phone,
      customer_address: orderPayload.customer_address,
      shipping_courier: shippingCheck.courier,
      shipping_cost: shippingCheck.cost,
      coupon_code: orderPayload.coupon_code,
      discount_amount: verifiedDiscount,
      payment_method: orderPayload.payment_method,
      bank_name:
        orderPayload.bank_name ||
        (orderPayload.payment_method === 'Bank Transfer' ? 'BCA' : undefined),
      unique_code: uniqueCode,
      total_amount: grandTotal,
      status: 'Menunggu Pembayaran',
      created_at: new Date().toISOString(),
      items: verifiedItems,
    };

    try {
      const { data: orderData, error: orderErr } = await supabaseAdmin
        .from('orders')
        .insert({
          user_id: newOrder.user_id,
          order_number: newOrder.order_number,
          customer_email: newOrder.customer_email,
          customer_name: newOrder.customer_name,
          customer_phone: newOrder.customer_phone,
          customer_address: newOrder.customer_address,
          shipping_courier: newOrder.shipping_courier,
          shipping_cost: newOrder.shipping_cost,
          coupon_id: appliedCouponId,
          discount_amount: newOrder.discount_amount,
          payment_method: newOrder.payment_method,
          bank_name: newOrder.bank_name,
          unique_code: newOrder.unique_code,
          total_amount: newOrder.total_amount,
          status: newOrder.status,
        })
        .select()
        .single();

      if (orderErr || !orderData) {
        if (couponClaimed && appliedCouponId) {
          await couponService.releaseCouponInDb(appliedCouponId);
        }
        await rollbackDeductedStock(deducted);
        return {
          success: false,
          message: orderErr?.message || 'Gagal menyimpan pesanan ke database.',
        };
      }

      newOrder.id = orderData.id;
      const itemsToInsert = verifiedItems.map((it) => ({
        order_id: orderData.id,
        product_id: it.product_id,
        product_name: it.product_name,
        selected_size: it.selected_size,
        selected_color: it.selected_color,
        price: it.price,
        quantity: it.quantity,
        subtotal: it.subtotal,
      }));
      const { error: itemsErr } = await supabaseAdmin.from('order_items').insert(itemsToInsert);
      if (itemsErr) {
        await supabaseAdmin.from('orders').delete().eq('id', orderData.id);
        if (couponClaimed && appliedCouponId) {
          await couponService.releaseCouponInDb(appliedCouponId);
        }
        await rollbackDeductedStock(deducted);
        return {
          success: false,
          message: itemsErr.message || 'Gagal menyimpan detail item pesanan ke database.',
        };
      }

      return { success: true, order: newOrder };
    } catch (err) {
      console.error('Gagal menyimpan pesanan ke Supabase:', err);
      if (couponClaimed && appliedCouponId) {
        await couponService.releaseCouponInDb(appliedCouponId);
      }
      await rollbackDeductedStock(deducted);
      return { success: false, message: 'Gagal menyimpan pesanan ke database.' };
    }
  },

  async updateOrderStatus(
    orderNumber: string,
    status: OrderStatus,
    trackingNumber?: string,
    expectedCurrentStatus?: OrderStatus
  ): Promise<boolean> {
    if (typeof window === 'undefined' && checkSupabaseConfigured()) {
      try {
        const { supabaseAdmin } = await import('../supabaseAdmin');
        const updatePayload: Record<string, unknown> = {
          status,
          updated_at: new Date().toISOString(),
        };
        if (trackingNumber !== undefined) updatePayload.tracking_number = trackingNumber;

        let query = supabaseAdmin
          .from('orders')
          .update(updatePayload)
          .eq('order_number', orderNumber);
        if (expectedCurrentStatus) {
          query = query.eq('status', expectedCurrentStatus);
        }
        const { data, error } = await query.select('id');
        if (error || !data || data.length === 0) return false;
        return true;
      } catch (err) {
        console.warn('Update order status cloud error:', err);
        return false;
      }
    }

    const o = localOrders.find((item) => item.order_number === orderNumber);
    if (!o) return false;
    if (expectedCurrentStatus && o.status !== expectedCurrentStatus) return false;
    o.status = status;
    if (trackingNumber) o.tracking_number = trackingNumber;
    return true;
  },

  async markInvoiceEmailSent(orderNumber: string): Promise<boolean> {
    if (typeof window === 'undefined' && checkSupabaseConfigured()) {
      try {
        const { supabaseAdmin } = await import('../supabaseAdmin');
        const { error } = await supabaseAdmin
          .from('orders')
          .update({ invoice_email_sent: true })
          .eq('order_number', orderNumber);
        return !error;
      } catch (err) {
        console.warn('Update invoice_email_sent error:', err);
        return false;
      }
    }
    const o = localOrders.find((item) => item.order_number === orderNumber);
    if (o) o.invoice_email_sent = true;
    return true;
  },
};
