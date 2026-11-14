// app/api/newsletter/route.ts
// Server-side Newsletter Subscription Persistence (Supabase `newsletter_subscribers`)

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { checkRateLimit, NEWSLETTER_RATE_LIMIT, getClientIp } from '@/lib/services/rateLimiter';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`newsletter:${ip}`, NEWSLETTER_RATE_LIMIT);
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, message: 'Terlalu banyak permintaan. Silakan coba beberapa saat lagi.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const rawEmail = String(body.email || '').trim().toLowerCase();
    const source = String(body.source || 'footer').trim().slice(0, 50) || 'footer';

    if (!EMAIL_RE.test(rawEmail) || rawEmail.length > 200) {
      return NextResponse.json(
        { success: false, message: 'Masukkan alamat email yang valid.' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .upsert({ email: rawEmail, source }, { onConflict: 'email', ignoreDuplicates: true });

    if (error) {
      return NextResponse.json(
        { success: false, message: 'Gagal mendaftarkan email ke daftar langganan.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Terima kasih! Anda kini terdaftar untuk menerima info koleksi dan penawaran terbaru.',
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Permintaan tidak valid.' },
      { status: 400 }
    );
  }
}
