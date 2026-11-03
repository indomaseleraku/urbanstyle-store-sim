import React from 'react';
import { Printer, Send } from 'lucide-react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { Order, OrderStatus } from '@/lib/admin-suite/types';

interface OrderManagementMobileCardsProps {
  orders: Order[];
  getStatusBadge: (status: OrderStatus) => React.ReactNode;
}

export const OrderManagementMobileCards: React.FC<OrderManagementMobileCardsProps> = ({
  orders,
  getStatusBadge,
}) => {
  const { updateOrderStatus, formatRupiah, setSelectedInvoiceOrder } = useAdminSuite();

  if (orders.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
        Tidak ditemukan pesanan dengan kriteria filter ini.
      </div>
    );
  }

  return (
    <div className="block sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
      {orders.map((o) => (
        <div key={o.id} className="p-3.5 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">{o.orderNumber}</span>
                <span className="text-[10px] text-slate-400 font-mono">· {o.createdAt}</span>
              </div>
              <p className="font-semibold text-slate-900 dark:text-white text-xs mt-0.5">{o.customerName}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {o.city} · Kurir: {o.courier}
              </p>
            </div>
            <div className="text-right shrink-0">
              {getStatusBadge(o.status)}
              <span className="block font-mono font-bold text-xs text-slate-900 dark:text-white mt-1 tabular-nums">
                {formatRupiah(o.total)}
              </span>
            </div>
          </div>

          {/* Items summary */}
          <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-[11px] space-y-1">
            {o.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                  {item.quantity}x {item.name}
                </span>
                <span className="font-mono text-slate-500 dark:text-slate-400">
                  {formatRupiah(item.price * item.quantity)}
                </span>
              </div>
            ))}
            <div className="pt-1 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px]">
              <span className="text-slate-500 dark:text-slate-400">Metode: {o.paymentMethod}</span>
              <span
                className={`font-semibold ${
                  o.paymentStatus === 'paid'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {o.paymentStatus === 'paid' ? 'LUNAS' : 'BELUM DIBAYAR'}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => setSelectedInvoiceOrder(o)}
              className="px-2.5 py-1 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded font-medium text-[11px] border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition-colors"
            >
              <Printer className="w-3 h-3" />
              Faktur
            </button>
            {o.status === 'processing' && (
              <button
                onClick={() => updateOrderStatus(o.id, 'packing')}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded text-[11px] shadow-xs flex items-center gap-1 transition-colors"
              >
                <Send className="w-3 h-3" />
                Kirim ke Gudang
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
