// components/InvoiceActions.tsx
'use client';

import React, { useState } from 'react';
import { Printer, Copy, Check } from 'lucide-react';

export function InvoicePrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-[#E60012] text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 transition-colors cursor-pointer"
    >
      <Printer size={14} /> Cetak Faktur
    </button>
  );
}

export function CopyButton({
  textToCopy,
  label = 'Salin',
  successLabel = 'Tersalin!',
  className,
}: {
  textToCopy: string;
  label?: string;
  successLabel?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={
        className ||
        'px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold uppercase transition-colors inline-flex items-center gap-1 border border-zinc-300 cursor-pointer'
      }
    >
      {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
      <span>{copied ? successLabel : label}</span>
    </button>
  );
}
