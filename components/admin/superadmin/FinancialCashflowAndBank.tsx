import React from 'react';
import { CheckCircle2, Landmark } from 'lucide-react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';

interface FinancialCashflowAndBankProps {
  activeTab: 'cashflow' | 'reconciliation';
  totalRevenue: number;
  totalCogs: number;
  totalOpex: number;
}

export const FinancialCashflowAndBank: React.FC<FinancialCashflowAndBankProps> = ({
  activeTab,
  totalRevenue,
  totalCogs,
  totalOpex,
}) => {
  const { formatRupiah } = useAdminSuite();

  if (activeTab === 'cashflow') {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-6 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Laporan Arus Kas (Cash Flow Statement)</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pencatatan kas masuk dan kas keluar aktual</p>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Metode Langsung</span>
        </div>

        <div className="space-y-4 text-xs">
          {/* Cash flow from Operations */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-slate-50/50 dark:bg-slate-800/40">
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Arus Kas dari Aktivitas Operasional</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Penerimaan Kas dari Penjualan Pelanggan</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-mono font-medium">+{formatRupiah(totalRevenue * 0.98)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Pembayaran Kas ke Pemasok Bahan Baku</span>
                <span className="text-rose-700 dark:text-rose-400 font-mono font-medium">-{formatRupiah(totalCogs * 0.92)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Pembayaran Gaji dan Beban Operasional</span>
                <span className="text-rose-700 dark:text-rose-400 font-mono font-medium">-{formatRupiah(totalOpex)}</span>
              </div>
              <div className="flex justify-between text-slate-900 dark:text-white font-bold border-t border-slate-200 dark:border-slate-700 pt-2">
                <span>Arus Kas Bersih dari Operasional</span>
                <span className="text-emerald-800 dark:text-emerald-300 font-mono">+{formatRupiah(totalRevenue * 0.98 - totalCogs * 0.92 - totalOpex)}</span>
              </div>
            </div>
          </div>

          {/* Cash flow from Investments */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-slate-50/50 dark:bg-slate-800/40">
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Arus Kas dari Aktivitas Investasi</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Pengadaan Rak Heavy Duty & Scanner Barcode Gudang</span>
                <span className="text-rose-700 dark:text-rose-400 font-mono font-medium">-{formatRupiah(8500000)}</span>
              </div>
              <div className="flex justify-between text-slate-900 dark:text-white font-bold border-t border-slate-200 dark:border-slate-700 pt-2">
                <span>Arus Kas Bersih dari Investasi</span>
                <span className="text-rose-700 dark:text-rose-400 font-mono">-{formatRupiah(8500000)}</span>
              </div>
            </div>
          </div>

          {/* Closing balance */}
          <div className="p-4 bg-slate-900 dark:bg-slate-800 text-white rounded-lg flex items-center justify-between border border-slate-800 dark:border-slate-700">
            <div>
              <p className="font-bold text-sm">Total Saldo Kas Likuid Tersedia</p>
              <p className="text-xs text-slate-400">Total simpanan giro BCA, Mandiri & Settlement Gateway</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold font-mono text-amber-400">
                {formatRupiah(255550000)}
              </span>
              <span className="block text-[11px] text-slate-400">Audit Status: Reconciled</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reconciliation tab
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
              BCA
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">BCA Giro Bisnis</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Rek: 8820-192-881</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400">Saldo Giro Aktif:</span>
            <div className="text-base font-bold text-slate-900 dark:text-white font-mono mt-0.5">
              {formatRupiah(142500000)}
            </div>
            <div className="flex items-center gap-1 mt-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Klop dengan mutasi sistem</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-sm">
              MDR
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Mandiri Corporate</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Rek: 137-00-9812-44</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400">Saldo Giro Aktif:</span>
            <div className="text-base font-bold text-slate-900 dark:text-white font-mono mt-0.5">
              {formatRupiah(88200000)}
            </div>
            <div className="flex items-center gap-1 mt-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Klop dengan mutasi sistem</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
              QRIS
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Midtrans Gateway</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">QRIS & Virtual Account</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400">Saldo Escrow Belum Cair:</span>
            <div className="text-base font-bold text-slate-900 dark:text-white font-mono mt-0.5">
              {formatRupiah(24850000)}
            </div>
            <div className="flex items-center gap-1 mt-2 text-[11px] text-blue-700 dark:text-blue-400 font-medium">
              <Landmark className="w-3.5 h-3.5" />
              <span>Pencairan otomatis pukul 10:00 WIB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
