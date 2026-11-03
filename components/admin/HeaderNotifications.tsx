// components/admin/HeaderNotifications.tsx
'use client';

import React, { useState } from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { Bell } from 'lucide-react';

export const HeaderNotifications: React.FC = () => {
  const { notifications, markNotificationRead, clearNotifications } = useAdminSuite();
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifMenu(!showNotifMenu)}
        className="relative p-2 min-h-[36px] min-w-[36px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
        title="Pusat Notifikasi Sistem"
        aria-label="Pusat Notifikasi"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
        )}
      </button>

      {showNotifMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowNotifMenu(false)} />
          <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Notifikasi</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">({unreadCount} baru)</span>
              </div>
              {notifications.length > 0 && (
                <button 
                  onClick={clearNotifications}
                  className="text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  Bersihkan
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                  Tidak ada notifikasi baru
                </div>
              ) : (
                notifications.map(n => (
                  <div 
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                      !n.read ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">{n.title}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
