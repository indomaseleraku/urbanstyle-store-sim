'use client';

// app/admin/page.tsx
// UrbanStyle Commerce OS - Unified Admin & Operations Suite

import React, { useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import AdminAccessDenied from '@/components/admin/AdminAccessDenied';
import { AdminSuiteProvider } from '@/lib/admin-suite/AdminSuiteContext';
import { AdminSuiteShell } from '@/components/admin/AdminSuiteShell';
import { Role } from '@/lib/admin-suite/types';

export default function AdminDashboardPage() {
  const { user, isAdmin, isOwner, isKasir, isGudang, isLoading } = useAuth();

  const { initialRole, allowRoleSwitch } = useMemo(() => {
    let role: Role = 'superadmin';
    let canSwitch = false;

    if (isOwner) {
      role = 'superadmin';
      canSwitch = true;
    } else if (isKasir) {
      role = 'store_admin';
      canSwitch = false;
    } else if (isGudang) {
      role = 'warehouse_admin';
      canSwitch = false;
    } else if (user?.role === 'admin' || user?.role === 'owner') {
      role = 'superadmin';
      canSwitch = true;
    }

    return { initialRole: role, allowRoleSwitch: canSwitch };
  }, [user?.role, isOwner, isKasir, isGudang]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-medium">Memuat UrbanStyle Commerce OS...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <AdminAccessDenied />;
  }

  return (
    <AdminSuiteProvider initialRole={initialRole} allowRoleSwitch={allowRoleSwitch}>
      <AdminSuiteShell />
    </AdminSuiteProvider>
  );
}
