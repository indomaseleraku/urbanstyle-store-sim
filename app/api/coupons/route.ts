// app/api/coupons/route.ts
// Public Active Coupons Endpoint backed by Supabase

import { NextResponse } from 'next/server';
import { couponService } from '@/lib/services/couponService';

export async function GET() {
  try {
    const coupons = await couponService.getCoupons();
    return NextResponse.json({ success: true, data: coupons });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal memuat daftar kupon.';
    return NextResponse.json({ success: false, message: msg, data: [] }, { status: 500 });
  }
}
