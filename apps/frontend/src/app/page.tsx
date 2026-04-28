import Navbar from "@/components/public/Navbar";
import HeroSection from "@/components/public/Herosection";
import CategoriesSection from "@/components/public/Categoriessection";
import QuoteSection from "@/components/public/Quotesection";
import SpotlightSection from "@/components/public/Spotlightsection";
import WhyChooseSection from "@/components/public/Whychoose";
import Footer from "@/components/public/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <QuoteSection />
      <CategoriesSection />
      <SpotlightSection />
      <WhyChooseSection />
      <Footer />
      {/* test */}
    </main>
  );
}
