// server component - ambil data dress & kategori sebelum halaman dirender
import DressesList from "@/app/(public)/dresses/_components/DressesList";

type Category = { id: number; name: string; slug: string; isActive: boolean };
type DressPhoto = {
  id: number;
  url: string;
  isThumbnail: boolean;
  order: number;
};
type Dress = {
  id: number;
  name: string;
  slug: string;
  description: string;
  pricePerDay: number;
  status: "available" | "unavailable" | "archived";
  categoryId: number;
  category: Category;
  photos: DressPhoto[];
  isActive: boolean;
};

// dress yang ditampilkan ke publik: bukan arsip & statusnya aktif
async function getDresses(): Promise<Dress[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/dresses`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.filter((d: Dress) => d.status !== "archived" && d.isActive);
  } catch {
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/categories`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.filter((c: Category) => c.isActive);
  } catch {
    return [];
  }
}

export default async function DressesPage() {
  const [dresses, categories] = await Promise.all([
    getDresses(),
    getCategories(),
  ]);

  return (
    <DressesList initialDresses={dresses} initialCategories={categories} />
  );
}
