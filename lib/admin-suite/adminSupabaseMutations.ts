import { randomBytes } from 'crypto';
import {
  Product,
  Order,
  Employee,
  ExpenseItem,
  ActivityLog,
  StockAdjustment,
  PromoVoucher,
  Role,
  OrderStatus,
  InboundShipment,
  StoreSettings,
} from './types';

async function getAdminDb() {
  if (typeof window !== 'undefined') {
    throw new Error('Operasi mutasi admin hanya diizinkan di lingkungan server.');
  }
  const { supabaseAdmin } = await import('@/lib/supabaseAdmin');
  return supabaseAdmin;
}

const mapRoleReverse = (r: Role): string => {
  if (r === 'store_admin') return 'kasir';
  if (r === 'warehouse_admin') return 'gudang';
  return 'owner';
};

const statusMapReverse: Record<OrderStatus, string> = {
  pending_payment: 'Menunggu Pembayaran',
  processing: 'Sedang Diproses',
  packing: 'Dikemas Gudang',
  shipped: 'Dikirim',
  delivered: 'Selesai',
  cancelled: 'Dibatalkan',
};

function assertFiniteNumber(value: unknown, label: string, min = 0): number {
  const num = Number(value);
  if (!Number.isFinite(num) || num < min) {
    throw new Error(`${label} harus berupa angka valid minimal ${min}.`);
  }
  return num;
}

function throwOnDbError(error: { message?: string } | null, context: string) {
  if (error) {
    throw new Error(`${context}: ${error.message || 'kesalahan database'}`);
  }
}

