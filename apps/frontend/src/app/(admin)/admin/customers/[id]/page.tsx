"use client";

// src/app/(admin)/admin/customers/[id]/page.tsx

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { getToken } from "@/lib/auth";
import StatusBadge, { OrderStatus } from "../../orders/_components/StatusBadge";

const BORDER = "var(--admin-border)";
const CARD = "var(--admin-card-bg)";
const API = process.env.NEXT_PUBLIC_API_URL;
const IMG_BASE = "http://localhost:3001";

type Order = {
  id: number;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  status: OrderStatus;
  contactPhone: string;
  createdAt: string;
  dress: {
    name: string;
    photos: { url: string; isThumbnail: boolean }[];
  };
  size: { label: string } | null;
};

type CustomerDetail = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  createdAt: string;
  orders: Order[];
};

const formatPrice = (n: number) => `Rp ${Number(n).toLocaleString("id-ID")}`;
const formatDate = (s: string) =>
  new Date(s).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCustomer = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API}/user/admin/${id}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
          cache: "no-store",
        });
        if (!res.ok) throw new Error();
        setCustomer(await res.json());
      } catch {
        setError("Tidak dapat memuat data customer.");
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "var(--admin-text-faint)" }}>
          Memuat data...
        </p>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div style={{ padding: 48, textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "#f87171" }}>
          {error || "Customer tidak ditemukan"}
        </p>
        <Link
          href="/admin/customers"
          style={{
            fontSize: 11,
            color: "var(--admin-accent)",
            marginTop: 12,
            display: "inline-block",
          }}
        >
          ← Kembali ke daftar customer
        </Link>
      </div>
    );
  }

  const orders = [...customer.orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const paidOrders = orders.filter((o) =>
    ["paid", "confirmed", "active", "returned"].includes(o.status),
  );
  const totalSpent = paidOrders.reduce(
    (sum, o) => sum + Number(o.totalPrice),
    0,
  );
  const activeOrders = orders.filter((o) => o.status === "active").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Breadcrumb />

      <CustomerInfoCard customer={customer} />

      <StatsRow
        totalOrders={orders.length}
        totalSpent={totalSpent}
        activeOrders={activeOrders}
      />

      <OrderHistory orders={orders} />
    </div>
  );
}

function Breadcrumb() {
  return (
    <Link
      href="/admin/customers"
      style={{
        fontSize: 11,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: "var(--admin-text-muted)",
        textDecoration: "none",
      }}
    >
      ← Semua Customer
    </Link>
  );
}

// nama, email, telepon, tanggal bergabung
function CustomerInfoCard({ customer }: { customer: CustomerDetail }) {
  return (
    <div
      style={{
        background: CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: 4,
        padding: "24px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            flexShrink: 0,
            background: "var(--admin-accent-bg)",
            border: "1px solid var(--admin-accent-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 22,
              color: "var(--admin-accent)",
            }}
          >
            {customer.fullName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.6rem",
              fontWeight: 300,
              color: "var(--admin-text)",
              marginBottom: 4,
            }}
          >
            {customer.fullName}
          </h1>
          <p style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>
            {customer.email}
          </p>
          <p style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>
            {customer.phone}
          </p>
        </div>
        <p
          style={{
            fontSize: 10,
            color: "var(--admin-text-faint)",
            marginLeft: "auto",
          }}
        >
          Bergabung {formatDate(customer.createdAt)}
        </p>
      </div>
    </div>
  );
}

// total order, total belanja, order sedang aktif
function StatsRow({
  totalOrders,
  totalSpent,
  activeOrders,
}: {
  totalOrders: number;
  totalSpent: number;
  activeOrders: number;
}) {
  const stats = [
    { label: "Total Order", value: totalOrders },
    { label: "Total Belanja", value: formatPrice(totalSpent) },
    { label: "Sedang Disewa", value: activeOrders },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 12,
      }}
    >
      {stats.map((s) => (
        <div
          key={s.label}
          style={{
            background: CARD,
            border: `1px solid ${BORDER}`,
            borderRadius: 4,
            padding: "16px 18px",
          }}
        >
          <p
            style={{
              fontSize: 9,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--admin-text-faint)",
              marginBottom: 10,
            }}
          >
            {s.label}
          </p>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.6rem",
              fontWeight: 300,
              color: "var(--admin-text)",
              lineHeight: 1,
            }}
          >
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
}

// riwayat semua order customer ini, urut dari yang terbaru
function OrderHistory({ orders }: { orders: Order[] }) {
  return (
    <div
      style={{
        background: CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      <div
        style={{ padding: "14px 20px", borderBottom: `1px solid ${BORDER}` }}
      >
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 16,
            fontWeight: 300,
            color: "var(--admin-text)",
          }}
        >
          Riwayat Pesanan
        </p>
      </div>

      {orders.length === 0 ? (
        <div style={{ padding: 48, textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "var(--admin-text-faint)" }}>
            Belum pernah melakukan pemesanan
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {orders.map((order) => (
            <OrderHistoryRow key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderHistoryRow({ order }: { order: Order }) {
  const thumb =
    order.dress.photos?.find((p) => p.isThumbnail) ?? order.dress.photos?.[0];

  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        padding: "14px 20px",
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <div
        style={{
          width: 44,
          height: 58,
          position: "relative",
          borderRadius: 2,
          overflow: "hidden",
          border: `1px solid ${BORDER}`,
          background: "rgba(0,0,0,0.03)",
          flexShrink: 0,
        }}
      >
        {thumb && (
          <Image
            src={`${IMG_BASE}${thumb.url}`}
            alt=""
            fill
            style={{ objectFit: "cover", objectPosition: "top" }}
          />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <p style={{ fontSize: 13, color: "var(--admin-text)" }}>
            {order.dress.name}
          </p>
          <StatusBadge status={order.status} />
        </div>
        <p style={{ fontSize: 11, color: "var(--admin-text-muted)" }}>
          {formatDate(order.startDate)} — {formatDate(order.endDate)} ·{" "}
          {order.totalDays} hari
          {order.size && ` · Ukuran ${order.size.label}`}
        </p>
        <p style={{ fontSize: 12, color: "var(--admin-text)", marginTop: 4 }}>
          {formatPrice(order.totalPrice)}
        </p>
      </div>
    </div>
  );
}
