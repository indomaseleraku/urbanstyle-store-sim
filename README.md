# 🛍️ UrbanStyle Store — Sistem Informasi Manajemen (SIM) E-Commerce LifeWear

Repositori ini merupakan implementasi proyek akademik untuk mata kuliah **Sistem Informasi Manajemen (SIM)**: Platform E-Commerce Retail Modern dengan arsitektur headless berbasis Next.js 16, Tailwind CSS, TypeScript, dan Supabase PostgreSQL.

---

## 🎯 Gambaran Umum Sistem

UrbanStyle Store dirancang untuk menyimulasikan siklus operasional bisnis ritel fashion secara menyeluruh, mencakup:
* **Front-Office (Customer Facing):** Katalog produk dinamis, navigasi kategori editorial, keranjang belanja, voucher diskon, dan multi-step checkout.
* **Payment Engine:** Dukungan pembayaran multi-channel dengan QRIS Dinamis standar EMVCo (kalkulasi CRC-16 otomatis) dan Transfer Virtual/Manual dengan deteksi kode unik.
* **Order Lifecycle & Inventory Protection:** Sistem batas waktu pembayaran 20 menit (*timeout auto-cancellation*) dengan pelepasan kembali stok produk secara otomatis (*auto-restock*).
* **Back-Office (Admin Suite):** Manajemen inventaris multi-gudang, pemrosesan antrean pesanan kasir, audit log aktivitas karyawan, serta pembatasan hak akses berbasis peran (RBAC).

---

## 🏗️ Arsitektur & Teknologi

* **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Server Components & Route Handlers)
* **Bahasa:** [TypeScript](https://www.typescriptlang.org/) (Strict Type-Safety)
* **Styling & UI:** [Tailwind CSS v4](https://tailwindcss.com/) & Lucide React Icons
* **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL dengan Row Level Security - RLS)
* **Keamanan:**
  * Hashing kata sandi server-side dengan **Bcrypt (12 rounds)**.
  * In-process rate limiting (proteksi serangan brute force pada login, register, dan OTP).
  * Proteksi cookie sesi terenkripsi HMAC SHA-256 (`HttpOnly`, `SameSite=Strict`, `Secure`).

---

## 🚀 Panduan Menjalankan Proyek (Local Setup)

### 1. Prasyarat
* [Node.js](https://nodejs.org/) versi 18.18+ atau 20+
* Akun gratis di [Supabase](https://supabase.com/)

### 2. Kloning Repositori & Instalasi Dependensi
```bash
git clone https://github.com/indomaseleraku/urbanstyle-store-sim.git
cd urbanstyle-store-sim
npm install
```

### 3. Konfigurasi Environment Variable
Salin template konfigurasi:
```bash
cp .env.example .env.local
```
Buka file `.env.local` dan isi kredensial Supabase Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here
SESSION_SECRET=kunci_rahasia_hmac_acak_minimal_32_karakter
```

### 4. Setup Skema Database (Supabase)
1. Buka dashboard proyek Supabase Anda.
2. Masuk ke menu **SQL Editor**.
3. Buka file `supabase_schema.sql` pada repositori ini, salin seluruh isinya, dan klik tombol **Run**.
4. Skema tabel (`products`, `orders`, `user_credentials`, `user_addresses`, dll) beserta policy RLS akan dibuat secara otomatis.

### 5. Jalankan Server Development
```bash
npm run dev
```
Buka browser dan akses aplikasi di:
```text
http://localhost:3000
```

---

## 👥 Hak Akses & Peran Pengguna (RBAC)

Sistem Informasi Manajemen ini mengimplementasikan 4 tingkatan peran:
1. **Customer (Pelanggan):** Registrasi mandiri, belanja produk, riwayat pesanan, profil, dan klaim kupon diskon.
2. **Kasir (Store Admin):** Verifikasi pembayaran masuk, pencetakan invoice, dan konfirmasi pengiriman paket.
3. **Staf Gudang (Warehouse):** Pembaruan stok masuk/keluar, penerimaan retur barang, dan pelabelan inventaris.
4. **Owner (Superadmin):** Akses penuh dashboard analitik pendapatan, manajemen staf karyawan, dan konfigurasi master data.

Halaman login admin dapat diakses melalui rute `/admin/login`.

---

## 📄 Lisensi & Penggunaan Akademik
Proyek ini dipublikasikan untuk keperluan edukasi dan pemenuhan tugas mata kuliah **Sistem Informasi Manajemen (SIM)**. Dilarang menyalahgunakan untuk penipuan atau tujuan komersial tanpa izin.
