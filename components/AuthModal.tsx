'use client';

// components/AuthModal.tsx
// Modal Autentikasi Pelanggan Responsif Mobile & Desktop

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import EmailOtpAuthForm from '@/components/auth/EmailOtpAuthForm';
import { X } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal } = useAuth();

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="relative w-full max-w-md bg-white border border-zinc-200 shadow-2xl p-5 sm:p-7 max-sm:rounded-t-2xl max-sm:max-h-[90vh] overflow-y-auto animate-in max-sm:slide-in-from-bottom sm:zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-zinc-400 hover:text-black transition-colors cursor-pointer p-1"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Minimalist Logo Header */}
        <div className="flex items-center space-x-2.5 mb-4 sm:mb-5">
          <div className="w-6 h-6 sm:w-7 sm:h-7 bg-black flex items-center justify-center text-white font-black text-[10px] sm:text-xs">
            US
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-black tracking-tight text-zinc-950 uppercase">
              UrbanStyle LifeWear
            </h2>
            <p className="text-[9px] sm:text-[10px] text-zinc-400 font-mono tracking-wider">
              PORTAL AKUN RESMI
            </p>
          </div>
        </div>

        {/* Opsi A: Tombol Lanjutkan dengan Google */}
        <div className="mb-3.5 sm:mb-4">
          <GoogleSignInButton onSuccess={closeAuthModal} />
        </div>

        <div className="relative flex items-center justify-center mb-3.5 sm:mb-4">
          <div className="border-t border-zinc-200 w-full" />
          <span className="bg-white px-2.5 sm:px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 shrink-0">
            ATAU DENGAN EMAIL
          </span>
          <div className="border-t border-zinc-200 w-full" />
        </div>

        {/* Opsi B: Formulir Email + Verifikasi OTP 6 Digit */}
        <EmailOtpAuthForm onSuccess={closeAuthModal} />
      </div>
    </div>
  );
};
