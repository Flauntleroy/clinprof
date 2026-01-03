import {
  Navbar,
  Footer,
  HeroSection,
  AboutSection,
  DoctorsSection,
  ServicesSection,
  FacilitiesSection,
  BookingSection,
  ContactSection,
  NewsSection,
} from '@/components/public';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <DoctorsSection />
        <ServicesSection />
        <FacilitiesSection />
        <NewsSection />
        <BookingSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}

