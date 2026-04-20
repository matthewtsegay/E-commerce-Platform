import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Twitter, Youtube, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Footer() {
  return (
    <footer className="bg-foreground text-background pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="flex flex-col gap-6">
            <Link href="/" className="text-3xl font-black tracking-tighter text-primary italic">
              NEBI STORE
            </Link>
            <p className="text-muted-foreground leading-relaxed">
              Leading the future of e-commerce with premium products and seamless 
              digital experiences. Quality you can feel, style you can carry.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 uppercase tracking-wider text-primary">Shop</h4>
            <ul className="flex flex-col gap-4">
              <li><Link href="/products" className="text-muted-foreground hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/collections" className="text-muted-foreground hover:text-white transition-colors">Collections</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-white transition-colors">About</Link></li>
              <li><Link href="/faq" className="text-muted-foreground hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 uppercase tracking-wider text-primary">Support</h4>
            <ul className="flex flex-col gap-4">
              <li><Link href="/contact" className="text-muted-foreground hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 uppercase tracking-wider text-primary">Newsletter</h4>
            <p className="text-muted-foreground mb-6">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <div className="flex gap-2">
              <Input 
                placeholder="email@example.com" 
                className="bg-white/10 border-white/20 text-white placeholder:text-muted-foreground"
              />
              <Button size="icon" className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground font-medium">
          <p>© 2026 Nebi Store. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
