'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-24 text-center">
        <h1 className="text-6xl font-black uppercase tracking-tighter mb-8 italic">Contact <span className="text-primary italic">Us</span></h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
          Need assistance? Our support team is here for you 24/7. 
          Email us at <span className="text-primary font-black">support@nebi.store</span> or call <span className="text-primary font-black">+1 (800) 555-NEBI</span>.
        </p>
      </main>
      <Footer />
    </div>
  );
}
