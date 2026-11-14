// lib/services/cryptoSession.ts
// Edge & Node.js Compatible HMAC-SHA256 Session Signing Utility (Zero Dependencies)
// Mengamankan Cookie RBAC & Sesi Pengguna UrbanStyle Store dari Pemalsuan Klien

function getSecret(): string {
  const secret =
    typeof process !== 'undefined' && process.env ? process.env.SESSION_SECRET : undefined;
  if (!secret || secret.trim().length < 16) {
    throw new Error(
      '[cryptoSession] Environment variable SESSION_SECRET wajib dikonfigurasi (minimal 16 karakter).'
    );
  }
  return secret;
}

function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

function constantTimeHexEqual(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function getSubtle(): SubtleCrypto {
  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle) {
    return globalThis.crypto.subtle;
  }
  throw new Error('Web Crypto API tidak tersedia di lingkungan runtime ini.');
}

export async function signSession(payload: string): Promise<string> {
  const subtle = getSubtle();
  const keyData = stringToBytes(getSecret());

  const cryptoKey = await subtle.importKey(
    'raw',
    keyData as unknown as BufferSource,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const payloadData = stringToBytes(payload);
  const signatureBuffer = await subtle.sign(
    'HMAC',
    cryptoKey,
    payloadData as unknown as BufferSource
  );

  return bufferToHex(signatureBuffer);
}

export async function createSessionToken(userId: string, role: string): Promise<string> {
  const timestamp = Date.now().toString();
  const rawData = `${role}:${userId}:${timestamp}`;
  const signature = await signSession(rawData);
  return `${rawData}:${signature}`;
}

export async function verifySessionToken(token?: string | null): Promise<{
  valid: boolean;
  userId?: string;
  role?: string;
  timestamp?: number;
}> {
  if (!token || typeof token !== 'string') {
    return { valid: false };
  }

  const parts = token.split(':');
  if (parts.length !== 4) {
    return { valid: false };
  }

  const [role, userId, timestampStr, providedSignature] = parts;
  if (!role || !userId || !/^\d+$/.test(timestampStr)) {
    return { valid: false };
  }

  const timestamp = Number(timestampStr);
  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return { valid: false };
  }

  // Tolak token masa depan (clock skew maksimal 60 detik) maupun kedaluwarsa > 7 hari
  const now = Date.now();
  const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
  const MAX_FUTURE_SKEW_MS = 60 * 1000;
  if (timestamp - now > MAX_FUTURE_SKEW_MS || now - timestamp > MAX_AGE_MS) {
    return { valid: false };
  }

  try {
    const rawData = `${role}:${userId}:${timestampStr}`;
    const expectedSignature = await signSession(rawData);

    if (!constantTimeHexEqual(providedSignature, expectedSignature)) {
      return { valid: false };
    }

    return {
      valid: true,
      userId,
      role,
      timestamp,
    };
  } catch {
    return { valid: false };
  }
}
