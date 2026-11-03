import { UserProfile, UserAddress } from '../types';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    email: 'member@urbanstyle.com',
    full_name: 'Member UrbanStyle',
    role: 'customer',
    preferred_size: 'L',
    created_at: '2026-09-15T08:00:00Z',
  },
  {
    id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    email: 'admin@urbanstyle.com',
    full_name: 'Administrator',
    role: 'owner',
    staff_role: 'owner',
    preferred_size: 'M',
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    email: 'gudang@urbanstyle.com',
    full_name: 'Staf Logistik',
    role: 'gudang',
    staff_role: 'gudang',
    preferred_size: 'L',
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    email: 'kasir@urbanstyle.com',
    full_name: 'Staf Kasir',
    role: 'kasir',
    staff_role: 'kasir',
    preferred_size: 'S',
    created_at: '2026-09-01T08:00:00Z',
  },
];

export const INITIAL_ADDRESSES: UserAddress[] = [
  {
    id: 'addr_1',
    user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    label: 'Rumah (Utama)',
    recipient_name: 'Member UrbanStyle',
    phone: '',
    address_line: 'Jl. Contoh No. 1, BSD City',
    city: 'Tangerang Selatan',
    postal_code: '15417',
    is_default: true,
  },
  {
    id: 'addr_2',
    user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    label: 'Kantor',
    recipient_name: 'Member UrbanStyle',
    phone: '',
    address_line: 'Jl. Contoh No. 2, BSD City',
    city: 'Tangerang Selatan',
    postal_code: '15345',
    is_default: false,
  },
];

