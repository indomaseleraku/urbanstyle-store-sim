// app/api/tracking/[orderNumber]/route.ts
// Server Endpoint Pelacakan Logistik & Status Ekspedisi

import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/store';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    const trackingData = await dataStore.getOrderTracking(orderNumber);

    if (!trackingData.order) {
      return NextResponse.json({
        success: false,
        message: `Pesanan dengan nomor #${orderNumber} tidak ditemukan.`,
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      ...trackingData,
    });
  } catch (error: any) {
    console.error('Tracking fetch error:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal mengambil data pelacakan.',
    }, { status: 500 });
  }
}
