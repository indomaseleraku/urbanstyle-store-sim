'use client';

// components/auth/ForgotPasswordForm.tsx
// Formulir Reset Kata Sandi dengan Verifikasi OTP 6 Digit via Gmail

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
  onSuccess: () => void;
}

export default function ForgotPasswordForm({ onBackToLogin, onSuccess }: ForgotPasswordFormProps) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [otpToken, setOtpToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return setErrorMsg('Masukkan alamat email yang valid.');
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', email: cleanEmail, purpose: 'reset' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.otpToken) {
        return setErrorMsg(data.message || 'Gagal mengirim kode reset.');
      }
      setOtpToken(data.otpToken);
      setStep('verify');
    } catch {
      setErrorMsg('Gagal menghubungi server pengiriman kode.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();
    const cleanPass = newPassword.trim();

    if (!/^\d{6}$/.test(cleanOtp)) return setErrorMsg('Masukkan 6 digit kode OTP dari email.');
    if (cleanPass.length < 8) return setErrorMsg('Kata sandi baru minimal 8 karakter.');

    setIsLoading(true);
    try {
      const resetRes = await resetPassword(cleanEmail, cleanPass, cleanOtp, otpToken || undefined);
      if (resetRes.success) {
        setSuccessMsg('Kata sandi berhasil diperbarui! Mengalihkan ke login...');
        setTimeout(() => {
          onSuccess();
          onBackToLogin();
        }, 800);
      } else {
        setErrorMsg(resetRes.message || 'Gagal menyimpan kata sandi baru.');
      }
    } catch {
      setErrorMsg('Terjadi kesalahan saat memproses reset kata sandi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-tight">
          {step === 'request' ? 'Reset Kata Sandi' : 'Verifikasi & Sandi Baru'}
        </h3>
        <p className="text-[11px] text-zinc-500 mt-0.5">
          {step === 'request'
            ? 'Masukkan email Anda untuk menerima 6 digit kode keamanan.'
            : `Kode 6 digit telah dikirim ke ${email}.`}
        </p>
      </div>

      {errorMsg && <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-xs">{errorMsg}</div>}
      {successMsg && (
        <div className="p-2 bg-green-50 border border-green-200 text-green-700 text-xs flex items-center gap-1.5">
          <CheckCircle2 size={14} className="text-green-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {step === 'request' ? (
        <form onSubmit={handleSendResetOtp} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
              Alamat Email Akun
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-black hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'Mengirim Kode...' : 'Kirim Kode Verifikasi'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyAndReset} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
              6 Digit Kode OTP
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full px-3 py-2 border border-zinc-300 text-center text-sm font-mono tracking-widest font-black focus:outline-hidden focus:border-black"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
              Kata Sandi Baru
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-2.5 text-zinc-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
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
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-black hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}
          </button>
        </form>
      )}

      <button
        type="button"
        onClick={onBackToLogin}
        className="w-full text-center text-xs text-zinc-500 hover:text-black font-semibold flex items-center justify-center gap-1 cursor-pointer pt-1"
      >
        <ArrowLeft size={13} /> Kembali ke Halaman Masuk
      </button>
    </div>
  );
}
