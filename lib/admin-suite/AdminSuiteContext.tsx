// lib/admin-suite/AdminSuiteContext.tsx
// Unified Context Provider untuk UrbanStyle Commerce OS - Operations Suite
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Role, Product, Order, OrderStatus, Employee, InboundShipment, 
  ExpenseItem, PromoVoucher, ActivityLog, StockAdjustment 
} from './types';
import { useAdminSuiteDomainState } from './useAdminSuiteDomainState';

export type Theme = 'light' | 'dark';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'order' | 'warehouse' | 'finance' | 'employee';
  read: boolean;
}

interface AdminSuiteContextType {
  role: Role;
  setRole: (role: Role) => void;
  allowRoleSwitch: boolean;
  theme: Theme;
  toggleTheme: () => void;
  activeNav: string;
  setActiveNav: (nav: string) => void;
  
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'salesCount' | 'rating'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (sku: string, diff: number, reason: StockAdjustment['reason']) => void;
  
  orders: Order[];
  updateOrderStatus: (orderId: string, status: OrderStatus, trackingNumber?: string) => void;
  createOrder: (newOrderData: Partial<Order>) => Order;
  
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id' | 'lastLogin'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  toggleEmployeeStatus: (id: string) => void;

  inboundShipments: InboundShipment[];
  receiveShipment: (id: string) => void;
  stockAdjustments: StockAdjustment[];

  expenses: ExpenseItem[];
  addExpense: (expense: Omit<ExpenseItem, 'id' | 'status'>) => void;
  promos: PromoVoucher[];
  addPromo: (promo: Omit<PromoVoucher, 'id' | 'usageCount'>) => void;

  activityLogs: ActivityLog[];
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  selectedInvoiceOrder: Order | null;
  setSelectedInvoiceOrder: (order: Order | null) => void;
  selectedPackingOrder: Order | null;
  setSelectedPackingOrder: (order: Order | null) => void;
  isStorefrontOpen: boolean;
  setIsStorefrontOpen: (open: boolean) => void;
  isFinanceExportOpen: boolean;
  setIsFinanceExportOpen: (open: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;

  formatRupiah: (amount: number) => string;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
}

const AdminSuiteContext = createContext<AdminSuiteContextType | undefined>(undefined);

interface AdminSuiteProviderProps {
  children: React.ReactNode;
  initialRole?: Role;
  allowRoleSwitch?: boolean;
}

export const AdminSuiteProvider: React.FC<AdminSuiteProviderProps> = ({ 
  children, 
  initialRole = 'superadmin',
  allowRoleSwitch = true
}) => {
  const [role, setRoleState] = useState<Role>(initialRole);
  const [activeNav, setActiveNav] = useState<string>('overview');
  const [globalSearch, setGlobalSearch] = useState<string>('');

  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem('urban_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('urban_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const setRole = (newRole: Role) => {
    if (!allowRoleSwitch) return;
    setRoleState(newRole);
    setActiveNav('overview');
  };

  const domain = useAdminSuiteDomainState(role);

  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      title: 'Stok Terbatas Terdeteksi',
      message: 'Celana Ankle Pants (URBAN-CHN-03) tersisa 22 unit di rak DC-1',
      time: '15m lalu',
      type: 'warehouse',
      read: false
    },
    {
      id: 'notif-2',
      title: 'Pesanan Baru Masuk',
      message: 'Order #ORD-2026-9023 senilai Rp 583.000 terverifikasi lunas via QRIS',
      time: '25m lalu',
      type: 'order',
      read: false
    }
  ]);

  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [selectedPackingOrder, setSelectedPackingOrder] = useState<Order | null>(null);
  const [isStorefrontOpen, setIsStorefrontOpen] = useState<boolean>(false);
  const [isFinanceExportOpen, setIsFinanceExportOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const formatRupiah = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => setNotifications([]);

  return (
    <AdminSuiteContext.Provider value={{
      role, setRole, allowRoleSwitch,
      theme, toggleTheme,
      activeNav, setActiveNav,
      ...domain,
      notifications, markNotificationRead, clearNotifications,
      selectedInvoiceOrder, setSelectedInvoiceOrder,
      selectedPackingOrder, setSelectedPackingOrder,
      isStorefrontOpen, setIsStorefrontOpen,
      isFinanceExportOpen, setIsFinanceExportOpen,
      isMobileMenuOpen, setIsMobileMenuOpen,
      formatRupiah,
      globalSearch, setGlobalSearch
    }}>
      {children}
    </AdminSuiteContext.Provider>
  );
};

export const useAdminSuite = () => {
  const context = useContext(AdminSuiteContext);
  if (!context) {
    throw new Error('useAdminSuite must be used within an AdminSuiteProvider');
  }
  return context;
};
