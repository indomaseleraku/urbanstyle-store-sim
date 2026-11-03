// components/admin/superadmin/EmployeeMobileCards.tsx
'use client';

import React from 'react';
import { Lock, CheckCircle } from 'lucide-react';
import { Employee } from '@/lib/admin-suite/types';

interface EmployeeMobileCardsProps {
  employees: Employee[];
  formatRupiah: (val: number) => string;
  setEditingEmp: (emp: Employee) => void;
  toggleEmployeeStatus: (id: string) => void;
}

export const EmployeeMobileCards: React.FC<EmployeeMobileCardsProps> = ({
  employees,
  formatRupiah,
  setEditingEmp,
  toggleEmployeeStatus,
}) => {
  return (
    <div className="block sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
      {employees.map((emp) => (
        <div key={emp.id} className="p-3.5 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={emp.avatarUrl}
                alt={emp.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              />
              <div className="min-w-0">
                <p className="font-bold text-slate-900 dark:text-white text-xs truncate">{emp.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{emp.email}</p>
              </div>
            </div>

            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${
                emp.status === 'active'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
              }`}
            >
              {emp.status === 'active' ? 'Aktif' : 'Non-Aktif'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800/80">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">{emp.roleLabel}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {emp.department} · {emp.branch}
              </p>
              <p className="text-[11px] font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                {formatRupiah(emp.salary)}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setEditingEmp(emp)}
                className="px-2.5 py-1 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded font-medium text-[11px] border border-slate-200 dark:border-slate-700 transition-colors min-h-[34px] flex items-center cursor-pointer"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => toggleEmployeeStatus(emp.id)}
                className={`p-2 rounded border transition-colors min-h-[34px] min-w-[34px] flex items-center justify-center cursor-pointer ${
                  emp.status === 'active'
                    ? 'border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                    : 'border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                }`}
                title={emp.status === 'active' ? 'Bekukan Akses' : 'Aktifkan Akses'}
              >
                {emp.status === 'active' ? <Lock className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
