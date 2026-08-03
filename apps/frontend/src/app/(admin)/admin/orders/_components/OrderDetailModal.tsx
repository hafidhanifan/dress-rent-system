"use client";

// src/app/(admin)/admin/orders/_components/OrderDetailModal.tsx

import { useState } from "react";
import Image from "next/image";
import StatusBadge, { OrderStatus } from "./StatusBadge";

const BORDER = "var(--admin-border)";
const GOLD = "var(--admin-accent)";
const IMG_BASE = "http://localhost:3001";

export type AdminOrder = {
  id: number;
  userId: number;
  dressId: number;
  sizeId: number | null;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  notes: string | null;
  status: OrderStatus;
  contactPhone: string;
  returnedAt: string | null;
  createdAt: string;
  user: { id: number; fullName: string; email: string; phone: string };
  dress: {
    id: number;
    name: string;
    slug: string;
    photos: { id: number; url: string; isThumbnail: boolean; order: number }[];
  };
  size: { id: number; label: string } | null;
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

const formatDateTime = (s: string) =>
  new Date(s).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// Alur status maju — dipakai untuk tentukan tombol aksi apa yang muncul
const nextStatusMap: Partial<
  Record<OrderStatus, { next: OrderStatus; label: string }>
> = {
  paid: { next: "confirmed", label: "Konfirmasi Pesanan" },
  confirmed: { next: "active", label: "Tandai Dress Dikirim" },
  active: { next: "returned", label: "Tandai Dress Dikembalikan" },
};

export default function OrderDetailModal({
  order,
  onClose,
  onUpdateStatus,
  onCancel,
}: {
  order: AdminOrder;
  onClose: () => void;
  onUpdateStatus: (id: number, status: OrderStatus) => Promise<string | null>;
  onCancel: (id: number) => Promise<string | null>;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const thumb =
    order.dress.photos?.find((p) => p.isThumbnail) ?? order.dress.photos?.[0];
  const nextAction = nextStatusMap[order.status];

  const handleAdvance = async () => {
    if (!nextAction) return;
    setSubmitting(true);
    setError("");
    const err = await onUpdateStatus(order.id, nextAction.next);
    setSubmitting(false);
    if (err) setError(err);
  };

  const handleCancel = async () => {
    setSubmitting(true);
    setError("");
    const err = await onCancel(order.id);
    setSubmitting(false);
    if (err) setError(err);
    else setShowCancelConfirm(false);
  };

  const canCancel = !["returned", "cancelled"].includes(order.status);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 640,
          background: "var(--admin-bg)",
          border: `1px solid ${BORDER}`,
          borderRadius: 6,
          boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: `1px solid ${BORDER}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexShrink: 0,
          }}
        >
          <div>
            <p
              style={{
                fontSize: 9,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "var(--admin-text-faint)",
                marginBottom: 4,
              }}
            >
              Pesanan #{String(order.id).padStart(5, "0")}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 20,
                  fontWeight: 300,
                  color: "var(--admin-text)",
                }}
              >
                {order.dress.name}
              </h2>
              <StatusBadge status={order.status} />
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--admin-text-faint)",
              padding: 4,
            }}
          >
            <svg
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            overflowY: "auto",
            flex: 1,
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {error && (
            <div
              style={{
                background: "rgba(248,113,113,0.08)",
                border: "1px solid rgba(248,113,113,0.2)",
                borderRadius: 3,
                padding: "10px 14px",
              }}
            >
              <p style={{ fontSize: 12, color: "#f87171" }}>{error}</p>
            </div>
          )}

          {/* Info dress + customer */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "80px 1fr",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 80,
                height: 106,
                position: "relative",
                borderRadius: 3,
                overflow: "hidden",
                border: `1px solid ${BORDER}`,
                background: "rgba(0,0,0,0.03)",
              }}
            >
              {thumb && (
                <Image
                  src={`${IMG_BASE}${thumb.url}`}
                  alt={order.dress.name}
                  fill
                  style={{ objectFit: "cover", objectPosition: "top" }}
                />
              )}
            </div>
            <div>
              <p
                style={{
                  fontSize: 9,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--admin-text-faint)",
                  marginBottom: 4,
                }}
              >
                Pelanggan
              </p>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--admin-text)",
                  marginBottom: 2,
                }}
              >
                {order.user?.fullName}
              </p>
              <p
                style={{
                  fontSize: 11,
                  color: "var(--admin-text-muted)",
                  marginBottom: 8,
                }}
              >
                {order.user?.email}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "var(--admin-text)" }}>
                  {order.contactPhone}
                </span>
                <a
                  href={`https://wa.me/${order.contactPhone.replace(/^0/, "62").replace(/\D/g, "")}?text=${encodeURIComponent(
                    `Halo ${order.user?.fullName}, saya admin Naia Dress. Ingin konfirmasi pesanan #${String(order.id).padStart(5, "0")} untuk dress ${order.dress.name}.`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 10,
                    padding: "3px 10px",
                    borderRadius: 20,
                    background: "rgba(74,124,90,0.1)",
                    color: "#4a7c5a",
                    border: "1px solid rgba(74,124,90,0.25)",
                    textDecoration: "none",
                  }}
                >
                  <svg
                    width="11"
                    height="11"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01C17.18 3.03 14.69 2 12.04 2zm0 18.15c-1.49 0-2.95-.4-4.23-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.13 8.13 0 0 1-1.25-4.32c0-4.5 3.66-8.16 8.16-8.16 2.18 0 4.23.85 5.77 2.39a8.1 8.1 0 0 1 2.39 5.77c0 4.5-3.66 8.18-8.15 8.18z" />
                  </svg>
                  Chat WA
                </a>
              </div>
            </div>
          </div>

          {/* Detail rental */}
          <div>
            <p
              style={{
                fontSize: 9,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--admin-text-faint)",
                marginBottom: 10,
              }}
            >
              Detail Sewa
            </p>
            {[
              { label: "Tanggal Mulai", value: formatDate(order.startDate) },
              { label: "Tanggal Selesai", value: formatDate(order.endDate) },
              { label: "Durasi", value: `${order.totalDays} hari` },
              { label: "Ukuran", value: order.size?.label ?? "—" },
              { label: "Total Harga", value: formatPrice(order.totalPrice) },
              { label: "Dipesan Pada", value: formatDateTime(order.createdAt) },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: `1px solid ${BORDER}`,
                }}
              >
                <span
                  style={{ fontSize: 11, color: "var(--admin-text-faint)" }}
                >
                  {item.label}
                </span>
                <span style={{ fontSize: 12, color: "var(--admin-text)" }}>
                  {item.value}
                </span>
              </div>
            ))}
            {order.returnedAt && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                }}
              >
                <span
                  style={{ fontSize: 11, color: "var(--admin-text-faint)" }}
                >
                  Dikembalikan Pada
                </span>
                <span style={{ fontSize: 12, color: "#4a7c5a" }}>
                  {formatDateTime(order.returnedAt)}
                </span>
              </div>
            )}
          </div>

          {/* Catatan */}
          {order.notes && (
            <div>
              <p
                style={{
                  fontSize: 9,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--admin-text-faint)",
                  marginBottom: 6,
                }}
              >
                Catatan Pelanggan
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--admin-text-muted)",
                  background: "rgba(0,0,0,0.02)",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 3,
                  padding: "10px 12px",
                  lineHeight: 1.5,
                }}
              >
                {order.notes}
              </p>
            </div>
          )}

          {/* Konfirmasi batal */}
          {showCancelConfirm && (
            <div
              style={{
                background: "rgba(248,113,113,0.06)",
                border: "1px solid rgba(248,113,113,0.2)",
                borderRadius: 4,
                padding: "14px 16px",
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  color: "var(--admin-text)",
                  marginBottom: 12,
                }}
              >
                Yakin ingin membatalkan pesanan ini?
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  style={{
                    flex: 1,
                    padding: "8px",
                    fontSize: 10,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    background: "none",
                    border: `1px solid ${BORDER}`,
                    color: "var(--admin-text-muted)",
                    borderRadius: 3,
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleCancel}
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: "8px",
                    fontSize: 10,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    background: "rgba(248,113,113,0.12)",
                    border: "1px solid rgba(248,113,113,0.3)",
                    color: "#f87171",
                    borderRadius: 3,
                    cursor: submitting ? "not-allowed" : "pointer",
                  }}
                >
                  {submitting ? "Memproses..." : "Ya, Batalkan"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer — aksi */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: `1px solid ${BORDER}`,
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            flexShrink: 0,
          }}
        >
          {canCancel && !showCancelConfirm ? (
            <button
              onClick={() => setShowCancelConfirm(true)}
              style={{
                fontSize: 11,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--admin-danger)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "10px 0",
              }}
            >
              Batalkan Pesanan
            </button>
          ) : (
            <div />
          )}

          {nextAction && (
            <button
              onClick={handleAdvance}
              disabled={submitting}
              style={{
                background: submitting
                  ? "var(--admin-accent-bg)"
                  : "var(--admin-accent-bg)",
                border: "1px solid var(--admin-accent-border)",
                color: submitting ? "var(--admin-text-faint)" : GOLD,
                fontSize: 11,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                padding: "10px 22px",
                borderRadius: 3,
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Memproses..." : nextAction.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
