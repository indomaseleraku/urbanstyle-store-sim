// app/api/orders/[orderNumber]/status/route.ts
// Real-time Status & Autonomous Settlement API
import { NextResponse, type NextRequest } from 'next/server';
import { settlementService } from '@/lib/services/settlementService';
import { dataStore } from '@/lib/store';
import { sendOrderNotificationEmail } from '@/lib/services/emailSmtpService';
import { verifySessionToken } from '@/lib/services/cryptoSession';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const resolvedParams = await params;
    const orderNumber = resolvedParams.orderNumber;

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, message: 'Nomor pesanan wajib disertakan.' },
        { status: 400 }
      );
    }

    const result = await settlementService.checkAndSettleOrder(orderNumber);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.reason },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order_number: result.order?.order_number,
      status: result.order?.status,
      settled: result.settled,
      remaining_ms: result.remainingMs || 0,
      total_amount: result.order?.total_amount,
      payment_method: result.order?.payment_method,
      reason: result.reason,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Terjadi kesalahan internal server' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    // 1. Auth Guard: Hanya staf berwenang (owner, admin, kasir) yang boleh mengubah status manual
    const token =
      request.cookies.get('urbanstyle_session_token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');
    const session = await verifySessionToken(token);

    const isStaff = Boolean(session.valid && session.role && ['admin', 'owner', 'kasir'].includes(session.role));
    if (!isStaff) {
      return NextResponse.json(
        {
          success: false,
          message: 'Akses ditolak: Hanya staf resmi internal (kasir/admin) yang berhak mengonfirmasi status pelunasan manual.',
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
        { success: false, message: `Gagal memperbarui status pesanan #${orderNumber}.` },
        { status: 400 }
      );
    }

    // Trigger otomatis pengiriman email faktur lunas
    try {
      const order = await dataStore.getOrderByNumber(orderNumber);
      if (order && !order.invoice_email_sent) {
        let toEmail = (order.customer_email || '').trim().toLowerCase();
        if (!toEmail && order.user_id) {
          const profile = await dataStore.getUserProfile(order.user_id);
          if (profile?.email) toEmail = profile.email.trim().toLowerCase();
        }
        if (toEmail && toEmail.includes('@')) {
          const itemsSummary = order.items && order.items.length > 0
            ? order.items.map(it => `${it.product_name} (${it.selected_size}, ${it.selected_color}) x${it.quantity}`).join(', ')
            : 'Koleksi Busana UrbanStyle LifeWear';

          sendOrderNotificationEmail({
            toEmail,
            customerName: order.customer_name || 'Pelanggan UrbanStyle',
            orderNumber: order.order_number,
            totalAmount: Number(order.total_amount),
            paymentMethod: order.payment_method || 'QRIS / Transfer',
            itemsSummary,
            shippingAddress: order.customer_address,
          }).then(res => {
            if (res.sent) dataStore.markInvoiceEmailSent(orderNumber);
          }).catch(e => console.warn('Gagal kirim email settlement:', e));
        }
      }
    } catch (e) {
      console.warn('Settlement email error:', e);
    }

    return NextResponse.json({
      success: true,
      order_number: orderNumber,
      status: 'Dibayar',
      message: `Pesanan #${orderNumber} berhasil diverifikasi dan ditandai lunas oleh sistem.`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Terjadi kesalahan internal server' },
      { status: 500 }
    );
  }
}
