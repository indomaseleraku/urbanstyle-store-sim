import React from 'react';
import { Search, Building, Edit3, Lock, CheckCircle } from 'lucide-react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { Employee, Role } from '@/lib/admin-suite/types';
import { EmployeeMobileCards } from './EmployeeMobileCards';

interface EmployeeTableProps {
  filterRole: 'all' | Role;
  setFilterRole: (r: 'all' | Role) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  setEditingEmp: (emp: Employee) => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  filterRole,
  setFilterRole,
  searchQuery,
  setSearchQuery,
  setEditingEmp,
}) => {
  const { employees, toggleEmployeeStatus, formatRupiah } = useAdminSuite();

  const filteredEmployees = employees.filter((emp) => {
    const matchesRole = filterRole === 'all' || emp.role === filterRole;
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs pb-1 sm:pb-0">
          <button
            onClick={() => setFilterRole('all')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filterRole === 'all'
                ? 'bg-slate-900 dark:bg-slate-800 text-white font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Semua Peran ({employees.length})
          </button>
          <button
            onClick={() => setFilterRole('superadmin')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filterRole === 'superadmin'
                ? 'bg-slate-900 dark:bg-slate-800 text-white font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Superadmin ({employees.filter((e) => e.role === 'superadmin').length})
          </button>
          <button
            onClick={() => setFilterRole('store_admin')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filterRole === 'store_admin'
                ? 'bg-slate-900 dark:bg-slate-800 text-white font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Admin Toko ({employees.filter((e) => e.role === 'store_admin').length})
          </button>
          <button
            onClick={() => setFilterRole('warehouse_admin')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filterRole === 'warehouse_admin'
                ? 'bg-slate-900 dark:bg-slate-800 text-white font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Admin Gudang ({employees.filter((e) => e.role === 'warehouse_admin').length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, email, divisi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800"
          />
        </div>
      </div>

      {/* Employees Table & Mobile Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        {/* Mobile View: Cards */}
        <EmployeeMobileCards
          employees={filteredEmployees}
          formatRupiah={formatRupiah}
          setEditingEmp={setEditingEmp}
          toggleEmployeeStatus={toggleEmployeeStatus}
        />

        {/* Desktop View: Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Profil Karyawan</th>
                <th className="px-4 py-3 font-semibold">Peran & Departemen</th>
                <th className="px-4 py-3 font-semibold">Cabang Penempatan</th>
                <th className="px-4 py-3 font-semibold text-right">Gaji Pokok</th>
                <th className="px-4 py-3 font-semibold">Login Terakhir</th>
                <th className="px-4 py-3 font-semibold text-center">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={emp.avatarUrl}
                        alt={emp.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{emp.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{emp.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{emp.roleLabel}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{emp.department}</p>
                  </td>

                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      {emp.branch}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                    {formatRupiah(emp.salary)}
                  </td>

                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    {emp.lastLogin}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        emp.status === 'active'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {emp.status === 'active' ? 'Aktif' : 'Non-Aktif'}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setEditingEmp(emp)}
                        className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                        title="Edit Data Staf"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleEmployeeStatus(emp.id)}
                        className={`p-1.5 rounded-md transition-colors ${
                          emp.status === 'active'
                            ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                            : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                        }`}
                        title={emp.status === 'active' ? 'Bekukan Akses' : 'Aktifkan Akses'}
                      >
                        {emp.status === 'active' ? <Lock className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
