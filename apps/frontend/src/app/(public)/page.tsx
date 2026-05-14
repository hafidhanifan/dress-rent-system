import HeroSection from "@/components/public/Herosection";
import CategoriesSection from "@/components/public/Categoriessection";
import QuoteSection from "@/components/public/Quotesection";
import SpotlightSection from "@/components/public/Spotlightsection";
import WhyChooseSection from "@/components/public/Whychoose";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <QuoteSection />
      <CategoriesSection />
      <SpotlightSection />
      <WhyChooseSection />
    </main>
  );
}
