// lib/services/orderExpirationService.ts
// Domain Service: Manajemen Batas Waktu Pembayaran (20 Menit) & Restock Otomatis Atomik

import { Order } from '../types';
import { checkSupabaseConfigured } from './supabaseClient';
import { productService } from './productService';

export const PAYMENT_TIMEOUT_MS = 20 * 60 * 1000;

export const orderExpirationService = {
  getRemainingTime(createdAt: string): { remainingMs: number; isExpired: boolean; formatted: string } {
    const createdTime = new Date(createdAt).getTime();
    if (isNaN(createdTime)) {
      return { remainingMs: 0, isExpired: true, formatted: '00:00' };
    }

    const elapsed = Date.now() - createdTime;
    const remainingMs = Math.max(0, PAYMENT_TIMEOUT_MS - elapsed);
    const isExpired = remainingMs === 0;

    const totalSeconds = Math.floor(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    return { remainingMs, isExpired, formatted };
  },

  async expireOrder(order: Order): Promise<boolean> {
    if (order.status !== 'Menunggu Pembayaran' && (order.status as string) !== 'pending_payment') {
      return false;
    }

    order.status = 'Dibatalkan';

    if (typeof window === 'undefined' && checkSupabaseConfigured()) {
      try {
        const { supabaseAdmin } = await import('../supabaseAdmin');
        const { data: updatedOrder, error } = await supabaseAdmin
          .from('orders')
          .update({ status: 'Dibatalkan', updated_at: new Date().toISOString() })
          .eq('order_number', order.order_number)
          .eq('status', 'Menunggu Pembayaran')
          .select('id')
          .maybeSingle();

        if (!error && updatedOrder) {
          for (const item of order.items) {
            if (!item.product_id || !item.quantity || item.quantity <= 0) continue;
            await supabaseAdmin.rpc('atomic_increment_stock', {
              p_product_id: Number(item.product_id),
              p_qty: Number(item.quantity),
            });
          }
          productService.invalidateCache();
        }
        return true;
      } catch (err) {
        console.warn('Gagal membatalkan & restock pesanan kadaluwarsa di Supabase:', err);
        return false;
      }
    }

    const localProds = productService._getLocalProducts();
    for (const item of order.items) {
      const prod = localProds.find((p) => p.id === item.product_id);
      if (prod) prod.stock += item.quantity;
    }
    return true;
  },

  async checkAndExpireBatch(orders: Order[]): Promise<number> {
    let expiredCount = 0;
    for (const order of orders) {
      if (order.status === 'Menunggu Pembayaran' || (order.status as string) === 'pending_payment') {
        const { isExpired } = this.getRemainingTime(order.created_at);
        if (isExpired) {
          const ok = await this.expireOrder(order);
          if (ok) expiredCount++;
        }
      }
    }
    return expiredCount;
  },
};
