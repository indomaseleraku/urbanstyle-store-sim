// components/admin/modals/PackingSlipModal.tsx
'use client';

import React from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { Printer, X, Truck } from 'lucide-react';

export const PackingSlipModal: React.FC = () => {
  const { selectedPackingOrder, setSelectedPackingOrder } = useAdminSuite();

  if (!selectedPackingOrder) return null;
  const o = selectedPackingOrder;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-lg max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 transition-colors">
        {/* Top Control Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Label Pengiriman & Slip Packing Gudang</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Label
            </button>
            <button
              onClick={() => setSelectedPackingOrder(null)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thermal Label Body */}
        <div className="p-6 font-mono text-xs text-slate-900 dark:text-slate-100 border-4 border-dashed border-slate-300 dark:border-slate-700 m-4 rounded-lg bg-white dark:bg-slate-950 space-y-4">
          {/* Courier Header */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900 dark:border-slate-200">
            <div>
              <span className="text-base font-black tracking-tight">{o.courier.toUpperCase()}</span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">STANDARD REGULER DISPATCH</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{o.city.toUpperCase()}</span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">DC-1 CIKARANG</p>
            </div>
          </div>

          {/* Barcode Graphic Mockup */}
          <div className="py-2 text-center bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
            <div className="h-10 flex items-center justify-center gap-1 px-4">
              {Array.from({ length: 38 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-slate-900 dark:bg-slate-100 h-full"
                  style={{
                    width: (i % 3 === 0 ? '3px' : i % 5 === 0 ? '4px' : '1.5px'),
                    margin: '0 1px'
                  }}
                />
              ))}
            </div>
            <p className="text-xs font-bold tracking-widest mt-1 text-slate-900 dark:text-slate-100">
              {o.trackingNumber || `RES-${o.orderNumber.replace(/[^0-9]/g, '')}-99`}
            </p>
          </div>

          {/* Recipient & Sender */}
          <div className="space-y-3 font-sans text-xs">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">PENERIMA:</p>
              <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{o.customerName}</p>
              <p className="text-slate-700 dark:text-slate-300 mt-0.5 font-mono">{o.customerPhone}</p>
              <p className="text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">{o.shippingAddress}, {o.city}</p>
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">PENGIRIM:</p>
              <p className="font-bold text-slate-900 dark:text-white">UrbanStyle Fulfillment Center</p>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">Kawasan Industri Cikarang Blok C-12, Bekasi (+62 21 8892-1000)</p>
            </div>
          </div>

          {/* Picking Checklist */}
          <div className="pt-2 border-t border-slate-300 dark:border-slate-700 font-sans">
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              DAFTAR PICKING ITEM (QC CHECKLIST):
            </p>
            <div className="space-y-1.5 text-xs">
              {o.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded text-blue-600 dark:accent-blue-500 cursor-pointer" />
                    <span className="font-medium text-slate-900 dark:text-white">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{item.quantity} pcs</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 text-[10px] text-center text-slate-400 dark:text-slate-500 font-sans">
            Instruksi: Jangan dibanting · Hindari panas & air
          </div>
        </div>
      </div>
    </div>
  );
};
