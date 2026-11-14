// app/api/products/[id]/reviews/route.ts
// Server-side Product Reviews Endpoint (Authenticated + Rate-Limited + Atomic Rating Sync)

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { mapDbReview, normalizeFitRating } from '@/lib/services/productMapper';
import { productService } from '@/lib/services/productService';
import { getRequestSession } from '@/lib/services/sessionServerHelper';
import { checkRateLimit, REVIEW_RATE_LIMIT, getClientIp } from '@/lib/services/rateLimiter';
import { staffService } from '@/lib/services/staffService';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getRequestSession(req);
    if (!session.valid || !session.userId) {
      return NextResponse.json(
        { success: false, message: 'Silakan masuk ke akun Anda terlebih dahulu untuk menulis ulasan.' },
        { status: 401 }
      );
    }

    const ip = getClientIp(req);
    const rl = checkRateLimit(`review:${session.userId}:${ip}`, REVIEW_RATE_LIMIT);
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, message: 'Terlalu banyak pengiriman ulasan. Silakan coba lagi nanti.' },
        { status: 429 }
      );
    }

    const resolved = await params;
    const productId = Number(resolved.id);
    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json(
        { success: false, message: 'ID produk tidak valid.' },
        { status: 400 }
      );
    }

    const body = await req.json();
    let reviewerName = String(body.reviewer_name || '').trim();
    if (!reviewerName) {
      const profile = await staffService.getUserProfile(session.userId);
      reviewerName = profile?.full_name || 'Member UrbanStyle';
    }
    const comment = String(body.comment || '').trim();
    const ratingNum = Math.min(5, Math.max(1, Math.round(Number(body.rating) || 5)));
    const sizePurchased = String(body.size_purchased || 'M').trim().slice(0, 20) || 'M';
    const fitRating = normalizeFitRating(body.fit_rating);

    if (!reviewerName || comment.length < 3 || comment.length > 1000) {
      return NextResponse.json(
        { success: false, message: 'Komentar ulasan wajib diisi (minimal 3 karakter, maksimal 1000 karakter).' },
        { status: 400 }
      );
    }

    const { data: existingProduct, error: prodErr } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('id', productId)
      .maybeSingle();

    if (prodErr || !existingProduct) {
      return NextResponse.json(
        { success: false, message: 'Produk tidak ditemukan.' },
        { status: 404 }
      );
    }

    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from('reviews')
      .insert({
        product_id: productId,
        reviewer_name: reviewerName.slice(0, 100),
        rating: ratingNum,
        size_purchased: sizePurchased,
        fit_rating: fitRating,
        comment,
      })
      .select('*')
      .single();

    if (insertErr || !inserted) {
      return NextResponse.json(
        { success: false, message: 'Gagal menyimpan ulasan ke database.' },
        { status: 500 }
      );
    }

    const { data: allReviews, error: aggErr } = await supabaseAdmin
      .from('reviews')
      .select('rating')
      .eq('product_id', productId);

    if (aggErr || !allReviews) {
      return NextResponse.json(
        { success: false, message: 'Ulasan tersimpan namun gagal menghitung agregat rating.' },
        { status: 500 }
      );
    }

    const nextCount = allReviews.length;
    const avgRating =
      nextCount > 0
        ? Number((allReviews.reduce((sum, r) => sum + Number(r.rating || 5), 0) / nextCount).toFixed(1))
        : ratingNum;

    const { error: updateErr } = await supabaseAdmin
      .from('products')
      .update({ rating: avgRating, reviews_count: nextCount })
      .eq('id', productId);

    if (updateErr) {
      return NextResponse.json(
        { success: false, message: 'Gagal memperbarui agregat ulasan produk.' },
        { status: 500 }
      );
    }

    productService.invalidateCache();

    return NextResponse.json(
      {
        success: true,
        review: mapDbReview(inserted),
        rating: avgRating,
        reviews_count: nextCount,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal mengirim ulasan.';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
