// Client Component
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";

const IMG_BASE = process.env.NEXT_PUBLIC_IMG_BASE ?? "http://localhost:3001";

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
};

const getThumb = (d: Dress) =>
  d.photos?.find((p) => p.isThumbnail) ?? d.photos?.[0];

export default function DressesList({
  initialDresses,
  initialCategories,
}: {
  initialDresses: Dress[];
  initialCategories: Category[];
}) {
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  // Baca kategori aktif dari query ?cat=slug -> kalau tidak ada, default "all"
  const [activeCat, setActiveCat] = useState<string>(
    searchParams.get("cat") ?? "all",
  );
  const [sort, setSort] = useState<"default" | "price-asc" | "price-desc">(
    "default",
  );

  const filtered = initialDresses
    .filter((d) => {
      const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
      // Cocokkan pakai SLUG kategori (bukan id) supaya sinkron dengan URL
      const matchCat = activeCat === "all" || d.category?.slug === activeCat;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sort === "price-asc") return a.pricePerDay - b.pricePerDay;
      if (sort === "price-desc") return b.pricePerDay - a.pricePerDay;
      return 0;
    });

  return (
    <div className="min-h-screen bg-[#f0ebe3]">
      <div className="pt-32 pb-14 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Link
            href="/"
            className="font-sans text-[10px] tracking-[0.2em] uppercase text-stone-400 hover:text-stone-600 transition-colors"
          >
            Home
          </Link>
          <span className="text-stone-300 text-xs">/</span>
          <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-stone-600">
            All Dresses
          </span>
        </div>

        <h1
          className="font-serif font-light text-stone-800 leading-none mb-5"
          style={{ fontSize: "clamp(2.8rem, 7vw, 6rem)" }}
        >
          All <em className="italic">Dresses</em>
        </h1>

        <p className="font-sans font-light text-stone-400 text-sm leading-relaxed max-w-md mx-auto">
          Setiap gaun adalah sebuah cerita — temukan yang paling sempurna untuk
          momenmu.
        </p>

        <div className="flex items-center justify-center gap-4 mt-8">
          <div className="w-12 h-px bg-stone-300" />
          <span className="font-sans text-[9px] tracking-[0.35em] uppercase text-stone-300">
            {filtered.length} dress
          </span>
          <div className="w-12 h-px bg-stone-300" />
        </div>
      </div>

      <div className="sticky top-0 z-20 bg-[#f0ebe3]/90 backdrop-blur-sm border-b border-stone-200/60">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { slug: "all", name: "Semua" },
              ...initialCategories.map((c) => ({
                slug: c.slug,
                name: c.name,
              })),
            ].map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCat(cat.slug)}
                className={`font-sans text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 rounded-full border transition-all duration-200 ${
                  activeCat === cat.slug
                    ? "bg-stone-800 text-stone-100 border-stone-800"
                    : "bg-transparent text-stone-500 border-stone-300 hover:border-stone-500 hover:text-stone-700"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <svg
                width="12"
                height="12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Cari dress..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border border-stone-200 rounded-full pl-8 pr-4 py-1.5 font-sans text-[11px] text-stone-600 placeholder:text-stone-300 outline-none focus:border-stone-400 transition-colors w-36 md:w-44"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="bg-transparent border border-stone-200 rounded-full px-3 py-1.5 font-sans text-[11px] text-stone-500 outline-none cursor-pointer focus:border-stone-400 transition-colors appearance-none"
            >
              <option value="default">Urutan Default</option>
              <option value="price-asc">Harga Terendah</option>
              <option value="price-desc">Harga Tertinggi</option>
            </select>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-16">
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-serif font-light text-stone-400 text-2xl mb-3">
              Dress tidak ditemukan
            </p>
            <p className="font-sans text-sm text-stone-400">
              Coba ubah filter atau kata pencarian
            </p>
            <button
              onClick={() => {
                setSearch("");
                setActiveCat("all");
              }}
              className="mt-6 font-sans text-[10px] tracking-[0.2em] uppercase text-stone-500 border border-stone-300 px-5 py-2 hover:bg-stone-800 hover:text-stone-100 hover:border-stone-800 transition-all duration-300"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-14 md:gap-x-7">
              {filtered.map((dress, i) => (
                <DressCard
                  key={dress.id}
                  dress={dress}
                  thumb={getThumb(dress)}
                  isMid={i % 3 === 1}
                />
              ))}
            </div>
            <div className="text-center mt-20 pt-12 border-t border-stone-200/60">
              <p className="font-sans text-[9px] tracking-[0.35em] uppercase text-stone-300">
                Menampilkan {filtered.length} dari {initialDresses.length} dress
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function DressCard({
  dress,
  thumb,
  isMid,
}: {
  dress: Dress;
  thumb: DressPhoto | undefined;
  isMid: boolean;
}) {
  const router = useRouter();
  const { loggedIn } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(dress.id);

  return (
    <Link
      href={`/dresses/${dress.slug}`}
      className="group block"
      style={{ marginTop: isMid ? "-2rem" : "0" }}
    >
      <div
        className="relative overflow-hidden bg-stone-200/60 w-full"
        style={{ aspectRatio: "3/4" }}
      >
        {thumb ? (
          <img
            src={`${IMG_BASE}${thumb.url}`}
            alt={dress.name}
            className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-[#e8e0d5]">
            <span className="font-sans text-[9px] tracking-widest uppercase text-stone-400">
              Foto belum tersedia
            </span>
          </div>
        )}

        {dress.status === "unavailable" && (
          <div className="absolute top-3 left-3 bg-stone-800/80 backdrop-blur-sm px-3 py-1">
            <p className="font-sans text-[8px] tracking-[0.2em] uppercase text-stone-300">
              Tidak Tersedia
            </p>
          </div>
        )}

        <button
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!loggedIn) {
              router.push("/auth/login?redirect=/dresses");
              return;
            }
            await toggleWishlist(dress.id);
          }}
          className={`absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-sm transition-all duration-300 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 ${wishlisted ? "!opacity-100 !scale-100 bg-white/95" : "bg-white/70"}`}
          aria-label={wishlisted ? "Hapus dari wishlist" : "Tambah ke wishlist"}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={wishlisted ? "#e57373" : "none"}
            stroke={wishlisted ? "#e57373" : "#78716c"}
          >
            <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>

        <div className="absolute inset-0 bg-stone-900/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
        <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none">
          <span className="font-sans text-[9px] tracking-[0.25em] uppercase bg-[#f0ebe3]/90 backdrop-blur-sm text-stone-700 px-5 py-2">
            Lihat Detail
          </span>
        </div>
      </div>

      <div className="mt-4">
        <p className="font-sans text-[9px] tracking-[0.25em] uppercase text-stone-400 mb-1.5">
          {dress.category?.name ?? "—"}
        </p>
        <h2
          className="font-serif font-light text-stone-800 leading-snug mb-2 group-hover:text-stone-500 transition-colors duration-300"
          style={{ fontSize: "clamp(1.1rem, 2vw, 1.4rem)" }}
        >
          {dress.name}
        </h2>
        {dress.description && (
          <p className="font-sans font-light text-stone-400 text-xs leading-relaxed line-clamp-2">
            {dress.description}
          </p>
        )}
      </div>
    </Link>
  );
}
