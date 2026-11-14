// lib/services/couponService.ts
// Coupon & Promotional Voucher Engine (Validation, Atomic Quota Claim/Release, CRUD)

import { Coupon } from '../types';
import { INITIAL_COUPONS } from '../data/coupons.data';
import { supabase, checkSupabaseConfigured } from './supabaseClient';

const localCoupons: Coupon[] = [...INITIAL_COUPONS];

export const couponService = {
  async getCoupons(): Promise<Coupon[]> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/coupons', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json?.success && Array.isArray(json.data)) {
            return json.data as Coupon[];
          }
        }
      } catch {}
    }

    const dbReady = checkSupabaseConfigured();
    if (typeof window === 'undefined' && dbReady) {
      try {
        const { supabaseAdmin } = await import('../supabaseAdmin');
        const { data, error } = await supabaseAdmin
          .from('coupons')
          .select('*')
          .eq('is_active', true)
          .order('id', { ascending: true });
        if (!error && data) {
          return data as Coupon[];
        }
      } catch (err) {
        console.warn('Fetch coupons from supabase error:', err);
      }
    } else if (dbReady && supabase) {
      try {
        const { data, error } = await supabase
          .from('coupons')
          .select('*')
          .eq('is_active', true)
          .order('id', { ascending: true });
        if (!error && data) {
          return data as Coupon[];
        }
      } catch {}
    }
    return dbReady ? [] : localCoupons.filter((c) => c.is_active);
  },

  async getAllCoupons(): Promise<Coupon[]> {
    const dbReady = checkSupabaseConfigured();
    if (typeof window === 'undefined' && dbReady) {
      try {
        const { supabaseAdmin } = await import('../supabaseAdmin');
        const { data, error } = await supabaseAdmin
          .from('coupons')
          .select('*')
          .order('id', { ascending: true });
        if (!error && data) {
          return data as Coupon[];
        }
      } catch (err) {
        console.warn('Fetch all coupons error:', err);
      }
    } else if (dbReady && supabase) {
      try {
        const { data, error } = await supabase.from('coupons').select('*').order('id', { ascending: true });
        if (!error && data) {
          return data as Coupon[];
        }
      } catch (err) {
        console.warn('Fetch all coupons error:', err);
      }
    }
    return dbReady ? [] : [...localCoupons];
  },

  async validateCoupon(
    code: string,
    subtotal: number
  ): Promise<{
    valid: boolean;
    coupon?: Coupon;
    discount_amount: number;
    message: string;
  }> {
    if (!code || !code.trim()) {
      return { valid: false, discount_amount: 0, message: 'Kode kupon tidak boleh kosong.' };
    }

    const cleanCode = code.trim().toUpperCase();
    const coupons = await this.getAllCoupons();
    const found = coupons.find((c) => c.code.toUpperCase() === cleanCode);

    if (!found) {
      return {
        valid: false,
        discount_amount: 0,
        message: `Kode kupon "${cleanCode}" tidak ditemukan.`,
      };
    }

    if (!found.is_active) {
      return { valid: false, discount_amount: 0, message: `Kupon "${cleanCode}" sudah dinonaktifkan.` };
    }

    if (found.valid_until && new Date(found.valid_until).getTime() < Date.now()) {
      return {
        valid: false,
        discount_amount: 0,
        message: `Masa berlaku kupon "${cleanCode}" telah berakhir.`,
      };
    }

    if (found.usage_limit != null && Number(found.used_count || 0) >= Number(found.usage_limit)) {
      return { valid: false, discount_amount: 0, message: `Kuota penggunaan kupon "${cleanCode}" telah habis.` };
    }

    if (subtotal < Number(found.min_purchase || 0)) {
      const minFormatted = new Intl.NumberFormat('id-ID').format(Number(found.min_purchase || 0));
      return {
        valid: false,
        discount_amount: 0,
        message: `Minimal belanja untuk kupon ini adalah Rp ${minFormatted}.`,
      };
    }

    let calculatedDiscount = 0;
    const isPercentage = found.type === 'percentage' || (found.type as string) === 'percent';
    if (isPercentage) {
      calculatedDiscount = Math.round((subtotal * Number(found.discount_amount || 0)) / 100);
      if (found.max_discount && calculatedDiscount > Number(found.max_discount)) {
        calculatedDiscount = Number(found.max_discount);
      }
    } else {
      calculatedDiscount = Number(found.discount_amount || 0);
    }

    calculatedDiscount = Math.max(0, Math.min(calculatedDiscount, subtotal));

    return {
      valid: true,
      coupon: found,
      discount_amount: calculatedDiscount,
      message: `Kupon "${found.code}" berhasil diterapkan! Potongan Rp ${new Intl.NumberFormat('id-ID').format(calculatedDiscount)}.`,
    };
  },

  async createCoupon(newCoupon: Omit<Coupon, 'id' | 'used_count'>): Promise<Coupon> {
    if (typeof window === 'undefined' && checkSupabaseConfigured()) {
      const { supabaseAdmin } = await import('../supabaseAdmin');
      const { data, error } = await supabaseAdmin
        .from('coupons')
        .insert({
          code: newCoupon.code.trim().toUpperCase(),
          type: newCoupon.type,
          discount_amount: newCoupon.discount_amount,
          min_purchase: newCoupon.min_purchase,
          max_discount: newCoupon.max_discount ?? null,
          usage_limit: newCoupon.usage_limit,
          used_count: 0,
          is_active: newCoupon.is_active,
          description: newCoupon.description,
          valid_until: newCoupon.valid_until ?? null,
        })
        .select('*')
        .single();
      if (!error && data) return data as Coupon;
      throw new Error(error?.message || 'Gagal menyimpan kupon ke database.');
    }

    const created: Coupon = {
      ...newCoupon,
      id: localCoupons.length + 1,
      used_count: 0,
    };
    localCoupons.unshift(created);
    return created;
  },

  async toggleCouponStatus(couponId: number): Promise<boolean> {
    if (typeof window === 'undefined' && checkSupabaseConfigured()) {
      const { supabaseAdmin } = await import('../supabaseAdmin');
      const { data } = await supabaseAdmin
        .from('coupons')
        .select('is_active')
        .eq('id', couponId)
        .maybeSingle();
      if (!data) return false;
      const { error } = await supabaseAdmin
        .from('coupons')
        .update({ is_active: !data.is_active })
        .eq('id', couponId);
      return !error;
    }

    const c = localCoupons.find((item) => item.id === couponId);
    if (c) {
      c.is_active = !c.is_active;
      return true;
    }
    return false;
  },

  async deleteCoupon(couponId: number): Promise<boolean> {
    if (typeof window === 'undefined' && checkSupabaseConfigured()) {
      const { supabaseAdmin } = await import('../supabaseAdmin');
      const { error } = await supabaseAdmin.from('coupons').delete().eq('id', couponId);
      return !error;
    }
    const idx = localCoupons.findIndex((item) => item.id === couponId);
    if (idx !== -1) {
      localCoupons.splice(idx, 1);
      return true;
    }
    return false;
  },

  async claimCouponInDb(couponId: number): Promise<boolean> {
    if (typeof window !== 'undefined' || !checkSupabaseConfigured()) return false;
    try {
      const { supabaseAdmin } = await import('../supabaseAdmin');
      const { data, error } = await supabaseAdmin.rpc('atomic_claim_coupon', {
        p_coupon_id: couponId,
      });
      if (error) return false;
      return Boolean(data);
    } catch {
      return false;
    }
  },

  async releaseCouponInDb(couponId: number): Promise<void> {
    if (typeof window !== 'undefined' || !checkSupabaseConfigured()) return;
    try {
      const { supabaseAdmin } = await import('../supabaseAdmin');
      await supabaseAdmin.rpc('atomic_release_coupon', { p_coupon_id: couponId });
    } catch {}
  },

  async incrementCouponUsageInDb(couponId: number): Promise<void> {
    await this.claimCouponInDb(couponId);
  },

  _incrementCouponUsage(code: string) {
    const cleanCode = code.trim().toUpperCase();
    const coupon = localCoupons.find((c) => c.code.toUpperCase() === cleanCode);
    if (coupon && coupon.used_count < coupon.usage_limit) {
      coupon.used_count += 1;
    }
  },
};
