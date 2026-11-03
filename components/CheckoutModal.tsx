// components/CheckoutModal.tsx
'use client';

import React from 'react';
import { CartItem, Order } from '@/lib/types';
import { X, ArrowRight, Lock } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { COURIERS, FREE_SHIPPING_THRESHOLD } from './CartDrawer';
import { useCheckoutForm } from '@/lib/hooks/useCheckoutForm';
import { CheckoutCustomerFields } from './checkout/CheckoutCustomerFields';
import { CheckoutCouponSection } from './checkout/CheckoutCouponSection';
import { CheckoutPaymentMethodSelector } from './checkout/CheckoutPaymentMethodSelector';
import { CheckoutSummaryBox } from './checkout/CheckoutSummaryBox';
import { CheckoutSuccessView } from './checkout/CheckoutSuccessView';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  selectedCourier: string;
  onConfirmOrder: (payload: {
    user_id?: string;
    customer_name: string;
    customer_phone: string;
    customer_address: string;
    shipping_courier: string;
    shipping_cost: number;
    coupon_code?: string;
    discount_amount?: number;
    payment_method: 'QRIS' | 'Bank Transfer' | 'COD';
    bank_name?: string;
  }) => Promise<{ success: boolean; order?: Order; message?: string }>;
  onOrderSuccess: () => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  items,
  selectedCourier,
  onConfirmOrder,
  onOrderSuccess,
}: CheckoutModalProps) {
  const { user, openAuthModal } = useAuth();
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const courierObj = COURIERS.find((c) => c.name === selectedCourier) || COURIERS[0];
  const shippingCost = isFreeShipping ? 0 : courierObj.price;

  const form = useCheckoutForm({
    isOpen,
    selectedCourier,
    shippingCost,
    subtotal,
    onConfirmOrder,
    onOrderSuccess,
  });

  if (!isOpen) return null;

  const grandTotal = Math.max(0, subtotal - form.discountAmount + shippingCost);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans">
      <div className="bg-white border border-zinc-300 w-full max-w-xl overflow-hidden shadow-2xl animate-in max-sm:slide-in-from-bottom sm:zoom-in-95 duration-200 max-sm:max-h-[92vh] rounded-none">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div>
            <span className="text-[10px] font-bold text-[#E60012] uppercase tracking-widest">
              MODUL TRANSAKSI (TPS)
            </span>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-zinc-900">
              {form.createdOrder ? 'Faktur Nota Transaksi Digital' : 'Konfirmasi & Checkout Belanja'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-zinc-900 cursor-pointer" aria-label="Tutup">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 max-h-[85vh] overflow-y-auto">
          {!user ? (
            <div className="text-center py-8 px-4 space-y-4">
              <div className="w-12 h-12 bg-red-50 text-[#E60012] flex items-center justify-center mx-auto border border-red-200">
                <Lock size={22} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-black uppercase text-zinc-900 tracking-tight">
                  Wajib Masuk / Daftar Akun
                </h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
                  Untuk keamanan transaksi dan penerbitan faktur digital resmi, Anda wajib masuk atau mendaftar akun sebelum melanjutkan pesanan.
                </p>
              </div>
              <div className="flex flex-col gap-2 max-w-xs mx-auto pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openAuthModal();
                  }}
                  className="w-full py-3 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Masuk / Daftar Akun Sekarang →
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 border border-zinc-300 text-zinc-700 text-xs font-bold uppercase tracking-wider hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  Kembali ke Keranjang
                </button>
              </div>
            </div>
          ) : !form.createdOrder ? (
            <form onSubmit={form.handleCheckout} className="space-y-4">
              {form.errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-none">
                  {form.errorMsg}
                </div>
              )}

              {/* Recipient & Address Fields */}
              <CheckoutCustomerFields
                savedAddresses={form.savedAddresses}
                selectedAddressId={form.selectedAddressId}
                setSelectedAddressId={form.setSelectedAddressId}
                name={form.name}
                setName={form.setName}
                phone={form.phone}
                setPhone={form.setPhone}
                address={form.address}
                setAddress={form.setAddress}
              />

              {/* Coupon Engine */}
              <CheckoutCouponSection
                couponCode={form.couponCode}
                setCouponCode={form.setCouponCode}
                appliedCoupon={form.appliedCoupon}
                isValidatingCoupon={form.isValidatingCoupon}
                couponMsg={form.couponMsg}
                onApplyCoupon={form.handleApplyCoupon}
              />

              {/* Payment Method Selector */}
              <CheckoutPaymentMethodSelector
                paymentMethod={form.paymentMethod}
                setPaymentMethod={form.setPaymentMethod}
                selectedBank={form.selectedBank}
                setSelectedBank={form.setSelectedBank}
              />

              {/* Summary Box */}
              <CheckoutSummaryBox
                itemsCount={items.length}
                subtotal={subtotal}
                discountAmount={form.discountAmount}
                appliedCoupon={form.appliedCoupon}
                selectedCourier={selectedCourier}
                isFreeShipping={isFreeShipping}
                shippingCost={shippingCost}
                grandTotal={grandTotal}
                paymentMethod={form.paymentMethod}
              />

              <button
                type="submit"
                disabled={form.isSubmitting}
                className="w-full py-4 bg-[#111111] hover:bg-[#E60012] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 rounded-none min-h-[48px] cursor-pointer"
              >
                {form.isSubmitting ? (
                  <span>Memproses Transaksi...</span>
                ) : (
                  <>
                    <span>
                      {form.paymentMethod === 'Bank Transfer'
                        ? 'Konfirmasi & Dapatkan Kode Unik Transfer'
                        : 'Konfirmasi & Terbitkan QRIS'}
                    </span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <CheckoutSuccessView
              order={form.createdOrder}
              onClose={onClose}
              onStatusChanged={(newStatus) => {
                form.setCreatedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
