import React, { useState } from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { Product } from '@/lib/admin-suite/types';
import { X } from 'lucide-react';

interface ProductCatalogEditModalProps {
  editingProduct: Product | null;
  setEditingProduct: React.Dispatch<React.SetStateAction<Product | null>>;
}

export const ProductCatalogEditModal: React.FC<ProductCatalogEditModalProps> = ({
  editingProduct,
  setEditingProduct,
}) => {
  const { updateProduct } = useAdminSuite();
  const [isSaving, setIsSaving] = useState(false);

  if (!editingProduct) return null;

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name.trim()) return;

    setIsSaving(true);
    try {
      await updateProduct(editingProduct.id, {
        name: editingProduct.name.trim(),
        price: Math.max(0, Number(editingProduct.price) || 0),
        originalPrice: editingProduct.originalPrice ? Math.max(0, Number(editingProduct.originalPrice)) : undefined,
        category: editingProduct.category,
        stock: Math.max(0, Math.floor(Number(editingProduct.stock) || 0)),
        safetyStock: Math.max(0, Math.floor(Number(editingProduct.safetyStock) || 0)),
        description: editingProduct.description,
        status: editingProduct.status,
      });
      setEditingProduct(null);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-lg max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col my-auto">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Edit Data Produk ({editingProduct.sku})
          </h3>
          <button
            onClick={() => setEditingProduct(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleEditSubmit} className="p-4 space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Produk</label>
            <input
              type="text"
              required
              value={editingProduct.name}
              onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Harga Jual (Rp)</label>
              <input
                type="number"
                required
                min="0"
                value={editingProduct.price}
                onChange={(e) => setEditingProduct({ ...editingProduct, price: Math.max(0, Number(e.target.value) || 0) })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Stok Etalase</label>
              <input
                type="number"
                required
                min="0"
                value={editingProduct.stock}
                onChange={(e) => setEditingProduct({ ...editingProduct, stock: Math.max(0, Number(e.target.value) || 0) })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Publikasi</label>
            <select
              value={editingProduct.status}
              onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value as Product['status'] })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white"
            >
              <option value="active">Aktif (Tampil di Toko)</option>
              <option value="draft">Draft (Disembunyikan)</option>
              <option value="archived">Diarsipkan</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditingProduct(null)}
              className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-60 text-white font-semibold rounded-lg shadow-sm border border-slate-800 dark:border-slate-700 cursor-pointer"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
