import React, { useState } from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { Role } from '@/lib/admin-suite/types';

interface EmployeeAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmployeeAddModal: React.FC<EmployeeAddModalProps> = ({ isOpen, onClose }) => {
  const { addEmployee } = useAdminSuite();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'store_admin' as Role,
    roleLabel: 'Admin Operasional Toko',
    department: 'Sales & Toko',
    branch: 'Store Flagship Senopati',
    salary: 6500000,
    status: 'active' as const,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  });

  if (!isOpen) return null;

  const handleRoleChangeInForm = (r: Role) => {
    let roleLabel = 'Admin Operasional Toko';
    let dept = 'Sales & Toko';
    let branch = 'Store Flagship Senopati';

    if (r === 'superadmin') {
      roleLabel = 'Executive & Direksi (Superadmin)';
      dept = 'Direksi & Keuangan';
      branch = 'Kantor Pusat Jakarta';
    } else if (r === 'warehouse_admin') {
      roleLabel = 'Supervisor Gudang & Logistik';
      dept = 'Warehouse & Fulfillment';
      branch = 'Gudang Pusat Cikarang DC-1';
    }

    setFormData((prev) => ({
      ...prev,
      role: r,
      roleLabel,
      department: dept,
      branch,
    }));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    addEmployee({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || '+62 812-3456-7890',
      role: formData.role,
      roleLabel: formData.roleLabel,
      department: formData.department,
      branch: formData.branch,
      salary: Number(formData.salary) || 6000000,
      status: 'active',
      avatarUrl: formData.avatarUrl,
    });

    onClose();
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'store_admin',
      roleLabel: 'Admin Operasional Toko',
      department: 'Sales & Toko',
      branch: 'Store Flagship Senopati',
      salary: 6500000,
      status: 'active',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-lg max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col my-auto">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tambah Karyawan & Buat Hak Akses</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs">
            ✕
          </button>
        </div>

        <form onSubmit={handleAddSubmit} className="p-4 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                placeholder="Contoh: Dewa Putra"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Perusahaan</label>
              <input
                type="email"
                required
                placeholder="dewa@urbanstyle.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nomor WhatsApp / HP</label>
              <input
                type="tel"
                placeholder="+62 812-xxxx-xxxx"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tingkat Peran (Role)</label>
              <select
                value={formData.role}
                onChange={(e) => handleRoleChangeInForm(e.target.value as Role)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white font-semibold focus:outline-none focus:bg-white dark:focus:bg-slate-800"
              >
                <option value="store_admin">Admin Toko Biasa (Storefront)</option>
                <option value="warehouse_admin">Admin Gudang (Warehouse)</option>
                <option value="superadmin">Superadmin (Direksi & Owner)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Departemen / Divisi</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Cabang Penempatan</label>
              <input
                type="text"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Gaji Pokok Bulanan (Rp)</label>
            <input
              type="number"
              min="3000000"
              step="100000"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white font-mono focus:outline-none focus:bg-white dark:focus:bg-slate-800"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold rounded-lg shadow-sm border border-slate-800 dark:border-slate-700"
            >
              Buat Akun Staf
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
