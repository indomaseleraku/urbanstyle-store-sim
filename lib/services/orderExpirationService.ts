// lib/services/orderExpirationService.ts
// Domain Service: Manajemen Batas Waktu Pembayaran (20 Menit) & Restock Otomatis

import { Order } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { productService } from './productService';

export const PAYMENT_TIMEOUT_MS = 20 * 60 * 1000; // 20 Menit

export const orderExpirationService = {
  /**
   * Menghitung sisa waktu pembayaran untuk pesanan
   */
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

  /**
   * Batalkan satu pesanan yang kadaluwarsa dan kembalikan kuota stok produk
   */
  async expireOrder(order: Order): Promise<boolean> {
    if (order.status !== 'Menunggu Pembayaran' && (order.status as string) !== 'pending_payment') {
      return false;
    }

    order.status = 'Dibatalkan';

    // 1. Kembalikan stok fisik produk secara atomik
    const localProds = productService._getLocalProducts();
    const cachedProds = productService._getCachedRawProducts();

    for (const item of order.items) {
      const prod = localProds.find((p) => p.id === item.product_id);
      if (prod) {
        prod.stock += item.quantity;
      }
      if (cachedProds) {
        const cachedP = cachedProds.find((p) => p.id === item.product_id);
        if (cachedP && prod) {
          cachedP.stock = prod.stock;
        }
      }

      // Update stok di Supabase jika aktif
      if (isSupabaseConfigured && supabase && prod) {
        try {
          await supabase.from('products').update({ stock: prod.stock }).eq('id', item.product_id);
        } catch (err) {
          console.warn('Gagal restock produk di Supabase:', err);
        }
      }
    }

    // 2. Update status pesanan di Supabase jika aktif
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('orders')
          .update({ status: 'Dibatalkan' })
          .eq('order_number', order.order_number);
      } catch (err) {
        console.warn('Gagal update status pesanan kadaluwarsa di Supabase:', err);
      }
    }

    return true;
  },

  /**
   * Pindai dan batalkan seluruh pesanan yang melewati batas 20 menit
   */
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
