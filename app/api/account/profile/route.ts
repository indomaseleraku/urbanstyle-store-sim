// app/api/account/profile/route.ts
// Server-side Member Profile Endpoint (Protected by HMAC Session + strict error checking)

import { NextRequest, NextResponse } from 'next/server';
import { getRequestSession } from '@/lib/services/sessionServerHelper';
import { staffService } from '@/lib/services/staffService';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest) {
  const session = await getRequestSession(req);
  if (!session.valid || !session.userId) {
    return NextResponse.json({ success: false, message: 'Sesi tidak valid.' }, { status: 401 });
  }

  const profile = await staffService.getUserProfile(session.userId);
  if (!profile) {
    return NextResponse.json({ success: false, message: 'Profil tidak ditemukan.' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: profile });
}

export async function PUT(req: NextRequest) {
  const session = await getRequestSession(req);
  if (!session.valid || !session.userId) {
    return NextResponse.json({ success: false, message: 'Sesi tidak valid.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updates: Record<string, string> = {};
    if (typeof body.full_name === 'string' && body.full_name.trim()) {
      updates.full_name = body.full_name.trim().slice(0, 150);
    }
    if (typeof body.phone === 'string') updates.phone = body.phone.trim().slice(0, 30);
    if (typeof body.preferred_size === 'string') {
      updates.preferred_size = body.preferred_size.trim().slice(0, 10);
    }
    if (typeof body.address_line === 'string') updates.address_line = body.address_line.trim().slice(0, 400);
    if (typeof body.city === 'string') updates.city = body.city.trim().slice(0, 100);
    if (typeof body.postal_code === 'string') updates.postal_code = body.postal_code.trim().slice(0, 10);

    const updated = await staffService.updateUserProfile(session.userId, updates);

    const credPatch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.full_name) credPatch.full_name = updates.full_name;
    if (updates.phone !== undefined) credPatch.phone = updates.phone;
    if (updates.preferred_size) credPatch.preferred_size = updates.preferred_size;

    const { error: credErr } = await supabaseAdmin
      .from('user_credentials')
      .update(credPatch)
      .eq('id', session.userId);

    if (credErr) {
      console.warn('Sync user_credentials warning:', credErr.message);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal memperbarui profil.';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
