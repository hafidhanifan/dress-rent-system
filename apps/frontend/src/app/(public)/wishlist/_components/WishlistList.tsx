"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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

// satu baris wishlist, menempel ke satu dress
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
      // biarkan loading selesai, list tetap kosong
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (dressId: number) => {
    await toggleWishlist(dressId);
    setItems((prev) => prev.filter((item) => item.dressId !== dressId));
  };

  if (showLoginPrompt) {
    return <LoginPrompt onBack={() => router.back()} />;
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--user-bg)" }}>
      <PageHeader
        userName={user?.fullName}
        count={items.length}
        loading={loading}
      />

      <main className="max-w-7xl mx-auto px-6 md:px-10 pb-20">
        {loading ? (
          <SkeletonGrid />
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <>
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

            <div
              className="text-center mt-20 pt-12"
              style={{ borderTop: "1px solid var(--user-border)" }}
            >
              <p
                className="font-sans text-[9px] tracking-[0.2em] uppercase mb-6"
                style={{ color: "var(--user-text-faint)" }}
              >
                {items.length} dress tersimpan
              </p>
              <Link
                href="/dresses"
                className="font-sans text-[10px] tracking-[0.25em] uppercase transition-colors underline underline-offset-4"
                style={{ color: "var(--user-text-secondary)" }}
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

// tampilan saat user belum login sama sekali
function LoginPrompt({ onBack }: { onBack: () => void }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "var(--user-bg)" }}
    >
      <div className="text-center max-w-sm">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{ border: "1px solid var(--user-border)" }}
        >
          <HeartIcon size={24} color="var(--user-text-muted)" strokeWidth={1} />
        </div>

        <p
          className="font-sans text-[9px] tracking-[0.35em] uppercase mb-3"
          style={{ color: "var(--user-text-muted)" }}
        >
          Akses Terbatas
        </p>
        <h1
          className="font-serif font-light mb-4"
          style={{
            fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
            color: "var(--user-text)",
          }}
        >
          Masuk untuk melihat <em className="italic">Wishlist</em>
        </h1>
        <p
          className="font-sans text-sm font-light leading-relaxed mb-10"
          style={{ color: "var(--user-text-muted)" }}
        >
          Simpan dress favoritmu dan temukan kembali kapan saja. Login dulu
          untuk mengakses wishlist.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/auth/login?redirect=/wishlist"
            className="w-full py-4 font-sans text-[10px] tracking-[0.3em] uppercase text-center transition-colors duration-300"
            style={{ background: "var(--user-text)", color: "var(--user-bg)" }}
          >
            Masuk Sekarang
          </Link>
          <Link
            href="/auth/register"
            className="w-full py-3 font-sans text-[10px] tracking-[0.3em] uppercase text-center transition-all duration-300"
            style={{
              border: "1px solid var(--user-border)",
              color: "var(--user-text-secondary)",
            }}
          >
            Buat Akun Baru
          </Link>
          <button
            onClick={onBack}
            className="font-sans text-[9px] tracking-[0.2em] uppercase transition-colors mt-2"
            style={{ color: "var(--user-text-muted)" }}
          >
            ← Kembali
          </button>
        </div>
      </div>
    </div>
  );
}

// nama user + judul halaman + counter jumlah wishlist
function PageHeader({
  userName,
  count,
  loading,
}: {
  userName?: string;
  count: number;
  loading: boolean;
}) {
  return (
    <div className="pt-32 pb-14 px-6 text-center">
      <p
        className="font-sans text-[9px] tracking-[0.35em] uppercase mb-3"
        style={{ color: "var(--user-text-muted)" }}
      >
        {userName}
      </p>
      <h1
        className="font-serif font-light leading-none mb-5"
        style={{
          fontSize: "clamp(2.4rem, 6vw, 5rem)",
          color: "var(--user-text)",
        }}
      >
        <em className="italic">Wishlist</em>
      </h1>
      <div className="flex items-center justify-center gap-4 mt-6">
        <div
          className="w-12 h-px"
          style={{ background: "var(--user-text-faint)" }}
        />
        <span
          className="font-sans text-[9px] tracking-[0.35em] uppercase"
          style={{ color: "var(--user-text-faint)" }}
        >
          {loading ? "—" : `${count} dress`}
        </span>
        <div
          className="w-12 h-px"
          style={{ background: "var(--user-text-faint)" }}
        />
      </div>
    </div>
  );
}

