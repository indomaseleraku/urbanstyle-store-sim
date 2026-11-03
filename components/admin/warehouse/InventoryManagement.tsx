import React, { useState } from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { Search } from 'lucide-react';
import { Product, StockAdjustment } from '@/lib/admin-suite/types';
import { InventoryTable } from './InventoryTable';
import { InventoryAdjustModal } from './InventoryAdjustModal';
import { InventoryAuditLog } from './InventoryAuditLog';

export const InventoryManagement: React.FC = () => {
  const { products, adjustStock, stockAdjustments } = useAdminSuite();

  const [search, setSearch] = useState('');
  const [selectedProductForAdj, setSelectedProductForAdj] = useState<Product | null>(null);

  // Adjustment Modal State
  const [adjDiff, setAdjDiff] = useState<number>(1);
  const [adjType, setAdjType] = useState<'add' | 'subtract'>('add');
  const [adjReason, setAdjReason] = useState<StockAdjustment['reason']>('Audit Fisik');

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.rackLocation.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const handleAdjustSubmit = (finalDiff: number, reason: StockAdjustment['reason']) => {
    if (!selectedProductForAdj) return;
    adjustStock(selectedProductForAdj.sku, finalDiff, reason);
    setSelectedProductForAdj(null);
    setAdjDiff(1);
  };

  return (
    <div className="space-y-4 sm:space-y-5 w-full max-w-full">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Inventaris Gudang & Pemetaan Lokasi Rak
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kontrol stok fisik real-time, lokasi bin rak, dan pencatatan riwayat penyesuaian stok opname.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] sm:text-xs font-mono text-slate-500 dark:text-slate-400">
            Total {products.length} SKU Terdaftar
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari SKU, nama produk, atau nomor rak..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800"
          />
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          Gudang Penyimpanan: <strong className="text-slate-800 dark:text-slate-200">Cikarang DC-1 (Utama)</strong>
        </div>
      </div>

      {/* Table */}
      <InventoryTable products={filteredProducts} onSelectProductForAdj={setSelectedProductForAdj} />

      {/* Audit Log */}
      <InventoryAuditLog stockAdjustments={stockAdjustments} />

      {/* Adjustment Modal */}
      <InventoryAdjustModal
        selectedProduct={selectedProductForAdj}
        onClose={() => setSelectedProductForAdj(null)}
        onSubmit={handleAdjustSubmit}
        adjDiff={adjDiff}
        setAdjDiff={setAdjDiff}
        adjType={adjType}
        setAdjType={setAdjType}
        adjReason={adjReason}
        setAdjReason={setAdjReason}
      />
    </div>
  );
};
