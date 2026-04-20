'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/lib/types';
import { motion } from 'motion/react';
import { useCart } from '@/lib/store';
import { toast } from 'sonner';
import { formatEtb } from '@/lib/format-currency';
import { getEffectiveUnitPrice } from '@/lib/product-price';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCart((state) => state.addItem);

  const handleAddToCart = () => {
    addItem(product, 1);
    toast.success('Added to cart');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -5 }}
    >
      <Card className="overflow-hidden h-full flex flex-col border-none shadow-lg bg-white/50 backdrop-blur-sm group">
        <div className="relative aspect-square overflow-hidden bg-cream">
          {product.images?.[0] ? (
            <Image
              src={product.images[0].image}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
              No Image
            </div>
          )}
          
          {product.is_on_sale && (
            <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
              {product.discount_label || 'SALE'}
            </Badge>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white text-foreground shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart className={`h-4 w-4 ${product.is_liked ? 'fill-destructive text-destructive' : ''}`} />
          </Button>
        </div>

        <CardContent className="p-4 flex-grow flex flex-col">
          <div className="text-xs text-muted-foreground mb-1 font-medium tracking-wider uppercase">
            {typeof product.collection === 'object' && product.collection ? product.collection.title : ''}
          </div>
          <Link href={`/products/${product.id}`} className="hover:text-primary transition-colors">
            <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2">{product.title}</h3>
          </Link>
          
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-primary text-primary" />
            ))}
            <span className="text-[10px] text-muted-foreground ml-1">(4.5)</span>
          </div>

          <div className="mt-auto flex items-baseline gap-2">
            <span className="text-xl font-bold text-primary">
              {formatEtb(getEffectiveUnitPrice(product))}
            </span>
            {product.is_on_sale && (
              <span className="text-sm text-muted-foreground line-through">
                {formatEtb(product.unit_price)}
              </span>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button className="w-full gap-2 font-semibold shadow-md active:scale-95 transition-transform" onClick={handleAddToCart}>
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
