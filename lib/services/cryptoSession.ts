// lib/services/cryptoSession.ts
// Edge & Node.js Compatible HMAC-SHA256 Session Signing Utility (Zero Dependencies)
// Mengamankan Cookie RBAC & Sesi Pengguna UrbanStyle Store dari Pemalsuan Klien


function getSecret(): string {
  const secret =
    (typeof process !== 'undefined' && process.env && process.env.SESSION_SECRET) ||
    'urbanstyle_auth_secret_key_2026_secure_hmac';
  return secret;
}

// Konversi string ke Uint8Array
function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Konversi ArrayBuffer ke Hex String
function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

/**
 * Akses Web Crypto Subtle secara universal (Edge Runtime, Node.js 18+, dan Browser)
 */
function getSubtle(): SubtleCrypto {
  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle) {
    return globalThis.crypto.subtle;
  }
  throw new Error('Web Crypto API tidak tersedia di lingkungan runtime ini.');
}

/**
 * Generate HMAC-SHA256 signature menggunakan Web Crypto API standar
 */
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

/**
 * Buat Signed Session Token lengkap: role:userId:timestamp:signature
 */
export async function createSessionToken(userId: string, role: string): Promise<string> {
  const timestamp = Date.now().toString();
  const rawData = `${role}:${userId}:${timestamp}`;
  const signature = await signSession(rawData);
  return `${rawData}:${signature}`;
}

/**
 * Verifikasi Session Token dari Cookie
 * Mengembalikan data sesi jika valid, atau null jika dipalsukan/kadaluwarsa
 */
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
  const timestamp = parseInt(timestampStr, 10);

  if (isNaN(timestamp)) {
    return { valid: false };
  }

  // Token kadaluwarsa setelah 7 hari
  const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - timestamp > MAX_AGE_MS) {
    return { valid: false };
  }

  const rawData = `${role}:${userId}:${timestampStr}`;
  const expectedSignature = await signSession(rawData);

  if (providedSignature !== expectedSignature) {
    return { valid: false };
  }

  return {
    valid: true,
    userId,
    role,
    timestamp,
  };
}
