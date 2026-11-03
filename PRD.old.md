# 📑 Comprehensive Engineering PRD & Master Specification
**Product**: UrbanStyle LifeWear Store  
**Benchmark Reference**: Uniqlo Tokyo LifeWear Official Digital Store (Uniqlo ID / Uniqlo JP)  
**Target Repository**: `C:\project\websites\urbanstyle-store`  
**Document Authority**: Lead Technical Project Manager & Chief Architect Studio (`c:\Project manager`)  
**Status**: APPROVED & LOCKED FOR PRODUCTION IMPLEMENTATION  
**Version**: 3.0.0 (Deep Industrial-Grade Specification)  
**Date**: 2026-10-11  

---

## 1. Executive Summary, SMART OKRs & JTBD

### 1.1 Problem Statement & Background
Implementasi e-commerce busana sebelumnya mengalami degradasi kualitas khas *AI Slop*: file monolith 1.098 baris, ketiadaan fisika kinetik (*dead clicks / stiff CSS*), layout generic (sudut melengkung tebal, drop shadow abu-abu, palet sembarangan), serta ketiadaan proteksi transaksi stok riil. Dokumen ini adalah cetak biru rekayasa tingkat industri untuk mentransformasikan UrbanStyle Store menjadi platform e-commerce berfidelitas **1:1 terhadap standar resmi Uniqlo LifeWear Japan**, dengan keandalan enterprise, keamanan cloud Supabase, dan performa web optimal.

### 1.2 SMART OKRs
- **OKR 1 (Fidelitas Visual 1:1)**: 100% komponen antarmuka mematuhi Design Tokens Uniqlo LifeWear (`rounded-none`, palet `#E60012` & `#111111`, rasio foto 3:4, hairline `#E5E5E5`).
- **OKR 2 (Disiplin Arsitektur Anti-Monolith)**: 100% file komponen React/TSX berukuran di bawah 250 baris kode (Aturan 12).
- **OKR 3 (Pengalaman Pengguna Organik)**: 100% interaksi sentuh tombol, drawer, modal, dan toast menggunakan Framer Motion spring physics (Aturan 11).
- **OKR 4 (Integritas Data & Keamanan)**: Seluruh tabel persistent di cloud Supabase dengan Row Level Security (RLS) aktif dan proteksi time-bound inventory locking.
- **OKR 5 (Verifikasi Tanpa Cacat)**: Build bebas error (`npm run build`) dan automated test suite 100% PASS sebelum rilis.

### 1.3 Jobs-to-Be-Done (JTBD)
> "Ketika konsumen urban mencari pakaian harian fungsional, mereka ingin menelusuri katalog minimalis yang bersih, memilih warna dan ukuran dengan visual instan tanpa reload, mendapatkan rekomendasi ukuran tubuh yang akurat, serta menyelesaikan checkout dalam 60 detik tanpa kegagalan transaksi stok."

---

## 2. DNA Visual & Design Tokens Uniqlo 1:1

### 2.1 Geometri & Radius Nol Mutlak (Zero-Radius Discipline)
Uniqlo menerapkan estetika grid arsitektur Jepang yang tegas, modular, dan bersih:
- **Wajib 0px (`rounded-none`)** pada seluruh kartu produk, bingkai foto, tombol CTA, badge promosi, input teks, modal, drawer, dan pill navigasi.
- **DILARANG KERAS**: `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, atau `rounded-full` pada kontainer struktural.
- **Pengecualian Mutlak**: Hanya lingkaran swatch warna (diameter 12px–14px, `rounded-full`) dan rating bintang.

### 2.2 Palet Warna Baku & Kontras Rasio (WCAG AAA)
| Token Semantik | Kode HEX | Nilai RGB | Rasio Kontras | Peruntukan Khusus |
| :--- | :--- | :--- | :--- | :--- |
| `--color-canvas` | `#FFFFFF` | rgb(255, 255, 255) | Basis | Kanvas latar utama seluruh halaman |
| `--color-backdrop-card`| `#F6F6F6` | rgb(246, 246, 246) | Netral | Latar belakang bingkai foto produk 3:4 |
| `--color-charcoal-text`| `#111111` | rgb(17, 17, 17) | 16.5:1 (AAA)| Teks headline, nama produk, teks harga normal |
| `--color-muted-text` | `#757575` | rgb(117, 117, 117) | 4.8:1 (AA) | Kategori mikro, breadcrumbs, harga coret diskon |
| `--color-uniqlo-red` | `#E60012` | rgb(230, 0, 18) | 4.6:1 (AA) | Kotak logo brand, badge `LIMITED OFFER`, harga diskon, active indicator |
| `--color-hairline-border`| `#E5E5E5`| rgb(229, 229, 229) | 1px Solid | Garis pembatas seksi, pembatas grid, separator kartu |

