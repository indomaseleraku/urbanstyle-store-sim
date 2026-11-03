// lib/admin-suite/initialData.ts
// Data Awal Tersinkronisasi untuk UrbanStyle Commerce OS - Operations Suite

import { Product, Order, Employee, InboundShipment, ExpenseItem, PromoVoucher, ActivityLog } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-01',
    sku: 'URBAN-OXF-01',
    name: 'Kemeja Katun Oxford Lengan Panjang Premium',
    category: 'Kemeja & Atasan',
    price: 349000,
    originalPrice: 429000,
    stock: 48,
    safetyStock: 15,
    rackLocation: 'Rak A-02 / Bin 04',
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
    salesCount: 312,
    rating: 4.9,
    description: 'Kemeja katun oxford 100% serat alami berpotongan relaxed fit dengan kancing mutiara resin.'
  },
  {
    id: 'prod-02',
    sku: 'URBAN-BAG-02',
    name: 'Tas Jinjing Kulit Minimalis Urban Canvas',
    category: 'Aksesori & Tas',
    price: 890000,
    originalPrice: 1050000,
    stock: 14,
    safetyStock: 10,
    rackLocation: 'Rak B-01 / Bin 01',
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80',
    salesCount: 184,
    rating: 4.8,
    description: 'Tas jinjing kanvas katun tebal dengan strap kulit premium dan kompartemen laptop 14 inci.'
  },
  {
    id: 'prod-03',
    sku: 'URBAN-CHN-03',
    name: 'Celana Panjang Smart Ankle Pants Ultra Stretch',
    category: 'Celana & Bawahan',
    price: 399000,
    originalPrice: 499000,
    stock: 22,
    safetyStock: 12,
    rackLocation: 'Rak C-04 / Bin 02',
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80',
    salesCount: 295,
    rating: 4.9,
    description: 'Celana ankle berteknologi elastis 2-arah dengan bahan jatuh lembut bebas kusut.'
  },
  {
    id: 'prod-04',
    sku: 'URBAN-TEE-04',
    name: 'T-Shirt Katun Supima Leher Bulat Essential',
    category: 'Kaos & Polo',
    price: 199000,
    originalPrice: 249000,
    stock: 65,
    safetyStock: 20,
    rackLocation: 'Rak D-02 / Vault 01',
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    salesCount: 540,
    rating: 4.9,
    description: 'Kaos berbahan 100% katun Supima dengan permukaan halus, serat kuat, dan warna tahan pudar.'
  },
  {
    id: 'prod-05',
    sku: 'URBAN-WLT-05',
    name: 'Dompet Kartu Slim Leather Saddle Stitch',
    category: 'Aksesori & Tas',
    price: 199000,
    originalPrice: 239000,
    stock: 8,
    safetyStock: 10,
    rackLocation: 'Rak B-02 / Bin 05',
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
    salesCount: 420,
    rating: 4.9,
    description: 'Dompet kartu tipis muat 8 kartu dan uang kertas lipat, jahitan benang lilin khas artisanal.'
  },
  {
    id: 'prod-06',
    sku: 'URBAN-FLN-06',
    name: 'Kemeja Flannel Kotak Lengan Panjang LifeWear',
    category: 'Kemeja & Atasan',
    price: 299000,
    stock: 35,
    safetyStock: 15,
    rackLocation: 'Rak C-01 / Bin 03',
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80',
    salesCount: 388,
    rating: 5.0,
    description: 'Flannel katun double-brushed lembut bertekstur hangat khas pakaian kasual modern.'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'ORD-2026-9021',
    customerName: 'Aditya Pratama',
    customerPhone: '+62 812-9844-1234',
    customerEmail: 'aditya.p@gmail.com',
    shippingAddress: 'Jl. Senopati Dalam No. 18, Kebayoran Baru',
    city: 'Jakarta Selatan',
    courier: 'SiCepat Kilat',
    trackingNumber: '003291882190',
    paymentMethod: 'QRIS',
    paymentStatus: 'paid',
    items: [
      {
        productId: 'prod-01',
        sku: 'URBAN-OXF-01',
        name: 'Kemeja Katun Oxford Lengan Panjang Premium',
        price: 349000,
        quantity: 2,
        imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80'
      }
    ],
    subtotal: 698000,
    shippingCost: 22000,
    discount: 50000,
    total: 670000,
    status: 'packing',
    createdAt: '2026-10-13 07:42 WIB',
    notes: 'Mohon dicek jahitan sebelum dikemas, terima kasih!'
  },
  {
    id: 'ord-102',
    orderNumber: 'ORD-2026-9020',
    customerName: 'Maya Kusuma Dewi',
    customerPhone: '+62 813-7721-9988',
    customerEmail: 'maya.dewi@outlook.com',
    shippingAddress: 'Perumahan Dago Asri Blok B4 No. 12',
    city: 'Bandung',
    courier: 'JNE Reguler',
    trackingNumber: 'JNE8890213812',
    paymentMethod: 'Transfer Bank BCA',
    paymentStatus: 'paid',
    items: [
      {
        productId: 'prod-02',
        sku: 'URBAN-BAG-02',
        name: 'Tas Jinjing Kulit Minimalis Urban Canvas',
        price: 890000,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80'
      },
      {
        productId: 'prod-04',
        sku: 'URBAN-TEE-04',
        name: 'T-Shirt Katun Supima Leher Bulat Essential',
        price: 199000,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80'
      }
    ],
    subtotal: 1089000,
    shippingCost: 35000,
    discount: 0,
    total: 1124000,
    status: 'shipped',
    createdAt: '2026-10-12 16:15 WIB'
  },
  {
    id: 'ord-103',
    orderNumber: 'ORD-2026-9019',
    customerName: 'Bambang Sudibyo',
    customerPhone: '+62 821-4455-6677',
    customerEmail: 'bambang.s@perusahaan.co.id',
    shippingAddress: 'Jl. Pemuda No. 45, Embong Kaliasin',
    city: 'Surabaya',
    courier: 'J&T Express',
    trackingNumber: 'JT9921004921',
    paymentMethod: 'Transfer Bank Mandiri',
    paymentStatus: 'paid',
    items: [
      {
        productId: 'prod-03',
        sku: 'URBAN-CHN-03',
        name: 'Celana Panjang Smart Ankle Pants Ultra Stretch',
        price: 399000,
        quantity: 2,
        imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80'
      }
    ],
    subtotal: 798000,
    shippingCost: 30000,
    discount: 0,
    total: 828000,
    status: 'delivered',
    createdAt: '2026-10-11 11:20 WIB'
  },
  {
    id: 'ord-104',
    orderNumber: 'ORD-2026-9022',
    customerName: 'Siti Rahmawati',
    customerPhone: '+62 856-7788-9900',
    customerEmail: 'siti.rahma@gmail.com',
    shippingAddress: 'Jl. Kaliurang KM 7.5, Sinduharjo, Ngaglik',
    city: 'Sleman / Yogyakarta',
    courier: 'JNE Reguler',
    paymentMethod: 'COD',
    paymentStatus: 'unpaid',
    items: [
      {
        productId: 'prod-05',
        sku: 'URBAN-WLT-05',
        name: 'Dompet Kartu Slim Leather Saddle Stitch',
        price: 199000,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80'
      }
    ],
    subtotal: 199000,
    shippingCost: 20000,
    discount: 0,
    total: 219000,
    status: 'processing',
    createdAt: '2026-10-13 08:10 WIB',
    notes: 'Tolong siapkan uang pas saat kurir tiba.'
  },
  {
    id: 'ord-105',
    orderNumber: 'ORD-2026-9023',
    customerName: 'Kevin Wijaya',
    customerPhone: '+62 818-0909-1212',
    customerEmail: 'kevin.w@techstartup.id',
    shippingAddress: 'Apartemen Sudirman Tower A Lt. 24, SCBD',
    city: 'Jakarta Selatan',
    courier: 'GoSend Instant',
    paymentMethod: 'QRIS',
    paymentStatus: 'paid',
    items: [
      {
        productId: 'prod-06',
        sku: 'URBAN-FLN-06',
        name: 'Kemeja Flannel Kotak Lengan Panjang LifeWear',
        price: 299000,
        quantity: 2,
        imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80'
      }
    ],
    subtotal: 598000,
    shippingCost: 35000,
    discount: 50000,
    total: 583000,
    status: 'processing',
    createdAt: '2026-10-13 08:35 WIB'
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-01',
    name: 'Kimy Eka Ardiansyah',
    email: 'admin@urbanstyle.com',
    phone: '+62 812-3456-7890',
    role: 'superadmin',
    roleLabel: 'Owner & Direktur Utama (Superadmin)',
    department: 'Direksi & Manajemen',
    branch: 'Kantor Pusat Jakarta',
    status: 'active',
    salary: 25000000,
    lastLogin: 'Baru saja',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'emp-02',
    name: 'Staf Kasir & Store Admin',
    email: 'kasir@urbanstyle.com',
    phone: '+62 812-4455-8899',
    role: 'store_admin',
    roleLabel: 'Kepala Kasir & Operasional Toko',
    department: 'Sales & Customer Relations',
    branch: 'UrbanStyle Flagship Store',
    status: 'active',
    salary: 8500000,
    lastLogin: '5 Menit yang lalu',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'emp-03',
    name: 'Staf Gudang & Logistik',
    email: 'gudang@urbanstyle.com',
    phone: '+62 857-8899-1122',
    role: 'warehouse_admin',
    roleLabel: 'Supervisor Pergudangan & Logistik',
    department: 'Warehouse & Fulfillment',
    branch: 'Gudang DC UrbanStyle Cikarang',
    status: 'active',
    salary: 7800000,
    lastLogin: '2 Menit yang lalu',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'emp-04',
    name: 'Siti Nurhaliza',
    email: 'finance@urbanstyle.com',
    phone: '+62 813-1122-3344',
    role: 'superadmin',
    roleLabel: 'Manajer Keuangan & Akuntansi',
    department: 'Finance & Tax',
    branch: 'Kantor Pusat Jakarta',
    status: 'active',
    salary: 12000000,
    lastLogin: '1 Jam yang lalu',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'emp-05',
    name: 'Budi Santoso',
    email: 'budi.packer@urbanstyle.com',
    phone: '+62 822-3344-5566',
    role: 'warehouse_admin',
    roleLabel: 'Staf Picking & Quality Control',
    department: 'Warehouse & Fulfillment',
    branch: 'Gudang DC UrbanStyle Cikarang',
    status: 'active',
    salary: 5500000,
    lastLogin: 'Hari ini, 07:15 WIB',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
  }
];

