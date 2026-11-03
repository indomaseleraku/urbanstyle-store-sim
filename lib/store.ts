// lib/store.ts
// Facade Unified Data Layer (Clean Architecture V3.1)
// Mendelegasikan operasi ke Domain Services modular di lib/services/

export { 
  supabase, 
  isSupabaseConfigured, 
  supabaseUrl, 
  supabaseAnonKey, 
  serviceRoleKey, 
  effectiveKey 
} from './services/supabaseClient';

export { sanitizeLifeWearImage } from './services/productService';
export { qrisService, calculateCRC16CCITT } from './services/qrisService';
export { settlementService } from './services/settlementService';
export { orderExpirationService } from './services/orderExpirationService';
import { orderExpirationService } from './services/orderExpirationService';

import { productService } from './services/productService';
import { orderService } from './services/orderService';
import { couponService } from './services/couponService';
import { trackingService } from './services/trackingService';
import { staffService } from './services/staffService';
import { dssService } from './services/dssService';
import { qrisService } from './services/qrisService';
import { settlementService, PaymentWebhookPayload } from './services/settlementService';

import { 
  Product, Category, Order, Review, Coupon, 
  UserProfile, UserAddress, OrderStatus, StaffUser, CartItem 
} from './types';

export const dataStore = {
  // Invalidation & Cache
  invalidateCache: () => productService.invalidateCache(),

  // 1. Kategori
  getCategories: () => productService.getCategories(),

  // 2. Produk
  getProducts: (categorySlug?: string, query?: string, gender?: string, sortBy?: string) => 
    productService.getProducts(categorySlug, query, gender, sortBy),
  getProductById: (id: number) => productService.getProductById(id),
  getProductBySlug: (slug: string) => productService.getProductBySlug(slug),
  addProduct: (newP: Omit<Product, 'id'>) => productService.addProduct(newP),
  updateProduct: (productId: number, updateData: Partial<Product>) => productService.updateProduct(productId, updateData),
  deleteProduct: (productId: number) => productService.deleteProduct(productId),
  updateStock: (productId: number, newStock: number) => productService.updateStock(productId, newStock),

  // 3. Wishlist & Ulasan
  getWishlist: () => productService.getWishlist(),
  toggleWishlist: (product: Product) => productService.toggleWishlist(product),
  addReview: (productId: number, review: Omit<Review, 'id' | 'created_at'>) => productService.addReview(productId, review),

  // 4. Kupon & Voucher
  getCoupons: () => couponService.getCoupons(),
  getAllCoupons: () => couponService.getAllCoupons(),
  validateCoupon: (code: string, subtotal: number) => couponService.validateCoupon(code, subtotal),
  createCoupon: (newCoupon: Omit<Coupon, 'id' | 'used_count'>) => couponService.createCoupon(newCoupon),
  toggleCouponStatus: (couponId: number) => couponService.toggleCouponStatus(couponId),
  deleteCoupon: (couponId: number) => couponService.deleteCoupon(couponId),

  // 5. Transaksi TPS & Pesanan
  createOrder: (payload: {
    user_id?: string;
    customer_email?: string;
    customer_name: string;
    customer_phone: string;
    customer_address: string;
    shipping_courier: string;
    shipping_cost: number;
    coupon_code?: string;
    discount_amount?: number;
    payment_method: 'QRIS' | 'Bank Transfer' | 'COD';
    bank_name?: string;
    cart_items: CartItem[];
  }) => orderService.createOrder(payload),
  getOrders: (userId?: string) => orderService.getOrders(userId),
  getOrderByNumber: (orderNumber: string) => orderService.getOrderByNumber(orderNumber),
  updateOrderStatus: (orderNumber: string, status: OrderStatus, trackingNumber?: string) => 
    orderService.updateOrderStatus(orderNumber, status, trackingNumber),
  markInvoiceEmailSent: (orderNumber: string) => orderService.markInvoiceEmailSent(orderNumber),
  checkAndExpireOrders: (orders: Order[]) => orderExpirationService.checkAndExpireBatch(orders),
  getOrderRemainingTime: (createdAt: string) => orderExpirationService.getRemainingTime(createdAt),

  // 6. Pelacakan Logistik
  getOrderTracking: (orderNumber: string) => trackingService.getOrderTracking(orderNumber),

  // 7. Staf & Multi-Role RBAC
  getStaffList: () => staffService.getStaffList(),
  createStaff: (newStaffData: Omit<StaffUser, 'id' | 'created_at'>) => staffService.createStaff(newStaffData),
  toggleStaffStatus: (staffId: string) => staffService.toggleStaffStatus(staffId),

  // 8. Pengguna & Buku Alamat
  getUserProfile: (userIdOrEmail: string) => staffService.getUserProfile(userIdOrEmail),
  updateUserProfile: (userId: string, profileData: Partial<UserProfile>) => staffService.updateUserProfile(userId, profileData),
  getUserAddresses: (userId: string) => staffService.getUserAddresses(userId),
  addUserAddress: (address: Omit<UserAddress, 'id'>) => staffService.addUserAddress(address),
  deleteUserAddress: (addressId: string) => staffService.deleteUserAddress(addressId),
  setDefaultAddress: (userId: string, addressId: string) => staffService.setDefaultAddress(userId, addressId),

  // 9. DSS Analytics & Pareto 80/20
  getDSSAnalytics: (period?: 'all' | 'today' | '7days' | '30days') => dssService.getDSSAnalytics(period),

  // 10. QRIS Dinamis Standar EMVCo Bank Indonesia (FR-14)
  generateDynamicQRIS: (amount: number, options?: { orderNumber?: string; customMerchantName?: string; customBaseQRIS?: string }) =>
    qrisService.createDynamicQRIS(amount, options),

  // 11. Autonomous Settlement & Webhook Engine (FR-15)
  checkAndSettleOrder: (orderNumber: string) => settlementService.checkAndSettleOrder(orderNumber),
  processPaymentWebhook: (payload: PaymentWebhookPayload) => settlementService.processPaymentWebhook(payload),
  simulateInstantSettle: (orderNumber: string) => settlementService.simulateInstantSettle(orderNumber),
};
