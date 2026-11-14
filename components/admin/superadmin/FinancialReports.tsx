import React, { useState } from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { computeFinanceSummary, FinancePeriod } from '@/lib/admin-suite/financeUtils';
import { DollarSign, TrendingUp, PieChart } from 'lucide-react';
import { FinancialPnlCards } from './FinancialPnlCards';
import { FinancialPnlStatement } from './FinancialPnlStatement';
import { FinancialCashflowAndBank } from './FinancialCashflowAndBank';
import { FinancialExpensesTable } from './FinancialExpensesTable';

export const FinancialReports: React.FC = () => {
  const { orders, expenses, storeSettings } = useAdminSuite();

  const [period, setPeriod] = useState<FinancePeriod>('ytd');
  const [activeTab, setActiveTab] = useState<'pnl' | 'cashflow' | 'expenses'>('pnl');

  const ppnRate = storeSettings?.ppnRate ?? 11;
  const summary = computeFinanceSummary(orders, expenses, period, ppnRate);

  return (
    <div className="space-y-4 sm:space-y-5 w-full max-w-full">
      <FinancialPnlCards
        period={period}
        setPeriod={setPeriod}
        totalRevenue={summary.totalRevenue}
        grossProfit={summary.grossProfit}
        grossMargin={summary.grossMargin}
        totalOpex={summary.totalOpex}
        netProfit={summary.netProfit}
        netMargin={summary.netMargin}
      />

      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 text-xs font-medium overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('pnl')}
          className={`pb-2.5 px-1 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'pnl'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-bold'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <PieChart className="w-3.5 h-3.5" />
          Laba Rugi (Income Statement)
        </button>
        <button
          onClick={() => setActiveTab('cashflow')}
          className={`pb-2.5 px-1 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'cashflow'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-bold'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Arus Kas &amp; Rekonsiliasi Bank
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`pb-2.5 px-1 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'expenses'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-bold'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          Buku Biaya Operasional ({summary.periodExpenses.length})
        </button>
      </div>

      {activeTab === 'pnl' && <FinancialPnlStatement summary={summary} ppnRate={ppnRate} />}
      {activeTab === 'cashflow' && <FinancialCashflowAndBank summary={summary} />}
      {activeTab === 'expenses' && <FinancialExpensesTable expenses={summary.periodExpenses} />}
    </div>
  );
};
