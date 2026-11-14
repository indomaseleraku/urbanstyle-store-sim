import React from 'react';
import { CheckCircle2, Landmark, CreditCard, Banknote } from 'lucide-react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { computeFinanceSummary } from '@/lib/admin-suite/financeUtils';

interface FinancialCashflowAndBankProps {
  summary: ReturnType<typeof computeFinanceSummary>;
}

export const FinancialCashflowAndBank: React.FC<FinancialCashflowAndBankProps> = ({ summary }) => {
  const { formatRupiah } = useAdminSuite();
  const { realizedOrders, totalRevenue, totalOpex } = summary;

  let bcaTotal = 0;
  let mandiriTotal = 0;
  let qrisTotal = 0;
  let cardCodTotal = 0;

  for (const o of realizedOrders) {
    const pm = (o.paymentMethod || '').toLowerCase();
    const amt = Number(o.total || 0);
    if (pm.includes('bca')) bcaTotal += amt;
    else if (pm.includes('mandiri')) mandiriTotal += amt;
    else if (pm.includes('qris')) qrisTotal += amt;
    else cardCodTotal += amt;
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400">Arus Kas Masuk (Cash Inflow)</span>
          <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400 font-mono mt-1">
            +{formatRupiah(totalRevenue)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Dari {realizedOrders.length} transaksi valid pada periode terpilih
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400">Arus Kas Keluar (OPEX Aktual)</span>
          <div className="text-lg font-bold text-rose-700 dark:text-rose-400 font-mono mt-1">
            -{formatRupiah(totalOpex)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Beban operasional tercatat pada periode terpilih
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400">Selisih Kas Operasional</span>
          <div className="text-lg font-bold text-slate-900 dark:text-white font-mono mt-1">
            {formatRupiah(totalRevenue - totalOpex)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Cash-in dikurangi OPEX (sebelum HPP &amp; pajak)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
              BCA
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Bank BCA</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Transfer Bank BCA</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">{formatRupiah(bcaTotal)}</div>
            <div className="flex items-center gap-1 mt-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Rekonsiliasi live DB</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-xs">
              MDR
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Bank Mandiri</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Transfer Bank Mandiri</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">{formatRupiah(mandiriTotal)}</div>
            <div className="flex items-center gap-1 mt-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Rekonsiliasi live DB</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
              QRIS
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">QRIS Instant</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Settlement QRIS</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">{formatRupiah(qrisTotal)}</div>
            <div className="flex items-center gap-1 mt-1.5 text-[11px] text-blue-700 dark:text-blue-400 font-medium">
              <Landmark className="w-3.5 h-3.5" />
              <span>Webhook QRIS Realtime</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Kartu Kredit &amp; COD</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Terpisah dari QRIS</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">{formatRupiah(cardCodTotal)}</div>
            <div className="flex items-center gap-1 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <Banknote className="w-3.5 h-3.5" />
              <span>Pembayaran Non-Transfer/QRIS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
