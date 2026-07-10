"use client";

// src/app/(admin)/admin/categories/_components/CategoryModal.tsx

import { useState, useEffect } from "react";

const GOLD = "var(--admin-accent)";
const BORDER = "var(--admin-border)";

export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CategoryFormData = {
  name: string;
  description: string;
  order: string;
  isActive: boolean;
};

export default function CategoryModal({
  mode,
  category,
  onClose,
  onSubmit,
}: {
  mode: "add" | "edit";
  category?: Category;
  onClose: () => void;
  onSubmit: (
    form: CategoryFormData,
    category?: Category,
  ) => Promise<string | null>;
}) {
  const [form, setForm] = useState<CategoryFormData>({
    name: category?.name ?? "",
    description: category?.description ?? "",
    order: String(category?.order ?? 0),
    isActive: category?.isActive ?? true,
  });
  const [errors, setErrors] = useState<
    Partial<CategoryFormData & { server: string }>
  >({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  const set = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setForm((p) => ({
      ...p,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
    if (errors[name as keyof typeof errors])
      setErrors((p) => ({ ...p, [name]: "", server: "" }));
  };

  const validate = () => {
    const errs: Partial<CategoryFormData> = {};
    if (!form.name.trim()) errs.name = "Nama kategori wajib diisi";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    const error = await onSubmit(form, category);
    setSubmitting(false);
    if (error) {
      setErrors({ server: error });
    } else {
      onClose();
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--admin-border)",
    border: `1px solid var(--admin-border)`,
    borderRadius: 3,
    padding: "10px 14px",
    fontSize: 13,
    color: "var(--admin-text)",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  const lbl: React.CSSProperties = {
    display: "block",
    fontSize: 9,
    letterSpacing: "0.2em",
    textTransform: "uppercase" as const,
    color: "var(--admin-text-faint)",
    marginBottom: 8,
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
          maxWidth: 480,
          background: "var(--admin-bg)",
          border: `1px solid ${BORDER}`,
          borderRadius: 6,
          boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
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
              {mode === "add" ? "Tambah" : "Edit"} Kategori
            </p>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 20,
                fontWeight: 300,
                color: "var(--admin-text)",
              }}
            >
              {mode === "add" ? "Kategori Baru" : category?.name}
            </h2>
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
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {errors.server && (
            <div
              style={{
                background: "rgba(248,113,113,0.08)",
                border: "1px solid rgba(248,113,113,0.2)",
                borderRadius: 3,
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <svg
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#f87171"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                />
              </svg>
              <p style={{ fontSize: 12, color: "#f87171" }}>{errors.server}</p>
            </div>
          )}

          {/* Nama */}
          <div>
            <label style={lbl}>Nama Kategori *</label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={set}
              placeholder="Evening Gown"
              style={{
                ...inputStyle,
                borderColor: errors.name
                  ? "rgba(248,113,113,0.5)"
                  : "var(--admin-border)",
              }}
            />
            {errors.name && (
              <p style={{ fontSize: 10, color: "#f87171", marginTop: 4 }}>
                {errors.name}
              </p>
            )}
          </div>

          {/* Deskripsi */}
          <div>
            <label style={lbl}>
              Deskripsi{" "}
              <span style={{ color: "var(--admin-text-faint)" }}>
                (opsional)
              </span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={set}
              rows={2}
              placeholder="Deskripsi singkat kategori ini..."
              style={{ ...inputStyle, resize: "none" }}
            />
          </div>

          {/* Order + Status */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            <div>
              <label style={lbl}>Urutan Tampil</label>
              <input
                name="order"
                type="number"
                min="0"
                value={form.order}
                onChange={set}
                placeholder="0"
                style={inputStyle}
              />
              <p
                style={{
                  fontSize: 9,
                  color: "var(--admin-text-faint)",
                  marginTop: 4,
                }}
              >
                Angka kecil = tampil lebih dulu
              </p>
            </div>
            <div>
              <label style={lbl}>Status</label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: 3,
                  cursor: "pointer",
                  border: `1px solid ${form.isActive ? "rgba(52,211,153,0.3)" : BORDER}`,
                  background: form.isActive
                    ? "rgba(52,211,153,0.05)"
                    : "rgba(0,0,0,0.02)",
                  transition: "all 0.2s",
                }}
              >
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={set}
                  style={{ display: "none" }}
                />
                <div
                  style={{
                    width: 32,
                    height: 18,
                    borderRadius: 9,
                    position: "relative",
                    background: form.isActive
                      ? "rgba(52,211,153,0.3)"
                      : "var(--admin-border)",
                    border: `1px solid ${form.isActive ? "rgba(52,211,153,0.5)" : BORDER}`,
                    transition: "all 0.2s",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 2,
                      left: form.isActive ? 14 : 2,
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: form.isActive
                        ? "#34d399"
                        : "var(--admin-text-faint)",
                      transition: "all 0.2s",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 12,
                    color: form.isActive
                      ? "#34d399"
                      : "var(--admin-text-faint)",
                  }}
                >
                  {form.isActive ? "Aktif" : "Nonaktif"}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: `1px solid ${BORDER}`,
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 11,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--admin-text-faint)",
              padding: "10px 16px",
            }}
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
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
              padding: "10px 24px",
              borderRadius: 3,
              cursor: submitting ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              minWidth: 100,
            }}
          >
            {submitting ? "Menyimpan..." : mode === "add" ? "Tambah" : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
