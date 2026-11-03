import React, { useState } from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { FinancialPnlCards } from './FinancialPnlCards';
import { FinancialPnlStatement } from './FinancialPnlStatement';
import { FinancialCashflowAndBank } from './FinancialCashflowAndBank';
import { FinancialExpensesTable } from './FinancialExpensesTable';

export const FinancialReports: React.FC = () => {
  const { orders, expenses } = useAdminSuite();

  const [activeTab, setActiveTab] = useState<'pnl' | 'cashflow' | 'reconciliation' | 'expenses'>('pnl');
  const [period, setPeriod] = useState<'current_month' | 'q3' | 'ytd'>('current_month');

  // Scaled calculations based on period
  const periodMultiplier = period === 'current_month' ? 1 : period === 'q3' ? 3 : 10;

  const baseRevenue = orders.reduce((acc, curr) => acc + curr.total, 0) + 124500000;
  const totalRevenue = baseRevenue * (periodMultiplier * 0.75);

  const cogsRate = 0.42; // 42% cost of goods sold
  const totalCogs = Math.round(totalRevenue * cogsRate);
  const grossProfit = totalRevenue - totalCogs;
  const grossMargin = ((grossProfit / totalRevenue) * 100).toFixed(1);

  const totalOpex = expenses.reduce((acc, curr) => acc + curr.amount, 0) * periodMultiplier;
  const operatingProfit = grossProfit - totalOpex;
  const taxRate = 0.11; // PPN & PPh corporate estimate
  const estimatedTax = Math.max(0, Math.round(operatingProfit * taxRate));
  const netProfit = operatingProfit - estimatedTax;
  const netMargin = ((netProfit / totalRevenue) * 100).toFixed(1);

  return (
    <div className="space-y-4 sm:space-y-5 w-full max-w-full">
      {/* KPI Cards & Period Selector */}
      <FinancialPnlCards
        period={period}
        setPeriod={setPeriod}
        totalRevenue={totalRevenue}
        grossProfit={grossProfit}
        grossMargin={grossMargin}
        totalOpex={totalOpex}
        netProfit={netProfit}
        netMargin={netMargin}
      />

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-6 text-xs font-semibold overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('pnl')}
            className={`pb-3 transition-colors relative whitespace-nowrap ${
              activeTab === 'pnl'
                ? 'text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Laba Rugi (P&L Income Statement)
          </button>
          <button
            onClick={() => setActiveTab('cashflow')}
            className={`pb-3 transition-colors relative whitespace-nowrap ${
              activeTab === 'cashflow'
                ? 'text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Laporan Arus Kas (Cash Flow)
          </button>
          <button
            onClick={() => setActiveTab('reconciliation')}
            className={`pb-3 transition-colors relative whitespace-nowrap ${
              activeTab === 'reconciliation'
                ? 'text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Rekonsiliasi Bank & Gateway
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`pb-3 transition-colors relative whitespace-nowrap ${
              activeTab === 'expenses'
                ? 'text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Rincian Beban Operasional ({expenses.length})
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'pnl' && (
        <FinancialPnlStatement
          totalRevenue={totalRevenue}
          totalCogs={totalCogs}
          grossProfit={grossProfit}
          grossMargin={grossMargin}
          totalOpex={totalOpex}
          operatingProfit={operatingProfit}
          estimatedTax={estimatedTax}
          netProfit={netProfit}
          netMargin={netMargin}
          periodMultiplier={periodMultiplier}
        />
      )}

      {(activeTab === 'cashflow' || activeTab === 'reconciliation') && (
        <FinancialCashflowAndBank
          activeTab={activeTab}
          totalRevenue={totalRevenue}
          totalCogs={totalCogs}
          totalOpex={totalOpex}
        />
      )}

      {activeTab === 'expenses' && <FinancialExpensesTable />}
    </div>
  );
};
