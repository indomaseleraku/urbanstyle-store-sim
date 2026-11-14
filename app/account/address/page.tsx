'use client';

// app/account/address/page.tsx
// Halaman Buku Alamat Pengiriman Pengguna (Pre-fill Checkout)

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { dataStore } from '@/lib/store';
import { UserAddress } from '@/lib/types';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import AddAddressForm from '@/components/account/AddAddressForm';

export default function AddressBookPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (authLoading) return;
    let active = true;
    async function loadAddresses() {
      if (user) {
        const list = await dataStore.getUserAddresses(user.id);
        if (active) setAddresses(list);
      } else if (active) {
        setAddresses([]);
      }
      if (active) setIsLoading(false);
    }
    loadAddresses();
    return () => {
      active = false;
    };
  }, [user, authLoading]);

  const handleAddAddress = async (data: {
    label: string;
    recipientName: string;
    phone: string;
    addressLine: string;
    city: string;
    postalCode: string;
    isDefault: boolean;
  }) => {
    if (!user) return;
    setErrorMsg('');
    try {
      await dataStore.addUserAddress({
        user_id: user.id,
        label: data.label,
        recipient_name: data.recipientName,
        phone: data.phone,
        address_line: data.addressLine,
        city: data.city,
        postal_code: data.postalCode,
        is_default: data.isDefault,
      });

      const updated = await dataStore.getUserAddresses(user.id);
      setAddresses(updated);
      setIsAdding(false);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menambah alamat baru.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    setErrorMsg('');
    const ok = await dataStore.deleteUserAddress(id);
    if (!ok) {
      setErrorMsg('Gagal menghapus alamat. Silakan coba lagi.');
      return;
    }
    const updated = await dataStore.getUserAddresses(user.id);
    setAddresses(updated);
    setConfirmDeleteId(null);
  };

  const handleSetDefault = async (id: string) => {
    if (!user) return;
    setErrorMsg('');
    const ok = await dataStore.setDefaultAddress(user.id, id);
    if (!ok) {
      setErrorMsg('Gagal mengatur alamat utama.');
      return;
    }
    const updated = await dataStore.getUserAddresses(user.id);
    setAddresses(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-zinc-950 flex items-center gap-2">
            <MapPin size={16} className="text-[#E60012]" />
            <span>Buku Alamat Pengiriman</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Kelola alamat pengiriman pesanan Anda untuk transaksi cepat.
          </p>
        </div>
        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-black hover:bg-[#E60012] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>Tambah Alamat Baru</span>
          </button>
        )}
      </div>

      {/* Form Tambah Alamat Baru */}
      {isAdding && (
        <AddAddressForm
          initialRecipientName={user?.full_name || ''}
          initialPhone={user?.phone || ''}
          onCancel={() => setIsAdding(false)}
          onSubmit={handleAddAddress}
        />
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Daftar Alamat Tersimpan */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center border border-zinc-200 text-zinc-400 text-xs">
            Memuat daftar alamat tersimpan...
          </div>
        ) : addresses.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-zinc-300 text-zinc-500 text-xs">
            Belum ada alamat pengiriman tersimpan. Tambahkan alamat pertama Anda untuk mempercepat checkout.
          </div>
        ) : (
          addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-5 border transition-all ${
                addr.is_default
                  ? 'border-black bg-zinc-50/50'
                  : 'border-zinc-200 bg-white hover:border-zinc-400'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-black uppercase tracking-wider text-zinc-950">
                      {addr.label}
                    </span>
                    {addr.is_default && (
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-black text-white px-1.5 py-0.5">
                        ALAMAT UTAMA
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-zinc-800">{addr.recipient_name} ({addr.phone})</p>
                  <p className="text-xs text-zinc-600 mt-1 font-medium">{addr.address_line}</p>
                  <p className="text-xs text-zinc-500">{addr.city}, {addr.postal_code}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!addr.is_default && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 hover:text-black border border-zinc-300 px-2 py-1 cursor-pointer"
                    >
                      Pilih Utama
                    </button>
                  )}
                  {confirmDeleteId === addr.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDelete(addr.id)}
                        className="text-[10px] font-bold uppercase tracking-wider bg-[#E60012] text-white px-2 py-1 cursor-pointer"
                      >
                        Hapus
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 border border-zinc-300 px-2 py-1 cursor-pointer"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(addr.id)}
                      className="p-1 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Hapus alamat"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
