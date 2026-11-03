// components/DynamicQRISCard.tsx
// Komponen Kartu Tampilan QRIS Standar Bank Indonesia (EMVCo & CRC-16 CCITT)
// Mendukung Dual-Mode: Dinamis (Nominal Terkunci) & Statis Asli Toko (Universal Fail-Safe)

'use client';

import React, { useState, useEffect } from 'react';
import { Download, Copy, Check, QrCode, ShieldCheck, RefreshCw, Zap, Store } from 'lucide-react';
import { qrisService, QRISResult } from '@/lib/services/qrisService';
import QRISPaymentNotice from '@/components/qris/QRISPaymentNotice';

interface DynamicQRISCardProps {
  amount: number;
  orderNumber: string;
  merchantName?: string;
  className?: string;
  onRefresh?: () => void;
}

export const DynamicQRISCard: React.FC<DynamicQRISCardProps> = ({
  amount,
  orderNumber,
  merchantName,
  className = '',
}) => {
  const [mode, setMode] = useState<'dynamic' | 'static'>('dynamic');
  const [qrisResult, setQrisResult] = useState<QRISResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedNominal, setCopiedNominal] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsGenerating(true);

    qrisService
      .createDynamicQRIS(amount, {
        mode,
        orderNumber,
        customMerchantName: merchantName,
      })
      .then((res) => {
        if (isMounted) {
          setQrisResult(res);
          setIsGenerating(false);
        }
      })
      .catch((err) => {
        console.error('Error generating QRIS:', err);
        if (isMounted) setIsGenerating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [amount, orderNumber, merchantName, mode]);

  const handleCopyPayload = () => {
    if (qrisResult?.rawPayload) {
      navigator.clipboard.writeText(qrisResult.rawPayload);
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2000);
    }
  };

  const handleCopyNominal = () => {
    navigator.clipboard.writeText(String(amount));
    setCopiedNominal(true);
    setTimeout(() => setCopiedNominal(false), 2000);
  };

  const handleDownloadQR = () => {
    if (qrisResult?.dataUrl) {
      const link = document.createElement('a');
      link.href = qrisResult.dataUrl;
      link.download = `QRIS-${mode}-${orderNumber}-${amount}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className={`p-5 bg-white border-2 border-zinc-900 text-center space-y-3.5 max-w-sm mx-auto shadow-md font-sans ${className}`}>
      
      {/* Official QRIS Header */}
      <div className="border-b border-zinc-200 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="bg-[#E60012] text-white font-black text-xs px-2 py-0.5 tracking-wider">
            QRIS
          </span>
          <span className="text-[11px] font-black uppercase text-zinc-950 tracking-tight">
            STANDAR NASIONAL
          </span>
        </div>
        <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 uppercase flex items-center gap-1 font-mono">
          <ShieldCheck size={11} className="text-emerald-700" />
          <span>EMVCo CRC-16</span>
        </span>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-100 border border-zinc-200 text-xs">
        <button
          type="button"
          onClick={() => setMode('dynamic')}
          className={`py-1.5 px-2 font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer ${
            mode === 'dynamic'
              ? 'bg-zinc-950 text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200'
          }`}
        >
          <Zap size={12} className={mode === 'dynamic' ? 'text-amber-400' : ''} />
          <span>Nominal Otomatis</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('static')}
          className={`py-1.5 px-2 font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer ${
            mode === 'static'
              ? 'bg-zinc-950 text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200'
          }`}
        >
          <Store size={12} />
          <span>QRIS Standar Asli</span>
        </button>
      </div>

      {/* Merchant Title & NMID */}
      <div className="space-y-0.5">
        <p className="text-xs font-black uppercase tracking-wider text-zinc-950">
          {qrisResult?.merchantName || 'WARUNG KOH KIM'}
        </p>
        <p className="text-[10px] text-zinc-500 font-mono tracking-wide">
          NMID: <strong className="text-zinc-800">{qrisResult?.nmid || 'ID1025458911316'}</strong>
        </p>
      </div>

      {/* Barcode Frame */}
      <div className="p-3 bg-white border border-zinc-300 inline-block mx-auto shadow-2xs">
        {isGenerating ? (
          <div className="w-48 h-48 flex flex-col items-center justify-center gap-2 bg-zinc-50 text-zinc-400">
            <RefreshCw size={24} className="animate-spin text-zinc-600" />
            <span className="text-[10px] font-mono">Memuat QRIS...</span>
          </div>
        ) : qrisResult?.dataUrl ? (
          <div className="space-y-1">
            <img
              src={qrisResult.dataUrl}
              alt={`QRIS ${orderNumber}`}
              className="w-48 h-48 object-contain mx-auto"
            />
          </div>
        ) : (
          <div className="w-48 h-48 flex items-center justify-center text-red-500 text-xs">
            Gagal membuat QRIS
          </div>
        )}
      </div>

      {/* Nominal Information Box */}
      {mode === 'dynamic' ? (
        <div className="p-2.5 bg-zinc-50 border border-zinc-200 space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
            Nominal Tagihan Terkunci Otomatis (Tag 54):
          </span>
          <div className="text-xl font-black font-mono text-[#E60012]">
            Rp {amount.toLocaleString('id-ID')}
          </div>
          <p className="text-[9px] text-zinc-500">
            *Nominal otomatis terkunci di aplikasi perbankan tanpa input manual
          </p>
        </div>
      ) : (
        <div className="p-2.5 bg-amber-50/70 border border-amber-200 space-y-1 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
              Ketik Nominal di Aplikasi:
            </span>
            <button
              type="button"
              onClick={handleCopyNominal}
              className="text-[10px] font-bold text-amber-900 underline flex items-center gap-0.5 cursor-pointer"
            >
              {copiedNominal ? <Check size={11} className="text-emerald-700" /> : <Copy size={11} />}
              <span>{copiedNominal ? 'Tersalin' : 'Salin Angka'}</span>
            </button>
          </div>
          <div className="text-xl font-black font-mono text-zinc-950">
            Rp {amount.toLocaleString('id-ID')}
          </div>
          <p className="text-[9px] text-amber-800 leading-tight">
            *Gunakan mode ini jika m-banking/e-wallet menolak nominal otomatis.
          </p>
        </div>
      )}

      {/* Self-Payment Notice & Payment Logos */}
      <QRISPaymentNotice />

      {/* Action Buttons: Download & Copy EMVCo Payload */}
      <div className="pt-2 border-t border-zinc-200 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleDownloadQR}
          disabled={!qrisResult?.dataUrl}
          className="py-2 px-2 text-[11px] font-bold uppercase bg-zinc-950 text-white hover:bg-[#E60012] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Download size={13} />
          <span>Simpan QR</span>
        </button>

        <button
          type="button"
          onClick={handleCopyPayload}
          disabled={!qrisResult?.rawPayload}
          title="Salin String Mentah EMVCo untuk verifikasi"
          className="py-2 px-2 text-[11px] font-bold uppercase bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {copiedPayload ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
          <span>{copiedPayload ? 'Tersalin' : 'Salin EMVCo'}</span>
        </button>
      </div>

      {/* Checksum CRC Info */}
      {qrisResult?.crc && (
        <div className="text-[9px] text-zinc-400 font-mono flex items-center justify-between px-1">
          <span>Mode: {mode === 'dynamic' ? 'Dinamis (Auto)' : 'Statis Asli'}</span>
          <span>CRC-16: #{qrisResult.crc}</span>
        </div>
      )}
    </div>
  );
};
