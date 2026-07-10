"use client";

// src/app/(admin)/admin/categories/_components/DeleteCategoryModal.tsx

import { useState } from "react";
import { Category } from "./CategoryModal";

const BORDER = "var(--admin-border)";

export default function DeleteCategoryModal({
  category,
  onClose,
  onConfirm,
}: {
  category: Category;
  onClose: () => void;
  onConfirm: () => Promise<string | null>;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handle = async () => {
    setDeleting(true);
    const err = await onConfirm();
    if (err) {
      setError(err);
      setDeleting(false);
    }
  };

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
          maxWidth: 380,
          background: "var(--admin-bg)",
          border: `1px solid ${BORDER}`,
          borderRadius: 6,
          padding: 28,
          boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            marginBottom: 16,
            background: "rgba(248,113,113,0.08)",
            border: "1px solid rgba(248,113,113,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="18"
            height="18"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#f87171"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        <h3
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 20,
            fontWeight: 300,
            color: "var(--admin-text)",
            marginBottom: 8,
          }}
        >
          Hapus Kategori?
        </h3>
        <p
          style={{
            fontSize: 13,
            color: "var(--admin-text-muted)",
            lineHeight: 1.6,
            marginBottom: error ? 12 : 24,
          }}
        >
          <span style={{ color: "var(--admin-text)" }}>{category.name}</span>{" "}
          akan dihapus permanen dan tidak bisa dikembalikan.
        </p>

        {error && (
          <div
            style={{
              background: "rgba(248,113,113,0.08)",
              border: "1px solid rgba(248,113,113,0.2)",
              borderRadius: 3,
              padding: "10px 14px",
              marginBottom: 16,
            }}
          >
            <p style={{ fontSize: 12, color: "#f87171" }}>{error}</p>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: `1px solid ${BORDER}`,
              color: "var(--admin-text-faint)",
              fontSize: 11,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              padding: "9px 16px",
              borderRadius: 3,
              cursor: "pointer",
            }}
          >
            Batal
          </button>
          <button
            onClick={handle}
            disabled={deleting}
            style={{
              background: deleting
                ? "rgba(248,113,113,0.05)"
                : "rgba(248,113,113,0.1)",
              border: "1px solid rgba(248,113,113,0.3)",
              color: deleting ? "#8a4040" : "#f87171",
              fontSize: 11,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              padding: "9px 20px",
              borderRadius: 3,
              cursor: deleting ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
          >
            {deleting ? "Menghapus..." : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}
