// components/admin/HeaderRoleDropdown.tsx
'use client';

import React, { useState } from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { Role } from '@/lib/admin-suite/types';
import { ShieldCheck, Store, Warehouse, ChevronDown, Check } from 'lucide-react';

export const roleConfigs: Record<Role, { label: string; icon: any; desc: string }> = {
  superadmin: {
    label: 'Superadmin (Direksi)',
    icon: ShieldCheck,
    desc: 'Laporan Keuangan, Laba Rugi, Gaji Staf, & Audit Log'
  },
  store_admin: {
    label: 'Admin Toko (Sales)',
    icon: Store,
    desc: 'Katalog Produk, Pesanan Pelanggan, Faktur, & Promo'
  },
  warehouse_admin: {
    label: 'Admin Gudang (Logistik)',
    icon: Warehouse,
    desc: 'Stok Fisik Rak, Inbound PO, Surat Jalan, & Opname'
  }
};

export const HeaderRoleDropdown: React.FC = () => {
  const { role, setRole, allowRoleSwitch } = useAdminSuite();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const currentRoleConfig = roleConfigs[role] || roleConfigs.superadmin;
  const CurrentIcon = currentRoleConfig.icon;

  if (!allowRoleSwitch) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700">
        <CurrentIcon className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
        <span className="text-[11px]">{currentRoleConfig.label}</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowRoleMenu(!showRoleMenu)}
        className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 min-h-[36px] bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm border border-slate-800 dark:border-slate-700 cursor-pointer"
      >
        <CurrentIcon className="w-3.5 h-3.5 text-slate-200" />
        <div className="text-left">
          <span className="block leading-none text-[11px] font-semibold">{currentRoleConfig.label}</span>
        </div>
        <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5 sm:ml-1" />
      </button>

      {showRoleMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowRoleMenu(false)} />
          <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
              <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Navigasi Peran Operasional
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Akses divisi kerja operasional toko:
              </p>
            </div>
            
            <div className="p-1 space-y-1">
              {(Object.keys(roleConfigs) as Role[]).map((r) => {
                const cfg = roleConfigs[r];
                const Icon = cfg.icon;
                const isActive = role === r;
                return (
                  <button
                    key={r}
                    onClick={() => {
                      setRole(r);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg flex items-start gap-3 transition-colors cursor-pointer ${
                      isActive 
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className={`p-1.5 rounded-md shrink-0 ${isActive ? 'bg-slate-900 dark:bg-slate-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">{cfg.label}</span>
                        {isActive && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{cfg.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
