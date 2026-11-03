import React from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { CheckCircle2, ShieldCheck, Truck } from 'lucide-react';

export const InboundManagement: React.FC = () => {
  const { inboundShipments, receiveShipment } = useAdminSuite();

  return (
    <div className="space-y-4 sm:space-y-5 w-full max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Penerimaan Barang Masuk (Inbound PO)
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Jadwal pengiriman dari vendor pabrik, verifikasi quality control (QC), dan input batch stok ke gudang.
          </p>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {inboundShipments.map((s) => (
          <div
            key={s.id}
            className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 sm:p-5 shadow-xs space-y-3 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {s.poNumber}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        s.status === 'received'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : s.status === 'in_qc'
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {s.status === 'received'
                        ? 'Lulus QC & Diterima'
                        : s.status === 'in_qc'
                        ? 'Proses QC'
                        : 'Menunggu Tiba'}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs mt-0.5">{s.supplierName}</p>
                </div>
              </div>

              <div className="text-right text-xs">
                <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">Estimasi Tiba:</span>
                <p className="font-bold text-slate-900 dark:text-white font-mono text-xs">{s.expectedDate}</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-100 dark:border-slate-700 text-xs grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-[11px]">Rincian Barang:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{s.itemsSummary}</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-[11px]">Total Volume:</span>
                <p className="font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                  {s.totalUnits} unit ({s.itemCount} SKU)
                </p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-[11px]">Lokasi Bongkar:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{s.destinationWarehouse}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                Standar Sampling AQL 1.5 Quality Control
              </span>

              {s.status !== 'received' ? (
                <button
                  onClick={() => receiveShipment(s.id)}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors self-start sm:self-auto min-h-[36px]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Konfirmasi Lulus QC & Masukkan Stok
                </button>
              ) : (
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Stok telah diupdate ke rak gudang
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
