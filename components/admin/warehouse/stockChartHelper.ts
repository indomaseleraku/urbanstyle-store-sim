import { InboundShipment, Order, StockAdjustment } from '@/lib/admin-suite/types';
import { toLocalDateKey } from '@/lib/admin-suite/financeUtils';

export interface StockDayData {
  date: string;
  fullDate: string;
  dayLabel: string;
  stockLevel: number;
  inbound: number;
  outbound: number;
}

export function generateStockTrendData(
  currentTotalStock: number,
  inboundShipments: InboundShipment[] = [],
  orders: Order[] = [],
  stockAdjustments: StockAdjustment[] = []
): StockDayData[] {
  const inboundByDay = new Map<string, number>();
  const outboundByDay = new Map<string, number>();

  for (const ship of inboundShipments) {
    if (ship.status !== 'received') continue;
    const key = toLocalDateKey(ship.expectedDate);
    if (!key) continue;
    inboundByDay.set(key, (inboundByDay.get(key) || 0) + Number(ship.totalUnits || 0));
  }

  for (const ord of orders) {
    if (ord.status === 'cancelled') continue;
    const key = toLocalDateKey(ord.rawCreatedAt || ord.createdAt);
    if (!key) continue;
    const qtySum = (ord.items || []).reduce((s, it) => s + Number(it.quantity || 0), 0);
    outboundByDay.set(key, (outboundByDay.get(key) || 0) + qtySum);
  }

  for (const adj of stockAdjustments) {
    const key = toLocalDateKey(adj.rawDate || adj.date);
    if (!key) continue;
    if (adj.diff > 0) {
      inboundByDay.set(key, (inboundByDay.get(key) || 0) + adj.diff);
    } else if (adj.diff < 0) {
      outboundByDay.set(key, (outboundByDay.get(key) || 0) + Math.abs(adj.diff));
    }
  }

  const anchor = new Date();
  anchor.setHours(0, 0, 0, 0);

  const days: StockDayData[] = new Array(30);
  let rollingStock = currentTotalStock;

  for (let i = 0; i < 30; i++) {
    const d = new Date(anchor);
    d.setDate(d.getDate() - i);

    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const inQty = inboundByDay.get(key) || 0;
    const outQty = outboundByDay.get(key) || 0;
    const monthStr = d.toLocaleDateString('id-ID', { month: 'short' });

    days[29 - i] = {
      date: `${d.getDate()} ${monthStr}`,
      fullDate: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      dayLabel: `${d.getDate()}/${d.getMonth() + 1}`,
      stockLevel: Math.max(0, rollingStock),
      inbound: inQty,
      outbound: outQty,
    };

    rollingStock = Math.max(0, rollingStock - inQty + outQty);
  }

  return days;
}
