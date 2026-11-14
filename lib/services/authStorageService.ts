// lib/services/authStorageService.ts
// Authentication Storage Service — delegates credential ops to server-side API routes
// No plaintext password comparison happens on the client side.

import { UserProfile } from '../types';
import { setAuthCookies } from './authCookieService';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const SESSION_KEY = 'urbanstyle_session';

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
  await setAuthCookies(user);
}


// ─── Registration — delegates to /api/auth/register (bcrypt on server) ─────

export async function saveRegisteredCredential(
  user: UserProfile,
  password: string
): Promise<{ success: boolean; user?: UserProfile; token?: string; message?: string }> {
  if (typeof window === 'undefined') {
    try {
      const { supabaseAdmin } = await import('../supabaseAdmin');
      const bcrypt = (await import('bcryptjs')).default;
      const cleanEmail = user.email.toLowerCase().trim();
      const hash = await bcrypt.hash(password.trim(), 12);
      const { data, error } = await supabaseAdmin
        .from('user_credentials')
        .upsert(
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
        )
        .select('id, email, full_name, role, preferred_size, created_at')
        .maybeSingle();
      if (!error && data) {
        return {
          success: true,
          user: {
            id: data.id,
            email: data.email,
            full_name: data.full_name,
            role: data.role,
            preferred_size: data.preferred_size || 'M',
            created_at: data.created_at,
          },
        };
      }
      return { success: false, message: error?.message || 'Gagal menyimpan akun ke database.' };
    } catch (err) {
      console.warn('Server credential save error:', err);
      return { success: false, message: 'Gagal menyimpan akun ke server.' };
    }
  }

  try {
    const res = await fetch('/api/auth/register', {
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
    const data = await res.json();
    if (res.ok && data?.success && data.user) {
      return { success: true, user: data.user as UserProfile, token: data.token };
    }
    return {
      success: false,
      message: data?.message || 'Pendaftaran gagal. Silakan periksa kembali data Anda.',
    };
  } catch (err) {
    console.warn('Register API call failed:', err);
    return { success: false, message: 'Gagal terhubung ke server pendaftaran.' };
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

// ─── Google OAuth ───────────────────────────────────────────────────────────

export async function resolveOrCreateGoogleUser(
  googleEmail: string,
  googleName: string,
  accessToken?: string
): Promise<{ success: boolean; user?: UserProfile; token?: string; message?: string }> {
  const cleanEmail = googleEmail.toLowerCase().trim();

  if (typeof window !== 'undefined') {
    if (!accessToken) {
      return { success: false, message: 'Token autentikasi Google tidak tersedia.' };
    }
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, email: cleanEmail, name: googleName }),
      });
      const data = await res.json();
      if (res.ok && data?.success && data.user) {
        return { success: true, user: data.user as UserProfile };
      }
      return {
        success: false,
        message: data?.message || 'Gagal memproses akun Google di server.',
      };
    } catch {
      return { success: false, message: 'Gagal terhubung ke layanan autentikasi Google.' };
    }
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();
      if (data) {
        return {
          success: true,
          user: {
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
          },
        };
      }
    } catch {}
  }

  return { success: false, message: 'Akun Google tidak dapat disinkronkan saat ini.' };
}
