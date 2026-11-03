// components/home/FloatingCartToast.tsx
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';

interface ToastData {
  visible: boolean;
  productName: string;
  colorName: string;
  size: string;
}

interface FloatingCartToastProps {
  toast: ToastData;
  onClose: () => void;
  onOpenCart: () => void;
}

export default function FloatingCartToast({
  toast,
  onClose,
  onOpenCart,
}: FloatingCartToastProps) {
  return (
    <AnimatePresence>
      {toast.visible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 max-w-sm w-[calc(100%-2rem)] bg-white border-2 border-zinc-950 p-4 shadow-2xl rounded-none"
        >
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-[#E60012] text-white flex items-center justify-center shrink-0 text-xs font-black">
              ✓
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#E60012]">
                ITEM MASUK KE TAS BELANJA
              </p>
              <p className="text-xs font-bold text-zinc-950 line-clamp-1 uppercase">
                {toast.productName}
              </p>
              <p className="text-[10px] text-zinc-500 font-medium">
                Varian: {toast.colorName} • Ukuran {toast.size}
              </p>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-2.5 py-1.5 border border-zinc-300 hover:border-zinc-950 text-[10px] font-bold uppercase tracking-wider text-zinc-800 rounded-none transition-colors cursor-pointer"
                >
                  Lanjut Belanja
                </button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCart();
                  }}
                  className="px-3 py-1.5 bg-zinc-950 hover:bg-[#E60012] text-white text-[10px] font-bold uppercase tracking-wider rounded-none transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Lihat Tas</span>
                  <ArrowRight size={11} />
                </motion.button>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-950 p-1 cursor-pointer"
              aria-label="Tutup notifikasi"
            >
              <X size={15} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
