// app/api/auth/reset-password/route.ts
// Server-side Password Reset dengan validasi tantangan OTP single-use dari DB

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { checkRateLimit, RESET_PASSWORD_RATE_LIMIT, getClientIp } from '@/lib/services/rateLimiter';
import { constantTimeStringEqual, STAFF_ROLES } from '@/lib/services/sessionServerHelper';

function parseResetHandle(token: string): { valid: boolean; nonce?: string; expiresAt?: number } {
  const secret = process.env.SESSION_SECRET;
  const parts = String(token || '').split('.');
  if (!secret || parts.length !== 4) return { valid: false };
  const [nonce, expiresStr, purpose, providedSig] = parts;
  if (!nonce || purpose !== 'reset' || !/^\d+$/.test(expiresStr)) return { valid: false };
  const expiresAt = Number(expiresStr);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return { valid: false };
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(`${nonce}:${expiresAt}:reset`)
    .digest('hex');
  if (!constantTimeStringEqual(providedSig, expectedSig)) return { valid: false };
  return { valid: true, nonce, expiresAt };
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`reset:${ip}`, RESET_PASSWORD_RATE_LIMIT);
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, message: 'Terlalu banyak permintaan reset kata sandi. Coba lagi nanti.' },
      { status: 429 }
    );
  }

  try {
    const secret = process.env.SESSION_SECRET;
    if (!secret || secret.trim().length < 16) {
      return NextResponse.json({ success: false, message: 'Konfigurasi server tidak lengkap.' }, { status: 500 });
    }

    const body = await req.json();
    const rawEmail = String(body.email || '').toLowerCase().trim();
    const newPass = String(body.new_password || '').trim();
    const otpToken = String(body.otp_token || '');
    const otp = String(body.otp || '').replace(/\s+/g, '');

    if (!rawEmail || !rawEmail.includes('@')) {
      return NextResponse.json({ success: false, message: 'Format email tidak valid.' }, { status: 400 });
    }
    if (!newPass || newPass.length < 8) {
      return NextResponse.json({ success: false, message: 'Kata sandi baru minimal 8 karakter.' }, { status: 400 });
    }
    if (!otpToken || !/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { success: false, message: 'Kode OTP 6 digit yang valid diperlukan.' },
        { status: 400 }
      );
    }

    const handle = parseResetHandle(otpToken);
    if (!handle.valid || !handle.nonce) {
      return NextResponse.json(
        { success: false, message: 'Token OTP tidak valid atau kedaluwarsa. Minta kode baru.' },
        { status: 401 }
      );
    }

    const { data: challenge } = await supabaseAdmin
      .from('auth_otp_challenges')
      .select('id, otp_hash, nonce, attempts, max_attempts, expires_at, consumed_at')
      .eq('nonce', handle.nonce)
      .eq('email', rawEmail)
      .eq('purpose', 'reset')
      .maybeSingle();

    if (!challenge || challenge.consumed_at) {
      return NextResponse.json(
        { success: false, message: 'Tantangan OTP tidak ditemukan atau sudah terpakai.' },
        { status: 401 }
      );
    }

    if (new Date(challenge.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ success: false, message: 'Kode OTP kedaluwarsa.' }, { status: 401 });
    }

    if (Number(challenge.attempts) >= Number(challenge.max_attempts || 5)) {
      return NextResponse.json(
        { success: false, message: 'Batas percobaan salah terlampaui. Minta kode OTP baru.' },
        { status: 429 }
      );
    }

    const candidateHash = crypto
      .createHmac('sha256', secret)
      .update(`${challenge.nonce}:${rawEmail}:reset:${otp}`)
      .digest('hex');

    if (!constantTimeStringEqual(challenge.otp_hash, candidateHash)) {
      await supabaseAdmin
        .from('auth_otp_challenges')
        .update({ attempts: Number(challenge.attempts) + 1 })
        .eq('id', challenge.id);
      return NextResponse.json({ success: false, message: 'Kode OTP salah.' }, { status: 401 });
    }

    const { data: existing } = await supabaseAdmin
      .from('user_credentials')
      .select('id, role')
      .eq('email', rawEmail)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Email tidak ditemukan.' }, { status: 404 });
    }

    // Tolak reset bila akun merupakan staf yang sudah dinonaktifkan
    if (STAFF_ROLES.includes(existing.role as (typeof STAFF_ROLES)[number])) {
      const { data: staffRow } = await supabaseAdmin
        .from('staff_users')
        .select('is_active, status')
        .eq('email', rawEmail)
        .maybeSingle();
      if (!staffRow || staffRow.is_active === false || staffRow.status === 'inactive') {
        return NextResponse.json(
          { success: false, message: 'Akun staf ini sedang dinonaktifkan.' },
          { status: 403 }
        );
      }
    }

    const nowIso = new Date().toISOString();
    const { data: consumed } = await supabaseAdmin
      .from('auth_otp_challenges')
      .update({ verified_at: nowIso, consumed_at: nowIso })
      .eq('id', challenge.id)
      .is('consumed_at', null)
      .select('id')
      .maybeSingle();

    if (!consumed) {
      return NextResponse.json({ success: false, message: 'Kode OTP sudah digunakan.' }, { status: 401 });
    }

    const passwordHash = await bcrypt.hash(newPass, 12);
    const { error } = await supabaseAdmin
      .from('user_credentials')
      .update({ password_hash: passwordHash, updated_at: nowIso })
      .eq('id', existing.id);

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
