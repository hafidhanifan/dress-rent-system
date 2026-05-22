"use client";

// src/components/public/DressesList.tsx
// INI CLIENT COMPONENT — hanya untuk filter, search, hover effect
// Data sudah diterima dari Server Component sebagai props

import { useState, useEffect } from "react";
import Link from "next/link";

const IMG_BASE = process.env.NEXT_PUBLIC_IMG_BASE ?? "http://localhost:3001";

type Category = { id: number; name: string; slug: string };
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

const getThumb = (d: Dress): DressPhoto | undefined =>
  d.photos?.find((p) => p.isThumbnail) ?? d.photos?.[0];

export default function DressesList({
  initialDresses,
  initialCategories,
}: {
  initialDresses: Dress[];
  initialCategories: Category[];
}) {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("all");
  const [sort, setSort] = useState<"default" | "price-asc" | "price-desc">(
    "default",
  );

  // Animasi scroll-in — jalan sekali saat komponen mount
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        els.forEach((el) => {
          el.style.opacity = "0";
          el.style.transform = "translateY(24px)";
          el.style.transition = "opacity 0s, transform 0s";
        });
        const obs = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              const el = entry.target as HTMLElement;
              const delay = parseFloat(el.dataset.delay ?? "0") * 1000;
              setTimeout(() => {
                el.style.transition =
                  "opacity 0.75s ease, transform 0.75s ease";
                el.style.opacity = "1";
                el.style.transform = "translateY(0)";
              }, delay);
              obs.unobserve(el);
            });
          },
          { threshold: 0, rootMargin: "0px 0px -40px 0px" },
        );
        els.forEach((el) => obs.observe(el));
      });
    });
  }, []);

  // Filter + sort — semua di client, tidak perlu fetch ulang
  const filtered = initialDresses
    .filter((d) => {
      const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
      const matchCat =
        activeCat === "all" || String(d.categoryId) === activeCat;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sort === "price-asc") return a.pricePerDay - b.pricePerDay;
      if (sort === "price-desc") return b.pricePerDay - a.pricePerDay;
      return 0;
    });

  return (
    <div className="min-h-screen bg-[#f0ebe3]">
      {/* Header */}
      <div className="pt-32 pb-14 px-6 text-center">
        <div
          data-reveal
          data-delay="0.05"
          className="flex items-center justify-center gap-2 mb-8"
        >
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
          data-reveal
          data-delay="0.1"
          className="font-serif font-[300] text-stone-800 leading-none mb-5"
          style={{ fontSize: "clamp(2.8rem, 7vw, 6rem)" }}
        >
          All <em className="italic">Dresses</em>
        </h1>

        <p
          data-reveal
          data-delay="0.18"
          className="font-sans font-[300] text-stone-400 text-sm leading-relaxed max-w-md mx-auto"
        >
          Setiap gaun adalah sebuah cerita — temukan yang paling sempurna untuk
          momenmu.
        </p>

        <div
          data-reveal
          data-delay="0.24"
          className="flex items-center justify-center gap-4 mt-8"
        >
          <div className="w-12 h-[1px] bg-stone-300" />
          <span className="font-sans text-[9px] tracking-[0.35em] uppercase text-stone-300">
            {filtered.length} dress
          </span>
          <div className="w-12 h-[1px] bg-stone-300" />
        </div>
      </div>

      {/* Filter bar */}
      <div className="sticky top-0 z-20 bg-[#f0ebe3]/90 backdrop-blur-sm border-b border-stone-200/60">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Kategori pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { id: "all", name: "Semua" },
              ...initialCategories.map((c) => ({
                id: String(c.id),
                name: c.name,
              })),
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={`font-sans text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 rounded-full border transition-all duration-200 ${
                  activeCat === cat.id
                    ? "bg-stone-800 text-stone-100 border-stone-800"
                    : "bg-transparent text-stone-500 border-stone-300 hover:border-stone-500 hover:text-stone-700"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search + sort */}
          <div className="flex items-center gap-3 flex-shrink-0">
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

      {/* Grid */}
      <main className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-16">
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-serif font-[300] text-stone-400 text-2xl mb-3">
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
                  delay={0.05 + (i % 3) * 0.08}
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

// ─────────────────────────────────────────────────────────────
// Card Dress
// ─────────────────────────────────────────────────────────────
function DressCard({
  dress,
  thumb,
  delay,
  isMid,
}: {
  dress: Dress;
  thumb: DressPhoto | undefined;
  delay: number;
  isMid: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const [wishlisted, setWishListed] = useState(false);

  const handleWishlist = (e: React.MouseEvent) => {
    // cegah navigasi ke halaman detail saat klik icon love
    e.preventDefault();
    e.stopPropagation();
    setWishListed((prev) => !prev);

    // Nanti di sini digunakan untuk melakukan pengecekan login. kalau belum login redirect ke /auth/login
  };

  return (
    <Link
      href={`/dresses/${dress.slug}`}
      data-reveal
      data-delay={String(delay)}
      className="group block"
      style={{ marginTop: isMid ? "-2rem" : "0" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="relative overflow-hidden bg-stone-200/60 w-full"
        style={{ aspectRatio: "3/4" }}
      >
        {thumb ? (
          <img
            src={`${IMG_BASE}${thumb.url}`}
            alt={dress.name}
            className="w-full h-full object-cover object-top transition-transform duration-700 ease-out"
            style={{ transform: hovered ? "scale(1.04)" : "scale(1)" }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-[#e8e0d5]">
            <svg
              width="28"
              height="28"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#c8b8a0"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
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
          onClick={handleWishlist}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300"
          style={{
            background: wishlisted
              ? "rgba(255,255,255,0.95)"
              : "rgba(255,255,255,0.7)",
            backdropFilter: "blur(4px)",
            opacity: hovered || wishlisted ? 1 : 0,
            transform: hovered || wishlisted ? "scale(1)" : "scale(0.8)",
          }}
          aria-label={wishlisted ? "Hapus dari wishlist" : "Tambah ke wishlist"}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            // Kalau wishlisted: fill merah, kalau tidak: hanya stroke
            fill={wishlisted ? "#e57373" : "none"}
            stroke={wishlisted ? "#e57373" : "#78716c"}
          >
            <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>

        <div
          className="absolute inset-0 bg-stone-900/10 transition-opacity duration-500"
          style={{ opacity: hovered ? 1 : 0 }}
        />

        <div
          className="absolute bottom-4 left-0 right-0 flex justify-center"
          style={{
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateY(0)" : "translateY(8px)",
            transition: "all 0.4s ease",
          }}
        >
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
          className="font-serif font-[300] text-stone-800 leading-snug mb-2 group-hover:text-stone-500 transition-colors duration-300"
          style={{ fontSize: "clamp(1.1rem, 2vw, 1.4rem)" }}
        >
          {dress.name}
        </h2>
        {dress.description && (
          <p
            className="font-sans font-[300] text-stone-400 text-xs leading-relaxed"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {dress.description}
          </p>
        )}
      </div>
    </Link>
  );
}
