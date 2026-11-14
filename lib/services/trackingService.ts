// lib/services/trackingService.ts
// Shipment Tracking & Logistics Timeline Domain Service

import { Order, OrderStatus, TrackingEvent } from '../types';
import { orderService } from './orderService';

export const trackingService = {
  buildTrackingFromOrder(order: Order) {
    const courier = order.shipping_courier || 'J&T Express';
    const trackingNumber = order.tracking_number?.trim()
      ? order.tracking_number.trim()
      : order.status === 'Dibatalkan'
      ? 'Dibatalkan'
      : 'Menunggu penyerahan ke kurir';

    const stepsMap: Record<OrderStatus, number> = {
      'Menunggu Pembayaran': 1,
      Dibayar: 2,
      Dikemas: 3,
      Dikirim: 4,
      Selesai: 5,
      Dibatalkan: 0,
    };

    const currentStep = stepsMap[order.status] ?? 2;
    const createdStr = order.created_at
      ? new Date(order.created_at).toLocaleString('id-ID')
      : '-';
    const updatedStr = (order as Order & { updated_at?: string }).updated_at
      ? new Date((order as Order & { updated_at?: string }).updated_at!).toLocaleString('id-ID')
      : createdStr;

    const events: TrackingEvent[] = [
      {
        title: 'Pesanan Dibuat',
        description: `Pesanan #${order.order_number} tercatat di sistem.`,
        timestamp: createdStr,
        is_completed: currentStep >= 1,
      },
      {
        title: 'Pembayaran Dikonfirmasi',
        description: `Pembayaran melalui ${order.payment_method} senilai Rp ${new Intl.NumberFormat('id-ID').format(order.total_amount)} terverifikasi.`,
        timestamp: currentStep >= 2 ? updatedStr : 'Menunggu konfirmasi',
        is_completed: currentStep >= 2,
      },
      {
        title: 'Sedang Dikemas di Gudang Logistik',
        description: 'Produk sedang melewati QC dan pengemasan untuk diserahkan ke ekspedisi.',
        timestamp: currentStep >= 3 ? updatedStr : 'Menunggu antrean',
        is_completed: currentStep >= 3,
      },
      {
        title: 'Diserahkan ke Kurir & Dalam Pengiriman',
        description:
          trackingNumber === 'Menunggu penyerahan ke kurir'
            ? `Paket dijadwalkan untuk ekspedisi ${courier}.`
            : `Paket diserahkan ke ${courier}. No. Resi: ${trackingNumber}.`,
        timestamp: currentStep >= 4 ? updatedStr : 'Belum dikirim',
        is_completed: currentStep >= 4,
      },
      {
        title: 'Pesanan Selesai / Diterima',
        description: `Paket telah diterima oleh ${order.customer_name}.`,
        timestamp: currentStep >= 5 ? updatedStr : 'Belum diterima',
        is_completed: currentStep >= 5,
      },
    ];

    return {
      order,
      currentStep,
      events,
      courier,
      trackingNumber,
    };
  },

  async getOrderTracking(orderNumber: string): Promise<{
    order: Order | null;
    currentStep: number;
    events: TrackingEvent[];
    courier: string;
    trackingNumber: string;
    statusCode?: number;
    error?: string;
  }> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch(`/api/tracking/${encodeURIComponent(orderNumber)}`, {
          cache: 'no-store',
        });
        const json = await res.json().catch(() => null);
        if (res.ok && json?.success && json.order) {
          return {
            order: json.order,
            currentStep: json.currentStep,
            events: json.events || [],
            courier: json.courier || 'J&T Express',
            trackingNumber: json.trackingNumber || 'Menunggu penyerahan ke kurir',
          };
        }
        return {
          order: null,
          currentStep: 1,
          events: [],
          courier: 'J&T Express',
          trackingNumber: '-',
          statusCode: res.status,
          error: json?.message,
        };
      } catch {
        return {
          order: null,
          currentStep: 1,
          events: [],
          courier: 'J&T Express',
          trackingNumber: '-',
          statusCode: 500,
          error: 'Gagal terhubung ke server pelacakan.',
        };
      }
    }

    const order = await orderService.getOrderByNumber(orderNumber);
    if (!order) {
      return {
        order: null,
        currentStep: 1,
        events: [],
        courier: 'J&T Express',
        trackingNumber: '-',
      };
    }
    return this.buildTrackingFromOrder(order);
  },
};
