"use client";

// src/app/(admin)/admin/dashboard/page.tsx

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getToken } from "@/lib/auth";

const BORDER = "var(--admin-border)";
const CARD = "var(--admin-card-bg)";
const API = process.env.NEXT_PUBLIC_API_URL;

type DashboardStats = {
  monthlyRevenue: number;
  activeOrders: number;
  needsAction: number;
  overdue: number;
};

const formatPrice = (n: number) => `Rp ${Number(n).toLocaleString("id-ID")}`;

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [totalCustomers, setTotalCustomers] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, dressesRes, customersRes] = await Promise.all([
        fetch(`${API}/orders/admin/dashboard-stats`, {
          headers: { Authorization: `Bearer ${getToken()}` },
          cache: "no-store",
        }),
        fetch(`${API}/dresses`, { cache: "no-store" }),
        fetch(`${API}/user/admin/all`, {
          headers: { Authorization: `Bearer ${getToken()}` },
          cache: "no-store",
        }),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (dressesRes.ok) setTotalProducts((await dressesRes.json()).length);
      if (customersRes.ok)
        setTotalCustomers((await customersRes.json()).length);
    } catch {
      // gagal ambil data -> kartu tampil "—", tidak crash
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Greeting />

      <StatsGrid
        loading={loading}
        stats={stats}
        totalProducts={totalProducts}
        totalCustomers={totalCustomers}
      />

      {!loading && stats && (stats.needsAction > 0 || stats.overdue > 0) && (
        <AttentionBanner
          needsAction={stats.needsAction}
          overdue={stats.overdue}
        />
      )}
    </div>
  );
}

function Greeting() {
  return (
    <div>
      <p
        style={{
          fontSize: 11,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "var(--admin-text-faint)",
        }}
      >
        Selamat datang kembali
      </p>
      <h2
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(1.6rem, 3vw, 2rem)",
          fontWeight: 300,
          color: "var(--admin-text)",
          lineHeight: 1.2,
          marginTop: 4,
        }}
      >
        Naia Dress Dashboard
      </h2>
    </div>
  );
}

// 4 kartu statistik: revenue bulan ini, order aktif, total produk, total customer
function StatsGrid({
  loading,
  stats,
  totalProducts,
  totalCustomers,
}: {
  loading: boolean;
  stats: DashboardStats | null;
  totalProducts: number | null;
  totalCustomers: number | null;
}) {
  const cards = [
    {
      label: "Revenue Bulan Ini",
      value: stats ? formatPrice(stats.monthlyRevenue) : "—",
      icon: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33",
      accent: true,
    },
    {
      label: "Active Orders",
      value: stats ? String(stats.activeOrders) : "—",
      icon: "M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z",
    },
    {
      label: "Total Products",
      value: totalProducts !== null ? String(totalProducts) : "—",
      icon: "M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z",
    },
    {
      label: "Total Customers",
      value: totalCustomers !== null ? String(totalCustomers) : "—",
      icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 12,
      }}
    >
      {cards.map((c) => (
        <div
          key={c.label}
          style={{
            background: CARD,
            border: `1px solid ${BORDER}`,
            borderRadius: 4,
            padding: "20px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {c.accent && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background:
                  "linear-gradient(90deg, var(--admin-accent), transparent)",
              }}
            />
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 16,
            }}
          >
            <p
              style={{
                fontSize: 9,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--admin-text-faint)",
              }}
            >
              {c.label}
            </p>
            <svg
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="var(--admin-text-faint)"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={c.icon} />
            </svg>
          </div>

          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.3rem, 2.6vw, 1.8rem)",
              fontWeight: 300,
              color: "var(--admin-text)",
              lineHeight: 1,
            }}
          >
            {loading ? "—" : c.value}
          </p>
        </div>
      ))}
    </div>
  );
}

// muncul kalau ada order yang butuh perhatian admin
function AttentionBanner({
  needsAction,
  overdue,
}: {
  needsAction: number;
  overdue: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {overdue > 0 && (
        <Link
          href="/admin/orders"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 18px",
            textDecoration: "none",
            background: "rgba(192,80,80,0.06)",
            border: "1px solid rgba(192,80,80,0.2)",
            borderRadius: 4,
          }}
        >
          <WarningIcon color="#c05050" />
          <p style={{ fontSize: 12, color: "#c05050" }}>
            <strong>{overdue}</strong> pesanan telat dikembalikan — segera
            hubungi customer
          </p>
        </Link>
      )}

      {needsAction > 0 && (
        <Link
          href="/admin/orders"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 18px",
            textDecoration: "none",
            background: "rgba(176,128,64,0.06)",
            border: "1px solid rgba(176,128,64,0.2)",
            borderRadius: 4,
          }}
        >
          <WarningIcon color="#b08040" />
          <p style={{ fontSize: 12, color: "#b08040" }}>
            <strong>{needsAction}</strong> pesanan menunggu tindakan (konfirmasi
            / kirim)
          </p>
        </Link>
      )}
    </div>
  );
}

function WarningIcon({ color }: { color: string }) {
  return (
    <svg
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 24 24"
      stroke={color}
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
      />
    </svg>
  );
}
