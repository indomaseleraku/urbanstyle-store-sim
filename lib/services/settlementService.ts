// lib/services/settlementService.ts
// Autonomous Settlement & Mutation Processing Engine (TPS)

import { Order } from '../types';
import { orderService } from './orderService';
import { orderExpirationService } from './orderExpirationService';

export interface PaymentWebhookPayload {
  order_number?: string;
  order_id?: string;
  amount?: number | string;
  status?: string;
  transaction_status?: string;
  raw_text?: string;
  source?: string;
  is_test?: boolean;
  channel?: string;
  app_name?: string;
  title?: string;
}

export interface SettlementCheckResult {
  success: boolean;
  order: Order | null;
  settled: boolean;
  remainingMs?: number;
  reason?: string;
}

export interface WebhookProcessResult {
  success: boolean;
  order_number?: string;
  amount?: number;
  previous_status?: string;
  new_status?: string;
  message: string;
}

const PAID_STATUS_TOKENS = new Set(['PAID', 'SETTLED', 'SETTLEMENT', 'CAPTURE', 'SUCCESS', 'LUNAS', 'DIBAYAR']);
const CANCEL_STATUS_TOKENS = new Set(['EXPIRED', 'FAILED', 'CANCELLED', 'CANCELED', 'DENY', 'REJECTED', 'DIBATALKAN']);

let autoSettleDelayMs = 10_000;
let isAutoSettlementEnabled = false;

