'use client';

// components/admin/modals/StorefrontPreviewModal.tsx
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
  const [buyerName, setBuyerName] = useState('Nadia Safitri');
  const [buyerPhone, setBuyerPhone] = useState('+62 813-8899-2345');
  const [buyerCity, setBuyerCity] = useState('Jakarta Selatan');
  const [buyerAddress, setBuyerAddress] = useState('Jl. Bangka Raya No. 14, Mampang Prapatan');
  const [courier, setCourier] = useState<'JNE Reguler' | 'SiCepat Kilat' | 'GoSend Instant'>('SiCepat Kilat');
  const [paymentMethod, setPaymentMethod] = useState<'QRIS' | 'Transfer Bank BCA' | 'COD'>('QRIS');
  const [orderSuccessId, setOrderSuccessId] = useState<string | null>(null);

  if (!isStorefrontOpen) return null;

  const currentProduct = selectedProduct || products[0];
  const subtotal = currentProduct ? currentProduct.price * qty : 0;
  const shippingCost = courier === 'GoSend Instant' ? 35000 : 20000;
  const total = subtotal + shippingCost;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct) return;

    const newOrder = createOrder({
      customerName: buyerName,
      customerPhone: buyerPhone,
      customerEmail: `${buyerName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      shippingAddress: buyerAddress,
      city: buyerCity,
      courier,
      paymentMethod,
      items: [
        {
          productId: currentProduct.id,
          sku: currentProduct.sku,
          name: currentProduct.name,
          price: currentProduct.price,
          quantity: qty,
          imageUrl: currentProduct.imageUrl,
        },
      ],
      subtotal,
      shippingCost,
      discount: 0,
      total,
    });

    setOrderSuccessId(newOrder.orderNumber);
  };

  const handleReset = () => {
    setOrderSuccessId(null);
    setQty(1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-lg max-w-3xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 transition-colors">
        {/* Header */}
        <div className="p-4 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold tracking-tight">Preview Etalase Toko (Customer Checkout)</h2>
              <p className="text-[11px] text-slate-400">
                Buat pesanan dari perspektif pelanggan — data langsung mengalir ke 3 dashboard operasional
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsStorefrontOpen(false);
              setOrderSuccessId(null);
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
            qty={qty}
            onReset={handleReset}
            onClose={() => setIsStorefrontOpen(false)}
          />
        ) : (
          <form onSubmit={handlePlaceOrder} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-800 dark:text-slate-200">
            {/* Left Column */}
            <StorefrontProductSelector
              products={products}
              currentProduct={currentProduct}
              setSelectedProduct={setSelectedProduct}
              qty={qty}
              setQty={setQty}
            />

            {/* Right Column: Customer Info & Courier */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800">
                2. Data Pembeli & Pembayaran
              </h3>

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
                      onChange={(e) => setCourier(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 cursor-pointer"
                    >
                      <option value="SiCepat Kilat" className="dark:bg-slate-800">SiCepat Kilat (Rp 20.000)</option>
                      <option value="JNE Reguler" className="dark:bg-slate-800">JNE Reguler (Rp 20.000)</option>
                      <option value="GoSend Instant" className="dark:bg-slate-800">GoSend Instant (Rp 35.000)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-0.5">Metode Bayar</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 cursor-pointer"
                    >
                      <option value="QRIS" className="dark:bg-slate-800">QRIS Instant</option>
                      <option value="Transfer Bank BCA" className="dark:bg-slate-800">Transfer Bank BCA</option>
                      <option value="COD" className="dark:bg-slate-800">Bayar di Tempat (COD)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Order total & CTA */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white text-sm">
                  <span>Total Transaksi:</span>
                  <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400">{formatRupiah(total)}</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Kirim Pesanan (Checkout Sekarang)
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
