'use client';

import { useState, useEffect, useCallback } from 'react';
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

async function adminApiRequest<T = unknown>(action: string, payload: unknown): Promise<T> {
  const res = await fetch('/api/admin/suite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json?.success) {
    throw new Error(json?.error || `Permintaan admin gagal (HTTP ${res.status})`);
  }
  return json.data as T;
}

export function useAdminSuiteDomainState(role: Role) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [inboundShipments, setInboundShipments] = useState<InboundShipment[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [promos, setPromos] = useState<PromoVoucher[]>([]);
  const [reviews, setReviews] = useState<AdminCustomerReview[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({ ppnRate: 11, approvalLimit: 10000000 });
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const loadAllData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const res = await fetch('/api/admin/suite?resource=all', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error || `Gagal memuat data dashboard (HTTP ${res.status})`);
      }

      const d = json.data;
      const prods: Product[] = d.products || [];
      const ords: Order[] = d.orders || [];

      setProducts(prods);
      setOrders(ords);
      setEmployees(d.employees || []);
      setInboundShipments(d.inboundShipments || []);
      setExpenses(d.expenses || []);
      setActivityLogs(d.activityLogs || []);
      setStockAdjustments(d.stockAdjustments || []);
      setPromos(d.promos || []);
      setReviews(d.reviews || []);
      if (d.settings) setStoreSettings(d.settings);

      const dynNotifs: NotificationItem[] = [];
      prods
        .filter((p) => p.stock <= p.safetyStock)
        .forEach((p, idx) => {
          dynNotifs.push({
            id: `not_low_${p.id}`,
            title: 'Peringatan Stok Kritis',
            message: `${p.name} (${p.sku}) tersisa ${p.stock} pcs.`,
            time: idx === 0 ? 'Baru saja' : 'Terkini',
            read: false,
            type: 'warning',
          });
        });

      ords
        .filter((o) => o.status === 'processing' || o.status === 'pending_payment')
        .slice(0, 3)
        .forEach((o) => {
          dynNotifs.push({
            id: `not_ord_${o.id}`,
            title: o.status === 'pending_payment' ? 'Menunggu Pembayaran' : 'Pesanan Perlu Diproses',
            message: `${o.orderNumber} (${o.customerName}) - Rp ${o.total.toLocaleString('id-ID')}`,
            time: o.createdAt,
            read: false,
            type: 'info',
          });
        });

      setNotifications(dynNotifs);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyinkronkan data dari server.';
      setMutationError(msg);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const clearMutationError = useCallback(() => setMutationError(null), []);

  const addLog = useCallback(
    async (action: string, target: string, type: ActivityLog['type']) => {
      try {
        const created = await adminApiRequest<ActivityLog>('addActivityLog', { action, target, type });
        if (created) {
          setActivityLogs((prev) => [created, ...prev]);
        }
      } catch {
        // Log write failures do not override domain mutation confirmation
      }
    },
    []
  );

  const handleMutationError = (err: unknown, fallback: string) => {
    const msg = err instanceof Error ? err.message : fallback;
    setMutationError(msg);
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus, trackingNumber?: string) => {
    setMutationError(null);
    const snapshot = orders;
    const targetOrder = orders.find((o) => o.id === orderId);
    try {
      const result = await adminApiRequest<{
        status: OrderStatus;
        trackingNumber?: string;
        paymentStatus: 'paid' | 'pending' | 'failed';
        restocked: boolean;
      }>('updateOrderStatus', { id: orderId, status: newStatus, trackingNumber });

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: result?.status || newStatus,
                trackingNumber: result?.trackingNumber ?? trackingNumber ?? o.trackingNumber,
                paymentStatus: result?.paymentStatus || o.paymentStatus,
              }
            : o
        )
      );

      if (result?.restocked) {
        const freshProds = await fetch('/api/admin/suite?resource=products', { cache: 'no-store' })
          .then((r) => r.json())
          .catch(() => null);
        if (freshProds?.success && Array.isArray(freshProds.data)) {
          setProducts(freshProds.data);
        }
      }

      if (targetOrder) {
        void addLog(
          `Memperbarui status pesanan ke ${newStatus.toUpperCase()}`,
          targetOrder.orderNumber,
          'order'
        );
      }
    } catch (err) {
      setOrders(snapshot);
      handleMutationError(err, 'Gagal memperbarui status pesanan.');
    }
  };

  const addProduct = async (product: Omit<Product, 'id' | 'salesCount' | 'rating'>) => {
    setMutationError(null);
    try {
      const created = await adminApiRequest<Product>('addProduct', product);
      setProducts((prev) => [created, ...prev]);
      void addLog('Menambahkan produk katalog baru', `${created.name} (${created.sku})`, 'inventory');
    } catch (err) {
      handleMutationError(err, 'Gagal menambahkan produk.');
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    setMutationError(null);
    const snapshot = products;
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    try {
      await adminApiRequest('updateProduct', { id, updates });
      const target = snapshot.find((p) => p.id === id);
      void addLog('Memperbarui data katalog produk', `${updates.name || target?.name || id}`, 'inventory');
    } catch (err) {
      setProducts(snapshot);
      handleMutationError(err, 'Gagal memperbarui data produk.');
    }
  };

  const deleteProduct = async (id: string) => {
    setMutationError(null);
    const snapshot = products;
    const target = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      await adminApiRequest('deleteProduct', { id });
      if (target) void addLog('Menghapus produk dari katalog', target.name, 'inventory');
    } catch (err) {
      setProducts(snapshot);
      handleMutationError(err, 'Gagal menghapus produk.');
    }
  };

  const adjustStock = async (sku: string, diff: number, reason: StockAdjustment['reason']) => {
    if (!Number.isInteger(diff) || diff === 0) return;
    setMutationError(null);
    const target = products.find((p) => p.sku === sku);
    if (target && target.stock + diff < 0) {
      setMutationError(`Penyesuaian ditolak: stok ${sku} (${target.stock}) tidak mencukupi pengurangan ${Math.abs(diff)}.`);
      return;
    }

    try {
      const res = await adminApiRequest<{ adjustment: StockAdjustment; newStock: number }>('adjustStock', {
        sku,
        diff,
        reason,
      });

      setProducts((prev) => prev.map((p) => (p.sku === sku ? { ...p, stock: res.newStock } : p)));
      setStockAdjustments((prev) => [res.adjustment, ...prev]);
      void addLog(
        `Penyesuaian stok ${diff > 0 ? `+${diff}` : diff} pcs (${reason})`,
        `${res.adjustment.productName} [${sku}]`,
        'inventory'
      );
    } catch (err) {
      handleMutationError(err, 'Gagal menyimpan penyesuaian stok.');
    }
  };

  const addEmployee = async (emp: Omit<Employee, 'id' | 'lastLogin'>) => {
    setMutationError(null);
    try {
      const created = await adminApiRequest<Employee>('addEmployee', emp);
      setEmployees((prev) => [created, ...prev]);
      void addLog('Mendaftarkan akun staf baru', `${created.name} (${created.roleLabel})`, 'employee');
    } catch (err) {
      handleMutationError(err, 'Gagal menambahkan akun staf.');
    }
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    setMutationError(null);
    const snapshot = employees;
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
    try {
      await adminApiRequest('updateEmployee', { id, updates });
      const target = snapshot.find((e) => e.id === id);
      void addLog('Memperbarui data karyawan', target?.name || id, 'employee');
    } catch (err) {
      setEmployees(snapshot);
      handleMutationError(err, 'Gagal memperbarui data karyawan.');
    }
  };

  const toggleEmployeeStatus = async (id: string) => {
    setMutationError(null);
    const target = employees.find((e) => e.id === id);
    if (!target) return;
    const nextStatus: Employee['status'] = target.status === 'active' ? 'inactive' : 'active';
    const snapshot = employees;
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, status: nextStatus } : e)));

    try {
      await adminApiRequest('updateEmployee', { id, updates: { status: nextStatus } });
      void addLog(
        nextStatus === 'active' ? 'Mengaktifkan akun staf' : 'Membekukan akses staf',
        target.name,
        'employee'
      );
    } catch (err) {
      setEmployees(snapshot);
      handleMutationError(err, 'Gagal mengubah status staf.');
    }
  };

  const deleteEmployee = async (id: string) => {
    setMutationError(null);
    const target = employees.find((e) => e.id === id);
    const snapshot = employees;
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    try {
      await adminApiRequest('deleteEmployee', { id });
      if (target) void addLog('Menghapus akun karyawan', target.name, 'employee');
    } catch (err) {
      setEmployees(snapshot);
      handleMutationError(err, 'Gagal menghapus karyawan.');
    }
  };

  const addInbound = async (payload: Omit<InboundShipment, 'id' | 'status'>) => {
    setMutationError(null);
    try {
      const created = await adminApiRequest<InboundShipment>('addInbound', payload);
      setInboundShipments((prev) => [created, ...prev]);
      void addLog('Menerbitkan Purchase Order masuk', `${created.poNumber} (${created.supplierName})`, 'inventory');
    } catch (err) {
      handleMutationError(err, 'Gagal membuat PO masuk.');
    }
  };

  const receiveShipment = async (shipmentId: string, targetProductId?: string) => {
    setMutationError(null);
    const target = inboundShipments.find((s) => s.id === shipmentId);
    const snapshot = inboundShipments;
    setInboundShipments((prev) => prev.map((s) => (s.id === shipmentId ? { ...s, status: 'received' } : s)));

    try {
      const res = await adminApiRequest<{
        status: 'received';
        restockedProductId?: string;
        adjustment?: StockAdjustment;
      }>('updateInboundStatus', { id: shipmentId, status: 'received', targetProductId });

      if (res?.adjustment) {
        setStockAdjustments((prev) => [res.adjustment!, ...prev]);
        setProducts((prev) =>
          prev.map((p) => (p.id === res.restockedProductId ? { ...p, stock: res.adjustment!.newStock } : p))
        );
      }

      if (target) void addLog('Menerima barang masuk supplier (PO)', `${target.poNumber} - ${target.supplierName}`, 'inventory');
    } catch (err) {
      setInboundShipments(snapshot);
      handleMutationError(err, 'Gagal mengonfirmasi penerimaan PO.');
    }
  };

  const addExpense = async (expense: Omit<ExpenseItem, 'id' | 'date'>) => {
    setMutationError(null);
    try {
      const created = await adminApiRequest<ExpenseItem>('addExpense', expense);
      setExpenses((prev) => [created, ...prev]);
      void addLog('Mencatat biaya operasional', `${created.category}: ${created.description}`, 'finance');
    } catch (err) {
      handleMutationError(err, 'Gagal mencatat biaya operasional.');
    }
  };

  const addPromo = async (promo: Omit<PromoVoucher, 'id' | 'usageCount'>) => {
    setMutationError(null);
    try {
      const created = await adminApiRequest<PromoVoucher>('addPromo', promo);
      setPromos((prev) => [created, ...prev]);
      void addLog('Menerbitkan kupon promo baru', created.code, 'system');
    } catch (err) {
      handleMutationError(err, 'Gagal membuat kupon promo.');
    }
  };

  const togglePromoStatus = async (promoId: string) => {
    setMutationError(null);
    const snapshot = promos;
    const target = promos.find((p) => p.id === promoId);
    if (!target) return;
    const optimisticStatus: PromoVoucher['status'] = target.status === 'active' ? 'expired' : 'active';
    setPromos((prev) => prev.map((p) => (p.id === promoId ? { ...p, status: optimisticStatus } : p)));

    try {
      const status = await adminApiRequest<'active' | 'expired'>('togglePromoStatus', { id: promoId });
      setPromos((prev) => prev.map((p) => (p.id === promoId ? { ...p, status } : p)));
      void addLog(`${status === 'active' ? 'Mengaktifkan' : 'Menonaktifkan'} kupon promo`, target.code, 'system');
    } catch (err) {
      setPromos(snapshot);
      handleMutationError(err, 'Gagal mengubah status kupon.');
    }
  };

  const saveSettings = async (next: StoreSettings): Promise<boolean> => {
    setMutationError(null);
    try {
      const saved = await adminApiRequest<StoreSettings>('saveSettings', next);
      setStoreSettings(saved);
      void addLog('Memperbarui konfigurasi pajak & limit approval', `PPN ${saved.ppnRate}%`, 'finance');
      return true;
    } catch (err) {
      handleMutationError(err, 'Gagal menyimpan konfigurasi toko.');
      return false;
    }
  };

  const createOrder = async (
    newOrderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'paymentStatus' | 'status'>
  ): Promise<Order | null> => {
    setMutationError(null);
    try {
      const created = await adminApiRequest<Order>('createOrder', newOrderData);
      setOrders((prev) => [created, ...prev]);
      setProducts((prev) =>
        prev.map((prod) => {
          const orderedItem = created.items.find((i) => i.productId === prod.id);
          return orderedItem
            ? {
                ...prod,
                stock: Math.max(0, prod.stock - orderedItem.quantity),
                salesCount: prod.salesCount + orderedItem.quantity,
              }
            : prod;
        })
      );
      void addLog('Menerima pesanan toko online', `${created.orderNumber} - ${created.customerName}`, 'order');
      return created;
    } catch (err) {
      handleMutationError(err, 'Gagal membuat pesanan.');
      return null;
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearNotifications = () => setNotifications([]);

  void role;

  return {
    products,
    orders,
    employees,
    inboundShipments,
    expenses,
    activityLogs,
    stockAdjustments,
    notifications,
    promos,
    reviews,
    storeSettings,
    isLoadingData,
    mutationError,
    clearMutationError,
    refreshData: loadAllData,
    updateOrderStatus,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    addEmployee,
    updateEmployee,
    toggleEmployeeStatus,
    deleteEmployee,
    addInbound,
    receiveShipment,
    addExpense,
    addPromo,
    togglePromoStatus,
    saveSettings,
    createOrder,
    markNotificationRead,
    clearNotifications,
  };
}
