'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck, Gift } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { formatEtb } from '@/lib/format-currency';
import { computeShippingEtb, FREE_SHIPPING_MIN_ETB } from '@/lib/shipping';

export default function CartPage() {
  const { cart, removeItem, updateQuantity } = useCart();
  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
  const shipping = computeShippingEtb(subtotal);
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items */}
          <div className="flex-grow lg:w-2/3">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-8">
              Your <span className="text-primary italic">Bag</span>
            </h1>

            {items.length > 0 ? (
              <div className="space-y-6">
                {items.map((item) => (
                  <Card key={item.product.id} className="border-none shadow-sm bg-white/50 backdrop-blur-sm rounded-3xl overflow-hidden">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex gap-6">
                        <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-2xl overflow-hidden shrink-0 border bg-white">
                          <Image 
                            src={item.product.images[0]?.image} 
                            alt={item.product.title}
                            fill
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        
                        <div className="flex flex-col justify-between flex-grow">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg md:text-xl font-bold mb-1 leading-tight">{item.product.title}</h3>
                              <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">{typeof item.product.collection === 'object' && item.product.collection ? item.product.collection.title : ''}</p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => removeItem(item.product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex justify-between items-center mt-4">
                            <div className="flex items-center border-2 rounded-xl p-0.5 bg-white">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-lg"
                                onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center font-bold">{item.quantity}</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-lg"
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <span className="text-xl font-black text-primary">{formatEtb(item.total_price)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center bg-white/30 rounded-3xl border-2 border-dashed">
                <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mb-6">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold uppercase mb-2">Your bag is empty</h3>
                <p className="text-muted-foreground mb-8">Looks like you haven&apos;t added any style to your bag yet.</p>
                <Button render={<Link href="/products" />} size="lg" className="h-14 px-8 font-bold rounded-2xl shadow-lg">
                  START SHOPPING
                </Button>
              </div>
            )}
          </div>

          {/* Checkout Summary */}
          <div className="lg:w-1/3">
            <div className="sticky top-24 space-y-6">
              <Card className="border-none shadow-2xl bg-white rounded-3xl p-8">
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 italic text-primary">Summary</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between font-bold">
                    <span className="text-muted-foreground uppercase text-xs tracking-widest">Subtotal</span>
                    <span>{formatEtb(subtotal)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-muted-foreground uppercase text-xs tracking-widest">Estimated Shipping</span>
                    <span>{shipping === 0 ? 'FREE' : formatEtb(shipping)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-muted-foreground uppercase text-xs tracking-widest">Tax</span>
                    <span>Included</span>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex justify-between items-baseline mb-8">
                    <span className="text-xl font-black uppercase tracking-tighter">Total</span>
                    <span className="text-3xl font-black text-primary">{formatEtb(total)}</span>
                  </div>
                  
                  <Button className="w-full h-16 text-lg font-black shadow-xl rounded-2xl group" disabled={items.length === 0} render={<Link href="/checkout" />}>
                    PROCEED TO CHECKOUT
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </Card>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <Truck className="h-6 w-6 text-primary shrink-0" />
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider mb-1">Free Shipping</h4>
                    <p className="text-[10px] font-bold text-muted-foreground leading-tight">
                      Free delivery on orders over {formatEtb(FREE_SHIPPING_MIN_ETB)} subtotal (Ethiopia).
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <Gift className="h-6 w-6 text-primary shrink-0" />
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider mb-1">Gift Wrapping</h4>
                    <p className="text-[10px] font-bold text-muted-foreground leading-tight">Every order comes in our premium signature packaging at no extra cost.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
