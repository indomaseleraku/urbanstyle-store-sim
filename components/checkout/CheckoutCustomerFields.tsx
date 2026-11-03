'use client';

import React from 'react';
import { UserAddress } from '@/lib/types';
import { MapPin } from 'lucide-react';

interface CheckoutCustomerFieldsProps {
  savedAddresses: UserAddress[];
  selectedAddressId?: string;
  setSelectedAddressId?: (val: string) => void;
  name: string;
  setName: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
}

export const CheckoutCustomerFields: React.FC<CheckoutCustomerFieldsProps> = ({
  savedAddresses,
  selectedAddressId,
  setSelectedAddressId,
  name,
  setName,
  phone,
  setPhone,
  address,
  setAddress,
}) => {
  return (
    <div className="space-y-3">
      {/* Address selector if saved addresses exist */}
      {savedAddresses.length > 0 && (
        <div className="p-3 bg-zinc-50 border border-zinc-200 space-y-1.5 rounded-none">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
            <MapPin size={12} />
            <span>Pilih dari Buku Alamat Tersimpan:</span>
          </span>
          <select
            value={selectedAddressId || ''}
            onChange={(e) => {
              const id = e.target.value;
              if (setSelectedAddressId) setSelectedAddressId(id);
              const sel = savedAddresses.find((a) => a.id === id);
              if (sel) {
                setAddress(`${sel.address_line}, ${sel.city} ${sel.postal_code}`);
                if (sel.phone) setPhone(sel.phone);
                if (sel.recipient_name) setName(sel.recipient_name);
              }
            }}
            className="w-full p-2 text-base md:text-xs border border-zinc-300 bg-white font-medium rounded-none"
          >
            <option value="">-- Gunakan Alamat Tersimpan --</option>
            {savedAddresses.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}: {a.recipient_name} - {a.city} {a.is_default ? '(Default)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider block mb-1">
          Nama Lengkap Penerima *
        </label>
        <input
          type="text"
          required
          placeholder="Contoh: Budi Santoso"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3.5 py-2.5 text-base md:text-sm border border-zinc-300 bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-900 font-medium rounded-none"
        />
      </div>

      <div>
        <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider block mb-1">
          Nomor WhatsApp / Ponsel *
        </label>
        <input
          type="tel"
          required
          placeholder="Contoh: 081234567890"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-3.5 py-2.5 text-base md:text-sm border border-zinc-300 bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-900 font-medium rounded-none"
        />
        <p className="text-[10px] text-zinc-500 mt-1">
          Format seluler Indonesia (08xx atau +628xx) untuk verifikasi pengiriman & notifikasi resi.
        </p>
      </div>

      <div>
        <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider block mb-1">
          Alamat Lengkap Pengiriman *
        </label>
        <textarea
          required
          rows={2}
          placeholder="Contoh: Jl. Jenderal Sudirman No. 28, RT 02 / RW 05, Jakarta Selatan"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full px-3.5 py-2.5 text-base md:text-sm border border-zinc-300 bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-900 font-medium rounded-none"
        />
      </div>
    </div>
  );
};
