// components/admin/superadmin/SuperadminOverview.tsx
'use client';

import React from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { 
  DollarSign, PackageCheck, Users, ChevronRight, ShieldAlert 
} from 'lucide-react';
import { SuperadminKpiStrip } from './SuperadminKpiStrip';

export const SuperadminOverview: React.FC = () => {
  const { 
    orders, employees, formatRupiah, setActiveNav, setIsFinanceExportOpen 
  } = useAdminSuite();

  const totalRevenue = orders.reduce((acc, curr) => acc + curr.total, 0);

  const salesChannels = [
    { name: 'UrbanStyle Official Webstore', share: '46%', gmv: totalRevenue * 0.46, orders: 124, growth: '+28%' },
    { name: 'Shopee Mall Flagship', share: '28%', gmv: totalRevenue * 0.28, orders: 86, growth: '+15%' },
    { name: 'Tokopedia Official', share: '16%', gmv: totalRevenue * 0.16, orders: 49, growth: '+9%' },
    { name: 'TikTok Shop Live', share: '10%', gmv: totalRevenue * 0.10, orders: 32, growth: '+42%' }
  ];

  return (
    <div className="space-y-4 sm:space-y-5 w-full max-w-full">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Ringkasan Eksekutif & Kinerja Bisnis
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Konsolidasi data penjualan omnichannel, valuasi gudang, dan laba bersih perusahaan.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsFinanceExportOpen(true)}
            className="px-3 py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors border border-slate-800 dark:border-slate-700 min-h-[36px] cursor-pointer"
          >
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            Export Laporan
          </button>
          <button
            onClick={() => setActiveNav('finance')}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 min-h-[36px] cursor-pointer"
          >
            Buku Besar
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <SuperadminKpiStrip />

      {/* Sales Channels Performance & Financial Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Sales by Channel */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 sm:p-5 shadow-xs lg:col-span-2 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Performa Saluran Penjualan (Omnichannel)</h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">Kontribusi penjualan real-time per marketplace & webstore</p>
            </div>
            <span className="text-[10px] sm:text-xs font-mono text-slate-400 dark:text-slate-500">Okt 2026</span>
          </div>

          <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
            {salesChannels.map((channel, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{channel.name}</span>
                  <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 text-[11px] sm:text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-mono">{channel.orders} Pesanan</span>
                    <span className="font-bold text-slate-900 dark:text-white tabular-nums">{formatRupiah(channel.gmv + 12000000)}</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-[10px] sm:text-[11px]">{channel.growth}</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 sm:h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-slate-900 dark:bg-slate-100 h-full rounded-full transition-all duration-500"
                    style={{ width: channel.share }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span>AOV Rata-rata: <strong className="text-slate-900 dark:text-white font-mono">Rp 485.000</strong></span>
            <button 
              onClick={() => setActiveNav('stores')} 
              className="text-slate-900 dark:text-white font-semibold hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              Kelola Saluran Marketplace <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Action & Health Overview */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Kesehatan Operasional</h2>
              <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                Normal
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-750 flex items-start gap-3">
                <PackageCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Fulfillment On-Time</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">98.2% pesanan dikirim dalam &lt; 24 jam</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-750 flex items-start gap-3">
                <DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Rekonsiliasi Bank Otomatis</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">100% transaksi QRIS &amp; BCA terverifikasi</p>
                </div>
              </div>

              <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 rounded-lg border border-amber-200/60 dark:border-amber-900/40 flex items-start gap-3">
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-amber-900 dark:text-amber-300">Peringatan Safety Stock</p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400">1 SKU butuh restock segera dari supplier</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
            <button
              onClick={() => setActiveNav('employees')}
              className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              Kelola Hak Akses Staf ({employees.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
