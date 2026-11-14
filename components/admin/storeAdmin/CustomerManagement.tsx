import React, { useMemo } from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { Star, MapPin, Users, MessageSquare } from 'lucide-react';

interface CustomerSummary {
  name: string;
  email: string;
  phone: string;
  city: string;
  ordersCount: number;
  totalSpend: number;
  tier: 'VIP Platinum' | 'VIP Gold' | 'Member';
}

export const CustomerManagement: React.FC = () => {
  const { formatRupiah, orders, reviews } = useAdminSuite();

  const customers = useMemo<CustomerSummary[]>(() => {
    const grouped = new Map<string, Omit<CustomerSummary, 'tier'>>();

    orders.forEach((order) => {
      if (order.status === 'cancelled') return;
      const key = (order.customerEmail || order.customerPhone || order.customerName || order.id)
        .trim()
        .toLowerCase();
      const existing = grouped.get(key);
      if (existing) {
        existing.ordersCount += 1;
        existing.totalSpend += order.total;
        if (existing.city === '-' && order.city && order.city !== '-') existing.city = order.city;
        if (!existing.email && order.customerEmail) existing.email = order.customerEmail;
        if (existing.phone === '-' && order.customerPhone && order.customerPhone !== '-') {
          existing.phone = order.customerPhone;
        }
      } else {
        grouped.set(key, {
          name: order.customerName || 'Pelanggan UrbanStyle',
          email: order.customerEmail || '-',
          phone: order.customerPhone || '-',
          city: order.city || '-',
          ordersCount: 1,
          totalSpend: order.total,
        });
      }
    });

    return Array.from(grouped.values())
      .map((c) => {
        const tier: CustomerSummary['tier'] =
          c.totalSpend >= 3000000
            ? 'VIP Platinum'
            : c.totalSpend >= 1000000
              ? 'VIP Gold'
              : 'Member';
        return { ...c, tier };
      })
      .sort((a, b) => b.totalSpend - a.totalSpend);
  }, [orders]);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return '0.0';
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  return (
    <div className="space-y-4 sm:space-y-5 w-full max-w-full">
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          Data Pelanggan & Ulasan Produk
        </h1>
        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Agregasi lifetime value (LTV) pelanggan langsung dari riwayat transaksi serta ulasan terverifikasi dari Supabase.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden lg:col-span-2 transition-colors">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Pelanggan Bertransaksi ({customers.length})
            </h2>
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500">Live Orders LTV</span>
          </div>

          <div className="overflow-x-auto">
            {customers.length === 0 ? (
              <div className="py-12 px-4 text-center text-slate-400 dark:text-slate-500">
                <Users className="w-7 h-7 mx-auto mb-2 opacity-60" />
                <p className="text-xs font-medium">Belum ada riwayat pelanggan bertransaksi.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Nama & Kontak</th>
                    <th className="px-4 py-3 font-semibold">Lokasi</th>
                    <th className="px-4 py-3 font-semibold text-center">Pesanan</th>
                    <th className="px-4 py-3 font-semibold text-right">Total Belanja (LTV)</th>
                    <th className="px-4 py-3 font-semibold text-center">Status Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {customers.map((c, idx) => (
                    <tr key={`${c.email}-${idx}`} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-900 dark:text-white">{c.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {c.phone} · {c.email || '-'}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                          <span className="truncate max-w-[140px]">{c.city}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {c.ordersCount}x
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                        {formatRupiah(c.totalSpend)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border ${
                            c.tier.includes('Platinum')
                              ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                              : c.tier.includes('Gold')
                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {c.tier}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm p-4 space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Ulasan & Rating Pembeli</h2>
            <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{avgRating} / 5.0</span>
            </div>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {reviews.length === 0 ? (
              <div className="py-10 text-center text-slate-400 dark:text-slate-500">
                <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-60" />
                <p className="text-xs">Belum ada ulasan pembeli di database.</p>
              </div>
            ) : (
              reviews.map((r) => (
                <div
                  key={r.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-700 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 dark:text-white truncate">{r.customerName}</span>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 shrink-0">
                      {r.createdAt}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < r.rating ? 'fill-current' : 'text-slate-300 dark:text-slate-600'}`}
                      />
                    ))}
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1 truncate">
                      ({r.productName})
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">&ldquo;{r.comment}&rdquo;</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
