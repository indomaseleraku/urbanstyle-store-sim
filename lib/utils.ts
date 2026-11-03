// lib/utils.ts
// Helper Utilitas Kinerja & Optimasi Aset UrbanStyle Store

/**
 * Mengoptimalkan URL gambar Unsplash ke resolusi yang tepat,
 * kompresi ramah peramban, dan format modern WebP (mengurangi ukuran berkas hingga 95%).
 */
export function getOptimizedImageUrl(url?: string, width: number = 600, quality: number = 75): string {
  if (!url) return '';
  if (url.includes('images.unsplash.com')) {
    const base = url.split('?')[0];
    return `${base}?auto=format&fit=crop&w=${width}&q=${quality}&fm=webp`;
  }
  return url;
}
