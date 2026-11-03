# 📑 PRD v4.0: UrbanStyle LifeWear 3D Digital Flagship Store

**Target Repository**: `C:\project\websites\urbanstyle-store`  
**Benchmark**: Uniqlo Tokyo LifeWear Flagship + High-End Digital Experience (Zara / Nike Lab)  
**Status**: ACTIVE WORKING BLUEPRINT (v4.0 Elevation)  
**Date**: 2026-10-27  

---

## 1. Visi Produk & Prinsip Rekayasa (Strict Constraints)

### 1.1 Visi Utama: Dari E-Commerce Biasa ke Brand Digital Flagship
UrbanStyle bukan lagi sekadar "katalog transaksional untuk checkout baju", melainkan sebuah **Brand Flagship Store** yang menyajikan inspirasi gaya hidup (*storytelling*), kurasi busana tematik, dan sentuhan visual modern (3D & interaksi taktil).

### 1.2 Aturan Mutlak Rekayasa: NO REBUILD FROM ZERO
- **WAJIB MELANJUTKAN & MENGGUNAKAN ARSITEKTUR YANG SUDAH ADA**:
  - Dilarang membongkar ulang routing Next.js 16 App Router.
  - Dilarang merusak atau mengganti integrasi cloud database Supabase (`@supabase/supabase-js`, `@supabase/ssr`).
  - Dilarang memodifikasi logika checkout, cart drawer, auth member/admin, dan sistem reservasi kupon/stok yang sudah teruji.
- **Peningkatan Bertahap (Modular In-Place Enhancement)**:
  - Seluruh fitur baru ditambahkan sebagai modul terpisah di bawah `components/` dan ditancapkan secara bersih ke `app/page.tsx` atau `app/product/[id]/page.tsx`.
  - Disiplin Anti-Monolith: Setiap file TSX baru/modifikasi **wajib berukuran < 250 baris** (Rule 12).

---

## 2. Tiga Pilar Fitur Baru (The Flagship Elevation)

### Pilar 1: Integrasi 3D & Taktil Modern
1. **Interactive 3D Product Viewer (PDP / Detail Modal)**:
   - Pengunjung dapat beralih antara tab `[Foto Studio]` dan `[Model 3D 360°]`.
   - Menggunakan dynamic import (`next/dynamic` dengan `{ ssr: false }`) agar Core Web Vitals (LCP < 2.5s) tetap terjaga.
   - Fitur orbit 360°, zoom tekstur kain, dan opsi AR (Augmented Reality).
2. **Tactile 3D Card Tilt & Parallax Physics**:
   - Kartu produk dan banner lookbook memiliki responsivitas fisik 3D menggunakan Framer Motion 3D perspective (`rotateX`, `rotateY`, `transformStyle: "preserve-3d"`).
   - Efek kedalaman tanpa beban download file 3D berat di halaman depan.

### Pilar 2: Dedicated Gender Portals (Pria & Wanita)
Ketika `selectedGender` dipilih (bukan 'all'):
1. **Bukan Sekadar Filter Polos**: Halaman atas bertransformasi menjadi **Gender Landing Hub** khusus.
2. **Hero Editorial Tematik**:
   - Pria: *"Urban Utility & Clean Essentials"* (fokus siluet tegas, material katun Oxford, utility outerwear).
   - Wanita: *"Modern Silhouette & Soft Layering"* (fokus drape halus, knitwear, pleated skirts, linen tops).
3. **Visual Sub-Category Tiles**:
   - Navigasi sub-kategori berbentuk grid visual foto model (bukan sekadar dropdown teks).
4. **Curated Themes (Kurasi Kebutuhan Nyata)**:
   - Koleksi *"Smart Workwear"* (kantor/formal santai).
   - Koleksi *"Weekend Casual"* (santai akhir pekan).

### Pilar 3: StyleHint / "Shop The Look" (Inspirasi OOTD Nyata)
1. **Hotspot Pins Interaktif pada Foto Model**:
   - Foto model OOTD *full-body* dilengkapi pin titik sentuh pada baju, celana, atau jaket.
2. **Quick Shop Popover**:
   - Mengklik pin memunculkan kartu ringkas: nama pakaian, warna, harga tabular, dan tombol langsung *"Pilih Ukuran & Beli"* tanpa reload halaman.

---

## 3. DNA Visual & Design Tokens Uniqlo 1:1

- **Radius Nol Mutlak (`rounded-none` / 0px)**: Seluruh kontainer, kartu, tombol, modal, dan drawer wajib bersudut tajam tanpa border radius.
- **Palet Warna Resmi**:
  - Background: `#FFFFFF` & `#F6F6F6` (kanvas kartu foto 3:4).
  - Teks Utama: `#111111` (Charcoal Black, rasio kontras 16.5:1).
  - Accent/Badge: `#E60012` (Uniqlo Official Red).
  - Hairline Border: `1px solid #E5E5E5`.
- **Tipografi Angka Tabular**: Harga produk **wajib menggunakan `font-mono font-bold tabular-nums`**.

---

## 4. Rencana Kerja Implementasi Modular

| Tahap | Komponen / Berkas | Tindakan Teknis |
| :--- | :--- | :--- |
| **Tahap 1** | `components/home/GenderPortal.tsx` | Membuat modul portal landing Pria/Wanita yang aktif saat gender dipilih. |
| **Tahap 2** | `components/LookbookSlider.tsx` | Menambahkan hotspot pin interaktif "Shop The Look" pada foto model OOTD. |
| **Tahap 3** | `components/3d/ProductViewer3D.tsx` | Menyiapkan viewer 3D terisolasi dengan dynamic import untuk PDP. |
| **Tahap 4** | `app/page.tsx` | Menghubungkan `GenderPortal` secara kondisional saat `selectedGender !== 'all'`. |
| **Tahap 5** | Automated Testing | Menjalankan `npm test` & verifikasi runtime 3 lapis untuk memastikan 0 breaking change. |
