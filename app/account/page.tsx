'use client';

// app/account/page.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/account/profile');
  }, [router]);

  return (
    <div className="bg-white p-8 border border-zinc-200 text-center text-sm text-zinc-500">
      Memuat portal member...
    </div>
  );
}
