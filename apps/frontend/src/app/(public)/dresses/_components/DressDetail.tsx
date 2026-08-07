"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";
import Image from "next/image";
import { getToken } from "@/lib/auth";
import { apiFetch } from "@/lib/apiFetch";

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

const infoNotes = [
  {
    icon: "M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12",
    label: "Pengiriman ke wilayah Yogyakarta",
  },
  {
    icon: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    label: "Kondisi terjamin & sudah dicuci",
  },
];

export default function DressDetail({ dress }: { dress: Dress }) {
  const router = useRouter();
  const { loggedIn } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(dress.id);

  // thumbnail duluan, sisanya urut sesuai field order
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
  const [pendingOrder, setPendingOrder] = useState<{
    id: number;
    status: string;
  } | null>(null);
  const [checkingPending, setCheckingPending] = useState(true);

  // cek apakah user sudah punya order pending buat dress ini, supaya tidak order tidak terduplikat
  useEffect(() => {
    const checkPending = async () => {
      if (!loggedIn) {
        setCheckingPending(false);
        return;
      }
      try {
        const res = await apiFetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/orders/pending-check/${dress.id}`,
          { headers: { Authorization: `Bearer ${getToken()}` } },
        );
        if (res.ok) setPendingOrder(await res.json());
      } catch {
        // silent fail
      } finally {
        setCheckingPending(false);
      }
    };
    checkPending();
  }, [loggedIn, dress.id]);

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
    // ada order pending -> lanjutkan yang itu, jangan bikin baru
    if (pendingOrder) {
      router.push(`/orders/${pendingOrder.id}`);
      return;
    }
    router.push(
      `/checkout?dressId=${dress.id}${selectedSize ? `&sizeId=${selectedSize.id}` : ""}`,
    );
  };

  const st = statusLabel[dress.status];

  return (
    <div className="min-h-screen" style={{ background: "var(--user-bg)" }}>
      <Breadcrumb name={dress.name} />

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
          <PhotoGallery
            photos={sortedPhotos}
            activePhoto={activePhoto}
            onSelectPhoto={setActivePhoto}
            dressName={dress.name}
            statusText={dress.status !== "available" ? st.text : null}
            wishlisted={wishlisted}
            onWishlistClick={handleWishlist}
          />

          <div className="flex flex-col">
            <p
              className="font-sans text-[9px] tracking-[0.3em] uppercase mb-3"
              style={{ color: "var(--user-text-muted)" }}
            >
              {dress.category?.name}
            </p>

            <h1
              className="font-serif font-light leading-tight mb-4"
              style={{
                fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                color: "var(--user-text)",
              }}
            >
              {dress.name}
            </h1>

            <PriceInfo
              price={dress.pricePerDay}
              minDays={dress.minRentalDays}
            />

            <div
              className="w-full h-px my-6"
              style={{ background: "var(--user-border)" }}
            />

            {dress.description && (
              <p
                className="font-sans font-light text-sm leading-relaxed mb-8"
                style={{ color: "var(--user-text-secondary)" }}
              >
                {dress.description}
              </p>
            )}

            <DetailTabs
              activeTab={activeTab}
              onChangeTab={setActiveTab}
              dress={dress}
              selectedSize={selectedSize}
              onSelectSize={setSelectedSize}
              statusText={st.text}
            />

            <ActionButtons
              status={dress.status}
              statusText={st.text}
              pendingOrder={checkingPending ? null : pendingOrder}
              onOrder={handleOrder}
              onWishlist={handleWishlist}
              wishlisted={wishlisted}
            />

            <InfoNotes />
          </div>
        </div>
      </div>
    </div>
  );
}

// breadcrumb navigasi home / dresses / nama dress
function Breadcrumb({ name }: { name: string }) {
  const linkStyle = {
    className:
      "font-sans text-[9px] tracking-[0.2em] uppercase transition-colors",
    style: { color: "var(--user-text-muted)" } as React.CSSProperties,
    onMouseOver: (e: React.MouseEvent<HTMLAnchorElement>) =>
      (e.currentTarget.style.color = "var(--user-text-secondary)"),
    onMouseOut: (e: React.MouseEvent<HTMLAnchorElement>) =>
      (e.currentTarget.style.color = "var(--user-text-muted)"),
  };

  return (
    <div className="pt-24 pb-4 px-6 md:px-10 max-w-7xl mx-auto">
      <div className="flex items-center gap-2">
        <Link href="/" {...linkStyle}>
          Home
        </Link>
        <span className="text-xs" style={{ color: "var(--user-text-faint)" }}>
          /
        </span>
        <Link href="/dresses" {...linkStyle}>
          Dresses
        </Link>
        <span className="text-xs" style={{ color: "var(--user-text-faint)" }}>
          /
        </span>
        <span
          className="font-sans text-[9px] tracking-[0.2em] uppercase truncate max-w-40"
          style={{ color: "var(--user-text-secondary)" }}
        >
          {name}
        </span>
      </div>
    </div>
  );
}

// foto utama besar + strip thumbnail + tombol wishlist
function PhotoGallery({
  photos,
  activePhoto,
  onSelectPhoto,
  dressName,
  statusText,
  wishlisted,
  onWishlistClick,
}: {
  photos: DressPhoto[];
  activePhoto: DressPhoto | null;
  onSelectPhoto: (photo: DressPhoto) => void;
  dressName: string;
  statusText: string | null;
  wishlisted: boolean;
  onWishlistClick: (e: React.MouseEvent) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div
        className="relative overflow-hidden w-full"
        style={{ aspectRatio: "3/4", background: "var(--user-border)" }}
      >
        {activePhoto ? (
          <Image
            src={`${IMG_BASE}${activePhoto.url}`}
            alt={dressName}
            fill
            className="object-cover object-top transition-opacity duration-300"
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

        {statusText && (
          <div
            className="absolute top-4 left-4 backdrop-blur-sm px-3 py-1.5"
            style={{
              background:
                "color-mix(in srgb, var(--user-text) 80%, transparent)",
            }}
          >
            <p
              className="font-sans text-[8px] tracking-[0.2em] uppercase"
              style={{ color: "var(--user-text-faint)" }}
            >
              {statusText}
            </p>
          </div>
        )}

        <button
          onClick={onWishlistClick}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:scale-110 transition-transform duration-200"
          aria-label={wishlisted ? "Hapus dari wishlist" : "Tambah ke wishlist"}
        >
          <HeartIcon size={17} filled={wishlisted} />
        </button>
      </div>

      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((photo) => (
            <button
              key={photo.id}
              onClick={() => onSelectPhoto(photo)}
              className="shrink-0 overflow-hidden transition-all duration-200"
              style={{
                width: 72,
                height: 96,
                position: "relative",
                border: `2px solid ${activePhoto?.id === photo.id ? "var(--user-text)" : "transparent"}`,
                opacity: activePhoto?.id === photo.id ? 1 : 0.55,
              }}
            >
              <Image
                src={`${IMG_BASE}${photo.url}`}
                alt=""
                fill
                className="object-cover object-top"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// harga per hari + syarat minimal sewa
function PriceInfo({ price, minDays }: { price: number; minDays: number }) {
  return (
    <>
      <div className="flex items-baseline gap-2 mb-2">
        <span
          className="font-serif font-light"
          style={{
            fontSize: "clamp(1.4rem, 2.5vw, 1.8rem)",
            color: "var(--user-text)",
          }}
        >
          {formatPrice(price)}
        </span>
        <span
          className="font-sans text-[10px] tracking-widest uppercase"
          style={{ color: "var(--user-text-muted)" }}
        >
          / hari
        </span>
      </div>
      {minDays > 1 && (
        <p
          className="font-sans text-[10px] mb-6"
          style={{ color: "var(--user-text-muted)" }}
        >
          Minimal sewa{" "}
          <span style={{ color: "var(--user-text-secondary)" }}>
            {minDays} hari
          </span>
        </p>
      )}
    </>
  );
}

// tab ukuran & detail, isinya beda tergantung tab yang aktif
function DetailTabs({
  activeTab,
  onChangeTab,
  dress,
  selectedSize,
  onSelectSize,
  statusText,
}: {
  activeTab: "ukuran" | "detail";
  onChangeTab: (tab: "ukuran" | "detail") => void;
  dress: Dress;
  selectedSize: DressSize | null;
  onSelectSize: (size: DressSize) => void;
  statusText: string;
}) {
  return (
    <div className="mb-6">
      <div
        className="flex mb-5"
        style={{ borderBottom: "1px solid var(--user-border)" }}
      >
        {(["ukuran", "detail"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onChangeTab(tab)}
            className="font-sans text-[9px] tracking-[0.2em] uppercase px-0 py-2 mr-6 transition-colors duration-200"
            style={{
              color:
                activeTab === tab
                  ? "var(--user-text)"
                  : "var(--user-text-muted)",
              borderBottom: `1px solid ${activeTab === tab ? "var(--user-text)" : "transparent"}`,
              marginBottom: -1,
            }}
          >
            {tab === "ukuran" ? "Ukuran" : "Detail"}
          </button>
        ))}
      </div>

      {activeTab === "ukuran" && (
        <SizeTab
          dress={dress}
          selectedSize={selectedSize}
          onSelectSize={onSelectSize}
        />
      )}

      {activeTab === "detail" && (
        <InfoTab dress={dress} statusText={statusText} />
      )}
    </div>
  );
}

// daftar ukuran + tabel ukuran badan setelah salah satu dipilih
function SizeTab({
  dress,
  selectedSize,
  onSelectSize,
}: {
  dress: Dress;
  selectedSize: DressSize | null;
  onSelectSize: (size: DressSize) => void;
}) {
  if (!dress.sizes?.length) {
    return (
      <p
        className="font-sans text-sm"
        style={{ color: "var(--user-text-muted)" }}
      >
        Informasi ukuran belum tersedia
      </p>
    );
  }

  const measurements = selectedSize
    ? [
        { label: "Lingkar Dada", value: selectedSize.bust, unit: "cm" },
        { label: "Lingkar Pinggang", value: selectedSize.waist, unit: "cm" },
        { label: "Lingkar Pinggul", value: selectedSize.hip, unit: "cm" },
        { label: "Panjang Dress", value: selectedSize.length, unit: "cm" },
        { label: "Stok", value: selectedSize.stock, unit: "pcs" },
      ].filter((item) => item.value !== null)
    : [];

  return (
    <div>
      <p
        className="font-sans text-[9px] tracking-[0.15em] uppercase mb-3"
        style={{ color: "var(--user-text-muted)" }}
      >
        Pilih ukuran
      </p>
      <div className="flex flex-wrap gap-2 mb-5">
        {dress.sizes.map((size) => (
          <button
            key={size.id}
            onClick={() => onSelectSize(size)}
            disabled={size.stock === 0}
            className="font-sans text-[10px] tracking-widest uppercase px-4 py-2 border transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              borderColor:
                selectedSize?.id === size.id
                  ? "var(--user-text)"
                  : "var(--user-border)",
              background:
                selectedSize?.id === size.id
                  ? "var(--user-text)"
                  : "transparent",
              color:
                selectedSize?.id === size.id
                  ? "var(--user-bg)"
                  : "var(--user-text-secondary)",
            }}
          >
            {size.label}
          </button>
        ))}
      </div>

      {selectedSize && (
        <div
          style={{
            background: "var(--user-bg-alt)",
            border: "1px solid var(--user-border)",
          }}
          className="p-4"
        >
          <p
            className="font-sans text-[9px] tracking-[0.2em] uppercase mb-3"
            style={{ color: "var(--user-text-muted)" }}
          >
            Ukuran {selectedSize.label}
          </p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            {measurements.map((item) => (
              <div
                key={item.label}
                className="flex justify-between items-center py-1"
                style={{ borderBottom: "1px solid var(--user-border)" }}
              >
                <span
                  className="font-sans text-[9px] tracking-widest uppercase"
                  style={{ color: "var(--user-text-muted)" }}
                >
                  {item.label}
                </span>
                <span
                  className="font-sans text-xs"
                  style={{ color: "var(--user-text-secondary)" }}
                >
                  {item.value} {item.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// warna, material, kondisi, status, kategori dalam bentuk daftar
function InfoTab({ dress, statusText }: { dress: Dress; statusText: string }) {
  const rows = [
    { label: "Warna", value: dress.color },
    { label: "Material", value: dress.material },
    { label: "Kondisi", value: conditionLabel[dress.condition] },
    { label: "Status", value: statusText },
    { label: "Kategori", value: dress.category?.name },
  ].filter((item) => item.value);

  return (
    <div className="space-y-0">
      {rows.map((item) => (
        <div
          key={item.label}
          className="flex justify-between items-center py-3"
          style={{ borderBottom: "1px solid var(--user-border)" }}
        >
          <span
            className="font-sans text-[9px] tracking-[0.2em] uppercase"
            style={{ color: "var(--user-text-muted)" }}
          >
            {item.label}
          </span>
          <span
            className="font-sans text-xs"
            style={{ color: "var(--user-text-secondary)" }}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// tombol pesan / wishlist, atau label "tidak tersedia" kalau stok habis
function ActionButtons({
  status,
  statusText,
  pendingOrder,
  onOrder,
  onWishlist,
  wishlisted,
}: {
  status: string;
  statusText: string;
  pendingOrder: { id: number } | null;
  onOrder: () => void;
  onWishlist: (e: React.MouseEvent) => void;
  wishlisted: boolean;
}) {
  if (status !== "available") {
    return (
      <div className="flex flex-col gap-3 mt-auto pt-6">
        <div
          className="w-full py-4 font-sans text-[10px] tracking-[0.3em] uppercase text-center cursor-not-allowed"
          style={{
            background: "var(--user-bg-alt)",
            color: "var(--user-text-muted)",
          }}
        >
          {statusText}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 mt-auto pt-6">
      {pendingOrder && (
        <div
          className="mb-3 px-4 py-3 text-center"
          style={{
            background: "rgba(176,128,64,0.08)",
            border: "1px solid rgba(176,128,64,0.2)",
          }}
        >
          <p className="font-sans text-xs" style={{ color: "#b08040" }}>
            Kamu punya pesanan yang belum dibayar untuk dress ini
          </p>
        </div>
      )}

      <button
        onClick={onOrder}
        className="w-full py-4 font-sans text-[10px] tracking-[0.3em] uppercase transition-colors duration-300"
        style={{ background: "var(--user-text)", color: "var(--user-bg)" }}
        onMouseOver={(e) => (e.currentTarget.style.opacity = "0.85")}
        onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
      >
        Pesan Sekarang
      </button>

      <button
        onClick={onWishlist}
        className="w-full py-3 font-sans text-[10px] tracking-[0.3em] uppercase border transition-all duration-300 flex items-center justify-center gap-2"
        style={{
          borderColor: wishlisted ? "#e57373" : "var(--user-border)",
          color: wishlisted ? "#e57373" : "var(--user-text-secondary)",
        }}
      >
        <HeartIcon size={13} filled={wishlisted} />
        {wishlisted ? "Tersimpan di Wishlist" : "Simpan ke Wishlist"}
      </button>
    </div>
  );
}

// catatan kecil soal pengiriman & kondisi barang, di paling bawah
function InfoNotes() {
  return (
    <div
      className="mt-6 pt-6 flex flex-col gap-2"
      style={{ borderTop: "1px solid var(--user-border)" }}
    >
      {infoNotes.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <svg
            width="13"
            height="13"
            fill="none"
            viewBox="0 0 24 24"
            stroke="var(--user-text-muted)"
            strokeWidth={1.5}
            className="shrink-0"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
          </svg>
          <span
            className="font-sans text-[10px]"
            style={{ color: "var(--user-text-muted)" }}
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// icon hati, dipakai di galeri foto & tombol wishlist
function HeartIcon({ size, filled }: { size: number; filled: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={filled ? "#e57373" : "none"}
      stroke={filled ? "#e57373" : "var(--user-text-secondary)"}
    >
      <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  );
}
