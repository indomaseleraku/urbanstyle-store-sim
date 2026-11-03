import React from 'react';
import { Send, Printer, User, MapPin, Package, CreditCard } from 'lucide-react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { Order } from '@/lib/admin-suite/types';
import { getOrderStatusBadge } from './orderStatusBadge';

interface OrderManagementCardsProps {
  orders: Order[];
}

export const OrderManagementCards: React.FC<OrderManagementCardsProps> = ({ orders }) => {
  const { updateOrderStatus, formatRupiah, setSelectedInvoiceOrder } = useAdminSuite();

  if (orders.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
        Tidak ditemukan pesanan dengan kriteria pencarian ini.
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
      {orders.map((o) => (
        <div key={o.id} className="p-4 space-y-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
          {/* Card Top: Order Number, Time, Status, and Total */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                {o.orderNumber}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                · {o.createdAt}
              </span>
              <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-medium">
                {o.courier}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div>{getOrderStatusBadge(o.status)}</div>
              <div className="text-right">
                <span className="font-mono font-bold text-slate-900 dark:text-white text-xs sm:text-sm tabular-nums">
                  {formatRupiah(o.total)}
                </span>
                {o.discount > 0 && (
                  <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                    Diskon -{formatRupiah(o.discount)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Card Body: 2 Columns (Left: Customer & Delivery Info, Right: Items) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Customer & Destination */}
            <div className="space-y-1.5 bg-slate-50/70 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{o.customerName}</span>
                <span className="text-slate-400 font-normal">({o.customerPhone})</span>
              </div>

              <div className="flex items-start gap-1.5 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{o.shippingAddress}, {o.city}</span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                <span>{o.paymentMethod}</span>
                <span className="mx-1">·</span>
                <span
                  className={`font-semibold ${
                    o.paymentStatus === 'paid' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {o.paymentStatus === 'paid' ? 'LUNAS' : 'BELUM DIBAYAR'}
                </span>
                {o.trackingNumber && (
                  <>
                    <span className="mx-1">·</span>
                    <span className="font-mono text-slate-600 dark:text-slate-400">Resi: {o.trackingNumber}</span>
                  </>
                )}
              </div>
            </div>

            {/* Products Ordered */}
            <div className="space-y-1 bg-slate-50/70 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 mb-1 text-[11px]">
                <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Item Dipesan ({o.items.reduce((acc, it) => acc + it.quantity, 0)} unit)</span>
              </div>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {o.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-700 dark:text-slate-300 truncate">
                      <span className="font-bold text-slate-900 dark:text-white mr-1.5">{item.quantity}x</span>
                      {item.name}
                    </span>
                    <span className="font-mono text-slate-500 dark:text-slate-400 shrink-0 ml-2">
                      {formatRupiah(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card Bottom: Operational Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => setSelectedInvoiceOrder(o)}
              className="px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium text-xs border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Faktur</span>
            </button>

            {o.status === 'processing' && (
              <button
                onClick={() => updateOrderStatus(o.id, 'packing')}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim ke Gudang</span>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
