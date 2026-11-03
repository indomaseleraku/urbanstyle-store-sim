// app/api/auth/otp/route.ts
// Endpoint Pengiriman & Verifikasi Kode OTP 6 Digit via Gmail SMTP

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendOtpEmail } from '@/lib/services/emailSmtpService';

const OTP_SECRET = process.env.SESSION_SECRET;
if (!OTP_SECRET) {
  throw new Error('[api/auth/otp] SESSION_SECRET environment variable tidak di-set.');
}
const OTP_TTL_MS = 5 * 60 * 1000; // 5 menit

function signOtpToken(email: string, otp: string, expiresAt: number): string {
  const payload = `${email.toLowerCase().trim()}:${otp.trim()}:${expiresAt}`;
  const sig = crypto.createHmac('sha256', OTP_SECRET as string).update(payload).digest('hex');
  return `${expiresAt}.${sig}`;
}

function verifyOtpToken(email: string, otp: string, otpToken: string): { valid: boolean; reason?: string } {
  if (!otpToken || !otpToken.includes('.')) {
    return { valid: false, reason: 'Token sesi OTP tidak valid.' };
  }
  const [expiresStr, providedSig] = otpToken.split('.');
  const expiresAt = Number(expiresStr);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
    return { valid: false, reason: 'Kode OTP telah kedaluwarsa (lebih dari 5 menit). Silakan minta kode baru.' };
  }

  const expectedToken = signOtpToken(email, otp, expiresAt);
  const expectedSig = expectedToken.split('.')[1];

  try {
    const a = Buffer.from(providedSig, 'hex');
    const b = Buffer.from(expectedSig, 'hex');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return { valid: false, reason: 'Kode OTP 6 digit yang dimasukkan tidak sesuai.' };
    }
    return { valid: true };
  } catch {
    return { valid: false, reason: 'Kode OTP tidak valid.' };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = String(body.action || 'send');
    const rawEmail = String(body.email || '').trim().toLowerCase();

    // — Rate limiting hanya untuk action 'send' —
    if (action === 'send') {
      const { checkRateLimit, OTP_RATE_LIMIT, getClientIp } = await import('@/lib/services/rateLimiter');
      const ip = getClientIp(req);
      const rl = checkRateLimit(`otp:${ip}`, OTP_RATE_LIMIT);
      if (!rl.allowed) {
        return NextResponse.json(
          { success: false, message: 'Terlalu banyak permintaan kode OTP. Tunggu beberapa menit.' },
          { status: 429 }
        );
      }
    }

    if (!rawEmail || !rawEmail.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Masukkan alamat email yang valid (contoh: nama@gmail.com).' },
        { status: 400 }
      );
    }

    if (action === 'send') {
      const purpose = body.purpose === 'register' ? 'register' : 'login';
      const otpCode = String(crypto.randomInt(100000, 999999));
      const expiresAt = Date.now() + OTP_TTL_MS;
      const otpToken = signOtpToken(rawEmail, otpCode, expiresAt);

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

      return NextResponse.json({
        success: true,
        otpToken,
        expiresAt,
        message: `Kode OTP 6 digit telah dikirim ke ${rawEmail}. Silakan periksa kotak masuk Gmail Anda.`,
      });
    }

    if (action === 'verify') {
      const otp = String(body.otp || '').replace(/\s+/g, '');
      const otpToken = String(body.otpToken || '');

      if (!/^\d{6}$/.test(otp)) {
        return NextResponse.json(
          { success: false, message: 'Masukkan 6 digit angka kode OTP.' },
          { status: 400 }
        );
      }

      const check = verifyOtpToken(rawEmail, otp, otpToken);
      if (!check.valid) {
        return NextResponse.json(
          { success: false, message: check.reason || 'Kode OTP salah.' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Verifikasi OTP berhasil.',
      });
    }

    return NextResponse.json({ success: false, message: 'Action tidak dikenali.' }, { status: 400 });
  } catch (err) {
    console.error('[/api/auth/otp] Error:', err);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server autentikasi OTP.' },
      { status: 500 }
    );
  }
}
