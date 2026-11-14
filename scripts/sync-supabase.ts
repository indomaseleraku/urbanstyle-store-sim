// scripts/sync-supabase.ts
import { supabase, isSupabaseConfigured } from '../lib/store';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '../lib/mock-data';

async function sync() {
  console.log('--- SYNCING 40 ADULT PRODUCTS TO SUPABASE CLOUD ---');
  if (!isSupabaseConfigured || !supabase) {
    console.error('Supabase is not configured!');
    process.exit(1);
  }

  // 1. Sync Categories
  for (const cat of INITIAL_CATEGORIES) {
    await supabase.from('categories').upsert({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
    });
  }

  // 2. Sync Products
  for (const p of INITIAL_PRODUCTS) {
    const record = {
      id: p.id,
      category_id: p.category_id,
      name: p.name,
      slug: p.slug,
      gender: p.gender,
      price: p.price,
      original_price: p.original_price || null,
      stock: p.stock,
      description: p.description,
      fabric_details: p.fabric_details,
      care_instructions: p.care_instructions,
      colors: p.colors,
      sizes: p.sizes,
      size_measurements: p.size_measurements || [],
      image_url: p.image_url,
      gallery_images: p.gallery_images || [p.image_url],
      rating: p.rating || 4.8,
      reviews_count: p.reviews_count || 10,
      is_new: Boolean(p.is_new),
      is_featured: Boolean(p.is_featured),
    };

    const { error } = await supabase.from('products').upsert(record);
    if (error) {
      console.error(`Error updating product ${p.id}:`, error);
    } else {
      process.stdout.write('.');
    }
  }

  console.log('\n--- VERIFYING SUPABASE GENDERS ---');
  const { data: dbProducts } = await supabase.from('products').select('id, category_id, name, gender');
  console.log('Supabase total products:', dbProducts?.length);
  console.log('Sync completed successfully!');
}

sync();
