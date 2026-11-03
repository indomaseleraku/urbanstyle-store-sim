// app/api/products/route.ts
import { NextResponse } from 'next/server';
import { dataStore } from '@/lib/store';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';
    const query = searchParams.get('q') || '';
    const gender = searchParams.get('gender') || 'all';
    const sort = searchParams.get('sort') || 'featured';

    const products = await dataStore.getProducts(category, query, gender, sort);

    return NextResponse.json({
      success: true,
      count: products.length,
      data: products,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memuat produk' },
      { status: 500 }
    );
  }
}
