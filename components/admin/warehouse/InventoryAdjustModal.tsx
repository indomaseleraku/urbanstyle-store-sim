import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { Product, StockAdjustment } from '@/lib/admin-suite/types';

interface InventoryAdjustModalProps {
  selectedProduct: Product | null;
  onClose: () => void;
  onSubmit: (finalDiff: number, reason: StockAdjustment['reason']) => void;
  adjDiff: number;
  setAdjDiff: (n: number) => void;
  adjType: 'add' | 'subtract';
  setAdjType: (t: 'add' | 'subtract') => void;
  adjReason: StockAdjustment['reason'];
  setAdjReason: (r: StockAdjustment['reason']) => void;
}

export const InventoryAdjustModal: React.FC<InventoryAdjustModalProps> = ({
  selectedProduct,
  onClose,
  onSubmit,
  adjDiff,
  setAdjDiff,
  adjType,
  setAdjType,
  adjReason,
  setAdjReason,
}) => {
  if (!selectedProduct) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDiff = adjType === 'add' ? Number(adjDiff) : -Number(adjDiff);
    onSubmit(finalDiff, adjReason);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-lg max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col my-auto">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Penyesuaian Stok Fisik Rak</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {selectedProduct.name} ({selectedProduct.sku})
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <span className="text-slate-700 dark:text-slate-300">Stok Sistem Saat Ini:</span>
            <strong className="font-mono text-sm text-slate-900 dark:text-white">{selectedProduct.stock} unit</strong>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Aksi Penyesuaian</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdjType('add')}
                className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1 transition-colors ${
                  adjType === 'add'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Stok
              </button>
              <button
                type="button"
                onClick={() => setAdjType('subtract')}
                className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1 transition-colors ${
                  adjType === 'subtract'
                    ? 'bg-rose-700 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Minus className="w-3.5 h-3.5" /> Kurangi Stok
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Jumlah Unit (Pcs)</label>
            <input
              type="number"
              required
              min="1"
              value={adjDiff}
              onChange={(e) => setAdjDiff(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono text-sm font-bold text-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Alasan Penyesuaian (Audit Log)
            </label>
            <select
              value={adjReason}
              onChange={(e) => setAdjReason(e.target.value as StockAdjustment['reason'])}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white font-medium"
            >
              <option value="Audit Fisik">Hasil Temuan Stock Opname Fisik</option>
              <option value="Barang Rusak">Barang Rusak / Cacat Kemasan QC</option>
              <option value="Retur Pelanggan">Retur / Pengembalian dari Pembeli</option>
              <option value="Koreksi Sistem">Koreksi Salah Input Sistem</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold rounded-lg shadow-sm border border-slate-800 dark:border-slate-700"
            >
              Terapkan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
