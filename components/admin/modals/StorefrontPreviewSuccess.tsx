// components/admin/modals/StorefrontPreviewSuccess.tsx
'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Product } from '@/lib/admin-suite/types';

interface StorefrontPreviewSuccessProps {
  orderSuccessId: string;
  currentProduct: Product;
  qty: number;
  onReset: () => void;
  onClose: () => void;
}

export const StorefrontPreviewSuccess: React.FC<StorefrontPreviewSuccessProps> = ({
  orderSuccessId,
  currentProduct,
  qty,
  onReset,
  onClose,
}) => {
  return (
    <div className="p-8 text-center space-y-4">
      <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pesanan Berhasil Dibuat!</h3>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Nomor Pesanan: <strong className="font-mono text-slate-900 dark:text-emerald-400">{orderSuccessId}</strong>
        </p>
      </div>

      <div className="max-w-md mx-auto p-4 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-left space-y-2">
        <p className="font-semibold text-slate-800 dark:text-slate-200">Alur yang otomatis terjadi di sistem:</p>
        <ul className="space-y-1 text-slate-600 dark:text-slate-300 list-disc list-inside text-[11px]">
          <li><strong className="text-slate-800 dark:text-slate-200">Admin Toko:</strong> Pesanan masuk ke tab &quot;Perlu Diproses&quot; &amp; omset toko bertambah.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Admin Gudang:</strong> Stok fisik SKU {currentProduct.sku} terpotong {qty} unit.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Superadmin:</strong> Laporan Laba Rugi &amp; GMV terupdate secara otomatis!</li>
        </ul>
      </div>

      <div className="pt-2 flex justify-center gap-3">
        <button
          onClick={onReset}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Coba Pesan Produk Lain
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-900 dark:bg-emerald-750 hover:bg-slate-800 dark:hover:bg-emerald-650 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          Kembali ke Dashboard
        </button>
      </div>
    </div>
  );
};
