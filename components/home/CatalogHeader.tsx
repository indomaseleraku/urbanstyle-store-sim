// components/home/CatalogHeader.tsx
'use client';

import React from 'react';

interface CatalogHeaderProps {
  selectedGender: string;
  selectedCategory: string;
  categoryDisplayName: string;
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  kaos: 'Kaos T-Shirt Siluet Boxy 280 GSM dan Serat Sejuk Katun Murni untuk kenyamanan iklim tropis.',
  kemeja: 'Koleksi Kemeja Flannel Double-Brushed dan Katun Oxford Murni bertekstur lembut untuk gaya kerja dan kasual.',
  polo: 'Koleksi Kaos Polo Katun Pique berkerah rajut presisi untuk tampilan rapi dan santai.',
  jaket: 'Jaket Parka Proteksi UV UPF 40+ saku lipat, Denim Trucker, dan Luaran Tahan Angin.',
  hoodie: 'Hoodie Sweatshirt French Terry Katun Tebal, Cardigan Rajut, dan Sweater Crewneck hangat.',
  'celana-panjang': 'Celana Chino, Smart Ankle, dan Regular Fit berdaya lentur 360 derajat untuk aktivitas harian.',
  'celana-pendek': 'Celana Pendek Katun Chino dan Easy Shorts santai untuk kenyamanan maksimal di rumah maupun bepergian.',
  celana: 'Koleksi Celana Panjang dan Pendek dengan daya lentur tinggi untuk mobilitas bebas sepanjang hari.',
  sale: 'Penawaran harga spesial terbatas untuk ragam koleksi busana esensial LifeWear pilihan.',
  all: 'Koleksi pakaian fungsional berdesain sederhana dan berkualitas tinggi untuk kenyamanan aktivitas keseharian.',
};

export default function CatalogHeader({
  selectedGender,
  selectedCategory,
  categoryDisplayName,
}: CatalogHeaderProps) {
  const genderLabel = selectedGender === 'all' ? 'SEMUA KOLEKSI' : selectedGender.toUpperCase();
  const description = CATEGORY_DESCRIPTIONS[selectedCategory] || CATEGORY_DESCRIPTIONS.all;

  return (
    <div className="space-y-1.5 border-b border-zinc-100 pb-4">
      {/* Uniqlo LifeWear Minimalist Breadcrumbs */}
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
        <span>BERANDA</span>
        <span>/</span>
        <span className="text-[#E60012]">{genderLabel}</span>
        {selectedCategory !== 'all' && (
          <>
            <span>/</span>
            <span className="text-zinc-800">{categoryDisplayName}</span>
          </>
        )}
      </div>

      <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-950">
        {selectedCategory === 'all'
          ? selectedGender === 'all'
            ? 'Semua Koleksi Busana LifeWear'
            : `Koleksi ${selectedGender.toUpperCase()}`
          : categoryDisplayName}
      </h2>

      <p className="text-xs sm:text-sm text-zinc-500 max-w-3xl leading-relaxed">
        {description}
      </p>
    </div>
  );
}
