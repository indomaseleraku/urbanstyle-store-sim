// lib/services/rateLimiter.ts
// In-process rate limiter untuk API routes Node.js runtime.
// Menggunakan sliding window counter per IP.
// Catatan: Di multi-instance deployment, gunakan Redis/Upstash untuk state terpusat.

interface RateLimitRecord {
  count: number;
  windowStart: number;
}

const store = new Map<string, RateLimitRecord>();

// Bersihkan entri kadaluwarsa setiap 10 menit untuk mencegah memory leak
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now - record.windowStart > CLEANUP_INTERVAL_MS) {
        store.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);
}

interface RateLimitConfig {
  /** Jumlah request maksimal dalam window */
  limit: number;
  /** Durasi window dalam milidetik */
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Periksa apakah key (biasanya IP:action) masih dalam batas rate limit.
 * Menggunakan fixed window counter.
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || now - existing.windowStart >= config.windowMs) {
    // Window baru
    store.set(key, { count: 1, windowStart: now });
    return {
      allowed: true,
      remaining: config.limit - 1,
      resetAt: now + config.windowMs,
    };
  }

  existing.count += 1;
  const allowed = existing.count <= config.limit;
  return {
    allowed,
    remaining: Math.max(0, config.limit - existing.count),
    resetAt: existing.windowStart + config.windowMs,
  };
}

/**
 * Konfigurasi standar untuk endpoint login:
 * Maksimal 10 percobaan per IP per 15 menit.
 */
export const LOGIN_RATE_LIMIT: RateLimitConfig = {
  limit: 10,
  windowMs: 15 * 60 * 1000,
};

/**
 * Konfigurasi standar untuk endpoint OTP send:
 * Maksimal 5 request per IP per 10 menit.
 */
export const OTP_RATE_LIMIT: RateLimitConfig = {
  limit: 5,
  windowMs: 10 * 60 * 1000,
};

/**
 * Konfigurasi untuk endpoint register:
 * Maksimal 5 registrasi per IP per jam.
 */
export const REGISTER_RATE_LIMIT: RateLimitConfig = {
  limit: 5,
  windowMs: 60 * 60 * 1000,
};

/**
 * Konfigurasi untuk endpoint reset password:
 * Maksimal 5 percobaan reset per IP per 15 menit.
 */
export const RESET_PASSWORD_RATE_LIMIT: RateLimitConfig = {
  limit: 5,
  windowMs: 15 * 60 * 1000,
};

/**
 * Ambil IP address dari NextRequest headers.
 */
export function getClientIp(req: { headers: { get(name: string): string | null } }): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}
