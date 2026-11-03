import React from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';

// Superadmin Views
import { SuperadminOverview } from './superadmin/SuperadminOverview';
import { FinancialReports } from './superadmin/FinancialReports';
import { EmployeeManagement } from './superadmin/EmployeeManagement';
import { StoresChannels } from './superadmin/StoresChannels';
import { AuditLogs } from './superadmin/AuditLogs';

// Store Admin Views
import { StoreOverview } from './storeAdmin/StoreOverview';
import { OrderManagement } from './storeAdmin/OrderManagement';
import { ProductCatalog } from './storeAdmin/ProductCatalog';
import { CustomerManagement } from './storeAdmin/CustomerManagement';
import { PromoManager } from './storeAdmin/PromoManager';

// Warehouse Admin Views
import { WarehouseOverview } from './warehouse/WarehouseOverview';
import { InventoryManagement } from './warehouse/InventoryManagement';
import { OutboundDispatch } from './warehouse/OutboundDispatch';
import { InboundManagement } from './warehouse/InboundManagement';
import { StockOpname } from './warehouse/StockOpname';

export const DashboardContent: React.FC = () => {
  const { role, activeNav } = useAdminSuite();

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
      <div className="max-w-7xl mx-auto w-full min-w-0">
        {renderActiveView()}
      </div>
    </main>
  );
};
