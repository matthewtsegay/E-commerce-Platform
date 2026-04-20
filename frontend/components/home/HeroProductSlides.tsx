'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/types';
import { api } from '@/lib/api-client';
import { extractList } from '@/lib/api-helpers';
import { formatEtb } from '@/lib/format-currency';
import { getEffectiveUnitPrice } from '@/lib/product-price';

const SLIDE_INTERVAL_MS = 5500;

export default function HeroProductSlides() {
  const [products, setProducts] = useState<Product[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await api.get('/store/products/');
        const list = extractList<Product>(response.data).slice(0, 8);
        if (!cancelled) {
          setProducts(list);
          setIndex(0);
        }
      } catch {
        if (!cancelled) {
          setProducts([]);
          setError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const go = useCallback(
    (delta: number) => {
      if (products.length === 0) return;
      setIndex((i) => (i + delta + products.length) % products.length);
    },
    [products.length]
  );

  useEffect(() => {
    if (products.length <= 1) return;
    const id = window.setInterval(() => go(1), SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [products.length, go]);

  if (loading) {
    return (
      <div className="flex h-[400px] md:h-[560px] w-full items-center justify-center rounded-[32px] border bg-white/50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
        <span className="sr-only">Loading featured products</span>
      </div>
    );
  }

  if (error || products.length === 0) {
    return (
      <div className="flex h-[400px] md:h-[560px] w-full flex-col items-center justify-center gap-4 rounded-[32px] border bg-muted/30 p-8 text-center">
        <p className="font-bold text-muted-foreground">Featured products will appear when the store is connected.</p>
        <Button render={<Link href="/products" />}>Browse catalog</Button>
      </div>
    );
  }

  const product = products[index];
  const imageUrl = product.images?.[0]?.image;

  return (
    <div className="relative w-full overflow-hidden rounded-[32px] border bg-white shadow-xl">
      <div className="relative aspect-[4/3] md:aspect-[16/10] w-full bg-cream">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority={index === 0}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-full min-h-[280px] items-center justify-center text-muted-foreground">No image</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
          <p className="text-xs font-black uppercase tracking-widest text-primary">Featured</p>
          <h2 className="mt-2 text-2xl md:text-4xl font-black uppercase tracking-tighter leading-tight line-clamp-2">
            {product.title}
          </h2>
          <p className="mt-2 text-xl font-black text-primary">
            {formatEtb(getEffectiveUnitPrice(product))}
          </p>
          <Button
            className="mt-4 h-12 rounded-2xl font-black uppercase"
            render={<Link href={`/products/${product.id}`} />}
          >
            View product
          </Button>
        </div>
      </div>

      {products.length > 1 && (
        <>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute left-3 top-1/2 z-10 h-11 w-11 -translate-y-1/2 rounded-full border bg-white/90 shadow-md"
            onClick={() => go(-1)}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute right-3 top-1/2 z-10 h-11 w-11 -translate-y-1/2 rounded-full border bg-white/90 shadow-md"
            onClick={() => go(1)}
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
          <div className="flex justify-center gap-2 py-4">
            {products.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2.5 rounded-full transition-all ${i === index ? 'w-8 bg-primary' : 'w-2.5 bg-muted-foreground/30'}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
