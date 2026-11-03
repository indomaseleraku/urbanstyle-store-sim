// components/account/AddAddressForm.tsx
'use client';

import React, { useState } from 'react';
import { Home, Building2, MapPin } from 'lucide-react';

interface AddAddressFormProps {
  initialRecipientName: string;
  initialPhone: string;
  onCancel: () => void;
  onSubmit: (data: {
    label: string;
    recipientName: string;
    phone: string;
    addressLine: string;
    city: string;
    postalCode: string;
    isDefault: boolean;
  }) => Promise<void>;
}

export default function AddAddressForm({
  initialRecipientName,
  initialPhone,
  onCancel,
  onSubmit,
}: AddAddressFormProps) {
  const [label, setLabel] = useState('Rumah');
  const [recipientName, setRecipientName] = useState(initialRecipientName);
  const [phone, setPhone] = useState(initialPhone);
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('Tangerang Selatan');
  const [postalCode, setPostalCode] = useState('15417');
  const [isDefault, setIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit({
      label,
      recipientName,
      phone,
      addressLine,
      city,
      postalCode,
      isDefault,
    });
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 border border-zinc-300 bg-zinc-50 space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950">
          Formulir Alamat Baru
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-bold uppercase text-zinc-500 hover:text-black cursor-pointer"
        >
          Batal ✕
        </button>
      </div>

      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
          Label Alamat
        </label>
        <div className="flex items-center gap-2">
          {['Rumah', 'Kantor', 'Apartemen'].map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLabel(l)}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border flex items-center gap-1.5 transition-colors cursor-pointer ${
                label === l ? 'bg-black text-white border-black' : 'bg-white text-zinc-700 border-zinc-300 hover:border-black'
              }`}
            >
              {l === 'Rumah' && <Home size={13} />}
              {l === 'Kantor' && <Building2 size={13} />}
              {l === 'Apartemen' && <MapPin size={13} />}
              <span>{l}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
            Nama Penerima
          </label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="Nama Lengkap"
            className="w-full px-3 py-2 border border-zinc-300 bg-white text-xs focus:outline-none focus:border-black font-medium"
            required
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
            Nomor Telepon
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08xxxxxxxxxx"
            className="w-full px-3 py-2 border border-zinc-300 bg-white text-xs focus:outline-none focus:border-black font-medium"
            required
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
            Kota / Kabupaten
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Kota"
            className="w-full px-3 py-2 border border-zinc-300 bg-white text-xs focus:outline-none focus:border-black font-medium"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
          Alamat Lengkap & Patokan
        </label>
        <textarea
          value={addressLine}
          onChange={(e) => setAddressLine(e.target.value)}
          placeholder="Nama Jalan, Nomor Rumah, RT/RW, Kelurahan, Kecamatan"
          rows={2}
          className="w-full px-3 py-2 border border-zinc-300 bg-white text-xs focus:outline-none focus:border-black font-medium"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
            Kode Pos
          </label>
          <input
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="15417"
            className="w-full px-3 py-2 border border-zinc-300 bg-white text-xs focus:outline-none focus:border-black font-medium"
          />
        </div>

        <div className="flex items-center pt-5">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-700">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded-none border-zinc-300 text-black focus:ring-0"
            />
            <span>Jadikan Alamat Pengiriman Utama</span>
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 bg-black hover:bg-[#E60012] text-white text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
      >
        {isSubmitting ? 'Menyimpan...' : 'Simpan Alamat Ini'}
      </button>
    </form>
  );
}
