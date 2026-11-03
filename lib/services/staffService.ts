// lib/services/staffService.ts
// Staff Management & Multi-Role RBAC Domain Service

import { UserProfile, UserAddress, StaffUser, StaffRole } from '../types';
import { INITIAL_USERS, INITIAL_ADDRESSES } from '../data/users.data';
import { supabase, isSupabaseConfigured } from './supabaseClient';

let localUsers: UserProfile[] = [...INITIAL_USERS];
let localAddresses: UserAddress[] = [...INITIAL_ADDRESSES];
let localStaff: StaffUser[] = [
  {
    id: 'stf_1',
    email: 'admin@urbanstyle.com',
    full_name: 'Administrator (Owner Store)',
    phone: '081199887766',
    role: 'owner',
    is_active: true,
    created_at: '2026-08-01',
  },
  {
    id: 'stf_2',
    email: 'gudang@urbanstyle.com',
    full_name: 'Staf Logistik & Gudang',
    phone: '081122334455',
    role: 'gudang',
    is_active: true,
    created_at: '2026-09-01',
  },
  {
    id: 'stf_3',
    email: 'kasir@urbanstyle.com',
    full_name: 'Staf Kasir & Finance',
    phone: '081177665544',
    role: 'kasir',
    is_active: true,
    created_at: '2026-09-01',
  },
];

export const staffService = {
  async getStaffList(): Promise<StaffUser[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .in('role', ['admin', 'owner', 'gudang', 'kasir'])
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((p: any) => {
            const roleNorm: StaffRole = p.role === 'admin' ? 'owner' : (p.role as StaffRole);
            const email = p.id === 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22' ? 'admin@urbanstyle.com' :
                          p.role === 'gudang' ? 'gudang@urbanstyle.com' :
                          p.role === 'kasir' ? 'kasir@urbanstyle.com' : `${p.role}@urbanstyle.com`;
            return {
              id: p.id,
              full_name: p.full_name,
              email: email,
              phone: p.phone || '08123456789',
              role: roleNorm,
              is_active: p.city !== 'INACTIVE',
              created_at: p.created_at ? p.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
            };
          });
        }
      } catch (err) {
        console.warn('Fetch staff from Supabase profiles error, using local fallback:', err);
      }
    }
    return [...localStaff];
  },

  async createStaff(newStaffData: Omit<StaffUser, 'id' | 'created_at'>): Promise<StaffUser> {
    const createdStaff: StaffUser = {
      ...newStaffData,
      id: `stf_${Date.now()}`,
      created_at: new Date().toISOString().slice(0, 10),
    };
    localStaff.unshift(createdStaff);
    localUsers.push({
      id: createdStaff.id,
      email: createdStaff.email,
      full_name: createdStaff.full_name,
      phone: createdStaff.phone,
      role: createdStaff.role,
      staff_role: createdStaff.role,
      created_at: createdStaff.created_at,
    });
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('profiles').insert({
          id: createdStaff.id,
          full_name: createdStaff.full_name,
          phone: createdStaff.phone,
          role: createdStaff.role,
        });
      } catch (err) {
        console.warn('Simpan staff ke Supabase error:', err);
      }
    }
    return createdStaff;
  },

  async toggleStaffStatus(staffId: string): Promise<boolean> {
    const st = localStaff.find(s => s.id === staffId);
    if (st) {
      st.is_active = !st.is_active;
    }
    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase.from('profiles').select('city').eq('id', staffId).single();
        const newStatus = data?.city === 'INACTIVE' ? null : 'INACTIVE';
        await supabase.from('profiles').update({ city: newStatus }).eq('id', staffId);
      } catch (err) {
        console.warn('Toggle staff status di Supabase error:', err);
      }
    }
    return true;
  },

  async getUserProfile(userIdOrEmail: string): Promise<UserProfile | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .or(`id.eq.${userIdOrEmail},email.eq.${userIdOrEmail}`)
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase profile fetch error, fallback to local:', err);
      }
    }
    const found = localUsers.find(u => u.id === userIdOrEmail || u.email.toLowerCase() === userIdOrEmail.toLowerCase());
    return found || null;
  },

  async updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile | null> {
    const user = localUsers.find(u => u.id === userId);
    if (user) {
      Object.assign(user, profileData);
    }
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('profiles').update(profileData).eq('id', userId);
      } catch (err) {
        console.warn('Update profile cloud error:', err);
      }
    }
    return user || null;
  },

  async getUserAddresses(userId: string): Promise<UserAddress[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('user_addresses')
          .select('*')
          .eq('user_id', userId)
          .order('is_default', { ascending: false });
        if (!error && data && data.length > 0) {
          return data as UserAddress[];
        }
      } catch (err) {
        console.warn('Supabase getUserAddresses fallback to local:', err);
      }
    }
    return localAddresses.filter(a => a.user_id === userId);
  },

  async addUserAddress(address: Omit<UserAddress, 'id'>): Promise<UserAddress> {
    const newAddr: UserAddress = {
      ...address,
      id: `addr_${Date.now()}`,
    };
    if (newAddr.is_default) {
      localAddresses.forEach(a => {
        if (a.user_id === address.user_id) a.is_default = false;
      });
    }
    localAddresses.push(newAddr);

    if (isSupabaseConfigured && supabase) {
      try {
        if (newAddr.is_default) {
          await supabase.from('user_addresses').update({ is_default: false }).eq('user_id', address.user_id);
        }
        await supabase.from('user_addresses').insert(newAddr);
      } catch (err) {
        console.warn('Supabase addUserAddress error:', err);
      }
    }

    return newAddr;
  },

  async deleteUserAddress(addressId: string): Promise<boolean> {
    localAddresses = localAddresses.filter(a => a.id !== addressId);
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('user_addresses').delete().eq('id', addressId);
      } catch (err) {
        console.warn('Supabase deleteUserAddress error:', err);
      }
    }
    return true;
  },

  async setDefaultAddress(userId: string, addressId: string): Promise<boolean> {
    localAddresses.forEach(a => {
      if (a.user_id === userId) {
        a.is_default = a.id === addressId;
      }
    });
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('user_addresses').update({ is_default: false }).eq('user_id', userId);
        await supabase.from('user_addresses').update({ is_default: true }).eq('id', addressId);
      } catch (err) {
        console.warn('Supabase setDefaultAddress error:', err);
      }
    }
    return true;
  }
};
