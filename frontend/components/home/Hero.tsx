'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HeroProductSlides from './HeroProductSlides';
import { motion } from 'motion/react';
import { Product } from '@/lib/types';

export default function Hero({ initialProducts = [] }: { initialProducts?: Product[] }) {
  return (
    <section className="relative overflow-hidden bg-background pt-16 md:pt-24 lg:pt-32">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-bold mb-6">
              <Sparkles className="h-4 w-4" />
              <span>NEW COLLECTION 2026</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-foreground mb-6 uppercase">
              Step Into <br />
              <span className="text-primary italic">The Future</span> <br />
              Of Style.
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-lg mb-10 leading-relaxed">
              Explore our curated selection of high-performance footwear and apparel. 
              Designed for those who lead the way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button size="lg" className="h-16 px-8 text-lg font-bold shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground group" render={<Link href="/products" />}>
                SHOP COLLECTION
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline" className="h-16 px-8 text-lg font-bold border-2" render={<Link href="/about" />}>
                LEARN MORE
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-8">
              <div>
                <dt className="text-3xl font-black text-primary">12k+</dt>
                <dd className="text-sm text-muted-foreground">Happy Clients</dd>
              </div>
              <div>
                <dt className="text-3xl font-black text-primary">500+</dt>
                <dd className="text-sm text-muted-foreground">Exclusive Items</dd>
              </div>
              <div>
                <dt className="text-3xl font-black text-primary">99%</dt>
                <dd className="text-sm text-muted-foreground">Positive Feedback</dd>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/30 blur-[120px] rounded-full -z-10 animate-pulse" />
            <HeroProductSlides products={initialProducts} />

          </motion.div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }} 
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block"
      >
        <div className="w-6 h-10 border-2 border-foreground/20 rounded-full flex justify-center p-1">
          <div className="w-1 h-2 bg-primary rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}
