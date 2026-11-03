// components/admin/modals/InvoiceModal.tsx
'use client';

import React from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { Printer, X, Building2 } from 'lucide-react';

export const InvoiceModal: React.FC = () => {
  const { selectedInvoiceOrder, setSelectedInvoiceOrder, formatRupiah } = useAdminSuite();

  if (!selectedInvoiceOrder) return null;
  const o = selectedInvoiceOrder;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-lg max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 transition-colors">
        {/* Modal Top Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <Building2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Faktur Pembelian Resmi E-Commerce</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-900 dark:bg-slate-750 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Faktur
            </button>
            <button
              onClick={() => setSelectedInvoiceOrder(null)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-8 text-xs text-slate-800 dark:text-slate-200 space-y-6 bg-white dark:bg-slate-900" id="printable-invoice">
          {/* Header */}
          <div className="flex justify-between items-start pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-black dark:bg-white text-white dark:text-black font-black flex items-center justify-center text-sm">
                  U
                </div>
                <div>
                  <h1 className="font-bold text-base text-slate-900 dark:text-white tracking-tight">URBANSTYLE LIFEWEAR</h1>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">PT URBANSTYLE BUSANA NUSANTARA</p>
                </div>
              </div>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-[11px] leading-relaxed">
                Jl. Surya Kencana No. 1, Pamulang Barat, Tangerang Selatan 15417<br />
                NPWP: 01.882.912.4-013.000 · Telp: +62 21 741-2566
              </p>
            </div>

            <div className="text-right">
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-wider">FAKTUR / INVOICE</h2>
              <p className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-1">{o.orderNumber}</p>
              <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{o.createdAt}</p>
              <div className="mt-2 inline-block px-2.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-[10px]">
                STATUS: LUNAS ({o.paymentMethod.toUpperCase()})
              </div>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Ditagihkan Kepada:</p>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{o.customerName}</p>
              <p className="text-slate-600 dark:text-slate-300 mt-0.5">{o.customerPhone}</p>
              <p className="text-slate-600 dark:text-slate-400">{o.customerEmail}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Alamat Pengiriman:</p>
              <p className="text-slate-700 dark:text-slate-200 leading-relaxed">{o.shippingAddress}</p>
              <p className="font-semibold text-slate-900 dark:text-white mt-1">{o.city}</p>
              <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px] mt-0.5">Ekspedisi: {o.courier} {o.trackingNumber ? `(${o.trackingNumber})` : ''}</p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b-2 border-slate-900 dark:border-slate-100 text-slate-900 dark:text-white">
                <th className="py-2.5 font-bold">Deskripsi Busana</th>
                <th className="py-2.5 font-bold font-mono">SKU</th>
                <th className="py-2.5 font-bold text-right font-mono">Harga Satuan</th>
                <th className="py-2.5 font-bold text-center font-mono">Qty</th>
                <th className="py-2.5 font-bold text-right font-mono">Jumlah (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {o.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3 font-semibold text-slate-900 dark:text-white">{item.name}</td>
                  <td className="py-3 font-mono text-slate-500 dark:text-slate-400">{item.sku}</td>
                  <td className="py-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">{formatRupiah(item.price)}</td>
                  <td className="py-3 text-center font-mono text-slate-700 dark:text-slate-300">{item.quantity}</td>
                  <td className="py-3 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                    {formatRupiah(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Calculation summary */}
          <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal Barang:</span>
                <span className="font-mono tabular-nums text-slate-900 dark:text-slate-100">{formatRupiah(o.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Ongkos Kirim ({o.courier}):</span>
                <span className="font-mono tabular-nums text-slate-900 dark:text-slate-100">{formatRupiah(o.shippingCost)}</span>
              </div>
              {o.discount > 0 && (
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                  <span>Diskon Promo Kupon:</span>
                  <span className="font-mono tabular-nums">-{formatRupiah(o.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>PPN 11% (Termasuk):</span>
                <span className="font-mono tabular-nums text-slate-900 dark:text-slate-100">{formatRupiah(Math.round(o.total * 0.11 / 1.11))}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 dark:text-white text-sm pt-2 border-t border-slate-900 dark:border-slate-700">
                <span>TOTAL AKHIR:</span>
                <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400">{formatRupiah(o.total)}</span>
              </div>
            </div>
          </div>

          {/* Footer Notes */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 text-center space-y-1">
            <p>Terima kasih atas kepercayaan Anda berbelanja koleksi busana di UrbanStyle LifeWear.</p>
            <p>Faktur ini sah diterbitkan secara elektronik dan diakui sebagai bukti transaksi yang valid.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
