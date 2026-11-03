// components/navbar/SideNavFooter.tsx
'use client';

import React from 'react';
import { Truck, RotateCcw, Sparkles } from 'lucide-react';
import { ModalType } from '../InformationModals';

interface SideNavFooterProps {
  onOpenInfoModal: (type: ModalType) => void;
  onClose: () => void;
}

export default function SideNavFooter({ onOpenInfoModal, onClose }: SideNavFooterProps) {
  return (
    <div className="p-4 sm:p-5 border-t border-zinc-200 bg-zinc-50 space-y-3">
      <div className="text-[11px] text-zinc-600 space-y-2">
        <div className="flex items-center gap-2">
          <Truck size={14} className="text-[#E60012] shrink-0" />
          <span><strong>Bebas Ongkos Kirim:</strong> Min. belanja Rp 400.000</span>
        </div>
        <div className="flex items-center gap-2">
          <RotateCcw size={14} className="text-[#E60012] shrink-0" />
          <span><strong>Garansi Retur 30 Hari:</strong> Pengembalian mudah</span>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-[#E60012] shrink-0" />
          <span><strong>Filosofi LifeWear:</strong> Kualitas busana harian esensial</span>
        </div>
      </div>

      <div className="pt-2 border-t border-zinc-200 grid grid-cols-2 gap-2 text-[10px] font-bold uppercase">
        <button
          type="button"
          onClick={() => { onOpenInfoModal('shipping'); onClose(); }}
          className="py-1.5 px-2 text-left bg-white border border-zinc-200 hover:border-zinc-950 text-zinc-700 cursor-pointer"
        >
          Panduan Ongkir →
        </button>
        <button
          type="button"
          onClick={() => { onOpenInfoModal('return'); onClose(); }}
          className="py-1.5 px-2 text-left bg-white border border-zinc-200 hover:border-zinc-950 text-zinc-700 cursor-pointer"
        >
          Kebijakan Retur →
        </button>
        <button
          type="button"
          onClick={() => { onOpenInfoModal('lifewear'); onClose(); }}
          className="py-1.5 px-2 text-left bg-white border border-zinc-200 hover:border-zinc-950 text-zinc-700 cursor-pointer"
        >
          Filosofi LifeWear →
        </button>
        <button
          type="button"
          onClick={() => { onOpenInfoModal('help'); onClose(); }}
          className="py-1.5 px-2 text-left bg-white border border-zinc-200 hover:border-zinc-950 text-zinc-700 cursor-pointer"
        >
          Bantuan & Kontak →
        </button>
      </div>
    </div>
  );
}
