import { NextRequest, NextResponse } from 'next/server';
import { adminSupabaseService } from '@/lib/admin-suite/adminSupabaseService';
import { adminSupabaseMutations } from '@/lib/admin-suite/adminSupabaseMutations';
import { requireVerifiedStaff } from '@/lib/services/sessionServerHelper';
import { Role } from '@/lib/admin-suite/types';

function mapStaffAdminRole(dbRole: string): Role {
  if (dbRole === 'kasir') return 'store_admin';
  if (dbRole === 'gudang') return 'warehouse_admin';
  return 'superadmin';
}

const READ_PERMISSIONS: Record<Role, Set<string>> = {
  superadmin: new Set([
    'all',
    'products',
    'orders',
    'employees',
    'inbound',
    'expenses',
    'activityLogs',
    'stockAdjustments',
    'promos',
    'reviews',
    'settings',
  ]),
  store_admin: new Set(['all', 'products', 'orders', 'promos', 'reviews', 'settings']),
  warehouse_admin: new Set(['all', 'products', 'orders', 'inbound', 'stockAdjustments', 'settings']),
};

const WRITE_PERMISSIONS: Record<Role, Set<string>> = {
  superadmin: new Set([
    'addProduct',
    'updateProduct',
    'deleteProduct',
    'adjustStock',
    'updateOrderStatus',
    'createOrder',
    'addExpense',
    'addInbound',
    'updateInboundStatus',
    'addEmployee',
    'updateEmployee',
    'deleteEmployee',
    'addPromo',
    'togglePromoStatus',
    'addActivityLog',
    'saveSettings',
  ]),
  store_admin: new Set([
    'addProduct',
    'updateProduct',
    'deleteProduct',
    'updateOrderStatus',
    'createOrder',
    'addPromo',
    'togglePromoStatus',
    'addActivityLog',
  ]),
  warehouse_admin: new Set(['adjustStock', 'addInbound', 'updateInboundStatus', 'updateOrderStatus', 'addActivityLog']),
};

