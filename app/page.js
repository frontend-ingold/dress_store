import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import WhyChooseUs from '@/components/WhyChooseUs';
import PartnersStrip from '@/components/PartnersStrip';
import TopBookings from '@/components/TopBookings';
import ExploreSection from '@/components/ExploreSection';
import NewsSection from '@/components/NewsSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import SubscribeSection from '@/components/SubscribeSection';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <main className="page-shell">
      <Header />
      <HeroSection />
      <WhyChooseUs />
      <PartnersStrip />
      <TopBookings />
      <ExploreSection />
      <NewsSection />
      <TestimonialsSection />
      <SubscribeSection />
      <Footer />
    </main>
  );
}
