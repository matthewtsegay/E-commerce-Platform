import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-6">
          Terms of <span className="text-primary italic">Service</span>
        </h1>
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p>By using this store, you agree to provide accurate account and checkout information.</p>
          <p>Orders are confirmed after successful payment authorization and stock validation.</p>
          <p>For support, delivery concerns, or policy questions, please contact us through the official support page.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