### 2.3 Tipografi & Format Angka Monospaced Tabular
- **Display Headlines**: `font-black uppercase tracking-[-0.02em] text-[#111111]`
- **Sub-Headlines & Section Title**: `font-bold uppercase tracking-[-0.015em] text-[#111111]`
- **Micro-Labels & Kategori**: `text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] text-[#757575]`
- **Body & Product Title**: `text-xs sm:text-sm font-medium text-[#111111] line-clamp-2 leading-snug`
- **Harga Produk**: **WAJIB MENGGUNAKAN `font-mono font-bold tabular-nums`** agar digit angka memiliki lebar identik dan tidak menyebabkan pergeseran tata letak saat filter berubah:
  - Diskon: `<span className="text-[#E60012] font-mono font-bold text-sm sm:text-base tabular-nums">Rp {price.toLocaleString('id-ID')}</span>`
  - Coret: `<span className="text-[#757575] font-mono text-xs line-through tabular-nums">Rp {original_price.toLocaleString('id-ID')}</span>`

### 2.4 CSS Tokens Root (`app/globals.css`)
```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #111111;
  --uniqlo-red: #E60012;
  --uniqlo-dark: #111111;
  --uniqlo-gray: #757575;
  --uniqlo-bg-light: #F6F6F6;
  --uniqlo-border: #E5E5E5;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-uniqlo-red: var(--uniqlo-red);
  --color-uniqlo-dark: var(--uniqlo-dark);
  --color-uniqlo-gray: var(--uniqlo-gray);
  --color-uniqlo-bg: var(--uniqlo-bg-light);
  --color-uniqlo-border: var(--uniqlo-border);
}

body {
  background: #ffffff;
  color: #111111;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  letter-spacing: -0.011em;
  -webkit-font-smoothing: antialiased;
}

.tabular-nums {
  font-variant-numeric: tabular-nums;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.animate-shimmer {
  background: linear-gradient(90deg, #f4f4f4 25%, #ebebeb 37%, #f4f4f4 63%);
  background-size: 400% 100%;
  animation: shimmer 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
```

---

## 3. Pohon Komponen Arsitektur & Aturan Anti-Monolith (< 250 Baris)

### 3.1 Peta Dekonstruksi Komponen
File `app/page.tsx` didekonstruksi menjadi hirarki komponen bersih:

```
app/page.tsx (< 180 baris - Orchestrator Bersih)
│
├── components/Navbar.tsx (< 240 baris)
│   ├── components/navbar/AnnouncementTicker.tsx (< 80 baris)
│   ├── components/navbar/CategoryPillBar.tsx (< 90 baris)
│   ├── components/navbar/UserAccountMenu.tsx (< 120 baris)
│   └── components/navbar/SideNavDrawer.tsx (< 200 baris)
│
├── components/LookbookSlider.tsx (< 160 baris - Hero Full-Bleed Banner)
├── components/CategoryBubbles.tsx (< 160 baris - Story Tiles Kategori)
│
├── components/home/
│   ├── CatalogHeader.tsx (< 60 baris - Breadcrumbs & Headline)
│   ├── FilterSortBar.tsx (< 150 baris - Toolbar Filter & Active Chips)
│   ├── ProductGrid.tsx (< 140 baris - 1:1 Shimmer Skeleton & Grid)
│   ├── FloatingCartToast.tsx (< 90 baris - Slide-up Toast)
│   ├── MobileBottomNav.tsx (< 115 baris - 5-Tab Sticky Thumb Zone)
│   ├── MobileCategorySheet.tsx (< 180 baris - Spring Physics Sheet)
│   └── EditorialSections.tsx (< 190 baris - Limited Offer, Best, StyleHint)
│
├── components/ProductCard.tsx (< 210 baris - LifeWear 3:4 Card)
├── components/ProductDetailModal.tsx (< 240 baris - PDP Quick View)
├── components/CartDrawer.tsx (< 240 baris - Slide-over Bag + Reservation Timer)
├── components/WishlistDrawer.tsx (< 200 baris - Slide-over Wishlist)
├── components/CheckoutModal.tsx (< 250 baris - TPS + QRIS EMVCo Checkout)
└── components/Footer.tsx (< 250 baris - 4-Column Structured Footer)
```

