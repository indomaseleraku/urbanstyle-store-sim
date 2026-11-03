export interface StockDayData {
  date: string;
  dayLabel: string;
  stockLevel: number;
  inbound: number;
  outbound: number;
}

const INBOUNDS_DATA = [
  0, 0, 0, 180, 0, 0, 0,
  0, 0, 0, 240, 0, 0, 0,
  0, 0, 0, 200, 0, 0, 0,
  0, 0, 0, 0, 250, 0, 0,
  0, 0,
];

const OUTBOUNDS_DATA = [
  28, 32, 35, 30, 42, 48, 38,
  34, 40, 44, 52, 62, 70, 58,
  48, 42, 38, 36, 44, 50, 40,
  38, 46, 44, 54, 58, 52, 48,
  50, 46,
];

export function generateStockTrendData(currentTotalStock: number): StockDayData[] {
  const list: StockDayData[] = [];
  let rollingStock = currentTotalStock - 120;

  for (let i = 29; i >= 0; i--) {
    const d = new Date(2026, 9, 14);
    d.setDate(d.getDate() - i);

    const dayIdx = 29 - i;
    const inQty = INBOUNDS_DATA[dayIdx] || 0;
    const outQty = OUTBOUNDS_DATA[dayIdx] || 35;

    rollingStock = rollingStock + inQty - outQty;
    const stockLevel = i === 0 ? currentTotalStock : rollingStock;

    const dayNum = d.getDate();
    const monthStr = d.toLocaleDateString('id-ID', { month: 'short' });

    list.push({
      date: `${dayNum} ${monthStr}`,
      dayLabel: `${d.getDate()}/${d.getMonth() + 1}`,
      stockLevel,
      inbound: inQty,
      outbound: outQty,
    });
  }

  return list;
}
