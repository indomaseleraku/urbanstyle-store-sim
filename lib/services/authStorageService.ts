// lib/services/authStorageService.ts
// Authentication Storage Service — delegates credential ops to server-side API routes
// No plaintext password comparison happens on the client side.

import { UserProfile } from '../types';
import { INITIAL_USERS } from '../mock-data';
import { setAuthCookies } from './authCookieService';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const SESSION_KEY = 'urbanstyle_session';
const REGISTERED_KEY = 'urbanstyle_registered_users';

// ─── Session Persistence ────────────────────────────────────────────────────

export function loadUserSession(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function persistUserSession(user: UserProfile | null, token?: string): Promise<void> {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
  await setAuthCookies(user, token);
}


// ─── Registration — delegates to /api/auth/register (bcrypt on server) ─────

export async function saveRegisteredCredential(user: UserProfile, password: string): Promise<void> {
  saveLocalRegisteredUser(user);

  if (typeof window === 'undefined') {
    try {
      const { supabaseAdmin } = await import('../supabaseAdmin');
      const bcrypt = (await import('bcryptjs')).default;
      const cleanEmail = user.email.toLowerCase().trim();
      const hash = await bcrypt.hash(password.trim(), 12);
      await supabaseAdmin.from('user_credentials').upsert(
        {
          email: cleanEmail,
          password_hash: hash,
          role: user.role || 'customer',
          full_name: user.full_name,
          phone: user.phone || null,
          preferred_size: user.preferred_size || 'M',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      );
    } catch (err) {
      console.warn('Server credential save error:', err);
    }
    return;
  }

  try {
    await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        password,
        full_name: user.full_name,
        preferred_size: user.preferred_size || 'M',
        phone: user.phone || null,
      }),
    });
  } catch (err) {
    console.warn('Register API call failed:', err);
  }
}

// ─── Login Validation — delegates to /api/auth/login (bcrypt on server) ────

export async function validateUserPassword(
  email: string,
  pass: string
): Promise<{ valid: boolean; user?: UserProfile; message?: string; token?: string }> {
  const cleanEmail = email.toLowerCase().trim();
  const cleanPass = pass.trim();

  // Jika dipanggil di lingkungan Node.js (misal unit testing / SSR)
  if (typeof window === 'undefined') {
    try {
      const { supabaseAdmin } = await import('../supabaseAdmin');
      const bcrypt = (await import('bcryptjs')).default;

      const { data, error } = await supabaseAdmin
        .from('user_credentials')
        .select('id, email, full_name, role, phone, preferred_size, password_hash, created_at')
        .eq('email', cleanEmail)
        .maybeSingle();


      if (!error && data) {
        let passwordValid = false;
        if (!data.password_hash.startsWith('$2')) {
          passwordValid = data.password_hash === cleanPass;
        } else {
          passwordValid = await bcrypt.compare(cleanPass, data.password_hash);
        }

        if (passwordValid) {
          const u: UserProfile = {
            id: data.id,
            email: data.email,
            full_name: data.full_name,
            role: data.role || 'customer',
            phone: data.phone || undefined,
            preferred_size: data.preferred_size || 'M',
            created_at: data.created_at,
          };
          return { valid: true, user: u };
        }
      }
      return { valid: false, message: 'Kata sandi salah.' };
    } catch (err) {
      console.error('validateUserPassword server error:', err);
      return { valid: false, message: 'Autentikasi server gagal.' };
    }
  }

  // Jika dipanggil di browser, panggil API route /api/auth/login
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
    });
    const data = await res.json();
    if (data.success && data.user) {
      return { valid: true, user: data.user as UserProfile, token: data.token };
    }
    return { valid: false, message: data.message || 'Kata sandi salah.' };
  } catch {
    return { valid: false, message: 'Koneksi ke server autentikasi gagal. Periksa koneksi internet Anda.' };
  }
}

// ─── Password Reset — delegates to /api/auth/reset-password ────────────────

export async function resetUserPassword(
  email: string,
  newPassword: string,
  otp?: string,
  otpToken?: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        new_password: newPassword,
        otp,
        otp_token: otpToken,
      }),
    });
    const data = await res.json();
    return {
      success: Boolean(data.success),
      message: data.message,
    };
  } catch {
    return {
      success: false,
      message: 'Koneksi ke server reset kata sandi gagal.',
    };
  }
}

