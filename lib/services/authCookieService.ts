// lib/services/authCookieService.ts
// Cookie autentikasi dikelola secara HttpOnly oleh server API routes.
// Client helper ini hanya membersihkan jejak cookie legacy saat logout.

export const COOKIE_USER_KEY = 'urbanstyle_auth_user';
export const COOKIE_ROLE_KEY = 'urbanstyle_auth_role';
export const COOKIE_TOKEN_KEY = 'urbanstyle_session_token';

export async function setAuthCookies(u: unknown | null): Promise<void> {
  if (typeof document === 'undefined') return;
  if (u) {
    // HttpOnly session cookies ditetapkan langsung oleh endpoint /api/auth/*
    return;
  }
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const secureFlag = isSecure ? '; Secure' : '';
  const clearFlags = `path=/; max-age=0; SameSite=Lax${secureFlag}`;
  document.cookie = `${COOKIE_USER_KEY}=; ${clearFlags}`;
  document.cookie = `${COOKIE_ROLE_KEY}=; ${clearFlags}`;
  document.cookie = `${COOKIE_TOKEN_KEY}=; ${clearFlags}`;
}
