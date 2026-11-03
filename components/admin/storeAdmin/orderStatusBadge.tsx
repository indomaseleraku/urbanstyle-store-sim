import React from 'react';
import { OrderStatus } from '@/lib/admin-suite/types';

export const getOrderStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case 'pending_payment':
      return (
        <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          Menunggu Bayar
        </span>
      );
    case 'processing':
      return (
        <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          Perlu Diproses
        </span>
      );
    case 'packing':
      return (
        <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          Dikemas Gudang
        </span>
      );
    case 'shipped':
      return (
        <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          Diserahkan Kurir
        </span>
      );
    case 'delivered':
      return (
        <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          Selesai
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          Dibatalkan
        </span>
      );
  }
};
