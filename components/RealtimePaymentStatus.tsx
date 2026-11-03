// components/RealtimePaymentStatus.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Sparkles, Clock } from 'lucide-react';
import { OrderStatus } from '@/lib/types';
import { playSuccessChime } from './payment/paymentSound';
import { PaymentSuccessBanner } from './payment/PaymentSuccessBanner';
import { PaymentExpiredBanner } from './payment/PaymentExpiredBanner';

interface RealtimePaymentStatusProps {
  orderNumber: string;
  initialStatus: OrderStatus;
  paymentMethod?: string;
  amount?: number;
  onStatusChanged?: (newStatus: OrderStatus) => void;
  showDetails?: boolean;
}

export function RealtimePaymentStatus({
  orderNumber,
  initialStatus,
  paymentMethod = 'QRIS',
  onStatusChanged,
  showDetails = true,
}: RealtimePaymentStatusProps) {
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [justSettled, setJustSettled] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const audioPlayedRef = useRef(false);

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  // Local ticker countdown detik yang presisi
  useEffect(() => {
    if (remainingSeconds === null || remainingSeconds <= 0 || status !== 'Menunggu Pembayaran') return;
    const t = setInterval(() => {
      setRemainingSeconds((prev) => (prev && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [remainingSeconds, status]);

  // Real-time Polling Engine (CK-07: Tab-visibility aware)
  useEffect(() => {
    if (status !== 'Menunggu Pembayaran') {
      return;
    }

    let isMounted = true;

    const checkOrderStatus = async () => {
      if (typeof document !== 'undefined' && document.hidden) {
        return;
      }

      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}/status`, {
          cache: 'no-store',
        });
        if (!res.ok) return;

        const data = await res.json();
        if (!isMounted) return;

        setPollCount((prev) => prev + 1);

        if (data.remaining_ms !== undefined) {
          setRemainingSeconds(Math.floor(data.remaining_ms / 1000));
        }

        if (data.status === 'Dibatalkan' || data.expired) {
          setStatus('Dibatalkan');
          if (onStatusChanged) onStatusChanged('Dibatalkan');
          return;
        }

        if (data.success && (data.settled || data.status === 'Dibayar' || data.status === 'Selesai' || data.status === 'Dikemas')) {
          const newStatus = data.status || 'Dibayar';
          setStatus(newStatus);
          setJustSettled(true);

          if (!audioPlayedRef.current) {
            audioPlayedRef.current = true;
            playSuccessChime();
          }

          if (onStatusChanged) {
            onStatusChanged(newStatus);
          }

          fetch('/api/notifications/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderNumber }),
          }).catch(() => {});

          setTimeout(() => {
            if (typeof window !== 'undefined' && window.location.pathname.includes('/invoice/')) {
              window.location.reload();
            }
          }, 1800);
        }
      } catch {
        // Silent catch agar polling tidak terputus
      }
    };

    const interval = setInterval(checkOrderStatus, 2500);

    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && !document.hidden && isMounted) {
        checkOrderStatus();
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [orderNumber, status, onStatusChanged]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (status === 'Dibatalkan') {
    return <PaymentExpiredBanner orderNumber={orderNumber} />;
  }

  if (status === 'Dibayar' || status === 'Selesai' || status === 'Dikemas' || status === 'Dikirim') {
    return (
      <PaymentSuccessBanner
        orderNumber={orderNumber}
        justSettled={justSettled}
        showDetails={showDetails}
      />
    );
  }

  return (
    <div className="p-3.5 bg-zinc-50 border border-zinc-300 text-left space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-bold text-zinc-900 uppercase tracking-wider">
            Sistem Memantau Pembayaran (Real-Time)
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-400">
          <Loader2 size={12} className="animate-spin text-zinc-500" />
          <span>Sync #{pollCount}</span>
        </div>
      </div>

      {remainingSeconds !== null && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 flex items-center justify-between text-xs font-mono">
          <span className="flex items-center gap-1.5 text-amber-900 font-semibold">
            <Clock size={13} className="text-amber-700" />
            <span>Sisa Waktu Pembayaran:</span>
          </span>
          <span className="font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded text-xs tabular-nums">
            {formatTimer(remainingSeconds)}
          </span>
        </div>
      )}

      <p className="text-[11px] text-zinc-600 leading-relaxed">
        Silakan lakukan pembayaran lewat <strong>{paymentMethod}</strong>. Setelah berhasil dibayar, layar ini akan <strong>otomatis berganti lunas dari sistem</strong> tanpa perlu menekan tombol apapun.
      </p>

      <div className="p-2 bg-white border border-zinc-200 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
        <span className="flex items-center gap-1">
          <Sparkles size={11} className="text-[#E60012]" /> Auto-Settlement Daemon Aktif
        </span>
        <span className="text-zinc-600 font-semibold">Terkoneksi ke Server</span>
      </div>
    </div>
  );
}
