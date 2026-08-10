"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { statusCfg, OrderStatus } from "../orders/_components/StatusBadge";

const BORDER = "var(--admin-border)";
const CARD = "var(--admin-card-bg)";
const API = process.env.NEXT_PUBLIC_API_URL;

const TABLE_HEADERS = [
  "Nama",
  "Kontak",
  "Total Order",
  "Total Belanja",
  "Order Terakhir",
  "Bergabung",
];

type Customer = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string | null;
  lastOrderStatus: OrderStatus | null;
};

const formatPrice = (n: number) => `Rp ${Number(n).toLocaleString("id-ID")}`;
const formatDate = (s: string) =>
  new Date(s).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/user/admin/all`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        cache: "no-store",
      });
      if (!res.ok) throw new Error();
      setCustomers(await res.json());
    } catch {
      setError("Tidak dapat memuat data customer.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      !q ||
      c.fullName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  const activeThisMonth = customers.filter((c) => {
    if (!c.lastOrderDate) return false;
    const orderDate = new Date(c.lastOrderDate);
    const now = new Date();
    return (
      orderDate.getMonth() === now.getMonth() &&
      orderDate.getFullYear() === now.getFullYear()
    );
  }).length;

  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader loading={loading} onRefresh={fetchCustomers} />

      {error && <ErrorBanner message={error} onRetry={fetchCustomers} />}

      <StatsRow
        loading={loading}
        total={customers.length}
        activeThisMonth={activeThisMonth}
        totalRevenue={totalRevenue}
      />

      <SearchBar search={search} onChangeSearch={setSearch} />

      <CustomersTable
        customers={filtered}
        totalCustomers={customers.length}
        loading={loading}
      />
    </div>
  );
}

function PageHeader({
  loading,
  onRefresh,
}: {
  loading: boolean;
  onRefresh: () => void;
}) {
  return (
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
          Customers
        </h1>
      </div>
      <button
        onClick={onRefresh}
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
        <RefreshIcon spinning={loading} />
      </button>
    </div>
  );
}

function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
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
      <p style={{ fontSize: 13, color: "#f87171" }}>{message}</p>
      <button
        onClick={onRetry}
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
  );
}

// 3 kartu ringkasan: total customer, aktif bulan ini, total revenue
function StatsRow({
  loading,
  total,
  activeThisMonth,
  totalRevenue,
}: {
  loading: boolean;
  total: number;
  activeThisMonth: number;
  totalRevenue: number;
}) {
  const stats = [
    { label: "Total Customer", value: total },
    { label: "Aktif Bulan Ini", value: activeThisMonth },
    { label: "Total Revenue", value: formatPrice(totalRevenue) },
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
            {loading ? "—" : s.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function SearchBar({
  search,
  onChangeSearch,
}: {
  search: string;
  onChangeSearch: (v: string) => void;
}) {
  return (
    <div
      style={{
        background: CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: 4,
        padding: "14px 16px",
      }}
    >
      <div style={{ position: "relative" }}>
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
          placeholder="Cari nama atau email..."
          value={search}
          onChange={(e) => onChangeSearch(e.target.value)}
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
    </div>
  );
}

function CustomersTable({
  customers,
  totalCustomers,
  loading,
}: {
  customers: Customer[];
  totalCustomers: number;
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
          Semua Customer
        </p>
        <p style={{ fontSize: 10, color: "var(--admin-text-faint)" }}>
          {customers.length} customer
        </p>
      </div>

      {loading ? (
        <div style={{ padding: 48, textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "var(--admin-text-faint)" }}>
            Memuat data...
          </p>
        </div>
      ) : customers.length === 0 ? (
        <div style={{ padding: 48, textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "var(--admin-text-faint)" }}>
            {totalCustomers === 0
              ? "Belum ada customer terdaftar"
              : "Tidak ada customer yang cocok"}
          </p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", minWidth: 760, borderCollapse: "collapse" }}
          >
            <thead>
              <tr style={{ background: "rgba(0,0,0,0.05)" }}>
                {TABLE_HEADERS.map((h) => (
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
              {customers.map((customer) => (
                <CustomerRow key={customer.id} customer={customer} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CustomerRow({ customer }: { customer: Customer }) {
  const router = useRouter();
  const statusInfo = customer.lastOrderStatus
    ? statusCfg[customer.lastOrderStatus]
    : null;

  return (
    <tr
      onClick={() => router.push(`/admin/customers/${customer.id}`)}
      style={{
        borderBottom: `1px solid ${BORDER}`,
        cursor: "pointer",
        transition: "background 0.15s",
      }}
      onMouseOver={(e) =>
        (e.currentTarget.style.background = "rgba(0,0,0,0.02)")
      }
      onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <td
        style={{
          padding: "12px 16px",
          fontSize: 13,
          color: "var(--admin-text)",
        }}
      >
        {customer.fullName}
      </td>
      <td style={{ padding: "12px 16px" }}>
        <p style={{ fontSize: 11, color: "var(--admin-text-muted)" }}>
          {customer.email}
        </p>
        <p style={{ fontSize: 10, color: "var(--admin-text-faint)" }}>
          {customer.phone}
        </p>
      </td>
      <td
        style={{
          padding: "12px 16px",
          fontSize: 13,
          color: "var(--admin-text)",
        }}
      >
        {customer.totalOrders}
      </td>
      <td
        style={{
          padding: "12px 16px",
          fontSize: 13,
          color: "var(--admin-text)",
        }}
      >
        {formatPrice(customer.totalSpent)}
      </td>
      <td style={{ padding: "12px 16px" }}>
        {customer.lastOrderDate && statusInfo ? (
          <div>
            <p style={{ fontSize: 11, color: "var(--admin-text-muted)" }}>
              {formatDate(customer.lastOrderDate)}
            </p>
            <span style={{ fontSize: 9, color: statusInfo.color }}>
              {statusInfo.label}
            </span>
          </div>
        ) : (
          <span style={{ fontSize: 11, color: "var(--admin-text-faint)" }}>
            Belum pernah order
          </span>
        )}
      </td>
      <td
        style={{
          padding: "12px 16px",
          fontSize: 11,
          color: "var(--admin-text-faint)",
        }}
      >
        {formatDate(customer.createdAt)}
      </td>
    </tr>
  );
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      style={{ animation: spinning ? "spin 1s linear infinite" : "none" }}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </svg>
  );
}
