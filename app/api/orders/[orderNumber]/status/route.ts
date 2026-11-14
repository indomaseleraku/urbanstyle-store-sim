// app/api/orders/[orderNumber]/status/route.ts
// Real-time Status & Autonomous Settlement API (Protected by Ownership / Staff RBAC)

import { NextResponse, type NextRequest } from 'next/server';
import { settlementService } from '@/lib/services/settlementService';
import { dataStore } from '@/lib/store';
import { sendOrderNotificationEmail } from '@/lib/services/emailSmtpService';
import {
  getRequestSession,
  requireVerifiedStaff,
  STAFF_ROLES,
} from '@/lib/services/sessionServerHelper';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const session = await getRequestSession(request);
    if (!session.valid || !session.userId || !session.role) {
      return NextResponse.json(
        { success: false, message: 'Autentikasi diperlukan untuk memeriksa status pembayaran.' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const orderNumber = resolvedParams.orderNumber;
    if (!orderNumber) {
      return NextResponse.json(
        { success: false, message: 'Nomor pesanan wajib disertakan.' },
        { status: 400 }
      );
    }

    const result = await settlementService.checkAndSettleOrder(orderNumber);
    if (!result.success || !result.order) {
      return NextResponse.json(
        { success: false, message: result.reason },
        { status: 404 }
      );
    }

    const isStaff = STAFF_ROLES.includes(session.role as (typeof STAFF_ROLES)[number]);
    const isOwner = Boolean(result.order.user_id && result.order.user_id === session.userId);
    if (!isStaff && !isOwner) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak: Anda tidak berhak mengakses status pesanan ini.' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      order_number: result.order.order_number,
      status: result.order.status,
      settled: result.settled,
      remaining_ms: result.remainingMs || 0,
      total_amount: result.order.total_amount,
      payment_method: result.order.payment_method,
      reason: result.reason,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Terjadi kesalahan internal server';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const staff = await requireVerifiedStaff(request, ['admin', 'owner', 'kasir']);
    if (!staff) {
      return NextResponse.json(
        {
          success: false,
          message: 'Akses ditolak: Hanya staf internal aktif (kasir/owner) yang berhak mengonfirmasi pelunasan manual.',
        },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const orderNumber = resolvedParams.orderNumber;
    if (!orderNumber) {
      return NextResponse.json(
        { success: false, message: 'Nomor pesanan wajib disertakan.' },
        { status: 400 }
      );
    }

    const success = await settlementService.simulateInstantSettle(orderNumber);
    if (!success) {
      return NextResponse.json(
        { success: false, message: `Pesanan #${orderNumber} tidak dalam status Menunggu Pembayaran.` },
        { status: 400 }
      );
    }

    try {
      const order = await dataStore.getOrderByNumber(orderNumber);
      if (order && !order.invoice_email_sent) {
        let toEmail = (order.customer_email || '').trim().toLowerCase();
        if (!toEmail && order.user_id) {
          const profile = await dataStore.getUserProfile(order.user_id);
          if (profile?.email) toEmail = profile.email.trim().toLowerCase();
        }
        if (toEmail && toEmail.includes('@')) {
          const itemsSummary =
            order.items && order.items.length > 0
              ? order.items
                  .map((it) => `${it.product_name} (${it.selected_size}, ${it.selected_color}) x${it.quantity}`)
                  .join(', ')
              : 'Koleksi Busana UrbanStyle LifeWear';

          sendOrderNotificationEmail({
            toEmail,
            customerName: order.customer_name || 'Pelanggan UrbanStyle',
            orderNumber: order.order_number,
            totalAmount: Number(order.total_amount),
            paymentMethod: order.payment_method || 'QRIS / Transfer',
            itemsSummary,
            shippingAddress: order.customer_address,
          })
            .then((res) => {
              if (res.sent) dataStore.markInvoiceEmailSent(orderNumber);
            })
            .catch((e) => console.warn('Gagal kirim email settlement:', e));
        }
      }
    } catch (e) {
      console.warn('Settlement email error:', e);
    }

    return NextResponse.json({
      success: true,
      order_number: orderNumber,
      status: 'Dibayar',
      message: `Pesanan #${orderNumber} berhasil diverifikasi dan ditandai lunas.`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Terjadi kesalahan internal server';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