---

## 4. Spesifikasi Rinci Antarmuka per Komponen

### 4.1 Navbar & Dual-Box Logo Uniqlo
- **Struktur Logo**: Dua kotak merah `#E60012` berukuran 34px × 34px berdampingan tanpa radius:
  - Kotak 1: Alfabet Latin `US` (putih, bold sans, text-xs).
  - Kotak 2: Katakana Jepang `アーバン` (putih, bold japanese gothic, text-[9px]).
  - Label teks samping: `UrbanStyle` (teks utama) dan `LifeWear Tokyo` (micro-sub, tracking 0.25em).
- **Tab Departemen**: WANITA | PRIA | ANAK & BAYI | LIMITED OFFER 🔥
  - State Aktif: Garis bawah 2px solid warna merah `#E60012` atau hitam `#111111` yang menempel rapat di tepi bawah navbar.
  - State Hover: Teks berubah `#E60012` dengan transisi 150ms.
- **Aksi Cepat**: Search bar input, icon Wishlist (dengan badge counter merah), dan icon Tas Belanja (dengan badge counter merah).

### 4.2 Anatomi Kartu Produk 3:4 LifeWear (`components/ProductCard.tsx`)
- **Rasio Aspek Bingkai Foto**: `aspect-[3/4]` vertikal wajib, `overflow-hidden`, latar `#F6F6F6`, `rounded-none`.
- **Zoom Foto Halus**: `group-hover:scale-[1.03] transition-transform duration-500 ease-out`.
- **Badge Promosi**:
  - `hasDiscount`: Badge merah `#E60012`, teks putih, `text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-none`, label `LIMITED OFFER`.
  - `is_new`: Badge hitam `#111111`, teks putih, label `NEW`.
- **Tombol Wishlist (Heart)**:
  - Posisi: Pojok kanan atas foto (`top-2 right-2`).
  - Animasi: `whileTap={{ scale: 0.85 }}` dan `whileHover={{ scale: 1.1 }}` spring physics (`stiffness: 400, damping: 17`).
  - Warna: Icon Heart outline tipis, saat aktif terisi warna `#E60012`.
- **Tombol Quick View**:
  - Posisi: Menempel di bagian bawah foto (`bottom-0 inset-x-0`).
  - Tampilan: Semi-transparan hitam `bg-black/75 hover:bg-black/90 text-white text-[10px] font-bold uppercase tracking-wider py-2.5`.
  - Efek: `opacity-0 group-hover:opacity-100 transition-opacity duration-300`.
- **Swatches Warna**:
  - Lingkaran warna mini diameter 12px (mobile) hingga 14px (desktop).
  - State Terpilih: `ring-1 ring-zinc-950 ring-offset-1 scale-105 border-zinc-400`.
  - State Tidak Terpilih: `border-zinc-300 opacity-80 hover:opacity-100`.
  - Teks pembantu: `font-mono text-[10px] text-zinc-400` menampilkan jumlah warna (misal: "3 Warna").
- **Kategori Mikro**: `text-zinc-500 text-[11px] font-medium uppercase tracking-wider truncate` (contoh: `PRIA • Kemeja & Flannel`).
- **Judul Produk**: `font-medium text-xs sm:text-sm text-zinc-950 line-clamp-2 leading-snug group-hover:text-[#E60012] transition-colors`.
- **Blok Harga Tabular**:
  - Harga diskon: `text-[#E60012] font-mono font-bold text-sm sm:text-base tabular-nums`.
  - Harga asli: `text-zinc-400 line-through text-xs font-mono tabular-nums`.
