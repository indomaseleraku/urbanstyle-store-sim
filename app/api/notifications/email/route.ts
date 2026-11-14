// app/api/notifications/email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendOrderNotificationEmail } from '@/lib/services/emailSmtpService';
import { dataStore } from '@/lib/store';
import { getRequestSession, STAFF_ROLES } from '@/lib/services/sessionServerHelper';

export async function POST(req: NextRequest) {
  try {
    const session = await getRequestSession(req);
    if (!session.valid || !session.userId || !session.role) {
      return NextResponse.json(
        { success: false, message: 'Autentikasi diperlukan untuk mengirim faktur email.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const orderNumber = String(body.orderNumber || '').trim();

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, message: 'Nomor pesanan resmi wajib disertakan.' },
        { status: 400 }
      );
    }

    const order = await dataStore.getOrderByNumber(orderNumber);
    if (!order) {
      return NextResponse.json(
        { success: false, message: `Pesanan #${orderNumber} tidak ditemukan.` },
        { status: 404 }
      );
    }

    const isStaff = STAFF_ROLES.includes(session.role as (typeof STAFF_ROLES)[number]);
    const isOwner = Boolean(order.user_id && order.user_id === session.userId);
    if (!isStaff && !isOwner) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak: Anda tidak berhak memicu faktur pesanan ini.' },
        { status: 403 }
      );
    }

    if (order.status === 'Menunggu Pembayaran' || order.status === 'Dibatalkan') {
      return NextResponse.json(
        {
          success: false,
          message: 'Email faktur hanya dikirim untuk pesanan yang sudah terverifikasi lunas.',
        },
        { status: 400 }
      );
    }

    if (order.invoice_email_sent) {
      return NextResponse.json({
        success: true,
        alreadySent: true,
        message: `Email faktur pesanan #${orderNumber} sudah pernah dikirim sebelumnya.`,
      });
    }

    let toEmail = String(order.customer_email || '').trim().toLowerCase();
    if (!toEmail && order.user_id) {
      const profile = await dataStore.getUserProfile(order.user_id);
      if (profile?.email) {
        toEmail = profile.email.trim().toLowerCase();
      }
    }

    if (!toEmail || !toEmail.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Alamat email pemesan tidak tersedia di database.' },
        { status: 400 }
      );
    }

    const itemsSummary =
      order.items && order.items.length > 0
        ? order.items
            .map((it) => `${it.product_name} (${it.selected_size}, ${it.selected_color}) x${it.quantity}`)
            .join(', ')
        : 'Koleksi Busana UrbanStyle LifeWear';

    const res = await sendOrderNotificationEmail({
      toEmail,
      customerName: String(order.customer_name || 'Pelanggan UrbanStyle'),
      orderNumber: order.order_number,
      totalAmount: Number(order.total_amount),
      paymentMethod: String(order.payment_method || 'QRIS / Transfer'),
      itemsSummary,
      shippingAddress: order.customer_address || undefined,
    });

    if (!res.sent) {
      return NextResponse.json(
        { success: false, message: res.error || 'Gagal mengirim email notifikasi.' },
        { status: 502 }
      );
    }

    await dataStore.markInvoiceEmailSent(orderNumber);

    return NextResponse.json({
      success: true,
      messageId: res.messageId,
      message: `Email konfirmasi pesanan berhasil dikirim ke ${toEmail}.`,
    });
  } catch (err) {
    console.error('[/api/notifications/email] Error:', err);
    return NextResponse.json(
      { success: false, message: 'Gagal memproses pengiriman notifikasi email.' },
      { status: 500 }
    );
  }
}
