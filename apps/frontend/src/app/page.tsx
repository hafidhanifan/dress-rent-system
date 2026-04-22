import Navbar from "@/components/public/Navbar";
import HeroSection from "@/components/public/Herosection";
import CategoriesSection from "@/components/public/Categoriessection";

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <CategoriesSection />
    </main>
  );
}
