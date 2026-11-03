// components/invoice/InvoicePaymentSection.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Truck, AlertCircle } from 'lucide-react';
import { Order, BANK_ACCOUNTS } from '@/lib/types';
import { CopyButton } from '@/components/InvoiceActions';
import { DynamicQRISCard } from '@/components/DynamicQRISCard';
import { RealtimePaymentStatus } from '@/components/RealtimePaymentStatus';

interface InvoicePaymentSectionProps {
  order: Order;
}

export default function InvoicePaymentSection({ order }: InvoicePaymentSectionProps) {
  const selectedBank = order.bank_name ? BANK_ACCOUNTS[order.bank_name] : BANK_ACCOUNTS['BCA'];
  const isPaid =
    order.status === 'Dibayar' ||
    order.status === 'Selesai' ||
    order.status === 'Dikemas' ||
    order.status === 'Dikirim';

  if (isPaid) {
    return (
      <div className="p-5 border-2 border-emerald-600 bg-emerald-50/60 text-left space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={20} className="text-emerald-700" />
            <span className="text-xs font-black uppercase text-emerald-900 tracking-wider">
              Bukti Pembayaran Sah (Lunas)
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold bg-emerald-600 text-white px-2 py-0.5 uppercase">
            {order.status}
          </span>
        </div>

        <div className="p-3.5 bg-white border border-emerald-200 space-y-2 text-xs">
          <div className="flex justify-between text-zinc-600">
            <span>Metode Pembayaran:</span>
            <span className="font-bold text-zinc-950 font-mono">
              {order.payment_method}
              {order.bank_name ? ` (${order.bank_name})` : ''}
            </span>
          </div>
          <div className="flex justify-between text-zinc-600">
            <span>Total Terverifikasi:</span>
            <span className="font-black text-emerald-700 font-mono">
              Rp {Number(order.total_amount).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex justify-between text-zinc-600">
            <span>Verifikasi Sistem:</span>
            <span className="font-semibold text-emerald-700">Otomatis / Real-Time TPS</span>
          </div>
        </div>

        <div className="p-2.5 bg-emerald-100/70 border border-emerald-300 text-[11px] text-emerald-800 space-y-1">
          <p className="font-bold">✓ Transaksi Telah Diterima</p>
          <p>Pesanan Anda telah diteruskan ke tim gudang untuk pengemasan dan pembuatan nomor resi ekspedisi.</p>
        </div>

        <Link
          href={`/track/${order.order_number}`}
          className="w-full py-2.5 bg-zinc-950 hover:bg-[#E60012] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Truck size={14} />
          <span>Lacak Pengiriman Pesanan</span>
        </Link>
      </div>
    );
  }

  if (order.payment_method === 'Bank Transfer') {
    return (
      <div className="p-4 border border-zinc-200 bg-zinc-50/70 text-left space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-600">
            Instruksi Transfer Bank Manual
          </span>
          <span className="text-[10px] font-bold text-[#E60012] uppercase font-mono">
            Bank {order.bank_name || 'BCA'}
          </span>
        </div>

        <div className="p-3 bg-white border border-zinc-200 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-zinc-500 font-semibold uppercase">Nomor Rekening Tujuan</p>
              <p className="font-mono font-black text-sm tracking-wider text-zinc-900">
                {selectedBank?.accountNumber || '8830-9912-4411'}
              </p>
              <p className="text-[10px] text-zinc-500 font-bold">
                a/n {selectedBank?.holderName || 'KIMY EKA ARDIANSYAH / URBANSTYLE'}
              </p>
            </div>
            <CopyButton
              textToCopy={selectedBank?.accountNumber?.replace(/[^0-9]/g, '') || '883099124411'}
              label="Salin No. Rek"
              successLabel="Tersalin!"
              className="px-2.5 py-1.5 text-xs font-bold uppercase bg-zinc-100 hover:bg-zinc-200 text-zinc-800 flex items-center gap-1 border border-zinc-300 transition-colors cursor-pointer"
            />
          </div>

          <div className="p-2.5 bg-red-50/80 border border-red-200">
            <p className="text-[10px] text-red-700 font-bold uppercase">Nominal Tepat Transfer (Wajib Sama Persis):</p>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-sm font-black text-zinc-800">Rp</span>
              <span className="text-lg font-black text-zinc-950 font-mono tracking-tight">
                {Math.floor(Number(order.total_amount) / 1000).toLocaleString('id-ID')}.
              </span>
              <span className="text-xl font-black text-[#E60012] font-mono px-1 bg-red-100 border border-red-300">
                {String(order.unique_code || (Number(order.total_amount) % 1000)).padStart(3, '0')}
              </span>
            </div>
            <p className="text-[10px] text-zinc-500">
              Termasuk kode unik 3 digit (<strong className="text-red-700">+{order.unique_code || 0}</strong>) untuk verifikasi mutasi otomatis.
            </p>
            <CopyButton
              textToCopy={String(order.total_amount)}
              label={`Salin Total (Rp ${Number(order.total_amount).toLocaleString('id-ID')})`}
              successLabel="Nominal Tersalin!"
              className="mt-2 w-full py-1.5 text-xs font-bold uppercase bg-white border border-red-300 hover:bg-red-100 text-red-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
            />
          </div>
        </div>

        <div className="p-2.5 bg-amber-50 border border-amber-200 text-[10px] text-amber-800 space-y-1">
          <div className="flex items-center gap-1 font-bold text-amber-900">
            <AlertCircle size={12} className="shrink-0" />
            <span>PERHATIAN TRANSFER:</span>
          </div>
          <p>• Transfer tepat hingga 3 digit terakhir agar mutasi terbaca otomatis oleh sistem.</p>
          <p>• Rekening diverifikasi dalam 2 jam sejak pesanan dibuat.</p>
        </div>

        <RealtimePaymentStatus
          orderNumber={order.order_number}
          initialStatus={order.status}
          paymentMethod={order.payment_method}
          amount={Number(order.total_amount)}
        />
      </div>
    );
  }

  // QRIS Payment View
  return (
    <div className="space-y-3">
      <DynamicQRISCard
        amount={Number(order.total_amount)}
        orderNumber={order.order_number}
      />
      <RealtimePaymentStatus
        orderNumber={order.order_number}
        initialStatus={order.status}
        paymentMethod={order.payment_method}
        amount={Number(order.total_amount)}
      />
    </div>
  );
}
