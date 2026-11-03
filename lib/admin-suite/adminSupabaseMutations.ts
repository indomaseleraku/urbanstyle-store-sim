// lib/admin-suite/adminSupabaseMutations.ts
// Supabase Database Mutations untuk UrbanStyle Operations Suite

import { supabase, isSupabaseConfigured } from '@/lib/services/supabaseClient';
import { Product, Order, OrderStatus, Employee, InboundShipment, ExpenseItem, PromoVoucher, StockAdjustment, ActivityLog } from './types';
import { mapAdminStatusToDbStatus } from './adminSupabaseService';

export const adminSupabaseMutations = {
  async addProduct(prod: Product) {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const catMap: Record<string, number> = {
        'Kemeja': 1,
        'Kaos': 2,
        'Polo Shirt': 2,
        'Polo': 2,
        'Celana': 3,
        'Celana Panjang': 3,
        'Celana Pendek': 3,
        'Jaket': 4,
        'Hoodie & Sweater': 4,
        'Hoodie': 4,
      };
      const categoryId = catMap[prod.category] || null;

      await supabase.from('products').insert({
        name: prod.name,
        slug: prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4),
        price: prod.price,
        original_price: prod.originalPrice || null,
        stock: prod.stock,
        safety_stock: prod.safetyStock,
        rack_location: prod.rackLocation,
        status: prod.status,
        image_url: prod.imageUrl,
        sku: prod.sku,
        description: prod.description,
        category_id: categoryId,
      });
    } catch (e) {
      console.error('Failed to add product to Supabase:', e);
    }
  },

  async updateProduct(id: string, updates: Partial<Product>) {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.price !== undefined) payload.price = updates.price;
      if (updates.stock !== undefined) payload.stock = updates.stock;
      if (updates.safetyStock !== undefined) payload.safety_stock = updates.safetyStock;
      if (updates.rackLocation !== undefined) payload.rack_location = updates.rackLocation;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.sku !== undefined) payload.sku = updates.sku;

      const numId = Number(id);
      if (!isNaN(numId)) {
        await supabase.from('products').update(payload).eq('id', numId);
      } else {
        await supabase.from('products').update(payload).eq('sku', updates.sku || id);
      }
    } catch (e) {
      console.error('Failed to update product in Supabase:', e);
    }
  },

  async deleteProduct(id: string) {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const numId = Number(id);
      if (!isNaN(numId)) {
        await supabase.from('products').delete().eq('id', numId);
      }
    } catch (e) {
      console.error('Failed to delete product from Supabase:', e);
    }
  },

  async adjustStock(sku: string, diff: number, reason: StockAdjustment['reason'], adjustedBy: string, prevStock: number, newStock: number, productName: string) {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      // 1. Update product stock
      await supabase.from('products').update({ stock: newStock }).eq('sku', sku);

      // 2. Insert stock adjustment log
      await supabase.from('admin_stock_adjustments').insert({
        sku,
        product_name: productName,
        previous_stock: prevStock,
        adjusted_stock: newStock,
        diff,
        reason,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        adjusted_by: adjustedBy
      });
    } catch (e) {
      console.error('Failed to record stock adjustment in Supabase:', e);
    }
  },

  async updateOrderStatus(orderNumber: string, status: OrderStatus, trackingNumber?: string) {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const dbStatus = mapAdminStatusToDbStatus(status);
      const updateData: any = { status: dbStatus, updated_at: new Date().toISOString() };
      if (trackingNumber !== undefined) updateData.tracking_number = trackingNumber;

      await supabase.from('orders').update(updateData).eq('order_number', orderNumber);
    } catch (e) {
      console.error('Failed to update order status in Supabase:', e);
    }
  },

  async createOrder(order: Order) {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data: orderRecord } = await supabase.from('orders').insert({
        order_number: order.orderNumber,
        customer_name: order.customerName,
        customer_phone: order.customerPhone,
        customer_email: order.customerEmail,
        customer_address: order.shippingAddress,
        shipping_courier: order.courier,
        shipping_cost: order.shippingCost,
        discount_amount: order.discount,
        total_amount: order.total,
        payment_method: order.paymentMethod,
        status: mapAdminStatusToDbStatus(order.status)
      }).select().single();

      if (orderRecord && order.items && order.items.length > 0) {
        const itemsToInsert = order.items.map(it => ({
          order_id: orderRecord.id,
          product_name: it.name,
          price: it.price,
          quantity: it.quantity,
          subtotal: it.price * it.quantity
        }));
        await supabase.from('order_items').insert(itemsToInsert);
      }
    } catch (e) {
      console.error('Failed to create order in Supabase:', e);
    }
  },

  async addExpense(expense: ExpenseItem) {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      await supabase.from('admin_expenses').insert({
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
        approved_by: expense.approvedBy,
        status: expense.status
      });
    } catch (e) {
      console.error('Failed to add expense to Supabase:', e);
    }
  },

  async addInbound(inbound: InboundShipment) {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      await supabase.from('admin_inbound_shipments').insert({
        po_number: inbound.poNumber,
        supplier_name: inbound.supplierName,
        item_count: inbound.itemCount,
        total_units: inbound.totalUnits,
        expected_date: inbound.expectedDate,
        status: inbound.status,
        items_summary: inbound.itemsSummary,
        destination_warehouse: inbound.destinationWarehouse
      });
    } catch (e) {
      console.error('Failed to add inbound shipment to Supabase:', e);
    }
  },

  async updateInboundStatus(id: string, status: InboundShipment['status']) {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      await supabase.from('admin_inbound_shipments').update({ status }).eq('id', id);
    } catch (e) {
      console.error('Failed to update inbound status in Supabase:', e);
    }
  },

  async addEmployee(emp: Employee) {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const dbRole = emp.role === 'superadmin' ? 'owner' : emp.role === 'warehouse_admin' ? 'gudang' : 'kasir';
      await supabase.from('staff_users').insert({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        phone: emp.phone,
        role: dbRole,
        department: emp.department,
        branch: emp.branch,
        salary: emp.salary,
        avatar_url: emp.avatarUrl,
        is_active: emp.status === 'active'
      });
    } catch (e) {
      console.error('Failed to add employee to Supabase:', e);
    }
  },

  async updateEmployee(id: string, emp: Partial<Employee>) {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const payload: any = {};
      if (emp.name !== undefined) payload.name = emp.name;
      if (emp.email !== undefined) payload.email = emp.email;
      if (emp.phone !== undefined) payload.phone = emp.phone;
      if (emp.department !== undefined) payload.department = emp.department;
      if (emp.branch !== undefined) payload.branch = emp.branch;
      if (emp.salary !== undefined) payload.salary = emp.salary;
      if (emp.status !== undefined) payload.is_active = emp.status === 'active';
      if (emp.role !== undefined) {
        payload.role = emp.role === 'superadmin' ? 'owner' : emp.role === 'warehouse_admin' ? 'gudang' : 'kasir';
      }

      await supabase.from('staff_users').update(payload).eq('id', id);
    } catch (e) {
      console.error('Failed to update employee in Supabase:', e);
    }
  },

  async deleteEmployee(id: string) {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      await supabase.from('staff_users').delete().eq('id', id);
    } catch (e) {
      console.error('Failed to delete employee from Supabase:', e);
    }
  },

  async addPromo(promo: PromoVoucher) {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      await supabase.from('coupons').insert({
        code: promo.code,
        type: promo.discountType,
        discount_amount: promo.discountValue,
        min_purchase: promo.minPurchase,
        usage_limit: promo.quota,
        used_count: 0,
        is_active: promo.status === 'active'
      });
    } catch (e) {
      console.error('Failed to add promo to Supabase:', e);
    }
  },

  async togglePromoStatus(id: string, isActive: boolean) {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const numId = Number(id);
      if (!isNaN(numId)) {
        await supabase.from('coupons').update({ is_active: isActive }).eq('id', numId);
      }
    } catch (e) {
      console.error('Failed to toggle promo status in Supabase:', e);
    }
  },

  async addActivityLog(log: ActivityLog) {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      await supabase.from('admin_activity_logs').insert({
        timestamp: log.timestamp,
        user_name: log.userName,
        user_role: log.userRole,
        action: log.action,
        details: log.details,
        category: log.category
      });
    } catch (e) {
      console.error('Failed to log activity in Supabase:', e);
    }
  }
};
