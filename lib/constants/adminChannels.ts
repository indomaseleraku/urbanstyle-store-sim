import type { Order } from '@/lib/admin-suite/types';

export interface AdminSalesChannel {
  id: string;
  name: string;
  type: string;
  connected: boolean;
  syncInterval: string;
  ordersCount: number;
  gmvTotal: number;
  apiKeyStatus: string;
}

export function buildAdminSalesChannels(orders: Order[]): AdminSalesChannel[] {
  const validOrders = orders.filter((o) => o.status !== 'cancelled');
  const paidGmv = validOrders
    .filter((o) => o.paymentStatus === 'paid' || o.status !== 'pending_payment')
    .reduce((acc, o) => acc + Number(o.total || 0), 0);

  const qrisOrders = validOrders.filter((o) => o.paymentMethod === 'QRIS');
  const qrisPaidGmv = qrisOrders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((s, o) => s + Number(o.total || 0), 0);

  return [
    {
      id: 'web',
      name: 'UrbanStyle Official Webstore',
      type: 'Direct-to-Consumer (D2C)',
      connected: true,
      syncInterval: 'Real-time (Supabase DB)',
      ordersCount: validOrders.length,
      gmvTotal: paidGmv,
      apiKeyStatus: 'Terhubung Aktif',
    },
    {
      id: 'qris',
      name: 'Payment Gateway QRIS & VA',
      type: 'Settlement Webhook Gateway',
      connected: true,
      syncInterval: 'Real-time (HMAC Webhook)',
      ordersCount: qrisOrders.length,
      gmvTotal: qrisPaidGmv,
      apiKeyStatus: 'Terhubung Aktif',
    },
    {
      id: 'shopee',
      name: 'Shopee Official Mall',
      type: 'Marketplace API Open Platform',
      connected: false,
      syncInterval: 'Menunggu Otorisasi OAuth',
      ordersCount: 0,
      gmvTotal: 0,
      apiKeyStatus: 'Belum Dikonfigurasi',
    },
    {
      id: 'tokopedia',
      name: 'Tokopedia Official Store',
      type: 'Tokopedia Merchant API v2',
      connected: false,
      syncInterval: 'Menunggu Otorisasi OAuth',
      ordersCount: 0,
      gmvTotal: 0,
      apiKeyStatus: 'Belum Dikonfigurasi',
    },
  ];
}
