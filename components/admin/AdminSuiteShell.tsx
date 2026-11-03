import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { DashboardContent } from './DashboardContent';
import { MobileBottomNav } from './MobileBottomNav';
import { InvoiceModal } from './modals/InvoiceModal';
import { PackingSlipModal } from './modals/PackingSlipModal';
import { StorefrontPreviewModal } from './modals/StorefrontPreviewModal';
import { FinancialExportModal } from './modals/FinancialExportModal';

export const AdminSuiteShell: React.FC = () => {
  return (
    <>
      <div className="flex h-[100dvh] max-h-[100dvh] w-full max-w-full overflow-x-hidden overflow-y-hidden bg-slate-100 dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-slate-100 transition-colors">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-hidden relative">
          <Header />
          <DashboardContent />
          <MobileBottomNav />
        </div>
      </div>

      {/* Global Admin Suite Modals */}
      <InvoiceModal />
      <PackingSlipModal />
      <StorefrontPreviewModal />
      <FinancialExportModal />
    </>
  );
};
