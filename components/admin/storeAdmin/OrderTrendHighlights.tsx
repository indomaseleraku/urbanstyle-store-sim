import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';

interface OrderTrendHighlightsProps {
  total30dOrders: number;
  avgDailyOrders: number;
  peakDay: { orders: number; date: string };
  total30dRevenue: number;
}

export const OrderTrendHighlights: React.FC<OrderTrendHighlightsProps> = ({
  total30dOrders,
  avgDailyOrders,
  peakDay,
  total30dRevenue,
}) => {
  const { formatRupiah } = useAdminSuite();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
      <div className="p-2 sm:p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
        <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 block truncate">Total 30 Hari</span>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {total30dOrders}
          </span>
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
            <ArrowUpRight className="w-3 h-3 inline" /> +19%
          </span>
        </div>
      </div>

      <div className="p-2 sm:p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
        <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 block truncate">Rata-rata Harian</span>
        <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-0.5">
          {avgDailyOrders} <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">order/hari</span>
        </div>
      </div>

      <div className="p-2 sm:p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
        <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 block truncate">Puncak Tertinggi</span>
        <div className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums mt-0.5">
          {peakDay.orders} <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">({peakDay.date})</span>
        </div>
      </div>

      <div className="p-2 sm:p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
        <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 block truncate">Akumulasi Omset</span>
        <div
          className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono tabular-nums mt-0.5 truncate"
          title={formatRupiah(total30dRevenue)}
        >
          {formatRupiah(total30dRevenue)}
        </div>
      </div>
    </div>
  );
};
