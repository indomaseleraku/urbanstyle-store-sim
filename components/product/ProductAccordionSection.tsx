'use client';

import React, { useState, useEffect } from 'react';
import { Product, Review } from '@/lib/types';
import { ChevronDown, ChevronUp, Star, MessageSquarePlus } from 'lucide-react';
import { dataStore } from '@/lib/store';

interface ProductAccordionSectionProps {
  product: Product;
  selectedSize: string;
  onReviewAdded?: () => void;
}

export const ProductAccordionSection: React.FC<ProductAccordionSectionProps> = ({
  product,
  selectedSize,
  onReviewAdded,
}) => {
  const [openAccordion, setOpenAccordion] = useState<string | null>('desc');
  const [reviews, setReviews] = useState<Review[]>(product.reviews || []);
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [fitRating, setFitRating] = useState<'Agak Sempit' | 'Pas Sesuai Ukuran' | 'Agak Longgar'>('Pas Sesuai Ukuran');
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    setReviews(product.reviews || []);
  }, [product.id, product.reviews]);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !newComment.trim()) return;
    setReviewError('');
    setIsSubmittingReview(true);

    try {
      const newRev = await dataStore.addReview(product.id, {
        reviewer_name: reviewerName.trim(),
        rating: newRating,
        size_purchased: selectedSize,
        fit_rating: fitRating,
        comment: newComment.trim(),
      });

      setReviews((prev) => [newRev, ...prev.filter((r) => r.id !== newRev.id)]);
      onReviewAdded?.();
      setReviewSubmitted(true);
      setTimeout(() => {
        setIsAddingReview(false);
        setReviewSubmitted(false);
        setReviewerName('');
        setNewComment('');
        setFitRating('Pas Sesuai Ukuran');
      }, 1200);
    } catch (err: unknown) {
      setReviewError(err instanceof Error ? err.message : 'Gagal mengirim ulasan.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="pt-3 border-t border-zinc-200 divide-y divide-zinc-200 text-xs">
      {/* Accordion 1: Deskripsi */}
      <div>
        <button
          onClick={() => setOpenAccordion(openAccordion === 'desc' ? null : 'desc')}
          className="w-full py-2.5 flex items-center justify-between text-left font-bold uppercase text-zinc-900 cursor-pointer"
        >
          <span>Deskripsi & Siluet LifeWear</span>
          {openAccordion === 'desc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {openAccordion === 'desc' && (
          <div className="pb-3 text-zinc-600 leading-relaxed text-[11px] space-y-2">
            <p>{product.description}</p>
          </div>
        )}
      </div>

      {/* Accordion 2: Bahan & Spesifikasi Tekstil */}
      <div>
        <button
          onClick={() => setOpenAccordion(openAccordion === 'fabric' ? null : 'fabric')}
          className="w-full py-2.5 flex items-center justify-between text-left font-bold uppercase text-zinc-900 cursor-pointer"
        >
          <span>Spesifikasi Bahan & Teknologi</span>
          {openAccordion === 'fabric' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {openAccordion === 'fabric' && (
          <div className="pb-3 text-zinc-600 leading-relaxed text-[11px] space-y-1">
            <p>
              <strong>Komposisi:</strong> {product.fabric_details}
            </p>
          </div>
        )}
      </div>

      {/* Accordion 3: Petunjuk Perawatan */}
      <div>
        <button
          onClick={() => setOpenAccordion(openAccordion === 'care' ? null : 'care')}
          className="w-full py-2.5 flex items-center justify-between text-left font-bold uppercase text-zinc-900 cursor-pointer"
        >
          <span>Petunjuk Pencucian & Perawatan</span>
          {openAccordion === 'care' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {openAccordion === 'care' && (
          <div className="pb-3 text-zinc-600 leading-relaxed text-[11px]">
            <p>{product.care_instructions}</p>
          </div>
        )}
      </div>

      {/* Accordion 4: Customer Reviews */}
      <div>
        <button
          onClick={() => setOpenAccordion(openAccordion === 'reviews' ? null : 'reviews')}
          className="w-full py-2.5 flex items-center justify-between text-left font-bold uppercase text-zinc-900 cursor-pointer"
        >
          <span>Ulasan Konsumen ({reviews.length})</span>
          {openAccordion === 'reviews' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {openAccordion === 'reviews' && (
          <div className="pb-3 space-y-3">
            {/* Review Items */}
            {reviews.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-2.5 bg-zinc-50 border border-zinc-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-900 text-[11px]">{rev.reviewer_name}</span>
                      <span className="text-[10px] text-zinc-400">{rev.created_at}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={11} fill="currentColor" />
                      ))}
                      <span className="text-[10px] text-zinc-500 ml-1">
                        Ukuran {rev.size_purchased} ({rev.fit_rating})
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-600">{rev.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-zinc-400">Belum ada ulasan untuk produk ini.</p>
            )}

            {/* Add Review Form */}
            {!isAddingReview ? (
              <button
                onClick={() => setIsAddingReview(true)}
                className="w-full py-2 border border-zinc-300 hover:border-zinc-950 text-xs font-bold uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageSquarePlus size={14} />
                <span>Tulis Ulasan Produk</span>
              </button>
            ) : (
              <form onSubmit={handleAddReview} className="p-3 bg-zinc-50 border border-zinc-300 space-y-2">
                <p className="font-bold text-xs uppercase text-zinc-900">Ulasan Pembeli Baru</p>
                {reviewError && (
                  <p className="p-2 bg-red-50 border border-red-200 text-red-700 text-[11px] font-semibold">
                    {reviewError}
                  </p>
                )}
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap Anda"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full p-2 border border-zinc-300 text-xs bg-white focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <select
                    value={newRating}
                    onChange={(e) => setNewRating(Number(e.target.value))}
                    className="p-1.5 border border-zinc-300 bg-white"
                  >
                    <option value={5}>5 Bintang</option>
                    <option value={4}>4 Bintang</option>
                    <option value={3}>3 Bintang</option>
                    <option value={2}>2 Bintang</option>
                    <option value={1}>1 Bintang</option>
                  </select>
                  <select
                    value={fitRating}
                    onChange={(e) => setFitRating(e.target.value as 'Agak Sempit' | 'Pas Sesuai Ukuran' | 'Agak Longgar')}
                    className="p-1.5 border border-zinc-300 bg-white"
                  >
                    <option value="Pas Sesuai Ukuran">Pas Sesuai Ukuran</option>
                    <option value="Agak Sempit">Agak Sempit</option>
                    <option value="Agak Longgar">Agak Longgar</option>
                  </select>
                </div>
                <textarea
                  required
                  rows={2}
                  placeholder="Tulis ulasan tentang bahan, kenyamanan, atau ukuran..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-2 border border-zinc-300 text-xs bg-white focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-4 py-1.5 bg-zinc-900 text-white text-xs font-bold uppercase hover:bg-[#E60012] cursor-pointer disabled:opacity-50"
                  >
                    {reviewSubmitted ? 'Tersimpan!' : isSubmittingReview ? 'Mengirim...' : 'Kirim Ulasan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingReview(false)}
                    className="px-3 py-1.5 text-zinc-500 text-xs hover:text-zinc-900 cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
