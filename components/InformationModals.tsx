// components/InformationModals.tsx
'use client';

import React from 'react';
import { X, ShieldCheck, Truck, Sparkles, HelpCircle, CheckCircle2, RotateCcw } from 'lucide-react';

export type ModalType = 'return' | 'shipping' | 'lifewear' | 'help' | null;

interface InfoModalProps {
  type: ModalType;
  onClose: () => void;
}

export default function InformationModals({ type, onClose }: InfoModalProps) {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-zinc-300 w-full max-w-xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2.5">
            {type === 'return' && <RotateCcw className="text-[#E60012]" size={20} />}
            {type === 'shipping' && <Truck className="text-[#E60012]" size={20} />}
            {type === 'lifewear' && <Sparkles className="text-[#E60012]" size={20} />}
            {type === 'help' && <HelpCircle className="text-[#E60012]" size={20} />}
            
            <div>
              <span className="text-[10px] font-bold text-[#E60012] uppercase tracking-widest">
                INFORMASI RESMI
              </span>
              <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-zinc-950">
                {type === 'return' && 'Kebijakan Pengembalian & Garansi 30 Hari'}
                {type === 'shipping' && 'Panduan Pengiriman & Bebas Ongkir'}
                {type === 'lifewear' && 'Filosofi Desain LifeWear'}
                {type === 'help' && 'Layanan Pelanggan & Info Sistem'}
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 text-xs text-zinc-700 space-y-4">
          
          {type === 'return' && (
            <>
              <p className="text-sm font-bold text-zinc-900">
                Garansi Kenyamanan: Tukar Ukuran atau Pengembalian Dana Penuh dalam 30 Hari
              </p>
              <div className="space-y-3 bg-zinc-50 p-4 border border-zinc-200">
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-[#E60012] shrink-0 mt-0.5" />
                  <p><strong>Kondisi Pakaian:</strong> Belum dicuci, label barcode asli masih terpasang, dan tidak ada bau menyengat/noda.</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-[#E60012] shrink-0 mt-0.5" />
                  <p><strong>Tukar Ukuran:</strong> Gratis biaya ongkos kirim penukaran pertama jika pakaian kekecilan atau kebesaran.</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-[#E60012] shrink-0 mt-0.5" />
                  <p><strong>Proses Verifikasi:</strong> Dana pengembalian ditransfer via QRIS/Transfer Bank maksimal 1x24 jam setelah paket retur diterima gudang.</p>
                </div>
              </div>
              <p className="text-[11px] text-zinc-500">
                Untuk mengajukan pengembalian, hubungi tim support dengan menyebutkan nomor pesanan resmi (misal: <code>ORD-20261004-305</code>).
              </p>
            </>
          )}

          {type === 'shipping' && (
            <>
              <p className="text-sm font-bold text-zinc-900">
                Ketentuan Pengiriman & Bebas Biaya Kirim Seluruh Indonesia
              </p>
              <div className="space-y-3 bg-zinc-50 p-4 border border-zinc-200">
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-[#E60012] shrink-0 mt-0.5" />
                  <p><strong>Ambang Batas Gratis Ongkir:</strong> Otomatis GRATIS ONGKIR untuk total belanja produk minimal <strong>Rp 400.000</strong>.</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-[#E60012] shrink-0 mt-0.5" />
                  <p><strong>Pilihan Ekspedisi Rekanan:</strong> J&T Express (Reguler), JNE Reguler, dan SiCepat Reguler.</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-[#E60012] shrink-0 mt-0.5" />
                  <p><strong>Estimasi Tiba:</strong> Jabodetabek (1-2 hari kerja), Pulau Jawa (2-3 hari kerja), Luar Jawa (3-5 hari kerja).</p>
                </div>
              </div>
              <p className="text-[11px] text-zinc-500">
                Pesanan yang diverifikasi pembayarannya sebelum pukul 15.00 WIB akan dikirim pada hari yang sama.
              </p>
            </>
          )}

          {type === 'lifewear' && (
            <>
              <div className="space-y-3 leading-relaxed">
                <p className="text-sm font-bold text-zinc-900 uppercase tracking-tight">
                  "Simple made better." — Filosofi Esensial Keseharian
                </p>
                <p>
                  LifeWear adalah pakaian yang dirancang untuk membuat hidup setiap orang menjadi lebih baik. 
                  Sederhana, bermutu tinggi, esensial, dengan detail yang terus disempurnakan.
                </p>
                <div className="p-3.5 bg-zinc-50 border border-zinc-200 space-y-2">
                  <p className="font-bold text-zinc-900 text-xs">3 Pilar Inovasi UrbanStyle LifeWear:</p>
                  <p>• <strong>Kenyamanan Teknologi Kain:</strong> Mengadopsi teknologi AIRism untuk kesejukan tropis dan katun double-brushed untuk kehangatan lembut.</p>
                  <p>• <strong>Siluet Abadi:</strong> Desain minimalis yang tidak lekang oleh tren musiman sesaat.</p>
                  <p>• <strong>Aksesibilitas Universal:</strong> Harga yang masuk akal dengan standar kendali mutu ketat.</p>
                </div>
              </div>
            </>
          )}

          {type === 'help' && (
            <>
              <p className="text-sm font-bold text-zinc-900">
                Pusat Bantuan & Layanan Konsumen UrbanStyle
              </p>
              <div className="space-y-3 bg-zinc-50 p-4 border border-zinc-200">
                <div>
                  <strong className="text-zinc-900">Jam Layanan Pelanggan:</strong>
                  <p className="text-[11px] text-zinc-600">Senin – Minggu, 08.00 – 21.00 WIB (Termasuk Hari Libur Nasional)</p>
                </div>
                <div>
                  <strong className="text-zinc-900">Kontak WhatsApp Layanan Toko:</strong>
                  <p className="text-[11px] text-zinc-600 font-mono">+62 812-3456-7890</p>
                </div>
                <div>
                  <strong className="text-zinc-900">Email Resmi Layanan:</strong>
                  <p className="text-[11px] text-zinc-600 font-mono">cs@urbanstyle.store</p>
                </div>
              </div>
              <p className="text-[11px] text-zinc-500">
                Tim layanan pelanggan kami siap membantu pertanyaan terkait pesanan, pelacakan ekspedisi, panduan ukuran, dan penukaran produk.
              </p>
            </>
          )}

          <div className="pt-3 border-t border-zinc-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-zinc-900 hover:bg-[#E60012] text-white text-xs font-bold uppercase transition-colors"
            >
              Tutup Informasi
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
