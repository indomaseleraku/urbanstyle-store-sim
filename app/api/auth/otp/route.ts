// app/api/auth/otp/route.ts
// Server-side Challenge-Backed OTP Delivery & Single-Use Verification

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendOtpEmail } from '@/lib/services/emailSmtpService';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import {
  checkRateLimit,
  OTP_RATE_LIMIT,
  OTP_VERIFY_RATE_LIMIT,
  getClientIp,
} from '@/lib/services/rateLimiter';
import { constantTimeStringEqual } from '@/lib/services/sessionServerHelper';

type OtpPurpose = 'login' | 'register' | 'reset';

const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

function getOtpSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.trim().length < 16) {
    throw new Error('[api/auth/otp] SESSION_SECRET wajib dikonfigurasi.');
  }
  return s;
}

function hashOtpCode(nonce: string, email: string, purpose: OtpPurpose, otp: string): string {
  return crypto
    .createHmac('sha256', getOtpSecret())
    .update(`${nonce}:${email}:${purpose}:${otp.trim()}`)
    .digest('hex');
}

function signChallengeHandle(nonce: string, expiresAt: number, purpose: OtpPurpose): string {
  const sig = crypto
    .createHmac('sha256', getOtpSecret())
    .update(`${nonce}:${expiresAt}:${purpose}`)
    .digest('hex');
  return `${nonce}.${expiresAt}.${purpose}.${sig}`;
}

