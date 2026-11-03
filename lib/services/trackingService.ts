// lib/services/trackingService.ts
// Shipment Tracking & Logistics Timeline Domain Service

import { Order, OrderStatus, TrackingEvent } from '../types';
import { orderService } from './orderService';

export const trackingService = {
  async getOrderTracking(orderNumber: string): Promise<{
    order: Order | null;
    currentStep: number;
    events: TrackingEvent[];
    courier: string;
    trackingNumber: string;
  }> {
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

    const courier = order.shipping_courier || 'J&T Express';
    const trackingNumber = order.tracking_number || (
      order.status === 'Dikirim' || order.status === 'Selesai' 
        ? `JT${Math.floor(10000000000 + Math.random() * 90000000000)}` 
        : 'Menunggu penyerahan ke kurir'
    );

    const stepsMap: Record<OrderStatus, number> = {
      'Menunggu Pembayaran': 1,
      'Dibayar': 2,
      'Dikemas': 3,
      'Dikirim': 4,
      'Selesai': 5,
      'Dibatalkan': 0,
    };

    const currentStep = stepsMap[order.status] ?? 2;
    const createdAt = new Date(order.created_at);
    
    const events: TrackingEvent[] = [
      {
        title: 'Pesanan Dibuat',
        description: `Pesanan #${order.order_number} berhasil dibuat oleh pembeli.`,
        timestamp: createdAt.toLocaleString('id-ID'),
        is_completed: currentStep >= 1,
      },
      {
        title: 'Pembayaran Dikonfirmasi',
        description: `Pembayaran melalui ${order.payment_method} senilai Rp ${new Intl.NumberFormat('id-ID').format(order.total_amount)} telah terverifikasi.`,
        timestamp: new Date(createdAt.getTime() + 5 * 60000).toLocaleString('id-ID'),
        is_completed: currentStep >= 2,
      },
      {
        title: 'Sedang Dikemas di Gudang Logistik',
        description: 'Barang sedang diperiksa kualitasnya (QC) dan dikemas rapi dalam kemasan ramah lingkungan LifeWear.',
        timestamp: new Date(createdAt.getTime() + 120 * 60000).toLocaleString('id-ID'),
        is_completed: currentStep >= 3,
      },
      {
        title: 'Diserahkan ke Kurir & Dalam Pengiriman',
        description: `Paket diserahkan ke ${courier}. No. Resi: ${trackingNumber}. Paket sedang menuju alamat penerima.`,
        timestamp: new Date(createdAt.getTime() + 360 * 60000).toLocaleString('id-ID'),
        is_completed: currentStep >= 4,
      },
      {
        title: 'Pesanan Selesai / Diterima',
        description: `Paket telah diterima dengan baik oleh ${order.customer_name}. Terima kasih telah berbelanja di UrbanStyle Store!`,
        timestamp: new Date(createdAt.getTime() + 1440 * 60000).toLocaleString('id-ID'),
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
  }
};
