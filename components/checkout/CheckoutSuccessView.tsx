'use client';

import React, { useState } from 'react';
import { Order, BANK_ACCOUNTS } from '@/lib/types';
import {
  CheckCircle2,
  Printer,
  Truck,
  QrCode,
  Copy,
  Check,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { DynamicQRISCard } from '../DynamicQRISCard';
import { RealtimePaymentStatus } from '../RealtimePaymentStatus';

interface CheckoutSuccessViewProps {
  order: Order;
  onClose: () => void;
  onStatusChanged: (newStatus: Order['status']) => void;
}

export const CheckoutSuccessView: React.FC<CheckoutSuccessViewProps> = ({
  order,
  onClose,
  onStatusChanged,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedRekening, setCopiedRekening] = useState(false);
  const [copiedNominal, setCopiedNominal] = useState(false);

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(order.order_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyRekening = (noRek: string) => {
    navigator.clipboard.writeText(noRek);
    setCopiedRekening(true);
    setTimeout(() => setCopiedRekening(false), 2000);
  };

  const copyNominal = (nom: number) => {
    navigator.clipboard.writeText(String(nom));
    setCopiedNominal(true);
    setTimeout(() => setCopiedNominal(false), 2000);
  };

  return (
    <div className="space-y-5 text-center">
      {/* Success Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold uppercase">
        <CheckCircle2 size={16} />
        <span>Transaksi Berhasil Dibuat (Status: {order.status})</span>
      </div>

      {/* Order Number Box */}
      <div className="p-3 bg-zinc-100 border border-zinc-200 flex items-center justify-between text-left">
        <div>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">NOMOR PESANAN RESMI</p>
          <p className="text-sm font-black text-zinc-950 font-mono">{order.order_number}</p>
        </div>
        <button
          onClick={copyOrderNumber}
          className="px-2.5 py-1 text-xs font-semibold bg-white border border-zinc-300 hover:bg-zinc-50 flex items-center gap-1"
        >
          {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
          <span>{copied ? 'Tersalin' : 'Salin'}</span>
        </button>
      </div>

      {/* Payment Detail: Bank Transfer vs Dynamic QRIS */}
      {order.payment_method === 'Bank Transfer' ? (
        <div className="p-4 sm:p-5 bg-white border-2 border-zinc-900 text-left space-y-4 max-w-md mx-auto shadow-sm">
          <div className="flex items-center justify-between pb-2.5 border-b border-zinc-200">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-[#E60012]" />
              <span className="text-xs font-black uppercase text-zinc-950">
                {BANK_ACCOUNTS[order.bank_name || 'BCA']?.bankName || 'Transfer Bank'}
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase bg-zinc-100 text-zinc-700 px-2 py-0.5">
              0% Potongan Fee
            </span>
          </div>

          {/* Nomor Rekening Box */}
          <div className="p-3 bg-zinc-50 border border-zinc-200 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">NOMOR REKENING TUJUAN</p>
              <p className="text-base font-mono font-black text-zinc-950 tracking-wider">
                {BANK_ACCOUNTS[order.bank_name || 'BCA']?.accountNumber || '8830192844'}
              </p>
              <p className="text-[11px] text-zinc-600 font-medium pt-0.5">
                a.n. {BANK_ACCOUNTS[order.bank_name || 'BCA']?.holderName || 'URBANSTYLE STORE'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => copyRekening(BANK_ACCOUNTS[order.bank_name || 'BCA']?.accountNumber || '8830192844')}
              className="px-3 py-1.5 text-xs font-bold uppercase bg-zinc-900 text-white hover:bg-[#E60012] flex items-center gap-1 transition-colors"
            >
              {copiedRekening ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copiedRekening ? 'Tersalin' : 'Salin No. Rekening'}</span>
            </button>
          </div>

          {/* Total Nominal Tepat dengan Highlight 3 Digit Kode Unik */}
          <div className="p-3 bg-red-50 border border-red-200 text-center space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-800 block">
              JUMLAH TRANSFER TEPAT (WAJIB SESUAI 3 DIGIT TERAKHIR):
            </span>
            <div className="text-2xl font-black font-mono text-zinc-950 flex items-center justify-center gap-0.5">
              <span>Rp {Math.floor(order.total_amount / 1000).toLocaleString('id-ID')}.</span>
              <span className="bg-[#E60012] text-white px-1.5 py-0.5 font-black tracking-widest">
                {String(order.unique_code || (order.total_amount % 1000)).padStart(3, '0')}
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 pt-0.5">
              *Termasuk 3 digit kode unik pengenal transaksi otomatis (+Rp {order.unique_code || 0})
            </p>
            <button
              type="button"
              onClick={() => copyNominal(order.total_amount)}
              className="mt-2 w-full py-1.5 text-xs font-bold uppercase bg-white border border-red-300 hover:bg-red-100 text-red-700 flex items-center justify-center gap-1 transition-colors"
            >
              {copiedNominal ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              <span>{copiedNominal ? 'Nominal Tersalin!' : `Salin Total Tepat (Rp ${order.total_amount.toLocaleString('id-ID')})`}</span>
            </button>
          </div>

          {/* Notice Alert */}
          <div className="flex items-start gap-2 text-[10px] text-amber-800 bg-amber-50 p-2.5 border border-amber-200">
            <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-600" />
            <p>
              <strong>PENTING:</strong> Pastikan Anda mentransfer <strong>persis hingga 3 digit terakhir</strong>. Kode unik dikunci selama 2 jam agar mutasi rekening terverifikasi secara otomatis.
            </p>
          </div>
        </div>
      ) : (
        /* Dynamic QRIS Standar Bank Indonesia (EMVCo & CRC-16) */
        <DynamicQRISCard
          amount={order.total_amount}
          orderNumber={order.order_number}
        />
      )}

      {/* Pemantau Pembayaran Otomatis dari Sistem (Real-Time) */}
      <RealtimePaymentStatus
        orderNumber={order.order_number}
        initialStatus={order.status}
        paymentMethod={order.payment_method}
        amount={Number(order.total_amount)}
        onStatusChanged={onStatusChanged}
      />

      {/* Order Items Table Preview */}
      <div className="text-left border border-zinc-200 divide-y divide-zinc-200 text-xs">
        <div className="p-2.5 bg-zinc-50 font-bold text-zinc-700 uppercase flex justify-between">
          <span>Rincian Pakaian</span>
          <span>Subtotal</span>
        </div>
        {order.items.map((it, idx) => (
          <div key={idx} className="p-2.5 flex justify-between items-center">
            <div>
              <p className="font-bold text-zinc-900">{it.product_name}</p>
              <p className="text-[10px] text-zinc-500">{it.selected_color} • Size {it.selected_size} • Qty {it.quantity}</p>
            </div>
            <span className="font-semibold text-zinc-900">Rp {Number(it.subtotal).toLocaleString('id-ID')}</span>
          </div>
        ))}
        {order.discount_amount && order.discount_amount > 0 && (
          <div className="p-2.5 flex justify-between items-center text-green-700 font-semibold">
            <span>Diskon Kupon Promo:</span>
            <span>- Rp {Number(order.discount_amount).toLocaleString('id-ID')}</span>
          </div>
        )}
        <div className="p-2.5 bg-zinc-50 font-black text-zinc-950 flex justify-between text-sm">
          <span>TOTAL PEMBAYARAN:</span>
          <span className="text-[#E60012]">Rp {Number(order.total_amount).toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-2">
        <div className="grid grid-cols-2 gap-2">
          <a
            href={`/track/${order.order_number}`}
            className="py-3 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors rounded-none"
          >
            <Truck size={14} />
            <span>Lacak Pengiriman 🚚</span>
          </a>

          <a
            href={`/invoice/${order.order_number}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 bg-[#E60012] hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-xs rounded-none"
          >
            <QrCode size={14} />
            <span>Halaman Faktur ↗</span>
          </a>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={() => window.print()}
            className="flex-1 py-3 border border-zinc-300 hover:bg-zinc-100 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors rounded-none"
          >
            <Printer size={14} />
            <span>Cetak Nota</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-zinc-300 hover:border-black text-xs font-bold uppercase tracking-wider transition-colors rounded-none"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
