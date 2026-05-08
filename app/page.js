import Header from '@/components/Header';
import BookingExperience from '@/components/BookingExperience';
import WhyChooseUs from '@/components/WhyChooseUs';
import PartnersStrip from '@/components/PartnersStrip';
import ExploreSection from '@/components/ExploreSection';
import NewsSection from '@/components/NewsSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import SubscribeSection from '@/components/SubscribeSection';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <main className="page-shell">
      <Header />
      <BookingExperience />
      <WhyChooseUs />
      <PartnersStrip />
      <ExploreSection />
      <NewsSection />
      <TestimonialsSection />
      <SubscribeSection />
      <Footer />
    </main>
  );
}
