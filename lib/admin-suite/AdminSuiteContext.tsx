'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Role,
  Product,
  Order,
  OrderStatus,
  Employee,
  InboundShipment,
  ExpenseItem,
  ActivityLog,
  StockAdjustment,
  NotificationItem,
  PromoVoucher,
  AdminCustomerReview,
  StoreSettings,
} from './types';
import { useAdminSuiteDomainState } from './useAdminSuiteDomainState';

interface AdminSuiteContextType {
  role: Role;
  setRole: (role: Role) => void;
  allowRoleSwitch: boolean;
  activeNav: string;
  setActiveNav: (nav: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isLoadingData: boolean;
  mutationError: string | null;
  clearMutationError: () => void;
  refreshData: () => Promise<void>;

  products: Product[];
  orders: Order[];
  employees: Employee[];
  inboundShipments: InboundShipment[];
  expenses: ExpenseItem[];
  activityLogs: ActivityLog[];
  stockAdjustments: StockAdjustment[];
  notifications: NotificationItem[];
  promos: PromoVoucher[];
  reviews: AdminCustomerReview[];
  storeSettings: StoreSettings;

  updateOrderStatus: (orderId: string, newStatus: OrderStatus, trackingNumber?: string) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'salesCount' | 'rating'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  adjustStock: (sku: string, diff: number, reason: StockAdjustment['reason']) => Promise<void>;
  addEmployee: (emp: Omit<Employee, 'id' | 'lastLogin'>) => Promise<void>;
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>;
  toggleEmployeeStatus: (id: string) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  addInbound: (payload: Omit<InboundShipment, 'id' | 'status'>) => Promise<void>;
  receiveShipment: (shipmentId: string, targetProductId?: string) => Promise<void>;
  addExpense: (expense: Omit<ExpenseItem, 'id' | 'date'>) => Promise<void>;
  addPromo: (promo: Omit<PromoVoucher, 'id' | 'usageCount'>) => Promise<void>;
  togglePromoStatus: (promoId: string) => Promise<void>;
  saveSettings: (settings: StoreSettings) => Promise<boolean>;
  createOrder: (
    newOrder: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'paymentStatus' | 'status'>
  ) => Promise<Order | null>;
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
  globalSearch: string;
  setGlobalSearch: (q: string) => void;

  formatRupiah: (amount: number) => string;
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
  allowRoleSwitch = false,
}) => {
  const [role, setRoleState] = useState<Role>(initialRole);
  const [activeNav, setActiveNav] = useState<string>('overview');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('urbanstyle-admin-theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    setRoleState(initialRole);
    setActiveNav('overview');
  }, [initialRole]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('urbanstyle-admin-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  const setRole = (nextRole: Role) => {
    if (!allowRoleSwitch) return;
    setRoleState(nextRole);
    setActiveNav('overview');
  };

  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [selectedPackingOrder, setSelectedPackingOrder] = useState<Order | null>(null);
  const [isStorefrontOpen, setIsStorefrontOpen] = useState(false);
  const [isFinanceExportOpen, setIsFinanceExportOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const domain = useAdminSuiteDomainState(role);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AdminSuiteContext.Provider
      value={{
        role,
        setRole,
        allowRoleSwitch,
        activeNav,
        setActiveNav,
        theme,
        toggleTheme,
        ...domain,
        selectedInvoiceOrder,
        setSelectedInvoiceOrder,
        selectedPackingOrder,
        setSelectedPackingOrder,
        isStorefrontOpen,
        setIsStorefrontOpen,
        isFinanceExportOpen,
        setIsFinanceExportOpen,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        globalSearch,
        setGlobalSearch,
        formatRupiah,
      }}
    >
      {children}
    </AdminSuiteContext.Provider>
  );
};

export const useAdminSuite = () => {
  const context = useContext(AdminSuiteContext);
  if (!context) throw new Error('useAdminSuite must be used within AdminSuiteProvider');
  return context;
};
