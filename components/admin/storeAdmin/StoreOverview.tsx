import React from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import {
  AlertCircle,
  ChevronRight,
  ArrowUpRight,
  PackageCheck,
} from 'lucide-react';
import { OrderTrendChart } from './OrderTrendChart';

export const StoreOverview: React.FC = () => {
  const { orders, products, formatRupiah, setActiveNav, updateOrderStatus } = useAdminSuite();

  const todayOrders = orders.filter((o) => o.createdAt.includes('Hari ini') || o.createdAt.includes('14 Okt') || o.createdAt.includes('13 Okt'));
  const todayRevenue = todayOrders.reduce((acc, curr) => acc + curr.total, 0);

  const pendingConfirmation = orders.filter((o) => o.status === 'processing');
  const pendingPayment = orders.filter((o) => o.status === 'pending_payment');
  const lowStockProducts = products.filter((p) => p.stock <= p.safetyStock);

  return (
    <div className="space-y-4 sm:space-y-5 w-full max-w-full">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Dashboard Operasional Toko (Admin Toko)
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola pesanan pelanggan hari ini, etalase produk, dan sinkronisasi pesanan ke bagian gudang.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveNav('orders')}
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors min-h-[36px]"
          >
            <PackageCheck className="w-3.5 h-3.5" />
            Proses Pesanan ({pendingConfirmation.length})
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate block">Omset Hari Ini</span>
          <div className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 dark:text-white mt-1 tabular-nums truncate">
            {formatRupiah(todayRevenue || 2864000)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-0.5 flex items-center">
            <ArrowUpRight className="w-3 h-3 inline mr-0.5 shrink-0" /> {todayOrders.length || 3} transaksi
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate block">Perlu Diproses</span>
          <div className="text-sm sm:text-base lg:text-lg font-bold text-amber-700 dark:text-amber-400 mt-1 tabular-nums">
            {pendingConfirmation.length} Pesanan
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Siap ke gudang
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate block">Menunggu Bayar</span>
          <div className="text-sm sm:text-base lg:text-lg font-bold text-slate-800 dark:text-slate-200 mt-1 tabular-nums">
            {pendingPayment.length} Pelanggan
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Transfer bank/COD
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate block">Stok Menipis</span>
          <div className="text-sm sm:text-base lg:text-lg font-bold text-rose-700 dark:text-rose-400 mt-1 tabular-nums">
            {lowStockProducts.length} Produk
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Di bawah safety batas
          </p>
        </div>
      </div>

      {/* Dynamic 30-Day Order Volume Trend Chart */}
      <OrderTrendChart />

      {/* Attention / Action Banner */}
      {pendingConfirmation.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Ada {pendingConfirmation.length} Pesanan Baru Menunggu Diteruskan ke Gudang!
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                Konfirmasi pesanan agar tim gudang dapat langsung mencetak label packing dan menyiapkan barang.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveNav('orders')}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shrink-0 transition-colors shadow-sm"
          >
            Buka Daftar Pesanan
          </button>
        </div>
      )}

      {/* Grid: Popular Products & Recent Store Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Highlights */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-5 shadow-sm lg:col-span-1 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Produk Terlaris di Toko</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Berdasarkan total volume penjualan</p>
            </div>
            <button
              onClick={() => setActiveNav('products')}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              Semua
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {products.slice(0, 4).map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-11 h-11 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
                <div className="flex-1 min-w-0 text-xs">
                  <p className="font-semibold text-slate-900 dark:text-white truncate">{p.name}</p>
                  <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{formatRupiah(p.price)}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">
                    <span>Terjual: <strong className="text-slate-700 dark:text-slate-300">{p.salesCount}</strong></span>
                    <span>·</span>
                    <span>Stok: <strong className={p.stock <= p.safetyStock ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}>{p.stock}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Orders Ready for Packing */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-5 shadow-sm lg:col-span-2 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Alur Pesanan Aktif</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Status langsung dari checkout pembeli</p>
            </div>
            <button
              onClick={() => setActiveNav('orders')}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              Kelola Pesanan <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 font-semibold">No. Pesanan</th>
                  <th className="py-2.5 font-semibold">Pelanggan</th>
                  <th className="py-2.5 font-semibold text-right">Total</th>
                  <th className="py-2.5 font-semibold text-center">Status</th>
                  <th className="py-2.5 font-semibold text-right">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 font-mono font-bold text-slate-900 dark:text-white">{o.orderNumber}</td>
                    <td className="py-3">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{o.customerName}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{o.city}</p>
                    </td>
                    <td className="py-3 text-right font-bold text-slate-900 dark:text-white tabular-nums">
                      {formatRupiah(o.total)}
                    </td>
                    <td className="py-3 text-center">
                      <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        o.status === 'processing' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800' :
                        o.status === 'packing' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800' :
                        o.status === 'shipped' ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}>
                        {o.status === 'processing' ? 'Perlu Diproses' :
                         o.status === 'packing' ? 'Dikemas Gudang' :
                         o.status === 'shipped' ? 'Dikirim' : o.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {o.status === 'processing' ? (
                        <button
                          onClick={() => updateOrderStatus(o.id, 'packing')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-medium shadow-xs"
                        >
                          Kirim ke Gudang →
                        </button>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 text-[11px]">Sedang di gudang</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
