// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Berhasil keluar.' });
  const isSecure = process.env.NODE_ENV === 'production';
  const clearOpts = {
    path: '/',
    maxAge: 0,
    sameSite: 'lax' as const,
    httpOnly: true,
    secure: isSecure,
  };
  response.cookies.set('urbanstyle_session_token', '', clearOpts);
  response.cookies.set('urbanstyle_auth_user', '', clearOpts);
  response.cookies.set('urbanstyle_auth_role', '', clearOpts);
  return response;
}
