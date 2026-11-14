// lib/services/sessionServerHelper.ts
// Node.js Server Route Session, Staff DB Status Verification & Constant-Time Helpers

import crypto from 'crypto';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from './cryptoSession';
import { supabaseAdmin } from '../supabaseAdmin';

export const STAFF_ROLES = ['admin', 'owner', 'gudang', 'kasir'] as const;

export function extractRequestSessionToken(req: NextRequest): string | undefined {
  const cookieToken = req.cookies.get('urbanstyle_session_token')?.value;
  if (cookieToken) return cookieToken;
  const authHeader = req.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return undefined;
}

export async function getRequestSession(req: NextRequest) {
  return verifySessionToken(extractRequestSessionToken(req));
}

export interface VerifiedStaffSession {
  userId: string;
  email: string;
  fullName: string;
  role: 'owner' | 'gudang' | 'kasir';
}

/**
 * Verifikasi sesi staf terhadap `user_credentials` dan `staff_users` di DB
 * sehingga staf yang sudah dinonaktifkan/dihapus langsung tertolak.
 */
export async function requireVerifiedStaff(
  req: NextRequest,
  allowedRoles: readonly string[] = STAFF_ROLES
): Promise<VerifiedStaffSession | null> {
  const session = await getRequestSession(req);
  if (!session.valid || !session.userId || !session.role) {
    return null;
  }

  if (!allowedRoles.includes(session.role)) {
    return null;
  }

  const { data: cred, error: credErr } = await supabaseAdmin
    .from('user_credentials')
    .select('id, email, full_name, role')
    .eq('id', session.userId)
    .maybeSingle();

  if (credErr || !cred || !allowedRoles.includes(cred.role)) {
    return null;
  }

  const { data: staffRow, error: staffErr } = await supabaseAdmin
    .from('staff_users')
    .select('id, name, role, is_active, status')
    .eq('email', cred.email.toLowerCase())
    .maybeSingle();

  if (staffErr || !staffRow) {
    return null;
  }

  if (staffRow.is_active === false || staffRow.status === 'inactive') {
    return null;
  }

  const effectiveRole =
    cred.role === 'admin' || staffRow.role === 'owner' || staffRow.role === 'admin'
      ? 'owner'
      : (staffRow.role as 'owner' | 'gudang' | 'kasir');

  return {
    userId: String(cred.id),
    email: String(cred.email).toLowerCase(),
    fullName: String(staffRow.name || cred.full_name || cred.email),
    role: effectiveRole,
  };
}

export function constantTimeStringEqual(a: string, b: string): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function applySessionCookieToResponse<
  T extends { cookies: { set(name: string, value: string, opts: Record<string, unknown>): unknown } }
>(response: T, userId: string, role: string, token: string): T {
  const isSecure = process.env.NODE_ENV === 'production';
  const maxAge = 7 * 24 * 60 * 60;

  // Token kriptografi dikunci HttpOnly agar tidak dapat dibaca oleh JS/XSS
  response.cookies.set('urbanstyle_session_token', token, {
    path: '/',
    maxAge,
    sameSite: 'lax',
    httpOnly: true,
    secure: isSecure,
  });

  // Marker ringan non-sensitif (diverifikasi ulang oleh server token)
  response.cookies.set('urbanstyle_auth_user', userId, {
    path: '/',
    maxAge,
    sameSite: 'lax',
    httpOnly: true,
    secure: isSecure,
  });
  response.cookies.set('urbanstyle_auth_role', role, {
    path: '/',
    maxAge,
    sameSite: 'lax',
    httpOnly: true,
    secure: isSecure,
  });

  return response;
}
