'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/types';
import { ChevronDown, ChevronUp, Star, MessageSquarePlus } from 'lucide-react';

interface ProductAccordionSectionProps {
  product: Product;
  selectedSize: string;
}

export const ProductAccordionSection: React.FC<ProductAccordionSectionProps> = ({
  product,
  selectedSize,
}) => {
  const [openAccordion, setOpenAccordion] = useState<string | null>('desc');
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !newComment.trim()) return;

    if (!product.reviews) product.reviews = [];
    product.reviews.unshift({
      id: Date.now(),
      reviewer_name: reviewerName,
      rating: newRating,
      size_purchased: selectedSize,
      fit_rating: 'Pas Sesuai Ukuran',
      comment: newComment,
      created_at: new Date().toISOString().split('T')[0],
    });
    product.reviews_count = product.reviews.length;

    setReviewSubmitted(true);
    setTimeout(() => {
      setIsAddingReview(false);
      setReviewSubmitted(false);
      setReviewerName('');
      setNewComment('');
    }, 1500);
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
          <span>Ulasan Konsumen ({product.reviews?.length || 0})</span>
          {openAccordion === 'reviews' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {openAccordion === 'reviews' && (
          <div className="pb-3 space-y-3">
            {/* Review Items */}
            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {product.reviews.map((rev) => (
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
                <input
                  type="text"
                  required
                  placeholder="Nama Anda (contoh: Kimy Eka)"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full p-2 border border-zinc-300 text-xs bg-white focus:outline-none"
                />
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold">Bintang:</span>
                  <select
                    value={newRating}
                    onChange={(e) => setNewRating(Number(e.target.value))}
                    className="p-1 border border-zinc-300 bg-white"
                  >
                    <option value={5}>5 Bintang (Sangat Puas)</option>
                    <option value={4}>4 Bintang (Puas)</option>
                    <option value={3}>3 Bintang (Cukup)</option>
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
                    className="px-4 py-1.5 bg-zinc-900 text-white text-xs font-bold uppercase hover:bg-[#E60012] cursor-pointer"
                  >
                    {reviewSubmitted ? 'Tersimpan!' : 'Kirim Ulasan'}
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
