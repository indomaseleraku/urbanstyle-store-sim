// components/SizeChartModal.tsx
'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, Sparkles } from 'lucide-react';
import { SizeMeasurement } from '@/lib/types';
import SmartSizeRecommender from './product/SmartSizeRecommender';

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  categoryName?: string;
  measurements?: SizeMeasurement[];
  onSelectSize?: (size: string) => void;
}

export default function SizeChartModal({
  isOpen,
  onClose,
  productName,
  categoryName,
  measurements,
  onSelectSize,
}: SizeChartModalProps) {
  const [activeTab, setActiveTab] = useState<'cm' | 'recommender' | 'panduan'>('cm');

  if (!isOpen) return null;

  const isPants =
    categoryName?.toLowerCase().includes('celana') ||
    productName?.toLowerCase().includes('celana') ||
    productName?.toLowerCase().includes('shorts');

  const defaultTopMeasurements: SizeMeasurement[] = [
    { size: 'S', chest_width: 53, body_length: 70, sleeve_length: 59, shoulder_width: 46 },
    { size: 'M', chest_width: 56, body_length: 72, sleeve_length: 60.5, shoulder_width: 47.5 },
    { size: 'L', chest_width: 59, body_length: 74, sleeve_length: 62, shoulder_width: 49 },
    { size: 'XL', chest_width: 63, body_length: 76, sleeve_length: 63.5, shoulder_width: 51 },
  ];

  const defaultBottomMeasurements: SizeMeasurement[] = [
    { size: 'S', chest_width: 0, body_length: 93, sleeve_length: 0, shoulder_width: 0, waist: 72 },
    { size: 'M', chest_width: 0, body_length: 95, sleeve_length: 0, shoulder_width: 0, waist: 76 },
    { size: 'L', chest_width: 0, body_length: 97, sleeve_length: 0, shoulder_width: 0, waist: 82 },
    { size: 'XL', chest_width: 0, body_length: 99, sleeve_length: 0, shoulder_width: 0, waist: 88 },
  ];

  const displayData =
    measurements && measurements.length > 0
      ? measurements
      : isPants
      ? defaultBottomMeasurements
      : defaultTopMeasurements;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-zinc-300 w-full max-w-2xl overflow-hidden shadow-2xl rounded-none">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#E60012] text-white flex items-center justify-center font-black text-xs rounded-none">
              尺
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#E60012] uppercase tracking-widest">
                STANDAR RESMI LIFEWEAR
              </span>
              <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-zinc-950">
                Panduan Ukuran (Size Guide)
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200 pb-3 gap-2">
            <div>
              <p className="text-xs font-bold text-zinc-900 uppercase">{productName}</p>
              <p className="text-[11px] text-zinc-500">Toleransi pengukuran fisik konveksi ± 1-1.5 cm</p>
            </div>

            {/* Tabs */}
            <div className="flex border border-zinc-300 text-xs font-bold uppercase rounded-none overflow-hidden shrink-0">
              <button
                onClick={() => setActiveTab('cm')}
                className={`px-3 py-1.5 cursor-pointer ${
                  activeTab === 'cm' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                Tabel (cm)
              </button>
              <button
                onClick={() => setActiveTab('recommender')}
                className={`px-3 py-1.5 flex items-center gap-1 cursor-pointer ${
                  activeTab === 'recommender'
                    ? 'bg-[#E60012] text-white'
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                <Sparkles size={12} />
                <span>Rekomendasi</span>
              </button>
              <button
                onClick={() => setActiveTab('panduan')}
                className={`px-3 py-1.5 cursor-pointer ${
                  activeTab === 'panduan' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                Cara Ukur
              </button>
            </div>
          </div>

          {activeTab === 'cm' && (
            <div className="border border-zinc-200 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-100 border-b border-zinc-200 text-zinc-800 font-bold uppercase text-[11px]">
                    <th className="p-3">Ukuran</th>
                    {!isPants ? (
                      <>
                        <th className="p-3 text-center">Lebar Dada</th>
                        <th className="p-3 text-center">Panjang Baju</th>
                        <th className="p-3 text-center">Panjang Lengan</th>
                        <th className="p-3 text-center">Lebar Bahu</th>
                      </>
                    ) : (
                      <>
                        <th className="p-3 text-center">Lingkar Pinggang</th>
                        <th className="p-3 text-center">Panjang Celana</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 font-mono">
                  {displayData.map((m, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50">
                      <td className="p-3 font-bold font-sans text-zinc-950 bg-zinc-50/50">{m.size}</td>
                      {!isPants ? (
                        <>
                          <td className="p-3 text-center">{m.chest_width} cm</td>
                          <td className="p-3 text-center">{m.body_length} cm</td>
                          <td className="p-3 text-center">{m.sleeve_length} cm</td>
                          <td className="p-3 text-center">{m.shoulder_width} cm</td>
                        </>
                      ) : (
                        <>
                          <td className="p-3 text-center">{m.waist} cm</td>
                          <td className="p-3 text-center">{m.body_length} cm</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'recommender' && (
            <SmartSizeRecommender
              isPants={Boolean(isPants)}
              onApplySize={(sz) => {
                if (onSelectSize) onSelectSize(sz);
                onClose();
              }}
            />
          )}

          {activeTab === 'panduan' && (
            <div className="space-y-4 text-xs text-zinc-700 bg-zinc-50 p-4 border border-zinc-200">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#E60012] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-900 uppercase">1. Lebar Dada (Chest Width)</strong>
                  <p className="text-zinc-500 text-[11px]">
                    Ukur secara mendatar tepat di bawah jahitan ketiak dari sisi kiri ke sisi kanan.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#E60012] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-900 uppercase">2. Panjang Pakaian (Body Length)</strong>
                  <p className="text-zinc-500 text-[11px]">
                    Ukur dari titik tertinggi bahu (samping kerah) lurus ke ujung bawah keliman baju.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#E60012] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-900 uppercase">3. Lingkar Pinggang (Waist)</strong>
                  <p className="text-zinc-500 text-[11px]">
                    Ukur mendatar melingkar pada bagian ban pinggang celana tanpa ditarik.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer Notice */}
          <div className="p-3 bg-zinc-100 border border-zinc-200 flex items-center justify-between text-[11px] text-zinc-600">
            <span>Bingung memilih ukuran? Garansi retur dan tukar ukuran gratis selama 30 hari.</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-zinc-900 hover:bg-[#E60012] text-white text-[11px] font-bold uppercase transition-colors cursor-pointer"
            >
              Mengerti
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
