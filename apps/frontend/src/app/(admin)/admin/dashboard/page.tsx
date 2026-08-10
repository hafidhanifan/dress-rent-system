"use client";

// src/app/(admin)/admin/dashboard/page.tsx

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getToken } from "@/lib/auth";
import { statusCfg, OrderStatus } from "../orders/_components/StatusBadge";

const BORDER = "var(--admin-border)";
const CARD = "var(--admin-card-bg)";
const API = process.env.NEXT_PUBLIC_API_URL;

type DashboardStats = {
  monthlyRevenue: number;
  activeOrders: number;
  needsAction: number;
  overdue: number;
};
type RecentOrder = {
  id: number;
  dressName: string;
  customerName: string;
  status: OrderStatus;
  totalPrice: number;
  createdAt: string;
};
type TopProduct = { dressId: number; dressName: string; rentalCount: number };
type RevenuePoint = { date: string; revenue: number };

const formatPrice = (n: number) => `Rp ${Number(n).toLocaleString("id-ID")}`;
const formatShortDate = (s: string) =>
  new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "short" });

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [totalCustomers, setTotalCustomers] = useState<number | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<RevenuePoint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const authHeader = { Authorization: `Bearer ${getToken()}` };
    try {
      const [statsRes, dressesRes, customersRes, recentRes, topRes, trendRes] =
        await Promise.all([
          fetch(`${API}/orders/admin/dashboard-stats`, {
            headers: authHeader,
            cache: "no-store",
          }),
          fetch(`${API}/dresses`, { cache: "no-store" }),
          fetch(`${API}/user/admin/all`, {
            headers: authHeader,
            cache: "no-store",
          }),
          fetch(`${API}/orders/admin/recent`, {
            headers: authHeader,
            cache: "no-store",
          }),
          fetch(`${API}/orders/admin/top-products`, {
            headers: authHeader,
            cache: "no-store",
          }),
          fetch(`${API}/orders/admin/revenue-trend`, {
            headers: authHeader,
            cache: "no-store",
          }),
        ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (dressesRes.ok) setTotalProducts((await dressesRes.json()).length);
      if (customersRes.ok)
        setTotalCustomers((await customersRes.json()).length);
      if (recentRes.ok) setRecentOrders(await recentRes.json());
      if (topRes.ok) setTopProducts(await topRes.json());
      if (trendRes.ok) setRevenueTrend(await trendRes.json());
    } catch {
      // gagal ambil data -> bagian yang gagal tampil kosong, tidak crash
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

      <RevenueTrendChart data={revenueTrend} loading={loading} />

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr" }}
        className="xl:grid-cols-[1fr_300px] gap-4"
      >
        <RecentOrdersTable orders={recentOrders} loading={loading} />
        <TopProductsList products={topProducts} loading={loading} />
      </div>
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

// grafik batang sederhana, revenue 7 hari terakhir
function RevenueTrendChart({
  data,
  loading,
}: {
  data: RevenuePoint[];
  loading: boolean;
}) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div
      style={{
        background: CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: 4,
        padding: "20px",
      }}
    >
      <p
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 16,
          fontWeight: 300,
          color: "var(--admin-text)",
          marginBottom: 20,
        }}
      >
        Revenue 7 Hari Terakhir
      </p>

      {loading ? (
        <p style={{ fontSize: 12, color: "var(--admin-text-faint)" }}>
          Memuat data...
        </p>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 10,
            height: 120,
          }}
        >
          {data.map((point) => (
            <div
              key={point.date}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                height: "100%",
              }}
            >
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "flex-end",
                  width: "100%",
                }}
              >
                <div
                  title={formatPrice(point.revenue)}
                  style={{
                    width: "100%",
                    borderRadius: "3px 3px 0 0",
                    height: `${Math.max((point.revenue / maxRevenue) * 100, 3)}%`,
                    background:
                      point.revenue > 0
                        ? "var(--admin-accent)"
                        : "var(--admin-border)",
                  }}
                />
              </div>
              <span style={{ fontSize: 9, color: "var(--admin-text-faint)" }}>
                {formatShortDate(point.date)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// tabel 5 pesanan terbaru
function RecentOrdersTable({
  orders,
  loading,
}: {
  orders: RecentOrder[];
  loading: boolean;
}) {
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
        style={{
          padding: "16px 20px",
          borderBottom: `1px solid ${BORDER}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 16,
            fontWeight: 300,
            color: "var(--admin-text)",
          }}
        >
          Recent Orders
        </p>
        <Link
          href="/admin/orders"
          style={{
            fontSize: 10,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--admin-text-faint)",
            textDecoration: "none",
          }}
        >
          View All →
        </Link>
      </div>

      {loading ? (
        <div style={{ padding: 32, textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "var(--admin-text-faint)" }}>
            Memuat data...
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div style={{ padding: 32, textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "var(--admin-text-faint)" }}>
            Belum ada pesanan
          </p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", minWidth: 480, borderCollapse: "collapse" }}
          >
            <thead>
              <tr>
                {["Order", "Customer", "Product", "Status", "Amount"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 20px",
                        textAlign: "left",
                        fontSize: 9,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: "var(--admin-text-faint)",
                        fontWeight: 400,
                        borderBottom: `1px solid ${BORDER}`,
                      }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const cfg = statusCfg[o.status];
                return (
                  <tr
                    key={o.id}
                    style={{ borderBottom: `1px solid ${BORDER}` }}
                  >
                    <td
                      style={{
                        padding: "12px 20px",
                        fontSize: 11,
                        color: "var(--admin-text-faint)",
                        fontFamily: "monospace",
                      }}
                    >
                      #{String(o.id).padStart(5, "0")}
                    </td>
                    <td
                      style={{
                        padding: "12px 20px",
                        fontSize: 12,
                        color: "var(--admin-text)",
                      }}
                    >
                      {o.customerName}
                    </td>
                    <td
                      style={{
                        padding: "12px 20px",
                        fontSize: 11,
                        color: "var(--admin-text-muted)",
                      }}
                    >
                      {o.dressName}
                    </td>
                    <td style={{ padding: "12px 20px" }}>
                      <span
                        style={{
                          fontSize: 9,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          padding: "3px 8px",
                          borderRadius: 20,
                          background: cfg.bg,
                          color: cfg.color,
                          border: `1px solid ${cfg.border}`,
                        }}
                      >
                        {cfg.label}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "12px 20px",
                        fontSize: 12,
                        color: "var(--admin-text)",
                      }}
                    >
                      {formatPrice(o.totalPrice)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// list dress paling sering disewa
function TopProductsList({
  products,
  loading,
}: {
  products: TopProduct[];
  loading: boolean;
}) {
  const maxCount = Math.max(...products.map((p) => p.rentalCount), 1);

  return (
    <div
      style={{
        background: CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: 4,
      }}
    >
      <div
        style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}` }}
      >
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 16,
            fontWeight: 300,
            color: "var(--admin-text)",
          }}
        >
          Top Products
        </p>
      </div>

      {loading ? (
        <div style={{ padding: 32, textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "var(--admin-text-faint)" }}>
            Memuat data...
          </p>
        </div>
      ) : products.length === 0 ? (
        <div style={{ padding: 32, textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "var(--admin-text-faint)" }}>
            Belum ada data penyewaan
          </p>
        </div>
      ) : (
        <div style={{ padding: "8px 0" }}>
          {products.map((p, i) => (
            <div
              key={p.dressId}
              style={{
                padding: "14px 20px",
                borderBottom:
                  i < products.length - 1 ? `1px solid ${BORDER}` : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <p style={{ fontSize: 12, color: "var(--admin-text)" }}>
                  {p.dressName}
                </p>
                <p style={{ fontSize: 11, color: "var(--admin-accent)" }}>
                  {p.rentalCount}×
                </p>
              </div>
              <div
                style={{
                  height: 2,
                  background: "var(--admin-border)",
                  borderRadius: 2,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${(p.rentalCount / maxCount) * 100}%`,
                    background: "var(--admin-accent)",
                    borderRadius: 2,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
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
