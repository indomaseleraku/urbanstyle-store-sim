// app/api/tracking/[orderNumber]/route.ts
// Server Endpoint Pelacakan Logistik (Owner atau Staf Aktif)

import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/store';
import { trackingService } from '@/lib/services/trackingService';
import { getRequestSession, STAFF_ROLES } from '@/lib/services/sessionServerHelper';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const session = await getRequestSession(req);
    if (!session.valid || !session.userId || !session.role) {
      return NextResponse.json(
        { success: false, message: 'Autentikasi diperlukan untuk melacak detail pesanan.' },
        { status: 401 }
      );
    }

    const { orderNumber } = await params;
    const order = await dataStore.getOrderByNumber(orderNumber);
    if (!order) {
      return NextResponse.json(
        { success: false, message: `Pesanan dengan nomor #${orderNumber} tidak ditemukan.` },
        { status: 404 }
      );
    }

    const isStaff = STAFF_ROLES.includes(session.role as (typeof STAFF_ROLES)[number]);
    const isOwnerOfOrder = Boolean(order.user_id && order.user_id === session.userId);
    if (!isStaff && !isOwnerOfOrder) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak: Anda tidak berhak melihat pelacakan pesanan ini.' },
        { status: 403 }
      );
    }

    const trackingData = trackingService.buildTrackingFromOrder(order);
    return NextResponse.json({
      success: true,
      ...trackingData,
    });
  } catch (error) {
    console.error('Tracking fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data pelacakan.' },
      { status: 500 }
    );
  }
}
