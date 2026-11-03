// app/page.tsx
'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import LookbookSlider from '@/components/LookbookSlider';
import CategoryBubbles from '@/components/CategoryBubbles';
import LifeWearStorySection from '@/components/LifeWearStorySection';
import MemberLoyaltyBanner from '@/components/MemberLoyaltyBanner';
import EditorialSections from '@/components/home/EditorialSections';
import CatalogHeader from '@/components/home/CatalogHeader';
import FilterSortBar from '@/components/home/FilterSortBar';
import ProductGrid from '@/components/home/ProductGrid';
import HomeModalsAndDrawers from '@/components/home/HomeModalsAndDrawers';
import Footer from '@/components/Footer';
import { useHomeStore } from '@/lib/hooks/useHomeStore';
import { useAuth } from '@/lib/auth-context';

function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, openAuthModal } = useAuth();
  const s = useHomeStore();

  useEffect(() => {
    if (searchParams.get('login') === 'required' || searchParams.get('login') === 'true') {
      openAuthModal();
    }
  }, [searchParams, openAuthModal]);

  const scrollToCatalog = () => {
    document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-white text-zinc-900 flex flex-col justify-between selection:bg-[#E60012] selection:text-white">
      {/* 1. Global Navigation Bar */}
      <Navbar
        categories={s.categories}
        selectedCategory={s.selectedCategory}
        onSelectCategory={s.setSelectedCategory}
        selectedGender={s.selectedGender}
        onSelectGender={s.setSelectedGender}
        searchQuery={s.searchQuery}
        onSearchChange={s.setSearchQuery}
        cartCount={s.totalCartCount}
        onOpenCart={() => s.setIsCartOpen(true)}
        wishlistCount={s.wishlist.length}
        onOpenWishlist={() => s.setIsWishlistOpen(true)}
        onOpenInfoModal={s.setActiveInfoModal}
        onSelectSort={(sort) => {
          s.setSortBy(sort);
          scrollToCatalog();
        }}
      />

      <main className="flex-1 pb-24 md:pb-12">
        {/* 2. Hero & Editorial Sections */}
        {!s.searchQuery && (
          <>
            <div className="relative z-0">
              <LookbookSlider
                onSelectCategory={(slug) => {
                  s.setSelectedCategory(slug);
                  scrollToCatalog();
                }}
              />
            </div>

            <CategoryBubbles
              selectedCategory={s.selectedCategory}
              onSelectCategory={(slug) => {
                if (slug === 'sale') {
                  if (s.selectedCategory !== 'all') s.setSelectedCategory('all');
                  setTimeout(() => {
                    document.getElementById('limited-offer')?.scrollIntoView({ behavior: 'smooth' });
                  }, 50);
                } else {
                  s.setSelectedCategory(slug);
                  scrollToCatalog();
                }
              }}
              onScrollToCatalog={scrollToCatalog}
            />

            {s.selectedCategory === 'all' && (
              <>
                <EditorialSections
                  limitedOfferProducts={s.limitedOfferProducts}
                  bestOfLifeWearProducts={s.bestOfLifeWearProducts}
                  wishlist={s.wishlist}
                  onOpenDetail={s.setSelectedProductForDetail}
                  onAddToCart={(p, size, color) => s.handleAddToCart(p, size, color, 1, false)}
                  onToggleWishlist={s.handleToggleWishlist}
                  onSelectCategory={(slug) => {
                    s.setSelectedCategory(slug);
                    scrollToCatalog();
                  }}
                  onSortPopular={() => {
                    s.setSortBy('popular');
                    scrollToCatalog();
                  }}
                />

                <LifeWearStorySection
                  onExploreClick={scrollToCatalog}
                  onSelectCategory={(slug) => {
                    s.setSelectedCategory(slug);
                    scrollToCatalog();
                  }}
                />

                <MemberLoyaltyBanner user={user} onOpenAuthModal={openAuthModal} />
              </>
            )}
          </>
        )}

        {/* 3. Catalog Section */}
        <section id="katalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
          <CatalogHeader
            selectedGender={s.selectedGender}
            selectedCategory={s.selectedCategory}
            categoryDisplayName={s.getCategoryDisplayName(s.selectedCategory)}
          />

          <FilterSortBar
            totalCount={s.products.length}
            inStockOnly={s.inStockOnly}
            onToggleInStock={s.setInStockOnly}
            sortBy={s.sortBy}
            onSortChange={s.setSortBy}
            selectedGender={s.selectedGender}
            onClearGender={() => s.setSelectedGender('all')}
            selectedCategory={s.selectedCategory}
            categoryDisplayName={s.getCategoryDisplayName(s.selectedCategory)}
            onClearCategory={() => s.setSelectedCategory('all')}
            onSelectCategory={s.setSelectedCategory}
            searchQuery={s.searchQuery}
            onClearSearch={() => s.setSearchQuery('')}
            onResetAllFilters={() => {
              s.setSelectedGender('all');
              s.setSelectedCategory('all');
              s.setInStockOnly(false);
              s.setSearchQuery('');
            }}
            gridDensity={s.gridDensity}
            onToggleGridDensity={s.setGridDensity}
          />

          {/* Uniqlo LifeWear Grid Whitespace: gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12 */}
          <ProductGrid
            products={s.products}
            visibleCount={s.visibleCount}
            isLoading={s.isLoading}
            wishlist={s.wishlist}
            onOpenDetail={s.setSelectedProductForDetail}
            onAddToCart={(p, size, color) => s.handleAddToCart(p, size, color, 1, false)}
            onToggleWishlist={s.handleToggleWishlist}
            onLoadMore={() => s.setVisibleCount((prev) => Math.min(s.products.length, prev + 8))}
            onResetFilters={() => {
              s.setSelectedCategory('all');
              s.setSelectedGender('all');
              s.setSearchQuery('');
              s.setInStockOnly(false);
            }}
            gridDensity={s.gridDensity}
          />
        </section>
      </main>

      {/* 4. Footer */}
      <Footer
        onOpenInfoModal={s.setActiveInfoModal}
        onOpenSizeChart={() => s.setIsGlobalSizeChartOpen(true)}
        onSelectCategory={(slug) => {
          s.setSelectedCategory(slug);
          scrollToCatalog();
        }}
      />

      {/* 5. Drawers & Modals */}
      <HomeModalsAndDrawers
        store={s}
        user={user}
        openAuthModal={openAuthModal}
        router={router}
        scrollToCatalog={scrollToCatalog}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <HomePageContent />
    </Suspense>
  );
}
