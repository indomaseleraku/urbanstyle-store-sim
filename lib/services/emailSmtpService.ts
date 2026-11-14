// lib/services/emailSmtpService.ts
// Layanan Pengiriman Email via Gmail SMTP dengan HTML escaping aman

import nodemailer from 'nodemailer';
import { escapeHtml } from './sessionServerHelper';

const SMTP_USER = process.env.GMAIL_SMTP_USER || '';
const SMTP_PASS = (process.env.GMAIL_SMTP_APP_PASSWORD || '').replace(/\s+/g, '');
const SENDER_DISPLAY = process.env.GMAIL_SENDER_NAME || 'UrbanStyle LifeWear';

function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

export async function sendOtpEmail(
  toEmail: string,
  otpCode: string,
  purpose: 'login' | 'register' | 'reset' = 'login'
): Promise<{ sent: boolean; messageId?: string; error?: string }> {
  const cleanTo = toEmail.trim().toLowerCase();
  const safeOtp = escapeHtml(otpCode);
  const actionLabel =
    purpose === 'register'
      ? 'pendaftaran akun'
      : purpose === 'reset'
      ? 'reset kata sandi'
      : 'masuk akun';

  const html = `<div dir="ltr" style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #222222; line-height: 1.6;">
  <p>Halo,</p>
  <p>Berikut adalah 6 angka kode untuk ${actionLabel} Anda di UrbanStyle:</p>
  <p style="font-size: 22px; font-weight: bold; letter-spacing: 4px; margin: 16px 0; color: #111111;">${safeOtp}</p>
  <p>Silakan masukkan kode tersebut pada halaman aplikasi (berlaku selama 5 menit).</p>
  <p>Terima kasih,<br>UrbanStyle LifeWear</p>
</div>`;

  const text = `Halo,\n\nBerikut adalah 6 angka kode untuk ${actionLabel} Anda di UrbanStyle:\n\n${otpCode}\n\nSilakan masukkan kode tersebut pada halaman aplikasi (berlaku selama 5 menit).\n\nTerima kasih,\nUrbanStyle LifeWear`;

  const transporter = createTransporter();
  try {
    const info = await transporter.sendMail({
      from: `"${SENDER_DISPLAY}" <${SMTP_USER}>`,
      to: cleanTo,
      subject: `Kode akses UrbanStyle (${otpCode})`,
      text,
      html,
    });
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Gagal mengirim email SMTP';
    console.error('[emailSmtpService] OTP send error:', msg);
    return { sent: false, error: msg };
  } finally {
    transporter.close();
  }
}

export interface OrderEmailPayload {
  toEmail: string;
  customerName: string;
  orderNumber: string;
  totalAmount: number;
  paymentMethod: string;
  itemsSummary: string;
  shippingAddress?: string;
}

export async function sendOrderNotificationEmail(
  payload: OrderEmailPayload
): Promise<{ sent: boolean; messageId?: string; error?: string }> {
  const cleanTo = payload.toEmail.trim().toLowerCase();
  const formattedTotal = `Rp ${Number(payload.totalAmount || 0).toLocaleString('id-ID')}`;

  const safeName = escapeHtml(payload.customerName);
  const safeOrderNo = escapeHtml(payload.orderNumber);
  const safeItems = escapeHtml(payload.itemsSummary);
  const safeMethod = escapeHtml(payload.paymentMethod);
  const safeAddr = payload.shippingAddress ? escapeHtml(payload.shippingAddress) : '';

  const html = `<div dir="ltr" style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #222222; line-height: 1.6;">
  <p>Halo ${safeName},</p>
  <p>Pembayaran pesanan Anda telah <b>berhasil kami terima (LUNAS)</b>. Berikut adalah ringkasan faktur transaksi resmi Anda:</p>
  <p>
    Nomor Pesanan: <b>${safeOrderNo}</b><br>
    Status Pembayaran: <b style="color: #16a34a;">LUNAS</b><br>
    Item: ${safeItems}<br>
    Metode Pembayaran: ${safeMethod}<br>
    Total: <b>${formattedTotal}</b>
    ${safeAddr ? `<br>Alamat Tujuan: ${safeAddr}` : ''}
  </p>
  <p>Pesanan Anda saat ini sedang dikemas oleh tim logistik kami.</p>
  <p>Salam,<br>UrbanStyle LifeWear</p>
</div>`;

  const text = `Halo ${payload.customerName},\n\nPembayaran pesanan Anda telah berhasil kami terima (LUNAS). Berikut adalah ringkasan faktur transaksi resmi Anda:\n\nNomor Pesanan: ${payload.orderNumber}\nStatus Pembayaran: LUNAS\nItem: ${payload.itemsSummary}\nMetode Pembayaran: ${payload.paymentMethod}\nTotal: ${formattedTotal}${payload.shippingAddress ? `\nAlamat Tujuan: ${payload.shippingAddress}` : ''}\n\nPesanan Anda saat ini sedang dikemas oleh tim logistik kami.\n\nSalam,\nUrbanStyle LifeWear`;

  const transporter = createTransporter();
  try {
    const info = await transporter.sendMail({
      from: `"${SENDER_DISPLAY}" <${SMTP_USER}>`,
      to: cleanTo,
      subject: `Pembayaran Berhasil - Faktur Pesanan UrbanStyle #${payload.orderNumber}`,
      text,
      html,
    });
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Gagal mengirim email pesanan';
    console.error('[emailSmtpService] Order email error:', msg);
    return { sent: false, error: msg };
  } finally {
    transporter.close();
  }
}
