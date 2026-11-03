'use client';

// components/auth/OtpVerificationStep.tsx
// Komponen Input Verifikasi Kode OTP 6 Digit yang Dikirim ke Email Gmail

import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, ArrowLeft, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface OtpVerificationStepProps {
  email: string;
  otpToken: string;
  purpose?: 'login' | 'register';
  onVerified: () => Promise<void>;
  onResendSuccess: (newToken: string) => void;
  onCancel: () => void;
}

export default function OtpVerificationStep({
  email,
  otpToken,
  purpose = 'login',
  onVerified,
  onResendSuccess,
  onCancel,
}: OtpVerificationStepProps) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleDigitChange = (index: number, value: string) => {
    setError('');
    const numeric = value.replace(/\D/g, '');
    if (!numeric) {
      const next = [...digits];
      next[index] = '';
      setDigits(next);
      return;
    }

    if (numeric.length > 1) {
      const pasted = numeric.slice(0, 6).split('');
      const next = [...digits];
      pasted.forEach((char, idx) => {
        if (index + idx < 6) next[index + idx] = char;
      });
      setDigits(next);
      const focusIdx = Math.min(index + pasted.length, 5);
      inputRefs.current[focusIdx]?.focus();
      return;
    }

    const next = [...digits];
    next[index] = numeric;
    setDigits(next);
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = ['', '', '', '', '', ''];
    pasted.split('').forEach((ch, idx) => {
      next[idx] = ch;
    });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length - 1, 5)]?.focus();
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');
    const fullOtp = digits.join('');
    if (fullOtp.length !== 6) {
      setError('Masukkan 6 digit angka kode OTP dari kotak masuk email Anda.');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          email,
          otp: fullOtp,
          otpToken,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Kode OTP tidak valid.');
        setIsVerifying(false);
        return;
      }
      await onVerified();
    } catch {
      setError('Gagal menghubungi server verifikasi OTP.');
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;
    setError('');
    setInfoMsg('');
    setIsResending(true);
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          email,
          purpose,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.otpToken) {
        onResendSuccess(data.otpToken);
        setDigits(['', '', '', '', '', '']);
        setCountdown(60);
        setInfoMsg('Kode OTP 6 digit baru telah dikirim ulang ke email Anda.');
        inputRefs.current[0]?.focus();
      } else {
        setError(data.message || 'Gagal mengirim ulang kode OTP.');
      }
    } catch {
      setError('Gagal mengirim ulang OTP.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form onSubmit={handleVerifySubmit} className="space-y-4">
      <div className="p-3 bg-zinc-50 border border-zinc-200 flex items-start gap-2.5">
        <ShieldCheck size={18} className="text-zinc-800 shrink-0 mt-0.5" />
        <div className="text-xs text-zinc-700 leading-relaxed">
          Kode verifikasi <strong>6 digit</strong> telah dikirim ke Gmail:{' '}
          <span className="font-mono font-bold text-black break-all">{email}</span>
          <span className="block text-[10px] text-zinc-500 mt-0.5">
            Cek Kotak Masuk Utama atau folder Spam/Promosi untuk pengiriman pertama.
          </span>
        </div>
      </div>

      {error && (
        <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {infoMsg && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 size={14} className="shrink-0" />
          <span>{infoMsg}</span>
        </div>
      )}

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600 mb-2 text-center">
          Masukkan 6 Digit Kode OTP
        </label>
        <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              className="w-full h-10 sm:h-12 text-center font-mono text-base sm:text-lg font-black border-2 border-zinc-300 focus:border-black focus:outline-hidden text-zinc-900 bg-white transition-colors"
            />
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isVerifying}
        className="w-full py-3 bg-black hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-50"
      >
        {isVerifying ? 'Memverifikasi OTP...' : 'Verifikasi & Masuk Sekarang'}
      </button>

      <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs">
        <button
          type="button"
          onClick={onCancel}
          className="text-zinc-500 hover:text-black font-bold flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft size={13} /> Ganti Email
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={countdown > 0 || isResending}
          className="font-bold text-zinc-700 hover:text-black disabled:text-zinc-400 flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
        >
          <RefreshCw size={12} className={isResending ? 'animate-spin' : ''} />
          {countdown > 0 ? `Kirim Ulang (${countdown}d)` : 'Kirim Ulang OTP'}
        </button>
      </div>
    </form>
  );
}
