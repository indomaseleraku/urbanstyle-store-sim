export interface DayData {
  date: string;
  dayLabel: string;
  orders: number;
  revenue: number;
  completed: number;
}

const BASE_ORDERS_PER_DAY = [
  14, 16, 18, 15, 21, 24, 19,
  17, 20, 22, 26, 31, 35, 29,
  24, 21, 19, 18, 22, 25, 20,
  19, 23, 22, 27, 29, 26, 24,
  28,
];

export function generateOrderTrendData(ordersLength: number): DayData[] {
  const list: DayData[] = [];
  const todayOrderCount = Math.max(16, ordersLength + 12);

  for (let i = 29; i >= 0; i--) {
    const d = new Date(2026, 9, 14);
    d.setDate(d.getDate() - i);

    const dayNum = d.getDate();
    const monthStr = d.toLocaleDateString('id-ID', { month: 'short' });
    const dateStr = `${dayNum} ${monthStr}`;

    let dayOrders = BASE_ORDERS_PER_DAY[29 - i] ?? 20;
    if (i === 0) {
      dayOrders = todayOrderCount;
    }

    const dayRevenue = dayOrders * (310000 + ((dayNum * 137) % 35000));
    const completed = Math.round(dayOrders * (0.88 + ((dayNum % 7) * 0.015)));

    list.push({
      date: dateStr,
      dayLabel: `${d.getDate()}/${d.getMonth() + 1}`,
      orders: dayOrders,
      revenue: dayRevenue,
      completed,
    });
  }

  return list;
}
