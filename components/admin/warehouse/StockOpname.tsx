import React, { useState } from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { CheckCircle2, Save } from 'lucide-react';

export const StockOpname: React.FC = () => {
  const { products, adjustStock } = useAdminSuite();

  const [physicalCounts, setPhysicalCounts] = useState<{ [sku: string]: number }>(() => {
    const initial: { [sku: string]: number } = {};
    products.forEach((p) => {
      initial[p.sku] = p.stock;
    });
    return initial;
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleCountChange = (sku: string, val: number) => {
    setPhysicalCounts((prev) => ({ ...prev, [sku]: Math.max(0, val) }));
  };

  const handleSaveOpname = () => {
    products.forEach((p) => {
      const physical = physicalCounts[p.sku] !== undefined ? physicalCounts[p.sku] : p.stock;
      const diff = physical - p.stock;
      if (diff !== 0) {
        adjustStock(p.sku, diff, 'Audit Fisik');
      }
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-4 sm:space-y-5 w-full max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Stock Opname Fisik & Audit Selisih Rak
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pencocokan jumlah fisik barang di gudang dengan catatan database untuk akurasi data.
          </p>
        </div>

        <button
          onClick={handleSaveOpname}
          className="px-3.5 py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto border border-slate-800 dark:border-slate-700 min-h-[36px]"
        >
          <Save className="w-3.5 h-3.5" />
          Simpan Hasil Opname
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Hasil audit stock opname berhasil disinkronkan ke seluruh sistem!</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Kode SKU</th>
                <th className="px-4 py-3 font-semibold">Nama Barang</th>
                <th className="px-4 py-3 font-semibold">Lokasi Rak</th>
                <th className="px-4 py-3 font-semibold text-center">Stok Sistem</th>
                <th className="px-4 py-3 font-semibold text-center w-36">Hitung Fisik Aktual</th>
                <th className="px-4 py-3 font-semibold text-center">Selisih</th>
                <th className="px-4 py-3 font-semibold text-right">Status Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {products.map((p) => {
                const physical = physicalCounts[p.sku] !== undefined ? physicalCounts[p.sku] : p.stock;
                const diff = physical - p.stock;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{p.sku}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{p.name}</td>
                    <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">{p.rackLocation}</td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                      {p.stock}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        min="0"
                        value={physical}
                        onChange={(e) => handleCountChange(p.sku, Number(e.target.value))}
                        className="w-24 text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded py-1 px-2 font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-800"
                      />
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold">
                      {diff === 0 ? (
                        <span className="text-slate-400 dark:text-slate-500">0 (Klop)</span>
                      ) : diff > 0 ? (
                        <span className="text-emerald-700 dark:text-emerald-400">+{diff} (Lebih)</span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400">{diff} (Kurang)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {diff === 0 ? (
                        <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                          Akurat
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                          Perlu Verifikasi
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
