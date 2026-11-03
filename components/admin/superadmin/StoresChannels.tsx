// components/admin/superadmin/StoresChannels.tsx
'use client';

import React, { useState } from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { Store, CheckCircle } from 'lucide-react';

export const StoresChannels: React.FC = () => {
  const { formatRupiah } = useAdminSuite();

  const [channels] = useState([
    {
      id: 'web',
      name: 'UrbanStyle Official Webstore',
      type: 'Direct-to-Consumer (D2C)',
      status: 'active',
      syncInterval: 'Real-time (Instant Webhook)',
      ordersToday: 28,
      gmvToday: 14250000,
      apiKeyStatus: 'Terhubung (AES-256)'
    },
    {
      id: 'shopee',
      name: 'Shopee Official Mall',
      type: 'Marketplace API Open Platform',
      status: 'active',
      syncInterval: 'Otomatis tiap 5 menit',
      ordersToday: 19,
      gmvToday: 8900000,
      apiKeyStatus: 'Token Valid (Exp: 2027)'
    },
    {
      id: 'tokopedia',
      name: 'Tokopedia Official Store',
      type: 'Tokopedia Merchant API v2',
      status: 'active',
      syncInterval: 'Otomatis tiap 5 menit',
      ordersToday: 11,
      gmvToday: 5120000,
      apiKeyStatus: 'Token Valid'
    },
    {
      id: 'tiktok',
      name: 'TikTok Shop Indonesia',
      type: 'TikTok Live Commerce Hub',
      status: 'active',
      syncInterval: 'Otomatis tiap 15 menit',
      ordersToday: 8,
      gmvToday: 3450000,
      apiKeyStatus: 'Token Valid'
    }
  ]);

  const [ppnRate, setPpnRate] = useState(11);
  const [approvalLimit, setApprovalLimit] = useState(10000000);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-4 sm:space-y-5 w-full max-w-full">
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          Integrasi Saluran Penjualan & Multi-Toko
        </h1>
        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Sinkronisasi katalog otomatis, stok terpusat, dan integrasi API marketplace.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {channels.map((c) => (
          <div key={c.id} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">{c.name}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{c.type}</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Aktif
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-100 dark:border-slate-750">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Omset Hari Ini:</span>
                <p className="font-bold text-slate-900 dark:text-white tabular-nums">{formatRupiah(c.gmvToday)}</p>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Pesanan Hari Ini:</span>
                <p className="font-bold text-slate-900 dark:text-white tabular-nums">{c.ordersToday} Pesanan</p>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-[11px] text-slate-600 dark:text-slate-300">
                <span>Sinkronisasi: {c.syncInterval}</span>
                <span className="font-mono text-slate-500 dark:text-slate-400">{c.apiKeyStatus}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
          Pengaturan Pajak & Batas Otoritas Pengeluaran
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Aturan sistem untuk pemotongan PPN faktur dan threshold approval pengeluaran finance.
        </p>

        <form onSubmit={handleSaveSettings} className="space-y-4 max-w-lg text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tarif PPN Resmi (%)</label>
            <input
              type="number"
              value={ppnRate}
              onChange={(e) => setPpnRate(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white font-mono"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Sesuai UU HPP (Pajak Pertambahan Nilai 11%)</p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Batas Approval Mandiri Finance (Rp)</label>
            <input
              type="number"
              step="1000000"
              value={approvalLimit}
              onChange={(e) => setApprovalLimit(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white font-mono"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Pengeluaran di atas {formatRupiah(approvalLimit)} wajib diverifikasi Superadmin / Owner</p>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold rounded-lg shadow-sm text-xs transition-colors border border-slate-800 dark:border-slate-700 cursor-pointer"
            >
              Simpan Konfigurasi Bisnis
            </button>
            {savedSuccess && (
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Berhasil disimpan!
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
