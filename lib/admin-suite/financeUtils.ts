import { ExpenseItem, Order } from './types';

export const STANDARD_COGS_RATIO = 0.42;

const INDO_MONTH_MAP: Record<string, string> = {
  jan: 'Jan',
  feb: 'Feb',
  mar: 'Mar',
  apr: 'Apr',
  mei: 'May',
  jun: 'Jun',
  jul: 'Jul',
  agu: 'Aug',
  ags: 'Aug',
  sep: 'Sep',
  okt: 'Oct',
  nov: 'Nov',
  des: 'Dec',
};

export function normalizeIndoDate(raw?: string | null): Date | null {
  if (!raw) return null;
  const trimmed = String(raw).trim();
  if (!trimmed) return null;

  const direct = new Date(trimmed);
  if (!Number.isNaN(direct.getTime())) return direct;

  const replaced = trimmed.replace(
    /\b(januari|jan|februari|feb|maret|mar|april|apr|mei|juni|jun|juli|jul|agustus|agu|ags|september|sep|oktober|okt|november|nov|desember|des)\b/gi,
    (match) => INDO_MONTH_MAP[match.slice(0, 3).toLowerCase()] || match
  );

  const parsed = new Date(replaced);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function toLocalDateKey(raw?: string | null): string | null {
  const parsed = normalizeIndoDate(raw);
  if (!parsed) return null;
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, '0');
  const d = String(parsed.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isRealizedPaidOrder(order: Order): boolean {
  if (order.status === 'cancelled') return false;
  if (order.status === 'pending_payment' && order.paymentStatus !== 'paid') return false;
  return true;
}

export type FinancePeriod = 'current_month' | 'q3' | 'ytd';

export function isWithinFinancePeriod(rawDate: string | undefined, period: FinancePeriod): boolean {
  const d = normalizeIndoDate(rawDate);
  if (!d) return true;

  const now = new Date();
  if (period === 'current_month') {
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }
  if (period === 'q3') {
    const days90 = 90 * 24 * 60 * 60 * 1000;
    return now.getTime() - d.getTime() <= days90;
  }
  return d.getFullYear() === now.getFullYear();
}

export function computeFinanceSummary(
  orders: Order[],
  expenses: ExpenseItem[],
  period: FinancePeriod,
  ppnRatePercent: number
) {
  const realizedOrders = orders.filter(
    (o) => isRealizedPaidOrder(o) && isWithinFinancePeriod(o.rawCreatedAt || o.createdAt, period)
  );
  const periodExpenses = expenses.filter((e) =>
    isWithinFinancePeriod(e.rawDate || e.date, period)
  );

  const totalRevenue = realizedOrders.reduce((acc, o) => acc + Number(o.total || 0), 0);
  const totalCogs = Math.round(totalRevenue * STANDARD_COGS_RATIO);
  const grossProfit = totalRevenue - totalCogs;
  const grossMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0.0';

  const totalOpex = periodExpenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
  const operatingProfit = grossProfit - totalOpex;

  const rate = Number.isFinite(ppnRatePercent) ? ppnRatePercent / 100 : 0.11;
  const estimatedTax = operatingProfit > 0 ? Math.round(operatingProfit * rate) : 0;
  const netProfit = operatingProfit - estimatedTax;
  const netMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';

  return {
    realizedOrders,
    periodExpenses,
    totalRevenue,
    totalCogs,
    grossProfit,
    grossMargin,
    totalOpex,
    operatingProfit,
    estimatedTax,
    netProfit,
    netMargin,
  };
}
