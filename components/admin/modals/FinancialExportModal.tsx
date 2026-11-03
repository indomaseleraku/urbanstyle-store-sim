// components/admin/modals/FinancialExportModal.tsx
'use client';

import React, { useState } from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { X, Download, FileText, CheckCircle2, Printer } from 'lucide-react';

export const FinancialExportModal: React.FC = () => {
  const { isFinanceExportOpen, setIsFinanceExportOpen, expenses } = useAdminSuite();

  const [format, setFormat] = useState<'csv' | 'pdf'>('csv');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isFinanceExportOpen) return null;

  const handleDownload = () => {
    if (format === 'csv') {
      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += 'LAPORAN KEUANGAN URBANSTYLE LIFEWEAR ECOMMERCE\n';
      csvContent += 'Periode: Oktober 2026\n\n';
      csvContent += 'KATEGORI,DESKRIPSI,JUMLAH_RP\n';
      csvContent += 'Pendapatan,Penjualan Online Bersih,168500000\n';
      csvContent += 'HPP,Biaya Produksi & Bahan Baku,-70770000\n';
      csvContent += 'Laba Kotor,Gross Profit,97730000\n';
      
      expenses.forEach(e => {
        csvContent += `Beban Operasional,${e.category} - ${e.description},-${e.amount}\n`;
      });
      
      csvContent += 'Laba Bersih,Net Profit Setelah Pajak,32450000\n';

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `UrbanStyle_Laporan_Keuangan_Okt2026.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Export Laporan Keuangan</h3>
          </div>
          <button
            onClick={() => setIsFinanceExportOpen(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-1 rounded-lg cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs text-slate-800 dark:text-slate-200">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-2">Pilih Format Berkas</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                  format === 'csv'
                    ? 'border-slate-900 dark:border-slate-600 bg-slate-900 dark:bg-slate-800 text-white font-bold shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="block text-sm font-black mb-0.5">.CSV</span>
                <span className="text-[11px] opacity-80">Excel & Spreadsheet</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                  format === 'pdf'
                    ? 'border-slate-900 dark:border-slate-600 bg-slate-900 dark:bg-slate-800 text-white font-bold shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="block text-sm font-black mb-0.5">.PDF</span>
                <span className="text-[11px] opacity-80">Cetak Arsip Resmi</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/70 p-3 rounded-lg border border-slate-100 dark:border-slate-700 space-y-1 text-slate-600 dark:text-slate-300">
            <p className="font-semibold text-slate-800 dark:text-slate-200">Cakupan Data yang Diexport:</p>
            <p>· Laporan Laba Rugi (P&L Income Statement)</p>
            <p>· Rincian HPP (COGS) & Beban Operasional Usaha</p>
            <p>· Rekonsiliasi Saldo Bank BCA & Mandiri</p>
            <p>· Estimasi Pajak Terutang (PPN 11%)</p>
          </div>

          {downloadSuccess && (
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Berkas CSV berhasil diunduh ke komputer Anda!</span>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              onClick={() => setIsFinanceExportOpen(false)}
              className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-slate-900 dark:bg-slate-750 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {format === 'csv' ? <Download className="w-3.5 h-3.5" /> : <Printer className="w-3.5 h-3.5" />}
              {format === 'csv' ? 'Unduh File CSV Sekarang' : 'Buka Dialog Cetak PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
