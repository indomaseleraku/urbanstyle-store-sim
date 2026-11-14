import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { ExpenseItem } from '@/lib/admin-suite/types';

interface FinancialExpensesTableProps {
  expenses: ExpenseItem[];
}

export const FinancialExpensesTable: React.FC<FinancialExpensesTableProps> = ({ expenses }) => {
  const { employees, addExpense, formatRupiah } = useAdminSuite();

  const approverOptions = Array.from(
    new Set([
      ...employees.filter((e) => e.role === 'superadmin').map((e) => `${e.name} (${e.roleLabel})`),
      'Owner Store (Superadmin)',
    ])
  );

  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [newCategory, setNewCategory] = useState<ExpenseItem['category']>('Lain-lain');
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newApprover, setNewApprover] = useState(approverOptions[0]);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim() || !newAmount || Number(newAmount) <= 0) return;

    setIsSaving(true);
    try {
      await addExpense({
        category: newCategory,
        description: newDesc.trim(),
        amount: Math.max(1, Number(newAmount)),
        approvedBy: newApprover,
      });
      setNewDesc('');
      setNewAmount('');
      setShowAddExpenseModal(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Daftar Pengeluaran Biaya Operasional</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Catatan biaya harian terhubung ke Supabase pada periode terpilih.
            </p>
          </div>
          <button
            onClick={() => setShowAddExpenseModal(true)}
            className="px-3 py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors self-start sm:self-auto border border-slate-800 dark:border-slate-700 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Catat Pengeluaran Baru
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Tanggal</th>
                <th className="px-4 py-3 font-semibold">Kategori Biaya</th>
                <th className="px-4 py-3 font-semibold">Keterangan / Deskripsi</th>
                <th className="px-4 py-3 font-semibold">Disetujui Oleh</th>
                <th className="px-4 py-3 font-semibold text-right">Nominal (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono whitespace-nowrap">{exp.date}</td>
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{exp.category}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{exp.description}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{exp.approvedBy}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-rose-700 dark:text-rose-400 tabular-nums">
                    -{formatRupiah(exp.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Catat Biaya Operasional Baru</h3>
              <button
                onClick={() => setShowAddExpenseModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori Biaya</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as ExpenseItem['category'])}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-800"
                >
                  <option value="Gaji Karyawan">Gaji Karyawan &amp; Bonus</option>
                  <option value="Sewa Gudang & Listrik">Sewa Gudang &amp; Listrik</option>
                  <option value="Biaya Pengiriman/Logistik">Biaya Pengiriman/Logistik</option>
                  <option value="Pemasaran & Iklan">Pemasaran &amp; Iklan (Ads)</option>
                  <option value="Server & Software">Server &amp; Software SaaS</option>
                  <option value="Lain-lain">Lain-lain / Pemeliharaan</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Pengeluaran</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pembelian 500 box packaging karton kraft tebal"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Jumlah Biaya (Rp)</label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="1000"
                  placeholder="Contoh: 2500000"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white font-mono focus:outline-none focus:bg-white dark:focus:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Disetujui Oleh</label>
                <select
                  value={newApprover}
                  onChange={(e) => setNewApprover(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-800"
                >
                  {approverOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-60 text-white font-semibold rounded-lg shadow-sm border border-slate-800 dark:border-slate-700 cursor-pointer"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan ke Buku Besar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
