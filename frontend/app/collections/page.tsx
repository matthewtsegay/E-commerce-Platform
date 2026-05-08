import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Collection } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Box } from 'lucide-react';
import Image from 'next/image';
import { serverApiFetch } from '@/lib/api-server';

export const metadata = {
  title: 'Collections | Nebi Store',
  description: 'Explore our curated collections of premium fashion and lifestyle products.',
};

export default async function CollectionsPage() {
  const result = await serverApiFetch<Collection>('/store/collections/', { revalidate: 1800 }); // 30 min cache

  const collections = result.error ? [] : (result.data as Collection[]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-2xl mb-16">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none mb-6">
            Our <span className="text-primary italic">Collections</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium">
            Explore our curated selection of high-performance gear and urban essentials, 
            organized to help you find exactly what moves you.
          </p>
        </div>

        {result.error ? (
          <div className="text-center py-24">
            <div className="text-red-500 mb-4">⚠️ Unable to load collections</div>
            <p className="text-muted-foreground">Please try again later.</p>
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-24">
            <Box className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
            <h2 className="text-2xl font-bold mb-2">No Collections Available</h2>
            <p className="text-muted-foreground">Check back soon for new collections.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {collections.map((collection, index) => (
              <Link
                key={collection.id}
                href={`/products?collection_id=${collection.id}`}
                className="group relative overflow-hidden rounded-[40px] shadow-2xl h-[400px] transition-transform duration-300 hover:scale-[1.02]"
              >
                <Image
                  fill
                  src={`https://picsum.photos/seed/collection${collection.id}/800/600`}
                  alt={collection.title}
                  className="object-cover w-full h-full"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8">
                  <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">
                    {collection.title}
                  </h3>
                  <p className="text-white/80 mb-4 line-clamp-2">
                    {collection.products_count} premium products
                  </p>
                  <div className="flex items-center gap-2 text-primary font-bold">
                    SHOP NOW <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
