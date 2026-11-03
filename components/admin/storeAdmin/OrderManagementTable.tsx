import React from 'react';
import { Send, Printer, User, MapPin } from 'lucide-react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { Order } from '@/lib/admin-suite/types';
import { getOrderStatusBadge } from './orderStatusBadge';

interface OrderManagementTableProps {
  orders: Order[];
}

export const OrderManagementTable: React.FC<OrderManagementTableProps> = ({ orders }) => {
  const { updateOrderStatus, formatRupiah, setSelectedInvoiceOrder } = useAdminSuite();

  if (orders.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
        Tidak ditemukan pesanan dengan kriteria pencarian ini.
      </div>
    );
  }

  return (
    <div className="w-full">
      <table className="w-full table-fixed text-left text-xs divide-y divide-slate-200 dark:divide-slate-800">
        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 select-none">
          <tr>
            <th className="w-[30%] px-4 py-3 font-semibold">Pesanan & Pelanggan</th>
            <th className="w-[30%] px-4 py-3 font-semibold">Produk Dipesan</th>
            <th className="w-[20%] px-4 py-3 font-semibold text-right sm:text-left">Pembayaran & Total</th>
            <th className="w-[20%] px-4 py-3 font-semibold text-right">Status & Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
          {orders.map((o) => (
            <tr key={o.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
              {/* 1. Pesanan & Pelanggan */}
              <td className="px-4 py-3 align-top">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                      {o.orderNumber}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                      · {o.createdAt}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-medium">
                    <User className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{o.customerName}</span>
                    <span className="text-[11px] text-slate-400 font-normal shrink-0">({o.customerPhone})</span>
                  </div>

                  <div className="flex items-start gap-1 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">
                      {o.shippingAddress}, {o.city} · <span className="font-semibold text-slate-700 dark:text-slate-300">{o.courier}</span>
                    </span>
                  </div>
                </div>
              </td>

              {/* 2. Produk Dipesan */}
              <td className="px-4 py-3 align-top">
                <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-md p-2 border border-slate-100 dark:border-slate-800 space-y-1 max-h-24 overflow-y-auto">
                  {o.items.map((item, idx) => (
                    <div key={idx} className="flex items-baseline justify-between gap-1 text-[11px]">
                      <span className="text-slate-700 dark:text-slate-300 truncate">
                        <span className="font-bold text-slate-900 dark:text-white mr-1">{item.quantity}x</span>
                        {item.name}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 shrink-0">
                        {formatRupiah(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </td>

              {/* 3. Pembayaran & Total */}
              <td className="px-4 py-3 align-top">
                <div className="space-y-1 sm:text-left text-right">
                  <div className="font-mono font-bold text-xs text-slate-900 dark:text-white tabular-nums">
                    {formatRupiah(o.total)}
                  </div>
                  {o.discount > 0 && (
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                      Hemat -{formatRupiah(o.discount)}
                    </div>
                  )}
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">
                    {o.paymentMethod}
                  </div>
                  <div>
                    <span
                      className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide ${
                        o.paymentStatus === 'paid'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {o.paymentStatus === 'paid' ? 'LUNAS' : 'BELUM BAYAR'}
                    </span>
                  </div>
                </div>
              </td>

              {/* 4. Status & Aksi Operasional */}
              <td className="px-4 py-3 align-top text-right">
                <div className="space-y-2 flex flex-col items-end">
                  <div>{getOrderStatusBadge(o.status)}</div>

                  {o.trackingNumber && (
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block">
                      Resi: {o.trackingNumber}
                    </span>
                  )}

                  <div className="flex items-center justify-end gap-1.5 pt-0.5">
                    {o.status === 'processing' && (
                      <button
                        onClick={() => updateOrderStatus(o.id, 'packing')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded text-[11px] shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                        title="Teruskan ke Gudang untuk dipacking"
                      >
                        <Send className="w-3 h-3" />
                        <span className="hidden md:inline">Kirim ke Gudang</span>
                        <span className="md:hidden">Kirim</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedInvoiceOrder(o)}
                      className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                      title="Cetak Faktur / Invoice Pelanggan"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
