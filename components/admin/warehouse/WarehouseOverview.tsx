import React from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import {
  Truck,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { StockTrendChart } from './StockTrendChart';

export const WarehouseOverview: React.FC = () => {
  const { products, orders, inboundShipments, setActiveNav, setSelectedPackingOrder } = useAdminSuite();

  const lowStock = products.filter((p) => p.stock <= p.safetyStock);
  const packingQueue = orders.filter((o) => o.status === 'packing');
  const pendingInbound = inboundShipments.filter((s) => s.status === 'pending' || s.status === 'in_qc');
  const totalUnitsInStorage = products.reduce((acc, curr) => acc + curr.stock, 0);

  return (
    <div className="space-y-4 sm:space-y-5 w-full max-w-full">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Pusat Logistik & Pergudangan (Admin Gudang)
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Gudang Pusat Cikarang DC-1 · Pemantauan stok fisik rak, picking-packing pesanan, dan penerimaan PO supplier.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveNav('outbound')}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors min-h-[36px]"
          >
            <Truck className="w-3.5 h-3.5" />
            Antrean Packing ({packingQueue.length})
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate block">Total Unit di Rak</span>
          <div className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 dark:text-white mt-1 tabular-nums truncate">
            {totalUnitsInStorage} Pcs
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {products.length} SKU aktif
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate block">Antrean Packing</span>
          <div className="text-sm sm:text-base lg:text-lg font-bold text-blue-700 dark:text-blue-400 mt-1 tabular-nums">
            {packingQueue.length} Pesanan
          </div>
          <p className="text-[10px] sm:text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-0.5">
            Siap tempel resi
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate block">Stok Kritis</span>
          <div className="text-sm sm:text-base lg:text-lg font-bold text-rose-700 dark:text-rose-400 mt-1 tabular-nums">
            {lowStock.length} SKU
          </div>
          <p className="text-[10px] sm:text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-0.5">
            Di bawah safety batas
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate block">Jadwal PO Masuk</span>
          <div className="text-sm sm:text-base lg:text-lg font-bold text-slate-800 dark:text-slate-200 mt-1 tabular-nums">
            {pendingInbound.length} PO
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Menunggu QC
          </p>
        </div>
      </div>

      {/* Dynamic 30-Day Stock Fluctuation Trend Chart */}
      <StockTrendChart />

      {/* Low Stock Urgent Callout */}
      {lowStock.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-rose-900 dark:text-rose-200">
                Peringatan Stok Rendah: {lowStock.map((p) => `${p.name} (Sisa ${p.stock})`).join(', ')}
              </p>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                Segera ajukan Purchase Order (PO) tambahan ke supplier untuk menghindari kekosongan etalase toko.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveNav('inventory')}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shrink-0 transition-colors shadow-sm"
          >
            Sesuaikan Stok Fisik
          </button>
        </div>
      )}

      {/* Grid: Ready to pack queue & Inbound schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outbound queue */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Antrean Packing Pesanan (Outbound)</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pesanan dari admin toko yang harus dikemas & ditempel label</p>
            </div>
            <button
              onClick={() => setActiveNav('outbound')}
              className="text-xs font-semibold text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {packingQueue.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              Semua antrean packing saat ini telah selesai diproses!
            </div>
          ) : (
            <div className="space-y-3">
              {packingQueue.map((o) => (
                <div
                  key={o.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{o.orderNumber}</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">· {o.customerName}</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                      Kurir: <strong>{o.courier}</strong> ({o.city})
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 font-mono text-[11px] mt-0.5">
                      {o.items.map((i) => `${i.quantity}x ${i.sku}`).join(', ')}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedPackingOrder(o)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-xs shadow-xs"
                  >
                    Cetak Label & Resi
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inbound PO schedule */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Penerimaan Barang Supplier (Inbound)</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Jadwal pengiriman dari pabrik & supplier mitra</p>
            </div>
            <button
              onClick={() => setActiveNav('inbound')}
              className="text-xs font-semibold text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Daftar PO <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {inboundShipments.map((s) => (
              <div
                key={s.id}
                className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{s.poNumber}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        s.status === 'received'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                          : s.status === 'in_qc'
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {s.status === 'received'
                        ? 'Sudah Diterima'
                        : s.status === 'in_qc'
                        ? 'Proses QC'
                        : 'Menunggu Tiba'}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1">{s.supplierName}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">{s.itemsSummary}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{s.totalUnits} pcs</span>
                  <span className="block text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{s.expectedDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
