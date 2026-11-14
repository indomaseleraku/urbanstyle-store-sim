// app/api/orders/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { dataStore } from '@/lib/store';
import { getRequestSession, STAFF_ROLES } from '@/lib/services/sessionServerHelper';

export async function GET(request: NextRequest) {
  try {
    const session = await getRequestSession(request);
    if (!session.valid || !session.userId || !session.role) {
      return NextResponse.json(
        {
          success: false,
          message: 'Akses ditolak: Autentikasi sesi sah diperlukan untuk mengakses riwayat transaksi.',
        },
        { status: 401 }
      );
    }

    const isStaff = STAFF_ROLES.includes(session.role as (typeof STAFF_ROLES)[number]);
    const mineOnly = request.nextUrl.searchParams.get('mine') === '1';

    const orders =
      isStaff && !mineOnly ? await dataStore.getOrders() : await dataStore.getOrders(session.userId);

    return NextResponse.json({
      success: true,
      count: orders.length,
      data: orders,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal memuat daftar pesanan';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getRequestSession(request);
    if (!session.valid || !session.userId) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak: Sesi pengguna tidak valid. Silakan login terlebih dahulu.' },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.customer_name || !body.customer_phone || !body.customer_address || !body.cart_items) {
      return NextResponse.json(
        { success: false, message: 'Payload tidak lengkap. Nama, telepon, alamat, dan item keranjang wajib diisi.' },
        { status: 400 }
      );
    }

    const result = await dataStore.createOrder({ ...body, user_id: session.userId });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Pesanan berhasil dibuat dan stok fisik telah dipotong secara atomik.',
        order: result.order,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Terjadi kesalahan internal server';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
