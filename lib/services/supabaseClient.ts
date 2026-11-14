// lib/services/supabaseClient.ts
// Supabase Client Initialization & Environment Helper (Lazy-loaded for CLI & Server support)

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;
let _clientKey = '';

export function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || '';
}

export function getSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
}

export function getServiceRoleKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

export function getEffectiveKey(): string {
  const srv = getServiceRoleKey();
  const anon = getSupabaseAnonKey();
  return typeof window === 'undefined' && srv ? srv : anon;
}

export function checkSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const key = getEffectiveKey();
  return Boolean(
    url &&
      key &&
      !url.includes('your-supabase') &&
      !key.includes('your-anon-key')
  );
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!checkSupabaseConfigured()) return null;
  const url = getSupabaseUrl();
  const key = getEffectiveKey();
  if (!_client || _clientKey !== key) {
    _client = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    _clientKey = key;
  }
  return _client;
}

export const supabaseUrl = getSupabaseUrl();
export const supabaseAnonKey = getSupabaseAnonKey();
export const serviceRoleKey = getServiceRoleKey();
export const effectiveKey = getEffectiveKey();
export const isSupabaseConfigured = checkSupabaseConfigured();

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client is not configured');
    }
    const val = (client as unknown as Record<string | symbol, unknown>)[prop];
    return typeof val === 'function' ? val.bind(client) : val;
  },
});
