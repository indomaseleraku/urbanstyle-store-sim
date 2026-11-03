import { Coupon } from '../types';

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 1,
    code: 'URBANWELCOME50',
    type: 'fixed',
    discount_amount: 50000,
    min_purchase: 200000,
    usage_limit: 500,
    used_count: 14,
    is_active: true,
    description: 'Potongan Rp 50.000 Spesial Member Baru UrbanStyle (Min. Belanja Rp 200.000)',
  },
  {
    id: 2,
    code: 'LIFEWEAR10',
    type: 'percentage',
    discount_amount: 10,
    min_purchase: 150000,
    usage_limit: 1000,
    used_count: 82,
    is_active: true,
    description: 'Diskon 10% Koleksi Esensial LifeWear (Min. Belanja Rp 150.000)',
  },
  {
    id: 3,
    code: 'BEBASONGKIR',
    type: 'fixed',
    discount_amount: 15000,
    min_purchase: 300000,
    usage_limit: 500,
    used_count: 37,
    is_active: true,
    description: 'Subsidi Bebas Ongkos Kirim Jabodetabek (Min. Belanja Rp 300.000)',
  },
];