export const settlementService = {
  getAutoSettleDelayMs(): number {
    return autoSettleDelayMs;
  },

  setAutoSettleDelayMs(ms: number): void {
    autoSettleDelayMs = Math.max(0, ms);
  },

  isAutoSettlementEnabled(): boolean {
    return isAutoSettlementEnabled;
  },

  setAutoSettlementEnabled(enabled: boolean): void {
    isAutoSettlementEnabled = Boolean(enabled);
  },

  async checkAndSettleOrder(orderNumber: string): Promise<SettlementCheckResult> {
    if (!orderNumber || typeof orderNumber !== 'string') {
      return { success: false, order: null, settled: false, reason: 'Nomor pesanan tidak valid.' };
    }

    const order = await orderService.getOrderByNumber(orderNumber.trim());
    if (!order) {
      return {
        success: false,
        order: null,
        settled: false,
        reason: `Pesanan #${orderNumber} tidak ditemukan dalam database.`,
      };
    }

    if (order.status === 'Dibatalkan') {
      return {
        success: true,
        order,
        settled: false,
        remainingMs: 0,
        reason: 'Pesanan telah dibatalkan karena melewati batas pembayaran 20 menit.',
      };
    }

    if (order.status !== 'Menunggu Pembayaran') {
      return {
        success: true,
        order,
        settled: true,
        remainingMs: 0,
        reason: `Pesanan sudah dalam status: ${order.status}`,
      };
    }

    const { remainingMs, isExpired } = orderExpirationService.getRemainingTime(order.created_at);
    if (isExpired) {
      await orderExpirationService.expireOrder(order);
      return {
        success: true,
        order,
        settled: false,
        remainingMs: 0,
        reason: 'Waktu pembayaran 20 menit telah habis. Pesanan dibatalkan otomatis dan stok dikembalikan.',
      };
    }

    return {
      success: true,
      order,
      settled: false,
      remainingMs,
      reason: 'Menunggu notifikasi pembayaran masuk...',
    };
  },

  async processPaymentWebhook(payload: PaymentWebhookPayload): Promise<WebhookProcessResult> {
    if (!payload || typeof payload !== 'object') {
      return { success: false, message: 'Payload webhook tidak valid atau kosong.' };
    }

    if (
      payload.is_test ||
      payload.channel === 'Test Ping' ||
      payload.app_name === 'Test Ping' ||
      payload.title === 'Uji Coba Ping' ||
      (typeof payload.raw_text === 'string' && payload.raw_text.toLowerCase().includes('ping'))
    ) {
      return { success: true, message: 'Koneksi ping webhook terverifikasi.' };
    }

    const rawStatus = String(payload.transaction_status || payload.status || '').trim().toUpperCase();
    const isCancelEvent = Boolean(rawStatus && CANCEL_STATUS_TOKENS.has(rawStatus));
    const isExplicitPaidEvent = !rawStatus || PAID_STATUS_TOKENS.has(rawStatus);

    if (rawStatus && !isExplicitPaidEvent && !isCancelEvent) {
      return {
        success: false,
        message: `Status transaksi webhook "${rawStatus}" diabaikan karena bukan event penyelesaian atau pembatalan.`,
      };
    }

    let targetOrderNumber = (payload.order_number || payload.order_id || '').trim();
    let numericAmount: number | undefined;
    if (payload.amount !== undefined && payload.amount !== null && payload.amount !== '') {
      const parsed = Number(payload.amount);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        return { success: false, message: 'Nominal mutasi webhook tidak valid.' };
      }
      numericAmount = parsed;
    }

    if (payload.raw_text && typeof payload.raw_text === 'string') {
      const orderMatch = payload.raw_text.match(/ORD-\d{8}-[A-Z0-9]{3,10}/i);
      if (orderMatch && !targetOrderNumber) {
        targetOrderNumber = orderMatch[0].toUpperCase();
      }

      const amountMatch = payload.raw_text.match(/(?:rp|sebesar|nominal)\s*[:\.]?\s*([\d\.,]+)/i);
      if (amountMatch && numericAmount === undefined) {
        const cleanedStr = amountMatch[1].replace(/\./g, '').replace(/,/g, '');
        const parsed = parseInt(cleanedStr, 10);
        if (!isNaN(parsed) && parsed > 0) {
          numericAmount = parsed;
        }
      }
    }

    let order: Order | null = null;
    if (targetOrderNumber) {
      order = await orderService.getOrderByNumber(targetOrderNumber);
    } else if (numericAmount !== undefined && numericAmount > 0 && isExplicitPaidEvent) {
      // Hanya izinkan pencocokan berdasar nominal jika TEPAT SATU pesanan aktif belum kedaluwarsa cocok
      const allOrders = await orderService.getOrders();
      const candidates = allOrders.filter(
        (o) =>
          o.status === 'Menunggu Pembayaran' &&
          !orderExpirationService.getRemainingTime(o.created_at).isExpired &&
          Math.round(Number(o.total_amount)) === Math.round(numericAmount!)
      );
      if (candidates.length === 1) {
        order = candidates[0];
      } else if (candidates.length > 1) {
        return {
          success: false,
          message: `Terdapat ${candidates.length} pesanan tertunda dengan nominal identik. Sertakan nomor pesanan resmi.`,
        };
      }
    }

    if (!order) {
      return {
        success: false,
        message: targetOrderNumber
          ? `Pesanan dengan nomor #${targetOrderNumber} tidak ditemukan.`
          : 'Nomor pesanan tidak ditemukan pada payload webhook.',
      };
    }

    if (isCancelEvent) {
      if (order.status === 'Menunggu Pembayaran') {
        await orderExpirationService.expireOrder(order);
        return {
          success: true,
          order_number: order.order_number,
          amount: Number(order.total_amount),
          previous_status: 'Menunggu Pembayaran',
          new_status: 'Dibatalkan',
          message: `Pesanan #${order.order_number} dibatalkan dan stok dikembalikan sesuai status webhook (${rawStatus}).`,
        };
      }
      return {
        success: false,
        order_number: order.order_number,
        message: `Pesanan #${order.order_number} berstatus ${order.status} sehingga tidak dapat dibatalkan.`,
      };
    }

    if (order.status !== 'Menunggu Pembayaran') {
      return {
        success: true,
        order_number: order.order_number,
        amount: Number(order.total_amount),
        previous_status: order.status,
        new_status: order.status,
        message: `Pesanan #${order.order_number} sudah dalam status ${order.status}.`,
      };
    }

    const expectedAmount = Math.round(Number(order.total_amount));
    if (numericAmount === undefined || Math.round(numericAmount) !== expectedAmount) {
      return {
        success: false,
        order_number: order.order_number,
        message: `Nominal mutasi tidak valid/tidak cocok! Diterima: Rp ${Math.round(numericAmount || 0).toLocaleString('id-ID')}, Tagihan: Rp ${expectedAmount.toLocaleString('id-ID')}.`,
      };
    }

    const updated = await orderService.updateOrderStatus(
      order.order_number,
      'Dibayar',
      undefined,
      'Menunggu Pembayaran'
    );
    if (!updated) {
      return {
        success: false,
        order_number: order.order_number,
        message: `Gagal mengonfirmasi status lunas pesanan #${order.order_number}.`,
      };
    }

    return {
      success: true,
      order_number: order.order_number,
      amount: Number(order.total_amount),
      previous_status: 'Menunggu Pembayaran',
      new_status: 'Dibayar',
      message: `Pembayaran pesanan #${order.order_number} sebesar Rp ${Number(order.total_amount).toLocaleString('id-ID')} berhasil diverifikasi.`,
    };
  },

  async simulateInstantSettle(orderNumber: string): Promise<boolean> {
    const order = await orderService.getOrderByNumber(orderNumber.trim());
    if (!order || order.status !== 'Menunggu Pembayaran') {
      return false;
    }
    return orderService.updateOrderStatus(
      order.order_number,
      'Dibayar',
      undefined,
      'Menunggu Pembayaran'
    );
  },
};
