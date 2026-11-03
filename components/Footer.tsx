// components/Footer.tsx
'use client';

import React from 'react';
import { ModalType } from './InformationModals';
import FooterNewsletter from './footer/FooterNewsletter';
import FooterGuarantees from './footer/FooterGuarantees';
import FooterLinks from './footer/FooterLinks';
import FooterTrustBadges from './footer/FooterTrustBadges';

interface FooterProps {
  onOpenInfoModal?: (type: ModalType) => void;
  onOpenSizeChart?: () => void;
  onSelectCategory?: (categorySlug: string) => void;
}

export default function Footer({ onOpenInfoModal, onOpenSizeChart, onSelectCategory }: FooterProps) {
  return (
    <footer className="bg-[#111111] text-white border-t border-zinc-800">
      {/* LAYER 1: Newsletter Voucher Rp 50.000 Banner */}
      <FooterNewsletter />

      {/* LAYER 2: 4 Kartu Value Garansi & Layanan Konsumen */}
      <FooterGuarantees onOpenInfoModal={onOpenInfoModal} />

      {/* LAYER 3: Main Footer Links / Mobile Accordion Sitemap */}
      <FooterLinks 
        onOpenInfoModal={onOpenInfoModal} 
        onOpenSizeChart={onOpenSizeChart} 
        onSelectCategory={onSelectCategory} 
      />

      {/* LAYER 4 & 5: Trust Badges & Bottom Legal Bar */}
      <FooterTrustBadges />
    </footer>
  );
}
