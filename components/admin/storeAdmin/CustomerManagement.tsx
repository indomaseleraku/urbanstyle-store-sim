import React, { useState } from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { Star, MapPin } from 'lucide-react';

interface Review {
  id: string;
  customerName: string;
  productName: string;
  rating: number;
  comment: string;
  date: string;
  reply?: string;
}

export const CustomerManagement: React.FC = () => {
  const { formatRupiah } = useAdminSuite();

  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 'rev-01',
      customerName: 'Aditya Pratama',
      productName: 'UrbanStyle Oversized Linen Shirt',
      rating: 5,
      comment: 'Bahan linennya beneran adem pol! Jahitannya rapi dan kancing kayunya estetik banget. Cocok buat outfit santai maupun kerja.',
      date: '12 Okt 2026',
      reply: 'Terima kasih banyak Mas Aditya! Senang sekali kemeja linen UrbanStyle kami cocok dengan kebutuhan Mas.',
    },
    {
      id: 'rev-02',
      customerName: 'Maya Kusuma Dewi',
      productName: 'Tas Jinak Kulit Nabati Tan Cognac',
      rating: 5,
      comment: 'Kualitas kulit nabatinya wangi khas natural leather, tebal dan warnanya cognac vintage mewah. Muat laptop 14 inch pas!',
      date: '11 Okt 2026',
    },
    {
      id: 'rev-03',
      customerName: 'Bambang Sudibyo',
      productName: 'Set Keramik Studio Artisan (Cangkir & Piring)',
      rating: 4,
      comment: 'Barang sampai dengan packing bubble wrap tebal tanpa pecah. Tekstur speckled nya unik.',
      date: '10 Okt 2026',
    },
  ]);

  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  const handleReplySubmit = (reviewId: string) => {
    const text = replyText[reviewId];
    if (!text) return;

    setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, reply: text } : r)));
    setReplyText((prev) => ({ ...prev, [reviewId]: '' }));
  };

  const customers = [
    { name: 'Aditya Pratama', email: 'aditya.p@gmail.com', phone: '+62 812-9844-1234', city: 'Jakarta Selatan', totalSpend: 2450000, ordersCount: 4, tier: 'VIP Gold' },
    { name: 'Maya Kusuma Dewi', email: 'maya.dewi@outlook.com', phone: '+62 813-7721-9988', city: 'Bandung', totalSpend: 3150000, ordersCount: 3, tier: 'VIP Platinum' },
    { name: 'Bambang Sudibyo', email: 'bambang.s@perusahaan.co.id', phone: '+62 821-4455-6677', city: 'Surabaya', totalSpend: 1020000, ordersCount: 1, tier: 'Member' },
    { name: 'Siti Rahmawati', email: 'siti.rahma@gmail.com', phone: '+62 856-7788-9900', city: 'Yogyakarta', totalSpend: 418000, ordersCount: 2, tier: 'Member' },
    { name: 'Kevin Wijaya', email: 'kevin.w@techstartup.id', phone: '+62 818-0909-1212', city: 'Jakarta Selatan', totalSpend: 1950000, ordersCount: 2, tier: 'VIP Gold' },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 w-full max-w-full">
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          Data Pelanggan & Ulasan Produk
        </h1>
        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Daftar pelanggan setia (LTV), riwayat ulasan bintang, dan tanggapan admin toko.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Directory */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden lg:col-span-2 transition-colors">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Pelanggan Terdaftar ({customers.length})</h2>
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500">Total Akun Aktif</span>
          </div>

          <div className="overflow-x-auto">
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
                  <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900 dark:text-white">{c.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {c.phone} · {c.email}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                        {c.city}
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
          </div>
        </div>

        {/* Customer Reviews & Feedback */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm p-4 space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Ulasan & Rating Pembeli</h2>
            <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>4.9 / 5.0</span>
            </div>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-700 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">{r.customerName}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{r.date}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
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
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">"{r.comment}"</p>

                {r.reply ? (
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded border border-emerald-100 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-300">
                    <p className="font-semibold text-emerald-950 dark:text-emerald-200">Respon Admin Toko:</p>
                    <p className="mt-0.5">{r.reply}</p>
                  </div>
                ) : (
                  <div className="pt-1 flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Balas ulasan pembeli..."
                      value={replyText[r.id] || ''}
                      onChange={(e) => setReplyText({ ...replyText, [r.id]: e.target.value })}
                      className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded px-2 py-1 text-[11px] focus:outline-none"
                    />
                    <button
                      onClick={() => handleReplySubmit(r.id)}
                      className="px-2.5 py-1 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white rounded text-[11px] font-medium"
                    >
                      Kirim
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
