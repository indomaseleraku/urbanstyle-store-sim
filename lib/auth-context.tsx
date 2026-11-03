'use client';

// lib/auth-context.tsx
// Global Authentication & Role-Based Access Control (RBAC) Provider

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, StaffRole } from './types';
import { INITIAL_USERS } from './mock-data';
import {
  loadUserSession,
  persistUserSession,
  resolveOrCreateGoogleUser,
  validateUserPassword,
  saveRegisteredCredential,
  resetUserPassword,
  resolveMemberUser,
  authenticateStaff,
} from './services/authStorageService';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  isGudang: boolean;
  isKasir: boolean;
  isStaff: boolean;
  staffRole: StaffRole | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  staffLogin: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  register: (email: string, pass: string, fullName: string) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: (googleEmail?: string, googleName?: string) => Promise<{ success: boolean; message?: string }>;
  resetPassword: (email: string, newPass: string, otp?: string, otpToken?: string) => Promise<{ success: boolean; message?: string }>;
  logout: (redirectTo?: string | unknown) => Promise<void>;
  updateUser: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const stored = loadUserSession();
    if (stored) {
      setUser(stored);
      persistUserSession(stored).catch(() => {});
    }
    setIsLoading(false);
  }, []);

  const isStaff = Boolean(user && ['admin', 'owner', 'gudang', 'kasir'].includes(user.role));
  const isOwner = Boolean(user && (user.role === 'owner' || user.role === 'admin'));
  const isGudang = Boolean(user && user.role === 'gudang');
  const isKasir = Boolean(user && user.role === 'kasir');
  const staffRole: StaffRole | null =
    user?.staff_role || (user?.role === 'admin' ? 'owner' : isStaff ? (user?.role as StaffRole) : null);

  const login = async (email: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) {
      setIsLoading(false);
      return { success: false, message: 'Alamat email wajib diisi.' };
    }
    if (!pass || pass.trim().length === 0) {
      setIsLoading(false);
      return { success: false, message: 'Kata sandi wajib diisi.' };
    }

    const passCheck = await validateUserPassword(cleanEmail, pass);
    if (!passCheck.valid) {
      setIsLoading(false);
      return { success: false, message: passCheck.message || 'Kata sandi salah.' };
    }

    const found = passCheck.user || resolveMemberUser(cleanEmail);
    if (found) {
      setUser(found);
      await persistUserSession(found, passCheck.token);
      setIsLoading(false);
      setIsAuthModalOpen(false);
      if (['admin', 'owner', 'gudang', 'kasir'].includes(found.role)) window.location.href = '/admin';
      return { success: true };
    }

    setIsLoading(false);
    return { success: false, message: 'Email belum terdaftar. Silakan pilih tab Daftar Akun.' };
  };

  const staffLogin = async (email: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    const cleanEmail = email.toLowerCase().trim();
    const result = await authenticateStaff(cleanEmail, pass);
    if (!result.success || !result.user) {
      setIsLoading(false);
      return { success: false, message: result.message || 'Akses ditolak.' };
    }
    setUser(result.user);
    await persistUserSession(result.user, result.token);
    setIsLoading(false);
    return { success: true };
  };

  const register = async (email: string, pass: string, fullName: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setIsLoading(false);
      return { success: false, message: 'Format alamat email tidak valid.' };
    }
    if (!pass || pass.trim().length < 8) {
      setIsLoading(false);
      return { success: false, message: 'Kata sandi minimal 8 karakter.' };
    }

    const newMember: UserProfile = {
      id: `usr_${Date.now()}`,
      email: cleanEmail,
      full_name: fullName.trim() || cleanEmail.split('@')[0].toUpperCase(),
      role: 'customer',
      preferred_size: 'M',
      created_at: new Date().toISOString(),
    };

    await saveRegisteredCredential(newMember, pass.trim());
    setUser(newMember);
    await persistUserSession(newMember);
    setIsLoading(false);
    return { success: true };
  };

  const loginWithGoogle = async (googleEmail = '', googleName = '') => {
    setIsLoading(true);
    const profile = await resolveOrCreateGoogleUser(googleEmail, googleName);
    setUser(profile);
    await persistUserSession(profile);
    setIsLoading(false);
    setIsAuthModalOpen(false);
    return { success: true };
  };

  const resetPassword = async (
    email: string,
    newPass: string,
    otp?: string,
    otpToken?: string
  ): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = email.toLowerCase().trim();
    if (!newPass || newPass.trim().length < 8) {
      return { success: false, message: 'Kata sandi baru minimal 8 karakter.' };
    }
    const res = await resetUserPassword(cleanEmail, newPass.trim(), otp, otpToken);
    return res;
  };

  const logout = async (redirectTo?: string | unknown) => {
    setUser(null);
    await persistUserSession(null);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    window.location.href = typeof redirectTo === 'string' ? redirectTo : '/';
  };

  const updateUser = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    await persistUserSession(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isAdmin: isStaff,
        isOwner,
        isGudang,
        isKasir,
        isStaff,
        staffRole,
        isLoading,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        login,
        staffLogin,
        register,
        loginWithGoogle,
        resetPassword,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
