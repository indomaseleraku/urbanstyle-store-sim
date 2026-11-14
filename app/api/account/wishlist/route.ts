// app/api/account/wishlist/route.ts
// Server-side Member Wishlist Endpoint (Protected by HMAC Session + service_role)

import { NextRequest, NextResponse } from 'next/server';
import { getRequestSession } from '@/lib/services/sessionServerHelper';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { mapDbProduct } from '@/lib/services/productMapper';
import { Product } from '@/lib/types';

async function fetchMemberWishlistProducts(userId: string): Promise<Product[]> {
  const { data, error } = await supabaseAdmin
    .from('wishlists')
    .select('product_id, created_at, products(*, categories(name, slug), reviews(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message || 'Gagal memuat daftar wishlist.');
  }

  const list: Product[] = [];
  for (const row of (data || []) as any[]) {
    if (row.products && (!row.products.status || row.products.status === 'active')) {
      list.push(mapDbProduct(row.products));
    }
  }
  return list;
}

export async function GET(req: NextRequest) {
  const session = await getRequestSession(req);
  if (!session.valid || !session.userId) {
    return NextResponse.json({ success: false, message: 'Sesi tidak valid.' }, { status: 401 });
  }

  try {
    const items = await fetchMemberWishlistProducts(session.userId);
    return NextResponse.json({ success: true, data: items });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal memuat wishlist.';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getRequestSession(req);
  if (!session.valid || !session.userId) {
    return NextResponse.json({ success: false, message: 'Sesi tidak valid.' }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (Array.isArray(body?.product_ids)) {
      const requestedIds = Array.from(
        new Set(
          body.product_ids
            .map((id: unknown) => Number(id))
            .filter((id: number) => Number.isInteger(id) && id > 0)
        )
      ) as number[];

      if (requestedIds.length > 0) {
        const { data: validProds, error: prodErr } = await supabaseAdmin
          .from('products')
          .select('id')
          .in('id', requestedIds);

        if (prodErr) {
          throw new Error(prodErr.message);
        }

        const validIds = (validProds || []).map((p: any) => Number(p.id));
        if (validIds.length > 0) {
          const rows = validIds.map((product_id) => ({
            user_id: session.userId!,
            product_id,
          }));
          const { error: upsertErr } = await supabaseAdmin
            .from('wishlists')
            .upsert(rows, { onConflict: 'user_id,product_id', ignoreDuplicates: true });
          if (upsertErr) throw new Error(upsertErr.message);
        }
      }

      const items = await fetchMemberWishlistProducts(session.userId);
      return NextResponse.json({ success: true, data: items });
    }

    const productId = Number(body?.product_id);
    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json({ success: false, message: 'ID produk tidak valid.' }, { status: 400 });
    }

    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('wishlists')
      .select('id')
      .eq('user_id', session.userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (fetchErr) throw new Error(fetchErr.message);

    let inWishlist = false;
    if (existing) {
      const { error: delErr } = await supabaseAdmin
        .from('wishlists')
        .delete()
        .eq('user_id', session.userId)
        .eq('product_id', productId);
      if (delErr) throw new Error(delErr.message);
      inWishlist = false;
    } else {
      const { data: prodExists } = await supabaseAdmin
        .from('products')
        .select('id')
        .eq('id', productId)
        .maybeSingle();

      if (!prodExists) {
        return NextResponse.json({ success: false, message: 'Produk tidak ditemukan.' }, { status: 404 });
      }

      const { error: insErr } = await supabaseAdmin
        .from('wishlists')
        .upsert(
          { user_id: session.userId, product_id: productId },
          { onConflict: 'user_id,product_id', ignoreDuplicates: true }
        );
      if (insErr) throw new Error(insErr.message);
      inWishlist = true;
    }

    const items = await fetchMemberWishlistProducts(session.userId);
    return NextResponse.json({ success: true, inWishlist, data: items });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal memperbarui wishlist.';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getRequestSession(req);
  if (!session.valid || !session.userId) {
    return NextResponse.json({ success: false, message: 'Sesi tidak valid.' }, { status: 401 });
  }

  try {
    const productId = Number(req.nextUrl.searchParams.get('product_id'));
    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json({ success: false, message: 'ID produk tidak valid.' }, { status: 400 });
    }

    const { error: delErr } = await supabaseAdmin
      .from('wishlists')
      .delete()
      .eq('user_id', session.userId)
      .eq('product_id', productId);

    if (delErr) throw new Error(delErr.message);

    const items = await fetchMemberWishlistProducts(session.userId);
    return NextResponse.json({ success: true, data: items });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal menghapus item wishlist.';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
