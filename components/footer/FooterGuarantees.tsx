'use client';

import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Award } from 'lucide-react';
import { ModalType } from '../InformationModals';

interface FooterGuaranteesProps {
  onOpenInfoModal?: (type: ModalType) => void;
}

export default function FooterGuarantees({ onOpenInfoModal }: FooterGuaranteesProps) {
  return (
    <div className="border-b border-zinc-800 bg-[#111111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
        <button
          type="button"
          onClick={() => onOpenInfoModal && onOpenInfoModal('shipping')}
          className="flex flex-col sm:flex-row items-center sm:items-start gap-3 p-2.5 -m-2 hover:bg-zinc-900/80 transition-colors text-left group cursor-pointer border border-transparent hover:border-zinc-800"
        >
          <Truck className="text-[#E60012] shrink-0 group-hover:scale-110 transition-transform" size={24} />
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white group-hover:text-[#E60012] transition-colors">Bebas Biaya Kirim</h4>
            <p className="text-[11px] text-zinc-400">Gratis ongkir belanja min. Rp 400.000 se-Indonesia</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onOpenInfoModal && onOpenInfoModal('return')}
          className="flex flex-col sm:flex-row items-center sm:items-start gap-3 p-2.5 -m-2 hover:bg-zinc-900/80 transition-colors text-left group cursor-pointer border border-transparent hover:border-zinc-800"
        >
          <RotateCcw className="text-[#E60012] shrink-0 group-hover:scale-110 transition-transform" size={24} />
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white group-hover:text-[#E60012] transition-colors">Garansi 30 Hari</h4>
            <p className="text-[11px] text-zinc-400">Bebas tukar ukuran jika tidak pas di badan</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onOpenInfoModal && onOpenInfoModal('lifewear')}
          className="flex flex-col sm:flex-row items-center sm:items-start gap-3 p-2.5 -m-2 hover:bg-zinc-900/80 transition-colors text-left group cursor-pointer border border-transparent hover:border-zinc-800"
        >
          <Award className="text-[#E60012] shrink-0 group-hover:scale-110 transition-transform" size={24} />
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white group-hover:text-[#E60012] transition-colors">100% Standar LifeWear</h4>
            <p className="text-[11px] text-zinc-400">Material katun murni & jahitan garment presisi</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onOpenInfoModal && onOpenInfoModal('help')}
          className="flex flex-col sm:flex-row items-center sm:items-start gap-3 p-2.5 -m-2 hover:bg-zinc-900/80 transition-colors text-left group cursor-pointer border border-transparent hover:border-zinc-800"
        >
          <ShieldCheck className="text-[#E60012] shrink-0 group-hover:scale-110 transition-transform" size={24} />
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white group-hover:text-[#E60012] transition-colors">Pembayaran Aman QRIS</h4>
            <p className="text-[11px] text-zinc-400">Verifikasi instan standar Bank Indonesia & transfer</p>
          </div>
        </button>
      </div>
    </div>
  );
}
