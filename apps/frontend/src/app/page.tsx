import Navbar from "@/components/public/Navbar";
import HeroSection from "@/components/public/Herosection";
import CategoriesSection from "@/components/public/Categoriessection";
import QuoteSection from "@/components/public/Quotesection";
import SpotlightSection from "@/components/public/Spotlightsection";

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <QuoteSection />
      <CategoriesSection />
      <SpotlightSection />
    </main>
  );
}
