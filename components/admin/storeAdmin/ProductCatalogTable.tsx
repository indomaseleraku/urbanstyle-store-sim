import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { Product } from '@/lib/admin-suite/types';

interface ProductCatalogTableProps {
  products: Product[];
  setEditingProduct: (product: Product) => void;
}

export const ProductCatalogTable: React.FC<ProductCatalogTableProps> = ({
  products,
  setEditingProduct,
}) => {
  const { deleteProduct, formatRupiah } = useAdminSuite();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
      {/* Mobile View: Cards */}
      <div className="block sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
        {products.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
            Tidak ada produk dengan kategori ini.
          </div>
        ) : (
          products.map((p) => (
            <div key={p.id} className="p-3.5 space-y-2.5">
              <div className="flex items-start gap-3">
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-14 h-14 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-slate-900 dark:text-white text-xs truncate">{p.name}</p>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border shrink-0 ${
                        p.status === 'active'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {p.status === 'active' ? 'Aktif' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    {p.sku} · {p.category}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                      {formatRupiah(p.price)}
                    </span>
                    {p.originalPrice && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 line-through font-mono">
                        {formatRupiah(p.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-50 dark:border-slate-800/80">
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">
                    Stok:{' '}
                    <strong
                      className={
                        p.stock <= p.safetyStock
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-800 dark:text-slate-200'
                      }
                    >
                      {p.stock} pcs
                    </strong>
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    Terjual: <strong className="text-slate-800 dark:text-slate-200">{p.salesCount}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingProduct(p)}
                    className="px-2.5 py-1 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded font-medium text-[11px] border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop View: Wide Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Produk</th>
              <th className="px-4 py-3 font-semibold">SKU & Kategori</th>
              <th className="px-4 py-3 font-semibold text-right">Harga Jual</th>
              <th className="px-4 py-3 font-semibold text-center">Stok Etalase</th>
              <th className="px-4 py-3 font-semibold text-center">Terjual</th>
              <th className="px-4 py-3 font-semibold text-center">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white truncate max-w-xs">{p.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">
                        {p.description}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3">
                  <p className="font-mono font-semibold text-slate-800 dark:text-slate-200">{p.sku}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{p.category}</p>
                </td>

                <td className="px-4 py-3 text-right">
                  <p className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                    {formatRupiah(p.price)}
                  </p>
                  {p.originalPrice && (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 line-through font-mono">
                      {formatRupiah(p.originalPrice)}
                    </p>
                  )}
                </td>

                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-block font-mono font-bold tabular-nums ${
                      p.stock <= p.safetyStock
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {p.stock} pcs
                  </span>
                  {p.stock <= p.safetyStock && (
                    <span className="block text-[10px] text-rose-500 dark:text-rose-400 font-medium">Stok Tipis!</span>
                  )}
                </td>

                <td className="px-4 py-3 text-center font-mono text-slate-600 dark:text-slate-300 tabular-nums">
                  {p.salesCount}
                </td>

                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border ${
                      p.status === 'active'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {p.status === 'active' ? 'Aktif' : 'Draft'}
                  </span>
                </td>

                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setEditingProduct(p)}
                      className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                      title="Edit Produk"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteProduct(p.id)}
                      className="p-1.5 text-rose-500 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                      title="Hapus Produk"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
