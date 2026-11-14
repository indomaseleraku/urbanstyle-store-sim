const SKELETON_CARDS = Array.from({ length: 8 }, (_, i) => i);

export default function Loading() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" aria-busy="true" aria-label="Memuat halaman">
      <div className="h-[280px] sm:h-[380px] w-full bg-zinc-100 animate-pulse mb-8" />
      <div className="flex gap-2 mb-6 overflow-hidden">
        {SKELETON_CARDS.slice(0, 6).map((i) => (
          <div key={i} className="h-8 w-24 shrink-0 bg-zinc-100 animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6">
        {SKELETON_CARDS.map((i) => (
          <div key={i} className="space-y-2.5">
            <div className="aspect-[3/4] bg-zinc-100 animate-pulse" />
            <div className="h-3 w-3/4 bg-zinc-100 animate-pulse" />
            <div className="h-3 w-1/3 bg-zinc-100 animate-pulse" />
          </div>
        ))}
      </div>
      <span className="sr-only">Memuat konten UrbanStyle Store</span>
    </main>
  );
}
