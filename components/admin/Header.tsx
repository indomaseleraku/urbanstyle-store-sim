// components/admin/Header.tsx
'use client';

import React from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { useAuth } from '@/lib/auth-context';
import { 
  Menu, Search, Sun, Moon, Store, ExternalLink, Layers 
} from 'lucide-react';
import { HeaderRoleDropdown, roleConfigs } from './HeaderRoleDropdown';
import { HeaderNotifications } from './HeaderNotifications';

const navLabels: Record<string, string> = {
  overview: 'Ringkasan Utama',
  finance: 'Laporan Finansial',
  employees: 'Manajemen Karyawan',
  stores: 'Cabang & Channel',
  audit: 'Audit Log Sistem',
  orders: 'Daftar Pesanan',
  products: 'Katalog Produk',
  customers: 'Buku Pelanggan',
  promos: 'Kupon & Promo',
  inventory: 'Inventaris & Rak',
  outbound: 'Pengiriman & Resi',
  inbound: 'Barang Masuk (PO)',
  stock_opname: 'Stock Opname'
};

export const Header: React.FC = () => {
  const { 
    role, activeNav, theme, toggleTheme,
    setIsStorefrontOpen, isMobileMenuOpen, setIsMobileMenuOpen,
    globalSearch, setGlobalSearch
  } = useAdminSuite();
  const { user } = useAuth();

  const currentRoleConfig = roleConfigs[role] || roleConfigs.superadmin;
  const displayName = user?.full_name || (role === 'superadmin' ? 'Owner / Admin' : role === 'store_admin' ? 'Staf Kasir' : 'Staf Gudang');
  const userInitials = displayName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'US';
  const roleTitle = role === 'superadmin' ? 'Owner / Superadmin' : role === 'store_admin' ? 'Store Lead' : 'Warehouse Lead';

  return (
    <header className="h-14 sm:h-16 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-30 px-3 sm:px-6 flex items-center justify-between transition-colors">
      {/* Zone 1: Mobile Hamburger & Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1.5 md:hidden text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold shrink-0">
            <Layers className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="hidden sm:inline">{currentRoleConfig.label}</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">/</span>
          <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[130px] sm:max-w-none">
            {navLabels[activeNav] || 'Workspace'}
          </span>
        </div>
      </div>

      {/* Zone 2: Global Search Bar */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Cari pesanan #ORD, SKU, nama staf, atau produk..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-600 transition-all"
          />
          {globalSearch && (
            <button 
              onClick={() => setGlobalSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Zone 3: Global Theme Switcher, Role Switcher, Storefront Preview, Notifications */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        <button
          onClick={() => setIsStorefrontOpen(true)}
          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 min-h-[36px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          title="Preview alur transaksi pelanggan dari sudut pandang customer"
        >
          <Store className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300 shrink-0" />
          <span className="hidden md:inline">Preview Etalase</span>
          <ExternalLink className="w-3 h-3 text-slate-400 dark:text-slate-500 hidden sm:inline shrink-0" />
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 min-h-[36px] min-w-[36px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
          title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          aria-label="Toggle Dark / Light Mode"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        <HeaderRoleDropdown />
        <HeaderNotifications />

        {/* Current User Indicator */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-xs overflow-hidden border border-slate-300 dark:border-slate-700">
            {userInitials}
          </div>
          <div className="text-left hidden md:block">
            <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
              {displayName}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              {roleTitle}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
