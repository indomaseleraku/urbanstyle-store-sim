'use client';

import React, { useState } from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { X } from 'lucide-react';

interface InboundAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InboundAddModal: React.FC<InboundAddModalProps> = ({ isOpen, onClose }) => {
  const { addInbound, products } = useAdminSuite();
  const [poNumber, setPoNumber] = useState(`PO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-01`);
  const [supplierName, setSupplierName] = useState('');
  const [expectedDate, setExpectedDate] = useState(new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10));
  const [selectedSku, setSelectedSku] = useState(products[0]?.sku || '');
  const [totalUnits, setTotalUnits] = useState(50);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poNumber.trim() || !supplierName.trim() || totalUnits <= 0) return;

    const chosenProd = products.find((p) => p.sku === selectedSku);
    const itemsSummary = chosenProd
      ? `${totalUnits} pcs ${chosenProd.name} [${chosenProd.sku}]${notes ? ` — ${notes}` : ''}`
      : `${totalUnits} pcs ${notes || 'Barang Restock'}`;

    setIsSaving(true);
    try {
      await addInbound({
        poNumber: poNumber.trim().toUpperCase(),
        supplierName: supplierName.trim(),
        expectedDate,
        totalItems: 1,
        totalUnits: Math.max(1, Number(totalUnits)),
        itemsSummary,
      });
      setSupplierName('');
      setNotes('');
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-lg max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Terbitkan Purchase Order Masuk (PO)</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer" aria-label="Tutup">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nomor PO</label>
              <input
                type="text"
                required
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono uppercase text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Estimasi</label>
              <input
                type="date"
                required
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Pemasok / Konveksi</label>
            <input
              type="text"
              required
              placeholder="Contoh: PT Tekstil Nusantara Jaya"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">SKU Produk (Otomatis Tambah Stok)</label>
              <select
                value={selectedSku}
                onChange={(e) => setSelectedSku(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.sku}>
                    {p.sku} — {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Qty (Pcs)</label>
              <input
                type="number"
                required
                min="1"
                value={totalUnits}
                onChange={(e) => setTotalUnits(Math.max(1, Number(e.target.value) || 1))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan Varian / QC</label>
            <input
              type="text"
              placeholder="Contoh: Ukuran M, L, XL warna Hitam & Navy"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-60 text-white font-semibold rounded-lg cursor-pointer"
            >
              {isSaving ? 'Menyimpan...' : 'Buat Jadwal PO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
