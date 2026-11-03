import React from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';

interface FinancialPnlStatementProps {
  totalRevenue: number;
  totalCogs: number;
  grossProfit: number;
  grossMargin: string;
  totalOpex: number;
  operatingProfit: number;
  estimatedTax: number;
  netProfit: number;
  netMargin: string;
  periodMultiplier: number;
}

export const FinancialPnlStatement: React.FC<FinancialPnlStatementProps> = ({
  totalRevenue,
  totalCogs,
  grossProfit,
  grossMargin,
  totalOpex,
  operatingProfit,
  estimatedTax,
  netProfit,
  netMargin,
  periodMultiplier,
}) => {
  const { formatRupiah } = useAdminSuite();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
      <div className="p-4 bg-slate-50/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Laporan Laba Rugi Komprehensif (Income Statement)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Satuan: Rupiah (IDR) · Berdasarkan standar akuntansi PSAK
          </p>
        </div>
        <span className="text-xs font-mono text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700">
          Periode: 14 Okt 2026
        </span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
        {/* Section: Revenue */}
        <div className="p-4 bg-slate-50/30 dark:bg-slate-800/20">
          <div className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-2">
            1. Pendapatan Penjualan (Revenue)
          </div>
          <div className="space-y-1.5 pl-4">
            <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
              <span>Penjualan Toko Online Resmi (Direct Website)</span>
              <span className="tabular-nums font-mono">{formatRupiah(totalRevenue * 0.46)}</span>
            </div>
            <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
              <span>Penjualan Marketplace (Shopee, Tokopedia, TikTok Shop)</span>
              <span className="tabular-nums font-mono">{formatRupiah(totalRevenue * 0.54)}</span>
            </div>
            <div className="flex justify-between py-1.5 text-slate-900 dark:text-white font-bold border-t border-slate-200 dark:border-slate-800">
              <span>Total Pendapatan Bersih</span>
              <span className="tabular-nums font-mono">{formatRupiah(totalRevenue)}</span>
            </div>
          </div>
        </div>

        {/* Section: COGS */}
        <div className="p-4">
          <div className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-2">
            2. Harga Pokok Penjualan (COGS / HPP)
          </div>
          <div className="space-y-1.5 pl-4">
            <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
              <span>Biaya Bahan Baku & Produksi Apparel UrbanStyle</span>
              <span className="tabular-nums font-mono text-rose-700 dark:text-rose-400">({formatRupiah(totalCogs * 0.75)})</span>
            </div>
            <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
              <span>Packaging & Dus Hardbox Eksklusif</span>
              <span className="tabular-nums font-mono text-rose-700 dark:text-rose-400">({formatRupiah(totalCogs * 0.25)})</span>
            </div>
            <div className="flex justify-between py-1.5 text-slate-900 dark:text-white font-bold border-t border-slate-200 dark:border-slate-800">
              <span>Total Harga Pokok Penjualan (COGS)</span>
              <span className="tabular-nums font-mono text-rose-700 dark:text-rose-400">({formatRupiah(totalCogs)})</span>
            </div>
          </div>
        </div>

        {/* Gross Profit */}
        <div className="p-4 bg-slate-100/50 dark:bg-slate-800/50 flex justify-between font-bold text-slate-900 dark:text-white text-sm">
          <span>Laba Kotor (Gross Profit)</span>
          <div className="text-right">
            <span className="tabular-nums font-mono">{formatRupiah(grossProfit)}</span>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-normal">Margin: {grossMargin}%</span>
          </div>
        </div>

        {/* Section: Operating Expenses */}
        <div className="p-4">
          <div className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-2">
            3. Beban Operasional (Operating Expenses / OPEX)
          </div>
          <div className="space-y-1.5 pl-4">
            <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
              <span>Gaji Karyawan & Tunjangan Operasional Staf</span>
              <span className="tabular-nums font-mono text-rose-700 dark:text-rose-400">({formatRupiah(68500000 * periodMultiplier)})</span>
            </div>
            <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
              <span>Sewa Gudang DC Cikarang & Utilitas Listrik</span>
              <span className="tabular-nums font-mono text-rose-700 dark:text-rose-400">({formatRupiah(14200000 * periodMultiplier)})</span>
            </div>
            <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
              <span>Biaya Logistik & Subsidi Ekspedisi</span>
              <span className="tabular-nums font-mono text-rose-700 dark:text-rose-400">({formatRupiah(6800000 * periodMultiplier)})</span>
            </div>
            <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
              <span>Pemasaran, Iklan Meta Ads & Influencer Kolaborasi</span>
              <span className="tabular-nums font-mono text-rose-700 dark:text-rose-400">({formatRupiah(12500000 * periodMultiplier)})</span>
            </div>
            <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
              <span>Infrastruktur Cloud, Server & POS Software</span>
              <span className="tabular-nums font-mono text-rose-700 dark:text-rose-400">({formatRupiah(3200000 * periodMultiplier)})</span>
            </div>
            <div className="flex justify-between py-1.5 text-slate-900 dark:text-white font-bold border-t border-slate-200 dark:border-slate-800">
              <span>Total Beban Operasional</span>
              <span className="tabular-nums font-mono text-rose-700 dark:text-rose-400">({formatRupiah(totalOpex)})</span>
            </div>
          </div>
        </div>

        {/* Section: Operating Profit */}
        <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between font-bold text-slate-900 dark:text-white">
          <span>Laba Operasional (EBITDA)</span>
          <span className="tabular-nums font-mono">{formatRupiah(operatingProfit)}</span>
        </div>

        {/* Section: Tax */}
        <div className="p-4">
          <div className="flex justify-between text-slate-600 dark:text-slate-300 pl-4">
            <span>Pajak Penghasilan Badan & PPN 11% (Estimasi Terutang)</span>
            <span className="tabular-nums font-mono text-rose-700 dark:text-rose-400">({formatRupiah(estimatedTax)})</span>
          </div>
        </div>

        {/* Bottom Line: Net Profit */}
        <div className="p-5 bg-emerald-50/40 dark:bg-emerald-950/30 border-t-2 border-emerald-600 dark:border-emerald-500 flex justify-between items-center text-sm">
          <div>
            <span className="font-extrabold text-slate-900 dark:text-white">LABA BERSIH SETELAH PAJAK (NET PROFIT)</span>
            <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">Dialokasikan ke modal ditahan (retained earnings)</span>
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
