"use client";

import { useState, useEffect } from "react";
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
  dressId: number;
  sizeId: number | null;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  contactPhone: string;
  notes: string | null;
  status: OrderStatus;
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

// snap dari midtrans tidak resmi punya types, jadi dideklarasikan manual
type MidtransSnap = {
  pay: (
    token: string,
    options: {
      onSuccess: () => void;
      onPending: () => void;
      onError: () => void;
      onClose: () => void;
    },
  ) => void;
};

declare global {
  interface Window {
    snap?: MidtransSnap;
  }
}

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

// tampilan + warna tiap status pesanan
const statusConfig: Record<
  OrderStatus,
  {
    label: string;
    desc: string;
    color: string;
    bg: string;
    border: string;
    icon: string;
  }
> = {
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
    const fetchOrder = async () => {
      try {
        const res = await apiFetch(`${API}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
          cache: "no-store",
        });
        if (res.ok) setOrder(await res.json());
        else router.push("/orders");
      } catch {
        // gagal ambil data -> biarkan halaman kosong, tidak crash
      } finally {
        setLoading(false);
      }
    };

    if (ready && !loggedIn) {
      router.push("/auth/login");
      return;
    }
    if (ready && loggedIn) fetchOrder();
  }, [ready, loggedIn, orderId, router]);

  const refetchOrder = async () => {
    const res = await apiFetch(`${API}/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
      cache: "no-store",
    });
    if (res.ok) setOrder(await res.json());
  };

  const handleCancel = async () => {
    if (!confirm("Yakin ingin membatalkan pesanan ini?")) return;
    setCancelling(true);
    try {
      const res = await apiFetch(`${API}/orders/${orderId}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) await refetchOrder();
    } finally {
      setCancelling(false);
    }
  };

  const handlePayAgain = () => {
    if (!order?.snapToken) return;
    setPayingAgain(true);

    const snapWindow = window.snap;
    if (!snapWindow) {
      setPayingAgain(false);
      return;
    }

    snapWindow.pay(order.snapToken, {
      onSuccess: () => {
        refetchOrder();
        setPayingAgain(false);
      },
      onPending: () => {
        refetchOrder();
        setPayingAgain(false);
      },
      onError: () => setPayingAgain(false),
      onClose: () => setPayingAgain(false),
    });
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--user-bg)" }}
      >
        <p
          className="font-sans text-sm"
          style={{ color: "var(--user-text-muted)" }}
        >
          Memuat pesanan...
        </p>
      </div>
    );
  }

  if (!order) return null;

  const thumb =
    order.dress.photos?.find((p) => p.isThumbnail) ?? order.dress.photos?.[0];

  return (
    <div className="min-h-screen" style={{ background: "var(--user-bg)" }}>
      <div className="pt-24 pb-20 px-6 md:px-10 max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <Link
            href="/orders"
            className="font-sans text-[9px] tracking-[0.2em] uppercase transition-colors"
            style={{ color: "var(--user-text-muted)" }}
          >
            ← Pesanan Saya
          </Link>
        </div>

        {isNewOrder && <NewOrderBanner paymentStatus={paymentStatus} />}

        <StatusBanner status={order.status} orderId={order.id} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <OrderDetailsCard order={order} />

            <ActionButtons
              order={order}
              cancelling={cancelling}
              payingAgain={payingAgain}
              onCancel={handleCancel}
              onPayAgain={handlePayAgain}
            />
          </div>

          <DressSummaryCard order={order} thumb={thumb} />
        </div>
      </div>
    </div>
  );
}

// pesan sekilas begitu order baru saja dibuat (baru sampai dari checkout)
function NewOrderBanner({ paymentStatus }: { paymentStatus: string | null }) {
  const message =
    paymentStatus === "pending"
      ? "Pesanan berhasil dibuat, pembayaran sedang diproses"
      : "Pesanan berhasil dibuat";

  return (
    <div
      className="p-4 mb-4 flex items-center gap-3"
      style={{
        background: "rgba(74,124,90,0.06)",
        border: "1px solid rgba(74,124,90,0.2)",
      }}
    >
      <svg
        width="16"
        height="16"
        fill="none"
        viewBox="0 0 24 24"
        stroke="#4a7c5a"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m4.5 12.75 6 6 9-13.5"
        />
      </svg>
      <p className="font-sans text-xs" style={{ color: "#4a7c5a" }}>
        {message}
      </p>
    </div>
  );
}

// banner besar berisi status pesanan saat ini
function StatusBanner({
  status,
  orderId,
}: {
  status: OrderStatus;
  orderId: number;
}) {
  const st = statusConfig[status];

  return (
    <div
      className="p-5 mb-8 border flex items-start gap-4"
      style={{ background: st.bg, borderColor: st.border }}
    >
      <div
        className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
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
        <p
          className="font-sans text-xs"
          style={{ color: "var(--user-text-muted)" }}
        >
          {st.desc}
        </p>
      </div>
      <p
        className="font-sans text-[9px] shrink-0"
        style={{ color: "var(--user-text-faint)" }}
      >
        #{String(orderId).padStart(5, "0")}
      </p>
    </div>
  );
}

// tabel detail pesanan: tanggal, ukuran, nomor wa, catatan
function OrderDetailsCard({ order }: { order: Order }) {
  const rows = [
    { label: "Tanggal Mulai", value: formatDate(order.startDate) },
    { label: "Tanggal Selesai", value: formatDate(order.endDate) },
    { label: "Durasi Sewa", value: `${order.totalDays} hari` },
    { label: "Ukuran", value: order.size?.label ?? "Tidak dipilih" },
    { label: "Nomor WhatsApp", value: order.contactPhone },
    { label: "Tanggal Pesan", value: formatDate(order.createdAt) },
  ];

  return (
    <div
      className="p-6"
      style={{
        background: "color-mix(in srgb, var(--user-bg-alt) 50%, transparent)",
        border: "1px solid var(--user-border)",
      }}
    >
      <h2
        className="font-serif font-light text-lg mb-4"
        style={{ color: "var(--user-text)" }}
      >
        Detail Pesanan
      </h2>
      {rows.map((item) => (
        <div
          key={item.label}
          className="flex justify-between py-2.5"
          style={{ borderBottom: "1px solid var(--user-border)" }}
        >
          <span
            className="font-sans text-[9px] tracking-[0.15em] uppercase"
            style={{ color: "var(--user-text-muted)" }}
          >
            {item.label}
          </span>
          <span
            className="font-sans text-sm"
            style={{ color: "var(--user-text-secondary)" }}
          >
            {item.value}
          </span>
        </div>
      ))}
      {order.notes && (
        <div
          className="mt-4 pt-4"
          style={{ borderTop: "1px solid var(--user-border)" }}
        >
          <p
            className="font-sans text-[9px] tracking-[0.15em] uppercase mb-1"
            style={{ color: "var(--user-text-muted)" }}
          >
            Catatan
          </p>
          <p
            className="font-sans text-sm"
            style={{ color: "var(--user-text-secondary)" }}
          >
            {order.notes}
          </p>
        </div>
      )}
    </div>
  );
}

// tombol lanjutkan pembayaran / batalkan / jelajahi dress lain
function ActionButtons({
  order,
  cancelling,
  payingAgain,
  onCancel,
  onPayAgain,
}: {
  order: Order;
  cancelling: boolean;
  payingAgain: boolean;
  onCancel: () => void;
  onPayAgain: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {order.status === "pending" && order.snapToken && (
        <button
          onClick={onPayAgain}
          disabled={payingAgain}
          className="w-full py-4 font-sans text-[10px] tracking-[0.3em] uppercase transition-all duration-300"
          style={{
            background: payingAgain ? "var(--user-border)" : "var(--user-text)",
            color: payingAgain ? "var(--user-text-muted)" : "var(--user-bg)",
            cursor: payingAgain ? "not-allowed" : "pointer",
          }}
        >
          {payingAgain ? "Membuka pembayaran..." : "Lanjutkan Pembayaran"}
        </button>
      )}

      {order.status === "pending" && (
        <button
          onClick={onCancel}
          disabled={cancelling}
          className="w-full py-3 font-sans text-[10px] tracking-[0.2em] uppercase transition-all duration-200"
          style={{
            border: "1px solid var(--user-border)",
            color: "var(--user-text-secondary)",
          }}
        >
          {cancelling ? "Membatalkan..." : "Batalkan Pesanan"}
        </button>
      )}

      <Link
        href="/dresses"
        className="w-full py-3 font-sans text-[10px] tracking-[0.2em] uppercase text-center transition-all duration-200"
        style={{
          border: "1px solid var(--user-border)",
          color: "var(--user-text-muted)",
        }}
      >
        Jelajahi Dress Lainnya
      </Link>
    </div>
  );
}

// kartu ringkasan dress di kolom kanan
function DressSummaryCard({
  order,
  thumb,
}: {
  order: Order;
  thumb: { url: string } | undefined;
}) {
  return (
    <div>
      <div
        className="p-5"
        style={{
          background: "color-mix(in srgb, var(--user-bg-alt) 50%, transparent)",
          border: "1px solid var(--user-border)",
        }}
      >
        <div
          className="relative overflow-hidden mb-4"
          style={{ aspectRatio: "3/4", background: "var(--user-border)" }}
        >
          {thumb ? (
            <Image
              src={`${IMG_BASE}${thumb.url}`}
              alt={order.dress.name}
              fill
              className="object-cover object-top"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{ background: "var(--user-border)" }}
            />
          )}
        </div>

        <p
          className="font-sans text-[9px] tracking-[0.2em] uppercase mb-1"
          style={{ color: "var(--user-text-muted)" }}
        >
          {order.dress.category?.name}
        </p>
        <Link
          href={`/dresses/${order.dress.slug}`}
          className="font-serif font-light text-base leading-tight transition-colors block mb-4"
          style={{ color: "var(--user-text)" }}
        >
          {order.dress.name}
        </Link>

        <div
          className="pt-4 space-y-2"
          style={{ borderTop: "1px solid var(--user-border)" }}
        >
          <div className="flex justify-between">
            <span
              className="font-sans text-[9px] uppercase tracking-widest"
              style={{ color: "var(--user-text-muted)" }}
            >
              Harga/hari
            </span>
            <span
              className="font-sans text-xs"
              style={{ color: "var(--user-text-secondary)" }}
            >
              {formatPrice(order.dress.pricePerDay)}
            </span>
          </div>
          <div className="flex justify-between">
            <span
              className="font-sans text-[9px] uppercase tracking-widest"
              style={{ color: "var(--user-text-muted)" }}
            >
              Durasi
            </span>
            <span
              className="font-sans text-xs"
              style={{ color: "var(--user-text-secondary)" }}
            >
              {order.totalDays} hari
            </span>
          </div>
          <div
            className="flex justify-between pt-2"
            style={{ borderTop: "1px solid var(--user-border)" }}
          >
            <span
              className="font-sans text-[9px] uppercase tracking-widest font-medium"
              style={{ color: "var(--user-text-secondary)" }}
            >
              Total
            </span>
            <span
              className="font-serif font-light"
              style={{ color: "var(--user-text)" }}
            >
              {formatPrice(order.totalPrice)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