function parseChallengeHandle(
  token: string,
  expectedPurpose?: OtpPurpose
): { valid: boolean; nonce?: string; expiresAt?: number; purpose?: OtpPurpose } {
  const parts = String(token || '').split('.');
  if (parts.length !== 4) return { valid: false };

  const [nonce, expiresStr, purposeRaw, providedSig] = parts;
  if (!nonce || !/^\d+$/.test(expiresStr)) return { valid: false };
  if (purposeRaw !== 'login' && purposeRaw !== 'register' && purposeRaw !== 'reset') {
    return { valid: false };
  }
  if (expectedPurpose && purposeRaw !== expectedPurpose) return { valid: false };

  const expiresAt = Number(expiresStr);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
    return { valid: false };
  }

  const expectedToken = signChallengeHandle(nonce, expiresAt, purposeRaw);
  const expectedSig = expectedToken.split('.')[3];
  if (!constantTimeStringEqual(providedSig, expectedSig)) {
    return { valid: false };
  }

  return { valid: true, nonce, expiresAt, purpose: purposeRaw };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = String(body.action || 'send');
    const rawEmail = String(body.email || '').trim().toLowerCase();
    const ip = getClientIp(req);

    if (!rawEmail || !rawEmail.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Masukkan alamat email yang valid (contoh: nama@gmail.com).' },
        { status: 400 }
      );
    }

    if (action === 'send') {
      const rl = checkRateLimit(`otp:${ip}:${rawEmail}`, OTP_RATE_LIMIT);
      if (!rl.allowed) {
        return NextResponse.json(
          { success: false, message: 'Terlalu banyak permintaan kode OTP. Tunggu beberapa menit.' },
          { status: 429 }
        );
      }

      const purpose: OtpPurpose =
        body.purpose === 'register' ? 'register' : body.purpose === 'reset' ? 'reset' : 'login';

      const otpCode = String(crypto.randomInt(100000, 1000000));
      const nonce = crypto.randomUUID();
      const expiresAt = Date.now() + OTP_TTL_MS;
      const otpHash = hashOtpCode(nonce, rawEmail, purpose, otpCode);

      // Batalkan challenge lama yang belum dipakai untuk email & tujuan yang sama
      await supabaseAdmin
        .from('auth_otp_challenges')
        .update({ consumed_at: new Date().toISOString() })
        .eq('email', rawEmail)
        .eq('purpose', purpose)
        .is('consumed_at', null);

      const { error: insertErr } = await supabaseAdmin.from('auth_otp_challenges').insert({
        email: rawEmail,
        purpose,
        otp_hash: otpHash,
        nonce,
        attempts: 0,
        max_attempts: MAX_OTP_ATTEMPTS,
        expires_at: new Date(expiresAt).toISOString(),
      });

      if (insertErr) {
        return NextResponse.json(
          { success: false, message: 'Gagal menginisialisasi tantangan verifikasi OTP.' },
          { status: 500 }
        );
      }

      const mailRes = await sendOtpEmail(rawEmail, otpCode, purpose);
      if (!mailRes.sent) {
        return NextResponse.json(
          {
            success: false,
            message: `Gagal mengirim email OTP ke ${rawEmail}: ${mailRes.error || 'Gangguan jaringan SMTP'}`,
          },
          { status: 502 }
        );
      }

      const otpToken = signChallengeHandle(nonce, expiresAt, purpose);
      return NextResponse.json({
        success: true,
        otpToken,
        expiresAt,
        message: `Kode OTP 6 digit telah dikirim ke ${rawEmail}. Silakan periksa kotak masuk Gmail Anda.`,
      });
    }

    if (action === 'verify') {
      const rl = checkRateLimit(`otp-verify:${ip}:${rawEmail}`, OTP_VERIFY_RATE_LIMIT);
      if (!rl.allowed) {
        return NextResponse.json(
          { success: false, message: 'Terlalu banyak percobaan verifikasi OTP. Minta kode baru nanti.' },
          { status: 429 }
        );
      }

      const otp = String(body.otp || '').replace(/\s+/g, '');
      const otpToken = String(body.otpToken || '');
      const purpose: OtpPurpose | undefined =
        body.purpose === 'register' || body.purpose === 'reset' || body.purpose === 'login'
          ? body.purpose
          : undefined;

      if (!/^\d{6}$/.test(otp)) {
        return NextResponse.json(
          { success: false, message: 'Kode OTP harus berupa 6 digit angka.' },
          { status: 400 }
        );
      }

      const handle = parseChallengeHandle(otpToken, purpose);
      if (!handle.valid || !handle.nonce || !handle.purpose) {
        return NextResponse.json(
          { success: false, message: 'Sesi kode OTP kedaluwarsa atau tidak valid. Minta kode baru.' },
          { status: 401 }
        );
      }

      const { data: challenge, error: fetchErr } = await supabaseAdmin
        .from('auth_otp_challenges')
        .select('id, email, purpose, otp_hash, nonce, attempts, max_attempts, expires_at, consumed_at')
        .eq('nonce', handle.nonce)
        .eq('email', rawEmail)
        .eq('purpose', handle.purpose)
        .maybeSingle();

      if (fetchErr || !challenge) {
        return NextResponse.json(
          { success: false, message: 'Tantangan OTP tidak ditemukan.' },
          { status: 401 }
        );
      }

      if (challenge.consumed_at) {
        return NextResponse.json(
          { success: false, message: 'Kode OTP ini sudah pernah digunakan. Silakan minta kode baru.' },
          { status: 401 }
        );
      }

      if (new Date(challenge.expires_at).getTime() < Date.now()) {
        return NextResponse.json(
          { success: false, message: 'Kode OTP telah kedaluwarsa (lebih dari 5 menit).' },
          { status: 401 }
        );
      }

      if (Number(challenge.attempts) >= Number(challenge.max_attempts || MAX_OTP_ATTEMPTS)) {
        return NextResponse.json(
          { success: false, message: 'Batas percobaan salah terlampaui. Silakan minta kode OTP baru.' },
          { status: 429 }
        );
      }

      const candidateHash = hashOtpCode(challenge.nonce, rawEmail, handle.purpose, otp);
      if (!constantTimeStringEqual(challenge.otp_hash, candidateHash)) {
        const nextAttempts = Number(challenge.attempts) + 1;
        await supabaseAdmin
          .from('auth_otp_challenges')
          .update({ attempts: nextAttempts })
          .eq('id', challenge.id);
        return NextResponse.json(
          {
            success: false,
            message: `Kode OTP 6 digit tidak sesuai (Sisa percobaan: ${Math.max(0, MAX_OTP_ATTEMPTS - nextAttempts)}).`,
          },
          { status: 401 }
        );
      }

      // Tandai terpakai secara atomik (single-use)
      const nowIso = new Date().toISOString();
      const { data: consumedRow, error: consumeErr } = await supabaseAdmin
        .from('auth_otp_challenges')
        .update({ verified_at: nowIso, consumed_at: nowIso })
        .eq('id', challenge.id)
        .is('consumed_at', null)
        .select('id')
        .maybeSingle();

      if (consumeErr || !consumedRow) {
        return NextResponse.json(
          { success: false, message: 'Kode OTP sudah digunakan.' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Verifikasi kode OTP berhasil!',
      });
    }

    return NextResponse.json({ success: false, message: 'Aksi OTP tidak dikenali.' }, { status: 400 });
  } catch (err) {
    console.error('[/api/auth/otp] Error:', err);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat memproses OTP.' },
      { status: 500 }
    );
  }
}
