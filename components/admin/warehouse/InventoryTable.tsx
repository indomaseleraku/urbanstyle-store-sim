import React from 'react';
import { MapPin } from 'lucide-react';
import { Product } from '@/lib/admin-suite/types';

interface InventoryTableProps {
  products: Product[];
  onSelectProductForAdj: (product: Product) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({ products, onSelectProductForAdj }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
      {/* Mobile View: Cards */}
      <div className="block sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
        {products.map((p) => {
          const isCritical = p.stock <= p.safetyStock;
          return (
            <div key={p.id} className="p-3.5 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white text-xs truncate">{p.name}</p>
                    <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">{p.sku}</p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${
                    isCritical
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  }`}
                >
                  {isCritical ? 'Kritis' : 'Aman'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] border border-slate-200 dark:border-slate-700">
                    <MapPin className="w-2.5 h-2.5 text-slate-400" />
                    {p.rackLocation}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Stok:{' '}
                    <strong
                      className={`font-mono ${
                        isCritical ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {p.stock}
                    </strong>{' '}
                    (Min: {p.safetyStock})
                  </span>
                </div>

                <button
                  onClick={() => onSelectProductForAdj(p)}
                  className="px-2.5 py-1 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded font-medium text-[11px] shadow-xs border border-slate-800 dark:border-slate-700"
                >
                  Koreksi (±)
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Kode SKU</th>
              <th className="px-4 py-3 font-semibold">Nama Barang</th>
              <th className="px-4 py-3 font-semibold">Lokasi Rak / Bin</th>
              <th className="px-4 py-3 font-semibold text-center">Stok Fisik</th>
              <th className="px-4 py-3 font-semibold text-center">Safety Stock</th>
              <th className="px-4 py-3 font-semibold text-center">Status Rak</th>
              <th className="px-4 py-3 font-semibold text-right">Penyesuaian Cepat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {products.map((p) => {
              const isCritical = p.stock <= p.safetyStock;
              return (
                <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{p.sku}</td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-8 h-8 rounded object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{p.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{p.category}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded w-max border border-slate-200 dark:border-slate-700">
                      <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      {p.rackLocation}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span
                      className={`font-mono font-bold text-sm tabular-nums ${
                        isCritical ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {p.stock}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">unit</span>
                  </td>

                  <td className="px-4 py-3 text-center font-mono text-slate-600 dark:text-slate-300 tabular-nums">
                    {p.safetyStock} unit
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        isCritical
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                          : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      }`}
                    >
                      {isCritical ? 'Stok Kritis' : 'Stok Aman'}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onSelectProductForAdj(p)}
                      className="px-2.5 py-1 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded font-medium text-[11px] shadow-xs border border-slate-800 dark:border-slate-700"
                    >
                      Koreksi Stok (±)
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
