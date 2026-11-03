// lib/services/authCookieService.ts
import { UserProfile } from '../types';

export const COOKIE_USER_KEY = 'urbanstyle_auth_user';
export const COOKIE_ROLE_KEY = 'urbanstyle_auth_role';
export const COOKIE_TOKEN_KEY = 'urbanstyle_session_token';

export async function setAuthCookies(u: UserProfile | null, token?: string): Promise<void> {
  if (typeof document === 'undefined') return;
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const secureFlag = isSecure ? '; Secure' : '';
  const baseFlags = `path=/; max-age=604800; SameSite=Lax${secureFlag}`;

  if (u) {
    document.cookie = `${COOKIE_USER_KEY}=${u.id}; ${baseFlags}`;
    document.cookie = `${COOKIE_ROLE_KEY}=${u.role}; ${baseFlags}`;
    if (token) {
      document.cookie = `${COOKIE_TOKEN_KEY}=${token}; ${baseFlags}`;
    }
  } else {
    const clearFlags = `path=/; max-age=0; SameSite=Lax${secureFlag}`;
    document.cookie = `${COOKIE_USER_KEY}=; ${clearFlags}`;
    document.cookie = `${COOKIE_ROLE_KEY}=; ${clearFlags}`;
    document.cookie = `${COOKIE_TOKEN_KEY}=; ${clearFlags}`;
  }
}
