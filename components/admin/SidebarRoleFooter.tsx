// components/admin/SidebarRoleFooter.tsx
'use client';

import React from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { Role } from '@/lib/admin-suite/types';
import { HelpCircle } from 'lucide-react';

interface SidebarRoleFooterProps {
  onRoleSwitch: (role: Role) => void;
}

export const SidebarRoleFooter: React.FC<SidebarRoleFooterProps> = ({ onRoleSwitch }) => {
  const { role, allowRoleSwitch } = useAdminSuite();

  if (!allowRoleSwitch) {
    return (
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 shrink-0 text-center">
        <p className="text-[10px] text-slate-500 font-mono">
          UrbanStyle Commerce OS v4.2
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-slate-800 bg-slate-950/40 shrink-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Pindah Cepat Peran:
        </span>
        <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        <button
          onClick={() => onRoleSwitch('superadmin')}
          title="Superadmin"
          className={`py-2 min-h-[40px] text-[11px] font-medium rounded text-center transition-colors cursor-pointer ${
            role === 'superadmin' ? 'bg-amber-500 text-white font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Owner
        </button>
        <button
          onClick={() => onRoleSwitch('store_admin')}
          title="Admin Toko"
          className={`py-2 min-h-[40px] text-[11px] font-medium rounded text-center transition-colors cursor-pointer ${
            role === 'store_admin' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Toko
        </button>
        <button
          onClick={() => onRoleSwitch('warehouse_admin')}
          title="Admin Gudang"
          className={`py-2 min-h-[40px] text-[11px] font-medium rounded text-center transition-colors cursor-pointer ${
            role === 'warehouse_admin' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Gudang
        </button>
      </div>
      <p className="text-[10px] text-slate-500 mt-2 text-center font-mono">
        UrbanStyle Commerce OS v4.2
      </p>
    </div>
  );
};
