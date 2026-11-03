import React from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { Employee } from '@/lib/admin-suite/types';

interface EmployeeEditModalProps {
  editingEmp: Employee | null;
  setEditingEmp: React.Dispatch<React.SetStateAction<Employee | null>>;
}

export const EmployeeEditModal: React.FC<EmployeeEditModalProps> = ({ editingEmp, setEditingEmp }) => {
  const { updateEmployee } = useAdminSuite();

  if (!editingEmp) return null;

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmp) return;

    updateEmployee(editingEmp.id, {
      name: editingEmp.name,
      email: editingEmp.email,
      phone: editingEmp.phone,
      department: editingEmp.department,
      branch: editingEmp.branch,
      salary: editingEmp.salary,
      roleLabel: editingEmp.roleLabel,
    });

    setEditingEmp(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-lg max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col my-auto">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Perbarui Data Karyawan</h3>
          <button onClick={() => setEditingEmp(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs">
            ✕
          </button>
        </div>

        <form onSubmit={handleEditSubmit} className="p-4 space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
            <input
              type="text"
              value={editingEmp.name}
              onChange={(e) => setEditingEmp({ ...editingEmp, name: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nomor WhatsApp</label>
            <input
              type="text"
              value={editingEmp.phone}
              onChange={(e) => setEditingEmp({ ...editingEmp, phone: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Gaji Pokok Bulanan (Rp)</label>
            <input
              type="number"
              value={editingEmp.salary}
              onChange={(e) => setEditingEmp({ ...editingEmp, salary: Number(e.target.value) })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Cabang Penempatan</label>
            <input
              type="text"
              value={editingEmp.branch}
              onChange={(e) => setEditingEmp({ ...editingEmp, branch: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditingEmp(null)}
              className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold rounded-lg shadow-sm border border-slate-800 dark:border-slate-700"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