export const INITIAL_INBOUND: InboundShipment[] = [
  {
    id: 'po-01',
    poNumber: 'PO-2026-042',
    supplierName: 'PT Tekstil Katun Nusantara (Bandung)',
    itemCount: 2,
    totalUnits: 150,
    expectedDate: '15 Okt 2026',
    status: 'pending',
    itemsSummary: 'Kemeja Katun Oxford (100 pcs), Kaos Supima (50 pcs)',
    destinationWarehouse: 'Gudang DC UrbanStyle Cikarang'
  },
  {
    id: 'po-02',
    poNumber: 'PO-2026-041',
    supplierName: 'Atelier Busana Konveksi Solo',
    itemCount: 1,
    totalUnits: 80,
    expectedDate: '14 Okt 2026 (Hari ini)',
    status: 'in_qc',
    itemsSummary: 'Celana Ankle Stretch Pants (80 pcs)',
    destinationWarehouse: 'Gudang DC UrbanStyle Cikarang'
  },
  {
    id: 'po-03',
    poNumber: 'PO-2026-039',
    supplierName: 'Pabrik Dompet Kulit Tanggulangin',
    itemCount: 2,
    totalUnits: 100,
    expectedDate: '10 Okt 2026',
    status: 'received',
    itemsSummary: 'Tas Kanvas Minimalis (40 pcs), Dompet Slim (60 pcs)',
    destinationWarehouse: 'Gudang DC UrbanStyle Cikarang'
  }
];

