import React, { useState } from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { Plus, Search } from 'lucide-react';
import { Product } from '@/lib/admin-suite/types';
import { ProductCatalogTable } from './ProductCatalogTable';
import { ProductCatalogAddModal } from './ProductCatalogAddModal';
import { ProductCatalogEditModal } from './ProductCatalogEditModal';

const STANDARD_CATEGORIES = [
  'all',
  'Kaos',
  'Kemeja',
  'Polo Shirt',
  'Jaket',
  'Hoodie & Sweater',
  'Celana Panjang',
  'Celana Pendek',
];

export const ProductCatalog: React.FC = () => {
  const { products } = useAdminSuite();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Dynamically include any existing categories from products that aren't in standard
  const dynamicCategories = Array.from(new Set(products.map((p) => p.category))).filter(
    (c) => Boolean(c) && !STANDARD_CATEGORIES.includes(c)
  );
  const categories = [...STANDARD_CATEGORIES, ...dynamicCategories];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4 sm:space-y-5 w-full max-w-full">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Katalog & Etalase Produk Toko
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola produk yang tampil di toko online, atur harga diskon, dan pantau stok aktif.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto min-h-[36px] cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          + Tambah Produk Baru
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs pb-1 sm:pb-0 no-scrollbar">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                categoryFilter === c
                  ? 'bg-slate-900 dark:bg-slate-800 text-white font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {c === 'all' ? `Semua Kategori (${products.length})` : c}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama produk, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800"
          />
        </div>
      </div>

      {/* Product Grid / Table */}
      <ProductCatalogTable products={filteredProducts} setEditingProduct={setEditingProduct} />

      {/* Modal Tambah Produk */}
      <ProductCatalogAddModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />

      {/* Modal Edit Produk */}
      <ProductCatalogEditModal editingProduct={editingProduct} setEditingProduct={setEditingProduct} />
    </div>
  );
};
