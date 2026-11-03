// components/admin/superadmin/AuditLogs.tsx
'use client';

import React from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { ShieldCheck, Clock, User, FileText } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const { activityLogs } = useAdminSuite();

  return (
    <div className="space-y-4 sm:space-y-5 w-full max-w-full">
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          Audit Trail & Log Aktivitas Sistem
        </h1>
        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Rekam jejak kepatuhan dan audit forensik setiap aksi yang dilakukan pengguna dalam sistem.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Audit Immutable (Enkripsi SHA-256)</span>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Total {activityLogs.length} Entri Tercatat</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {activityLogs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors flex items-start gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 shrink-0 mt-0.5">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{log.action}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {log.category.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {log.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{log.details}</p>
                <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                    <strong className="text-slate-700 dark:text-slate-200">{log.userName}</strong>
                  </span>
                  <span>·</span>
                  <span className="text-slate-400 dark:text-slate-500">{log.userRole}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
