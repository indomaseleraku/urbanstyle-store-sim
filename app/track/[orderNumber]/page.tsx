'use client';

// app/track/[orderNumber]/page.tsx
// Halaman Live Tracking Pengiriman Logistik & Resi Ekspedisi

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { dataStore } from '@/lib/store';
import { Order, TrackingEvent } from '@/lib/types';
import { 
  Truck, 
  Package, 
  MapPin, 
  ArrowLeft, 
  FileText, 
  RotateCw,
  Copy,
  Check
} from 'lucide-react';
import TrackingStepper from '@/components/tracking/TrackingStepper';
import TrackingTimeline from '@/components/tracking/TrackingTimeline';

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const resolvedParams = use(params);
  const orderNumber = resolvedParams.orderNumber;

  const [order, setOrder] = useState<Order | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [courier, setCourier] = useState('J&T Express');
  const [trackingNumber, setTrackingNumber] = useState('-');
  const [isLoading, setIsLoading] = useState(true);
  const [copiedResi, setCopiedResi] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    const result = await dataStore.getOrderTracking(orderNumber);
    if (result.order) {
      setOrder(result.order);
      setCurrentStep(result.currentStep);
      setEvents(result.events);
      setCourier(result.courier);
      setTrackingNumber(result.trackingNumber);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [orderNumber]);

  const handleCopyResi = () => {
    if (trackingNumber && trackingNumber !== '-') {
      navigator.clipboard.writeText(trackingNumber);
      setCopiedResi(true);
      setTimeout(() => setCopiedResi(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <RotateCw className="w-8 h-8 animate-spin mx-auto text-zinc-400" />
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
            Memuat Data Pelacakan Paket...
          </p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-zinc-200 p-8 text-center space-y-4">
          <Package className="w-12 h-12 mx-auto text-zinc-400" />
          <h1 className="text-base font-bold uppercase tracking-tight text-zinc-950">
            Pesanan Tidak Ditemukan
          </h1>
          <p className="text-xs text-zinc-500">
            Nomor pesanan <span className="font-mono font-bold text-black">{orderNumber}</span> tidak terdaftar dalam basis data sistem.
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-black transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Toko</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#E60012] text-white font-black text-xs flex items-center justify-center">
              US
            </div>
            <span className="font-black text-sm uppercase tracking-tight text-zinc-950">
              Pelacakan Pengiriman
            </span>
          </div>

          <Link
            href={`/invoice/${order.order_number}`}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-zinc-100 hover:bg-black hover:text-white px-3 py-1.5 transition-colors"
          >
            <FileText size={14} />
            <span className="hidden sm:inline">Nota Faktur</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full px-4 py-8 flex-1 space-y-6">
        {/* Card Info Resi */}
        <div className="bg-white border border-zinc-200 p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-zinc-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">NOMOR PESANAN</span>
                <span className="text-sm font-mono font-bold text-zinc-950">{order.order_number}</span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Dipesan oleh: <span className="font-semibold text-black">{order.customer_name}</span> pada {new Date(order.created_at).toLocaleDateString('id-ID')}
              </p>
            </div>

            <button
              onClick={loadData}
              className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-600 hover:text-black border border-zinc-200 px-2.5 py-1.5 bg-zinc-50 cursor-pointer"
            >
              <RotateCw size={13} />
              <span>Segarkan</span>
            </button>
          </div>

          {/* Banner Ekspedisi & Nomor Resi */}
          <div className="p-4 bg-zinc-50 border border-zinc-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center">
                <Truck size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Kurir Pengiriman</p>
                <p className="text-sm font-bold text-zinc-950">{courier}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Nomor Resi Resmi</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-bold text-zinc-950">{trackingNumber}</span>
                {trackingNumber !== '-' && !trackingNumber.includes('Menunggu') && (
                  <button
                    onClick={handleCopyResi}
                    className="p-1 text-zinc-500 hover:text-black cursor-pointer"
                    title="Salin Resi"
                  >
                    {copiedResi ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  </button>
                )}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Status Saat Ini</p>
              <span className="inline-block mt-0.5 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-black text-white">
                {order.status}
              </span>
            </div>
          </div>

          {/* Stepper Progress Visual 5 Tahap */}
          <TrackingStepper currentStep={currentStep} />

          {/* Timeline Riwayat Perjalanan Paket */}
          <TrackingTimeline events={events} />

          {/* Alamat Pengiriman */}
          <div className="p-4 bg-zinc-50 border border-zinc-200 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-950">
              <MapPin size={14} />
              <span>Alamat Tujuan Pengiriman</span>
            </div>
            <p className="text-xs text-zinc-700 font-medium">{order.customer_name} ({order.customer_phone})</p>
            <p className="text-xs text-zinc-600">{order.customer_address}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
