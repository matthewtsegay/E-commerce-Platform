'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Collection } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Box, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { api } from '@/lib/api-client';
import { extractList, getApiErrorMessage } from '@/lib/api-helpers';
import { toast } from 'sonner';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/store/collections/');
        setCollections(extractList(response.data));
      } catch (error: any) {
        setCollections([]);
        toast.error(getApiErrorMessage(error, 'Unable to load collections right now.'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollections();
  }, []);
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

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-lg font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Loading Collections...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {collections.map((collection, index) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={`/products?collection_id=${collection.id}`} className="group">
                  <Card className="border-none shadow-2xl rounded-[40px] overflow-hidden bg-white/50 backdrop-blur-sm h-[400px] relative">
                    <Image 
                      src={`https://picsum.photos/seed/collection${collection.id}/1200/800`} 
                      alt={collection.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-70"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <CardContent className="absolute bottom-0 left-0 p-10 w-full text-white">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
                          <Box className="h-4 w-4" />
                          {collection.products_count} ITEMS
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 italic leading-none">{collection.title}</h2>
                        <div className="flex items-center gap-3 font-bold group-hover:translate-x-2 transition-transform">
                          EXPLORE COLLECTION
                          <ArrowRight className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
