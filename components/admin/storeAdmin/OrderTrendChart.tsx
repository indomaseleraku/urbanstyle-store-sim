import React, { useState, useMemo } from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';
import { OrderTrendHighlights } from './OrderTrendHighlights';
import { generateOrderTrendData, DayData } from './orderChartHelper';

export const OrderTrendChart: React.FC = () => {
  const { orders, theme, formatRupiah } = useAdminSuite();
  const [metricView, setMetricView] = useState<'both' | 'orders' | 'revenue'>('both');

  const chartData = useMemo<DayData[]>(() => {
    return generateOrderTrendData(orders.length);
  }, [orders.length]);

  const total30dOrders = useMemo(() => chartData.reduce((acc, c) => acc + c.orders, 0), [chartData]);
  const total30dRevenue = useMemo(() => chartData.reduce((acc, c) => acc + c.revenue, 0), [chartData]);
  const avgDailyOrders = Math.round(total30dOrders / chartData.length);
  const peakDay = useMemo(() => {
    return chartData.reduce((max, c) => (c.orders > max.orders ? c : max), chartData[0]);
  }, [chartData]);

  const isDark = theme === 'dark';

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as DayData;
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-lg shadow-xl text-xs space-y-1.5 transition-colors min-w-[200px]">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              {data.date} 2026
            </span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
              {data.completed} Selesai
            </span>
          </div>

          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                Volume Pesanan:
              </span>
              <span className="font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {data.orders} Pesanan
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
                Omset Harian:
              </span>
              <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums">
                {formatRupiah(data.revenue)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 shadow-xs space-y-3 sm:space-y-4 transition-colors w-full max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Tren Pesanan & Omset (30 Hari Terakhir)
            </h2>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Dinamika transaksi webstore & marketplace (14 Sep - 14 Okt 2026)
          </p>
        </div>

        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 sm:p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] self-start sm:self-auto">
          <button
            onClick={() => setMetricView('both')}
            className={`px-2 py-1 rounded-md font-medium transition-colors ${
              metricView === 'both'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setMetricView('orders')}
            className={`px-2 py-1 rounded-md font-medium transition-colors ${
              metricView === 'orders'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Pesanan
          </button>
          <button
            onClick={() => setMetricView('revenue')}
            className={`px-2 py-1 rounded-md font-medium transition-colors ${
              metricView === 'revenue'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Omset
          </button>
        </div>
      </div>

      <div className="w-full h-52 sm:h-60 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }}
              axisLine={{ stroke: isDark ? '#334155' : '#cbd5e1' }}
              tickLine={false}
              interval={4}
            />

            {(metricView === 'both' || metricView === 'orders') && (
              <YAxis
                yAxisId="orders"
                orientation="left"
                tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                domain={[0, 'auto']}
              />
            )}

            {(metricView === 'both' || metricView === 'revenue') && (
              <YAxis
                yAxisId="revenue"
                orientation={metricView === 'both' ? 'right' : 'left'}
                tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(0)}Jt`}
                domain={[0, 'auto']}
              />
            )}

            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={28}
              formatter={(value) => (
                <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  {value === 'orders' ? 'Pesanan (Unit)' : 'Omset (Rp)'}
                </span>
              )}
            />

            {(metricView === 'both' || metricView === 'orders') && (
              <Line
                yAxisId="orders"
                type="monotone"
                dataKey="orders"
                name="orders"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 2, fill: '#10b981' }}
                activeDot={{ r: 5, stroke: isDark ? '#0f172a' : '#ffffff', strokeWidth: 2 }}
              />
            )}

            {(metricView === 'both' || metricView === 'revenue') && (
              <Line
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                name="revenue"
                stroke="#6366f1"
                strokeWidth={2}
                strokeDasharray={metricView === 'both' ? '4 4' : undefined}
                dot={{ r: 2, fill: '#6366f1' }}
                activeDot={{ r: 5, stroke: isDark ? '#0f172a' : '#ffffff', strokeWidth: 2 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <OrderTrendHighlights
        total30dOrders={total30dOrders}
        avgDailyOrders={avgDailyOrders}
        peakDay={peakDay}
        total30dRevenue={total30dRevenue}
      />
    </div>
  );
};
