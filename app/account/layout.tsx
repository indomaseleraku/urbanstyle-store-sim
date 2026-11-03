'use client';

// app/account/layout.tsx
// Layout Portal Member UrbanStyle Store

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { User, Package, MapPin, Tag, ArrowLeft, LogOut, Shield } from 'lucide-react';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();

  const navItems = [
    { label: 'Profil Saya', href: '/account/profile', icon: User },
    { label: 'Riwayat Pesanan', href: '/account/orders', icon: Package },
    { label: 'Buku Alamat', href: '/account/address', icon: MapPin },
    { label: 'Dompet Kupon', href: '/account/coupons', icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-black transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Kembali ke Toko</span>
            </Link>
            <span className="text-zinc-300">|</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#E60012] text-white font-black text-xs flex items-center justify-center">
                US
              </div>
              <span className="font-black text-sm uppercase tracking-tight text-zinc-950">
                Portal Member LifeWear
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden sm:flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-red-50 text-[#E60012] px-2.5 py-1 border border-red-200 hover:bg-[#E60012] hover:text-white transition-colors"
              >
                <Shield size={13} />
                <span>Dasbor SIM</span>
              </Link>
            )}
            <button
              onClick={() => logout()}
              className="text-xs text-zinc-500 hover:text-red-600 transition-colors flex items-center gap-1 font-semibold"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area with Sidebar Nav */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex-1">
        {/* Mobile Horizontal Sub-Navigation Bar */}
        <div className="md:hidden sticky top-16 z-20 bg-white border-b border-zinc-200 -mx-4 sm:-mx-6 px-4 sm:px-6 mb-6 shadow-xs">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap shrink-0 transition-colors rounded-none ${
                    isActive
                      ? 'bg-zinc-950 text-white'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-black'
                  }`}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Member Profile Sidebar (Desktop Only) */}
          <aside className="hidden md:block md:col-span-1 space-y-4">
            {/* User Card */}
            <div className="bg-white p-5 border border-zinc-200 rounded-none shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-black text-white font-black text-base flex items-center justify-center shrink-0">
                  {user?.full_name?.slice(0, 2).toUpperCase() || 'US'}
                </div>
                <div className="overflow-hidden">
                  <h2 className="text-sm font-bold text-zinc-950 truncate uppercase">
                    {user?.full_name || 'Member UrbanStyle'}
                  </h2>
                  <p className="text-[11px] text-zinc-500 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-800 px-1.5 py-0.5">
                    {isAdmin ? 'ADMINISTRATOR' : 'MEMBER RESMI'}
                  </span>
                </div>
              </div>
            </div>

            {/* Nav Menu */}
            <nav className="bg-white border border-zinc-200 divide-y divide-zinc-100 rounded-none shadow-xs">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                      isActive
                        ? 'bg-zinc-950 text-white'
                        : 'text-zinc-700 hover:bg-zinc-50 hover:text-black'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Dynamic Page Content */}
          <main className="md:col-span-3">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
