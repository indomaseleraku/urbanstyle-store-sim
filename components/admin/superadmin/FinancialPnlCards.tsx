import React from 'react';
import { Download } from 'lucide-react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';

interface FinancialPnlCardsProps {
  period: 'current_month' | 'q3' | 'ytd';
  setPeriod: (p: 'current_month' | 'q3' | 'ytd') => void;
  totalRevenue: number;
  grossProfit: number;
  grossMargin: string;
  totalOpex: number;
  netProfit: number;
  netMargin: string;
}

export const FinancialPnlCards: React.FC<FinancialPnlCardsProps> = ({
  period,
  setPeriod,
  totalRevenue,
  grossProfit,
  grossMargin,
  totalOpex,
  netProfit,
  netMargin,
}) => {
  const { formatRupiah, setIsFinanceExportOpen } = useAdminSuite();

  return (
    <div className="space-y-4">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Laporan Keuangan & Akuntansi Bisnis
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Laporan laba rugi komprehensif (P&L), arus kas operasional, rekonsiliasi perbankan, dan beban usaha.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period Selector Segmented control */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 sm:p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setPeriod('current_month')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                period === 'current_month'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Oktober 2026
            </button>
            <button
              onClick={() => setPeriod('q3')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                period === 'q3'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Q3
            </button>
            <button
              onClick={() => setPeriod('ytd')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                period === 'ytd'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              YTD
            </button>
          </div>

          <button
            onClick={() => setIsFinanceExportOpen(true)}
            className="px-3 py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors border border-slate-800 dark:border-slate-700 min-h-[36px]"
          >
            <Download className="w-3.5 h-3.5" />
            Export Dokumen
          </button>
        </div>
      </div>

      {/* Financial Executive Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate block">Net Revenue</span>
          <div className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 dark:text-white mt-1 tabular-nums truncate">
            {formatRupiah(totalRevenue)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
            +22.4% MoM
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate block">Laba Kotor</span>
          <div className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 dark:text-white mt-1 tabular-nums truncate">
            {formatRupiah(grossProfit)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Margin: <strong className="text-slate-800 dark:text-slate-200 font-mono">{grossMargin}%</strong>
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate block">Beban Operasional</span>
          <div className="text-sm sm:text-base lg:text-lg font-bold text-rose-700 dark:text-rose-400 mt-1 tabular-nums truncate">
            {formatRupiah(totalOpex)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            Gaji & operasional
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate block">Laba Bersih Akhir</span>
          <div className="text-sm sm:text-base lg:text-lg font-bold text-emerald-800 dark:text-emerald-300 mt-1 tabular-nums truncate">
            {formatRupiah(netProfit)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Margin: <strong className="text-emerald-700 dark:text-emerald-400 font-mono">{netMargin}%</strong>
          </p>
        </div>
      </div>
    </div>
  );
};
