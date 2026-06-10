import { redirect } from "next/navigation";
import CheckoutForm from "./_components/CheckoutForm";

export const dynamic = "force-dynamic";

type Category = { id: number; name: string };
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
type Dress = {
  id: number;
  name: string;
  slug: string;
  description: string;
  pricePerDay: number;
  minRentalDays: number;
  status: "available" | "unavailable" | "archived";
  category: Category;
  photos: DressPhoto[];
  sizes: DressSize[];
};

async function getDress(id: string): Promise<Dress | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/dresses/${id}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ dressId?: string; sizeId?: string }>;
}) {
  const params = await searchParams;

  if (!params.dressId) redirect("/dresses");

  const dress = await getDress(params.dressId);
  if (!dress || dress.status !== "available") redirect("/dresses");

  const selectedSize =
    dress.sizes?.find((s) => String(s.id) === params.sizeId) ?? null;

  return <CheckoutForm dress={dress} initialSize={selectedSize} />;
}
