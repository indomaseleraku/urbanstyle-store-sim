'use client';

import React, { useState } from 'react';
import { useAdminSuite } from '@/lib/admin-suite/AdminSuiteContext';
import { X, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { Product } from '@/lib/admin-suite/types';
import { StorefrontPreviewSuccess } from './StorefrontPreviewSuccess';
import { StorefrontProductSelector } from './StorefrontProductSelector';

export const StorefrontPreviewModal: React.FC = () => {
  const {
    isStorefrontOpen,
    setIsStorefrontOpen,
    products,
    createOrder,
    formatRupiah,
  } = useAdminSuite();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerCity, setBuyerCity] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [courier, setCourier] = useState<'JNE Reguler' | 'SiCepat Kilat' | 'GoSend Instant'>('SiCepat Kilat');
  const [paymentMethod, setPaymentMethod] = useState<'QRIS' | 'Transfer Bank BCA' | 'COD'>('QRIS');
  const [orderSuccessId, setOrderSuccessId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (!isStorefrontOpen) return null;

  const currentProduct =
    (selectedProduct ? products.find((p) => p.id === selectedProduct.id) : null) || products[0];
  const maxStock = Math.max(0, currentProduct?.stock || 0);
  const safeQty = maxStock > 0 ? Math.min(Math.max(1, qty), maxStock) : 0;
  const subtotal = currentProduct ? currentProduct.price * safeQty : 0;
  const shippingCost = courier === 'GoSend Instant' ? 35000 : 20000;
  const total = subtotal + shippingCost;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!currentProduct) return;
    if (maxStock <= 0 || safeQty <= 0) {
      setSubmitError('Stok produk saat ini habis dan tidak dapat dipesan.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await createOrder({
        customerName: buyerName.trim(),
        customerPhone: buyerPhone.trim(),
        customerEmail: `${buyerName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '.') || 'pelanggan'}@urbanstyle.id`,
        shippingAddress: buyerAddress.trim(),
        city: buyerCity.trim(),
        courier,
        paymentMethod,
        items: [
          {
            productId: currentProduct.id,
            sku: currentProduct.sku,
            name: currentProduct.name,
            price: currentProduct.price,
            quantity: safeQty,
            imageUrl: currentProduct.imageUrl,
          },
        ],
        subtotal,
        shippingCost,
        discount: 0,
        total,
      });

      if (created) {
        setOrderSuccessId(created.orderNumber);
      } else {
        setSubmitError('Pesanan gagal disimpan ke Supabase. Periksa ketersediaan stok.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setOrderSuccessId(null);
    setSubmitError('');
    setQty(1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-lg max-w-3xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 transition-colors">
        <div className="p-4 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold tracking-tight">Preview Etalase Toko (Customer Checkout)</h2>
              <p className="text-[11px] text-slate-400">
                Buat pesanan dari perspektif pelanggan — tersimpan permanen ke Supabase
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsStorefrontOpen(false);
              setOrderSuccessId(null);
              setSubmitError('');
            }}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {orderSuccessId && currentProduct ? (
          <StorefrontPreviewSuccess
            orderSuccessId={orderSuccessId}
            currentProduct={currentProduct}
            qty={safeQty}
            onReset={handleReset}
            onClose={() => setIsStorefrontOpen(false)}
          />
        ) : (
          <form onSubmit={handlePlaceOrder} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-800 dark:text-slate-200">
            <StorefrontProductSelector
              products={products}
              currentProduct={currentProduct}
              setSelectedProduct={setSelectedProduct}
              qty={safeQty}
              setQty={setQty}
            />

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800">
                2. Data Pembeli & Pembayaran
              </h3>

              {submitError && (
                <div className="p-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded text-rose-700 dark:text-rose-300">
                  {submitError}
                </div>
              )}

              <div className="space-y-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-0.5">Nama Pembeli</label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:bg-white dark:focus:bg-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-0.5">WhatsApp</label>
                    <input
                      type="text"
                      required
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:bg-white dark:focus:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-0.5">Kota Tujuan</label>
                    <input
                      type="text"
                      required
                      value={buyerCity}
                      onChange={(e) => setBuyerCity(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:bg-white dark:focus:bg-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-0.5">Alamat Pengiriman</label>
                  <input
                    type="text"
                    required
                    value={buyerAddress}
                    onChange={(e) => setBuyerAddress(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:bg-white dark:focus:bg-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-0.5">Kurir Ekspedisi</label>
                    <select
                      value={courier}
                      onChange={(e) => setCourier(e.target.value as 'JNE Reguler' | 'SiCepat Kilat' | 'GoSend Instant')}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 cursor-pointer"
                    >
                      <option value="SiCepat Kilat">SiCepat Kilat (Rp 20.000)</option>
                      <option value="JNE Reguler">JNE Reguler (Rp 20.000)</option>
                      <option value="GoSend Instant">GoSend Instant (Rp 35.000)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-0.5">Metode Bayar</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as 'QRIS' | 'Transfer Bank BCA' | 'COD')}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 cursor-pointer"
                    >
                      <option value="QRIS">QRIS Instant</option>
                      <option value="Transfer Bank BCA">Transfer Bank BCA</option>
                      <option value="COD">Bayar di Tempat (COD)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white text-sm">
                  <span>Total Transaksi:</span>
                  <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400">{formatRupiah(total)}</span>
                </div>

                <button
                  type="submit"
                  disabled={submitting || maxStock <= 0}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {submitting ? 'Menyimpan Pesanan...' : maxStock <= 0 ? 'Stok Produk Habis' : 'Kirim Pesanan (Checkout Sekarang)'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
