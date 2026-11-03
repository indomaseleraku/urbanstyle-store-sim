// lib/services/couponService.ts
// Coupon & Promotional Voucher Engine (Validation, Limits, CRUD)

import { Coupon } from '../types';
import { INITIAL_COUPONS } from '../data/coupons.data';
import { supabase, isSupabaseConfigured } from './supabaseClient';

let localCoupons: Coupon[] = [...INITIAL_COUPONS];

export const couponService = {
  async getCoupons(): Promise<Coupon[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('coupons').select('*').eq('is_active', true);
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn('Fetch coupons from supabase error, using fallback:', err);
      }
    }
    return localCoupons.filter(c => c.is_active);
  },

  async getAllCoupons(): Promise<Coupon[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('coupons').select('*').order('id', { ascending: true });
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn('Fetch all coupons error:', err);
      }
    }
    return [...localCoupons];
  },

  async validateCoupon(code: string, subtotal: number): Promise<{
    valid: boolean;
    coupon?: Coupon;
    discount_amount: number;
    message: string;
  }> {
    if (!code || !code.trim()) {
      return { valid: false, discount_amount: 0, message: 'Kode kupon tidak boleh kosong.' };
    }

    const cleanCode = code.trim().toUpperCase();
    const coupons = await this.getCoupons();
    const found = coupons.find(c => c.code.toUpperCase() === cleanCode);

    if (!found) {
      return { valid: false, discount_amount: 0, message: `Kode kupon "${cleanCode}" tidak ditemukan atau sudah tidak berlaku.` };
    }

    if (!found.is_active) {
      return { valid: false, discount_amount: 0, message: `Kupon "${cleanCode}" sudah dinonaktifkan.` };
    }

    if (found.used_count >= found.usage_limit) {
      return { valid: false, discount_amount: 0, message: `Kuota penggunaan kupon "${cleanCode}" telah habis.` };
    }

    if (subtotal < found.min_purchase) {
      const minFormatted = new Intl.NumberFormat('id-ID').format(found.min_purchase);
      return { 
        valid: false, 
        discount_amount: 0, 
        message: `Minimal belanja untuk kupon ini adalah Rp ${minFormatted}.` 
      };
    }

    let calculatedDiscount = 0;
    if (found.type === 'percentage') {
      calculatedDiscount = Math.round((subtotal * found.discount_amount) / 100);
      if (found.max_discount && calculatedDiscount > found.max_discount) {
        calculatedDiscount = found.max_discount;
      }
    } else {
      calculatedDiscount = found.discount_amount;
    }

    calculatedDiscount = Math.min(calculatedDiscount, subtotal);

    return {
      valid: true,
      coupon: found,
      discount_amount: calculatedDiscount,
      message: `Kupon "${found.code}" berhasil diterapkan! Potongan Rp ${new Intl.NumberFormat('id-ID').format(calculatedDiscount)}.`,
    };
  },

  async createCoupon(newCoupon: Omit<Coupon, 'id' | 'used_count'>): Promise<Coupon> {
    const created: Coupon = {
      ...newCoupon,
      id: localCoupons.length + 1,
      used_count: 0,
    };
    localCoupons.unshift(created);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('coupons').insert({
          code: created.code,
          type: created.type,
          discount_amount: created.discount_amount,
          min_purchase: created.min_purchase,
          max_discount: created.max_discount,
          usage_limit: created.usage_limit,
          used_count: 0,
          is_active: created.is_active,
          description: created.description,
        });
      } catch (err) {
        console.warn('Gagal simpan kupon ke Supabase:', err);
      }
    }

    return created;
  },

  async toggleCouponStatus(couponId: number): Promise<boolean> {
    const c = localCoupons.find(item => item.id === couponId);
    if (c) {
      c.is_active = !c.is_active;
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('coupons').update({ is_active: c.is_active }).eq('id', couponId);
        } catch (err) {
          console.warn('Update coupon status error:', err);
        }
      }
      return true;
    }
    return false;
  },

  async deleteCoupon(couponId: number): Promise<boolean> {
    localCoupons = localCoupons.filter(item => item.id !== couponId);
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('coupons').delete().eq('id', couponId);
      } catch (err) {
        console.warn('Delete coupon error:', err);
      }
    }
    return true;
  },

  _incrementCouponUsage(code?: string) {
    if (!code) return;
    const target = localCoupons.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (target) {
      target.used_count += 1;
    }
  }
};
