// src/app/(public)/page.tsx
// fetch categories, kirim sebagai prop ke CategoriesSection

import HeroSection from "@/components/public/Herosection";
import CategoriesSection from "@/components/public/Categoriessection";
import QuoteSection from "@/components/public/Quotesection";
import SpotlightSection from "@/components/public/Spotlightsection";
import WhyChooseSection from "@/components/public/Whychoose";

type Category = { id: number; name: string; slug: string; isActive: boolean };

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/categories`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    const data = await res.json();
    // hanya kategori aktif, urutkan sesuai field "order" kalau ada
    return data.filter((c: Category) => c.isActive);
  } catch {
    return [];
  }
}

export default async function Home() {
  const categories = await getCategories();

  return (
    <main>
      <HeroSection />
      <QuoteSection />
      <CategoriesSection categories={categories} />
      <SpotlightSection />
      <WhyChooseSection />
    </main>
  );
}
