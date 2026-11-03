// components/tracking/TrackingStepper.tsx
'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface TrackingStepperProps {
  currentStep: number;
}

const STEPS_LIST = [
  { step: 1, title: 'Pesanan Dibuat' },
  { step: 2, title: 'Dibayar' },
  { step: 3, title: 'Dikemas' },
  { step: 4, title: 'Dikirim' },
  { step: 5, title: 'Selesai' },
];

export default function TrackingStepper({ currentStep }: TrackingStepperProps) {
  return (
    <div className="py-4">
      <div className="relative">
        {/* Line connector track and progress */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-zinc-200 z-0">
          <div 
            className="h-full bg-[#E60012] transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (STEPS_LIST.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps icons */}
        <div className="relative z-10 flex justify-between">
          {STEPS_LIST.map((item) => {
            const isDone = currentStep >= item.step;
            const isCurrent = currentStep === item.step;
            return (
              <div key={item.step} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  isDone
                    ? 'bg-[#E60012] text-white shadow-xs'
                    : 'bg-white border-2 border-zinc-300 text-zinc-400'
                }`}>
                  {isDone ? <Check size={14} /> : item.step}
                </div>
                <span className={`w-14 sm:w-20 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider mt-2 text-center leading-tight line-clamp-2 ${
                  isCurrent ? 'text-[#E60012] font-black' : isDone ? 'text-zinc-900' : 'text-zinc-400'
                }`}>
                  {item.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
