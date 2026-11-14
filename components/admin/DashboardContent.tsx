import React from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { AlertCircle, X } from 'lucide-react';

import { SuperadminOverview } from './superadmin/SuperadminOverview';
import { FinancialReports } from './superadmin/FinancialReports';
import { EmployeeManagement } from './superadmin/EmployeeManagement';
import { StoresChannels } from './superadmin/StoresChannels';
import { AuditLogs } from './superadmin/AuditLogs';

import { StoreOverview } from './storeAdmin/StoreOverview';
import { OrderManagement } from './storeAdmin/OrderManagement';
import { ProductCatalog } from './storeAdmin/ProductCatalog';
import { CustomerManagement } from './storeAdmin/CustomerManagement';
import { PromoManager } from './storeAdmin/PromoManager';

import { WarehouseOverview } from './warehouse/WarehouseOverview';
import { InventoryManagement } from './warehouse/InventoryManagement';
import { OutboundDispatch } from './warehouse/OutboundDispatch';
import { InboundManagement } from './warehouse/InboundManagement';
import { StockOpname } from './warehouse/StockOpname';

export const DashboardContent: React.FC = () => {
  const { role, activeNav, isLoadingData, mutationError, clearMutationError } = useAdminSuite();

  const renderActiveView = () => {
    if (role === 'superadmin') {
      switch (activeNav) {
        case 'overview':
          return <SuperadminOverview />;
        case 'finance':
          return <FinancialReports />;
        case 'employees':
          return <EmployeeManagement />;
        case 'stores':
          return <StoresChannels />;
        case 'audit':
          return <AuditLogs />;
        default:
          return <SuperadminOverview />;
      }
    }

    if (role === 'store_admin') {
      switch (activeNav) {
        case 'overview':
          return <StoreOverview />;
        case 'orders':
          return <OrderManagement />;
        case 'products':
          return <ProductCatalog />;
        case 'customers':
          return <CustomerManagement />;
        case 'promos':
          return <PromoManager />;
        default:
          return <StoreOverview />;
      }
    }

    if (role === 'warehouse_admin') {
      switch (activeNav) {
        case 'overview':
          return <WarehouseOverview />;
        case 'inventory':
          return <InventoryManagement />;
        case 'outbound':
          return <OutboundDispatch />;
        case 'inbound':
          return <InboundManagement />;
        case 'stock_opname':
          return <StockOpname />;
        default:
          return <WarehouseOverview />;
      }
    }

    return <SuperadminOverview />;
  };

  return (
    <main className="flex-1 overflow-y-auto overflow-x-hidden w-full max-w-full p-3 sm:p-5 lg:p-6 pb-24 md:pb-8 bg-slate-50/70 dark:bg-slate-950 transition-colors overscroll-y-contain">
      <div className="max-w-7xl mx-auto w-full min-w-0 space-y-4">
        {mutationError && (
          <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 px-3.5 py-2.5 rounded-lg flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span className="truncate font-medium">{mutationError}</span>
            </div>
            <button
              type="button"
              onClick={clearMutationError}
              className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-300 cursor-pointer shrink-0"
              aria-label="Tutup peringatan"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {isLoadingData ? (
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-10 flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Menyinkronkan data operasional langsung dari Supabase...
            </span>
          </div>
        ) : (
          renderActiveView()
        )}
      </div>
    </main>
  );
};
