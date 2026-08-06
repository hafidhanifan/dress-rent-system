"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getToken } from "@/lib/auth";
import { useWishlist } from "@/hooks/useWishlist";
import { apiFetch } from "@/lib/apiFetch";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
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
  description: string;
  pricePerDay: number;
  status: "available" | "unavailable" | "archived";
  category: Category;
  photos: DressPhoto[];
};
type WishlistItem = {
  id: number;
  dressId: number;
  dress: Dress;
  createdAt: string;
};

const getThumb = (d: Dress) =>
  d.photos?.find((p) => p.isThumbnail) ?? d.photos?.[0];
const formatPrice = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

export default function WishlistList() {
  const router = useRouter();
  const { user, loggedIn, ready } = useAuth();
  const { toggleWishlist } = useWishlist();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!loggedIn) {
      setShowLoginPrompt(true);
      setLoading(false);
      return;
    }
    fetchWishlist();
  }, [ready, loggedIn]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`${API}/wishlist`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        cache: "no-store",
      });
      if (res.ok) setItems(await res.json());
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (dressId: number) => {
    await toggleWishlist(dressId);
    setItems((prev) => prev.filter((item) => item.dressId !== dressId));
  };

  // ── Belum login — prompt ──
  if (showLoginPrompt) {
    return (
      <div className="min-h-screen bg-[#f0ebe3] flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          {/* Icon */}
          <div className="w-16 h-16 rounded-full border border-stone-200 flex items-center justify-center mx-auto mb-8">
            <svg
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#a8a29e"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </div>
          <p className="font-sans text-[9px] tracking-[0.35em] uppercase text-stone-400 mb-3">
            Akses Terbatas
          </p>
          <h1
            className="font-serif font-[300] text-stone-800 mb-4"
            style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)" }}
          >
            Masuk untuk melihat <em className="italic">Wishlist</em>
          </h1>
          <p className="font-sans text-sm font-[300] text-stone-400 leading-relaxed mb-10">
            Simpan dress favoritmu dan temukan kembali kapan saja. Login dulu
            untuk mengakses wishlist.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/auth/login?redirect=/wishlist"
              className="w-full py-4 font-sans text-[10px] tracking-[0.3em] uppercase bg-stone-800 text-stone-100 text-center hover:bg-stone-900 transition-colors duration-300"
            >
              Masuk Sekarang
            </Link>
            <Link
              href="/auth/register"
              className="w-full py-3 font-sans text-[10px] tracking-[0.3em] uppercase border border-stone-300 text-stone-500 text-center hover:border-stone-500 hover:text-stone-700 transition-all duration-300"
            >
              Buat Akun Baru
            </Link>
            <button
              onClick={() => router.back()}
              className="font-sans text-[9px] tracking-[0.2em] uppercase text-stone-400 hover:text-stone-600 transition-colors mt-2"
            >
              ← Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0ebe3]">
      {/* Header */}
      <div className="pt-32 pb-14 px-6 text-center">
        <p className="font-sans text-[9px] tracking-[0.35em] uppercase text-stone-400 mb-3">
          {user?.fullName}
        </p>
        <h1
          className="font-serif font-[300] text-stone-800 leading-none mb-5"
          style={{ fontSize: "clamp(2.4rem, 6vw, 5rem)" }}
        >
          <em className="italic">Wishlist</em>
        </h1>
        <div className="flex items-center justify-center gap-4 mt-6">
          <div className="w-12 h-[1px] bg-stone-300" />
          <span className="font-sans text-[9px] tracking-[0.35em] uppercase text-stone-300">
            {loading ? "—" : `${items.length} dress`}
          </span>
          <div className="w-12 h-[1px] bg-stone-300" />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 md:px-10 pb-20">
        {loading ? (
          // Skeleton
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div
                  className="bg-stone-200 w-full rounded-sm"
                  style={{ aspectRatio: "3/4" }}
                />
                <div className="mt-4 space-y-2">
                  <div className="bg-stone-200 h-3 w-1/3 rounded" />
                  <div className="bg-stone-200 h-5 w-2/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          // Empty state
          <div className="text-center py-24">
            <div className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center mx-auto mb-6">
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#d6d3d1"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            </div>
            <p className="font-serif font-[300] text-stone-400 text-2xl mb-3">
              Wishlist masih kosong
            </p>
            <p className="font-sans text-sm text-stone-400 mb-8">
              Temukan dress impianmu dan simpan di sini
            </p>
            <Link
              href="/dresses"
              className="font-sans text-[10px] tracking-[0.25em] uppercase border border-stone-700 text-stone-700 px-8 py-3 hover:bg-stone-800 hover:text-stone-100 hover:border-stone-800 transition-all duration-300"
            >
              Jelajahi Koleksi
            </Link>
          </div>
        ) : (
          <>
            {/* Grid dress */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-14 md:gap-x-7">
              {items.map((item, i) => (
                <WishlistCard
                  key={item.id}
                  item={item}
                  isMid={i % 3 === 1}
                  onRemove={() => handleRemove(item.dressId)}
                />
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-20 pt-12 border-t border-stone-200/60">
              <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-stone-300 mb-6">
                {items.length} dress tersimpan
              </p>
              <Link
                href="/dresses"
                className="font-sans text-[10px] tracking-[0.25em] uppercase text-stone-500 hover:text-stone-800 transition-colors underline underline-offset-4"
              >
                Tambah dress lainnya
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// ── Kartu dress di halaman wishlist ──
function WishlistCard({
  item,
  isMid,
  onRemove,
}: {
  item: WishlistItem;
  isMid: boolean;
  onRemove: () => void;
}) {
  const { dress } = item;
  const thumb = getThumb(dress);
  const [removing, setRemoving] = useState(false);

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRemoving(true);
    await onRemove();
  };

  return (
    <div className="group" style={{ marginTop: isMid ? "-2rem" : "0" }}>
      <Link href={`/dresses/${dress.slug}`} className="block">
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
            <div className="w-full h-full flex items-center justify-center bg-[#e8e0d5]">
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

          {/* Tombol hapus dari wishlist — love icon terisi merah */}
          <button
            onClick={handleRemove}
            disabled={removing}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/95 backdrop-blur-sm transition-all duration-300 hover:scale-110"
            aria-label="Hapus dari wishlist"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill={removing ? "#d6d3d1" : "#e57373"}
              stroke={removing ? "#d6d3d1" : "#e57373"}
            >
              <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>

          <div className="absolute inset-0 bg-stone-900/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />

          {/* Hover overlay */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none">
            <span className="font-sans text-[9px] tracking-[0.25em] uppercase bg-[#f0ebe3]/90 backdrop-blur-sm text-stone-700 px-5 py-2">
              Lihat Detail
            </span>
          </div>
        </div>
      </Link>

      {/* Info dress */}
      <div className="mt-4">
        <p className="font-sans text-[9px] tracking-[0.25em] uppercase text-stone-400 mb-1.5">
          {dress.category?.name ?? "—"}
        </p>
        <h2
          className="font-serif font-[300] text-stone-800 leading-snug mb-1 group-hover:text-stone-500 transition-colors duration-300"
          style={{ fontSize: "clamp(1.1rem, 2vw, 1.4rem)" }}
        >
          {dress.name}
        </h2>
        <p className="font-sans text-[11px] text-stone-400 mb-4">
          {formatPrice(dress.pricePerDay)}
          <span className="text-stone-300"> / hari</span>
        </p>

        {/* Tombol pesan — hanya muncul kalau dress tersedia */}
        {dress.status === "available" && (
          <Link
            href={`/dresses/${dress.slug}`}
            className="inline-block font-sans text-[9px] tracking-[0.25em] uppercase border border-stone-700 text-stone-700 px-5 py-2 hover:bg-stone-800 hover:text-stone-100 hover:border-stone-800 transition-all duration-300"
          >
            Pesan Sekarang
          </Link>
        )}
      </div>
    </div>
  );
}
