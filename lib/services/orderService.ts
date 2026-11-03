// lib/services/orderService.ts
// Transaction Processing System (TPS) & Order Domain Service

import { Order, OrderItem, CartItem, OrderStatus } from '../types';
import { INITIAL_ORDERS } from '../data/orders.data';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { productService } from './productService';
import { couponService } from './couponService';
import { orderExpirationService } from './orderExpirationService';

let localOrders: Order[] = [...INITIAL_ORDERS];

export const orderService = {
  async getOrders(userId?: string): Promise<Order[]> {
    let list = [...localOrders];
    if (isSupabaseConfigured && supabase) {
      try {
        let q = supabase.from('orders').select('*, order_items(*)').order('id', { ascending: false });
        if (userId) q = q.eq('user_id', userId);
        const { data, error } = await q;
        if (!error && data && data.length > 0) {
          const dbOrders = data.map((d: any) => ({ ...d, items: d.order_items || [] }));
          const dbNumbers = new Set(data.map((d: any) => d.order_number));
          list = [...dbOrders, ...localOrders.filter(o => !dbNumbers.has(o.order_number))];
        }
      } catch (err) {
        console.warn('Supabase fetch orders fallback to local:', err);
      }
    }
    if (userId) {
      list = list.filter(o => o.user_id === userId);
    }
    await orderExpirationService.checkAndExpireBatch(list);
    return list;
  },

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    const localFound = localOrders.find(item => item.order_number === orderNumber);
    if (localFound) return localFound;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('order_number', orderNumber)
          .single();
        if (!error && data) {
          return {
            ...data,
            items: data.order_items || [],
          };
        }
      } catch (err) {
        console.warn('Supabase fetch order by number error, fallback to local:', err);
      }
    }
    const orders = await this.getOrders();
    const found = orders.find(item => item.order_number === orderNumber);
    return found || null;
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
    if (!orderPayload.cart_items || orderPayload.cart_items.length === 0) {
      return { success: false, message: 'Keranjang belanja Anda kosong.' };
    }

    const localProds = productService._getLocalProducts();

    // 1. Validasi kuota stok fisik
    for (const item of orderPayload.cart_items) {
      const currentProduct = localProds.find(p => p.id === item.product.id);
      if (!currentProduct) {
        return { success: false, message: `Produk "${item.product.name}" tidak ditemukan dalam inventaris.` };
      }
      if (currentProduct.stock < item.quantity) {
        return { 
          success: false, 
          message: `Stok untuk "${item.product.name}" tidak mencukupi (Tersisa: ${currentProduct.stock} unit, Permintaan: ${item.quantity} unit).` 
        };
      }
    }

    // 2. Pemotongan kuota stok fisik secara atomik
    const cachedProds = productService._getCachedRawProducts();
    for (const item of orderPayload.cart_items) {
      const currentProduct = localProds.find(p => p.id === item.product.id);
      if (currentProduct) currentProduct.stock -= item.quantity;
      if (item.product) item.product.stock = currentProduct ? currentProduct.stock : (item.product.stock - item.quantity);
      if (cachedProds && currentProduct) {
        const cachedP = cachedProds.find(p => p.id === item.product.id);
        if (cachedP) cachedP.stock = currentProduct.stock;
      }
    }

    // 3. Kalkulasi total biaya & verifikasi diskon kupon aman di server
    const subtotal = orderPayload.cart_items.reduce(
      (sum, item) => sum + item.product.price * item.quantity, 
      0
    );

    let verifiedDiscount = 0;
    if (orderPayload.coupon_code) {
      const couponValidation = await couponService.validateCoupon(orderPayload.coupon_code, subtotal);
      if (couponValidation.valid && couponValidation.discount_amount > 0) {
        verifiedDiscount = couponValidation.discount_amount;
        couponService._incrementCouponUsage(orderPayload.coupon_code);
      } else {
        verifiedDiscount = 0;
      }
    } else {
      // Tolak diskon sepihak dari klien tanpa kode voucher sah
      verifiedDiscount = 0;
    }

    // PRD V5.2 FR-13: Kode Unik 3 Digit untuk Transfer Bank (100 - 999)
    const uniqueCode = orderPayload.payment_method === 'Bank Transfer'
      ? Math.floor(100 + Math.random() * 899)
      : 0;

    const grandTotal = Math.max(0, subtotal - verifiedDiscount + orderPayload.shipping_cost + uniqueCode);

    // 4. Generate Nomor Pesanan Resmi
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const orderNumber = `ORD-${dateStr}-${randomSuffix}`;

    const orderItems: OrderItem[] = orderPayload.cart_items.map((it) => ({
      product_id: it.product.id,
      product_name: it.product.name,
      selected_size: it.selected_size,
      selected_color: it.selected_color,
      price: it.product.price,
      quantity: it.quantity,
      subtotal: it.product.price * it.quantity,
    }));

    const maxId = localOrders.reduce((max, o) => Math.max(max, Number(o.id) || 0), 0);
    const newOrder: Order = {
      id: maxId + 1,
      user_id: orderPayload.user_id,
      customer_email: orderPayload.customer_email,
      order_number: orderNumber,
      customer_name: orderPayload.customer_name,
      customer_phone: orderPayload.customer_phone,
      customer_address: orderPayload.customer_address,
      shipping_courier: orderPayload.shipping_courier,
      shipping_cost: orderPayload.shipping_cost,
      coupon_code: orderPayload.coupon_code,
      discount_amount: verifiedDiscount,
      payment_method: orderPayload.payment_method,
      bank_name: orderPayload.bank_name || (orderPayload.payment_method === 'Bank Transfer' ? 'BCA' : undefined),
      unique_code: uniqueCode,
      total_amount: grandTotal,
      status: 'Menunggu Pembayaran',
      created_at: new Date().toISOString(),
      items: orderItems,
    };

    localOrders.unshift(newOrder);

    // Simpan ke Supabase jika aktif
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: orderData, error: orderErr } = await supabase.from('orders').insert({
          user_id: newOrder.user_id, order_number: newOrder.order_number,
          customer_email: newOrder.customer_email,
          customer_name: newOrder.customer_name, customer_phone: newOrder.customer_phone,
          customer_address: newOrder.customer_address, shipping_courier: newOrder.shipping_courier,
          shipping_cost: newOrder.shipping_cost, discount_amount: newOrder.discount_amount,
          payment_method: newOrder.payment_method, bank_name: newOrder.bank_name,
          unique_code: newOrder.unique_code, total_amount: newOrder.total_amount,
          status: newOrder.status,
        }).select().single();

        if (!orderErr && orderData) {
          const itemsToInsert = orderItems.map(it => ({
            order_id: orderData.id,
            product_id: it.product_id,
            product_name: it.product_name,
            selected_size: it.selected_size,
            selected_color: it.selected_color,
            price: it.price,
            quantity: it.quantity,
            subtotal: it.subtotal,
          }));
          await supabase.from('order_items').insert(itemsToInsert);

          // Update stok di supabase
          for (const item of orderPayload.cart_items) {
            const currentP = localProds.find(p => p.id === item.product.id);
            if (currentP) {
              await supabase.from('products').update({ stock: currentP.stock }).eq('id', item.product.id);
            }
          }
        }
      } catch (err) {
        console.warn('Gagal sinkron pesanan ke Supabase, tersimpan lokal:', err);
      }
    }

    return { success: true, order: newOrder };
  },

  async updateOrderStatus(orderNumber: string, status: OrderStatus, trackingNumber?: string): Promise<boolean> {
    const o = localOrders.find(item => item.order_number === orderNumber);
    if (o) {
      o.status = status;
      if (trackingNumber) {
        o.tracking_number = trackingNumber;
      }
    }
    if (isSupabaseConfigured && supabase) {
      try {
        const updatePayload: any = { status };
        if (trackingNumber) updatePayload.tracking_number = trackingNumber;
        await supabase.from('orders').update(updatePayload).eq('order_number', orderNumber);
      } catch (err) {
        console.warn('Update order status cloud error:', err);
      }
    }
    return true;
  },

  async markInvoiceEmailSent(orderNumber: string): Promise<boolean> {
    const o = localOrders.find(item => item.order_number === orderNumber);
    if (o) o.invoice_email_sent = true;
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('orders').update({ invoice_email_sent: true }).eq('order_number', orderNumber);
      } catch (err) {
        console.warn('Update invoice_email_sent error:', err);
      }
    }
    return true;
  }
};
