// app/api/orders/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { dataStore } from '@/lib/store';
import { verifySessionToken } from '@/lib/services/cryptoSession';

export async function GET(request: NextRequest) {
  try {
    // 1. Proteksi Keamanan PII: Validasi hak akses sebelum mengembalikan data pesanan
    const token = request.cookies.get('urbanstyle_session_token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    const session = await verifySessionToken(token);

    if (!session.valid || !session.userId || !session.role) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Akses ditolak: Autentikasi sesi sah diperlukan untuk mengakses riwayat transaksi.' 
        },
        { status: 401 }
      );
    }

    const isStaff = ['admin', 'owner', 'gudang', 'kasir'].includes(session.role);

    // Staf berhak melihat semua pesanan, pelanggan hanya berhak melihat pesanan miliknya sendiri
    const orders = isStaff 
      ? await dataStore.getOrders() 
      : await dataStore.getOrders(session.userId);

    return NextResponse.json({
      success: true,
      count: orders.length,
      data: orders,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memuat daftar pesanan' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Auth guard: wajib session token valid untuk membuat pesanan
    const token =
      request.cookies.get('urbanstyle_session_token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');
    const session = await verifySessionToken(token);
    if (!session.valid || !session.userId) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak: Sesi pengguna tidak valid. Silakan login terlebih dahulu.' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validasi payload
    if (!body.customer_name || !body.customer_phone || !body.customer_address || !body.cart_items) {
      return NextResponse.json(
        { success: false, message: 'Payload tidak lengkap. Nama, telepon, alamat, dan item keranjang wajib diisi.' },
        { status: 400 }
      );
    }

    const result = await dataStore.createOrder({ ...body, user_id: body.user_id || session.userId });

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
