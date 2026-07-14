"use client";

// src/app/(admin)/admin/orders/page.tsx

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { getToken } from "@/lib/auth";
import StatusBadge, { OrderStatus, statusCfg } from "./_components/StatusBadge";
import OrderDetailModal, { AdminOrder } from "./_components/OrderDetailModal";

const GOLD = "var(--admin-accent)";
const BORDER = "var(--admin-border)";
const CARD = "var(--admin-card-bg)";
const API = process.env.NEXT_PUBLIC_API_URL;
const IMG_BASE = "http://localhost:3001";

const formatPrice = (n: number) => `Rp ${Number(n).toLocaleString("id-ID")}`;
const formatDate = (s: string) =>
  new Date(s).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const filterOptions: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "pending", label: "Menunggu Bayar" },
  { value: "paid", label: "Sudah Dibayar" },
  { value: "confirmed", label: "Dikonfirmasi" },
  { value: "active", label: "Sedang Disewa" },
  { value: "returned", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/orders/admin/all`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        cache: "no-store",
      });
      if (!res.ok) throw new Error();
      setOrders(await res.json());
    } catch {
      setError("Tidak dapat memuat data pesanan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (
    id: number,
    status: OrderStatus,
  ): Promise<string | null> => {
    try {
      const res = await fetch(`${API}/orders/admin/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) return data.message ?? "Gagal update status";

      setOrders((prev) => prev.map((o) => (o.id === id ? data : o)));
      setSelectedOrder(data);
      return null;
    } catch {
      return "Tidak dapat terhubung ke server";
    }
  };

  const handleCancel = async (id: number): Promise<string | null> => {
    return handleUpdateStatus(id, "cancelled");
  };

  const filtered = orders.filter((o) => {
    const matchStatus = activeFilter === "all" || o.status === activeFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      o.user?.fullName?.toLowerCase().includes(q) ||
      o.dress?.name?.toLowerCase().includes(q) ||
      String(o.id).includes(q);
    return matchStatus && matchSearch;
  });

  const counts = {
    pending: orders.filter((o) => o.status === "pending").length,
    active: orders.filter((o) => o.status === "active").length,
    needsAction: orders.filter((o) => ["paid", "confirmed"].includes(o.status))
      .length,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 10,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "var(--admin-text-faint)",
            }}
          >
            Kelola
          </p>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.6rem, 3vw, 2rem)",
              fontWeight: 300,
              color: "var(--admin-text)",
            }}
          >
            Orders
          </h1>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          style={{
            background: CARD,
            border: `1px solid ${BORDER}`,
            color: "var(--admin-text-faint)",
            padding: "9px 12px",
            borderRadius: 3,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          <svg
            width="14"
            height="14"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            style={{ animation: loading ? "spin 1s linear infinite" : "none" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
        </button>
      </div>

      {error && (
        <div
          style={{
            background: "rgba(248,113,113,0.08)",
            border: "1px solid rgba(248,113,113,0.2)",
            borderRadius: 4,
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p style={{ fontSize: 13, color: "#f87171" }}>{error}</p>
          <button
            onClick={fetchOrders}
            style={{
              fontSize: 11,
              color: "#f87171",
              background: "rgba(248,113,113,0.15)",
              border: "1px solid rgba(248,113,113,0.3)",
              padding: "4px 12px",
              borderRadius: 3,
              cursor: "pointer",
            }}
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 12,
        }}
      >
        {[
          { label: "Total Pesanan", value: orders.length },
          { label: "Menunggu Bayar", value: counts.pending },
          { label: "Perlu Tindakan", value: counts.needsAction },
          { label: "Sedang Disewa", value: counts.active },
        ].map((s, i) => (
          <div
            key={i}
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
                fontSize: "1.8rem",
                fontWeight: 300,
                color: "var(--admin-text)",
                lineHeight: 1,
              }}
            >
              {loading ? "—" : s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div
        style={{
          background: CARD,
          border: `1px solid ${BORDER}`,
          borderRadius: 4,
          padding: "14px 16px",
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", flex: "1 1 200px" }}>
          <svg
            width="13"
            height="13"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--admin-text-faint)",
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Cari nama, dress, atau ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              background: "rgba(0,0,0,0.03)",
              border: `1px solid ${BORDER}`,
              borderRadius: 3,
              paddingLeft: 34,
              paddingRight: 12,
              paddingTop: 8,
              paddingBottom: 8,
              fontSize: 13,
              color: "var(--admin-text)",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setActiveFilter(opt.value)}
              style={{
                fontSize: 10,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "6px 12px",
                borderRadius: 20,
                cursor: "pointer",
                border: "none",
                background:
                  activeFilter === opt.value
                    ? "var(--admin-text)"
                    : "rgba(0,0,0,0.04)",
                color:
                  activeFilter === opt.value
                    ? "var(--admin-bg)"
                    : "var(--admin-text-muted)",
                transition: "all 0.15s",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabel */}
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
            padding: "14px 20px",
            borderBottom: `1px solid ${BORDER}`,
            display: "flex",
            justifyContent: "space-between",
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
            Semua Pesanan
          </p>
          <p style={{ fontSize: 10, color: "var(--admin-text-faint)" }}>
            {filtered.length} pesanan
          </p>
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "var(--admin-text-faint)" }}>
              Memuat data...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "var(--admin-text-faint)" }}>
              {orders.length === 0
                ? "Belum ada pesanan masuk"
                : "Tidak ada pesanan yang cocok"}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                minWidth: 760,
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.05)" }}>
                  {[
                    "Foto",
                    "Pelanggan",
                    "Dress",
                    "Tanggal Sewa",
                    "Durasi",
                    "Total",
                    "Status",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "11px 16px",
                        textAlign: "left",
                        fontSize: 9,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: "var(--admin-text-muted)",
                        fontWeight: 400,
                        borderBottom: `1px solid ${BORDER}`,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const thumb =
                    order.dress.photos?.find((p) => p.isThumbnail) ??
                    order.dress.photos?.[0];
                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      style={{
                        borderBottom: `1px solid ${BORDER}`,
                        cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.background = "rgba(0,0,0,0.02)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td style={{ padding: "10px 16px" }}>
                        <div
                          style={{
                            width: 40,
                            height: 54,
                            position: "relative",
                            borderRadius: 2,
                            overflow: "hidden",
                            border: `1px solid ${BORDER}`,
                            background: "rgba(0,0,0,0.03)",
                          }}
                        >
                          {thumb && (
                            <Image
                              src={`${IMG_BASE}${thumb.url}`}
                              alt=""
                              fill
                              style={{
                                objectFit: "cover",
                                objectPosition: "top",
                              }}
                            />
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "10px 16px" }}>
                        <p style={{ fontSize: 12, color: "var(--admin-text)" }}>
                          {order.user?.fullName}
                        </p>
                        <p
                          style={{
                            fontSize: 9,
                            color: "var(--admin-text-faint)",
                          }}
                        >
                          #{String(order.id).padStart(5, "0")}
                        </p>
                      </td>
                      <td
                        style={{
                          padding: "10px 16px",
                          fontSize: 12,
                          color: "var(--admin-text-muted)",
                        }}
                      >
                        {order.dress.name}
                      </td>
                      <td
                        style={{
                          padding: "10px 16px",
                          fontSize: 11,
                          color: "var(--admin-text-faint)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDate(order.startDate)} —{" "}
                        {formatDate(order.endDate)}
                      </td>
                      <td
                        style={{
                          padding: "10px 16px",
                          fontSize: 12,
                          color: "var(--admin-text-muted)",
                        }}
                      >
                        {order.totalDays} hari
                      </td>
                      <td
                        style={{
                          padding: "10px 16px",
                          fontSize: 12,
                          color: "var(--admin-text)",
                        }}
                      >
                        {formatPrice(order.totalPrice)}
                      </td>
                      <td style={{ padding: "10px 16px" }}>
                        <StatusBadge status={order.status} />
                      </td>
                      <td style={{ padding: "10px 16px" }}>
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--admin-text-faint)",
                          }}
                        >
                          →
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={handleUpdateStatus}
          onCancel={handleCancel}
        />
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