export async function GET(request: NextRequest) {
  try {
    const staff = await requireVerifiedStaff(request);
    if (!staff) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: sesi staf tidak valid atau dinonaktifkan.' },
        { status: 401 }
      );
    }

    const adminRole = mapStaffAdminRole(staff.role);
    const { searchParams } = new URL(request.url);
    const resource = searchParams.get('resource') || 'all';

    if (!READ_PERMISSIONS[adminRole].has(resource)) {
      return NextResponse.json(
        { success: false, error: 'Anda tidak memiliki izin mengakses sumber daya ini.' },
        { status: 403 }
      );
    }

    if (resource === 'products') return NextResponse.json({ success: true, data: await adminSupabaseService.getProducts() });
    if (resource === 'orders') return NextResponse.json({ success: true, data: await adminSupabaseService.getOrders() });
    if (resource === 'employees') return NextResponse.json({ success: true, data: await adminSupabaseService.getEmployees() });
    if (resource === 'inbound') return NextResponse.json({ success: true, data: await adminSupabaseService.getInboundShipments() });
    if (resource === 'expenses') return NextResponse.json({ success: true, data: await adminSupabaseService.getExpenses() });
    if (resource === 'activityLogs') return NextResponse.json({ success: true, data: await adminSupabaseService.getActivityLogs() });
    if (resource === 'stockAdjustments') return NextResponse.json({ success: true, data: await adminSupabaseService.getStockAdjustments() });
    if (resource === 'promos') return NextResponse.json({ success: true, data: await adminSupabaseService.getPromos() });
    if (resource === 'reviews') return NextResponse.json({ success: true, data: await adminSupabaseService.getReviews() });
    if (resource === 'settings') return NextResponse.json({ success: true, data: await adminSupabaseService.getSettings() });

    const isSuperadmin = adminRole === 'superadmin';
    const [
      products,
      orders,
      employees,
      inboundShipments,
      expenses,
      activityLogs,
      stockAdjustments,
      promos,
      reviews,
      settings,
    ] = await Promise.all([
      adminSupabaseService.getProducts(),
      adminSupabaseService.getOrders(),
      isSuperadmin ? adminSupabaseService.getEmployees() : Promise.resolve([]),
      adminSupabaseService.getInboundShipments(),
      isSuperadmin ? adminSupabaseService.getExpenses() : Promise.resolve([]),
      isSuperadmin ? adminSupabaseService.getActivityLogs() : Promise.resolve([]),
      adminSupabaseService.getStockAdjustments(),
      adminRole !== 'warehouse_admin' ? adminSupabaseService.getPromos() : Promise.resolve([]),
      adminRole !== 'warehouse_admin' ? adminSupabaseService.getReviews() : Promise.resolve([]),
      adminSupabaseService.getSettings(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        products,
        orders,
        employees,
        inboundShipments,
        expenses,
        activityLogs,
        stockAdjustments,
        promos,
        reviews,
        settings,
      },
    });
  } catch (err) {
    console.error('[GET /api/admin/suite] Error:', err);
    return NextResponse.json({ success: false, error: 'Gagal memuat data admin suite' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const staff = await requireVerifiedStaff(request);
    if (!staff) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: sesi staf tidak valid atau dinonaktifkan.' },
        { status: 401 }
      );
    }

    const adminRole = mapStaffAdminRole(staff.role);
    const body = await request.json();
    const action = typeof body?.action === 'string' ? body.action : '';
    const payload = body?.payload ?? {};

    if (!WRITE_PERMISSIONS[adminRole].has(action)) {
      return NextResponse.json(
        { success: false, error: `Akses ditolak: peran Anda tidak diizinkan menjalankan aksi ${action}.` },
        { status: 403 }
      );
    }

    if (adminRole === 'warehouse_admin' && action === 'updateOrderStatus') {
      const allowedWarehouseStatuses = new Set(['packing', 'shipped', 'delivered']);
      if (!allowedWarehouseStatuses.has(String(payload.status))) {
        return NextResponse.json(
          { success: false, error: 'Staf gudang hanya dapat memperbarui status packing, dikirim, atau selesai.' },
          { status: 403 }
        );
      }
    }

    let result: unknown = null;

    switch (action) {
      case 'addProduct':
        result = await adminSupabaseMutations.addProduct(payload);
        break;
      case 'updateProduct':
        await adminSupabaseMutations.updateProduct(payload.id, payload.updates);
        break;
      case 'deleteProduct':
        await adminSupabaseMutations.deleteProduct(payload.id);
        break;
      case 'adjustStock':
        result = await adminSupabaseMutations.adjustStock(
          payload.sku,
          payload.diff,
          payload.reason,
          staff.fullName
        );
        break;
      case 'updateOrderStatus':
        result = await adminSupabaseMutations.updateOrderStatus(
          payload.id,
          payload.status,
          payload.trackingNumber
        );
        break;
      case 'createOrder':
        result = await adminSupabaseMutations.createOrder(payload);
        break;
      case 'addExpense':
        result = await adminSupabaseMutations.addExpense(payload);
        break;
      case 'addInbound':
        result = await adminSupabaseMutations.addInbound(payload);
        break;
      case 'updateInboundStatus':
        result = await adminSupabaseMutations.updateInboundStatus(
          payload.id,
          payload.status,
          staff.fullName,
          payload.targetProductId
        );
        break;
      case 'addEmployee':
        result = await adminSupabaseMutations.addEmployee(payload);
        break;
      case 'updateEmployee':
        await adminSupabaseMutations.updateEmployee(payload.id, payload.updates);
        break;
      case 'deleteEmployee':
        await adminSupabaseMutations.deleteEmployee(payload.id);
        break;
      case 'addPromo':
        result = await adminSupabaseMutations.addPromo(payload);
        break;
      case 'togglePromoStatus':
        result = await adminSupabaseMutations.togglePromoStatus(payload.id);
        break;
      case 'addActivityLog':
        result = await adminSupabaseMutations.addActivityLog({
          action: String(payload.action || ''),
          target: String(payload.target || ''),
          type: payload.type || 'system',
          userName: staff.fullName,
          userRole: adminRole,
        });
        break;
      case 'saveSettings':
        result = await adminSupabaseMutations.saveSettings(payload);
        break;
      default:
        return NextResponse.json({ success: false, error: 'Aksi admin tidak dikenal.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error('[POST /api/admin/suite] Error:', err);
    const msg = err instanceof Error ? err.message : 'Gagal menjalankan mutasi admin suite';
    const isClientError = /tidak|harus|sudah|gagal menambahkan|minimal|maksimal|negatif/i.test(msg);
    return NextResponse.json({ success: false, error: msg }, { status: isClientError ? 400 : 500 });
  }
}
