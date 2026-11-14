'use client';

import { useState, useEffect, useRef } from 'react';
import { UserAddress, BANK_ACCOUNTS, Order } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { dataStore } from '@/lib/store';

interface UseCheckoutFormParams {
  isOpen: boolean;
  selectedCourier: string;
  shippingCost: number;
  subtotal: number;
  onConfirmOrder: (payload: {
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
  }) => Promise<{ success: boolean; order?: Order; message?: string }>;
  onOrderSuccess: () => void;
}

export function useCheckoutForm({
  isOpen,
  selectedCourier,
  shippingCost,
  subtotal,
  onConfirmOrder,
  onOrderSuccess,
}: UseCheckoutFormParams) {
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'QRIS' | 'Bank Transfer'>('QRIS');
  const [selectedBank, setSelectedBank] = useState<keyof typeof BANK_ACCOUNTS>('BCA');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const prevUserIdRef = useRef<string | null>(user?.id || null);

  // Auto pre-fill from user profile and address book, and reset transient state when closed or user changes
  useEffect(() => {
    const currentUid = user?.id || null;
    if (prevUserIdRef.current !== currentUid) {
      prevUserIdRef.current = currentUid;
      setName('');
      setPhone('');
      setAddress('');
      setSelectedAddressId('');
      setSavedAddresses([]);
      setCreatedOrder(null);
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setCouponCode('');
      setCouponMsg(null);
      setErrorMsg('');
    }

    if (!isOpen) {
      setCreatedOrder(null);
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setCouponCode('');
      setCouponMsg(null);
      setErrorMsg('');
      return;
    }

    let cancelled = false;
    if (user) {
      if (!name) setName(user.full_name || '');
      if (!phone) setPhone(user.phone || '');

      dataStore.getUserAddresses(user.id).then((addrs) => {
        if (cancelled) return;
        setSavedAddresses(addrs);
        const def = addrs.find((a) => a.is_default) || addrs[0];
        if (def) {
          setSelectedAddressId(def.id);
          if (!address) {
            setAddress(`${def.address_line}, ${def.city} ${def.postal_code}`);
          }
          if (def.phone && !phone) setPhone(def.phone);
          if (def.recipient_name && !name) setName(def.recipient_name);
        }
      });
    } else {
      setSavedAddresses([]);
    }
    return () => {
      cancelled = true;
    };
  }, [user, isOpen]);

  // Re-validate applied coupon cleanly if subtotal changes
  useEffect(() => {
    if (!isOpen || !appliedCoupon) return;
    let active = true;
    fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: appliedCoupon, subtotal }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data.valid) {
          setDiscountAmount(data.discount_amount);
          setCouponMsg({ text: data.message, isError: false });
        } else {
          setAppliedCoupon(null);
          setDiscountAmount(0);
          setCouponMsg({ text: data.message || 'Kupon tidak lagi memenuhi syarat.', isError: true });
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [subtotal, isOpen, appliedCoupon]);

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponCode).toUpperCase().trim();
    if (!code) return;
    if (codeToApply) setCouponCode(code);
    setIsValidatingCoupon(true);
    setCouponMsg(null);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();

      if (data.valid) {
        setAppliedCoupon(code);
        setDiscountAmount(data.discount_amount);
        setCouponMsg({ text: data.message, isError: false });
      } else {
        setCouponMsg({ text: data.message || 'Kupon tidak valid.', isError: true });
        setAppliedCoupon(null);
        setDiscountAmount(0);
      }
    } catch (e) {
      setCouponMsg({ text: 'Gagal memvalidasi kupon.', isError: true });
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMsg('Anda harus masuk atau mendaftar akun terlebih dahulu untuk melakukan pemesanan.');
      return;
    }
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setErrorMsg('Mohon lengkapi Nama, No. WhatsApp, dan Alamat Pengiriman.');
      return;
    }

    // CK-05: Validasi format nomor telepon seluler Indonesia
    const cleanPhone = phone.replace(/[\s-]/g, '');
    const indonesianPhoneRegex = /^(?:\+62|62|0)8[1-9][0-9]{6,11}$/;
    if (!indonesianPhoneRegex.test(cleanPhone)) {
      setErrorMsg('Nomor WhatsApp tidak valid. Masukkan nomor seluler Indonesia yang valid (contoh: 081234567890).');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await onConfirmOrder({
        user_id: user.id,
        customer_email: user.email,
        customer_name: name.trim(),
        customer_phone: cleanPhone,
        customer_address: address.trim(),
        shipping_courier: selectedCourier,
        shipping_cost: shippingCost,
        coupon_code: appliedCoupon || undefined,
        discount_amount: discountAmount > 0 ? discountAmount : undefined,
        payment_method: paymentMethod,
        bank_name: paymentMethod === 'Bank Transfer' ? selectedBank : undefined,
      });

      if (res.success && res.order) {
        setCreatedOrder(res.order);
        onOrderSuccess();
        // Catatan: Notifikasi faktur email HANYA dikirim jika pesanan sudah berstatus 'Dibayar' / Lunas
      } else {
        setErrorMsg(res.message || 'Terjadi kesalahan saat memproses pesanan.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal terhubung ke server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    name,
    setName,
    phone,
    setPhone,
    address,
    setAddress,
    savedAddresses,
    selectedAddressId,
    setSelectedAddressId,
    paymentMethod,
    setPaymentMethod,
    selectedBank,
    setSelectedBank,
    isSubmitting,
    createdOrder,
    setCreatedOrder,
    errorMsg,
    couponCode,
    setCouponCode,
    appliedCoupon,
    discountAmount,
    couponMsg,
    isValidatingCoupon,
    handleApplyCoupon,
    handleCheckout,
  };
}