export const INITIAL_EXPENSES: ExpenseItem[] = [
  {
    id: 'exp-01',
    category: 'Gaji Karyawan',
    description: 'Payroll Total 12 Staf & Bonus Operasional Toko',
    amount: 68500000,
    date: '01 Okt 2026',
    approvedBy: 'Kimy Eka (Owner)',
    status: 'approved'
  },
  {
    id: 'exp-02',
    category: 'Sewa Gudang & Listrik',
    description: 'Sewa Fasilitas DC Cikarang & Listrik Operasional',
    amount: 14200000,
    date: '03 Okt 2026',
    approvedBy: 'Kimy Eka (Owner)',
    status: 'approved'
  },
  {
    id: 'exp-03',
    category: 'Biaya Pengiriman/Logistik',
    description: 'Subsidi Ongkir Ekspedisi & Bubble Wrap Box Premium',
    amount: 6800000,
    date: '08 Okt 2026',
    approvedBy: 'Siti Nurhaliza (Finance)',
    status: 'approved'
  },
  {
    id: 'exp-04',
    category: 'Pemasaran & Iklan',
    description: 'Meta Ads & Kolaborasi Fotografi Lookbook Musim Gugur',
    amount: 12500000,
    date: '05 Okt 2026',
    approvedBy: 'Kimy Eka (Owner)',
    status: 'approved'
  },
  {
    id: 'exp-05',
    category: 'Server & Software',
    description: 'Cloud Server, Database, & Lisensi POS Omnichannel',
    amount: 3200000,
    date: '02 Okt 2026',
    approvedBy: 'Siti Nurhaliza (Finance)',
    status: 'approved'
  }
];

