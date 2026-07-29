// src/app/(public)/page.tsx
// fetch categories, kirim sebagai prop ke CategoriesSection

import HeroSection from "@/app/(public)/_components/Herosection";
import CategoriesSection from "@/app/(public)/_components/Categoriessection";
import QuoteSection from "@/app/(public)/_components/Quotesection";
import SpotlightSection from "@/app/(public)/_components/Spotlightsection";
import WhyChooseSection from "@/app/(public)/_components/Whychoose";

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