// ─── Staff Authentication — delegates to /api/auth/login (staff_only) ──────

export async function authenticateStaff(
  cleanEmail: string,
  pass: string
): Promise<{ success: boolean; user?: UserProfile; message?: string; token?: string }> {
  if (!pass || pass.trim().length === 0) {
    return { success: false, message: 'Kata sandi wajib diisi untuk portal staf.' };
  }

  // Jika dipanggil di lingkungan Node.js (misal unit testing / SSR)
  if (typeof window === 'undefined') {
    try {
      const { supabaseAdmin } = await import('../supabaseAdmin');
      const bcrypt = (await import('bcryptjs')).default;

      const { data, error } = await supabaseAdmin
        .from('user_credentials')
        .select('*')
        .eq('email', cleanEmail)
        .in('role', ['admin', 'owner', 'gudang', 'kasir'])
        .maybeSingle();

      if (!error && data) {
        let passwordValid = false;
        if (!data.password_hash.startsWith('$2')) {
          passwordValid = data.password_hash === pass.trim();
        } else {
          passwordValid = await bcrypt.compare(pass.trim(), data.password_hash);
        }

        if (passwordValid) {
          const user: UserProfile = {
            id: data.id,
            email: data.email,
            full_name: data.full_name,
            role: data.role as UserProfile['role'],
            staff_role: (data.role === 'admin' ? 'owner' : data.role) as UserProfile['staff_role'],
            phone: data.phone || undefined,
            preferred_size: data.preferred_size || 'M',
            created_at: data.created_at,
          };
          return { success: true, user };
        }
      }
      return { success: false, message: 'Akses ditolak.' };
    } catch {
      return { success: false, message: 'Autentikasi gagal.' };
    }
  }

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password: pass, staff_only: true }),
    });
    const data = await res.json();
    if (data.success && data.user) {
      return { success: true, user: data.user as UserProfile, token: data.token };
    }
    return { success: false, message: data.message || 'Akses ditolak.' };
  } catch {
    return { success: false, message: 'Koneksi ke server autentikasi gagal.' };
  }
}

// ─── Local User Utilities ───────────────────────────────────────────────────

export function resolveMemberUser(cleanEmail: string): UserProfile | null {
  const found = INITIAL_USERS.find((u) => u.email.toLowerCase() === cleanEmail);
  return found || findLocalRegisteredUser(cleanEmail);
}

export function findLocalRegisteredUser(cleanEmail: string): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(REGISTERED_KEY);
    if (!raw) return null;
    const users: UserProfile[] = JSON.parse(raw);
    return users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
  } catch {
    return null;
  }
}

export function saveLocalRegisteredUser(user: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(REGISTERED_KEY);
    const users: UserProfile[] = raw ? JSON.parse(raw) : [];
    const exists = users.some((u) => u.email.toLowerCase() === user.email.toLowerCase());
    if (!exists) {
      users.push(user);
      localStorage.setItem(REGISTERED_KEY, JSON.stringify(users));
    }
  } catch {}
}

// ─── Google OAuth ───────────────────────────────────────────────────────────

export async function resolveOrCreateGoogleUser(
  googleEmail: string,
  googleName: string
): Promise<UserProfile> {
  const cleanEmail = googleEmail.toLowerCase().trim();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();
      if (data) {
        return {
          id: data.id,
          email: data.email || cleanEmail,
          full_name: data.full_name || googleName,
          role: (data.role as UserProfile['role']) || 'customer',
          phone: data.phone || undefined,
          address_line: data.address_line || undefined,
          city: data.city || undefined,
          postal_code: data.postal_code || undefined,
          preferred_size: data.preferred_size || 'M',
          created_at: data.created_at,
        };
      }
    } catch {}
  }

  const existing =
    INITIAL_USERS.find((u) => u.email.toLowerCase() === cleanEmail) ||
    findLocalRegisteredUser(cleanEmail);
  if (existing) return existing;

  const newProfile: UserProfile = {
    id: `usr_google_${Date.now()}`,
    email: cleanEmail,
    full_name: googleName.trim() || cleanEmail.split('@')[0].toUpperCase(),
    role: 'customer',
    preferred_size: 'L',
    created_at: new Date().toISOString(),
  };
  saveLocalRegisteredUser(newProfile);
  return newProfile;
}