export const INITIAL_PROMOS: PromoVoucher[] = [
  {
    id: 'prm-01',
    code: 'URBANWELCOME50',
    discountType: 'fixed',
    discountValue: 50000,
    minPurchase: 200000,
    usageCount: 142,
    quota: 300,
    validUntil: '31 Des 2026',
    status: 'active'
  },
  {
    id: 'prm-02',
    code: 'LIFEWEAR10',
    discountType: 'percentage',
    discountValue: 10,
    minPurchase: 300000,
    usageCount: 89,
    quota: 200,
    validUntil: '30 Nov 2026',
    status: 'active'
  }
];

export const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log-01',
    timestamp: '14 Okt 10:35 WIB',
    userName: 'Staf Kasir',
    userRole: 'store_admin',
    action: 'Pesanan Baru Masuk',
    details: 'Pesanan #ORD-2026-9023 (Kevin Wijaya - Rp 583.000) diverifikasi',
    category: 'order'
  },
  {
    id: 'log-02',
    timestamp: '14 Okt 09:15 WIB',
    userName: 'Staf Gudang',
    userRole: 'warehouse_admin',
    action: 'Label Pengiriman Dicetak',
    details: 'Mencetak packing slip untuk pesanan #ORD-2026-9021',
    category: 'inventory'
  },
  {
    id: 'log-03',
    timestamp: '14 Okt 08:45 WIB',
    userName: 'Kimy Eka Ardiansyah',
    userRole: 'superadmin',
    action: 'Export Laporan Keuangan',
    details: 'Mengunduh laporan Laba Rugi Q3 2026 ke format CSV/PDF',
    category: 'finance'
  },
  {
    id: 'log-04',
    timestamp: '13 Okt 17:30 WIB',
    userName: 'Budi Santoso',
    userRole: 'warehouse_admin',
    action: 'Update Stok SKU',
    details: 'Menambah stok fisik URBAN-OXF-01 sebanyak 20 unit',
    category: 'inventory'
  }
];
