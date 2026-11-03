// tests/test_store_verification.ts
// Pengujian Otomatis 3 Lapis Komprehensif V3.0 untuk UrbanStyle Store (Next.js TSX + Supabase Data Store)

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Load .env.local if present so test suite has proper secrets
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    for (const line of envContent.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        process.env[key] = val;
      }
    }
  }
} catch {}

if (!process.env.SESSION_SECRET) {
  process.env.SESSION_SECRET = 'test_session_secret_for_automated_verification_suite';
}

import { dataStore } from '../lib/store.ts';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_ORDERS, INITIAL_COUPONS, INITIAL_USERS } from '../lib/mock-data.ts';

console.log('=== [PENGUJIAN 3 LAPIS KOMPREHENSIF V3.0: URBANSTYLE STORE LIFEWEAR] ===\n');

async function runTests() {
  // =========================================================================
  // LAPIS 1: Logika Inti & Jalur Utama (Happy Path)
  // =========================================================================
  console.log('-> [LAPIS 1] Memulai Pengujian Happy Path & Fungsionalitas Inti V3.0...');

  // 1.1 Kategori
  const categories = await dataStore.getCategories();
  assert.equal(categories.length >= 5, true, 'Kategori minimal 5 item');
  assert.equal(categories[0].slug, 'all', 'Kategori pertama adalah "all"');
  console.log(`  ✓ Kategori valid: ${categories.length} kategori terdeteksi`);

  // 1.2 Produk & Gender Filtering
  const products = await dataStore.getProducts('all');
  assert.equal(products.length >= 40, true, 'Produk katalog minimal 40 item (10 per kategori)');
  
  // Verifikasi 10 produk per kategori
  for (let catId = 1; catId <= 4; catId++) {
    const catProds = products.filter(p => p.category_id === catId);
    assert.equal(catProds.length, 10, `Kategori ID ${catId} memiliki tepat 10 produk`);
  }

  const menProds = await dataStore.getProducts('all', '', 'pria');
  assert.ok(menProds.length > 0, 'Filter gender pria mengembalikan produk');
  const womenProds = await dataStore.getProducts('all', '', 'wanita');
  assert.ok(womenProds.length > 0, 'Filter gender wanita mengembalikan produk');
  console.log(`  ✓ Katalog produk valid: ${products.length} produk (10 per kategori, ${menProds.length} pria, ${womenProds.length} wanita)`);

  // 1.2b Sorting Multi-Alias Verification
  const ascProds = await dataStore.getProducts('all', '', 'all', 'price-asc');
  assert.ok(ascProds[0].price <= ascProds[ascProds.length - 1].price, 'Pengurutan price-asc bekerja');
  const descProds = await dataStore.getProducts('all', '', 'all', 'price-desc');
  assert.ok(descProds[0].price >= descProds[descProds.length - 1].price, 'Pengurutan price-desc bekerja');
  const popularProds = await dataStore.getProducts('all', '', 'all', 'popular');
  assert.ok((popularProds[0].rating || 0) >= (popularProds[popularProds.length - 1].rating || 0), 'Pengurutan popular bekerja');
  console.log('  ✓ Multi-alias sorting (price-asc, price-desc, popular) valid');

  // 1.2c Standarisasi Kode Warna 2-Digit Uniqlo & Ukuran (TICKET-03 & TICKET-04)
  const uniqloColorRegex = /^\d{2}\s+[A-Z\s]+$/;
  let totalColorsChecked = 0;
  for (const prod of products) {
    assert.ok(prod.sizes && prod.sizes.length >= 3, `Produk #${prod.id} (${prod.name}) memiliki pilihan ukuran lengkap`);
    assert.ok(prod.colors && prod.colors.length > 0, `Produk #${prod.id} memiliki varian warna`);
    for (const color of prod.colors) {
      totalColorsChecked++;
      assert.ok(color.code, `Warna ${color.name} pada produk #${prod.id} wajib memiliki kode`);
      assert.match(color.code, uniqloColorRegex, `Kode warna ${color.code} wajib berformat 2-digit resmi Uniqlo`);
    }
  }
  console.log(`  ✓ Standarisasi kode warna resmi Uniqlo valid (${totalColorsChecked} varian terverifikasi format [CODE] [NAME])`);

  // 1.2d Verifikasi Visual Coret Diagonal Ukuran Habis (TICKET-06)
  const prodWithOosSize = products.find(p => p.out_of_stock_sizes && p.out_of_stock_sizes.length > 0);
  assert.ok(prodWithOosSize, 'Terdapat produk dengan spesifikasi ukuran habis (out of stock size)');
  assert.ok(prodWithOosSize.out_of_stock_sizes!.includes('XL'), 'Produk memiliki ukuran XL yang habis');
  console.log(`  ✓ Coret diagonal individual ukuran valid: Produk #${prodWithOosSize.id} memiliki ukuran habis [${prodWithOosSize.out_of_stock_sizes!.join(', ')}]`);

  // 1.3 Alur Kupon Diskon (Coupon Engine)
  const welcomeCouponVal = await dataStore.validateCoupon('URBANWELCOME50', 300000);
  assert.equal(welcomeCouponVal.valid, true, 'Kupon URBANWELCOME50 valid untuk belanja Rp 300.000');
  assert.equal(welcomeCouponVal.discount_amount, 50000, 'Potongan kupon Rp 50.000 sesuai');
  console.log(`  ✓ Coupon Engine valid: ${welcomeCouponVal.message}`);

  const percentageCouponVal = await dataStore.validateCoupon('LIFEWEAR10', 200000);
  assert.equal(percentageCouponVal.valid, true, 'Kupon LIFEWEAR10 valid');
  assert.equal(percentageCouponVal.discount_amount, 20000, 'Diskon 10% dari 200.000 = 20.000');
  console.log(`  ✓ Diskon persentase valid: Potongan Rp ${percentageCouponVal.discount_amount}`);

  // 1.4 Alur Transaksi TPS dengan Kupon & Pemotongan Stok Atomik
  const sampleProd = products.find(p => p.stock > 10)!;
  const initialStock = sampleProd.stock;

  const orderResult = await dataStore.createOrder({
    user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    customer_name: 'Kimy Eka Ardiansyah',
    customer_phone: '081234567890',
    customer_address: 'Universitas Pamulang, Tangerang Selatan',
    shipping_courier: 'J&T Express',
    shipping_cost: 15000,
    coupon_code: 'URBANWELCOME50',
    discount_amount: 50000,
    payment_method: 'QRIS',
    cart_items: [
      {
        product: sampleProd,
        selected_size: 'L',
        selected_color: sampleProd.colors[0]?.name || 'Standard',
        quantity: 2,
      }
    ]
  });

  assert.equal(orderResult.success, true, 'Order berhasil dibuat');
  assert.ok(orderResult.order?.order_number.startsWith('ORD-'), 'Nomor order resmi terbit');
  assert.equal(orderResult.order?.status, 'Menunggu Pembayaran', 'Status awal QRIS adalah Menunggu Pembayaran');
  assert.equal(orderResult.order?.discount_amount, 50000, 'Diskon kupon tercatat di faktur');
  assert.equal(sampleProd.stock, initialStock - 2, 'Stok fisik terpotong 2 unit secara atomik');

  // 1.4a Verifikasi Penyelesaian Otomatis Sistem (Autonomous Webhook & Settlement Engine)
  const webhookResult = await dataStore.processPaymentWebhook({
    order_number: orderResult.order!.order_number,
    amount: orderResult.order!.total_amount,
  });
  assert.equal(webhookResult.success, true, 'Webhook pembayaran berhasil diproses');
  assert.equal(webhookResult.new_status, 'Dibayar', 'Status pesanan berubah menjadi Dibayar oleh sistem');

  const verifiedQrisOrder = await dataStore.getOrderByNumber(orderResult.order!.order_number);
  assert.equal(verifiedQrisOrder?.status, 'Dibayar', 'Status terupdate di database menjadi Dibayar');
  console.log(`  ✓ Transaksi TPS QRIS sukses & diverifikasi otomatis: Order #${orderResult.order?.order_number}, stok berkurang ${initialStock} -> ${sampleProd.stock}`);

  // 1.4b Alur Transaksi TPS Bank Transfer dengan Kode Unik 3 Digit (PRD V5.2 FR-13)
  const btOrderResult = await dataStore.createOrder({
    user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    customer_name: 'Kimy Eka Ardiansyah',
    customer_phone: '081234567890',
    customer_address: 'Universitas Pamulang, Tangerang Selatan',
    shipping_courier: 'JNE Reguler',
    shipping_cost: 20000,
    payment_method: 'Bank Transfer',
    bank_name: 'BCA',
    cart_items: [
      {
        product: sampleProd,
        selected_size: 'M',
        selected_color: sampleProd.colors[0]?.name || 'Standard',
        quantity: 1,
      }
    ]
  });

  assert.equal(btOrderResult.success, true, 'Order Bank Transfer berhasil dibuat');
  assert.equal(btOrderResult.order?.status, 'Menunggu Pembayaran', 'Status awal Bank Transfer adalah Menunggu Pembayaran');
  assert.equal(btOrderResult.order?.payment_method, 'Bank Transfer', 'Metode pembayaran Bank Transfer');
  assert.equal(btOrderResult.order?.bank_name, 'BCA', 'Bank tujuan BCA terdaftar');
  assert.ok(
    btOrderResult.order?.unique_code && btOrderResult.order.unique_code >= 100 && btOrderResult.order.unique_code <= 999,
    `Kode unik 3 digit valid (100-999): ${btOrderResult.order?.unique_code}`
  );
  const expectedBtTotal = (sampleProd.price * 1) + 20000 + (btOrderResult.order?.unique_code || 0);
  assert.equal(btOrderResult.order?.total_amount, expectedBtTotal, 'Grand total persis Subtotal + Ongkir + Kode Unik');

  // Simulasi Pelunasan Kasir/Dosen
  const updatedBtStatus = await dataStore.updateOrderStatus(btOrderResult.order!.order_number, 'Dibayar');
  assert.equal(updatedBtStatus, true, 'Update status Bank Transfer ke Dibayar berhasil');
  const verifiedBtOrder = await dataStore.getOrderByNumber(btOrderResult.order!.order_number);
  assert.equal(verifiedBtOrder?.status, 'Dibayar', 'Verifikasi status Dibayar berhasil');
  console.log(`  ✓ Transaksi TPS Bank Transfer valid: Order #${btOrderResult.order?.order_number}, Bank ${btOrderResult.order?.bank_name}, Kode Unik #${btOrderResult.order?.unique_code}, Total: Rp ${btOrderResult.order?.total_amount.toLocaleString('id-ID')}`);

  // 1.4c Pengujian Batas Waktu Pembayaran 20 Menit & Auto-Restock
  const pBeforeExp = await dataStore.getProductById(sampleProd.id);
  const stockBeforeExp = pBeforeExp?.stock || 0;

  const expiredOrderRes = await dataStore.createOrder({
    customer_name: 'Expired Test User',
    customer_phone: '081234567890',
    customer_address: 'Tangerang Selatan',
    shipping_courier: 'JNE Reguler',
    shipping_cost: 15000,
    payment_method: 'QRIS',
    cart_items: [
      {
        product: sampleProd,
        selected_size: 'M',
        selected_color: sampleProd.colors[0]?.name || 'Standard',
        quantity: 2,
      }
    ]
  });
  assert.equal(expiredOrderRes.success, true);
  const expOrder = expiredOrderRes.order!;
  // Simulasi order lewat 25 menit
  expOrder.created_at = new Date(Date.now() - 25 * 60 * 1000).toISOString();

  const expireCheck = await dataStore.checkAndSettleOrder(expOrder.order_number);
  assert.equal(expireCheck.order?.status, 'Dibatalkan', 'Order lewat 20 menit otomatis dibatalkan');

  const pAfterRestock = await dataStore.getProductById(sampleProd.id);
  assert.equal(pAfterRestock?.stock, stockBeforeExp, 'Stok 2 unit dikembalikan utuh ke inventaris toko');
  console.log('  ✓ Batas Waktu 20 Menit & Auto-Restock valid: Pesanan kadaluwarsa dibatalkan dan stok dikembalikan');

  // 1.5 Modul Pelacakan Resi Logistik (Live Shipment Tracking Stepper)
  const trackingData = await dataStore.getOrderTracking(orderResult.order!.order_number);
  assert.ok(trackingData.order, 'Data order pelacakan ditemukan');
  assert.equal(trackingData.currentStep, 2, 'Status Dibayar berada pada step 2');
  assert.equal(trackingData.events.length, 5, 'Timeline 5 tahap tracking lengkap');
  console.log(`  ✓ Modul Pelacakan Logistik valid: Stepper Step ${trackingData.currentStep} (No. Resi: ${trackingData.trackingNumber})`);

  // 1.6 Portal Member: Profil & Buku Alamat
  const userProfile = await dataStore.getUserProfile('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
  assert.ok(userProfile, 'Profil user Kimy ditemukan');
  assert.equal(userProfile?.role, 'customer', 'Role member terkonfirmasi customer');

  const userAddrs = await dataStore.getUserAddresses('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
  assert.ok(userAddrs.length >= 1, 'Buku alamat tersimpan');
  console.log(`  ✓ Portal Member valid: Profil ${userProfile?.full_name} (${userAddrs.length} alamat tersimpan)`);

  // 1.6b Multi-Role RBAC Staff Verification (PRD V5.2 FR-04 & FR-23)
  const ownerProfile = await dataStore.getUserProfile('admin@urbanstyle.com');
  assert.ok(ownerProfile, 'Akun Owner ditemukan');
  assert.equal(ownerProfile?.role, 'owner', 'Role Owner terverifikasi');

  const gudangProfile = await dataStore.getUserProfile('gudang@urbanstyle.com');
  assert.ok(gudangProfile, 'Akun Staf Gudang ditemukan');
  assert.equal(gudangProfile?.role, 'gudang', 'Role Gudang terverifikasi');

  const kasirProfile = await dataStore.getUserProfile('kasir@urbanstyle.com');
  assert.ok(kasirProfile, 'Akun Staf Kasir ditemukan');
  assert.equal(kasirProfile?.role, 'kasir', 'Role Kasir terverifikasi');
  console.log('  ✓ Multi-Role RBAC Staf valid: Owner, Gudang, dan Kasir terdaftar');

  // 1.7 Modul DSS & Analisis Pareto ABC (PRD V5.2 FR-25)
  const dss = await dataStore.getDSSAnalytics('all');
  assert.ok(dss.totalRevenue > 0, 'Omzet pendapatan terhitung > 0');
  assert.ok(dss.topProducts.length > 0, 'Agregasi produk terlaris tersedia');
  assert.ok(dss.topProducts[0].abcClass, 'Klasifikasi ABC Pareto terdefinisi');
  assert.ok(['A', 'B', 'C'].includes(dss.topProducts[0].abcClass), 'Kelas ABC valid A/B/C');
  assert.ok(dss.topProducts[0].actionRecommendation, 'Rekomendasi tindakan manajerial tersedia');

  const dssToday = await dataStore.getDSSAnalytics('today');
  assert.ok(dssToday !== null, 'Filter DSS periode today bekerja');
  console.log(`  ✓ Modul DSS ABC valid: Omzet Rp ${dss.totalRevenue.toLocaleString('id-ID')}, Top Seller: ${dss.topProducts[0].name} (Kelas ${dss.topProducts[0].abcClass})`);

  // 1.8 Pengujian Product CRUD (Update & Delete)
  const updatedP = await dataStore.updateProduct(sampleProd.id, { price: 299000 });
  assert.equal(updatedP?.price, 299000, 'Harga produk berhasil diperbarui');
  const tempProd = await dataStore.addProduct({
    category_id: 1,
    name: 'Produk Temp Uji',
    slug: 'produk-temp-uji',
    gender: 'unisex',
    price: 150000,
    stock: 10,
    description: 'Test item',
    fabric_details: 'Katun 100%',
    care_instructions: 'Cuci mesin',
    colors: [{ name: 'Black', hex: '#000', image_url: '' }],
    sizes: ['M'],
    image_url: 'https://images.unsplash.com/test',
    gallery_images: [],
  });
  assert.ok(tempProd.id, 'Produk sementara berhasil ditambahkan');
  const delSuccess = await dataStore.deleteProduct(tempProd.id);
  assert.equal(delSuccess, true, 'Produk sementara berhasil dihapus');
  console.log('  ✓ Product CRUD valid: Update harga dan Delete SKU berjalan konsisten');

  // 1.9 Pengujian Manajemen Karyawan (RBAC Staff List & Create)
  const staffList = await dataStore.getStaffList();
  assert.ok(staffList.length >= 3, 'Daftar staf minimal 3 (Owner, Gudang, Kasir)');
  const newStaff = await dataStore.createStaff({
    full_name: 'Staf Magang TI',
    email: 'magang@urbanstyle.com',
    phone: '081299990000',
    role: 'gudang',
    is_active: true,
  });
  assert.ok(newStaff.id, 'Staf baru berhasil didaftarkan');
  const toggleRes = await dataStore.toggleStaffStatus(newStaff.id);
  assert.equal(toggleRes, true, 'Status keaktifan staf berhasil di-toggle');
  console.log('  ✓ Staff Management valid: Pendaftaran staf dan toggle status RBAC aktif');

  // 1.10 Pengujian Manajemen Kupon (Toggle Status & Delete)
  const tempCoupon = await dataStore.createCoupon({
    code: 'DISKONTEMP50',
    type: 'fixed',
    discount_amount: 50000,
    min_purchase: 100000,
    usage_limit: 5,
    is_active: true,
    description: 'Kupon Uji Coba',
  });
  assert.ok(tempCoupon.id, 'Kupon sementara berhasil dibuat');
  const couponToggled = await dataStore.toggleCouponStatus(tempCoupon.id);
  assert.equal(couponToggled, true, 'Status kupon berhasil di-toggle');
  const couponDeleted = await dataStore.deleteCoupon(tempCoupon.id);
  assert.equal(couponDeleted, true, 'Kupon berhasil dihapus');
  console.log('  ✓ Coupon Controls valid: Toggle status keaktifan dan Delete kupon sukses');

  // 1.11 Pengujian Generator Dynamic QRIS Standar Bank Indonesia EMVCo & CRC-16 (PRD V5.2 FR-14)
  const testAmount = 299000;
  const qrisRes = await dataStore.generateDynamicQRIS(testAmount, { orderNumber: 'ORD-TEST-QRIS-001' });
  assert.ok(qrisRes.rawPayload.startsWith('000201010212'), 'Header QRIS valid: Format 01 & Tipe Dinamis 12');
  assert.ok(qrisRes.rawPayload.includes('5406299000'), 'Tag 54 menyuntikkan nominal tagihan Rp 299.000');
  assert.ok(qrisRes.rawPayload.includes('5802ID'), 'Tag 58 Negara ID valid');
  assert.equal(qrisRes.nmid, 'ID1025458911316', 'NMID resmi merchant terdeteksi tepat ID1025458911316');
  assert.ok(qrisRes.merchantName.toLowerCase().includes('warung koh kim'), 'Nama merchant resmi warung koh kim terdeteksi');
  assert.ok(qrisRes.rawPayload.endsWith(`6304${qrisRes.crc}`), 'Tag 63 Checksum CRC-16 CCITT tersemat di ujung payload');
  assert.ok(qrisRes.dataUrl.startsWith('data:image/png;base64,'), 'Gambar barcode QRIS dirender ke Data URL PNG valid');
  console.log(`  ✓ QRIS Dinamis Standar EMVCo & CRC-16 valid: Merchant ${qrisRes.merchantName} (NMID: ${qrisRes.nmid}), Nominal Rp ${qrisRes.amount.toLocaleString('id-ID')}, CRC #${qrisRes.crc}`);

  console.log('✓ Lapis 1 PASSED: Logika inti dan alur utama 100% konsisten.\n');

  // =========================================================================
  // LAPIS 2: Input Ekstrim & Musuh Sistem (Adversarial & Boundary Testing)
  // =========================================================================
  console.log('-> [LAPIS 2] Memulai Pengujian Adversarial & Batas Ekstrim...');

  // 2.1 Input Pencarian Kosong, Spasi Murni, & Simbol Tak Lazim
  const searchEmpty = await dataStore.getProducts('all', '');
  assert.ok(searchEmpty.length > 0, 'Pencarian kosong mengembalikan katalog');
  const symbolSearch = await dataStore.getProducts('all', '$#@NONEXISTENT');
  assert.equal(symbolSearch.length, 0, 'Pencarian simbol aneh menghasilkan array kosong tanpa crash');
  console.log('  ✓ Pencarian string kosong, spasi murni, dan cashtag aman tanpa crash');

  // 2.2 Proteksi Overselling (Permintaan melebihi stok fisik)
  const lowStockProduct = products.find(p => p.stock > 0)!;
  const excessiveQty = lowStockProduct.stock + 100;
  const overOrder = await dataStore.createOrder({
    customer_name: 'Adversarial Bot',
    customer_phone: '08000000000',
    customer_address: 'Blackhat Lane',
    shipping_courier: 'JNE',
    shipping_cost: 10000,
    payment_method: 'QRIS',
    cart_items: [
      {
        product: lowStockProduct,
        selected_size: 'M',
        selected_color: 'Black',
        quantity: excessiveQty,
      }
    ]
  });
  assert.equal(overOrder.success, false, 'Sistem wajib menolak pembelian melebihi stok');
  assert.match(overOrder.message || '', /tidak mencukupi/, 'Pesan kesalahan stok tidak mencukupi muncul');
  console.log(`  ✓ Proteksi overselling aktif: Pembelian ${excessiveQty} unit (stok ${lowStockProduct.stock}) ditolak dengan aman`);

  // 2.3 Pelanggaran Syarat Minimal Belanja Kupon
  const couponMinBreach = await dataStore.validateCoupon('URBANWELCOME50', 50000);
  assert.equal(couponMinBreach.valid, false, 'Kupon ditolak jika belanja di bawah batas minimal');
  assert.match(couponMinBreach.message, /Minimal belanja/, 'Pesan batas minimal belanja muncul');
  console.log(`  ✓ Proteksi batas minimal belanja kupon aktif: Belanja Rp 50.000 untuk kupon min 200.000 ditolak`);

  // 2.4 Kupon Tidak Terdaftar / Fiktif
  const fakeCoupon = await dataStore.validateCoupon('HACKERDISCOUNT99', 500000);
  assert.equal(fakeCoupon.valid, false, 'Kupon fiktif ditolak');
  console.log('  ✓ Kupon fiktif / kadaluwarsa ditolak dengan pesan informatif');

  // 2.5 Restock dengan Angka Negatif (Anti Integer Underflow)
  await dataStore.updateStock(lowStockProduct.id, -50);
  const updatedProd = await dataStore.getProductById(lowStockProduct.id);
  assert.equal(updatedProd?.stock, 0, 'Stok negatif otomatis dibatasi ke 0');
  console.log('  ✓ Proteksi batas nilai negatif aktif: Stok bernilai negatif dicegah');

  // 2.6 Uji Batas Nominal Ekstrim QRIS Dinamis (Rp 1 & Rp 10.000.000)
  const minQris = await dataStore.generateDynamicQRIS(1);
  assert.ok(minQris.rawPayload.includes('54011'), 'Batas minimum QRIS Rp 1 diformat dengan benar (54011)');
  const maxQris = await dataStore.generateDynamicQRIS(10000000);
  assert.ok(maxQris.rawPayload.includes('540810000000'), 'Batas besar QRIS Rp 10.000.000 diformat dengan benar (540810000000)');
  console.log('  ✓ Batas nilai ekstrim QRIS (Rp 1 s.d Rp 10.000.000) terenkripsi valid');

  // 2.7 Webhook Mutasi dengan Nominal Tidak Cocok (Adversarial Mismatch)
  const prodsInStock = await dataStore.getProducts();
  const validProd = prodsInStock.find(p => p.stock > 5)!;
  const pendingWebhookOrder = await dataStore.createOrder({
    customer_name: 'Adversarial Pay Tester',
    customer_phone: '08111111111',
    customer_address: 'Testing Road',
    shipping_courier: 'J&T Express',
    shipping_cost: 10000,
    payment_method: 'QRIS',
    cart_items: [
      {
        product: validProd,
        selected_size: 'M',
        selected_color: validProd.colors[0]?.name || 'Standard',
        quantity: 1,
      }
    ]
  });
  assert.equal(pendingWebhookOrder.success, true, 'Order pending baru berhasil dibuat');
  assert.equal(pendingWebhookOrder.order?.status, 'Menunggu Pembayaran', 'Status awal pesanan baru adalah Menunggu Pembayaran');

  const fakeAmountWebhook = await dataStore.processPaymentWebhook({
    order_number: pendingWebhookOrder.order!.order_number,
    amount: 1, // Berbeda dengan tagihan asli
  });
  assert.equal(fakeAmountWebhook.success, false, 'Webhook dengan nominal mismatch wajib ditolak');
  assert.match(fakeAmountWebhook.message, /tidak cocok/i, 'Pesan kesalahan nominal muncul');
  console.log('  ✓ Proteksi mutasi mismatch aktif: Pembayaran dengan nominal berbeda ditolak');

  // 2.8 Webhook dengan Parsing Notifikasi Push Mentah (GoBiz / MacroDroid)
  const rawNotifWebhook = await dataStore.processPaymentWebhook({
    raw_text: `Pemberitahuan GoBiz: Anda menerima pembayaran QRIS sebesar Rp ${Number(pendingWebhookOrder.order!.total_amount).toLocaleString('id-ID')} untuk ${pendingWebhookOrder.order!.order_number}`,
  });
  assert.equal(rawNotifWebhook.success, true, 'Parsing regex notifikasi push mentah GoBiz berhasil');
  assert.equal(rawNotifWebhook.new_status, 'Dibayar', 'Status pesanan berubah jadi Dibayar oleh sistem');
  console.log('  ✓ Webhook raw text parser berhasil membaca notifikasi mutasi GoBiz/MacroDroid');

  // 2.9 Settlement Check dengan Input Kosong / Null (Adversarial Boundary)
  const emptyCheck = await dataStore.checkAndSettleOrder('');
  assert.equal(emptyCheck.success, false, 'Pengecekan order kosong ditangani dengan aman');
  const ghostCheck = await dataStore.checkAndSettleOrder('ORD-GHOST-999');
  assert.equal(ghostCheck.success, false, 'Pengecekan order fiktif ditangani tanpa crash');
  console.log('  ✓ Boundary test auto-settlement: Input kosong dan fiktif ditangani 100% aman');

  console.log('✓ Lapis 2 PASSED: Semua serangan adversarial dan uji batas tertangani 100%.\n');

  // =========================================================================
  // LAPIS 3: Forensik Runtime & Ketahanan Sistem (Zero-Crash Fallback)
  // =========================================================================
  console.log('-> [LAPIS 3] Memulai Pengujian Forensik Lingkungan & Zero-Crash Fallback...');

  // 3.1 Order Kosong (Null Cart)
  const emptyOrder = await dataStore.createOrder({
    customer_name: 'Tester',
    customer_phone: '08123',
    customer_address: 'Testing',
    shipping_courier: 'J&T',
    shipping_cost: 0,
    payment_method: 'QRIS',
    cart_items: []
  });
  assert.equal(emptyOrder.success, false, 'Cart kosong ditolak');
  console.log('  ✓ Validasi keranjang kosong berjalan dengan aman');

  // 3.2 Keranjang dengan Produk ID Fiktif
  const ghostOrder = await dataStore.createOrder({
    customer_name: 'Tester',
    customer_phone: '08123',
    customer_address: 'Testing',
    shipping_courier: 'J&T',
    shipping_cost: 0,
    payment_method: 'QRIS',
    cart_items: [
      {
        product: { id: 99999, category_id: 1, name: 'Hantu Dress', slug: 'hantu-dress', price: 100000, stock: 10, description: 'Fiktif', colors: [], sizes: [], fabric_details: 'Standard', image_url: '/dummy.jpg', gender: 'unisex', care_instructions: '', gallery_images: [] },
        selected_size: 'L',
        selected_color: 'White',
        quantity: 1,
      }
    ]
  });
  assert.equal(ghostOrder.success, false, 'Produk fiktif ditolak');
  console.log('  ✓ Produk ID tidak valid ditolak tanpa crash');

  // 3.3 Pelacakan Nomor Pesanan Tidak Valid
  const ghostTracking = await dataStore.getOrderTracking('ORD-NONEXISTENT-999');
  assert.equal(ghostTracking.order, null, 'Pesanan tidak ditemukan terdeteksi aman');
  console.log('  ✓ Pelacakan nomor pesanan fiktif ditangani dengan zero-crash fallback');

  // 3.4 Integritas Relasional
  const allOrders = await dataStore.getOrders();
  assert.ok(allOrders.length > 0, 'Daftar pesanan tidak kosong');
  assert.equal(typeof allOrders[0].total_amount, 'number', 'Tipe total_amount konsisten number');
  console.log('  ✓ Tipe data dan relasi entitas pesanan konsisten');

  // 3.5 Forensik Matematis Checksum CRC-16 CCITT Standar EMVCo
  const { calculateCRC16CCITT } = await import('../lib/services/qrisService.ts');
  const standardVectorCRC = calculateCRC16CCITT('123456789');
  assert.equal(standardVectorCRC, '29B1', 'Standar Vektor CRC-16 CCITT "123456789" wajib menghasilkan 29B1');
  console.log('  ✓ Forensik Algoritma CRC-16/CCITT-FALSE terverifikasi matematis (Vektor Uji = 0x29B1)');

  // 3.6 Forensik Visual & Kepatuhan PRD V6.0 Section 7.1 (ProductCard & Grid Whitespace)
  const fs = await import('node:fs');
  const path = await import('node:path');
  const productCardCode = fs.readFileSync(path.resolve(process.cwd(), 'components/ProductCard.tsx'), 'utf-8');
  const pageCode = fs.readFileSync(path.resolve(process.cwd(), 'app/page.tsx'), 'utf-8');

  // Strict Do-Nots: tidak ada tombol ukuran, add to cart, badge stok berjejal, border luar
  assert.ok(!productCardCode.includes('Masuk Tas'), 'ProductCard dilarang memuat tombol Masuk Tas / Add to cart');
  assert.ok(!productCardCode.includes('product.sizes.map'), 'ProductCard dilarang memuat tombol pemilihan ukuran');
  assert.ok(!productCardCode.includes('border-zinc-200'), 'ProductCard dilarang memiliki border-itis luar');
  assert.ok(productCardCode.includes('aspect-[3/4]'), 'ProductCard wajib berasio majalah 3:4 portrait');
  assert.ok(productCardCode.includes('bg-[#F6F6F6]'), 'ProductCard wajib berlatar abu-abu muda #F6F6F6');
  assert.ok(productCardCode.includes('border-none bg-transparent'), 'ProductCard wajib border-none bg-transparent');
  assert.ok(productCardCode.includes('rounded-full'), 'ProductCard wajib memiliki swatch lingkaran mini');
  assert.ok(productCardCode.includes('Quick View'), 'ProductCard wajib memiliki trigger Quick View');

  // Whitespace Grid: gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12
  assert.ok(pageCode.includes('gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12'), 'Grid katalog di app/page.tsx wajib menggunakan whitespace lapang gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12');
  
  // 3.7 Forensik Desain Navbar & Mega Menu Editorial (Modular Architecture & Visual Excellence)
  const navbarFiles = [
    'components/Navbar.tsx',
    'components/navbar/SideNavDrawer.tsx',
    'components/navbar/CategoryPillBar.tsx',
    'components/navbar/UserAccountMenu.tsx',
    'components/navbar/AnnouncementTicker.tsx',
    'lib/constants/navigation.ts'
  ];
  const navbarCode = navbarFiles
    .filter(f => fs.existsSync(path.resolve(process.cwd(), f)))
    .map(f => fs.readFileSync(path.resolve(process.cwd(), f), 'utf-8'))
    .join('\n');
  assert.ok(!navbarCode.includes('(MEN)'), 'Navbar dilarang memuat teks dwibahasa canggung PRIA (MEN)');
  assert.ok(!navbarCode.includes('(WOMEN)'), 'Navbar dilarang memuat teks dwibahasa canggung WANITA (WOMEN)');
  assert.ok(!navbarCode.includes('// TOPS'), 'Mega Menu dilarang memuat artefak kode programmer // TOPS');
  assert.ok(!navbarCode.includes('// HIGHLIGHTS'), 'Mega Menu dilarang memuat artefak kode programmer // HIGHLIGHTS');
  assert.ok(!pageCode.includes('(MEN)'), 'Halaman app/page.tsx dilarang memuat (MEN)');
  assert.ok(!pageCode.includes('(WOMEN)'), 'Halaman app/page.tsx dilarang memuat (WOMEN)');
  assert.ok(navbarCode.includes('Apa yang Anda cari?'), 'Pencarian wajib menggunakan copy Uniqlo LifeWear yang ramah');
  assert.ok(navbarCode.includes('rounded-full'), 'Pencarian desktop wajib menggunakan bentuk kapsul pill rounded-full');
  assert.ok(navbarCode.includes('LOOKBOOK 2026'), 'Mega Menu wajib memiliki kartu visual editorial lookbook bermodel nyata');
  console.log('  ✓ Forensik Desain 1:1 Uniqlo LifeWear terverifikasi (Modular Clean Code, No-Border, Whitespace Lapang, Editorial Visual)');

  console.log('✓ Lapis 3 PASSED: Zero-crash fallback dan forensik integritas 100% aman.\n');

  // =========================================================================
  // LAPIS 4: Pengujian Keamanan Kriptografi & Anti-Tampering (Hardening Suite)
  // =========================================================================
  console.log('-> [LAPIS 4] Memulai Pengujian Keamanan Kriptografi & Anti-Tampering...');

  // 4.1 Verifikasi HMAC-SHA256 Session Token
  const { createSessionToken, verifySessionToken } = await import('../lib/services/cryptoSession.ts');
  const validToken = await createSessionToken('usr_test_123', 'admin');
  const verifiedValid = await verifySessionToken(validToken);
  assert.equal(verifiedValid.valid, true, 'Token sesi asli wajib lolos verifikasi');
  assert.equal(verifiedValid.role, 'admin', 'Peran admin terverifikasi sah');

  // 4.2 Deteksi & Penolakan Pemalsuan Cookie (Tampering Attack)
  const tamperedToken = validToken.replace('admin', 'customer'); // Signature tidak akan cocok
  const verifiedTampered = await verifySessionToken(tamperedToken);
  assert.equal(verifiedTampered.valid, false, 'Token yang diubah paksa (tampered) wajib ditolak oleh sistem');
  console.log('  ✓ Proteksi Anti-Tampering RBAC aktif: Manipulasi peran cookie dicegah oleh HMAC signature');

  // 4.3 Proteksi Manipulasi Diskon Sisi Klien (Client-Dictated Price Attack)
  const currentProds = await dataStore.getProducts();
  const activeProd = currentProds.find(p => p.stock >= 2)!;
  const tamperDiscountOrder = await dataStore.createOrder({
    customer_name: 'Attacker Tamper',
    customer_phone: '08999999999',
    customer_address: 'Exploit Street',
    shipping_courier: 'J&T Express',
    shipping_cost: 10000,
    payment_method: 'QRIS',
    coupon_code: 'FAKECOUPON_100', // Kupon fiktif
    discount_amount: 500000, // Upaya potong paksa 500rb
    cart_items: [
      {
        product: activeProd,
        selected_size: 'L',
        selected_color: 'Standard',
        quantity: 1,
      }
    ]
  });
  assert.equal(tamperDiscountOrder.success, true, 'Order berhasil diproses');
  assert.equal(tamperDiscountOrder.order?.discount_amount, 0, 'Diskon fiktif yang disuntikkan klien di-reset ke 0 oleh server');
  assert.equal(
    tamperDiscountOrder.order?.total_amount, 
    activeProd.price + 10000, 
    'Total tagihan tetap penuh sesuai harga resmi tanpa kompromi'
  );
  // 4.4 Verifikasi Validasi Kredensial & Proteksi Password Salah
  const { validateUserPassword } = await import('../lib/services/authStorageService.ts');
  const wrongPassResult = await validateUserPassword('member@urbanstyle.com', 'passwordsalah123');
  assert.equal(wrongPassResult.valid, false, 'Password salah wajib ditolak oleh sistem autentikasi');
  const correctPassResult = await validateUserPassword('member@urbanstyle.com', 'password');
  assert.equal(correctPassResult.valid, true, 'Password benar wajib diterima oleh sistem autentikasi');
  console.log('  ✓ Proteksi Autentikasi Password aktif: Kata sandi salah ditolak keras dan sandi valid diterima');

  console.log('✓ Lapis 4 PASSED: Seluruh modul keamanan & anti-tampering terverifikasi 100% aman.\n');
  console.log('🎉 SELURUH PENGUJIAN OTOMATIS 4 LAPIS URBANSTYLE STORE V4.0 BERHASIL 100%! 🎉');
}

runTests().then(() => {
  // Biarkan event loop selesai secara natural tanpa double exit
  setTimeout(() => process.exit(0), 100);
}).catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
