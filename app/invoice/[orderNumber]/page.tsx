import React from 'react';
import Link from 'next/link';
import { dataStore } from '@/lib/store';
import { 
  ArrowLeft, 
  CheckCircle2, 
  QrCode, 
  Truck, 
  Building2 
} from 'lucide-react';
import { InvoicePrintButton } from '@/components/InvoiceActions';
import InvoicePaymentSection from '@/components/invoice/InvoicePaymentSection';
import InvoicePriceSummary from '@/components/invoice/InvoicePriceSummary';

export default async function InvoicePage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const resolvedParams = await params;
  const orderNumber = resolvedParams.orderNumber;
  const order = await dataStore.getOrderByNumber(orderNumber);

  if (!order) {
    return (
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 border border-zinc-300 max-w-md w-full text-center space-y-4">
          <p className="text-xs uppercase font-bold tracking-widest text-[#E60012]">Faktur Tidak Ditemukan</p>
          <h1 className="text-lg font-black uppercase text-zinc-900">Pesanan #{orderNumber} Belum Terdaftar</h1>
          <p className="text-xs text-zinc-600">Silakan kembali ke katalog untuk membuat pesanan baru.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-[#E60012] transition-colors"
          >
            <ArrowLeft size={14} /> Kembali ke Toko
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = order.items.reduce((s, it) => s + it.price * it.quantity, 0);

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 py-6 px-3 sm:px-6 selection:bg-[#E60012] selection:text-white">
      <div className="max-w-4xl mx-auto space-y-4">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between no-print">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-zinc-950 transition-colors"
          >
            <ArrowLeft size={16} /> Kembali ke Katalog
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/track/${order.order_number}`}
              className="text-xs font-bold uppercase tracking-wider bg-zinc-950 hover:bg-[#E60012] text-white flex items-center gap-1.5 px-3 py-1.5 transition-colors shadow-xs"
            >
              <Truck size={14} />
              <span>Lacak Pengiriman 🚚</span>
            </Link>
            <InvoicePrintButton />
          </div>
        </div>

        {/* Invoice Card */}
        <div className="bg-white border border-zinc-300 shadow-md p-6 sm:p-10 space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-200 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#E60012] text-white flex flex-col items-center justify-center font-black tracking-tighter leading-none shrink-0 shadow-xs">
                <span className="text-xs">UR</span>
                <span className="text-[10px]">BAN</span>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-zinc-950">
                  UrbanStyle Store
                </h1>
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                  LifeWear Essentials • Modul Transaksi (TPS)
                </p>
              </div>
            </div>

            <div className="sm:text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-black uppercase tracking-wider">
                <CheckCircle2 size={14} />
                <span>Status: {order.status}</span>
              </div>
              <p className="text-xs font-mono font-bold text-zinc-700 mt-1">
                No: {order.order_number}
              </p>
              <p className="text-[11px] text-zinc-400">
                {new Date(order.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {/* Customer & Shipping Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-zinc-50 border border-zinc-200 text-xs">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Data Pemesan:</p>
              <p className="font-bold text-sm text-zinc-900">{order.customer_name}</p>
              <p className="text-zinc-600 font-mono">{order.customer_phone}</p>
              <p className="text-zinc-600 leading-relaxed pt-1">{order.customer_address}</p>
            </div>
            <div className="space-y-1 sm:border-l sm:border-zinc-200 sm:pl-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Ekspedisi & Pembayaran:</p>
              <div className="flex items-center gap-1.5 font-bold text-zinc-900">
                <Truck size={14} className="text-[#E60012]" />
                <span>{order.shipping_courier}</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-zinc-900 pt-1">
                {order.payment_method === 'Bank Transfer' ? (
                  <Building2 size={14} className="text-[#E60012]" />
                ) : (
                  <QrCode size={14} className="text-zinc-700" />
                )}
                <span>
                  Metode: {order.payment_method}
                  {order.payment_method === 'Bank Transfer' && order.bank_name ? ` (${order.bank_name})` : ''}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 pt-1">
                Verifikasi Transaksi Otomatis Terhubung ke Server SIM
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">
              Rincian Item Busana Dipesan:
            </h2>
            <div className="border border-zinc-200 overflow-x-auto">
              <table className="w-full min-w-[540px] text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-100 border-b border-zinc-200 text-zinc-700 font-bold uppercase text-[11px]">
                    <th className="p-3">Item Busana</th>
                    <th className="p-3 text-center">Ukuran</th>
                    <th className="p-3 text-center">Warna</th>
                    <th className="p-3 text-right">Harga Satuan</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {order.items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/50">
                      <td className="p-3 font-semibold text-zinc-950">{it.product_name}</td>
                      <td className="p-3 text-center font-mono font-bold">{it.selected_size}</td>
                      <td className="p-3 text-center text-zinc-600">{it.selected_color}</td>
                      <td className="p-3 text-right font-mono">Rp {it.price.toLocaleString('id-ID')}</td>
                      <td className="p-3 text-center font-bold">{it.quantity}</td>
                      <td className="p-3 text-right font-mono font-bold">Rp {it.subtotal.toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* QRIS / Bank Transfer Display and Financial Total */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-200 items-start">
            <InvoicePaymentSection order={order} />
            <InvoicePriceSummary order={order} subtotal={subtotal} />
          </div>

          {/* Official Store Footer Notice */}
          <div className="pt-6 border-t border-zinc-200 text-center text-[11px] text-zinc-400">
            Faktur Pembayaran Resmi UrbanStyle LifeWear Tokyo • Simpan bukti transaksi ini untuk keperluan verifikasi dan klaim garansi.
          </div>

        </div>

      </div>
    </div>
  );
}
