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
  dressId: number;
  sizeId: number | null;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  contactPhone: string;
  notes: string | null;
  status:
    | "pending"
    | "paid"
    | "confirmed"
    | "active"
    | "returned"
    | "cancelled";
  snapToken: string | null;
  dress: {
    id: number;
    name: string;
    slug: string;
    pricePerDay: number;
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
    month: "long",
    year: "numeric",
  });

const statusConfig = {
  pending: {
    label: "Menunggu Pembayaran",
    desc: "Selesaikan pembayaran sebelum batas waktu",
    color: "#b08040",
    bg: "rgba(176,128,64,0.08)",
    border: "rgba(176,128,64,0.2)",
    icon: "M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  },
  paid: {
    label: "Pembayaran Berhasil",
    desc: "Admin akan segera memeriksa dan mengonfirmasi pesanan Anda",
    color: "#4a7c5a",
    bg: "rgba(74,124,90,0.08)",
    border: "rgba(74,124,90,0.2)",
    icon: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  },
  confirmed: {
    label: "Pesanan Dikonfirmasi",
    desc: "Admin akan menghubungi Anda via WhatsApp untuk atur pengambilan/pengiriman",
    color: "#4a7c5a",
    bg: "rgba(74,124,90,0.08)",
    border: "rgba(74,124,90,0.2)",
    icon: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  },
  active: {
    label: "Sedang Disewa",
    desc: "Dress sedang dalam masa sewa",
    color: "#4060a0",
    bg: "rgba(64,96,160,0.08)",
    border: "rgba(64,96,160,0.2)",
    icon: "M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z",
  },
  returned: {
    label: "Dress Dikembalikan",
    desc: "Terima kasih telah menyewa",
    color: "#6b7280",
    bg: "rgba(107,114,128,0.08)",
    border: "rgba(107,114,128,0.2)",
    icon: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  },
  cancelled: {
    label: "Pesanan Dibatalkan",
    desc: "Pesanan ini telah dibatalkan",
    color: "#c05050",
    bg: "rgba(192,80,80,0.08)",
    border: "rgba(192,80,80,0.2)",
    icon: "M9.75 9.75l4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  },
};

export default function OrderDetail({
  orderId,
  paymentStatus,
  isNewOrder,
}: {
  orderId: number;
  paymentStatus: string | null;
  isNewOrder: boolean;
}) {
  const router = useRouter();
  const { loggedIn, ready } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [payingAgain, setPayingAgain] = useState(false);

  useEffect(() => {
    if (ready && !loggedIn) {
      router.push("/auth/login");
      return;
    }
    if (ready && loggedIn) fetchOrder();
  }, [ready, loggedIn]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`${API}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        cache: "no-store",
      });
      if (res.ok) setOrder(await res.json());
      else router.push("/orders");
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Yakin ingin membatalkan pesanan ini?")) return;
    setCancelling(true);
    try {
      const res = await fetch(`${API}/orders/${orderId}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) fetchOrder();
    } finally {
      setCancelling(false);
    }
  };

  const handlePayAgain = async () => {
    if (!order?.snapToken) return;
    setPayingAgain(true);
    const snapWindow = (window as any).snap;
    if (!snapWindow) {
      setPayingAgain(false);
      return;
    }
    snapWindow.pay(order.snapToken, {
      onSuccess: () => {
        fetchOrder();
        setPayingAgain(false);
      },
      onPending: () => {
        fetchOrder();
        setPayingAgain(false);
      },
      onError: () => {
        setPayingAgain(false);
      },
      onClose: () => {
        setPayingAgain(false);
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0ebe3] flex items-center justify-center">
        <p className="font-sans text-sm text-stone-400">Memuat pesanan...</p>
      </div>
    );
  }

  if (!order) return null;

  const st = statusConfig[order.status];
  const thumb =
    order.dress.photos?.find((p) => p.isThumbnail) ?? order.dress.photos?.[0];

  return (
    <div className="min-h-screen bg-[#f0ebe3]">
      <div className="pt-24 pb-20 px-6 md:px-10 max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <Link
            href="/orders"
            className="font-sans text-[9px] tracking-[0.2em] uppercase text-stone-400 hover:text-stone-600 transition-colors"
          >
            ← Pesanan Saya
          </Link>
        </div>

        {/* Status banner */}
        <div
          className="p-5 mb-8 border flex items-start gap-4"
          style={{ background: st.bg, borderColor: st.border }}
        >
          <div
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: st.bg, border: `1px solid ${st.border}` }}
          >
            <svg
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke={st.color}
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={st.icon} />
            </svg>
          </div>
          <div className="flex-1">
            <p
              className="font-sans text-[10px] tracking-[0.2em] uppercase mb-1"
              style={{ color: st.color }}
            >
              {st.label}
            </p>
            <p className="font-sans text-xs text-stone-500">{st.desc}</p>
          </div>
          <p className="font-sans text-[9px] text-stone-400 flex-shrink-0">
            #{String(order.id).padStart(5, "0")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* ── Kiri: Info Pesanan ── */}
          <div className="md:col-span-2 space-y-6">
            {/* Detail tanggal */}
            <div className="bg-white/50 border border-stone-200/60 p-6">
              <h2 className="font-serif font-[300] text-stone-800 text-lg mb-4">
                Detail Pesanan
              </h2>
              {[
                { label: "Tanggal Mulai", value: formatDate(order.startDate) },
                { label: "Tanggal Selesai", value: formatDate(order.endDate) },
                { label: "Durasi Sewa", value: `${order.totalDays} hari` },
                {
                  label: "Ukuran",
                  value: order.size?.label ?? "Tidak dipilih",
                },
                { label: "Nomor WhatsApp", value: order.contactPhone },
                { label: "Tanggal Pesan", value: formatDate(order.createdAt) },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between py-2.5 border-b border-stone-100 last:border-0"
                >
                  <span className="font-sans text-[9px] tracking-[0.15em] uppercase text-stone-400">
                    {item.label}
                  </span>
                  <span className="font-sans text-sm text-stone-700">
                    {item.value}
                  </span>
                </div>
              ))}
              {order.notes && (
                <div className="mt-4 pt-4 border-t border-stone-100">
                  <p className="font-sans text-[9px] tracking-[0.15em] uppercase text-stone-400 mb-1">
                    Catatan
                  </p>
                  <p className="font-sans text-sm text-stone-600">
                    {order.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Tombol aksi */}
            <div className="flex flex-col gap-3">
              {/* Bayar lagi kalau masih pending dan punya snapToken */}
              {order.status === "pending" && order.snapToken && (
                <button
                  onClick={handlePayAgain}
                  disabled={payingAgain}
                  className="w-full py-4 font-sans text-[10px] tracking-[0.3em] uppercase transition-all duration-300"
                  style={{
                    background: payingAgain ? "#e7e5e4" : "#1c1917",
                    color: payingAgain ? "#a8a29e" : "#f0ebe3",
                    cursor: payingAgain ? "not-allowed" : "pointer",
                  }}
                >
                  {payingAgain
                    ? "Membuka pembayaran..."
                    : "Lanjutkan Pembayaran"}
                </button>
              )}

              {/* Batalkan kalau masih pending */}
              {order.status === "pending" && (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="w-full py-3 font-sans text-[10px] tracking-[0.2em] uppercase border border-stone-300 text-stone-500 hover:border-red-300 hover:text-red-400 transition-all duration-200"
                >
                  {cancelling ? "Membatalkan..." : "Batalkan Pesanan"}
                </button>
              )}

              <Link
                href="/dresses"
                className="w-full py-3 font-sans text-[10px] tracking-[0.2em] uppercase border border-stone-200 text-stone-400 text-center hover:border-stone-400 hover:text-stone-600 transition-all duration-200"
              >
                Jelajahi Dress Lainnya
              </Link>
            </div>
          </div>

          {/* ── Kanan: Ringkasan Dress ── */}
          <div>
            <div className="bg-white/50 border border-stone-200/60 p-5">
              {/* Foto */}
              <div
                className="relative overflow-hidden mb-4"
                style={{ aspectRatio: "3/4" }}
              >
                {thumb ? (
                  <img
                    src={`${IMG_BASE}${thumb.url}`}
                    alt={order.dress.name}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full bg-[#e8e0d5]" />
                )}
              </div>

              <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-1">
                {order.dress.category?.name}
              </p>
              <Link
                href={`/dresses/${order.dress.slug}`}
                className="font-serif font-[300] text-stone-800 text-base leading-tight hover:text-stone-500 transition-colors block mb-4"
              >
                {order.dress.name}
              </Link>

              <div className="border-t border-stone-100 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="font-sans text-[9px] uppercase tracking-[0.1em] text-stone-400">
                    Harga/hari
                  </span>
                  <span className="font-sans text-xs text-stone-600">
                    {formatPrice(order.dress.pricePerDay)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans text-[9px] uppercase tracking-[0.1em] text-stone-400">
                    Durasi
                  </span>
                  <span className="font-sans text-xs text-stone-600">
                    {order.totalDays} hari
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-stone-100">
                  <span className="font-sans text-[9px] uppercase tracking-[0.1em] text-stone-600 font-[500]">
                    Total
                  </span>
                  <span className="font-serif font-[300] text-stone-800">
                    {formatPrice(order.totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
