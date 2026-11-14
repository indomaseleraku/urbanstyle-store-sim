import React from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { computeFinanceSummary, STANDARD_COGS_RATIO } from '@/lib/admin-suite/financeUtils';

const EXPENSE_CATEGORIES = [
  'Gaji Karyawan',
  'Sewa Gudang & Listrik',
  'Biaya Pengiriman/Logistik',
  'Pemasaran & Iklan',
  'Server & Software',
  'Lain-lain',
] as const;

interface FinancialPnlStatementProps {
  summary: ReturnType<typeof computeFinanceSummary>;
  ppnRate: number;
}

export const FinancialPnlStatement: React.FC<FinancialPnlStatementProps> = ({ summary, ppnRate }) => {
  const { formatRupiah } = useAdminSuite();
  const {
    realizedOrders,
    periodExpenses,
    totalRevenue,
    totalCogs,
    grossProfit,
    grossMargin,
    totalOpex,
    operatingProfit,
    estimatedTax,
    netProfit,
    netMargin,
  } = summary;

  const grossShipping = realizedOrders.reduce((acc, o) => acc + Number(o.shippingCost || 0), 0);
  const totalDiscount = realizedOrders.reduce((acc, o) => acc + Number(o.discount || 0), 0);
  const grossSales = realizedOrders.reduce((acc, o) => acc + Number(o.subtotal || 0), 0);
  const hppFabric = Math.round(totalCogs * 0.75);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
      <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Laporan Laba Rugi (P&amp;L Statement)</h2>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          {realizedOrders.length} Transaksi Terverifikasi · HPP {Math.round(STANDARD_COGS_RATIO * 100)}%
        </span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
        <div className="p-4 space-y-2">
          <div className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-1">
            1. Pendapatan Usaha (Operating Revenue)
          </div>
          <div className="space-y-1.5 pl-4">
            <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
              <span>Penjualan Kotor Produk (Subtotal)</span>
              <span className="tabular-nums font-mono">{formatRupiah(grossSales)}</span>
            </div>
            <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
              <span>Pendapatan Ongkos Kirim</span>
              <span className="tabular-nums font-mono">{formatRupiah(grossShipping)}</span>
            </div>
            <div className="flex justify-between py-1 text-rose-700 dark:text-rose-400">
              <span>Potongan Diskon &amp; Promo Voucher</span>
              <span className="tabular-nums font-mono">({formatRupiah(totalDiscount)})</span>
            </div>
            <div className="flex justify-between py-1.5 text-slate-900 dark:text-white font-bold border-t border-slate-200 dark:border-slate-800">
              <span>Total Pendapatan Bersih (Net Revenue)</span>
              <span className="tabular-nums font-mono">{formatRupiah(totalRevenue)}</span>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-2">
          <div className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-1">
            2. Harga Pokok Penjualan (COGS — {Math.round(STANDARD_COGS_RATIO * 100)}%)
          </div>
          <div className="space-y-1.5 pl-4">
            <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
              <span>Estimasi Biaya Produksi &amp; Bahan Baku</span>
              <span className="tabular-nums font-mono text-rose-700 dark:text-rose-400">({formatRupiah(hppFabric)})</span>
            </div>
            <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
              <span>Estimasi Kemasan &amp; Logistik Inbound</span>
              <span className="tabular-nums font-mono text-rose-700 dark:text-rose-400">({formatRupiah(totalCogs - hppFabric)})</span>
            </div>
            <div className="flex justify-between py-1.5 text-slate-900 dark:text-white font-bold border-t border-slate-200 dark:border-slate-800">
              <span>Total Harga Pokok Penjualan (COGS)</span>
              <span className="tabular-nums font-mono text-rose-700 dark:text-rose-400">({formatRupiah(totalCogs)})</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-100/50 dark:bg-slate-800/50 flex justify-between font-bold text-slate-900 dark:text-white text-sm">
          <span>Laba Kotor (Gross Profit)</span>
          <div className="text-right">
            <span className="tabular-nums font-mono">{formatRupiah(grossProfit)}</span>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-normal">Margin: {grossMargin}%</span>
          </div>
        </div>

        <div className="p-4">
          <div className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-2">
            3. Beban Operasional (Operating Expenses / OPEX Aktual)
          </div>
          <div className="space-y-1.5 pl-4">
            {EXPENSE_CATEGORIES.map((cat) => {
              const catSum = periodExpenses
                .filter((e) => e.category === cat)
                .reduce((acc, e) => acc + Number(e.amount || 0), 0);
              return (
                <div key={cat} className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                  <span>{cat}</span>
                  <span className="tabular-nums font-mono text-rose-700 dark:text-rose-400">({formatRupiah(catSum)})</span>
                </div>
              );
            })}
            <div className="flex justify-between py-1.5 text-slate-900 dark:text-white font-bold border-t border-slate-200 dark:border-slate-800">
              <span>Total Beban Operasional</span>
              <span className="tabular-nums font-mono text-rose-700 dark:text-rose-400">({formatRupiah(totalOpex)})</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between font-bold text-slate-900 dark:text-white">
          <span>Laba Operasional (EBITDA)</span>
          <span className="tabular-nums font-mono">{formatRupiah(operatingProfit)}</span>
        </div>

        <div className="p-4">
          <div className="flex justify-between text-slate-600 dark:text-slate-300 pl-4">
            <span>Estimasi PPN &amp; Pajak {ppnRate}% (Dari EBITDA Positif)</span>
            <span className="tabular-nums font-mono text-rose-700 dark:text-rose-400">({formatRupiah(estimatedTax)})</span>
          </div>
        </div>

        <div className="p-5 bg-emerald-50/40 dark:bg-emerald-950/30 border-t-2 border-emerald-600 dark:border-emerald-500 flex justify-between items-center text-sm">
          <div>
            <span className="font-extrabold text-slate-900 dark:text-white">LABA BERSIH SETELAH PAJAK (NET PROFIT)</span>
            <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">Rekapitulasi transaksi &amp; biaya tercatat di database</span>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-emerald-800 dark:text-emerald-300 tabular-nums font-mono">
              {formatRupiah(netProfit)}
            </span>
            <span className="block text-xs font-semibold text-emerald-700 dark:text-emerald-400">Net Margin: {netMargin}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
