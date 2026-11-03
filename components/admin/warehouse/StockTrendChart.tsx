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
import { Warehouse, Calendar } from 'lucide-react';
import { StockTrendHighlights } from './StockTrendHighlights';
import { generateStockTrendData, StockDayData } from './stockChartHelper';

export const StockTrendChart: React.FC = () => {
  const { products, theme } = useAdminSuite();
  const [filterMode, setFilterMode] = useState<'all' | 'level' | 'flow'>('all');

  const currentTotalStock = useMemo(() => {
    return products.reduce((acc, curr) => acc + curr.stock, 0);
  }, [products]);

  const chartData = useMemo<StockDayData[]>(() => {
    return generateStockTrendData(currentTotalStock);
  }, [currentTotalStock]);

  const totalInbound30d = useMemo(() => chartData.reduce((acc, c) => acc + c.inbound, 0), [chartData]);
  const totalOutbound30d = useMemo(() => chartData.reduce((acc, c) => acc + c.outbound, 0), [chartData]);
  const avgOutboundDaily = Math.round(totalOutbound30d / chartData.length);
  const minStock = useMemo(() => Math.min(...chartData.map((c) => c.stockLevel)), [chartData]);
  const maxStock = useMemo(() => Math.max(...chartData.map((c) => c.stockLevel)), [chartData]);

  const isDark = theme === 'dark';

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as StockDayData;
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-lg shadow-lg text-xs space-y-2 transition-colors min-w-[210px]">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              {data.date} 2026
            </span>
            <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">
              DC-1 Cikarang
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                Stok Fisik di Rak:
              </span>
              <span className="font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {data.stockLevel} Pcs
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                Masuk (Inbound PO):
              </span>
              <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                +{data.inbound} Pcs
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                Keluar (Outbound Dispatch):
              </span>
              <span className="font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums">
                -{data.outbound} Pcs
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
            <Warehouse className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Fluktuasi Stok Fisik & Arus Barang (30 Hari)
            </h2>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pusat Distribusi UrbanStyle DC-1 Cikarang (15 Sep - 14 Okt 2026)
          </p>
        </div>

        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 sm:p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] self-start sm:self-auto">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-2 py-1 rounded-md font-medium transition-colors ${
              filterMode === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilterMode('level')}
            className={`px-2 py-1 rounded-md font-medium transition-colors ${
              filterMode === 'level'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Level Stok
          </button>
          <button
            onClick={() => setFilterMode('flow')}
            className={`px-2 py-1 rounded-md font-medium transition-colors ${
              filterMode === 'flow'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            In/Out Flow
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
            <YAxis
              tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={28}
              formatter={(value) => (
                <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  {value === 'stockLevel'
                    ? 'Total Stok di Rak'
                    : value === 'inbound'
                    ? 'Inbound PO (Masuk)'
                    : 'Outbound Kirim (Keluar)'}
                </span>
              )}
            />

            {(filterMode === 'all' || filterMode === 'level') && (
              <Line
                type="monotone"
                dataKey="stockLevel"
                name="stockLevel"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={{ r: 2, fill: '#2563eb' }}
                activeDot={{ r: 5, stroke: isDark ? '#0f172a' : '#ffffff', strokeWidth: 2 }}
              />
            )}

            {(filterMode === 'all' || filterMode === 'flow') && (
              <>
                <Line
                  type="monotone"
                  dataKey="inbound"
                  name="inbound"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 2, fill: '#10b981' }}
                />
                <Line
                  type="monotone"
                  dataKey="outbound"
                  name="outbound"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  strokeDasharray="2 2"
                  dot={{ r: 2, fill: '#f43f5e' }}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <StockTrendHighlights
        totalInbound30d={totalInbound30d}
        totalOutbound30d={totalOutbound30d}
        avgOutboundDaily={avgOutboundDaily}
        minStock={minStock}
        maxStock={maxStock}
      />
    </div>
  );
};
