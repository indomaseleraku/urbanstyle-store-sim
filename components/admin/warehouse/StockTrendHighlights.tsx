import React from 'react';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface StockTrendHighlightsProps {
  totalInbound30d: number;
  totalOutbound30d: number;
  avgOutboundDaily: number;
  minStock: number;
  maxStock: number;
}

export const StockTrendHighlights: React.FC<StockTrendHighlightsProps> = ({
  totalInbound30d,
  totalOutbound30d,
  avgOutboundDaily,
  minStock,
  maxStock,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
      <div className="p-2 sm:p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
        <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 block truncate">Total Inbound 30 Hari</span>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
            +{totalInbound30d}
          </span>
          <span className="text-[10px] text-slate-400">pcs</span>
        </div>
      </div>

      <div className="p-2 sm:p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
        <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 block truncate">Total Outbound Kirim</span>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 font-mono tabular-nums">
            -{totalOutbound30d}
          </span>
          <span className="text-[10px] text-slate-400">pcs</span>
        </div>
      </div>

      <div className="p-2 sm:p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
        <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 block truncate">Rata-rata Keluar/Hari</span>
        <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-0.5">
          {avgOutboundDaily} <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">pcs/hari</span>
        </div>
      </div>

      <div className="p-2 sm:p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
        <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 block truncate">Rentang Stok Fisik</span>
        <div className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 font-mono tabular-nums mt-0.5">
          {minStock} - {maxStock} <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">pcs</span>
        </div>
      </div>
    </div>
  );
};
