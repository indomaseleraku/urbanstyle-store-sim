'use client';

// app/account/orders/page.tsx
// Riwayat Pesanan Digital Pengguna (Digital Orders History & Invoice Access)

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { dataStore } from '@/lib/store';
import { Order } from '@/lib/types';
import { Package, Truck, FileText, ArrowRight, Clock } from 'lucide-react';

export default function AccountOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      if (user) {
        const allOrders = await dataStore.getOrders(user.id);
        setOrders(allOrders);
      }
      setIsLoading(false);
    }
    loadOrders();
  }, [user]);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Dibayar':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Dikemas':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Dikirim':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Selesai':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Menunggu Pembayaran':
      default:
        return 'bg-zinc-100 text-zinc-800 border-zinc-200';
    }
  };

  return (
    <div className="bg-white border border-zinc-200 p-6 sm:p-8 space-y-6">
      <div>
        <h1 className="text-lg font-black uppercase tracking-tight text-zinc-950">
          Riwayat Pesanan Member
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Pantau status pemrosesan paket pakaian, unduh nota faktur digital, dan lacak ekspedisi kurir.
        </p>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-zinc-400">
          Memuat riwayat pesanan...
        </div>
      ) : orders.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-zinc-300 space-y-3">
          <Package className="w-8 h-8 mx-auto text-zinc-400" />
          <p className="text-xs font-semibold text-zinc-700">Belum ada riwayat pesanan.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-1 px-4 py-2 bg-black hover:bg-[#E60012] text-white text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <span>Mulai Belanja Koleksi LifeWear</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div key={ord.id} className="border border-zinc-200 divide-y divide-zinc-100">
              {/* Order Header */}
              <div className="p-4 bg-zinc-50 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-mono block">KODE PESANAN</span>
                    <span className="font-mono font-bold text-zinc-950">{ord.order_number}</span>
                  </div>
                  <span className="text-zinc-300">|</span>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-mono block">TANGGAL</span>
                    <span className="font-medium text-zinc-700">{new Date(ord.created_at).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(ord.status)}`}>
                    {ord.status}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-4 divide-y divide-zinc-100 bg-white">
                {ord.items.map((item, idx) => (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <p className="font-bold text-zinc-950 leading-snug">{item.product_name}</p>
                      <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-zinc-500 font-mono">
                        <span className="bg-zinc-100 px-1.5 py-0.5 text-zinc-700 font-medium">
                          {item.selected_color}
                        </span>
                        <span>•</span>
                        <span className="bg-zinc-100 px-1.5 py-0.5 text-zinc-700 font-bold">
                          Ukuran: {item.selected_size}
                        </span>
                        <span>•</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-zinc-950 shrink-0 text-right">
                      Rp {new Intl.NumberFormat('id-ID').format(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Footer & Actions */}
              <div className="p-4 bg-zinc-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-mono block tracking-wider">TOTAL PEMBAYARAN</span>
                  <span className="text-base font-black text-zinc-950 font-mono">
                    Rp {new Intl.NumberFormat('id-ID').format(ord.total_amount)}
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Link
                    href={`/track/${ord.order_number}`}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 border border-zinc-300 hover:border-black bg-white text-xs font-bold uppercase tracking-wider text-zinc-800 transition-colors rounded-none min-h-[38px]"
                  >
                    <Truck size={14} />
                    <span>Lacak Paket</span>
                  </Link>

                  <Link
                    href={`/invoice/${ord.order_number}`}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-black hover:bg-[#E60012] text-white text-xs font-bold uppercase tracking-wider transition-colors rounded-none min-h-[38px]"
                  >
                    <FileText size={14} />
                    <span>Lihat Nota</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
