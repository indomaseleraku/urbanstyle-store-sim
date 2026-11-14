import React, { useState } from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { Employee, Role } from '@/lib/admin-suite/types';
import { Trash2, X } from 'lucide-react';

interface EmployeeEditModalProps {
  editingEmp: Employee | null;
  setEditingEmp: React.Dispatch<React.SetStateAction<Employee | null>>;
}

export const EmployeeEditModal: React.FC<EmployeeEditModalProps> = ({ editingEmp, setEditingEmp }) => {
  const { updateEmployee, deleteEmployee } = useAdminSuite();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!editingEmp) return null;

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmp || !editingEmp.name.trim()) return;

    setIsSaving(true);
    try {
      await updateEmployee(editingEmp.id, {
        name: editingEmp.name.trim(),
        email: editingEmp.email.trim().toLowerCase(),
        phone: editingEmp.phone,
        role: editingEmp.role,
        department: editingEmp.department,
        branch: editingEmp.branch,
        salary: Math.max(0, Number(editingEmp.salary) || 0),
        roleLabel: editingEmp.roleLabel,
      });
      setConfirmDelete(false);
      setEditingEmp(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingEmp) return;
    setIsSaving(true);
    try {
      await deleteEmployee(editingEmp.id);
      setConfirmDelete(false);
      setEditingEmp(null);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-lg max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col my-auto">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Perbarui Data Karyawan</h3>
          <button
            onClick={() => {
              setConfirmDelete(false);
              setEditingEmp(null);
            }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleEditSubmit} className="p-4 space-y-3 text-xs overflow-y-auto">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              value={editingEmp.name}
              onChange={(e) => setEditingEmp({ ...editingEmp, name: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tingkat Peran</label>
              <select
                value={editingEmp.role}
                onChange={(e) => setEditingEmp({ ...editingEmp, role: e.target.value as Role })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white"
              >
                <option value="store_admin">Admin Toko</option>
                <option value="warehouse_admin">Admin Gudang</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Gaji Pokok Bulanan (Rp)</label>
            <input
              type="number"
              min="0"
              value={editingEmp.salary}
              onChange={(e) => setEditingEmp({ ...editingEmp, salary: Math.max(0, Number(e.target.value) || 0) })}
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

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="px-2.5 py-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg font-medium flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Staf
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSaving}
                  className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold cursor-pointer"
                >
                  Konfirmasi Hapus
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-1.5 text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Batal
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmDelete(false);
                  setEditingEmp(null);
                }}
                className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-60 text-white font-semibold rounded-lg shadow-sm border border-slate-800 dark:border-slate-700 cursor-pointer"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
