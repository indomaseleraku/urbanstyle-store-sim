// components/tracking/TrackingTimeline.tsx
'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { TrackingEvent } from '@/lib/types';

interface TrackingTimelineProps {
  events: TrackingEvent[];
}

export default function TrackingTimeline({ events }: TrackingTimelineProps) {
  return (
    <div className="space-y-4 pt-6 border-t border-zinc-200">
      <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-950 flex items-center gap-2">
        <Clock size={15} />
        <span>Riwayat Perjalanan Paket (Tracking Log)</span>
      </h2>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200">
        {events.map((evt, idx) => (
          <div key={idx} className="relative group">
            <div
              className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 ${
                evt.is_completed
                  ? 'bg-[#E60012] border-white ring-2 ring-[#E60012]'
                  : 'bg-zinc-200 border-white'
              }`}
            />
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3
                  className={`text-xs font-bold uppercase tracking-wider ${
                    evt.is_completed ? 'text-zinc-950' : 'text-zinc-400'
                  }`}
                >
                  {evt.title}
                </h3>
                <span className="text-[10px] font-mono text-zinc-400">{evt.timestamp}</span>
              </div>
              <p className={`text-xs mt-0.5 ${evt.is_completed ? 'text-zinc-600' : 'text-zinc-400'}`}>
                {evt.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
