// components/Navbar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Heart, Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { GENDER_TABS, NavbarProps } from '@/lib/constants/navigation';
import AnnouncementTicker from './navbar/AnnouncementTicker';
import UserAccountMenu from './navbar/UserAccountMenu';
import SideNavDrawer from './navbar/SideNavDrawer';
import MobileSearchBar from './navbar/MobileSearchBar';
import VisualMegaMenu from './navbar/VisualMegaMenu';
import DepartmentTabs from './navbar/DepartmentTabs';

export default function Navbar({
  selectedCategory, onSelectCategory,
  selectedGender, onSelectGender,
  searchQuery, onSearchChange,
  cartCount, onOpenCart,
  wishlistCount, onOpenWishlist,
  onOpenInfoModal, onSelectSort,
}: NavbarProps) {
  const { isAdmin } = useAuth();
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [drawerGender, setDrawerGender] = useState<'pria' | 'wanita'>('pria');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isVisualMegaMenuOpen, setIsVisualMegaMenuOpen] = useState(false);
  const [visualMenuGender, setVisualMenuGender] = useState<'wanita' | 'pria'>('wanita');

  useEffect(() => {
    if (selectedGender === 'wanita') setDrawerGender('wanita');
    else if (selectedGender === 'pria') setDrawerGender('pria');
  }, [selectedGender]);

  const handleSubCategoryClick = (gender: string, categorySlug: string, keyword?: string, sortByParam?: string) => {
    onSelectGender(gender);
    onSelectCategory(categorySlug);
    if (keyword !== undefined) onSearchChange(keyword);
    if (sortByParam && onSelectSort) onSelectSort(sortByParam);
    setSideDrawerOpen(false);
    setTimeout(() => {
      const el = document.getElementById(categorySlug === 'sale' ? 'limited-offer' : 'katalog') || document.getElementById('katalog');
      el?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleGenderTabClick = (tabValue: string) => {
    if (tabValue === 'wanita' || tabValue === 'pria') {
      setVisualMenuGender(tabValue as 'wanita' | 'pria');
      setIsVisualMegaMenuOpen(true);
      onSelectGender(tabValue);
    } else if (tabValue === 'all') {
      setIsVisualMegaMenuOpen(false);
      onSelectGender('all');
      onSelectCategory('all');
      setTimeout(() => document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth' }), 50);
    } else if (tabValue === 'sale') {
      setIsVisualMegaMenuOpen(false);
      onSelectCategory('sale');
      setTimeout(() => (document.getElementById('limited-offer') || document.getElementById('katalog'))?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  };

  return (
    <>
      <AnnouncementTicker onOpenInfoModal={onOpenInfoModal} isAdmin={isAdmin} />

      <header className="bg-white border-b border-zinc-200 sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4 lg:gap-6 relative">
            
            {/* Left: Dual Box Logo & Department Tabs */}
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 h-full">
              <Link href="/" className="flex items-center gap-1.5 group shrink-0" title="UrbanStyle LifeWear">
                <div className="flex items-center gap-1">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#E60012] text-white font-black text-[11px] sm:text-xs tracking-tighter flex items-center justify-center shadow-xs rounded-none">
                    US
                  </div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#E60012] text-white font-black text-[8px] sm:text-[9px] tracking-tight flex items-center justify-center leading-none text-center shadow-xs font-sans rounded-none">
                    アー<br />バン
                  </div>
                </div>
                <div className="flex flex-col ml-1 hidden sm:flex">
                  <span className="font-black text-sm sm:text-base tracking-tight uppercase text-zinc-950 group-hover:text-[#E60012] transition-colors leading-tight">
                    UrbanStyle
                  </span>
                  <span className="text-[7px] sm:text-[8px] font-bold tracking-[0.25em] uppercase text-zinc-400 -mt-0.5">
                    LifeWear Tokyo
                  </span>
                </div>
              </Link>

              {/* Department/Gender Tabs (SEMUA, WANITA, PRIA, LIMITED OFFER) */}
              <DepartmentTabs
                selectedCategory={selectedCategory}
                selectedGender={selectedGender}
                onTabClick={handleGenderTabClick}
                variant="desktop"
              />
            </div>

            {/* Right: Search Capsule + Wishlist + Member + Cart + Menu */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* Desktop Search Capsule */}
              <div className="relative hidden lg:block w-44 lg:w-52 xl:w-60 transition-all duration-300">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={13} />
                <input
                  type="text"
                  placeholder="Apa yang Anda cari?"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 text-xs font-medium rounded-full bg-zinc-100 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
                    title="Hapus pencarian"
                  >
                    <X size={11} />
                  </button>
                )}
              </div>

              {/* Mobile Search Toggle */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="lg:hidden p-1.5 text-zinc-700 hover:text-black transition-colors bg-transparent cursor-pointer"
                title="Cari produk"
                aria-label="Cari produk"
              >
                <Search size={18} />
              </button>

              {/* Wishlist Heart Icon */}
              <button
                type="button"
                onClick={onOpenWishlist}
                className="p-1.5 text-zinc-900 hover:text-[#E60012] transition-colors relative bg-transparent cursor-pointer"
                title="Daftar Favorit"
                aria-label="Daftar Favorit"
              >
                <Heart
                  size={18}
                  fill={wishlistCount > 0 ? '#E60012' : 'none'}
                  className={wishlistCount > 0 ? 'text-[#E60012]' : 'text-zinc-900'}
                />
                {wishlistCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-[#E60012] text-white text-[8px] font-black flex items-center justify-center rounded-full tabular-nums">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Member Account Menu */}
              <UserAccountMenu />

              {/* Cart ShoppingBag Icon */}
              <button
                type="button"
                onClick={onOpenCart}
                className="p-1.5 text-zinc-900 hover:text-black transition-colors relative flex items-center gap-1 bg-transparent cursor-pointer"
                title="Keranjang Belanja"
                aria-label="Keranjang Belanja"
              >
                <ShoppingBag size={18} className="text-zinc-900" />
                {cartCount > 0 && (
                  <span className="w-3.5 h-3.5 bg-[#E60012] text-white text-[8px] font-black flex items-center justify-center rounded-none tabular-nums">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Uniqlo Mega Menu Hamburger (#menuIcon on the far right) */}
              <button
                id="menuIcon"
                type="button"
                onClick={() => {
                  setVisualMenuGender(selectedGender === 'wanita' ? 'wanita' : 'pria');
                  setIsVisualMegaMenuOpen(true);
                }}
                className="p-1.5 sm:px-2 sm:py-1 flex items-center gap-1 text-zinc-900 hover:text-[#E60012] border border-transparent hover:border-zinc-200 transition-colors cursor-pointer"
                title="Buka Menu Kategori Visual Uniqlo"
                aria-label="Buka Menu"
              >
                <Menu size={18} />
                <span className="text-[10px] font-black tracking-widest uppercase hidden sm:inline">MENU</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Sub-Header Department Tabs */}
        <DepartmentTabs
          selectedCategory={selectedCategory}
          selectedGender={selectedGender}
          onTabClick={handleGenderTabClick}
          variant="mobile"
        />

        {/* Mobile Search Dropdown Bar */}
        {isSearchOpen && (
          <MobileSearchBar
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onClose={() => setIsSearchOpen(false)}
          />
        )}
      </header>

      {/* Visual Mega Menu Overlay (1:1 Uniqlo Category Navigation Grid) */}
      <VisualMegaMenu
        isOpen={isVisualMegaMenuOpen}
        onClose={() => setIsVisualMegaMenuOpen(false)}
        activeGender={visualMenuGender}
        onSelectGender={onSelectGender}
        onSelectCategory={onSelectCategory}
        onSearchChange={onSearchChange}
      />

      {/* Side Navigation Drawer Overlay (Sitemap Directory) */}
      <SideNavDrawer
        isOpen={sideDrawerOpen}
        onClose={() => setSideDrawerOpen(false)}
        drawerGender={drawerGender}
        onSelectDrawerGender={setDrawerGender}
        onSubCategoryClick={handleSubCategoryClick}
        onOpenInfoModal={onOpenInfoModal}
      />
    </>
  );
}
