// lib/services/staffService.ts
// Staff Management & Member Profile / Address Domain Service (Supabase Single Source of Truth)

import { UserProfile, UserAddress, StaffUser, StaffRole } from '../types';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function normalizeStaffRole(role: string): StaffRole {
  return role === 'admin' ? 'owner' : (role as StaffRole);
}

export const staffService = {
  async getStaffList(): Promise<StaffUser[]> {
    if (typeof window !== 'undefined') return [];
    try {
      const { supabaseAdmin } = await import('../supabaseAdmin');
      const { data, error } = await supabaseAdmin
        .from('staff_users')
        .select('id, name, email, phone, role, is_active, status, created_at')
        .order('created_at', { ascending: true });

      if (error || !data) return [];
      return data.map((s) => ({
        id: String(s.id),
        full_name: String(s.name || ''),
        email: String(s.email || ''),
        phone: String(s.phone || ''),
        role: normalizeStaffRole(String(s.role || 'kasir')),
        is_active: s.is_active !== false && s.status !== 'inactive',
        created_at: s.created_at ? String(s.created_at).slice(0, 10) : new Date().toISOString().slice(0, 10),
      }));
    } catch (err) {
      console.warn('Fetch staff from Supabase staff_users error:', err);
      return [];
    }
  },

  async createStaff(newStaffData: Omit<StaffUser, 'id' | 'created_at'>): Promise<StaffUser> {
    if (typeof window !== 'undefined') {
      throw new Error('Penambahan staf hanya dapat dilakukan melalui server.');
    }
    const { supabaseAdmin } = await import('../supabaseAdmin');
    const { data, error } = await supabaseAdmin
      .from('staff_users')
      .insert({
        name: newStaffData.full_name.trim(),
        email: newStaffData.email.toLowerCase().trim(),
        phone: newStaffData.phone || '',
        role: newStaffData.role,
        is_active: newStaffData.is_active !== false,
        status: newStaffData.is_active === false ? 'inactive' : 'active',
      })
      .select('id, name, email, phone, role, is_active, created_at')
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Gagal menambahkan staf ke database.');
    }

    return {
      id: String(data.id),
      full_name: String(data.name || ''),
      email: String(data.email || ''),
      phone: String(data.phone || ''),
      role: normalizeStaffRole(String(data.role || newStaffData.role)),
      is_active: Boolean(data.is_active),
      created_at: data.created_at ? String(data.created_at).slice(0, 10) : new Date().toISOString().slice(0, 10),
    };
  },

  async toggleStaffStatus(staffId: string): Promise<boolean> {
    if (typeof window !== 'undefined') return false;
    const { supabaseAdmin } = await import('../supabaseAdmin');
    const { data, error } = await supabaseAdmin
      .from('staff_users')
      .select('is_active, status')
      .eq('id', staffId)
      .maybeSingle();

    if (error || !data) return false;
    const nextActive = !(data.is_active !== false && data.status !== 'inactive');
    const { error: updateErr } = await supabaseAdmin
      .from('staff_users')
      .update({ is_active: nextActive, status: nextActive ? 'active' : 'inactive' })
      .eq('id', staffId);

    return !updateErr;
  },

  async getUserProfile(userIdOrEmail: string): Promise<UserProfile | null> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/account/profile', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json?.success && json.data) return json.data as UserProfile;
        }
      } catch {}
      return null;
    }

    try {
      const { supabaseAdmin } = await import('../supabaseAdmin');
      const isUuid = UUID_REGEX.test(userIdOrEmail.trim());
      const profileQuery = supabaseAdmin.from('profiles').select('*');
      const { data: profile } = isUuid
        ? await profileQuery.eq('id', userIdOrEmail.trim()).maybeSingle()
        : await profileQuery.eq('email', userIdOrEmail.toLowerCase().trim()).maybeSingle();

      if (profile) return profile as UserProfile;

      const credQuery = supabaseAdmin
        .from('user_credentials')
        .select('id, email, full_name, role, phone, preferred_size, created_at');
      const { data: cred } = isUuid
        ? await credQuery.eq('id', userIdOrEmail.trim()).maybeSingle()
        : await credQuery.eq('email', userIdOrEmail.toLowerCase().trim()).maybeSingle();

      if (!cred) return null;
      return {
        id: String(cred.id),
        email: String(cred.email),
        full_name: String(cred.full_name || cred.email),
        role: (cred.role as UserProfile['role']) || 'customer',
        phone: cred.phone || undefined,
        preferred_size: (cred.preferred_size as UserProfile['preferred_size']) || 'M',
        created_at: cred.created_at,
      };
    } catch (err) {
      console.warn('Supabase profile fetch error:', err);
      return null;
    }
  },

  async updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile | null> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/account/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileData),
        });
        const json = await res.json();
        if (res.ok && json?.success && json.data) {
          return json.data as UserProfile;
        }
      } catch {}
      return null;
    }

    const { supabaseAdmin } = await import('../supabaseAdmin');
    const cleanPayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (typeof profileData.full_name === 'string') cleanPayload.full_name = profileData.full_name;
    if (typeof profileData.phone === 'string') cleanPayload.phone = profileData.phone;
    if (typeof profileData.preferred_size === 'string') cleanPayload.preferred_size = profileData.preferred_size;
    if (typeof profileData.address_line === 'string') cleanPayload.address_line = profileData.address_line;
    if (typeof profileData.city === 'string') cleanPayload.city = profileData.city;
    if (typeof profileData.postal_code === 'string') cleanPayload.postal_code = profileData.postal_code;

    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (existing) {
      const { data: updated, error } = await supabaseAdmin
        .from('profiles')
        .update(cleanPayload)
        .eq('id', userId)
        .select('*')
        .single();
      if (error) throw new Error(error.message);
      return updated as UserProfile;
    }

    const { data: cred } = await supabaseAdmin
      .from('user_credentials')
      .select('id, email, full_name, role, phone, preferred_size')
      .eq('id', userId)
      .maybeSingle();

    if (!cred) {
      throw new Error('Akun pengguna tidak ditemukan.');
    }

    const { data: upserted, error: upsertErr } = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          id: cred.id,
          email: cred.email,
          full_name: (cleanPayload.full_name as string) || cred.full_name,
          role: cred.role || 'customer',
          phone: (cleanPayload.phone as string) ?? cred.phone ?? null,
          preferred_size: (cleanPayload.preferred_size as string) || cred.preferred_size || 'M',
          address_line: (cleanPayload.address_line as string) || null,
          city: (cleanPayload.city as string) || null,
          postal_code: (cleanPayload.postal_code as string) || null,
          updated_at: cleanPayload.updated_at as string,
        },
        { onConflict: 'email' }
      )
      .select('*')
      .single();

    if (upsertErr) throw new Error(upsertErr.message);
    return upserted as UserProfile;
  },

  async getUserAddresses(userId: string): Promise<UserAddress[]> {
    if (!userId) return [];
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/account/addresses', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json?.success && Array.isArray(json.data)) {
            return json.data as UserAddress[];
          }
        }
      } catch {}
      return [];
    }

    const { supabaseAdmin } = await import('../supabaseAdmin');
    const { data, error } = await supabaseAdmin
      .from('user_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });
    if (error) {
      throw new Error(error.message || 'Gagal memuat daftar alamat.');
    }
    return (data || []) as UserAddress[];
  },

  async addUserAddress(address: Omit<UserAddress, 'id'>): Promise<UserAddress> {
    const newAddr: UserAddress = {
      ...address,
      id: `addr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    };

    if (typeof window !== 'undefined') {
      const res = await fetch('/api/account/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAddr),
      });
      const json = await res.json();
      if (!res.ok || !json?.success || !json.data) {
        throw new Error(json?.message || 'Gagal menyimpan alamat baru.');
      }
      return json.data as UserAddress;
    }

    const { supabaseAdmin } = await import('../supabaseAdmin');
    if (newAddr.is_default) {
      const { error: resetErr } = await supabaseAdmin
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', address.user_id);
      if (resetErr) throw new Error(resetErr.message);
    }

    const { data, error } = await supabaseAdmin
      .from('user_addresses')
      .insert(newAddr)
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Gagal menambah alamat ke database.');
    }
    return data as UserAddress;
  },

  async deleteUserAddress(addressId: string, userId?: string): Promise<boolean> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch(`/api/account/addresses?id=${encodeURIComponent(addressId)}`, {
          method: 'DELETE',
        });
        return res.ok;
      } catch {
        return false;
      }
    }

    const { supabaseAdmin } = await import('../supabaseAdmin');
    let query = supabaseAdmin.from('user_addresses').delete().eq('id', addressId);
    if (userId) query = query.eq('user_id', userId);
    const { data, error } = await query.select('id');
    return !error && Boolean(data && data.length > 0);
  },

  async setDefaultAddress(userId: string, addressId: string): Promise<boolean> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/account/addresses', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address_id: addressId }),
        });
        return res.ok;
      } catch {
        return false;
      }
    }

    const { supabaseAdmin } = await import('../supabaseAdmin');
    // Pastikan alamat target dimiliki oleh user ini sebelum menghapus flag default lainnya
    const { data: targetAddr, error: targetErr } = await supabaseAdmin
      .from('user_addresses')
      .select('id')
      .eq('id', addressId)
      .eq('user_id', userId)
      .maybeSingle();

    if (targetErr || !targetAddr) return false;

    const { error: resetErr } = await supabaseAdmin
      .from('user_addresses')
      .update({ is_default: false })
      .eq('user_id', userId);
    if (resetErr) return false;

    const { error: setErr } = await supabaseAdmin
      .from('user_addresses')
      .update({ is_default: true })
      .eq('id', addressId)
      .eq('user_id', userId);
    return !setErr;
  },
};
