import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Employee, Role } from '@/lib/admin-suite/types';
import { EmployeePermissionMatrix } from './EmployeePermissionMatrix';
import { EmployeeTable } from './EmployeeTable';
import { EmployeeAddModal } from './EmployeeAddModal';
import { EmployeeEditModal } from './EmployeeEditModal';

export const EmployeeManagement: React.FC = () => {
  const [filterRole, setFilterRole] = useState<'all' | Role>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);

  return (
    <div className="space-y-4 sm:space-y-5 w-full max-w-full">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Manajemen Karyawan & Hak Akses Sistem
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola akun staf, hak akses 3 dashboard, penetapan gaji, dan pemantauan login aktif.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto border border-slate-800 dark:border-slate-700 min-h-[36px]"
        >
          <UserPlus className="w-3.5 h-3.5" />
          + Tambah Staf Baru
        </button>
      </div>

      {/* Role Permission Matrix Card */}
      <EmployeePermissionMatrix />

      {/* Filter and Table */}
      <EmployeeTable
        filterRole={filterRole}
        setFilterRole={setFilterRole}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setEditingEmp={setEditingEmp}
      />

      {/* Add Modal */}
      <EmployeeAddModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />

      {/* Edit Modal */}
      <EmployeeEditModal editingEmp={editingEmp} setEditingEmp={setEditingEmp} />
    </div>
  );
};
