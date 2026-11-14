'use client';

import React, { useState, useEffect } from 'react';
import { Product, Review } from '@/lib/types';
import { ChevronDown, ChevronUp, Ruler, Star, MessageSquarePlus } from 'lucide-react';
import { dataStore } from '@/lib/store';

interface ProductPageAccordionsProps {
  product: Product;
  selectedSize: string;
  onReviewAdded?: () => void;
}

export const ProductPageAccordions: React.FC<ProductPageAccordionsProps> = ({
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

  const totalReviews = reviews.length;
  const smallCount = reviews.filter((r) => r.fit_rating === 'Agak Sempit').length;
  const largeCount = reviews.filter((r) => r.fit_rating === 'Agak Longgar').length;
  const smallPct = totalReviews > 0 ? Math.round((smallCount / totalReviews) * 100) : 0;
  const largePct = totalReviews > 0 ? Math.round((largeCount / totalReviews) * 100) : 0;
  const fitPct = totalReviews > 0 ? Math.max(0, 100 - smallPct - largePct) : 0;
  const dotLeftPct = totalReviews > 0 ? Math.round((smallPct * 15 + fitPct * 50 + largePct * 85) / 100) : 50;

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
    <div className="pt-2 divide-y divide-zinc-200 text-xs">
      <div>
        <button
          type="button"
          onClick={() => setOpenAccordion(openAccordion === 'desc' ? null : 'desc')}
          className="w-full py-3 flex items-center justify-between text-left font-bold uppercase text-zinc-900 cursor-pointer"
        >
          <span>Deskripsi & Siluet LifeWear</span>
          {openAccordion === 'desc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {openAccordion === 'desc' && (
          <div className="pb-4 text-zinc-600 space-y-2 leading-relaxed">
            <p>{product.description}</p>
            <p className="text-[11px] text-zinc-500">
              Potongan presisi khas Japanese minimalism yang mengedepankan siluet bersih, fleksibel digunakan baik dalam suasana kasual kampus maupun profesional santai.
            </p>
          </div>
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={() => setOpenAccordion(openAccordion === 'fabric' ? null : 'fabric')}
          className="w-full py-3 flex items-center justify-between text-left font-bold uppercase text-zinc-900 cursor-pointer"
        >
          <span>Material & Spesifikasi Kain</span>
          {openAccordion === 'fabric' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {openAccordion === 'fabric' && (
          <div className="pb-4 text-zinc-600 space-y-2 leading-relaxed">
            <p>
              <strong className="text-zinc-900">Komposisi:</strong> {product.fabric_details || '100% Cotton Premium LifeWear Texture'}
            </p>
            <p>
              <strong className="text-zinc-900">Petunjuk Perawatan:</strong> {product.care_instructions || 'Cuci mesin dengan air dingin putaran lembut. Jangan gunakan pemutih klorin.'}
            </p>
          </div>
        )}
      </div>

      {/* Reviews & Fit Rating Bar */}
      <div>
        <button
          type="button"
          onClick={() => setOpenAccordion(openAccordion === 'reviews' ? null : 'reviews')}
          className="w-full py-3 flex items-center justify-between text-left font-bold uppercase text-zinc-900 cursor-pointer"
        >
          <span>Ulasan Pembeli ({reviews.length})</span>
          {openAccordion === 'reviews' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {openAccordion === 'reviews' && (
          <div className="pb-4 space-y-4">
            {/* Uniqlo Fit Rating Bar */}
            <div className="p-4 bg-zinc-50 border border-zinc-200 space-y-2 rounded-none">
              <div className="flex items-center justify-between text-xs flex-wrap gap-1">
                <span className="font-bold uppercase text-zinc-900 flex items-center gap-1.5">
                  <Ruler size={14} className="text-zinc-700" />
                  <span>Tingkat Kecocokan Ukuran (Fit Rating)</span>
                </span>
                <span className="font-bold text-[#E60012] text-[11px] font-mono">
                  {totalReviews > 0
                    ? `${fitPct}% Pelanggan: Pas Sesuai Ukuran (${totalReviews} Ulasan)`
                    : 'Belum ada data ulasan untuk produk ini'}
                </span>
              </div>

              {/* Visual Meter Bar */}
              <div className="relative pt-3 pb-1">
                <div className="h-2 w-full bg-zinc-200 rounded-none relative">
                  <div className="absolute top-0 bottom-0 bg-[#111111] rounded-none" style={{ left: '35%', width: '30%' }} />
                  <div className="absolute -top-1 w-4 h-4 bg-[#E60012] border-2 border-white rounded-none shadow-sm -ml-2" style={{ left: `${dotLeftPct}%` }} />
                </div>

                <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-wider pt-2">
                  <span>Agak Sempit ({smallPct}%)</span>
                  <span className="text-zinc-900 font-black">Pas Sesuai Ukuran ({fitPct}%)</span>
                  <span>Agak Longgar ({largePct}%)</span>
                </div>
              </div>
            </div>

            {/* Review List */}
            {reviews.length > 0 ? (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {reviews.map((r) => (
                  <div key={r.id} className="p-3 bg-zinc-50 border border-zinc-200 space-y-1 rounded-none">
                    <div className="flex justify-between">
                      <span className="font-bold text-zinc-900 text-xs">{r.reviewer_name}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">{r.created_at}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(r.rating)].map((_, i) => (
                        <Star key={i} size={11} fill="currentColor" />
                      ))}
                      <span className="text-[10px] text-zinc-500 ml-1">
                        Ukuran {r.size_purchased} ({r.fit_rating})
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-600">{r.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-zinc-400">Belum ada ulasan untuk busana ini.</p>
            )}

            {!isAddingReview ? (
              <button
                type="button"
                onClick={() => setIsAddingReview(true)}
                className="w-full py-2.5 border border-zinc-300 hover:border-zinc-950 text-xs font-bold uppercase transition-colors flex items-center justify-center gap-1.5 rounded-none cursor-pointer"
              >
                <MessageSquarePlus size={14} />
                <span>Tulis Ulasan Pembeli</span>
              </button>
            ) : (
              <form onSubmit={handleAddReview} className="p-3 bg-zinc-50 border border-zinc-300 space-y-2 rounded-none">
                <p className="font-bold text-xs uppercase text-zinc-900">Ulasan Pembeli Baru</p>
                {reviewError && <p className="p-2 bg-red-50 border border-red-200 text-red-700 text-[11px] font-semibold">{reviewError}</p>}
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap Anda"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full p-2 border border-zinc-300 text-base md:text-xs bg-white focus:outline-none rounded-none"
                />
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <select value={newRating} onChange={(e) => setNewRating(Number(e.target.value))} className="p-1.5 border border-zinc-300 bg-white rounded-none">
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>{n} Bintang</option>
                    ))}
                  </select>
                  <select value={fitRating} onChange={(e) => setFitRating(e.target.value as 'Agak Sempit' | 'Pas Sesuai Ukuran' | 'Agak Longgar')} className="p-1.5 border border-zinc-300 bg-white rounded-none">
                    <option value="Pas Sesuai Ukuran">Pas Sesuai Ukuran</option>
                    <option value="Agak Sempit">Agak Sempit</option>
                    <option value="Agak Longgar">Agak Longgar</option>
                  </select>
                </div>
                <textarea
                  required
                  rows={2}
                  placeholder="Tulis ulasan Anda..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-2 border border-zinc-300 text-base md:text-xs bg-white focus:outline-none rounded-none"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold uppercase hover:bg-[#E60012] rounded-none cursor-pointer disabled:opacity-50"
                  >
                    {reviewSubmitted ? 'Tersimpan!' : isSubmittingReview ? 'Mengirim...' : 'Kirim Ulasan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingReview(false)}
                    className="px-3 py-2 text-zinc-500 text-xs rounded-none cursor-pointer"
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
