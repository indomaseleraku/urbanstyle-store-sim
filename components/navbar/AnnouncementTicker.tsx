// components/navbar/AnnouncementTicker.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Truck, RotateCcw, Copy } from 'lucide-react';
import { ModalType } from '../InformationModals';

interface AnnouncementTickerProps {
  onOpenInfoModal: (type: ModalType) => void;
  isAdmin?: boolean;
}

export default function AnnouncementTicker({
  onOpenInfoModal,
  isAdmin = false,
}: AnnouncementTickerProps) {
  const [copiedVoucher, setCopiedVoucher] = useState(false);

  const handleCopyVoucher = () => {
    navigator.clipboard.writeText('URBANWELCOME50');
    setCopiedVoucher(true);
    setTimeout(() => setCopiedVoucher(false), 2500);
  };

  return (
    <div className="bg-[#F4F4F4] text-zinc-700 text-[11px] py-1.5 px-4 border-b border-zinc-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between font-medium">
        {/* Left assurances */}
        <div className="hidden sm:flex items-center gap-3 text-zinc-500">
          <button 
            type="button"
            onClick={() => onOpenInfoModal('shipping')} 
            className="hover:text-zinc-950 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Truck size={12} className="text-[#E60012]" />
            <span>Gratis Ongkir Min. Rp 400.000</span>
          </button>
          <span className="text-zinc-300">•</span>
          <button 
            type="button"
            onClick={() => onOpenInfoModal('return')} 
            className="hover:text-zinc-950 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw size={12} className="text-[#E60012]" />
            <span>Garansi Retur 30 Hari</span>
          </button>
        </div>

        {/* Center Voucher chip */}
        <button
          type="button"
          onClick={handleCopyVoucher}
          className="mx-auto sm:mx-0 flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer group"
          title="Klik untuk salin kode kupon"
        >
          <span className="text-[10px] font-bold bg-[#E60012] text-white px-1.5 py-0.2">
            VOUCHER
          </span>
          <span className="text-zinc-800 text-[11px] flex items-center gap-1 font-semibold">
            <span>{copiedVoucher ? '✓ Tersalin: URBANWELCOME50' : 'Gunakan URBANWELCOME50 (Hemat Rp 50.000)'}</span>
            <Copy size={11} className="text-zinc-400 group-hover:text-zinc-800" />
          </span>
        </button>

        {/* Right Info Links */}
        <div className="hidden md:flex items-center gap-3 text-zinc-500">
          <button
            type="button"
            onClick={() => onOpenInfoModal('lifewear')}
            className="hover:text-zinc-950 transition-colors cursor-pointer"
          >
            Tentang LifeWear
          </button>
          {isAdmin && (
            <Link
              href="/admin"
              className="text-[#E60012] font-bold text-[10px] hover:underline"
            >
              Dasbor SIM ↗
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
