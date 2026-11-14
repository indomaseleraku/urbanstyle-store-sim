import React, { useState } from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { OrderStatus } from '@/lib/admin-suite/types';
import { OrderManagementFilter } from './OrderManagementFilter';
import { OrderManagementMobileCards } from './OrderManagementMobileCards';
import { OrderManagementTable } from './OrderManagementTable';
import { OrderManagementCards } from './OrderManagementCards';
import { getOrderStatusBadge } from './orderStatusBadge';

export const OrderManagement: React.FC = () => {
  const { orders, globalSearch } = useAdminSuite();

  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('processing');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const query = (search || globalSearch).trim().toLowerCase();

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesSearch =
      !query ||
      o.orderNumber.toLowerCase().includes(query) ||
      o.customerName.toLowerCase().includes(query) ||
      o.city.toLowerCase().includes(query) ||
      o.paymentMethod.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-4 sm:space-y-5 w-full max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Manajemen Pesanan Toko Online
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Verifikasi pembayaran, konfirmasi pesanan, dan koordinasikan pengiriman dengan bagian gudang.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
            Total {orders.length} Pesanan Terdaftar
          </span>
        </div>
      </div>

      <OrderManagementFilter
        orders={orders}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        search={search}
        setSearch={setSearch}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors w-full">
        <div className="block sm:hidden">
          <OrderManagementMobileCards orders={filteredOrders} getStatusBadge={getOrderStatusBadge} />
        </div>

        <div className="hidden sm:block w-full">
          {viewMode === 'table' ? (
            <OrderManagementTable orders={filteredOrders} />
          ) : (
            <OrderManagementCards orders={filteredOrders} />
          )}
        </div>
      </div>
    </div>
  );
};
