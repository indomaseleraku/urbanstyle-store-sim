import type { UserProfile, StaffRole } from './types';

export interface AuthContextType {
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
  loginWithGoogle: (
    googleEmail?: string,
    googleName?: string,
    accessToken?: string
  ) => Promise<{ success: boolean; message?: string }>;
  resetPassword: (email: string, newPass: string, otp?: string, otpToken?: string) => Promise<{ success: boolean; message?: string }>;
  logout: (redirectTo?: string | unknown) => Promise<void>;
  updateUser: (data: Partial<UserProfile>) => Promise<{ success: boolean; message?: string }>;
}
