import React, { useState } from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { ArrowDownLeft, CheckCircle2, Plus } from 'lucide-react';
import { InboundAddModal } from './InboundAddModal';

export const InboundManagement: React.FC = () => {
  const { inboundShipments, receiveShipment } = useAdminSuite();
  const [showAddPo, setShowAddPo] = useState(false);

  return (
    <div className="space-y-4 sm:space-y-5 w-full max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Penerimaan Barang Masuk Supplier (Inbound &amp; PO)
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Jadwal kedatangan stok dari vendor/konveksi — konfirmasi QC otomatis menambah stok SKU terkait.
          </p>
        </div>

        <button
          onClick={() => setShowAddPo(true)}
          className="px-3 py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto min-h-[36px] cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Buat PO Masuk
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inboundShipments.map((s) => (
          <div
            key={s.id}
            className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ArrowDownLeft className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  {s.poNumber}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                    s.status === 'received'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  }`}
                >
                  {s.status === 'received' ? 'Diterima & Masuk Rak' : s.status === 'in_qc' ? 'Proses QC' : 'Menunggu'}
                </span>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{s.supplierName}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{s.itemsSummary}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                <div>
                  <span className="text-slate-400">Estimasi Tiba</span>
                  <p className="font-mono font-semibold text-slate-700 dark:text-slate-300">{s.expectedDate}</p>
                </div>
                <div>
                  <span className="text-slate-400">Total Unit</span>
                  <p className="font-mono font-bold text-slate-900 dark:text-white">{s.totalUnits} pcs</p>
                </div>
              </div>
            </div>

            {s.status !== 'received' ? (
              <button
                type="button"
                onClick={() => void receiveShipment(s.id)}
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Konfirmasi QC &amp; Terima ke Rak
              </button>
            ) : (
              <div className="text-center text-[11px] font-medium text-emerald-700 dark:text-emerald-400 py-1.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded border border-emerald-100 dark:border-emerald-900/40">
                QC Selesai &amp; Tersimpan
              </div>
            )}
          </div>
        ))}
      </div>

      <InboundAddModal isOpen={showAddPo} onClose={() => setShowAddPo(false)} />
    </div>
  );
};
