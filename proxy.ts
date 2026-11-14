// proxy.ts
// Next.js 16 Network Proxy Guard: Proteksi Kriptografi RBAC & Sesi Pengguna UrbanStyle Store

import { NextResponse, type NextRequest } from 'next/server';
import { verifySessionToken } from './lib/services/cryptoSession';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionToken = request.cookies.get('urbanstyle_session_token')?.value;
  const legacyRole = request.cookies.get('urbanstyle_auth_role')?.value;
  const legacyUser = request.cookies.get('urbanstyle_auth_user')?.value;

  const session = await verifySessionToken(sessionToken);

  let effectiveUser = session.valid ? session.userId : null;
  let effectiveRole = session.valid ? session.role : null;

  if (!session.valid && (legacyUser || legacyRole)) {
    effectiveUser = null;
    effectiveRole = null;
  }

  const isStaffRole = ['admin', 'owner', 'gudang', 'kasir'].includes(effectiveRole || '');

  if (pathname === '/admin/login') {
    if (effectiveUser && isStaffRole) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin')) {
    if (!effectiveUser || !isStaffRole) {
      const url = new URL('/admin/login', request.url);
      if (pathname !== '/admin') {
        const safeRedirect = pathname.startsWith('/') && !pathname.startsWith('//') ? pathname : '/admin';
        url.searchParams.set('redirect', safeRedirect);
      }
      return NextResponse.redirect(url);
    }
  }

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
