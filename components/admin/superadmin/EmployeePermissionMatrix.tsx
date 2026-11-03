import React from 'react';
import { ShieldCheck, ShoppingBag, Warehouse, Key } from 'lucide-react';

export const EmployeePermissionMatrix: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3 flex items-center gap-2">
        <Key className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
        Matriks Hak Akses Peran (Access Control Level)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-200/80 dark:border-amber-900/40">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold mb-1">
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Superadmin (Owner/C-Level)
          </div>
          <ul className="text-slate-600 dark:text-slate-400 space-y-1 text-[11px] list-disc list-inside">
            <li>Akses Laporan Keuangan (Laba Rugi, Neraca, Arus Kas)</li>
            <li>Manajemen Karyawan & penetapan payroll gaji</li>
            <li>Konfigurasi pajak, payment gateway & rekonsiliasi</li>
            <li>Dapat beralih ke semua dashboard kapan saja</li>
          </ul>
        </div>

        <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200/80 dark:border-emerald-900/40">
          <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold mb-1">
            <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Admin Toko Biasa (Store Ops)
          </div>
          <ul className="text-slate-600 dark:text-slate-400 space-y-1 text-[11px] list-disc list-inside">
            <li>Proses pesanan baru & cetak faktur invoice</li>
            <li>Tambah, edit harga, dan kelola promo etalase</li>
            <li>Manajemen data pelanggan & balasan ulasan</li>
            <li><em>Dibatasi dari laporan keuangan sensitif & gaji</em></li>
          </ul>
        </div>

        <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/80 dark:border-blue-900/40">
          <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-bold mb-1">
            <Warehouse className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Admin Gudang (Logistics Lead)
          </div>
          <ul className="text-slate-600 dark:text-slate-400 space-y-1 text-[11px] list-disc list-inside">
            <li>Kontrol stok fisik per SKU & lokasi rak/bin</li>
            <li>Cetak label packing slip & barcode pengiriman</li>
            <li>Penerimaan barang masuk (PO Supplier) & QC</li>
            <li>Pencatatan selisih stock opname fisik</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
