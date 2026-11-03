import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Berhasil keluar.' });
  const cookieOpts = {
    path: '/',
    maxAge: 0,
    sameSite: 'lax' as const,
  };
  response.cookies.set('urbanstyle_session_token', '', cookieOpts);
  response.cookies.set('urbanstyle_auth_user', '', cookieOpts);
  response.cookies.set('urbanstyle_auth_role', '', cookieOpts);
  return response;
}
