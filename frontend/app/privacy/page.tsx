import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-6">
          Privacy <span className="text-primary italic">Policy</span>
        </h1>
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p>We collect only the data needed to process orders, support your account, and improve the shopping experience.</p>
          <p>Your payment data is handled by secure providers. We do not store full card details on our servers.</p>
          <p>You can request profile updates or account deletion by contacting support through the contact page.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
