// middleware.ts
// Edge Middleware Guard: Proteksi Kriptografi RBAC & Sesi Pengguna UrbanStyle Store

import { NextResponse, type NextRequest } from 'next/server';
import { verifySessionToken } from './lib/services/cryptoSession';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionToken = request.cookies.get('urbanstyle_session_token')?.value;
  const legacyRole = request.cookies.get('urbanstyle_auth_role')?.value;
  const legacyUser = request.cookies.get('urbanstyle_auth_user')?.value;

  // Verifikasi tanda tangan kriptografi token (HMAC-SHA256)
  const session = await verifySessionToken(sessionToken);

  let effectiveUser = session.valid ? session.userId : null;
  let effectiveRole = session.valid ? session.role : null;

  // Fallback sementara dengan deteksi tampering: jika cookie biasa dipasang manual tanpa token sah, anggap tidak valid
  if (!session.valid && legacyUser && legacyRole) {
    // Cookie polos tanpa token tanda tangan dianggap sebagai upaya tampering / sesi kadaluwarsa
    effectiveUser = null;
    effectiveRole = null;
  }

  const isStaffRole = ['admin', 'owner', 'gudang', 'kasir'].includes(effectiveRole || '');

  // 1. Proteksi Halaman Eksekutif Admin (/admin) & Portal Staf Terisolasi (/admin/login)
  if (pathname === '/admin/login') {
    // Jika staf sudah memiliki sesi login aktif yang sah, langsung alihkan ke dashboard admin
    if (effectiveUser && isStaffRole) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    // Izinkan akses ke halaman login staf
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin')) {
    // Jika belum login atau bukan staf internal sah, alihkan ke portal /admin/login
    if (!effectiveUser || !isStaffRole) {
      const url = new URL('/admin/login', request.url);
    if (pathname !== '/admin') {
        // Hanya izinkan internal path, tolak URL eksternal (open redirect prevention)
        const safeRedirect = pathname.startsWith('/') && !pathname.startsWith('//') ? pathname : '/admin';
        url.searchParams.set('redirect', safeRedirect);
      }
      return NextResponse.redirect(url);
    }
  }

  // 2. Proteksi Halaman Portal Akun Member (/account)
  if (pathname === '/account/login') {
    if (effectiveUser) {
      return NextResponse.redirect(new URL('/account/profile', request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/account')) {
    if (!effectiveUser) {
      const url = new URL('/account/login', request.url);
      const safeRedirect = pathname.startsWith('/') && !pathname.startsWith('//') ? pathname : '/account';
      url.searchParams.set('redirect', safeRedirect);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
};
