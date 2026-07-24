// src/components/public/Spotlightsection.tsx
// Server Component — fetch data spotlight langsung dari backend

import Image from "next/image";
import Link from "next/link";

const IMG_BASE = process.env.NEXT_PUBLIC_IMG_BASE ?? "http://localhost:3001";

type Category = { id: number; name: string };
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
  category: Category;
  photos: DressPhoto[];
};

async function getSpotlightDresses(): Promise<Dress[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/dresses/spotlight`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

const getThumb = (d: Dress) =>
  d.photos?.find((p) => p.isThumbnail) ?? d.photos?.[0];

export default async function SpotlightSection() {
  const dresses = await getSpotlightDresses();

  // Kalau tidak ada dress sama sekali (database kosong), sembunyikan section
  if (dresses.length === 0) return null;

  return (
    <section
      className="w-full py-16 md:py-24 px-6 md:px-12 lg:px-20"
      style={{ background: "var(--user-bg)" }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 md:gap-0 mb-10 md:mb-14">
        <div>
          <p
            className="font-sans text-[9px] tracking-[0.35em] uppercase mb-3"
            style={{ color: "var(--user-text-muted)" }}
          >
            Spotlight
          </p>
          <h2
            className="font-serif font-light leading-[1.1] tracking-[-0.01em]"
            style={{
              fontSize: "clamp(2rem, 4vw, 3.2rem)",
              color: "var(--user-text)",
            }}
          >
            Explore our <br />
            seasonal <em className="italic">highlights</em>
          </h2>
        </div>

        <div>
          <Link
            href="/dresses"
            className="group inline-flex items-center gap-3 font-sans text-[10px] tracking-[0.25em] uppercase transition-colors duration-300"
            style={{ color: "var(--user-text-secondary)" }}
          >
            View All
            <span
              className="block w-8 h-px group-hover:w-12 transition-all duration-300"
              style={{ background: "var(--user-text-muted)" }}
            />
          </Link>
        </div>
      </div>

      {/* Grid kartu dress */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {dresses.map((dress) => (
          <DressCard key={dress.id} dress={dress} thumb={getThumb(dress)} />
        ))}
      </div>
    </section>
  );
}

function DressCard({
  dress,
  thumb,
}: {
  dress: Dress;
  thumb: DressPhoto | undefined;
}) {
  return (
    <Link href={`/dresses/${dress.slug}`} className="group block">
      <div
        className="relative overflow-hidden w-full"
        style={{ aspectRatio: "3/4", background: "var(--user-border)" }}
      >
        {thumb ? (
          <Image
            src={`${IMG_BASE}${thumb.url}`}
            alt={dress.name}
            fill
            className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span
              className="font-sans text-[8px] tracking-widest uppercase"
              style={{ color: "var(--user-text-faint)" }}
            >
              Foto belum tersedia
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 md:mt-4">
        <p
          className="font-sans text-[8px] md:text-[9px] tracking-[0.3em] uppercase mb-1"
          style={{ color: "var(--user-text-muted)" }}
        >
          {dress.category?.name ?? "—"}
        </p>
        <p
          className="font-serif font-light text-base md:text-lg leading-snug transition-colors duration-300"
          style={{ color: "var(--user-text)" }}
        >
          {dress.name}
        </p>
      </div>
    </Link>
  );
}
