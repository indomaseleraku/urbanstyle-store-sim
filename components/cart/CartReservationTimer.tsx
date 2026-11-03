'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function CartReservationTimer() {
  const [secondsLeft, setSecondsLeft] = useState(900); // 15:00 minutes

  useEffect(() => {
    // Check existing timer in sessionStorage
    const stored = sessionStorage.getItem('urbanstyle_cart_timer');
    const now = Math.floor(Date.now() / 1000);

    if (stored) {
      const expiry = parseInt(stored, 10);
      const diff = expiry - now;
      if (diff > 0) {
        setSecondsLeft(diff);
      } else {
        // Reset 15 mins
        sessionStorage.setItem('urbanstyle_cart_timer', String(now + 900));
        setSecondsLeft(900);
      }
    } else {
      sessionStorage.setItem('urbanstyle_cart_timer', String(now + 900));
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Reset cycle
          const resetTime = Math.floor(Date.now() / 1000) + 900;
          sessionStorage.setItem('urbanstyle_cart_timer', String(resetTime));
          return 900;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isUrgent = secondsLeft < 180;

  return (
    <div
      className={`px-4 py-2 border-b flex items-center justify-between text-[11px] font-medium transition-colors ${
        isUrgent
          ? 'bg-red-50 border-red-200 text-[#E60012]'
          : 'bg-zinc-900 border-zinc-800 text-zinc-300'
      }`}
    >
      <div className="flex items-center gap-1.5">
        <Clock size={13} className={isUrgent ? 'animate-pulse text-[#E60012]' : 'text-zinc-400'} />
        <span>Stok Terkunci Sementara:</span>
      </div>
      <div className="flex items-center gap-1 font-mono font-bold">
        <span
          className={`px-1.5 py-0.5 rounded-none tabular-nums ${
            isUrgent ? 'bg-[#E60012] text-white' : 'bg-zinc-800 text-white'
          }`}
        >
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
        <span className="text-[10px] text-zinc-400 font-sans font-normal hidden sm:inline">menit</span>
      </div>
    </div>
  );
}
