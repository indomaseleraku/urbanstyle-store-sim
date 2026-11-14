// lib/services/rateLimiter.ts
// In-process rate limiter untuk API routes Node.js runtime dengan batas kapasitas map.

interface RateLimitRecord {
  count: number;
  windowStart: number;
}

const store = new Map<string, RateLimitRecord>();
const MAX_STORE_ENTRIES = 10_000;
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;

if (typeof setInterval !== 'undefined') {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now - record.windowStart > CLEANUP_INTERVAL_MS) {
        store.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);
  if (typeof (timer as unknown as { unref?: () => void }).unref === 'function') {
    (timer as unknown as { unref: () => void }).unref();
  }
}

interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || now - existing.windowStart >= config.windowMs) {
    if (!existing && store.size >= MAX_STORE_ENTRIES) {
      const oldestKey = store.keys().next().value;
      if (oldestKey) store.delete(oldestKey);
    }
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

export const LOGIN_RATE_LIMIT: RateLimitConfig = { limit: 10, windowMs: 15 * 60 * 1000 };
export const OTP_RATE_LIMIT: RateLimitConfig = { limit: 5, windowMs: 10 * 60 * 1000 };
export const OTP_VERIFY_RATE_LIMIT: RateLimitConfig = { limit: 15, windowMs: 10 * 60 * 1000 };
export const REGISTER_RATE_LIMIT: RateLimitConfig = { limit: 5, windowMs: 60 * 60 * 1000 };
export const RESET_PASSWORD_RATE_LIMIT: RateLimitConfig = { limit: 5, windowMs: 15 * 60 * 1000 };
export const REVIEW_RATE_LIMIT: RateLimitConfig = { limit: 10, windowMs: 15 * 60 * 1000 };
export const NEWSLETTER_RATE_LIMIT: RateLimitConfig = { limit: 10, windowMs: 15 * 60 * 1000 };

/**
 * Ambil IP address secara aman dengan fallback berurutan & pembatasan panjang string.
 */
export function getClientIp(req: {
  ip?: string;
  headers: { get(name: string): string | null };
}): string {
  const platformIp = typeof req.ip === 'string' ? req.ip.trim() : '';
  const realIp = (req.headers.get('x-real-ip') || '').trim();
  const forwarded = (req.headers.get('x-forwarded-for') || '')
    .split(',')[0]
    ?.trim();

  const raw = platformIp || realIp || forwarded || 'unknown';
  return raw.replace(/[^a-zA-Z0-9.:_-]/g, '').slice(0, 64) || 'unknown';
}
