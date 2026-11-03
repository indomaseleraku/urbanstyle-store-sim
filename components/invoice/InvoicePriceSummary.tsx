// components/invoice/InvoicePriceSummary.tsx
import React from 'react';
import { Order } from '@/lib/types';

interface InvoicePriceSummaryProps {
  order: Order;
  subtotal: number;
}

export default function InvoicePriceSummary({ order, subtotal }: InvoicePriceSummaryProps) {
  return (
    <div className="space-y-2 text-xs">
      <div className="p-4 bg-zinc-50 border border-zinc-200 space-y-2">
        <div className="flex justify-between text-zinc-600">
          <span>Subtotal Produk:</span>
          <span className="font-mono font-semibold">Rp {subtotal.toLocaleString('id-ID')}</span>
        </div>
        {order.discount_amount && order.discount_amount > 0 ? (
          <div className="flex justify-between text-emerald-700">
            <span>Diskon Kupon Promo ({order.coupon_code || 'PROMO'}):</span>
            <span className="font-mono font-semibold">
              - Rp {Number(order.discount_amount).toLocaleString('id-ID')}
            </span>
          </div>
        ) : null}
        <div className="flex justify-between text-zinc-600">
          <span>Biaya Pengiriman ({order.shipping_courier}):</span>
          <span className="font-mono font-semibold">
            {order.shipping_cost === 0 ? 'GRATIS' : `Rp ${order.shipping_cost.toLocaleString('id-ID')}`}
          </span>
        </div>
        {order.payment_method === 'Bank Transfer' && order.unique_code && order.unique_code > 0 ? (
          <div className="flex justify-between text-[#E60012]">
            <span>Kode Unik Rekening:</span>
            <span className="font-mono font-semibold">+ Rp {order.unique_code.toLocaleString('id-ID')}</span>
          </div>
        ) : null}
        <div className="flex justify-between text-zinc-600">
          <span>Biaya Layanan Gerbang Pembayaran:</span>
          <span className="font-mono font-semibold text-emerald-700">Rp 0 (Bebas Biaya)</span>
        </div>
        <div className="pt-2 border-t border-zinc-300 flex justify-between items-baseline font-black text-base text-zinc-950">
          <span className="uppercase text-xs tracking-wider">Total Pembayaran:</span>
          <span className="text-[#E60012] font-mono text-lg">
            Rp {Number(order.total_amount).toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      <div className="p-3 bg-zinc-100 border border-zinc-200 text-[11px] text-zinc-600 space-y-1">
        <p className="font-bold uppercase text-zinc-900">Catatan Validitas Nota:</p>
        <p>• Nota ini diterbitkan secara otomatis oleh modul TPS UrbanStyle Store.</p>
        <p>• Stok barang telah dikurangi secara atomik di database PostgreSQL Supabase.</p>
        <p>• Nomor resi pengiriman akan diperbarui oleh admin setelah barang dikemas.</p>
      </div>
    </div>
  );
}
