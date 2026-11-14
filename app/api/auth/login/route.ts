// app/api/auth/login/route.ts
// Server-side Login Endpoint dengan bcrypt.compare + verifikasi status aktif staf

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { checkRateLimit, LOGIN_RATE_LIMIT, getClientIp } from '@/lib/services/rateLimiter';
import {
  STAFF_ROLES,
  constantTimeStringEqual,
  applySessionCookieToResponse,
} from '@/lib/services/sessionServerHelper';
import { createSessionToken } from '@/lib/services/cryptoSession';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`login:${ip}`, LOGIN_RATE_LIMIT);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: `Terlalu banyak percobaan login. Coba lagi dalam ${Math.ceil((rl.resetAt - Date.now()) / 60000)} menit.`,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  try {
    const body = await req.json();
    const rawEmail = String(body.email || '').toLowerCase().trim();
    const rawPass = String(body.password || '').trim();
    const staffOnly = body.staff_only === true;

    if (!rawEmail || !rawEmail.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Format alamat email tidak valid.' },
        { status: 400 }
      );
    }
    if (!rawPass) {
      return NextResponse.json(
        { success: false, message: 'Kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('user_credentials')
      .select('id, email, full_name, role, phone, preferred_size, password_hash, created_at')
      .eq('email', rawEmail)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { success: false, message: 'Terjadi kesalahan saat verifikasi. Coba lagi.' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, message: 'Email atau kata sandi tidak valid.' },
        { status: 401 }
      );
    }

    const isStaffAccount = STAFF_ROLES.includes(data.role as (typeof STAFF_ROLES)[number]);
    if (staffOnly && !isStaffAccount) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak: Akun tidak terdaftar sebagai staf internal.' },
        { status: 403 }
      );
    }

    // Cek verifikasi password terlebih dahulu sebelum membuka info akun staf nonaktif
    const isLegacyPlaintext = !String(data.password_hash || '').startsWith('$2');
    let passwordValid = false;

    if (isLegacyPlaintext) {
      passwordValid = constantTimeStringEqual(String(data.password_hash || ''), rawPass);
      if (passwordValid) {
        const newHash = await bcrypt.hash(rawPass, 12);
        await supabaseAdmin
          .from('user_credentials')
          .update({ password_hash: newHash, updated_at: new Date().toISOString() })
          .eq('id', data.id);
      }
    } else {
      passwordValid = await bcrypt.compare(rawPass, String(data.password_hash));
    }

    if (!passwordValid) {
      return NextResponse.json(
        { success: false, message: 'Email atau kata sandi tidak valid.' },
        { status: 401 }
      );
    }

    let effectiveRole = data.role;
    if (isStaffAccount) {
      const { data: staffRow, error: staffErr } = await supabaseAdmin
        .from('staff_users')
        .select('id, role, is_active, status')
        .eq('email', rawEmail)
        .maybeSingle();

      if (staffErr || !staffRow || staffRow.is_active === false || staffRow.status === 'inactive') {
        return NextResponse.json(
          { success: false, message: 'Akses ditolak: Akun staf ini telah dinonaktifkan.' },
          { status: 403 }
        );
      }

      if (staffRow.role) {
        effectiveRole = staffRow.role === 'admin' ? 'owner' : staffRow.role;
      }

      await supabaseAdmin
        .from('staff_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', staffRow.id);
    }

    const token = await createSessionToken(data.id, effectiveRole);

    const response = NextResponse.json({
      success: true,
      user: {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        role: effectiveRole,
        staff_role: isStaffAccount ? (effectiveRole === 'admin' ? 'owner' : effectiveRole) : undefined,
        phone: data.phone ?? undefined,
        preferred_size: data.preferred_size ?? 'M',
        created_at: data.created_at,
      },
    });

    return applySessionCookieToResponse(response, data.id, effectiveRole, token);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan server.';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
