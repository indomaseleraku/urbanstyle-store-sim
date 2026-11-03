// app/api/coupons/validate/route.ts
// Server Endpoint Validasi Kupon Diskon Berbasis Database/Store

import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, subtotal } = body;

    if (!code) {
      return NextResponse.json({
        valid: false,
        discount_amount: 0,
        message: 'Kode voucher promo tidak boleh kosong.',
      }, { status: 400 });
    }

    const validationResult = await dataStore.validateCoupon(code, Number(subtotal) || 0);

    return NextResponse.json(validationResult);
  } catch (error: any) {
    console.error('Coupon validation error:', error);
    return NextResponse.json({
      valid: false,
      discount_amount: 0,
      message: 'Terjadi kesalahan sistem saat memvalidasi kupon.',
    }, { status: 500 });
  }
}
