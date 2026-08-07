"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getToken } from "@/lib/auth";
import { apiFetch } from "@/lib/apiFetch";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const IMG_BASE = process.env.NEXT_PUBLIC_IMG_BASE ?? "http://localhost:3001";

type OrderStatus =
  | "pending"
  | "paid"
  | "confirmed"
  | "active"
  | "returned"
  | "cancelled";

type Order = {
  id: number;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  status: OrderStatus;
  dress: {
    id: number;
    name: string;
    slug: string;
    photos: { id: number; url: string; isThumbnail: boolean; order: number }[];
    category: { name: string };
  };
  size: { label: string } | null;
  createdAt: string;
};

const formatPrice = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const formatDate = (s: string) =>
  new Date(s).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// warna badge status, tiap status punya warna khas sendiri
const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  pending: {
    label: "Menunggu Bayar",
    color: "#b08040",
    bg: "rgba(176,128,64,0.08)",
    border: "rgba(176,128,64,0.25)",
  },
  paid: {
    label: "Sudah Dibayar",
    color: "#4a7c5a",
    bg: "rgba(74,124,90,0.08)",
    border: "rgba(74,124,90,0.25)",
  },
  confirmed: {
    label: "Dikonfirmasi",
    color: "#4a7c5a",
    bg: "rgba(74,124,90,0.08)",
    border: "rgba(74,124,90,0.25)",
  },
  active: {
    label: "Sedang Disewa",
    color: "#4060a0",
    bg: "rgba(64,96,160,0.08)",
    border: "rgba(64,96,160,0.25)",
  },
  returned: {
    label: "Dikembalikan",
    color: "#6b7280",
    bg: "rgba(107,114,128,0.08)",
    border: "rgba(107,114,128,0.25)",
  },
  cancelled: {
    label: "Dibatalkan",
    color: "#c05050",
    bg: "rgba(192,80,80,0.08)",
    border: "rgba(192,80,80,0.25)",
  },
};

const filterOptions: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "pending", label: "Menunggu Bayar" },
  { value: "paid", label: "Sudah Dibayar" },
  { value: "confirmed", label: "Dikonfirmasi" },
  { value: "active", label: "Sedang Disewa" },
  { value: "returned", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
];

