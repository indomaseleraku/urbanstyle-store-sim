// app/api/account/addresses/route.ts
// Server-side Member Address Book Endpoint (Protected by HMAC Session + Ownership)

import { NextRequest, NextResponse } from 'next/server';
import { getRequestSession } from '@/lib/services/sessionServerHelper';
import { staffService } from '@/lib/services/staffService';

export async function GET(req: NextRequest) {
  const session = await getRequestSession(req);
  if (!session.valid || !session.userId) {
    return NextResponse.json({ success: false, message: 'Sesi tidak valid.' }, { status: 401 });
  }

  try {
    const list = await staffService.getUserAddresses(session.userId);
    return NextResponse.json({ success: true, data: list });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal memuat daftar alamat.';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getRequestSession(req);
  if (!session.valid || !session.userId) {
    return NextResponse.json({ success: false, message: 'Sesi tidak valid.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const recipientName = String(body.recipient_name || '').trim();
    const addressLine = String(body.address_line || '').trim();
    const city = String(body.city || '').trim();
    const postalCode = String(body.postal_code || '').trim();

    if (!recipientName || !addressLine || !city || !postalCode) {
      return NextResponse.json(
        { success: false, message: 'Nama penerima, alamat, kota, dan kode pos wajib diisi.' },
        { status: 400 }
      );
    }

    const created = await staffService.addUserAddress({
      user_id: session.userId,
      label: String(body.label || 'Rumah').trim().slice(0, 50),
      recipient_name: recipientName.slice(0, 150),
      phone: String(body.phone || '').trim().slice(0, 30),
      address_line: addressLine.slice(0, 400),
      city: city.slice(0, 100),
      postal_code: postalCode.slice(0, 15),
      is_default: Boolean(body.is_default),
    });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal menambah alamat.';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getRequestSession(req);
  if (!session.valid || !session.userId) {
    return NextResponse.json({ success: false, message: 'Sesi tidak valid.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const addressId = String(body.address_id || '').trim();
    if (!addressId) {
      return NextResponse.json({ success: false, message: 'ID alamat wajib diisi.' }, { status: 400 });
    }
    const ok = await staffService.setDefaultAddress(session.userId, addressId);
    if (!ok) {
      return NextResponse.json(
        { success: false, message: 'Alamat tidak ditemukan atau gagal diperbarui.' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal mengatur alamat utama.';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getRequestSession(req);
  if (!session.valid || !session.userId) {
    return NextResponse.json({ success: false, message: 'Sesi tidak valid.' }, { status: 401 });
  }

  try {
    const addressId = req.nextUrl.searchParams.get('id') || '';
    if (!addressId) {
      return NextResponse.json({ success: false, message: 'ID alamat wajib diisi.' }, { status: 400 });
    }

    const deleted = await staffService.deleteUserAddress(addressId, session.userId);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Gagal menghapus alamat.' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal menghapus alamat.';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
