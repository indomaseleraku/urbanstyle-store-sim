import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { ExpenseItem } from '@/lib/admin-suite/types';

export const FinancialExpensesTable: React.FC = () => {
  const { expenses, addExpense, formatRupiah } = useAdminSuite();
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  // New expense form state
  const [newCategory, setNewCategory] = useState<ExpenseItem['category']>('Pemasaran & Iklan');
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newApprover, setNewApprover] = useState('Farhan Maulana (CEO)');

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc || !newAmount) return;

    addExpense({
      category: newCategory,
      description: newDesc,
      amount: parseInt(newAmount, 10),
      date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      approvedBy: newApprover,
    });

    setNewDesc('');
    setNewAmount('');
    setShowAddExpenseModal(false);
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Daftar Pengeluaran & Beban Usaha</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pencatatan faktur pengeluaran yang telah diapprove manajemen</p>
          </div>
          <button
            onClick={() => setShowAddExpenseModal(true)}
            className="px-3 py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors border border-slate-800 dark:border-slate-700"
          >
            <Plus className="w-3.5 h-3.5" />
            Catat Beban Baru
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Tanggal</th>
                <th className="px-4 py-3 font-semibold">Kategori Beban</th>
                <th className="px-4 py-3 font-semibold">Deskripsi Pengeluaran</th>
                <th className="px-4 py-3 font-semibold">Approval Oleh</th>
                <th className="px-4 py-3 font-semibold text-right">Jumlah Biaya</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono">{exp.date}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{exp.category}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{exp.description}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{exp.approvedBy}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-rose-700 dark:text-rose-400 tabular-nums">
                    {formatRupiah(exp.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      {exp.status === 'approved' ? 'Disetujui' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tambah Beban Operasional */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-lg max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col my-auto">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Catat Pengeluaran Operasional Baru</h3>
              <button
                onClick={() => setShowAddExpenseModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori Beban</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as ExpenseItem['category'])}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-800"
                >
                  <option value="Gaji Karyawan">Gaji Karyawan & Bonus</option>
                  <option value="Sewa Gudang & Listrik">Sewa Gudang & Listrik</option>
                  <option value="Biaya Pengiriman/Logistik">Biaya Pengiriman/Logistik</option>
                  <option value="Pemasaran & Iklan">Pemasaran & Iklan (Ads)</option>
                  <option value="Server & Software">Server & Software SaaS</option>
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
                  <option value="Farhan Maulana (CEO)">Farhan Maulana (CEO / Owner)</option>
                  <option value="Siti Nurhaliza (Finance)">Siti Nurhaliza (Manajer Keuangan)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold rounded-lg shadow-sm border border-slate-800 dark:border-slate-700"
                >
                  Simpan ke Buku Besar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
