// lib/services/supabaseClient.ts
// Supabase Client Initialization & Environment Helper

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
export const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const effectiveKey = (typeof window === 'undefined' && serviceRoleKey) 
  ? serviceRoleKey 
  : supabaseAnonKey;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  (effectiveKey || supabaseAnonKey) && 
  !supabaseUrl.includes('your-supabase') &&
  !supabaseAnonKey.includes('your-anon-key')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, effectiveKey)
  : null;
