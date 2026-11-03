// components/navbar/UserAccountMenu.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, 
  Shield, 
  LogOut, 
  Package, 
  MapPin, 
  Tag, 
  ChevronDown 
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function UserAccountMenu() {
  const { user, isAuthenticated, isAdmin, openAuthModal, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated || !user) {
    return (
      <button
        type="button"
        onClick={openAuthModal}
        className="flex items-center gap-1.5 p-2 text-zinc-800 hover:text-black transition-colors cursor-pointer"
        title="Masuk ke Akun Member"
        aria-label="Keanggotaan / Masuk"
      >
        <User size={20} />
        <span className="text-xs font-bold hidden lg:inline">Masuk</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-zinc-100 transition-colors cursor-pointer group"
        title="Menu Akun Member"
        aria-label="Keanggotaan / Riwayat pembelian"
      >
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-xs ${
            isAdmin
              ? 'bg-[#E60012]'
              : 'bg-zinc-900'
          }`}
        >
          {user.full_name?.slice(0, 2).toUpperCase() || 'US'}
        </div>
        <span className="text-xs font-bold text-zinc-900 max-w-[80px] truncate hidden lg:inline">
          {user.full_name?.split(' ')[0] || 'Member'}
        </span>
        <ChevronDown
          size={13}
          className={`text-zinc-500 transition-transform duration-200 hidden sm:inline ${
            dropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-zinc-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
          <div className="px-4 py-2 border-b border-zinc-100">
            <p className="text-xs font-bold text-zinc-950 truncate uppercase">{user.full_name}</p>
            <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
            <span
              className={`inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 ${
                isAdmin ? 'bg-red-100 text-[#E60012]' : 'bg-zinc-100 text-zinc-800'
              }`}
            >
              {isAdmin ? '🛡️ Administrator SIM' : '✨ UrbanStyle Member'}
            </span>
          </div>

          <div className="py-1 text-xs">
            <Link
              href="/account/profile"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-zinc-700 hover:bg-zinc-50 hover:text-black"
            >
              <User size={14} />
              <span>Profil Saya</span>
            </Link>
            <Link
              href="/account/orders"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-zinc-700 hover:bg-zinc-50 hover:text-black"
            >
              <Package size={14} />
              <span>Riwayat Pesanan</span>
            </Link>
            <Link
              href="/account/address"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-zinc-700 hover:bg-zinc-50 hover:text-black"
            >
              <MapPin size={14} />
              <span>Buku Alamat</span>
            </Link>
            <Link
              href="/account/coupons"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-zinc-700 hover:bg-zinc-50 hover:text-black"
            >
              <Tag size={14} />
              <span>Kupon Saya</span>
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-[#E60012] font-bold hover:bg-red-50 border-t border-zinc-100"
              >
                <Shield size={14} />
                <span>Dasbor SIM Eksekutif</span>
              </Link>
            )}
          </div>

          <div className="pt-1 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              <span>Keluar Akun</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