// placeholder loading, 3 kartu kosong berkedip
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div
            className="w-full rounded-sm"
            style={{ aspectRatio: "3/4", background: "var(--user-border)" }}
          />
          <div className="mt-4 space-y-2">
            <div
              className="h-3 w-1/3 rounded"
              style={{ background: "var(--user-border)" }}
            />
            <div
              className="h-5 w-2/3 rounded"
              style={{ background: "var(--user-border)" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// tampilan saat wishlist masih kosong
function EmptyState() {
  return (
    <div className="text-center py-24">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ border: "1px solid var(--user-border)" }}
      >
        <HeartIcon size={20} color="var(--user-text-faint)" strokeWidth={1} />
      </div>
      <p
        className="font-serif font-light text-2xl mb-3"
        style={{ color: "var(--user-text-muted)" }}
      >
        Wishlist masih kosong
      </p>
      <p
        className="font-sans text-sm mb-8"
        style={{ color: "var(--user-text-muted)" }}
      >
        Temukan dress impianmu dan simpan di sini
      </p>
      <Link
        href="/dresses"
        className="font-sans text-[10px] tracking-[0.25em] uppercase px-8 py-3 transition-all duration-300"
        style={{
          border: "1px solid var(--user-text)",
          color: "var(--user-text)",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = "var(--user-text)";
          e.currentTarget.style.color = "var(--user-bg)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--user-text)";
        }}
      >
        Jelajahi Koleksi
      </Link>
    </div>
  );
}

// satu kartu dress di grid wishlist, dengan tombol hapus di pojok
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
          className="relative overflow-hidden w-full"
          style={{ aspectRatio: "3/4", background: "var(--user-border)" }}
        >
          {thumb ? (
            <Image
              src={`${IMG_BASE}${thumb.url}`}
              alt={dress.name}
              fill
              className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: "var(--user-border)" }}
            >
              <span
                className="font-sans text-[9px] tracking-widest uppercase"
                style={{ color: "var(--user-text-muted)" }}
              >
                Foto belum tersedia
              </span>
            </div>
          )}

          {dress.status === "unavailable" && (
            <div
              className="absolute top-3 left-3 backdrop-blur-sm px-3 py-1"
              style={{
                background:
                  "color-mix(in srgb, var(--user-text) 80%, transparent)",
              }}
            >
              <p
                className="font-sans text-[8px] tracking-[0.2em] uppercase"
                style={{ color: "var(--user-text-faint)" }}
              >
                Tidak Tersedia
              </p>
            </div>
          )}

          <button
            onClick={handleRemove}
            disabled={removing}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/95 backdrop-blur-sm transition-all duration-300 hover:scale-110"
            aria-label="Hapus dari wishlist"
          >
            <HeartIcon
              size={16}
              color={removing ? "var(--user-border)" : "#e57373"}
              filled
            />
          </button>

          <div
            className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none"
            style={{
              background:
                "color-mix(in srgb, var(--user-text) 10%, transparent)",
            }}
          />

          <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none">
            <span
              className="font-sans text-[9px] tracking-[0.25em] uppercase backdrop-blur-sm px-5 py-2"
              style={{
                background:
                  "color-mix(in srgb, var(--user-bg) 90%, transparent)",
                color: "var(--user-text-secondary)",
              }}
            >
              Lihat Detail
            </span>
          </div>
        </div>
      </Link>

      <div className="mt-4">
        <p
          className="font-sans text-[9px] tracking-[0.25em] uppercase mb-1.5"
          style={{ color: "var(--user-text-muted)" }}
        >
          {dress.category?.name ?? "—"}
        </p>
        <h2
          className="font-serif font-light leading-snug mb-1 transition-colors duration-300"
          style={{
            fontSize: "clamp(1.1rem, 2vw, 1.4rem)",
            color: "var(--user-text)",
          }}
        >
          {dress.name}
        </h2>
        <p
          className="font-sans text-[11px] mb-4"
          style={{ color: "var(--user-text-muted)" }}
        >
          {formatPrice(dress.pricePerDay)}
          <span style={{ color: "var(--user-text-faint)" }}> / hari</span>
        </p>

        {dress.status === "available" && (
          <Link
            href={`/dresses/${dress.slug}`}
            className="inline-block font-sans text-[9px] tracking-[0.25em] uppercase px-5 py-2 transition-all duration-300"
            style={{
              border: "1px solid var(--user-text)",
              color: "var(--user-text)",
            }}
          >
            Pesan Sekarang
          </Link>
        )}
      </div>
    </div>
  );
}

// icon hati, dipakai di prompt login, empty state, dan tombol hapus
function HeartIcon({
  size,
  color,
  strokeWidth = 1.5,
  filled = false,
}: {
  size: number;
  color: string;
  strokeWidth?: number;
  filled?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={filled ? color : "none"}
      stroke={color}
    >
      <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  );
}
