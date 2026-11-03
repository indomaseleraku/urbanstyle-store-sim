'use client';

import React from 'react';

export default function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans animate-pulse">
      {/* Top Navbar Placeholder */}
      <div className="h-16 sm:h-20 border-b border-zinc-200 bg-zinc-50/50" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-3 w-16 bg-zinc-200 rounded-none" />
          <span className="text-zinc-300">/</span>
          <div className="h-3 w-24 bg-zinc-200 rounded-none" />
          <span className="text-zinc-300">/</span>
          <div className="h-3 w-36 bg-zinc-200 rounded-none" />
        </div>

        {/* Product Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: 3:4 Aspect Image & Thumbnails */}
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-[3/4] w-full bg-zinc-200 border border-zinc-300 rounded-none relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
            </div>
            <div className="flex items-center gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-20 h-28 bg-zinc-200 border border-zinc-300 rounded-none shrink-0" />
              ))}
            </div>
          </div>

          {/* Right Column: Information & Actions */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3 border-b border-zinc-200 pb-4">
              <div className="h-3 w-28 bg-zinc-200 rounded-none" />
              <div className="h-7 w-3/4 bg-zinc-200 rounded-none" />
              <div className="flex items-center gap-2 pt-1">
                <div className="h-4 w-24 bg-zinc-200 rounded-none" />
                <div className="h-4 w-12 bg-zinc-200 rounded-none" />
              </div>
            </div>

            {/* Price Box */}
            <div className="space-y-2">
              <div className="h-8 w-44 bg-zinc-200 rounded-none" />
              <div className="h-3 w-32 bg-zinc-200 rounded-none" />
            </div>

            {/* Stock pill */}
            <div className="h-8 w-full bg-zinc-100 border border-zinc-200 rounded-none" />

            {/* Color Swatches */}
            <div className="space-y-2 pt-2 border-t border-zinc-200">
              <div className="h-3 w-24 bg-zinc-200 rounded-none" />
              <div className="flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-zinc-200 border border-zinc-300" />
                ))}
              </div>
            </div>

            {/* Size Matrix */}
            <div className="space-y-2 pt-2 border-t border-zinc-200">
              <div className="flex justify-between">
                <div className="h-3 w-20 bg-zinc-200 rounded-none" />
                <div className="h-3 w-28 bg-zinc-200 rounded-none" />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 bg-zinc-200 border border-zinc-300 rounded-none" />
                ))}
              </div>
            </div>

            {/* Dual CTA */}
            <div className="space-y-2 pt-3">
              <div className="h-12 w-full bg-zinc-300 rounded-none" />
              <div className="h-11 w-full bg-zinc-200 border border-zinc-300 rounded-none" />
            </div>

            {/* Value badges */}
            <div className="grid grid-cols-3 gap-2 py-3 border-y border-zinc-200">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-6 bg-zinc-100 rounded-none" />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
