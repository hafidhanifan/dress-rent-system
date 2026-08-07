// src/app/(public)/dresses/[slug]/page.tsx
// server component, fetch data dress berdasarkan slug

import { notFound } from "next/navigation";
import DressDetail from "@/app/(public)/dresses/_components/DressDetail";

export const dynamic = "force-dynamic";

type Category = { id: number; name: string; slug: string };
type DressPhoto = {
  id: number;
  url: string;
  isThumbnail: boolean;
  order: number;
};
type DressSize = {
  id: number;
  label: string;
  bust: number | null;
  waist: number | null;
  hip: number | null;
  length: number | null;
  stock: number;
};

// data lengkap satu dress untuk halaman detail
type Dress = {
  id: number;
  name: string;
  slug: string;
  description: string;
  pricePerDay: number;
  minRentalDays: number;
  status: "available" | "unavailable" | "archived";
  condition: "new" | "good" | "fair";
  color: string;
  material: string;
  isActive: boolean;
  category: Category;
  categoryId: number;
  photos: DressPhoto[];
  sizes: DressSize[];
  createdAt: string;
};

async function getDress(slug: string): Promise<Dress | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/dresses/slug/${slug}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function DressDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dress = await getDress(slug);
  // slug tidak ketemu -> tampilkan halaman 404 bawaan next.js
  if (!dress) notFound();
  return <DressDetail dress={dress} />;
}
