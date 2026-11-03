'use client';

import React from 'react';

interface CheckoutSummaryBoxProps {
  itemsCount: number;
  subtotal: number;
  discountAmount: number;
  appliedCoupon: string | null;
  selectedCourier: string;
  isFreeShipping: boolean;
  shippingCost: number;
  grandTotal: number;
  paymentMethod: 'QRIS' | 'Bank Transfer';
}

export const CheckoutSummaryBox: React.FC<CheckoutSummaryBoxProps> = ({
  itemsCount,
  subtotal,
  discountAmount,
  appliedCoupon,
  selectedCourier,
  isFreeShipping,
  shippingCost,
  grandTotal,
  paymentMethod,
}) => {
  return (
    <div className="p-3.5 bg-zinc-100 border border-zinc-200 text-xs space-y-1 rounded-none">
      <div className="flex justify-between text-zinc-600">
        <span>Total Produk ({itemsCount} item):</span>
        <span>Rp {subtotal.toLocaleString('id-ID')}</span>
      </div>
      {discountAmount > 0 && (
        <div className="flex justify-between text-green-700 font-semibold">
          <span>Diskon Kupon ({appliedCoupon}):</span>
          <span>- Rp {discountAmount.toLocaleString('id-ID')}</span>
        </div>
      )}
      <div className="flex justify-between text-zinc-600">
        <span>Ongkos Kirim ({selectedCourier}):</span>
        <span>{isFreeShipping ? 'GRATIS' : `Rp ${shippingCost.toLocaleString('id-ID')}`}</span>
      </div>
      <div className="flex justify-between font-black text-sm text-zinc-950 pt-1 border-t border-zinc-300">
        <span>TOTAL ESTIMASI:</span>
        <span className="text-[#E60012]">
          Rp {grandTotal.toLocaleString('id-ID')}
          {paymentMethod === 'Bank Transfer' && (
            <span className="text-[10px] text-zinc-500 font-normal ml-1">
              (+ 3 digit kode unik saat submit)
            </span>
          )}
        </span>
      </div>
    </div>
  );
};
