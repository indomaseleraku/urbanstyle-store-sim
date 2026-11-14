'use client';

import React from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { isRealizedPaidOrder } from '@/lib/admin-suite/financeUtils';
import { SuperadminKpiStrip } from './SuperadminKpiStrip';
import { OrderTrendChart } from '../storeAdmin/OrderTrendChart';
import { Download, ArrowRight } from 'lucide-react';

export const SuperadminOverview: React.FC = () => {
  const { orders, products, inboundShipments, activityLogs, setActiveNav, setIsFinanceExportOpen, formatRupiah } =
    useAdminSuite();

  const nonCancelledOrders = orders.filter((o) => o.status !== 'cancelled');
  const paidOrders = orders.filter(isRealizedPaidOrder);
  const fulfilledOrders = nonCancelledOrders.filter((o) => o.status === 'shipped' || o.status === 'delivered');

  const fulfillmentRate =
    nonCancelledOrders.length > 0
      ? ((fulfilledOrders.length / nonCancelledOrders.length) * 100).toFixed(1)
      : '0.0';
  const paidSettlementRate =
    nonCancelledOrders.length > 0
      ? ((paidOrders.length / nonCancelledOrders.length) * 100).toFixed(1)
      : '0.0';

  const lowStockProducts = products.filter((p) => p.stock <= p.safetyStock);
  const pendingInboundCount = inboundShipments.filter((s) => s.status !== 'received').length;

  return (
    <div className="space-y-4 sm:space-y-5 w-full max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Executive Control Center (Owner &amp; Superadmin)
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Metrik real-time terintegrasi langsung dengan transaksi, inventaris gudang, dan pembukuan Supabase.
          </p>
        </div>

        <button
          onClick={() => setIsFinanceExportOpen(true)}
          className="px-3 py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto border border-slate-800 dark:border-slate-700 min-h-[36px] cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Export Laporan Eksekutif
        </button>
      </div>

      <SuperadminKpiStrip />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="lg:col-span-2">
          <OrderTrendChart />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Kesehatan Operasional Live</h2>
            <button
              onClick={() => setActiveNav('audit')}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Audit Log <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Rasio Pengiriman / Selesai</span>
                <span className="font-mono text-emerald-700 dark:text-emerald-400">{fulfillmentRate}%</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {fulfilledOrders.length} dari {nonCancelledOrders.length} pesanan aktif telah dikirim atau diterima.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Tingkat Settlement Lunas</span>
                <span className="font-mono text-blue-700 dark:text-blue-400">{paidSettlementRate}%</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {paidOrders.length} transaksi terkonfirmasi lunas · Total {formatRupiah(paidOrders.reduce((s, o) => s + o.total, 0))}.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Status Gudang &amp; PO Supplier</span>
                <span className={`font-mono ${lowStockProducts.length > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                  {lowStockProducts.length > 0 ? `${lowStockProducts.length} SKU Menipis` : 'Stok Aman'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {pendingInboundCount} jadwal PO supplier menunggu penerimaan · {activityLogs.length} jejak audit tercatat.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
