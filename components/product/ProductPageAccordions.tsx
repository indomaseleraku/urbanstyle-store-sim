'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/types';
import { ChevronDown, ChevronUp, Ruler, Star, MessageSquarePlus } from 'lucide-react';
import { dataStore } from '@/lib/store';

interface ProductPageAccordionsProps {
  product: Product;
  selectedSize: string;
}

export const ProductPageAccordions: React.FC<ProductPageAccordionsProps> = ({
  product,
  selectedSize,
}) => {
  const [openAccordion, setOpenAccordion] = useState<string | null>('desc');
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !newComment.trim()) return;

    const newRev = await dataStore.addReview(product.id, {
      reviewer_name: reviewerName,
      rating: newRating,
      size_purchased: selectedSize,
      fit_rating: 'Pas Sesuai Ukuran',
      comment: newComment,
    });

    if (!product.reviews) product.reviews = [];
    if (!product.reviews.some((r) => r.id === newRev.id)) {
      product.reviews.unshift(newRev);
    }
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
          <span>Ulasan Pembeli ({product.reviews?.length || 0})</span>
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
                  85% Pelanggan: Pas Sesuai Ukuran (True to Size)
                </span>
              </div>

              {/* Visual Meter Bar */}
              <div className="relative pt-3 pb-1">
                <div className="h-2 w-full bg-zinc-200 rounded-none relative">
                  <div
                    className="absolute top-0 bottom-0 bg-[#111111] rounded-none"
                    style={{ left: '35%', width: '30%' }}
                  />
                  <div
                    className="absolute -top-1 w-4 h-4 bg-[#E60012] border-2 border-white rounded-none shadow-sm -ml-2"
                    style={{ left: '50%' }}
                  />
                </div>

                <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-wider pt-2">
                  <span>Kekecilan (8%)</span>
                  <span className="text-zinc-900 font-black">Pas Sesuai Ukuran (85%)</span>
                  <span>Kebesaran (7%)</span>
                </div>
              </div>
            </div>

            {/* Review List */}
            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {product.reviews.map((r) => (
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
                <input
                  type="text"
                  required
                  placeholder="Nama Anda (contoh: Kimy Eka)"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full p-2 border border-zinc-300 text-base md:text-xs bg-white focus:outline-none rounded-none"
                />
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold">Bintang:</span>
                  <select
                    value={newRating}
                    onChange={(e) => setNewRating(Number(e.target.value))}
                    className="p-1 border border-zinc-300 bg-white rounded-none"
                  >
                    <option value={5}>5 Bintang (Sangat Puas)</option>
                    <option value={4}>4 Bintang (Puas)</option>
                    <option value={3}>3 Bintang (Cukup)</option>
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
                    className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold uppercase hover:bg-[#E60012] rounded-none cursor-pointer"
                  >
                    {reviewSubmitted ? 'Tersimpan!' : 'Kirim Ulasan'}
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
