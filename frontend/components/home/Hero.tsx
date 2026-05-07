'use client';

import React from 'react';
import HeroProductSlides from './HeroProductSlides';
import { Product } from '@/lib/types';

export default function Hero({ initialProducts = [] }: { initialProducts?: Product[] }) {
  return (
    <section className="relative overflow-hidden bg-background pt-16 md:pt-24 lg:pt-32 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <HeroProductSlides products={initialProducts} />
        </div>
      </div>
    </section>
  );
}
