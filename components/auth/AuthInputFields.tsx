'use client';

// components/auth/AuthInputFields.tsx
// Sub-komponen input form Nama, Email, Sandi, dan Lupa Sandi

import React from 'react';
import { User, Lock, Mail, Eye, EyeOff } from 'lucide-react';

interface AuthInputFieldsProps {
  activeTab: 'login' | 'register';
  fullName: string;
  setFullName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  onForgotPassword: () => void;
}

export default function AuthInputFields({
  activeTab,
  fullName,
  setFullName,
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  onForgotPassword,
}: AuthInputFieldsProps) {
  return (
    <>
      {activeTab === 'register' && (
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
            Nama Lengkap
          </label>
          <div className="relative">
            <User size={15} className="absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Contoh: Kimy Eka Ardiansyah"
              className="w-full pl-9 pr-3 py-2 border border-zinc-300 text-xs focus:outline-hidden focus:border-black"
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
          Alamat Email
        </label>
        <div className="relative">
          <Mail size={15} className="absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@gmail.com"
            className="w-full pl-9 pr-3 py-2 border border-zinc-300 text-xs focus:outline-hidden focus:border-black font-mono"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
          Kata Sandi
        </label>
        <div className="relative">
          <Lock size={15} className="absolute left-3 top-2.5 text-zinc-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-9 pr-9 py-2 border border-zinc-300 text-xs focus:outline-hidden focus:border-black font-mono"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 top-2 text-zinc-400 hover:text-black cursor-pointer"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {activeTab === 'login' && (
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-[11px] text-zinc-500 hover:text-black underline cursor-pointer"
            >
              Lupa kata sandi?
            </button>
          </div>
        )}
      </div>
    </>
  );
}