export default function OrdersList() {
  const router = useRouter();
  const { user, loggedIn, ready } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<OrderStatus | "all">("all");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`${API}/orders`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        cache: "no-store",
      });
      if (res.ok) setOrders(await res.json());
    } catch {
      // gagal ambil data -> list tetap kosong, tidak crash
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ready && !loggedIn) {
      router.push("/auth/login?redirect=/orders");
      return;
    }
    if (ready && loggedIn) fetchOrders();
  }, [ready, loggedIn, router, fetchOrders]);

  const filtered =
    activeFilter === "all"
      ? orders
      : orders.filter((o) => o.status === activeFilter);

  if (!ready) return null;

  return (
    <div className="min-h-screen" style={{ background: "var(--user-bg)" }}>
      <PageHeader userName={user?.fullName} />

      <div className="max-w-5xl mx-auto px-6 md:px-10 pb-20">
        <FilterPills active={activeFilter} onChange={setActiveFilter} />

        {loading ? (
          <SkeletonList />
        ) : filtered.length === 0 ? (
          <EmptyState isFiltered={activeFilter !== "all"} />
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div
            className="text-center mt-10 pt-8"
            style={{ borderTop: "1px solid var(--user-border)" }}
          >
            <p
              className="font-sans text-[9px] tracking-[0.2em] uppercase"
              style={{ color: "var(--user-text-faint)" }}
            >
              {filtered.length} pesanan ditampilkan
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// nama user + judul halaman
function PageHeader({ userName }: { userName?: string }) {
  return (
    <div className="pt-32 pb-10 px-6 md:px-10 max-w-5xl mx-auto">
      <p
        className="font-sans text-[9px] tracking-[0.35em] uppercase mb-2"
        style={{ color: "var(--user-text-muted)" }}
      >
        {userName}
      </p>
      <h1
        className="font-serif font-light leading-none"
        style={{
          fontSize: "clamp(2rem, 5vw, 3.5rem)",
          color: "var(--user-text)",
        }}
      >
        Pesanan <em className="italic">Saya</em>
      </h1>
    </div>
  );
}

// pill filter status di atas daftar pesanan
function FilterPills({
  active,
  onChange,
}: {
  active: OrderStatus | "all";
  onChange: (value: OrderStatus | "all") => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap mb-8">
      {filterOptions.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="font-sans text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 rounded-full transition-all duration-200"
          style={{
            background:
              active === opt.value ? "var(--user-text)" : "transparent",
            color:
              active === opt.value
                ? "var(--user-bg)"
                : "var(--user-text-muted)",
            border: `1px solid ${active === opt.value ? "var(--user-text)" : "var(--user-border)"}`,
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// placeholder loading, 3 baris kosong berkedip
function SkeletonList() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="animate-pulse p-5 flex gap-5"
          style={{
            background:
              "color-mix(in srgb, var(--user-bg-alt) 50%, transparent)",
            border: "1px solid var(--user-border)",
          }}
        >
          <div
            className="w-20 h-28 shrink-0"
            style={{ background: "var(--user-border)" }}
          />
          <div className="flex-1 space-y-3 pt-1">
            <div
              className="h-3 w-1/4 rounded"
              style={{ background: "var(--user-border)" }}
            />
            <div
              className="h-5 w-1/2 rounded"
              style={{ background: "var(--user-border)" }}
            />
            <div
              className="h-3 w-1/3 rounded"
              style={{ background: "var(--user-border)" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// tampilan saat belum ada pesanan / filter tidak ketemu apa-apa
function EmptyState({ isFiltered }: { isFiltered: boolean }) {
  return (
    <div className="text-center py-24">
      <p
        className="font-serif font-light text-2xl mb-3"
        style={{ color: "var(--user-text-muted)" }}
      >
        {isFiltered ? "Tidak ada pesanan di kategori ini" : "Belum ada pesanan"}
      </p>
      <p
        className="font-sans text-sm mb-8"
        style={{ color: "var(--user-text-muted)" }}
      >
        {isFiltered
          ? "Coba filter lainnya"
          : "Mulai sewa dress impianmu sekarang"}
      </p>
      {!isFiltered && (
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
      )}
    </div>
  );
}

// satu baris pesanan di daftar, klik untuk buka detail order
function OrderCard({ order }: { order: Order }) {
  const thumb =
    order.dress.photos?.find((p) => p.isThumbnail) ?? order.dress.photos?.[0];
  const st = statusConfig[order.status];

  return (
    <Link
      href={`/orders/${order.id}`}
      className="block p-5 transition-all duration-200 group"
      style={{
        background: "color-mix(in srgb, var(--user-bg-alt) 50%, transparent)",
        border: "1px solid var(--user-border)",
      }}
    >
      <div className="flex gap-5">
        <div
          className="relative shrink-0 w-20 overflow-hidden"
          style={{ aspectRatio: "3/4", background: "var(--user-border)" }}
        >
          {thumb ? (
            <Image
              src={`${IMG_BASE}${thumb.url}`}
              alt={order.dress.name}
              fill
              className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{ background: "var(--user-border)" }}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <p
                className="font-sans text-[9px] tracking-[0.2em] uppercase mb-1"
                style={{ color: "var(--user-text-muted)" }}
              >
                {order.dress.category?.name} · #
                {String(order.id).padStart(5, "0")}
              </p>
              <h3
                className="font-serif font-light leading-tight transition-colors"
                style={{
                  fontSize: "clamp(1rem, 2vw, 1.25rem)",
                  color: "var(--user-text)",
                }}
              >
                {order.dress.name}
              </h3>
            </div>

            <span
              className="shrink-0 font-sans text-[8px] tracking-[0.15em] uppercase px-2.5 py-1 border"
              style={{
                color: st.color,
                background: st.bg,
                borderColor: st.border,
              }}
            >
              {st.label}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3">
            <MetaItem
              icon="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
              text={`${formatDate(order.startDate)} — ${formatDate(order.endDate)}`}
            />
            <MetaItem
              icon="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              text={`${order.totalDays} hari`}
            />
            {order.size && (
              <span
                className="font-sans text-[10px]"
                style={{ color: "var(--user-text-muted)" }}
              >
                Ukuran {order.size.label}
              </span>
            )}
          </div>

          <div
            className="flex items-center justify-between mt-3 pt-3"
            style={{ borderTop: "1px solid var(--user-border)" }}
          >
            <span
              className="font-sans text-[9px] tracking-widest uppercase"
              style={{ color: "var(--user-text-muted)" }}
            >
              Total
            </span>
            <span
              className="font-serif font-light"
              style={{ color: "var(--user-text-secondary)" }}
            >
              {formatPrice(order.totalPrice)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// satu baris info kecil dengan icon (tanggal, durasi), dipakai di OrderCard
function MetaItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <svg
        width="11"
        height="11"
        fill="none"
        viewBox="0 0 24 24"
        stroke="var(--user-text-muted)"
        strokeWidth={1.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
      <span
        className="font-sans text-[10px]"
        style={{ color: "var(--user-text-muted)" }}
      >
        {text}
      </span>
    </div>
  );
}
