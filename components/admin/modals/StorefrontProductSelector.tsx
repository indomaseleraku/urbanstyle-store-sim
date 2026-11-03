import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { Product } from '@/lib/admin-suite/types';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';

interface StorefrontProductSelectorProps {
  products: Product[];
  currentProduct: Product;
  setSelectedProduct: (p: Product) => void;
  qty: number;
  setQty: (q: number) => void;
}

export const StorefrontProductSelector: React.FC<StorefrontProductSelectorProps> = ({
  products,
  currentProduct,
  setSelectedProduct,
  qty,
  setQty,
}) => {
  const { formatRupiah } = useAdminSuite();

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800">
        1. Pilih Produk yang Ingin Dipesan
      </h3>

      <div className="space-y-2">
        <label className="block font-semibold text-slate-700 dark:text-slate-300">Pilih dari Etalase:</label>
        <select
          value={currentProduct?.id}
          onChange={(e) => {
            const found = products.find((p) => p.id === e.target.value);
            if (found) setSelectedProduct(found);
          }}
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:bg-white dark:focus:bg-slate-800 cursor-pointer"
        >
          {products.map((p) => (
            <option key={p.id} value={p.id} className="dark:bg-slate-800 text-slate-900 dark:text-slate-100">
              {p.name} - {formatRupiah(p.price)} (Stok: {p.stock})
            </option>
          ))}
        </select>
      </div>

      {currentProduct && (
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <img
            src={currentProduct.imageUrl}
            alt={currentProduct.name}
            className="w-14 h-14 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-slate-900 dark:text-white truncate">{currentProduct.name}</p>
            <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
              {currentProduct.sku} · {currentProduct.category}
            </p>
            <p className="text-slate-900 dark:text-emerald-400 font-bold font-mono mt-0.5">
              {formatRupiah(currentProduct.price)}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
        <span className="font-semibold text-slate-700 dark:text-slate-300">Jumlah Beli (Qty):</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="w-7 h-7 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono font-bold text-sm text-slate-900 dark:text-white w-6 text-center">{qty}</span>
          <button
            type="button"
            onClick={() => setQty(Math.min(currentProduct?.stock || 10, qty + 1))}
            className="w-7 h-7 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
