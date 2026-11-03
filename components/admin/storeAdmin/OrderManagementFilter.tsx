import React from 'react';
import { Search, Table, Layers } from 'lucide-react';
import { Order, OrderStatus } from '@/lib/admin-suite/types';

interface OrderManagementFilterProps {
  orders: Order[];
  statusFilter: 'all' | OrderStatus;
  setStatusFilter: (status: 'all' | OrderStatus) => void;
  search: string;
  setSearch: (search: string) => void;
  viewMode: 'table' | 'cards';
  setViewMode: (mode: 'table' | 'cards') => void;
}

export const OrderManagementFilter: React.FC<OrderManagementFilterProps> = ({
  orders,
  statusFilter,
  setStatusFilter,
  search,
  setSearch,
  viewMode,
  setViewMode,
}) => {
  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
      {/* Status Filter Buttons (Wrapping naturally without horizontal scroll) */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <button
          onClick={() => setStatusFilter('processing')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            statusFilter === 'processing'
              ? 'bg-amber-600 text-white font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Perlu Diproses ({orders.filter((o) => o.status === 'processing').length})
        </button>
        <button
          onClick={() => setStatusFilter('packing')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            statusFilter === 'packing'
              ? 'bg-blue-600 text-white font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Di Gudang ({orders.filter((o) => o.status === 'packing').length})
        </button>
        <button
          onClick={() => setStatusFilter('shipped')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            statusFilter === 'shipped'
              ? 'bg-purple-600 text-white font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Dikirim ({orders.filter((o) => o.status === 'shipped').length})
        </button>
        <button
          onClick={() => setStatusFilter('delivered')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            statusFilter === 'delivered'
              ? 'bg-emerald-600 text-white font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Selesai ({orders.filter((o) => o.status === 'delivered').length})
        </button>
        <button
          onClick={() => setStatusFilter('pending_payment')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            statusFilter === 'pending_payment'
              ? 'bg-zinc-700 text-white font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Menunggu Bayar ({orders.filter((o) => o.status === 'pending_payment').length})
        </button>
        <button
          onClick={() => setStatusFilter('cancelled')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            statusFilter === 'cancelled'
              ? 'bg-rose-600 text-white font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Dibatalkan ({orders.filter((o) => o.status === 'cancelled').length})
        </button>
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-slate-900 dark:bg-slate-800 text-white font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Semua ({orders.length})
        </button>
      </div>

      {/* Right Controls: Search & View Switcher */}
      <div className="flex items-center gap-2 w-full lg:w-auto">
        <div className="relative flex-1 lg:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari No. Order, nama, kota..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800"
          />
        </div>

        {/* View Mode Toggle: Table vs Cards */}
        <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            title="Tampilan Tabel Padat (1 Layar)"
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              viewMode === 'table'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            title="Tampilan Kartu Alur Vertikal"
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