- **Rating Bintang**: Star icon amber 10px + angka rating `★ 4.8` + ulasan `(24)` monospaced.

### 4.3 1:1 Shimmer Skeleton Loader (`components/home/ProductGrid.tsx`)
- Mengeliminasi spinner berputar abu-abu polos.
- Grid skeleton menampilkan 8 kartu shimmer yang proporsinya 1:1 dengan layout kartu produk asli:
  - Kotak foto shimmer `aspect-[3/4]`.
  - Baris 3 lingkaran swatch shimmer.
  - Garis teks kategori shimmer (tinggi 10px, lebar 35%).
  - Garis judul produk shimmer (tinggi 14px, lebar 80%).
  - Garis harga shimmer (tinggi 16px, lebar 50%).

### 4.4 Toolbar Filter & Sorting (`components/home/FilterSortBar.tsx`)
- **Telemetry Counter**: `Menampilkan X dari Y Produk LifeWear`.
- **Toggle Ready Stock**: Checkbox kotak tajam (`rounded-none text-[#E60012] focus:ring-0`).
- **Dropdown Sorting**: Desain kotak tajam berborder `border-zinc-300 bg-white px-3 py-2 text-xs font-bold uppercase`.
- **Filter Badges Strip**:
  - Dibungkus `<AnimatePresence>` agar muncul dan menghilang dengan animasi halus.
  - Setiap filter aktif (Gender, Kategori, In-Stock, Search) memiliki chip putih berborder dengan tombol silang (X) yang dapat dihapus individual.
  - Tombol "Reset Semua Filter ✕" di sebelah kanan.

### 4.5 Mobile Bottom Navigation 5-Tab (`components/home/MobileBottomNav.tsx`)
- Menempel di bagian bawah layar ponsel (`fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 md:hidden`).
- 5 Tab Ergonomis:
  1. **Beranda**: Icon Home, reset filter, scroll ke atas.
  2. **Kategori**: Icon SlidersHorizontal, membuka mobile category drawer.
  3. **Favorit**: Icon Heart, badge angka merah jumlah item tersimpan.
  4. **Tas**: Icon ShoppingBag, badge angka merah total item keranjang.
  5. **Akun**: Icon User, membuka modal login / halaman profil.

### 4.6 Floating Cart Toast Taktil (`components/home/FloatingCartToast.tsx`)
- Muncul di pojok kanan bawah dengan inersia pegas Framer Motion (`damping: 25, stiffness: 350`).
- Kotak putih dengan border tebal 2px hitam (`border-zinc-950`).
- Badge centang merah `✓`, nama produk, varian warna, ukuran terpilih.
- Aksi ganda: Tombol "Lanjut Belanja" dan "Lihat Tas →".

---

## 5. Arsitektur Database Cloud Supabase & Keamanan

### 5.1 Skema Relasional PostgreSQL (`blueprints/urbanstyle-store/08_DATABASE.sql`)
```sql
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    tagline VARCHAR(255),
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(60) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    gender VARCHAR(20) CHECK (gender IN ('pria', 'wanita', 'unisex', 'anak')) DEFAULT 'unisex',
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    original_price NUMERIC(12, 2) CHECK (original_price >= price),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    is_sale BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    rating NUMERIC(3, 2) DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
    reviews_count INTEGER DEFAULT 0 CHECK (reviews_count >= 0),
    description TEXT,
    material_spec TEXT,
    sizes TEXT[] DEFAULT ARRAY['S', 'M', 'L', 'XL'],
    image_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Product Colors / Swatches
CREATE TABLE IF NOT EXISTS public.product_colors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    color_name VARCHAR(50) NOT NULL,
    color_code VARCHAR(50),
    hex_code VARCHAR(10) NOT NULL,
    swatch_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Cart Stock Reservation (Time-Bound Inventory Lock 10 Menit)
CREATE TABLE IF NOT EXISTS public.cart_reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(100) NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    selected_size VARCHAR(20) NOT NULL,
    selected_color VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Orders Table (TPS Transaction Engine)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
    customer_address TEXT NOT NULL,
    shipping_courier VARCHAR(60) NOT NULL,
    shipping_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(30) CHECK (payment_method IN ('QRIS', 'Bank Transfer', 'COD')),
    payment_status VARCHAR(30) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'EXPIRED', 'CANCELLED')),
    idempotency_key VARCHAR(100) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update Trigger for Timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Indexes for Fast Search and Filter
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_gender ON public.products(gender);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_stock ON public.products(stock);
CREATE INDEX IF NOT EXISTS idx_reservations_expiry ON public.cart_reservations(expires_at);
```

