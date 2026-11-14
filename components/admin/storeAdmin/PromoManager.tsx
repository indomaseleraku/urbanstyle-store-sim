import React, { useState } from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { Plus, Power, X } from 'lucide-react';

export const PromoManager: React.FC = () => {
  const { promos, addPromo, togglePromoStatus, formatRupiah } = useAdminSuite();

  const [showAddModal, setShowAddModal] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(10);
  const [minPurchase, setMinPurchase] = useState(200000);
  const [quota, setQuota] = useState(200);
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || discountValue <= 0 || quota <= 0) return;

    setIsSaving(true);
    try {
      await addPromo({
        code: code.toUpperCase().trim(),
        discountType,
        discountValue: Math.max(1, Number(discountValue)),
        minPurchase: Math.max(0, Number(minPurchase)),
        quota: Math.max(1, Number(quota)),
        validUntil,
        status: 'active',
      });
      setCode('');
      setShowAddModal(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 w-full max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Voucher Promo & Kupon Diskon Toko
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Buat kode promo belanja dan kelola status aktif voucher checkout pelanggan.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto min-h-[36px] cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Buat Kupon Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promos.map((p) => (
          <div
            key={p.id}
            className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-sm bg-slate-900 dark:bg-slate-800 text-white px-2.5 py-1 rounded-md tracking-wider border border-slate-800 dark:border-slate-700">
                  {p.code}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                    p.status === 'active'
                      ? 'text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                      : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {p.status === 'active' ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                  {p.discountType === 'percentage'
                    ? `Diskon ${p.discountValue}%`
                    : `Potongan ${formatRupiah(p.discountValue)}`}
                </span>
                <button
                  type="button"
                  onClick={() => togglePromoStatus(p.id)}
                  className="p-1.5 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  title={p.status === 'active' ? 'Nonaktifkan Kupon' : 'Aktifkan Kupon'}
                >
                  <Power className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
              <div className="flex justify-between">
                <span>Minimal Belanja:</span>
                <strong className="text-slate-900 dark:text-white font-mono">{formatRupiah(p.minPurchase)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Penggunaan:</span>
                <span className="text-slate-900 dark:text-white font-mono">
                  {p.usageCount} / {p.quota} klaim
                </span>
              </div>
              <div className="flex justify-between">
                <span>Berlaku Hingga:</span>
                <span className="text-slate-900 dark:text-white font-mono">{p.validUntil}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-lg max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col my-auto">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Buat Kupon Diskon Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer" aria-label="Tutup">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePromo} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kode Voucher (Huruf Kapital)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: URBANSTYLE50K"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono uppercase text-slate-800 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipe Diskon</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white"
                  >
                    <option value="percentage">Persentase (%)</option>
                    <option value="fixed">Nominal Tetap (Rp)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nilai Diskon</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={discountType === 'percentage' ? 100 : undefined}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Min. Belanja (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={minPurchase}
                    onChange={(e) => setMinPurchase(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kuota Pemakaian</label>
                  <input
                    type="number"
                    min="1"
                    value={quota}
                    onChange={(e) => setQuota(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Masa Berlaku</label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-semibold rounded-lg shadow-sm cursor-pointer"
                >
                  {isSaving ? 'Menyimpan...' : 'Aktifkan Kupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