export const adminSupabaseMutations = {
  async addProduct(p: Omit<Product, 'id' | 'salesCount' | 'rating'>): Promise<Product> {
    const db = await getAdminDb();
    const price = assertFiniteNumber(p.price, 'Harga produk', 0);
    const stock = Math.floor(assertFiniteNumber(p.stock, 'Stok produk', 0));
    const safetyStock = Math.floor(assertFiniteNumber(p.safetyStock, 'Safety stock', 0));
    const originalPrice = p.originalPrice != null ? assertFiniteNumber(p.originalPrice, 'Harga coret', 0) : null;

    const { data, error } = await db
      .from('products')
      .insert({
        name: p.name.trim(),
        sku: p.sku.trim().toUpperCase(),
        category: p.category.trim(),
        price,
        original_price: originalPrice,
        stock,
        safety_stock: safetyStock,
        rack_location: p.rackLocation || 'Rak A-01 / Bin 01',
        status: p.status || 'active',
        image_url: p.imageUrl,
        description: p.description,
      })
      .select('*')
      .single();

    throwOnDbError(error, 'Gagal menambahkan produk');
    return {
      ...p,
      id: String(data!.id),
      price: Number(data!.price),
      originalPrice: data!.original_price ? Number(data!.original_price) : undefined,
      stock: Number(data!.stock),
      safetyStock: Number(data!.safety_stock),
      salesCount: 0,
      rating: 0,
    };
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    const db = await getAdminDb();
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = String(updates.name).trim();
    if (updates.sku !== undefined) dbUpdates.sku = String(updates.sku).trim().toUpperCase();
    if (updates.category !== undefined) dbUpdates.category = String(updates.category).trim();
    if (updates.price !== undefined) dbUpdates.price = assertFiniteNumber(updates.price, 'Harga jual', 0);
    if (updates.originalPrice !== undefined) {
      dbUpdates.original_price = updates.originalPrice ? assertFiniteNumber(updates.originalPrice, 'Harga coret', 0) : null;
    }
    if (updates.stock !== undefined) dbUpdates.stock = Math.floor(assertFiniteNumber(updates.stock, 'Stok', 0));
    if (updates.safetyStock !== undefined) dbUpdates.safety_stock = Math.floor(assertFiniteNumber(updates.safetyStock, 'Safety stock', 0));
    if (updates.rackLocation !== undefined) dbUpdates.rack_location = updates.rackLocation;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
    if (updates.description !== undefined) dbUpdates.description = updates.description;

    const { error } = await db.from('products').update(dbUpdates).eq('id', Number(id));
    throwOnDbError(error, 'Gagal memperbarui produk');
  },

  async deleteProduct(id: string): Promise<void> {
    const db = await getAdminDb();
    const { error } = await db.from('products').delete().eq('id', Number(id));
    throwOnDbError(error, 'Gagal menghapus produk');
  },

  async adjustStock(
    sku: string,
    diff: number,
    reason: StockAdjustment['reason'],
    adjustedBy: string
  ): Promise<{ adjustment: StockAdjustment; newStock: number; productId: string }> {
    const db = await getAdminDb();
    if (!Number.isInteger(diff) || diff === 0) {
      throw new Error('Selisih penyesuaian stok harus berupa bilangan bulat non-nol.');
    }

    const { data: prod, error: fetchErr } = await db
      .from('products')
      .select('id, name, stock, sku')
      .eq('sku', sku)
      .single();

    throwOnDbError(fetchErr, 'Produk tidak ditemukan untuk penyesuaian stok');
    const prevStock = Number(prod!.stock || 0);
    const expectedNewStock = prevStock + diff;
    if (expectedNewStock < 0) {
      throw new Error(`Stok akhir SKU ${sku} tidak boleh negatif (${prevStock} + ${diff}).`);
    }

    const { error: rpcErr } = await db.rpc('atomic_increment_stock', {
      p_product_id: Number(prod!.id),
      p_delta: diff,
    });
    throwOnDbError(rpcErr, 'Gagal memperbarui stok secara atomik');

    const { data: adjRow, error: adjErr } = await db
      .from('stock_adjustments')
      .insert({
        product_sku: sku,
        product_name: prod!.name,
        prev_stock: prevStock,
        new_stock: expectedNewStock,
        diff,
        reason,
        adjusted_by: adjustedBy,
      })
      .select('*')
      .single();

    throwOnDbError(adjErr, 'Gagal mencatat log penyesuaian stok');

    return {
      productId: String(prod!.id),
      newStock: expectedNewStock,
      adjustment: {
        id: String(adjRow!.id),
        date: new Date(adjRow!.created_at).toLocaleString('id-ID', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
        rawDate: adjRow!.created_at,
        productSku: sku,
        productName: prod!.name,
        prevStock,
        newStock: expectedNewStock,
        diff,
        reason,
        adjustedBy,
      },
    };
  },

  async updateOrderStatus(
    id: string,
    status: OrderStatus,
    trackingNumber?: string
  ): Promise<{ status: OrderStatus; trackingNumber?: string; paymentStatus: 'paid' | 'pending' | 'failed'; restocked: boolean }> {
    const db = await getAdminDb();
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      throw new Error('ID pesanan tidak valid.');
    }

    const { data: existing, error: fetchErr } = await db
      .from('orders')
      .select('id, status, payment_status, tracking_number, courier, order_items (product_id, quantity)')
      .eq('id', numericId)
      .single();

    throwOnDbError(fetchErr, 'Pesanan tidak ditemukan');

    let restocked = false;
    if (status === 'cancelled' && existing!.status !== 'Dibatalkan' && existing!.status !== 'cancelled') {
      const items = (existing!.order_items || []) as Array<{ product_id: number; quantity: number }>;
      for (const item of items) {
        if (item.product_id && item.quantity > 0) {
          const { error: incErr } = await db.rpc('atomic_increment_stock', {
            p_product_id: Number(item.product_id),
            p_delta: Number(item.quantity),
          });
          throwOnDbError(incErr, 'Gagal mengembalikan stok pesanan dibatalkan');
          restocked = true;
        }
      }
    }

    const prefix = (existing!.courier || 'RES').slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
    const resolvedTracking =
      trackingNumber?.trim() ||
      existing!.tracking_number ||
      (status === 'shipped' ? `${prefix}-${randomBytes(4).toString('hex').toUpperCase()}` : undefined);

    const resolvedPaymentStatus =
      status === 'cancelled'
        ? (existing!.payment_status === 'paid' ? 'paid' : 'pending')
        : status === 'pending_payment'
          ? 'pending'
          : 'paid';

    const dbPayload: Record<string, unknown> = {
      status: statusMapReverse[status] || status,
      payment_status: resolvedPaymentStatus,
    };
    if (resolvedTracking) {
      dbPayload.tracking_number = resolvedTracking;
    }

    const { error: updateErr } = await db.from('orders').update(dbPayload).eq('id', numericId);
    throwOnDbError(updateErr, 'Gagal memperbarui status pesanan');

    return {
      status,
      trackingNumber: resolvedTracking,
      paymentStatus: resolvedPaymentStatus as 'paid' | 'pending' | 'failed',
      restocked,
    };
  },

  async createOrder(
    o: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'paymentStatus' | 'status'>
  ): Promise<Order> {
    const db = await getAdminDb();
    if (!Array.isArray(o.items) || o.items.length === 0) {
      throw new Error('Pesanan wajib berisi minimal 1 item.');
    }

    let computedSubtotal = 0;
    const validatedItems: Array<{
      productId: string;
      sku: string;
      name: string;
      price: number;
      quantity: number;
      imageUrl: string;
    }> = [];

    for (const item of o.items) {
      const qty = Math.floor(assertFiniteNumber(item.quantity, 'Jumlah produk', 1));
      const { data: prod, error: prodErr } = await db
        .from('products')
        .select('id, name, sku, price, stock, image_url')
        .eq('id', Number(item.productId))
        .single();

      throwOnDbError(prodErr, `Produk #${item.productId} tidak ditemukan`);
      if (Number(prod!.stock) < qty) {
        throw new Error(`Stok ${prod!.name} tidak mencukupi (tersedia: ${prod!.stock}).`);
      }

      const unitPrice = Number(prod!.price);
      computedSubtotal += unitPrice * qty;
      validatedItems.push({
        productId: String(prod!.id),
        sku: prod!.sku || item.sku,
        name: prod!.name,
        price: unitPrice,
        quantity: qty,
        imageUrl: prod!.image_url || item.imageUrl,
      });
    }

    const shippingCost = assertFiniteNumber(o.shippingCost, 'Ongkos kirim', 0);
    const discount = assertFiniteNumber(o.discount || 0, 'Diskon', 0);
    const computedTotal = Math.max(0, computedSubtotal + shippingCost - discount);
    const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const orderNumber = `ORD-${dateStamp}-${randomBytes(3).toString('hex').toUpperCase()}`;

    const { data: insertedOrder, error: orderErr } = await db
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: o.customerName.trim(),
        customer_phone: o.customerPhone.trim(),
        customer_email: o.customerEmail.trim(),
        shipping_address: `${o.shippingAddress.trim()}, ${o.city.trim()}`,
        courier: o.courier,
        payment_method: o.paymentMethod,
        payment_status: 'paid',
        status: 'Sedang Diproses',
        subtotal: computedSubtotal,
        shipping_cost: shippingCost,
        discount_amount: discount,
        total_amount: computedTotal,
      })
      .select('*')
      .single();

    throwOnDbError(orderErr, 'Gagal membuat pesanan baru');

    const { error: itemsErr } = await db.from('order_items').insert(
      validatedItems.map((it) => ({
        order_id: insertedOrder!.id,
        product_id: Number(it.productId),
        product_name: it.name,
        price: it.price,
        quantity: it.quantity,
        image_url: it.imageUrl,
      }))
    );

    if (itemsErr) {
      await db.from('orders').delete().eq('id', insertedOrder!.id);
      throw new Error(`Gagal menyimpan item pesanan: ${itemsErr.message}`);
    }

    for (const it of validatedItems) {
      await db.rpc('atomic_increment_stock', { p_product_id: Number(it.productId), p_delta: -it.quantity });
    }

    return {
      ...o,
      id: String(insertedOrder!.id),
      orderNumber,
      createdAt: new Date(insertedOrder!.created_at).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      rawCreatedAt: insertedOrder!.created_at,
      paymentStatus: 'paid',
      status: 'processing',
      items: validatedItems,
      subtotal: computedSubtotal,
      shippingCost,
      discount,
      total: computedTotal,
    };
  },

  async addExpense(e: Omit<ExpenseItem, 'id' | 'date'>): Promise<ExpenseItem> {
    const db = await getAdminDb();
    const amount = assertFiniteNumber(e.amount, 'Nominal biaya', 1);
    const todayIso = new Date().toISOString().split('T')[0];

    const { data, error } = await db
      .from('expenses')
      .insert({
        date: todayIso,
        category: e.category,
        description: e.description.trim(),
        amount,
        approved_by: e.approvedBy,
      })
      .select('*')
      .single();

    throwOnDbError(error, 'Gagal mencatat biaya operasional');

    return {
      id: String(data!.id),
      date: new Date(data!.created_at || todayIso).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      rawDate: data!.created_at || todayIso,
      category: data!.category as ExpenseItem['category'],
      description: data!.description,
      amount: Number(data!.amount),
      approvedBy: data!.approved_by,
    };
  },

  async addInbound(
    payload: Omit<InboundShipment, 'id' | 'status'>
  ): Promise<InboundShipment> {
    const db = await getAdminDb();
    const totalUnits = Math.floor(assertFiniteNumber(payload.totalUnits, 'Total unit PO', 1));
    const totalItems = Math.floor(assertFiniteNumber(payload.totalItems, 'Total item PO', 1));

    const { data, error } = await db
      .from('inbound_shipments')
      .insert({
        po_number: payload.poNumber.trim().toUpperCase(),
        supplier_name: payload.supplierName.trim(),
        expected_date: payload.expectedDate || new Date().toISOString().split('T')[0],
        status: 'pending',
        total_items: totalItems,
        total_units: totalUnits,
        items_summary: payload.itemsSummary.trim(),
      })
      .select('*')
      .single();

    throwOnDbError(error, 'Gagal menambahkan Purchase Order masuk');

    return {
      id: String(data!.id),
      poNumber: data!.po_number,
      supplierName: data!.supplier_name,
      expectedDate: data!.expected_date,
      status: data!.status as InboundShipment['status'],
      totalItems: Number(data!.total_items),
      totalUnits: Number(data!.total_units),
      itemsSummary: data!.items_summary,
    };
  },

  async updateInboundStatus(
    id: string,
    status: 'pending' | 'in_qc' | 'received',
    adjustedBy = 'Admin Gudang',
    targetProductId?: string
  ): Promise<{ status: 'pending' | 'in_qc' | 'received'; restockedProductId?: string; adjustment?: StockAdjustment }> {
    const db = await getAdminDb();
    const numericId = Number(id);

    const { data: claimed, error } = await db
      .from('inbound_shipments')
      .update({ status })
      .eq('id', numericId)
      .neq('status', status)
      .select('*')
      .single();

    throwOnDbError(error, 'Status PO tidak dapat diubah (mungkin sudah diproses sebelumnya)');

    if (status !== 'received' || !claimed) {
      return { status };
    }

    let matchedProd: { id: number; sku: string; name: string; stock: number } | null = null;
    if (targetProductId) {
      const { data: explicitProd } = await db
        .from('products')
        .select('id, sku, name, stock')
        .eq('id', Number(targetProductId))
        .maybeSingle();
      if (explicitProd) matchedProd = explicitProd;
    } else {
      const { data: allProds } = await db.from('products').select('id, sku, name, stock');
      const summaryLower = String(claimed.items_summary || '').toLowerCase();
      if (allProds) {
        matchedProd =
          allProds.find((p) => p.sku && summaryLower.includes(String(p.sku).toLowerCase())) || null;
      }
    }

    if (!matchedProd || !claimed.total_units || Number(claimed.total_units) <= 0) {
      return { status };
    }

    const res = await this.adjustStock(
      matchedProd.sku,
      Number(claimed.total_units),
      'Restock Masuk',
      `${adjustedBy} (${claimed.po_number})`
    );

    return {
      status,
      restockedProductId: res.productId,
      adjustment: res.adjustment,
    };
  },

  async addEmployee(emp: Omit<Employee, 'id' | 'lastLogin'>): Promise<Employee> {
    const db = await getAdminDb();
    const email = emp.email.trim().toLowerCase();
    const salary = assertFiniteNumber(emp.salary, 'Gaji pokok', 0);

    const { data: existing } = await db.from('staff_users').select('id').eq('email', email).maybeSingle();
    if (existing) {
      throw new Error(`Email staf ${email} sudah terdaftar.`);
    }

    const staffId = `stf_${randomBytes(4).toString('hex')}`;
    const dbRole = mapRoleReverse(emp.role);

    const { data, error } = await db
      .from('staff_users')
      .insert({
        id: staffId,
        name: emp.name.trim(),
        email,
        phone: emp.phone,
        role: dbRole,
        role_label: emp.roleLabel,
        department: emp.department,
        branch: emp.branch,
        status: emp.status || 'active',
        is_active: emp.status !== 'inactive',
        avatar_url: emp.avatarUrl,
        salary,
      })
      .select('*')
      .single();

    throwOnDbError(error, 'Gagal menambahkan staf baru');

    await db.from('user_credentials').update({ role: dbRole }).eq('email', email);

    return {
      ...emp,
      id: String(data!.id),
      email,
      salary: Number(data!.salary),
      lastLogin: 'Baru didaftarkan',
    };
  },

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<void> {
    const db = await getAdminDb();
    const { data: currentStaff, error: fetchErr } = await db
      .from('staff_users')
      .select('id, email, role, status, is_active')
      .eq('id', id)
      .single();

    throwOnDbError(fetchErr, 'Data staf tidak ditemukan');

    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = String(updates.name).trim();
    if (updates.email !== undefined) dbUpdates.email = String(updates.email).trim().toLowerCase();
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.department !== undefined) dbUpdates.department = updates.department;
    if (updates.branch !== undefined) dbUpdates.branch = updates.branch;
    if (updates.salary !== undefined) dbUpdates.salary = assertFiniteNumber(updates.salary, 'Gaji pokok', 0);
    if (updates.roleLabel !== undefined) dbUpdates.role_label = updates.roleLabel;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
    if (updates.role !== undefined) dbUpdates.role = mapRoleReverse(updates.role);
    if (updates.status !== undefined) {
      dbUpdates.status = updates.status;
      dbUpdates.is_active = updates.status !== 'inactive';
    }

    const { error } = await db.from('staff_users').update(dbUpdates).eq('id', id);
    throwOnDbError(error, 'Gagal memperbarui data staf');

    const nextRole = updates.role !== undefined ? mapRoleReverse(updates.role) : currentStaff!.role;
    const nextEmail = updates.email ? String(updates.email).trim().toLowerCase() : currentStaff!.email;
    const isNowActive = updates.status !== undefined ? updates.status !== 'inactive' : currentStaff!.is_active;

    if (nextEmail) {
      await db
        .from('user_credentials')
        .update({ role: isNowActive ? nextRole : 'customer' })
        .eq('email', nextEmail);
    }
  },

  async deleteEmployee(id: string): Promise<void> {
    const db = await getAdminDb();
    const { data: staff, error: fetchErr } = await db
      .from('staff_users')
      .select('id, email')
      .eq('id', id)
      .single();

    throwOnDbError(fetchErr, 'Data staf tidak ditemukan');

    const { error: delErr } = await db.from('staff_users').delete().eq('id', id);
    throwOnDbError(delErr, 'Gagal menghapus akun staf');

    if (staff?.email) {
      await db
        .from('user_credentials')
        .update({ role: 'customer' })
        .eq('email', staff.email.toLowerCase());
    }
  },

  async addPromo(p: Omit<PromoVoucher, 'id' | 'usageCount'>): Promise<PromoVoucher> {
    const db = await getAdminDb();
    const discountValue = assertFiniteNumber(p.discountValue, 'Nilai diskon', 1);
    const minPurchase = assertFiniteNumber(p.minPurchase, 'Minimal belanja', 0);
    const quota = Math.floor(assertFiniteNumber(p.quota, 'Kuota kupon', 1));
    if (p.discountType === 'percentage' && discountValue > 100) {
      throw new Error('Diskon persentase maksimal 100%.');
    }

    const code = p.code.toUpperCase().trim();
    const { data, error } = await db
      .from('coupons')
      .insert({
        code,
        discount_type: p.discountType,
        discount_value: discountValue,
        min_purchase: minPurchase,
        usage_limit: quota,
        used_count: 0,
        expires_at: p.validUntil ? new Date(p.validUntil).toISOString() : null,
        is_active: p.status === 'active',
      })
      .select('*')
      .single();

    throwOnDbError(error, 'Gagal membuat kupon promo');

    return {
      ...p,
      id: String(data!.id),
      code,
      usageCount: 0,
    };
  },

  async togglePromoStatus(id: string): Promise<'active' | 'expired'> {
    const db = await getAdminDb();
    const numericId = Number(id);
    const { data: current, error: fetchErr } = await db
      .from('coupons')
      .select('id, is_active')
      .eq('id', numericId)
      .single();

    throwOnDbError(fetchErr, 'Kupon tidak ditemukan');
    const nextActive = !current!.is_active;

    const { error: updateErr } = await db
      .from('coupons')
      .update({ is_active: nextActive })
      .eq('id', numericId);

    throwOnDbError(updateErr, 'Gagal mengubah status kupon');
    return nextActive ? 'active' : 'expired';
  },

  async addActivityLog(log: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<ActivityLog> {
    const db = await getAdminDb();
    const { data, error } = await db
      .from('activity_logs')
      .insert({
        user_name: log.userName,
        user_role: mapRoleReverse(log.userRole),
        action: log.action,
        target: log.target,
        type: log.type,
      })
      .select('*')
      .single();

    throwOnDbError(error, 'Gagal menyimpan log aktivitas');

    return {
      ...log,
      id: String(data!.id),
      timestamp: new Date(data!.created_at).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  },

  async saveSettings(settings: StoreSettings): Promise<StoreSettings> {
    const db = await getAdminDb();
    const ppnRate = assertFiniteNumber(settings.ppnRate, 'Tarif PPN (%)', 0);
    if (ppnRate > 100) {
      throw new Error('Tarif PPN maksimal 100%.');
    }
    const approvalLimit = assertFiniteNumber(settings.approvalLimit, 'Limit approval biaya', 0);

    const { error } = await db
      .from('store_settings')
      .upsert(
        {
          key: 'finance_tax_config',
          value: { ppnRate, approvalLimit },
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    throwOnDbError(error, 'Gagal menyimpan konfigurasi toko');
    return { ppnRate, approvalLimit };
  },
};
