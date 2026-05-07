'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const collectionId = searchParams.get('collection_id');
  const urlSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isMounted, setIsMounted] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const priceBounds = useMemo(() => {
    return { max: 50_000 };
  }, []);

  const [priceRange, setPriceRange] = useState([0, 50_000]);

  useEffect(() => {
    setSearch(urlSearch);
  }, [urlSearch]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [collectionId, search, priceRange, sortBy]);


  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params: any = { 
          collection_id: collectionId || undefined,
          search: search || undefined,
          price__gt: priceRange[0] > 0 ? priceRange[0] : undefined,
          price__lt: priceRange[1] < priceBounds.max ? priceRange[1] : undefined,
          page: page,
        };

        if (sortBy === 'price-low') params.ordering = 'price';
        else if (sortBy === 'price-high') params.ordering = '-price';
        else if (sortBy === 'newest') params.ordering = '-last_update';

        const response = await api.get('/store/products/', { params });
        const newProducts = extractList<Product>(response.data);
        
        if (page === 1) {
          setProducts(newProducts);
        } else {
          setProducts(prev => [...prev, ...newProducts]);
        }
        
        setHasMore(!!response.data.next);
      } catch (error: any) {
        if (page === 1) setProducts([]);
        toast.error(getApiErrorMessage(error, 'Unable to load products right now.'));
      } finally {
        setIsLoading(false);
      }
    };

    const debounceId = setTimeout(fetchProducts, 500);
    return () => clearTimeout(debounceId);
  }, [collectionId, search, priceRange, sortBy, page, priceBounds.max]);


  const filteredProducts = products; // Already filtered by backend


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
            <form onSubmit={(event) => {
              event.preventDefault();
              if (search.trim()) {
                router.push(`/products?search=${encodeURIComponent(search.trim())}`);
                return;
              }
              router.push('/products');
            }} className="relative flex-grow md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search products..." 
                className="pl-10 h-12 border-2 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="sr-only">Search</button>
            </form>
            
            {isMounted ? (

              <Sheet>
                <SheetTrigger
                  nativeButton={true}
                  render={
                    <Button variant="outline" size="icon" className="h-12 w-12 shrink-0 border-2">
                      <SlidersHorizontal className="h-5 w-5" />
                    </Button>
                  }
                />
                <SheetContent className="w-full sm:max-w-md p-6 md:p-8 flex flex-col h-full overflow-y-auto">
                  <SheetHeader className="pb-6 border-b">
                    <SheetTitle className="text-3xl font-black uppercase tracking-tighter">Filters</SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 py-6 space-y-10">
                    <div className="space-y-6">
                      <h4 className="font-bold uppercase text-sm tracking-widest text-primary flex items-center justify-between">
                        Price Range
                      </h4>
                      <div className="px-2">
                        <Slider 
                          max={priceBounds.max} 
                          step={50} 
                          value={priceRange}
                          onValueChange={(value) => {
                            if (Array.isArray(value)) setPriceRange([...value]);
                          }}
                          className="py-2"
                        />
                      </div>
                      <div className="flex justify-between items-center text-sm font-bold bg-muted/40 p-4 rounded-xl border border-muted">
                        <span>{formatEtb(priceRange[0])}</span>
                        <div className="h-px w-8 bg-muted-foreground/30 mx-4" />
                        <span>{formatEtb(priceRange[1])}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold uppercase text-sm tracking-widest text-primary">Sort By</h4>
                      <Select value={sortBy} onValueChange={(value) => setSortBy(value || 'newest')}>
                        <SelectTrigger className="w-full h-14 border-2 font-bold rounded-xl focus:ring-primary focus:border-primary bg-white">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-2 shadow-xl">
                          <SelectItem value="newest" className="font-bold py-3 cursor-pointer">Newest First</SelectItem>
                          <SelectItem value="price-low" className="font-bold py-3 cursor-pointer">Price: Low to High</SelectItem>
                          <SelectItem value="price-high" className="font-bold py-3 cursor-pointer">Price: High to Low</SelectItem>
                          <SelectItem value="popular" className="font-bold py-3 cursor-pointer">Most Popular</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="pt-6 mt-auto border-t">
                    <Button 
                      variant="default"
                      className="w-full h-14 font-black text-lg rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]" 
                      onClick={() => {
                        setSearch('');
                        setPriceRange([0, priceBounds.max]);
                        setSortBy('newest');
                      }}
                    >
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
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            {hasMore && (
              <div className="mt-16 flex justify-center">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-14 px-12 border-2 font-black text-lg rounded-2xl hover:bg-primary hover:text-primary-foreground transition-all"
                  onClick={() => setPage(prev => prev + 1)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      LOADING...
                    </>
                  ) : (
                    'LOAD MORE'
                  )}
                </Button>
              </div>
            )}
          </>
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

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-lg font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Loading Catalog...</p>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
