import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/home/Hero';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { ArrowRight, Zap, TrendingUp, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <Hero />
      
      {/* Social Proof / Trust Section */}
      <section className="py-12 border-y bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex items-center gap-3 justify-center">
               <Zap className="h-6 w-6 text-primary" />
               <span className="font-black uppercase tracking-tighter text-sm">Ultra Fast Delivery</span>
            </div>
            <div className="flex items-center gap-3 justify-center">
               <TrendingUp className="h-6 w-6 text-primary" />
               <span className="font-black uppercase tracking-tighter text-sm">Trending Styles</span>
            </div>
            <div className="flex items-center gap-3 justify-center">
               <ShieldCheck className="h-6 w-6 text-primary" />
               <span className="font-black uppercase tracking-tighter text-sm">Secure Checkout</span>
            </div>
            <div className="flex items-center gap-3 justify-center">
               <Zap className="h-6 w-6 text-primary" />
               <span className="font-black uppercase tracking-tighter text-sm">24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      <FeaturedProducts />

      {/* Banner / Promotion Section */}
      <section className="py-24 bg-primary text-primary-foreground overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />
        
        <div className="container mx-auto px-4 relative z-10 text-center md:text-left">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12">
            <div className="flex-grow">
              <h2 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase mb-6 leading-none">
                Golden <br /> Membership
              </h2>
              <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-xl mx-auto md:mx-0">
                Join our exclusive club and get up to 20% discount on all items, 
                early access to drops, and free worldwide shipping.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <Button size="lg" className="h-16 px-10 bg-white text-primary font-black text-lg rounded-2xl hover:bg-cream transition-colors shadow-2xl">
                  UPGRADE NOW
                </Button>
                <Button size="lg" variant="ghost" className="h-16 px-10 border-2 border-white/20 text-white font-black text-lg rounded-2xl hover:bg-white/10 transition-colors">
                  VIEW PERKS
                </Button>
              </div>
            </div>
            <div className="hidden lg:block w-80 h-80 bg-white/20 rounded-[60px] rotate-12 border-4 border-white/30 backdrop-blur-3xl flex items-center justify-center">
               <Zap className="h-40 w-40 text-white opacity-50" />
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-24 bg-cream/20">
         <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[600px]">
               <Link href="/products?collection_id=1" className="group h-full relative overflow-hidden rounded-[40px] shadow-2xl">
                  <Image fill src="https://picsum.photos/seed/coll1/1200/800" alt="Performance" className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-12">
                     <h3 className="text-5xl font-black text-white italic tracking-tighter uppercase mb-4">Performance</h3>
                     <div className="flex items-center gap-2 text-primary font-bold">
                        SHOP NOW <ArrowRight className="h-5 w-5" />
                     </div>
                  </div>
               </Link>
               <div className="grid grid-rows-2 gap-8 h-full">
                  <Link href="/products?collection_id=2" className="group relative overflow-hidden rounded-[40px] shadow-2xl">
                     <Image fill src="https://picsum.photos/seed/coll2/1200/800" alt="Streetwear" className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                     <div className="absolute bottom-0 left-0 p-8">
                        <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">Streetwear</h3>
                     </div>
                  </Link>
                  <Link href="/products?collection_id=3" className="group relative overflow-hidden rounded-[40px] shadow-2xl">
                     <Image fill src="https://picsum.photos/seed/coll3/1200/800" alt="Accessories" className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                     <div className="absolute bottom-0 left-0 p-8">
                        <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">Accessories</h3>
                     </div>
                  </Link>
               </div>
            </div>
         </div>
      </section>

      <Footer />
    </main>
  );
}
