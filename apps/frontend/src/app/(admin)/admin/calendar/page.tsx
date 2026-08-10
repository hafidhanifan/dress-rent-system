"use client";

// src/app/(admin)/admin/calendar/page.tsx

import { useState, useEffect, useCallback } from "react";
import { getToken } from "@/lib/auth";
import { statusCfg, OrderStatus } from "../orders/_components/StatusBadge";

const BORDER = "var(--admin-border)";
const CARD = "var(--admin-card-bg)";
const API = process.env.NEXT_PUBLIC_API_URL;

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

type CalendarOrder = {
  id: number;
  startDate: string;
  endDate: string;
  status: OrderStatus;
  dressName: string;
  customerName: string;
  sizeLabel: string | null;
};

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

// order yang overlap sama tanggal tertentu
function ordersOnDate(date: Date, orders: CalendarOrder[]) {
  return orders.filter((o) => {
    const start = startOfDay(new Date(o.startDate));
    const end = startOfDay(new Date(o.endDate));
    return date >= start && date <= end;
  });
}

export default function CalendarPage() {
  const today = startOfDay(new Date());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1); // 1-12
  const [orders, setOrders] = useState<CalendarOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API}/orders/admin/calendar?year=${viewYear}&month=${viewMonth}`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
          cache: "no-store",
        },
      );
      if (res.ok) setOrders(await res.json());
    } catch {
      // gagal ambil data -> kalender tampil kosong
    } finally {
      setLoading(false);
    }
  }, [viewYear, viewMonth]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const navigate = (dir: number) => {
    let m = viewMonth + dir;
    let y = viewYear;
    if (m > 12) {
      m = 1;
      y++;
    }
    if (m < 1) {
      m = 12;
      y--;
    }
    setViewMonth(m);
    setViewYear(y);
    setSelectedDate(null);
  };

  const selectedOrders = selectedDate ? ordersOnDate(selectedDate, orders) : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader />

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}
        className="lg:grid-cols-[1fr_320px]"
      >
        <CalendarGrid
          year={viewYear}
          month={viewMonth}
          today={today}
          orders={orders}
          loading={loading}
          selectedDate={selectedDate}
          onNavigate={navigate}
          onSelectDate={setSelectedDate}
        />

        <DayDetailPanel date={selectedDate} orders={selectedOrders} />
      </div>
    </div>
  );
}

function PageHeader() {
  return (
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
        Kalender Penyewaan
      </h1>
    </div>
  );
}

// kalender bulanan, tiap tanggal nunjukin jumlah dress yang aktif
function CalendarGrid({
  year,
  month,
  today,
  orders,
  loading,
  selectedDate,
  onNavigate,
  onSelectDate,
}: {
  year: number;
  month: number;
  today: Date;
  orders: CalendarOrder[];
  loading: boolean;
  selectedDate: Date | null;
  onNavigate: (dir: number) => void;
  onSelectDate: (date: Date) => void;
}) {
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  const startDay = first.getDay();

  return (
    <div
      style={{
        background: CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: 4,
        padding: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <button onClick={() => onNavigate(-1)} style={navButtonStyle}>
          <ChevronIcon direction="left" />
        </button>
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.4rem",
            fontWeight: 300,
            color: "var(--admin-text)",
          }}
        >
          {MONTHS[month - 1]} {year}
        </p>
        <button onClick={() => onNavigate(1)} style={navButtonStyle}>
          <ChevronIcon direction="right" />
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 4,
        }}
      >
        {DAYS.map((d) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              padding: "6px 0",
              fontSize: 9,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--admin-text-faint)",
            }}
          >
            {d}
          </div>
        ))}

        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: last.getDate() }).map((_, i) => {
          const d = i + 1;
          const date = startOfDay(new Date(year, month - 1, d));
          const dayOrders = loading ? [] : ordersOnDate(date, orders);
          const isToday = date.getTime() === today.getTime();
          const isSelected = selectedDate?.getTime() === date.getTime();

          return (
            <button
              key={d}
              onClick={() => onSelectDate(date)}
              style={{
                minHeight: 68,
                borderRadius: 4,
                cursor: "pointer",
                padding: 6,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                background: isSelected
                  ? "var(--admin-accent-bg)"
                  : "transparent",
                border: `1px solid ${isSelected ? "var(--admin-accent-border)" : isToday ? "var(--admin-accent-border)" : "transparent"}`,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: isToday
                    ? "var(--admin-accent)"
                    : "var(--admin-text-secondary)",
                  marginBottom: 4,
                }}
              >
                {d}
              </span>
              {dayOrders.length > 0 && (
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 500,
                    color: "var(--admin-accent)",
                    background: "var(--admin-accent-bg)",
                    borderRadius: 20,
                    padding: "1px 6px",
                  }}
                >
                  {dayOrders.length}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// panel kanan, muncul begitu klik salah satu tanggal
function DayDetailPanel({
  date,
  orders,
}: {
  date: Date | null;
  orders: CalendarOrder[];
}) {
  if (!date) {
    return (
      <div
        style={{
          background: CARD,
          border: `1px solid ${BORDER}`,
          borderRadius: 4,
          padding: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 200,
        }}
      >
        <p
          style={{
            fontSize: 12,
            color: "var(--admin-text-faint)",
            textAlign: "center",
          }}
        >
          Klik salah satu tanggal untuk lihat detail dress yang aktif
        </p>
      </div>
    );
  }

  const dateLabel = date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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
          fontSize: 9,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "var(--admin-text-faint)",
          marginBottom: 4,
        }}
      >
        Detail Tanggal
      </p>
      <p style={{ fontSize: 13, color: "var(--admin-text)", marginBottom: 16 }}>
        {dateLabel}
      </p>

      {orders.length === 0 ? (
        <p style={{ fontSize: 12, color: "var(--admin-text-faint)" }}>
          Tidak ada dress yang disewa di tanggal ini
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {orders.map((order) => {
            const cfg = statusCfg[order.status];
            return (
              <div
                key={order.id}
                style={{
                  padding: "10px 12px",
                  background: "rgba(0,0,0,0.02)",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 3,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <p style={{ fontSize: 12, color: "var(--admin-text)" }}>
                    {order.dressName}
                  </p>
                  <span
                    style={{
                      fontSize: 8,
                      color: cfg.color,
                      background: cfg.bg,
                      border: `1px solid ${cfg.border}`,
                      padding: "1px 6px",
                      borderRadius: 20,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {cfg.label}
                  </span>
                </div>
                <p style={{ fontSize: 10, color: "var(--admin-text-muted)" }}>
                  {order.customerName}
                  {order.sizeLabel && ` · Ukuran ${order.sizeLabel}`}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const navButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "var(--admin-text-muted)",
  padding: 6,
};

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  const d =
    direction === "left"
      ? "M15.75 19.5 8.25 12l7.5-7.5"
      : "m8.25 4.5 7.5 7.5-7.5 7.5";
  return (
    <svg
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}
