'use client';

import React from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { computeFinanceSummary } from '@/lib/admin-suite/financeUtils';
import { DollarSign, ShoppingBag, Users, AlertTriangle } from 'lucide-react';

export const SuperadminKpiStrip: React.FC = () => {
  const { orders, employees, products, expenses, storeSettings, formatRupiah } = useAdminSuite();

  const summary = computeFinanceSummary(orders, expenses, 'ytd', storeSettings?.ppnRate ?? 11);
  const lowStockCount = products.filter((p) => p.stock <= p.safetyStock).length;
  const activeEmployees = employees.filter((e) => e.status === 'active').length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-[11px] sm:text-xs font-medium truncate">Net Revenue (YTD)</span>
          <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        </div>
        <div className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 dark:text-white mt-1.5 tabular-nums truncate">
          {formatRupiah(summary.totalRevenue)}
        </div>
        <p className="text-[10px] sm:text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-0.5 truncate">
          Laba bersih est.: {formatRupiah(summary.netProfit)}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-[11px] sm:text-xs font-medium truncate">Transaksi Terkonfirmasi</span>
          <ShoppingBag className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
        </div>
        <div className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 dark:text-white mt-1.5 tabular-nums">
          {summary.realizedOrders.length} Pesanan
        </div>
        <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
          Margin kotor: {summary.grossMargin}% · PPN {storeSettings?.ppnRate ?? 11}%
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-[11px] sm:text-xs font-medium truncate">SDM & Staf Aktif</span>
          <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
        </div>
        <div className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 dark:text-white mt-1.5 tabular-nums">
          {activeEmployees} / {employees.length} Staf
        </div>
        <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
          OPEX tercatat: {formatRupiah(summary.totalOpex)}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-[11px] sm:text-xs font-medium truncate">Peringatan Stok</span>
          <AlertTriangle className={`w-4 h-4 shrink-0 ${lowStockCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`} />
        </div>
        <div className={`text-sm sm:text-base lg:text-lg font-bold mt-1.5 tabular-nums ${lowStockCount > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
          {lowStockCount} SKU Kritis
        </div>
        <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
          Dari {products.length} total katalog SKU
        </p>
      </div>
    </div>
  );
};