### 5.2 Row Level Security (RLS) Policies
```sql
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Public Read for Catalog
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public Read Colors" ON public.product_colors FOR SELECT USING (true);

-- Cart Reservations: Session-scoped
CREATE POLICY "Session Reservations" ON public.cart_reservations FOR ALL USING (true);

-- Orders: Customer can create orders
CREATE POLICY "Public Insert Orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Own Order" ON public.orders FOR SELECT USING (true);
```

---

## 6. Logika Bisnis & Integritas Transaksi

### 6.1 Time-Bound Stock Reservation (Lock 10 Menit)
- Ketika pengguna menekan tombol "Checkout", item di dalam tas dikunci sementara ke tabel `cart_reservations` dengan masa kedaluwarsa `NOW() + INTERVAL '10 minutes'`.
- Stok efektif yang dapat dibeli oleh konsumen lain adalah:  
  $$\text{Stok Tersedia} = \text{Stok Fisik} - \sum \text{Kuantitas Terkunci (Aktif)}$$
- Jika pengguna tidak menyelesaikan pembayaran dalam 10 menit, reservasi kedaluwarsa secara otomatis dan stok kembali ke katalog publik tanpa mengunci inventaris permanen.

### 6.2 Idempotency Key pada Pembuatan Pesanan
- Setiap payload checkout menyertakan `idempotency_key` (UUID unik yang dibangkitkan di sisi klien).
- Jika terjadi klik ganda (*double-click*) atau koneksi internet pengguna terputus saat request sedang berjalan, database menolak transaksi ganda dan mengembalikan pesanan yang sudah berhasil dibuat.

---

## 7. Keamanan & Hardening Sistem (OWASP 2026 Standards)

1. **Sanitasi Input & Adversarial Defense**:
   - Seluruh input teks (nama pemesan, alamat, nomor telepon, query pencarian) wajib disanitasi dari tag HTML (`<script>`, `<iframe`), cashtag, dan simbol tak lazim untuk mencegah *Cross-Site Scripting (XSS)*.
2. **Koneksi Jaringan & Zero Socket Exhaustion**:
   - Seluruh panggilan API eksternal dan Supabase wajib menetapkan timeout eksplisit (maksimal 8.000 ms) dengan graceful fallback lokal jika koneksi terputus.
3. **Windows Encoding CP1252 Hardening**:
   - Seluruh proses CLI dan output terminal Node.js/Python wajib berjalan dengan encoding UTF-8 untuk mencegah crash Unicode/emoji pada Windows.

---

## 8. Matriks Kriteria Penerimaan & Verifikasi Uji 3 Lapis

| Lapis Pengujian | Parameter yang Diuji | Kriteria Lulus (100% Pass) |
| :--- | :--- | :--- |
| **Lapis 1: Happy Path** | Alur belanja normal: browse, filter gender/kategori, buka detail modal, tambah ke keranjang, proses checkout QRIS. | Pesanan terbit, nomor resi/order terbuat, stok berkurang sesuai kuantitas. |
| **Lapis 2: Adversarial & Edge** | Input pencarian kosong (`""`), spasi (`"   "`), simbol (`$#@!`), produk stok 0, kuantitas melebihi stok. | Tidak ada crash runtime, pesan error ramah pengguna muncul, stok tidak pernah bernilai negatif. |
| **Lapis 3: Arsitektur & Lingkungan** | Batas ukuran file TSX (< 250 baris), static build (`npm run build`), dan automated test suite (`tests/test_store_verification.ts`). | Seluruh file di bawah 250 baris, zero TypeScript linter error, automated test lulus **100% OK**. |
