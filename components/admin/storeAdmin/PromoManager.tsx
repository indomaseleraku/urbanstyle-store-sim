import React, { useState } from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { Plus } from 'lucide-react';

export const PromoManager: React.FC = () => {
  const { promos, addPromo, formatRupiah } = useAdminSuite();

  const [showAddModal, setShowAddModal] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(10);
  const [minPurchase, setMinPurchase] = useState(200000);
  const [quota, setQuota] = useState(200);
  const [validUntil, setValidUntil] = useState('31 Des 2026');

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    addPromo({
      code: code.toUpperCase().trim(),
      discountType,
      discountValue: Number(discountValue),
      minPurchase: Number(minPurchase),
      quota: Number(quota),
      validUntil,
      status: 'active',
    });

    setCode('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4 sm:space-y-5 w-full max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Voucher Promo & Kupon Diskon Toko
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Buat kode promo belanja untuk mendongkrak konversi checkout pelanggan.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto min-h-[36px]"
        >
          <Plus className="w-3.5 h-3.5" />
          + Buat Kupon Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promos.map((p) => (
          <div
            key={p.id}
            className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-sm bg-slate-900 dark:bg-slate-800 text-white px-2.5 py-1 rounded-md tracking-wider border border-slate-800 dark:border-slate-700">
                  {p.code}
                </span>
                <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  {p.status === 'active' ? 'Aktif' : 'Kedaluwarsa'}
                </span>
              </div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                {p.discountType === 'percentage'
                  ? `Diskon ${p.discountValue}%`
                  : `Potongan ${formatRupiah(p.discountValue)}`}
              </span>
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
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs"
              >
                ✕
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
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Min. Belanja (Rp)
                  </label>
                  <input
                    type="number"
                    step="10000"
                    value={minPurchase}
                    onChange={(e) => setMinPurchase(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kuota Pemakaian
                  </label>
                  <input
                    type="number"
                    value={quota}
                    onChange={(e) => setQuota(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Masa Berlaku</label>
                <input
                  type="text"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-sm"
                >
                  Aktifkan Kupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
