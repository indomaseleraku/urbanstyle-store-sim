// lib/services/qrisService.ts
// In-House Zero-Fee Dynamic QRIS Generator (Standar Bank Indonesia EMVCo & CRC-16 CCITT-FALSE)
// Sesuai PRD V5.2 FR-14 & NFR-04

import QRCode from 'qrcode';

export interface QRISResult {
  rawPayload: string;
  dataUrl: string;
  amount: number;
  merchantName: string;
  nmid: string;
  orderNumber?: string;
  crc: string;
  mode: 'dynamic' | 'static';
}

// Base QRIS Statis Merchant Resmi Bank Indonesia (NMID ID1025458911316 - warung koh kim)
export const DEFAULT_BASE_STATIC_QRIS = 
  '00020101021126610014COM.GO-JEK.WWW01189360091431037768610210G1037768610303UMI51440014ID.CO.QRIS.WWW0215ID10254589113160303UMI5204581253033605802ID5914warung koh kim6008PEMALANG61055235262070703A0163044086';

/**
 * Menghitung Checksum CRC-16 / CCITT-FALSE
 * Standar EMVCo: Polynomial 0x1021, Initial 0xFFFF, Tanpa Refleksi (XOR Out 0x0000)
 */
export function calculateCRC16CCITT(str: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    crc ^= (c << 8);
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Parsing struktur TLV (Tag-Length-Value) EMVCo
 */
export function parseTLV(payload: string): Map<string, string> {
  const map = new Map<string, string>();
  let i = 0;
  while (i < payload.length) {
    if (i + 4 > payload.length) break;
    const tag = payload.substring(i, i + 2);
    const len = parseInt(payload.substring(i + 2, i + 4), 10);
    if (isNaN(len) || i + 4 + len > payload.length) break;
    const val = payload.substring(i + 4, i + 4 + len);
    map.set(tag, val);
    i += 4 + len;
  }
  return map;
}

/**
 * Membentuk string TLV
 */
function formatTLV(tag: string, value: string): string {
  const lenStr = value.length.toString().padStart(2, '0');
  return `${tag}${lenStr}${value}`;
}

export const qrisService = {
  /**
   * Mengonversi Base QRIS Statis menjadi QRIS Terstandarisasi EMVCo
   * Mendukung:
   * - Mode 'dynamic': Tag 01='12', suntik Tag 54 nominal belanja, pertahankan Tag 59 & Tag 62 asli
   * - Mode 'static': Tag 01='11', tanpa Tag 54, 100% payload asli kertas toko fisik
   */
  generatePayload(
    amount: number,
    options?: {
      mode?: 'dynamic' | 'static';
      orderNumber?: string;
      customMerchantName?: string;
      customBaseQRIS?: string;
    }
  ): { payload: string; crc: string; merchantName: string; nmid: string; mode: 'dynamic' | 'static' } {
    const mode = options?.mode || 'dynamic';
    const baseQRIS = 
      options?.customBaseQRIS || 
      process.env.NEXT_PUBLIC_QRIS_STATIC_PAYLOAD || 
      DEFAULT_BASE_STATIC_QRIS;

    const cleanBase = baseQRIS.trim();
    const tlvMap = parseTLV(cleanBase);

    // Dapatkan nama merchant asli sebelum dimodifikasi
    const registeredMerchantName = tlvMap.get('59') || 'URBANSTYLE STORE';

    // Ekstrak NMID dari tag 51 atau tag 26
    let nmid = 'ID1025458911316';
    const tagInfo = (tlvMap.get('51') || '') + ' ' + (tlvMap.get('26') || '');
    const nmidMatch = tagInfo.match(/ID[0-9]{13}/);
    if (nmidMatch) {
      nmid = nmidMatch[0];
    }

    if (mode === 'static') {
      // MODE STATIS MURNI: 100% payload asli tanpa injeksi nominal (persis scan kertas di warung)
      // Kembalikan base QRIS apa adanya
      const existingCrc = tlvMap.get('63') || calculateCRC16CCITT(cleanBase.substring(0, cleanBase.length - 4));
      return {
        payload: cleanBase,
        crc: existingCrc,
        merchantName: registeredMerchantName,
        nmid,
        mode: 'static',
      };
    }

    // MODE DINAMIS:
    // 1. Ubah Tag 01 (Point of Initiation Method) menjadi 12 (Dinamis)
    tlvMap.set('01', '12');

    // 2. Suntik Tag 54 (Transaction Amount)
    const roundedAmount = Math.max(1, Math.round(amount));
    tlvMap.set('54', String(roundedAmount));

    // 3. Pastikan Mata Uang IDR (Tag 53: 360) & Negara ID (Tag 58: ID)
    tlvMap.set('53', '360');
    tlvMap.set('58', 'ID');

    // 4. Custom Merchant Name: HANYA ubah jika customMerchantName secara eksplisit diminta DAN BUKAN string default
    if (options?.customMerchantName && options.customMerchantName !== 'URBANSTYLE STORE') {
      tlvMap.set('59', options.customMerchantName.substring(0, 25));
    }

    // 5. Tag 62 (Additional Data):
    // PENTING: Pertahankan Subtag yang sudah ada (misal Terminal ID: 0703A01) agar routing GoPay/BCA tidak gagal!
    // Jangan overwrite Tag 62 bawaan acquirer!

    // Hapus Tag 63 lama jika ada
    tlvMap.delete('63');

    // 6. Urutkan tag sesuai hierarki baku EMVCo QRIS
    const preferredOrder = [
      '00', '01',
      // Merchant info
      '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51',
      '52', '53', '54', '58', '59', '60', '61', '62'
    ];

    let assembled = '';
    const processedTags = new Set<string>();

    for (const tag of preferredOrder) {
      if (tlvMap.has(tag)) {
        assembled += formatTLV(tag, tlvMap.get(tag)!);
        processedTags.add(tag);
      }
    }

    // Masukkan tag lain yang tersisa (jika ada)
    for (const [tag, val] of tlvMap.entries()) {
      if (!processedTags.has(tag)) {
        assembled += formatTLV(tag, val);
      }
    }

    // 7. Tambahkan awalan Tag 63 ('6304') untuk dikalkulasi CRC-nya
    const toChecksum = assembled + '6304';
    const crc = calculateCRC16CCITT(toChecksum);
    const finalPayload = toChecksum + crc;

    return {
      payload: finalPayload,
      crc,
      merchantName: tlvMap.get('59') || registeredMerchantName,
      nmid,
      mode: 'dynamic',
    };
  },

  /**
   * Menghasilkan Data URL (PNG Base64) dari payload QRIS secara mandiri (offline & zero-latency)
   */
  async generateQRCodeDataURL(payload: string): Promise<string> {
    try {
      const dataUrl = await QRCode.toDataURL(payload, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 320,
        color: {
          dark: '#111111',
          light: '#FFFFFF',
        },
      });
      return dataUrl;
    } catch (err) {
      console.error('Gagal generate QR Code Data URL:', err);
      return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><text x="10" y="20">QR Error</text></svg>`;
    }
  },

  /**
   * Pipeline All-In-One: menghasilkan QRIS lengkap beserta Data URL gambar PNG
   */
  async createDynamicQRIS(
    amount: number,
    options?: {
      mode?: 'dynamic' | 'static';
      orderNumber?: string;
      customMerchantName?: string;
      customBaseQRIS?: string;
    }
  ): Promise<QRISResult> {
    const { payload, crc, merchantName, nmid, mode } = this.generatePayload(amount, options);
    const dataUrl = await this.generateQRCodeDataURL(payload);

    return {
      rawPayload: payload,
      dataUrl,
      amount: Math.round(amount),
      merchantName,
      nmid,
      orderNumber: options?.orderNumber,
      crc,
      mode,
    };
  },

  // Alias backward-compatibility
  generateDynamicPayload(
    amount: number,
    options?: {
      mode?: 'dynamic' | 'static';
      orderNumber?: string;
      customMerchantName?: string;
      customBaseQRIS?: string;
    }
  ) {
    return this.generatePayload(amount, options);
  }
};
