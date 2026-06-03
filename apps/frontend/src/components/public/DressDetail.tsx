"use client";

// src/components/public/DressDetail.tsx

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";

const IMG_BASE = process.env.NEXT_PUBLIC_IMG_BASE ?? "http://localhost:3001";

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

const formatPrice = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const conditionLabel = { new: "Baru", good: "Baik", fair: "Cukup" };
const statusLabel = {
  available: { text: "Tersedia", color: "#6b7c6b" },
  unavailable: { text: "Tidak Tersedia", color: "#c0906060" },
  archived: { text: "Diarsipkan", color: "#a0a0a0" },
};

export default function DressDetail({ dress }: { dress: Dress }) {
  const router = useRouter();
  const { loggedIn } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(dress.id);

  // Sortir foto: thumbnail dulu, sisanya urut by order
  const sortedPhotos = [...(dress.photos ?? [])].sort((a, b) => {
    if (a.isThumbnail) return -1;
    if (b.isThumbnail) return 1;
    return a.order - b.order;
  });

  const [activePhoto, setActivePhoto] = useState(sortedPhotos[0] ?? null);
  const [selectedSize, setSelectedSize] = useState<DressSize | null>(
    dress.sizes?.length === 1 ? dress.sizes[0] : null,
  );
  const [activeTab, setActiveTab] = useState<"ukuran" | "detail">("ukuran");

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!loggedIn) {
      router.push(`/auth/login?redirect=/dresses/${dress.slug}`);
      return;
    }
    await toggleWishlist(dress.id);
  };

  const handleOrder = () => {
    if (!loggedIn) {
      router.push(`/auth/login?redirect=/dresses/${dress.slug}`);
      return;
    }
    // Nanti redirect ke halaman checkout dengan dressId dan selectedSize
    router.push(
      `/checkout?dressId=${dress.id}${selectedSize ? `&sizeId=${selectedSize.id}` : ""}`,
    );
  };

  const st = statusLabel[dress.status];

  return (
    <div className="min-h-screen bg-[#f0ebe3]">
      {/* Breadcrumb */}
      <div className="pt-24 pb-4 px-6 md:px-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="font-sans text-[9px] tracking-[0.2em] uppercase text-stone-400 hover:text-stone-600 transition-colors"
          >
            Home
          </Link>
          <span className="text-stone-300 text-xs">/</span>
          <Link
            href="/dresses"
            className="font-sans text-[9px] tracking-[0.2em] uppercase text-stone-400 hover:text-stone-600 transition-colors"
          >
            Dresses
          </Link>
          <span className="text-stone-300 text-xs">/</span>
          <span className="font-sans text-[9px] tracking-[0.2em] uppercase text-stone-600 truncate max-w-[160px]">
            {dress.name}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
          {/* ── Kiri: Galeri Foto ── */}
          <div className="flex flex-col gap-4">
            {/* Foto utama */}
            <div
              className="relative overflow-hidden bg-stone-200/60 w-full"
              style={{ aspectRatio: "3/4" }}
            >
              {activePhoto ? (
                <img
                  src={`${IMG_BASE}${activePhoto.url}`}
                  alt={dress.name}
                  className="w-full h-full object-cover object-top transition-opacity duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#e8e0d5]">
                  <span className="font-sans text-[9px] tracking-widest uppercase text-stone-400">
                    Foto belum tersedia
                  </span>
                </div>
              )}

              {/* Badge status */}
              {dress.status !== "available" && (
                <div className="absolute top-4 left-4 bg-stone-800/80 backdrop-blur-sm px-3 py-1.5">
                  <p className="font-sans text-[8px] tracking-[0.2em] uppercase text-stone-300">
                    {st.text}
                  </p>
                </div>
              )}

              {/* Tombol wishlist */}
              <button
                onClick={handleWishlist}
                className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:scale-110 transition-transform duration-200"
                aria-label={
                  wishlisted ? "Hapus dari wishlist" : "Tambah ke wishlist"
                }
              >
                <svg
                  width="17"
                  height="17"
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
            </div>

            {/* Thumbnail strip — hanya tampil kalau foto lebih dari 1 */}
            {sortedPhotos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {sortedPhotos.map((photo) => (
                  <button
                    key={photo.id}
                    onClick={() => setActivePhoto(photo)}
                    className="flex-shrink-0 overflow-hidden transition-all duration-200"
                    style={{
                      width: 72,
                      height: 96,
                      border: `2px solid ${activePhoto?.id === photo.id ? "#1c1917" : "transparent"}`,
                      opacity: activePhoto?.id === photo.id ? 1 : 0.55,
                    }}
                  >
                    <img
                      src={`${IMG_BASE}${photo.url}`}
                      alt=""
                      className="w-full h-full object-cover object-top"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Kanan: Info Dress ── */}
          <div className="flex flex-col">
            {/* Kategori */}
            <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-stone-400 mb-3">
              {dress.category?.name}
            </p>

            {/* Nama */}
            <h1
              className="font-serif font-[300] text-stone-800 leading-tight mb-4"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}
            >
              {dress.name}
            </h1>

            {/* Harga */}
            <div className="flex items-baseline gap-2 mb-2">
              <span
                className="font-serif font-[300] text-stone-800"
                style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.8rem)" }}
              >
                {formatPrice(dress.pricePerDay)}
              </span>
              <span className="font-sans text-[10px] tracking-[0.1em] uppercase text-stone-400">
                / hari
              </span>
            </div>
            {dress.minRentalDays > 1 && (
              <p className="font-sans text-[10px] text-stone-400 mb-6">
                Minimal sewa{" "}
                <span className="text-stone-600">
                  {dress.minRentalDays} hari
                </span>
              </p>
            )}

            {/* Garis pemisah */}
            <div className="w-full h-[1px] bg-stone-200 my-6" />

            {/* Deskripsi */}
            {dress.description && (
              <p className="font-sans font-[300] text-stone-500 text-sm leading-relaxed mb-8">
                {dress.description}
              </p>
            )}

            {/* Tab: Ukuran / Detail */}
            <div className="mb-6">
              <div className="flex border-b border-stone-200 mb-5">
                {(["ukuran", "detail"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="font-sans text-[9px] tracking-[0.2em] uppercase px-0 py-2 mr-6 transition-colors duration-200"
                    style={{
                      color: activeTab === tab ? "#1c1917" : "#a8a29e",
                      borderBottom: `1px solid ${activeTab === tab ? "#1c1917" : "transparent"}`,
                      marginBottom: -1,
                    }}
                  >
                    {tab === "ukuran" ? "Ukuran" : "Detail"}
                  </button>
                ))}
              </div>

              {/* Tab Ukuran */}
              {activeTab === "ukuran" && (
                <div>
                  {dress.sizes?.length > 0 ? (
                    <>
                      <p className="font-sans text-[9px] tracking-[0.15em] uppercase text-stone-400 mb-3">
                        Pilih ukuran
                      </p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        {dress.sizes.map((size) => (
                          <button
                            key={size.id}
                            onClick={() => setSelectedSize(size)}
                            disabled={size.stock === 0}
                            className="font-sans text-[10px] tracking-[0.1em] uppercase px-4 py-2 border transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{
                              borderColor:
                                selectedSize?.id === size.id
                                  ? "#1c1917"
                                  : "#d6d3d1",
                              background:
                                selectedSize?.id === size.id
                                  ? "#1c1917"
                                  : "transparent",
                              color:
                                selectedSize?.id === size.id
                                  ? "#f0ebe3"
                                  : "#78716c",
                            }}
                          >
                            {size.label}
                          </button>
                        ))}
                      </div>

                      {/* Tabel detail ukuran */}
                      {selectedSize && (
                        <div className="bg-stone-100/60 border border-stone-200 p-4">
                          <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-3">
                            Ukuran {selectedSize.label}
                          </p>
                          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                            {[
                              {
                                label: "Lingkar Dada",
                                value: selectedSize.bust,
                                unit: "cm",
                              },
                              {
                                label: "Lingkar Pinggang",
                                value: selectedSize.waist,
                                unit: "cm",
                              },
                              {
                                label: "Lingkar Pinggul",
                                value: selectedSize.hip,
                                unit: "cm",
                              },
                              {
                                label: "Panjang Dress",
                                value: selectedSize.length,
                                unit: "cm",
                              },
                              {
                                label: "Stok",
                                value: selectedSize.stock,
                                unit: "pcs",
                              },
                            ].map(
                              (item) =>
                                item.value !== null && (
                                  <div
                                    key={item.label}
                                    className="flex justify-between items-center py-1 border-b border-stone-200/60"
                                  >
                                    <span className="font-sans text-[9px] tracking-[0.1em] uppercase text-stone-400">
                                      {item.label}
                                    </span>
                                    <span className="font-sans text-xs text-stone-600">
                                      {item.value} {item.unit}
                                    </span>
                                  </div>
                                ),
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="font-sans text-sm text-stone-400">
                      Informasi ukuran belum tersedia
                    </p>
                  )}
                </div>
              )}

              {/* Tab Detail */}
              {activeTab === "detail" && (
                <div className="space-y-0">
                  {[
                    { label: "Warna", value: dress.color },
                    { label: "Material", value: dress.material },
                    {
                      label: "Kondisi",
                      value: conditionLabel[dress.condition],
                    },
                    { label: "Status", value: st.text },
                    { label: "Kategori", value: dress.category?.name },
                  ].map(
                    (item) =>
                      item.value && (
                        <div
                          key={item.label}
                          className="flex justify-between items-center py-3 border-b border-stone-200/60"
                        >
                          <span className="font-sans text-[9px] tracking-[0.2em] uppercase text-stone-400">
                            {item.label}
                          </span>
                          <span className="font-sans text-xs text-stone-600">
                            {item.value}
                          </span>
                        </div>
                      ),
                  )}
                </div>
              )}
            </div>

            {/* Tombol aksi */}
            <div className="flex flex-col gap-3 mt-auto pt-6">
              {dress.status === "available" ? (
                <>
                  <button
                    onClick={handleOrder}
                    className="w-full py-4 font-sans text-[10px] tracking-[0.3em] uppercase bg-stone-800 text-stone-100 hover:bg-stone-900 transition-colors duration-300"
                  >
                    Pesan Sekarang
                  </button>
                  <button
                    onClick={handleWishlist}
                    className="w-full py-3 font-sans text-[10px] tracking-[0.3em] uppercase border transition-all duration-300 flex items-center justify-center gap-2"
                    style={{
                      borderColor: wishlisted ? "#e57373" : "#d6d3d1",
                      color: wishlisted ? "#e57373" : "#78716c",
                    }}
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill={wishlisted ? "#e57373" : "none"}
                      stroke={wishlisted ? "#e57373" : "#78716c"}
                    >
                      <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                    {wishlisted
                      ? "Tersimpan di Wishlist"
                      : "Simpan ke Wishlist"}
                  </button>
                </>
              ) : (
                <div className="w-full py-4 font-sans text-[10px] tracking-[0.3em] uppercase bg-stone-100 text-stone-400 text-center cursor-not-allowed">
                  {st.text}
                </div>
              )}
            </div>

            {/* Info tambahan */}
            <div className="mt-6 pt-6 border-t border-stone-200 flex flex-col gap-2">
              {[
                {
                  icon: "M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12",
                  label: "Pengiriman ke wilayah Semarang",
                },
                {
                  icon: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
                  label: "Kondisi terjamin & sudah dicuci",
                },
                {
                  icon: "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99",
                  label: "Dapat diperpanjang sewa",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <svg
                    width="13"
                    height="13"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#a8a29e"
                    strokeWidth={1.5}
                    className="flex-shrink-0"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={item.icon}
                    />
                  </svg>
                  <span className="font-sans text-[10px] text-stone-400">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
