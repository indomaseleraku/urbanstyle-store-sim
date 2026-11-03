import React, { useState } from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { Product } from '@/lib/admin-suite/types';
import { Plus } from 'lucide-react';

interface ProductCatalogAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STANDARD_CATEGORIES = [
  'Kaos',
  'Kemeja',
  'Polo Shirt',
  'Jaket',
  'Hoodie & Sweater',
  'Celana Panjang',
  'Celana Pendek',
];

export const ProductCatalogAddModal: React.FC<ProductCatalogAddModalProps> = ({ isOpen, onClose }) => {
  const { addProduct } = useAdminSuite();

  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: 'Kaos',
    price: 249000,
    originalPrice: 299000,
    stock: 25,
    safetyStock: 10,
    rackLocation: 'Rak A-01 / Bin 01',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    status: 'active' as Product['status'],
  });

  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  if (!isOpen) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.sku) return;

    const finalCategory = isCustomCategory ? customCategory.trim() || 'Lainnya' : form.category;

    addProduct({
      name: form.name,
      sku: form.sku.toUpperCase(),
      category: finalCategory,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      stock: Number(form.stock),
      safetyStock: Number(form.safetyStock),
      rackLocation: form.rackLocation,
      description: form.description || 'Produk kurasi UrbanStyle LifeWear berkualitas tinggi.',
      imageUrl: form.imageUrl,
      status: form.status,
    });

    onClose();
    setForm({
      name: '',
      sku: '',
      category: 'Kaos',
      price: 249000,
      originalPrice: 299000,
      stock: 25,
      safetyStock: 10,
      rackLocation: 'Rak A-01 / Bin 01',
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
      status: 'active',
    });
    setIsCustomCategory(false);
    setCustomCategory('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-lg max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col my-auto">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tambah Produk Baru ke Etalase</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs cursor-pointer">
            ✕
          </button>
        </div>

        <form onSubmit={handleAddSubmit} className="p-4 space-y-3 text-xs overflow-y-auto">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Produk</label>
            <input
              type="text"
              required
              placeholder="Contoh: Kaos Katun Heavyweight Boxy Fit"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kode SKU</label>
              <input
                type="text"
                required
                placeholder="URBAN-TSH-01"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white font-mono focus:outline-none focus:bg-white dark:focus:bg-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
              <select
                value={isCustomCategory ? '__custom__' : form.category}
                onChange={(e) => {
                  if (e.target.value === '__custom__') {
                    setIsCustomCategory(true);
                  } else {
                    setIsCustomCategory(false);
                    setForm({ ...form, category: e.target.value });
                  }
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-800 cursor-pointer font-medium"
              >
                {STANDARD_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="__custom__">+ Tambah Kategori Baru...</option>
              </select>
            </div>
          </div>

          {/* Input Kategori Kustom jika dipilih */}
          {isCustomCategory && (
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-700 rounded-lg space-y-1 animate-in fade-in duration-200">
              <label className="block font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                <Plus size={12} />
                <span>Nama Kategori Baru</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Aksesoris, Rompi, Luaran..."
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-emerald-400 dark:border-emerald-600 rounded p-1.5 text-slate-800 dark:text-white focus:outline-none"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Harga Jual (Rp)</label>
              <input
                type="number"
                required
                step="1000"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white font-mono focus:outline-none focus:bg-white dark:focus:bg-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Harga Coret (Opsional)</label>
              <input
                type="number"
                step="1000"
                value={form.originalPrice}
                onChange={(e) => setForm({ ...form, originalPrice: Number(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white font-mono focus:outline-none focus:bg-white dark:focus:bg-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Stok Awal (Pcs)</label>
              <input
                type="number"
                required
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white font-mono focus:outline-none focus:bg-white dark:focus:bg-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Safety Stock Minimal</label>
              <input
                type="number"
                min="1"
                value={form.safetyStock}
                onChange={(e) => setForm({ ...form, safetyStock: Number(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white font-mono focus:outline-none focus:bg-white dark:focus:bg-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Singkat</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Detail bahan, teknologi tekstil, atau panduan ukuran..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-800"
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
              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-sm cursor-pointer"
            >
              Simpan Produk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
