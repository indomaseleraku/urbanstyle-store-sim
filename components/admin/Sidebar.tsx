// components/admin/Sidebar.tsx
'use client';

import React from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { 
  BarChart3, DollarSign, Users, Store, FileText, ShoppingBag, 
  Package, UserCheck, Tag, Warehouse, Boxes, Truck, 
  ArrowDownLeft, ClipboardCheck, ShieldCheck, X
} from 'lucide-react';
import { Role } from '@/lib/admin-suite/types';
import { SidebarRoleFooter } from './SidebarRoleFooter';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const { 
    role, setRole, activeNav, setActiveNav, 
    orders, products, employees, inboundShipments,
    isMobileMenuOpen, setIsMobileMenuOpen 
  } = useAdminSuite();

  const pendingOrdersCount = orders.filter(o => o.status === 'processing' || o.status === 'pending_payment').length;
  const packingQueueCount = orders.filter(o => o.status === 'packing').length;
  const lowStockCount = products.filter(p => p.stock <= p.safetyStock).length;
  const pendingPOCount = inboundShipments.filter(s => s.status === 'pending' || s.status === 'in_qc').length;

  const superadminNavs: NavItem[] = [
    { id: 'overview', label: 'Ringkasan Eksekutif', icon: BarChart3 },
    { id: 'finance', label: 'Laporan Keuangan', icon: DollarSign },
    { id: 'employees', label: 'Manajemen Karyawan', icon: Users, badge: employees.length },
    { id: 'stores', label: 'Saluran & Toko', icon: Store },
    { id: 'audit', label: 'Audit Log Staf', icon: FileText }
  ];

  const storeAdminNavs: NavItem[] = [
    { id: 'overview', label: 'Ringkasan Toko', icon: ShoppingBag },
    { id: 'orders', label: 'Pesanan Pelanggan', icon: Package, badge: pendingOrdersCount, badgeColor: 'bg-amber-100 text-amber-800' },
    { id: 'products', label: 'Etalase Produk', icon: Tag, badge: products.length },
    { id: 'customers', label: 'Pelanggan & Ulasan', icon: UserCheck },
    { id: 'promos', label: 'Kupon & Promosi', icon: Tag }
  ];

  const warehouseAdminNavs: NavItem[] = [
    { id: 'overview', label: 'Ringkasan Gudang', icon: Warehouse },
    { id: 'inventory', label: 'Inventaris & Lokasi Rak', icon: Boxes, badge: lowStockCount > 0 ? `${lowStockCount} Kritis` : undefined, badgeColor: 'bg-rose-100 text-rose-700' },
    { id: 'outbound', label: 'Antrean Packing & Kirim', icon: Truck, badge: packingQueueCount > 0 ? packingQueueCount : undefined, badgeColor: 'bg-blue-100 text-blue-700' },
    { id: 'inbound', label: 'Barang Masuk (PO)', icon: ArrowDownLeft, badge: pendingPOCount > 0 ? pendingPOCount : undefined },
    { id: 'stock_opname', label: 'Stock Opname Fisik', icon: ClipboardCheck }
  ];

  const currentNavs = role === 'superadmin' ? superadminNavs : role === 'store_admin' ? storeAdminNavs : warehouseAdminNavs;

  const roleMeta: Record<Role, { title: string; badgeColor: string; textColor: string; iconColor: string; desc: string }> = {
    superadmin: {
      title: 'Portal Superadmin',
      badgeColor: 'border-amber-500/40 bg-amber-500/10',
      textColor: 'text-amber-400',
      iconColor: 'text-amber-400',
      desc: 'Owner / Keuangan / Karyawan'
    },
    store_admin: {
      title: 'Portal Admin Toko',
      badgeColor: 'border-emerald-500/40 bg-emerald-500/10',
      textColor: 'text-emerald-400',
      iconColor: 'text-emerald-400',
      desc: 'Operasional Toko & Pesanan'
    },
    warehouse_admin: {
      title: 'Portal Admin Gudang',
      badgeColor: 'border-blue-500/40 bg-blue-500/10',
      textColor: 'text-blue-400',
      iconColor: 'text-blue-400',
      desc: 'Logistik, Stok & Packing'
    }
  };

  const handleNavClick = (id: string) => {
    setActiveNav(id);
    setIsMobileMenuOpen(false);
  };

  const renderSidebarContent = (isMobile = false) => (
    <>
      <div className="overflow-y-auto">
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-black text-slate-900 text-base shadow-sm">
              U
            </div>
            <div>
              <span className="font-bold text-white tracking-tight text-sm block leading-none">UrbanStyle OS</span>
              <span className="text-[10px] text-slate-400 font-mono">Operations Suite</span>
            </div>
          </div>
          {isMobile && (
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-lg cursor-pointer"
              aria-label="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-4">
          <div className={`p-3 rounded-lg border ${roleMeta[role].badgeColor} transition-colors`}>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${roleMeta[role].textColor}`}>
                {roleMeta[role].title}
              </span>
              <ShieldCheck className={`w-4 h-4 ${roleMeta[role].iconColor}`} />
            </div>
            <p className="text-[11px] text-slate-300 mt-1 leading-snug">
              {roleMeta[role].desc}
            </p>
          </div>
        </div>

        <nav className="px-3 py-1 space-y-1">
          <div className="px-3 pb-2 pt-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Menu Operasional
          </div>
          {currentNavs.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-slate-900 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold shrink-0 ${
                      item.badgeColor || (isActive ? 'bg-slate-200 text-slate-800' : 'bg-slate-800 text-slate-300')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <SidebarRoleFooter onRoleSwitch={(newRole) => {
        setRole(newRole);
        setIsMobileMenuOpen(false);
      }} />
    </>
  );

  return (
    <>
      <aside className="hidden md:flex w-64 bg-slate-900 text-slate-300 flex-col justify-between shrink-0 select-none border-r border-slate-800 h-screen sticky top-0">
        {renderSidebarContent(false)}
      </aside>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-slate-900 text-slate-300 h-full flex flex-col justify-between shadow-2xl z-10 select-none">
            {renderSidebarContent(true)}
          </div>
        </div>
      )}
    </>
  );
};
