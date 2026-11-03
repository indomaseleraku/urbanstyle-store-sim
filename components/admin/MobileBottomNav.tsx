// components/admin/MobileBottomNav.tsx
'use client';

import React from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { 
  BarChart3, DollarSign, Users, ShoppingBag, Package, Tag, 
  Warehouse, Boxes, Truck, Menu, ArrowDownLeft 
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { 
    role, activeNav, setActiveNav, orders, products, setIsMobileMenuOpen 
  } = useAdminSuite();

  const pendingOrders = orders.filter(o => o.status === 'processing' || o.status === 'pending_payment').length;
  const packingCount = orders.filter(o => o.status === 'packing').length;
  const lowStockCount = products.filter(p => p.stock <= p.safetyStock).length;

  interface TabDef {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeColor?: string;
    isMenuTrigger?: boolean;
  }

  const getTabs = (): TabDef[] => {
    if (role === 'superadmin') {
      return [
        { id: 'overview', label: 'Ringkasan', icon: BarChart3 },
        { id: 'finance', label: 'Keuangan', icon: DollarSign },
        { id: 'employees', label: 'Karyawan', icon: Users },
        { id: 'menu', label: 'Semua Menu', icon: Menu, isMenuTrigger: true }
      ];
    }
    if (role === 'store_admin') {
      return [
        { id: 'overview', label: 'Ringkasan', icon: ShoppingBag },
        { id: 'orders', label: 'Pesanan', icon: Package, badge: pendingOrders > 0 ? pendingOrders : undefined, badgeColor: 'bg-amber-600' },
        { id: 'products', label: 'Katalog', icon: Tag },
        { id: 'menu', label: 'Semua Menu', icon: Menu, isMenuTrigger: true }
      ];
    }
    return [
      { id: 'overview', label: 'Ringkasan', icon: Warehouse },
      { id: 'inventory', label: 'Stok SKU', icon: Boxes, badge: lowStockCount > 0 ? lowStockCount : undefined, badgeColor: 'bg-rose-600' },
      { id: 'outbound', label: 'Packing', icon: Truck, badge: packingCount > 0 ? packingCount : undefined, badgeColor: 'bg-blue-600' },
      { id: 'inbound', label: 'PO Masuk', icon: ArrowDownLeft },
      { id: 'menu', label: 'Menu', icon: Menu, isMenuTrigger: true }
    ];
  };

  const tabs = getTabs();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 min-h-[4rem] h-[calc(4rem+env(safe-area-inset-bottom,0px))] md:hidden px-1 flex items-center justify-around shadow-lg pb-[env(safe-area-inset-bottom,0px)]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = !tab.isMenuTrigger && activeNav === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.isMenuTrigger) {
                setIsMobileMenuOpen(true);
              } else {
                setActiveNav(tab.id);
              }
            }}
            className={`flex-1 min-h-[44px] py-1 flex flex-col items-center justify-center relative transition-colors cursor-pointer ${
              isActive ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'text-slate-900 dark:text-white stroke-[2.5]' : 'text-slate-500 dark:text-slate-400'}`} />
              {tab.badge !== undefined && (
                <span className={`absolute -top-1.5 -right-2 w-4 h-4 rounded-full text-white text-[9px] font-mono font-bold flex items-center justify-center ${tab.badgeColor || 'bg-slate-900'}`}>
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1 leading-none truncate max-w-[64px]">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
