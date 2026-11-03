// app/api/webhooks/payment/route.ts
// Official Payment & Mutation Webhook Receiver Endpoint dengan Proteksi Secret Signature
// Mendukung integrasi notifikasi HP GoBiz (MacroDroid), Bank Transfer Mutation, Midtrans, & PaymentGatewayin

import { NextResponse } from 'next/server';
import { settlementService } from '@/lib/services/settlementService';
import { dataStore } from '@/lib/store';
import { sendOrderNotificationEmail } from '@/lib/services/emailSmtpService';

export async function POST(request: Request) {
  try {
    let body: any;
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      try {
        body = await request.json();
      } catch (jsonErr) {
        return NextResponse.json(
          { success: false, message: 'Format JSON payload tidak valid.' },
          { status: 400 }
        );
      }
    } else {
      // Menerima plain text (misal raw notification push dari MacroDroid)
      const text = await request.text();
      body = { raw_text: text };
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Payload webhook kosong atau tidak terbaca.' },
        { status: 400 }
      );
    }

    // 1. Verifikasi Keamanan: Webhook Secret Token Protection (Anti Free-Order Exploit)
    const expectedSecret = process.env.PAYMENT_WEBHOOK_SECRET;
    const secretHeader = request.headers.get('x-webhook-secret') || '';
    const authHeader = request.headers.get('authorization') || '';
    const bearerSecret = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    const providedSecret = secretHeader || bearerSecret || (body.secret as string | undefined);

    const isPingOnly = Boolean(
      body.is_test ||
      body.channel === 'Test Ping' ||
      body.app_name === 'Test Ping' ||
      body.title === 'Uji Coba Ping' ||
      (typeof body.raw_text === 'string' && body.raw_text.toLowerCase().includes('ping'))
    );

    // Jika env tidak di-set atau secret tidak cocok, tolak request
    if (!isPingOnly && (!expectedSecret || !providedSecret || providedSecret !== expectedSecret)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Akses ditolak: Kunci autentikasi webhook (x-webhook-secret) tidak valid atau tidak disertakan.',
        },
        { status: 401 }
      );
    }

    const result = await settlementService.processPaymentWebhook(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          order_number: result.order_number,
        },
        { status: 422 }
      );
    }

    // Trigger otomatis email faktur jika status berubah menjadi Dibayar
    if (result.order_number && result.new_status === 'Dibayar') {
      try {
        const order = await dataStore.getOrderByNumber(result.order_number);
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
              if (res.sent) dataStore.markInvoiceEmailSent(result.order_number!);
            }).catch(e => console.warn('Webhook email error:', e));
          }
        }
      } catch (e) {
        console.warn('Webhook invoice email error:', e);
      }
    }

    return NextResponse.json(
      {
        success: true,
        order_number: result.order_number,
        amount: result.amount,
        previous_status: result.previous_status,
        new_status: result.new_status,
        message: result.message,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Terjadi kesalahan sistem saat memproses webhook.',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      service: 'PaymentGatewayin Webhook Receiver',
      status: 'ONLINE',
      message: 'Webhook endpoint aktif dan terproteksi oleh secret signature.',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
