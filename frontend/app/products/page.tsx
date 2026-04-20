'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { Product } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Filter, Search, SlidersHorizontal, X, Loader2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { extractList, getApiErrorMessage } from '@/lib/api-helpers';
import { formatEtb } from '@/lib/format-currency';

import { useSyncExternalStore } from 'react';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const priceBounds = useMemo(() => {
    if (!products.length) return { max: 20_000 };
    const hi = Math.max(...products.map((p) => p.unit_price));
    const max = Math.max(1_000, Math.ceil(hi / 500) * 500);
    return { max };
  }, [products]);

  const [priceRange, setPriceRange] = useState([0, 20_000]);

  useEffect(() => {
    setPriceRange((prev) => {
      const upper = Math.min(prev[1], priceBounds.max);
      const lower = Math.min(prev[0], upper);
      return [lower, upper];
    });
  }, [priceBounds.max]);

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/store/products/');
        setProducts(extractList(response.data));
      } catch (error: any) {
        setProducts([]);
        toast.error(getApiErrorMessage(error, 'Unable to load products right now.'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) &&
    p.unit_price >= priceRange[0] && p.unit_price <= priceRange[1]
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-2">
              Browse <span className="text-primary italic">Catalog</span>
            </h1>
            <p className="text-muted-foreground">{filteredProducts.length} items found</p>
          </div>

          <div className="flex w-full md:w-auto items-center gap-2">
            <div className="relative flex-grow md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search products..." 
                className="pl-10 h-12 border-2 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            {mounted ? (
              <Sheet>
                <SheetTrigger
                  nativeButton={true}
                  render={
                    <Button variant="outline" size="icon" className="h-12 w-12 shrink-0 border-2">
                      <SlidersHorizontal className="h-5 w-5" />
                    </Button>
                  }
                />
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle className="text-2xl font-black uppercase tracking-tighter">Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-8 space-y-8">
                    <div>
                      <h4 className="font-bold mb-4 uppercase text-sm tracking-widest text-primary">Price Range</h4>
                      <Slider 
                        max={priceBounds.max} 
                        step={50} 
                        value={priceRange}
                        onValueChange={(value) => {
                          if (Array.isArray(value)) setPriceRange([...value]);
                        }}
                        className="mb-4"
                      />
                      <div className="flex justify-between text-sm font-bold">
                        <span>{formatEtb(priceRange[0])}</span>
                        <span>{formatEtb(priceRange[1])}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold mb-4 uppercase text-sm tracking-widest text-primary">Sort By</h4>
                      <Select value={sortBy} onValueChange={(value) => setSortBy(value || 'newest')}>
                        <SelectTrigger className="w-full h-12 border-2 font-bold">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest" className="font-bold">Newest First</SelectItem>
                          <SelectItem value="price-low" className="font-bold">Price: Low to High</SelectItem>
                          <SelectItem value="price-high" className="font-bold">Price: High to Low</SelectItem>
                          <SelectItem value="popular" className="font-bold">Most Popular</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button className="w-full h-14 font-black text-lg shadow-xl" onClick={() => {
                      setSearch('');
                      setPriceRange([0, 500]);
                      setSortBy('newest');
                    }}>
                      RESET ALL
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <Button variant="outline" size="icon" className="h-12 w-12 shrink-0 border-2">
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-lg font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Loading Catalog...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mb-6">
              <X className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold uppercase mb-2">No products found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters to find what you&apos;re looking for.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
