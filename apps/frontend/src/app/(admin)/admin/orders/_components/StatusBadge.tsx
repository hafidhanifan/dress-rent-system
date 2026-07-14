"use client";

// src/app/(admin)/admin/orders/_components/StatusBadge.tsx

export type OrderStatus =
  | "pending"
  | "paid"
  | "confirmed"
  | "active"
  | "returned"
  | "cancelled";

export const statusCfg: Record<
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
    color: "#4a7c8b",
    bg: "rgba(74,124,139,0.08)",
    border: "rgba(74,124,139,0.25)",
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

export default function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = statusCfg[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 9,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        padding: "3px 10px",
        borderRadius: 20,
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
      }}
    >
      <span
        style={{
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: cfg.color,
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  );
}
