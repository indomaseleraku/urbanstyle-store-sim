// app/api/auth/google/route.ts
// Server-side Verified Google OAuth Session Provisioning

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createSessionToken } from '@/lib/services/cryptoSession';
import { STAFF_ROLES, applySessionCookieToResponse } from '@/lib/services/sessionServerHelper';
import { UserProfile } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const accessToken = String(body.accessToken || '').trim();

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: 'Token autentikasi Google tidak disertakan.' },
        { status: 401 }
      );
    }

    // Verifikasi kriptografis token OAuth langsung melalui Supabase Auth Server
    const { data: authData, error: authErr } = await supabaseAdmin.auth.getUser(accessToken);
    const verifiedUser = authData?.user;

    if (authErr || !verifiedUser || !verifiedUser.email) {
      return NextResponse.json(
        { success: false, message: 'Token sesi Google tidak valid atau telah kedaluwarsa.' },
        { status: 401 }
      );
    }

    const cleanEmail = verifiedUser.email.toLowerCase().trim();
    const meta = (verifiedUser.user_metadata || {}) as Record<string, unknown>;
    const verifiedName =
      String(meta.full_name || meta.name || '').trim() || cleanEmail.split('@')[0].toUpperCase();

    const { data: credRow } = await supabaseAdmin
      .from('user_credentials')
      .select('id, role, full_name, phone, preferred_size, created_at')
      .eq('email', cleanEmail)
      .maybeSingle();

    let effectiveRole: UserProfile['role'] = (credRow?.role as UserProfile['role']) || 'customer';

    if (STAFF_ROLES.includes(effectiveRole as (typeof STAFF_ROLES)[number])) {
      const { data: staffRow, error: staffErr } = await supabaseAdmin
        .from('staff_users')
        .select('id, role, is_active, status')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (staffErr || !staffRow || staffRow.is_active === false || staffRow.status === 'inactive') {
        return NextResponse.json(
          { success: false, message: 'Akses ditolak: Akun staf ini sedang dinonaktifkan.' },
          { status: 403 }
        );
      }

      if (staffRow.role) {
        effectiveRole = (staffRow.role === 'admin' ? 'owner' : staffRow.role) as UserProfile['role'];
      }
    }

    const { data: profRow } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    let profile: UserProfile | null = null;

    if (profRow) {
      profile = {
        id: credRow?.id || profRow.id,
        email: profRow.email || cleanEmail,
        full_name: profRow.full_name || credRow?.full_name || verifiedName,
        role: effectiveRole,
        staff_role: STAFF_ROLES.includes(effectiveRole as (typeof STAFF_ROLES)[number])
          ? (effectiveRole === 'admin' ? 'owner' : (effectiveRole as UserProfile['staff_role']))
          : undefined,
        phone: profRow.phone || credRow?.phone || undefined,
        address_line: profRow.address_line || undefined,
        city: profRow.city || undefined,
        postal_code: profRow.postal_code || undefined,
        preferred_size: profRow.preferred_size || credRow?.preferred_size || 'M',
        created_at: profRow.created_at || credRow?.created_at,
      };
    } else {
      const insertPayload: Record<string, unknown> = {
        ...(credRow?.id ? { id: credRow.id } : { id: verifiedUser.id }),
        email: cleanEmail,
        full_name: credRow?.full_name || verifiedName,
        role: effectiveRole,
        phone: credRow?.phone || null,
        preferred_size: credRow?.preferred_size || 'M',
      };

      const { data: inserted, error: insErr } = await supabaseAdmin
        .from('profiles')
        .upsert(insertPayload, { onConflict: 'email' })
        .select('*')
        .maybeSingle();

      if (insErr || !inserted) {
        return NextResponse.json(
          { success: false, message: 'Gagal menyinkronkan profil akun Google dengan database.' },
          { status: 500 }
        );
      }

      profile = {
        id: inserted.id,
        email: inserted.email || cleanEmail,
        full_name: inserted.full_name,
        role: effectiveRole,
        phone: inserted.phone || undefined,
        preferred_size: inserted.preferred_size || 'M',
        created_at: inserted.created_at,
      };
    }

    const token = await createSessionToken(profile.id, profile.role);
    const response = NextResponse.json({ success: true, user: profile });
    return applySessionCookieToResponse(response, profile.id, profile.role, token);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal login dengan Google.';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
