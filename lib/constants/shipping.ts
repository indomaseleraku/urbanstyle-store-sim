// lib/constants/shipping.ts
// Authoritative Shipping Couriers & Fee Calculation (Single Source of Truth: Client + Server)

export interface ShippingCourierOption {
  name: string;
  price: number;
  eta: string;
}

export const COURIERS: ShippingCourierOption[] = [
  { name: 'J&T Express (Reguler)', price: 15000, eta: '1-2 Hari' },
  { name: 'JNE Reguler', price: 18000, eta: '1-3 Hari' },
  { name: 'SiCepat Halu', price: 16000, eta: '1-2 Hari' },
];

export const FREE_SHIPPING_THRESHOLD = 400000;

const COURIER_RATE_TABLE: Record<string, number> = {
  'j&t express (reguler)': 15000,
  'j&t express': 15000,
  'jne reguler': 18000,
  'sicepat halu': 16000,
  'sicepat kilat': 16000,
  'anteraja': 15000,
  'gosend instant': 25000,
};

export function resolveAuthoritativeShippingCost(
  courierName: string,
  subtotalAfterValidation: number
): { valid: boolean; courier: string; cost: number } {
  const normalized = (courierName || '').trim().toLowerCase();
  const baseRate = COURIER_RATE_TABLE[normalized];
  if (baseRate === undefined) {
    return { valid: false, courier: courierName, cost: 0 };
  }
  const safeSubtotal = Math.max(0, Number(subtotalAfterValidation) || 0);
  const cost = safeSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : baseRate;
  return { valid: true, courier: courierName.trim(), cost };
}
