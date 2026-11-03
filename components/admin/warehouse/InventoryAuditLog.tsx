import React from 'react';
import { History } from 'lucide-react';
import { StockAdjustment } from '@/lib/admin-suite/types';

interface InventoryAuditLogProps {
  stockAdjustments: StockAdjustment[];
}

export const InventoryAuditLog: React.FC<InventoryAuditLogProps> = ({ stockAdjustments }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm p-4 space-y-3 transition-colors">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Riwayat Mutasi & Koreksi Stok Terakhir
          </h2>
        </div>
        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">Tervalidasi Supervisor</span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
        {stockAdjustments.map((adj) => (
          <div key={adj.id} className="py-2.5 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                {adj.productName} <span className="font-mono text-slate-500 dark:text-slate-400">({adj.sku})</span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Alasan: <strong className="text-slate-700 dark:text-slate-300">{adj.reason}</strong> · Oleh{' '}
                {adj.adjustedBy}
              </p>
            </div>
            <div className="text-right">
              <span
                className={`font-mono font-bold ${
                  adj.diff > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                }`}
              >
                {adj.diff > 0 ? `+${adj.diff}` : adj.diff} unit
              </span>
              <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-mono">{adj.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
