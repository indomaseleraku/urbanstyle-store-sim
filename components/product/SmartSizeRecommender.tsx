'use client';

import React, { useState, useMemo } from 'react';
import { Sparkles, Check, ArrowRight } from 'lucide-react';

interface SmartSizeRecommenderProps {
  isPants: boolean;
  onApplySize?: (size: string) => void;
}

export default function SmartSizeRecommender({ isPants, onApplySize }: SmartSizeRecommenderProps) {
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(65);
  const [fitPreference, setFitPreference] = useState<'slim' | 'regular' | 'relaxed'>('regular');
  const [applied, setApplied] = useState(false);

  const recommendation = useMemo(() => {
    // Base BMI and garment sizing model
    const bmi = weight / Math.pow(height / 100, 2);

    let baseSize: 'S' | 'M' | 'L' | 'XL' = 'M';
    let matchRate = 90;

    if (isPants) {
      // Sizing for pants based on weight/waist estimation
      if (weight < 58) baseSize = 'S';
      else if (weight <= 68) baseSize = 'M';
      else if (weight <= 78) baseSize = 'L';
      else baseSize = 'XL';
    } else {
      // Sizing for tops (shirts, tees, outerwear)
      if (bmi < 20.5) baseSize = 'S';
      else if (bmi < 24.0) baseSize = 'M';
      else if (bmi < 27.5) baseSize = 'L';
      else baseSize = 'XL';

      // Height compensation
      if (height >= 180 && baseSize === 'S') baseSize = 'M';
      if (height >= 185 && baseSize === 'M') baseSize = 'L';
    }

    // Apply fit preference modifier
    const sizeOrder: ('S' | 'M' | 'L' | 'XL')[] = ['S', 'M', 'L', 'XL'];
    let idx = sizeOrder.indexOf(baseSize);

    if (fitPreference === 'slim' && idx > 0) {
      idx -= 1;
      matchRate = 88;
    } else if (fitPreference === 'relaxed' && idx < sizeOrder.length - 1) {
      idx += 1;
      matchRate = 93;
    } else {
      matchRate = 95;
    }

    return {
      size: sizeOrder[idx],
      confidence: matchRate,
      fitLabel:
        fitPreference === 'slim'
          ? 'Pas Badan (Siluet Ramping)'
          : fitPreference === 'relaxed'
          ? 'Santai & Lapang (Relaxed Fit)'
          : 'Standar LifeWear (True to Size)',
    };
  }, [height, weight, fitPreference, isPants]);

  const handleApply = () => {
    if (onApplySize) {
      onApplySize(recommendation.size);
      setApplied(true);
      setTimeout(() => setApplied(false), 2000);
    }
  };

  return (
    <div className="space-y-4 bg-zinc-50 border border-zinc-200 p-4 sm:p-5 text-xs">
      <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wide text-zinc-950">
          <Sparkles size={14} className="text-[#E60012]" />
          <span>Kalkulator Rekomendasi Ukuran Cerdas</span>
        </div>
        <span className="text-[10px] bg-red-100 text-[#E60012] px-2 py-0.5 font-mono font-bold">
          LifeWear Smart Fit
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Height Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between font-bold text-zinc-700">
            <span>Tinggi Badan:</span>
            <span className="font-mono text-zinc-950">{height} cm</span>
          </div>
          <input
            type="range"
            min={145}
            max={195}
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="w-full accent-[#E60012] cursor-pointer"
          />
        </div>

        {/* Weight Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between font-bold text-zinc-700">
            <span>Berat Badan:</span>
            <span className="font-mono text-zinc-950">{weight} kg</span>
          </div>
          <input
            type="range"
            min={40}
            max={110}
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-full accent-[#E60012] cursor-pointer"
          />
        </div>
      </div>

      {/* Fit Preference Pills */}
      <div className="space-y-1.5 pt-1">
        <label className="font-bold text-zinc-700 uppercase tracking-wider text-[10px] block">
          Preferensi Siluet Potongan:
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'slim', label: 'Slim / Pas' },
            { id: 'regular', label: 'Regular Uniqlo' },
            { id: 'relaxed', label: 'Relaxed / Santai' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFitPreference(f.id as any)}
              className={`py-2 px-2 border text-center font-bold text-[11px] transition-all rounded-none cursor-pointer ${
                fitPreference === f.id
                  ? 'bg-zinc-950 text-white border-zinc-950'
                  : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-400'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Result Card */}
      <div className="p-3.5 bg-white border-2 border-zinc-950 flex items-center justify-between gap-3 shadow-xs">
        <div>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
            Rekomendasi Ukuran Terbaik Anda:
          </span>
          <div className="flex items-baseline gap-2 pt-0.5">
            <span className="text-2xl font-black font-mono text-[#E60012]">{recommendation.size}</span>
            <span className="text-[11px] text-zinc-600 font-medium">({recommendation.fitLabel})</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold block pt-0.5">
            ✓ {recommendation.confidence}% Tingkat Kecocokan dengan Postur Anda
          </span>
        </div>

        {onApplySize && (
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 bg-zinc-950 hover:bg-[#E60012] text-white font-bold uppercase text-[11px] tracking-wider transition-colors shrink-0 flex items-center gap-1.5 rounded-none cursor-pointer"
          >
            {applied ? (
              <>
                <Check size={14} className="text-emerald-400" />
                <span>Terpilih!</span>
              </>
            ) : (
              <>
                <span>Pilih {recommendation.size}</span>
                <ArrowRight size={13} />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
