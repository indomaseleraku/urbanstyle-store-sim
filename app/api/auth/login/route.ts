// app/api/auth/login/route.ts
// Server-side Login Endpoint dengan bcrypt.compare
// Menggantikan plaintext comparison di client-side authStorageService

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { checkRateLimit, LOGIN_RATE_LIMIT, getClientIp } from '@/lib/services/rateLimiter';

const STAFF_ROLES = ['admin', 'owner', 'gudang', 'kasir'] as const;

export async function POST(req: NextRequest) {
  // — Rate limiting —
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

    // — Validasi input —
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

    // — Ambil record dari Supabase —
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
        { success: false, message: 'Alamat email belum terdaftar. Silakan pilih tab Daftar Akun.' },
        { status: 401 }
      );
    }

    // — Validasi role untuk staff-only portal —
    if (staffOnly && !STAFF_ROLES.includes(data.role as typeof STAFF_ROLES[number])) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak: Akun tidak terdaftar sebagai staf internal.' },
        { status: 403 }
      );
    }

    // — Verifikasi password dengan bcrypt —
    const isLegacyPlaintext = !data.password_hash.startsWith('$2');
    let passwordValid: boolean;

    if (isLegacyPlaintext) {
      // Akun lama dengan plaintext — bandingkan lalu upgrade hash on-the-fly
      passwordValid = data.password_hash === rawPass;
      if (passwordValid) {
        const newHash = await bcrypt.hash(rawPass, 12);
        await supabaseAdmin
          .from('user_credentials')
          .update({ password_hash: newHash, updated_at: new Date().toISOString() })
          .eq('id', data.id);
      }
    } else {
      // Akun dengan bcrypt hash
      passwordValid = await bcrypt.compare(rawPass, data.password_hash);
    }

    if (!passwordValid) {
      return NextResponse.json(
        { success: false, message: 'Kata sandi salah. Silakan periksa kembali atau gunakan Lupa Kata Sandi.' },
        { status: 401 }
      );
    }

    // — Update last_login di staff_users jika staff —
    if (STAFF_ROLES.includes(data.role as typeof STAFF_ROLES[number])) {
      await supabaseAdmin
        .from('staff_users')
        .update({ last_login: new Date().toISOString() })
        .eq('email', rawEmail);
    }

    // — Buat signed session token di server (HMAC-SHA256) —
    const { createSessionToken } = await import('@/lib/services/cryptoSession');
    const token = await createSessionToken(data.id, data.role);

    const isSecure = process.env.NODE_ENV === 'production';
    const cookieOpts = {
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
      sameSite: 'lax' as const,
      httpOnly: false,
      secure: isSecure,
    };

    const response = NextResponse.json({
      success: true,
      user: {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        role: data.role,
        staff_role: data.role === 'admin' ? 'owner' : data.role,
        phone: data.phone ?? undefined,
        preferred_size: data.preferred_size ?? 'M',
        created_at: data.created_at,
      },
      token,
    });

    response.cookies.set('urbanstyle_session_token', token, cookieOpts);
    response.cookies.set('urbanstyle_auth_user', data.id, cookieOpts);
    response.cookies.set('urbanstyle_auth_role', data.role, cookieOpts);

    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan server.';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

