import React, { useState, useEffect } from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { Store, Globe, Warehouse, CheckCircle2, Save } from 'lucide-react';

export const StoresChannels: React.FC = () => {
  const { storeSettings, saveSettings, products, inboundShipments } = useAdminSuite();

  const [ppnRate, setPpnRate] = useState(storeSettings.ppnRate);
  const [approvalLimit, setApprovalLimit] = useState(storeSettings.approvalLimit);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    setPpnRate(storeSettings.ppnRate);
    setApprovalLimit(storeSettings.approvalLimit);
  }, [storeSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg('');
    setIsSaving(true);
    try {
      const ok = await saveSettings({
        ppnRate: Math.min(100, Math.max(0, Number(ppnRate) || 0)),
        approvalLimit: Math.max(0, Number(approvalLimit) || 0),
      });
      if (ok) {
        setSavedMsg('Konfigurasi PPN & batas otorisasi biaya berhasil disimpan ke Supabase.');
        setTimeout(() => setSavedMsg(''), 3500);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 w-full max-w-full">
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          Cabang Operasional, Gudang & Konfigurasi Pajak
        </h1>
        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Ringkasan saluran penjualan aktif dan parameter akuntansi resmi yang tersinkronisasi di seluruh laporan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
            <Globe className="w-4 h-4" />
            <span>Etalase Web Resmi (Storefront)</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            {products.filter((p) => p.status === 'active').length} produk aktif tayang langsung dengan settlement QRIS &amp; Transfer Bank.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs">
            <Store className="w-4 h-4" />
            <span>Store Flagship Senopati</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Gerai fisik &amp; koordinasi pesanan omnichannel Jakarta Selatan.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-xs">
            <Warehouse className="w-4 h-4" />
            <span>Gudang Pusat Cikarang DC-1</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            {products.reduce((acc, p) => acc + p.stock, 0)} unit stok rak · {inboundShipments.length} riwayat PO supplier.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4 max-w-2xl"
      >
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Pengaturan Pajak & Otorisasi Biaya</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tarif PPN akan diterapkan otomatis pada ringkasan KPI eksekutif, Laporan P&amp;L, Export CSV, dan Faktur Pelanggan.
          </p>
        </div>

        {savedMsg && (
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{savedMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tarif PPN (%) Default</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={ppnRate}
              onChange={(e) => setPpnRate(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-mono text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Batas Persetujuan Biaya Mandiri (Rp)
            </label>
            <input
              type="number"
              min="0"
              step="500000"
              value={approvalLimit}
              onChange={(e) => setApprovalLimit(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-mono text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-60 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Menyimpan...' : 'Simpan Konfigurasi Permanen'}
          </button>
        </div>
      </form>
    </div>
  );
};
