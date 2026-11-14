// scripts/test_live_admin.ts
async function testLive() {
  const baseUrl = 'http://localhost:3000';
  console.log('--- TEST LIVE HTTP ADMIN FLOW ---');

  // 1. Login
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@urbanstyle.com',
      password: 'admin123',
      staff_only: true,
    }),
  });

  console.log('Login Response Status:', loginRes.status);
  const loginData = await loginRes.json();
  console.log('Login Success:', loginData.success, '| Role:', loginData.user?.role);

  // Extract set-cookie
  const setCookie = loginRes.headers.get('set-cookie') || '';
  const cookies = setCookie.split(',').map(c => c.split(';')[0].trim()).join('; ');
  console.log('Cookies received:', cookies ? 'YES (HMAC session token attached)' : 'NO');

  // 2. Fetch /admin with cookie
  const adminRes = await fetch(`${baseUrl}/admin`, {
    headers: {
      Cookie: cookies,
    },
    redirect: 'manual',
  });

  console.log('Admin Page Status:', adminRes.status);
  if (adminRes.status === 200) {
    console.log('✓ PASS: Admin page successfully loaded (HTTP 200 OK)!');
  } else if (adminRes.status === 307 || adminRes.status === 302) {
    console.log('⚠️ REDIRECT:', adminRes.headers.get('location'));
  } else {
    console.log('❌ FAILED with status:', adminRes.status);
  }
}

testLive().catch(err => {
  console.error('Test Live Error:', err);
  process.exit(1);
});
