// Client Component
// ══════════════════════════════════════════════════

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getToken } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const IMG_BASE = process.env.NEXT_PUBLIC_IMG_BASE ?? "http://localhost:3001";

type Order = {
  id: number;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  status:
    | "pending"
    | "paid"
    | "confirmed"
    | "active"
    | "returned"
    | "cancelled";
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

const statusConfig = {
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

const filterOptions = [
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
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    if (ready && !loggedIn) {
      router.push("/auth/login?redirect=/orders");
      return;
    }
    if (ready && loggedIn) fetchOrders();
  }, [ready, loggedIn]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/orders`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        cache: "no-store",
      });
      if (res.ok) setOrders(await res.json());
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const filtered =
    activeFilter === "all"
      ? orders
      : orders.filter((o) => o.status === activeFilter);

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-[#f0ebe3]">
      {/* Header */}
      <div className="pt-32 pb-10 px-6 md:px-10 max-w-5xl mx-auto">
        <p className="font-sans text-[9px] tracking-[0.35em] uppercase text-stone-400 mb-2">
          {user?.fullName}
        </p>
        <h1
          className="font-serif font-[300] text-stone-800 leading-none"
          style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
        >
          Pesanan <em className="italic">Saya</em>
        </h1>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-10 pb-20">
        {/* Filter pills */}
        <div className="flex items-center gap-2 flex-wrap mb-8">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setActiveFilter(opt.value)}
              className="font-sans text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 rounded-full border transition-all duration-200"
              style={{
                background:
                  activeFilter === opt.value ? "#1c1917" : "transparent",
                color: activeFilter === opt.value ? "#f0ebe3" : "#a8a29e",
                borderColor: activeFilter === opt.value ? "#1c1917" : "#d6d3d1",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {loading ? (
          // Skeleton
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white/50 border border-stone-200/60 p-5 flex gap-5"
              >
                <div className="w-20 h-28 bg-stone-200 flex-shrink-0" />
                <div className="flex-1 space-y-3 pt-1">
                  <div className="h-3 bg-stone-200 w-1/4 rounded" />
                  <div className="h-5 bg-stone-200 w-1/2 rounded" />
                  <div className="h-3 bg-stone-200 w-1/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          // Empty state
          <div className="text-center py-24">
            <p className="font-serif font-[300] text-stone-400 text-2xl mb-3">
              {activeFilter === "all"
                ? "Belum ada pesanan"
                : "Tidak ada pesanan di kategori ini"}
            </p>
            <p className="font-sans text-sm text-stone-400 mb-8">
              {activeFilter === "all"
                ? "Mulai sewa dress impianmu sekarang"
                : "Coba filter lainnya"}
            </p>
            {activeFilter === "all" && (
              <Link
                href="/dresses"
                className="font-sans text-[10px] tracking-[0.25em] uppercase border border-stone-700 text-stone-700 px-8 py-3 hover:bg-stone-800 hover:text-stone-100 hover:border-stone-800 transition-all duration-300"
              >
                Jelajahi Koleksi
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => {
              const thumb =
                order.dress.photos?.find((p) => p.isThumbnail) ??
                order.dress.photos?.[0];
              const st = statusConfig[order.status];
              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block bg-white/50 border border-stone-200/60 p-5 hover:border-stone-300 transition-all duration-200 group"
                >
                  <div className="flex gap-5">
                    {/* Foto dress */}
                    <div
                      className="flex-shrink-0 w-20 overflow-hidden bg-stone-100"
                      style={{ aspectRatio: "3/4" }}
                    >
                      {thumb ? (
                        <img
                          src={`${IMG_BASE}${thumb.url}`}
                          alt={order.dress.name}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#e8e0d5]" />
                      )}
                    </div>

                    {/* Info pesanan */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-1">
                            {order.dress.category?.name} · #
                            {String(order.id).padStart(5, "0")}
                          </p>
                          <h3
                            className="font-serif font-[300] text-stone-800 leading-tight group-hover:text-stone-500 transition-colors"
                            style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)" }}
                          >
                            {order.dress.name}
                          </h3>
                        </div>

                        {/* Badge status */}
                        <span
                          className="flex-shrink-0 font-sans text-[8px] tracking-[0.15em] uppercase px-2.5 py-1 border"
                          style={{
                            color: st.color,
                            background: st.bg,
                            borderColor: st.border,
                          }}
                        >
                          {st.label}
                        </span>
                      </div>

                      {/* Detail singkat */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3">
                        <div className="flex items-center gap-1.5">
                          <svg
                            width="11"
                            height="11"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="#a8a29e"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                            />
                          </svg>
                          <span className="font-sans text-[10px] text-stone-400">
                            {formatDate(order.startDate)} —{" "}
                            {formatDate(order.endDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <svg
                            width="11"
                            height="11"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="#a8a29e"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                            />
                          </svg>
                          <span className="font-sans text-[10px] text-stone-400">
                            {order.totalDays} hari
                          </span>
                        </div>
                        {order.size && (
                          <div className="flex items-center gap-1.5">
                            <span className="font-sans text-[10px] text-stone-400">
                              Ukuran {order.size.label}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Total harga */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100">
                        <span className="font-sans text-[9px] tracking-[0.1em] uppercase text-stone-400">
                          Total
                        </span>
                        <span className="font-serif font-[300] text-stone-700">
                          {formatPrice(order.totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Counter */}
        {!loading && filtered.length > 0 && (
          <div className="text-center mt-10 pt-8 border-t border-stone-200/60">
            <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-stone-300">
              {filtered.length} pesanan ditampilkan
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
