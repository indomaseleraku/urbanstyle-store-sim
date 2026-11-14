import { Order } from '@/lib/admin-suite/types';
import { isRealizedPaidOrder, toLocalDateKey } from '@/lib/admin-suite/financeUtils';

export interface DayData {
  date: string;
  fullDate: string;
  dayLabel: string;
  orders: number;
  revenue: number;
  completed: number;
}

export function generateOrderTrendData(orders: Order[]): DayData[] {
  const bucket = new Map<string, { orders: number; revenue: number; completed: number }>();

  for (const ord of orders) {
    const key = toLocalDateKey(ord.rawCreatedAt || ord.createdAt);
    if (!key || ord.status === 'cancelled') continue;
    const entry = bucket.get(key) || { orders: 0, revenue: 0, completed: 0 };
    entry.orders += 1;
    if (isRealizedPaidOrder(ord)) {
      entry.revenue += Number(ord.total || 0);
      entry.completed += 1;
    }
    bucket.set(key, entry);
  }

  const list: DayData[] = [];
  const anchor = new Date();
  anchor.setHours(0, 0, 0, 0);

  for (let i = 29; i >= 0; i--) {
    const d = new Date(anchor);
    d.setDate(d.getDate() - i);

    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const stats = bucket.get(key) || { orders: 0, revenue: 0, completed: 0 };
    const monthStr = d.toLocaleDateString('id-ID', { month: 'short' });

    list.push({
      date: `${d.getDate()} ${monthStr}`,
      fullDate: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      dayLabel: `${d.getDate()}/${d.getMonth() + 1}`,
      orders: stats.orders,
      revenue: stats.revenue,
      completed: stats.completed,
    });
  }

  return list;
}
