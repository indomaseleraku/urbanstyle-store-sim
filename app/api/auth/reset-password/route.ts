// app/api/auth/reset-password/route.ts
// Server-side Password Reset dengan bcrypt hashing
// Dipanggil setelah OTP verified — tidak bisa diakses langsung tanpa OTP token

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { checkRateLimit, RESET_PASSWORD_RATE_LIMIT, getClientIp } from '@/lib/services/rateLimiter';

const OTP_SECRET = process.env.SESSION_SECRET;

export async function POST(req: NextRequest) {
  // — Rate limiting: maks 5 percobaan per IP per 15 menit —
  const ip = getClientIp(req);
  const rl = checkRateLimit(`reset:${ip}`, RESET_PASSWORD_RATE_LIMIT);
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, message: 'Terlalu banyak permintaan reset kata sandi. Coba lagi dalam beberapa menit.' },
      { status: 429 }
    );
  }

  try {
    if (!OTP_SECRET) {
      return NextResponse.json(
        { success: false, message: 'Konfigurasi server tidak lengkap.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const rawEmail = String(body.email || '').toLowerCase().trim();
    const newPass = String(body.new_password || '').trim();
    const otpToken = String(body.otp_token || '');
    const otp = String(body.otp || '');

    // — Validasi input —
    if (!rawEmail || !rawEmail.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Format email tidak valid.' },
        { status: 400 }
      );
    }
    if (!newPass || newPass.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Kata sandi baru minimal 8 karakter.' },
        { status: 400 }
      );
    }

    // — Wajib verifikasi OTP token sebelum reset —
    if (!otpToken || !otp || !otpToken.includes('.')) {
      return NextResponse.json(
        { success: false, message: 'Verifikasi OTP diperlukan sebelum mengubah kata sandi.' },
        { status: 400 }
      );
    }

    // Verifikasi OTP token (same logic as /api/auth/otp)
    const [expiresStr, providedSig] = otpToken.split('.');
    const expiresAt = Number(expiresStr);
    if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
      return NextResponse.json(
        { success: false, message: 'Token OTP telah kedaluwarsa. Minta kode baru.' },
        { status: 401 }
      );
    }

    const payload = `${rawEmail}:${otp.trim()}:${expiresAt}`;
    const expectedSig = crypto.createHmac('sha256', OTP_SECRET).update(payload).digest('hex');

    let sigValid = false;
    try {
      const a = Buffer.from(providedSig, 'hex');
      const b = Buffer.from(expectedSig, 'hex');
      sigValid = a.length === b.length && crypto.timingSafeEqual(a, b);
    } catch {
      sigValid = false;
    }

    if (!sigValid) {
      return NextResponse.json(
        { success: false, message: 'Token OTP tidak valid.' },
        { status: 401 }
      );
    }

    // — Cek akun ada —
    const { data: existing } = await supabaseAdmin
      .from('user_credentials')
      .select('id')
      .eq('email', rawEmail)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Email tidak ditemukan.' },
        { status: 404 }
      );
    }

    // — Hash password baru dan simpan —
    const passwordHash = await bcrypt.hash(newPass, 12);
    const { error } = await supabaseAdmin
      .from('user_credentials')
      .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
      .eq('email', rawEmail);

    if (error) {
      return NextResponse.json(
        { success: false, message: 'Gagal memperbarui kata sandi. Coba lagi.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Kata sandi berhasil diperbarui.' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan server.';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
