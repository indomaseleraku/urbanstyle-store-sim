// app/api/auth/register/route.ts
// Server-side Registration Endpoint dengan bcrypt hashing
// Menerima email + password + fullName, hash password, simpan ke Supabase

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { checkRateLimit, REGISTER_RATE_LIMIT, getClientIp } from '@/lib/services/rateLimiter';

const BCRYPT_ROUNDS = 12;

export async function POST(req: NextRequest) {
  // — Rate limiting: maks 5 registrasi per IP per jam —
  const ip = getClientIp(req);
  const rl = checkRateLimit(`register:${ip}`, REGISTER_RATE_LIMIT);
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, message: 'Terlalu banyak permintaan registrasi. Coba lagi nanti.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const rawEmail = String(body.email || '').toLowerCase().trim();
    const rawPass = String(body.password || '').trim();
    const fullName = String(body.full_name || '').trim();
    const preferredSize = String(body.preferred_size || 'M').trim();
    const phone = body.phone ? String(body.phone).trim() : null;

    // — Validasi input —
    if (!rawEmail || !rawEmail.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Format alamat email tidak valid.' },
        { status: 400 }
      );
    }
    if (!rawPass || rawPass.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Kata sandi minimal 8 karakter.' },
        { status: 400 }
      );
    }
    if (!fullName) {
      return NextResponse.json(
        { success: false, message: 'Nama lengkap wajib diisi.' },
        { status: 400 }
      );
    }

    // — Cek duplikasi email —
    const { data: existing } = await supabaseAdmin
      .from('user_credentials')
      .select('id')
      .eq('email', rawEmail)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Alamat email sudah terdaftar. Silakan login atau gunakan email lain.' },
        { status: 409 }
      );
    }

    // — Hash password dengan bcrypt —
    const passwordHash = await bcrypt.hash(rawPass, BCRYPT_ROUNDS);

    // — Simpan ke user_credentials —
    const { data: credData, error: credError } = await supabaseAdmin
      .from('user_credentials')
      .insert({
        email: rawEmail,
        password_hash: passwordHash,
        role: 'customer',
        full_name: fullName,
        phone,
        preferred_size: preferredSize,
      })
      .select('id, email, full_name, role, preferred_size, created_at')
      .single();

    if (credError || !credData) {
      return NextResponse.json(
        { success: false, message: 'Gagal menyimpan akun. Coba lagi.' },
        { status: 500 }
      );
    }

    // — Upsert ke profiles —
    await supabaseAdmin.from('profiles').upsert(
      {
        id: credData.id,
        email: rawEmail,
        full_name: fullName,
        phone,
        role: 'customer',
        preferred_size: preferredSize,
      },
      { onConflict: 'email' }
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Akun berhasil dibuat.',
        user: {
          id: credData.id,
          email: credData.email,
          full_name: credData.full_name,
          role: credData.role,
          preferred_size: credData.preferred_size,
          created_at: credData.created_at,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan server.';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
