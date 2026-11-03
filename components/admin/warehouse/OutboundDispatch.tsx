import React, { useState } from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import {
  Printer,
  CheckCircle,
  Send,
  MapPin,
} from 'lucide-react';
import { Order } from '@/lib/admin-suite/types';

export const OutboundDispatch: React.FC = () => {
  const { orders, updateOrderStatus, setSelectedPackingOrder } = useAdminSuite();

  const [activeTab, setActiveTab] = useState<'queue' | 'dispatched'>('queue');
  const [trackingInputs, setTrackingInputs] = useState<{ [orderId: string]: string }>({});

  const packingQueue = orders.filter((o) => o.status === 'packing');
  const dispatchedOrders = orders.filter((o) => o.status === 'shipped' || o.status === 'delivered');

  const handleTrackingChange = (orderId: string, val: string) => {
    setTrackingInputs((prev) => ({ ...prev, [orderId]: val }));
  };

  const handleDispatch = (order: Order) => {
    const inputResi = trackingInputs[order.id];
    const generatedResi =
      inputResi?.trim() ||
      `${order.courier.slice(0, 3).toUpperCase()}${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    updateOrderStatus(order.id, 'shipped', generatedResi);
  };

  return (
    <div className="space-y-4 sm:space-y-5 w-full max-w-full">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Antrean Packing & Serah Terima Kurir (Outbound)
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pengecekan fisik barang, cetak label pengiriman thermal, scan barcode, dan input nomor resi ekspedisi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 sm:p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setActiveTab('queue')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'queue'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Antrean ({packingQueue.length})
            </button>
            <button
              onClick={() => setActiveTab('dispatched')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'dispatched'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Terkirim ({dispatchedOrders.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'queue' ? (
        <div className="space-y-4">
          {packingQueue.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 text-center rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
              <CheckCircle className="w-9 h-9 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Semua Antrean Packing Bersih!</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Tidak ada pesanan tertunda di gudang. Ketika Admin Toko mengonfirmasi pesanan baru, item akan langsung muncul di sini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {packingQueue.map((order) => (
                <div
                  key={order.id}
                  className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 shadow-xs space-y-3 transition-colors"
                >
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                        {order.orderNumber}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono ml-2">
                        {order.createdAt}
                      </span>
                    </div>
                    <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {order.courier}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                        Tujuan Penerima:
                      </p>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {order.customerName} ({order.customerPhone})
                      </p>
                      <p className="text-slate-600 dark:text-slate-300 flex items-start gap-1 mt-0.5 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>
                          {order.shippingAddress}, {order.city}
                        </span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] sm:text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                        Picking List Barang:
                      </p>
                      <div className="space-y-1 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              {item.quantity}x {item.name}
                            </span>
                            <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">{item.sku}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {order.notes && (
                      <p className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 p-2 rounded border border-amber-200 dark:border-amber-900/60">
                        Catatan: {order.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions & Resi Entry */}
                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedPackingOrder(order)}
                        className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700 min-h-[36px]"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Cetak Thermal Label
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Scan / ketik No. Resi kurir..."
                        value={trackingInputs[order.id] || ''}
                        onChange={(e) => handleTrackingChange(order.id, e.target.value)}
                        className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-800 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-800 min-h-[36px]"
                      />
                      <button
                        onClick={() => handleDispatch(order)}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors whitespace-nowrap min-h-[36px]"
                      >
                        <Send className="w-3 h-3" />
                        Serahkan Kurir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Dispatched Table */
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
          <div className="overflow-x-auto w-full max-w-full">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">No. Pesanan</th>
                  <th className="px-4 py-3 font-semibold">Penerima & Kota</th>
                  <th className="px-4 py-3 font-semibold">Ekspedisi</th>
                  <th className="px-4 py-3 font-semibold">Nomor Resi</th>
                  <th className="px-4 py-3 font-semibold text-center">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Label</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {dispatchedOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{o.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{o.customerName}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{o.city}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{o.courier}</td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                      {o.trackingNumber || 'RES-AUTO-99812'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        {o.status === 'delivered' ? 'Selesai' : 'Dalam Pengiriman'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedPackingOrder(o)}
                        className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Lihat Label Pengiriman"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
