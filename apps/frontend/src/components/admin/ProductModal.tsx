"use client";

import { useState, useEffect } from "react";

export type Product = {
  id?: number;
  name: string;
  category: string;
  price: string;
  stock: string;
  size: string;
  description: string;
  status: "available" | "unavailable";
};

const CATEGORIES = [
  "Evening Gown",
  "Cocktail",
  "Midi Dress",
  "Wrap Dress",
  "Maxi Dress",
];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const BORDER = "rgba(255,255,255,0.08)";
const INPUT_BG = "rgba(255,255,255,0.03)";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: 9,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#4a4440",
          marginBottom: 8,
        }}
      >
        {label}
      </label>
      {children}
      {error && (
        <p style={{ fontSize: 10, color: "#f87171", marginTop: 4 }}>{error}</p>
      )}
    </div>
  );
}

const inputStyle = (hasError?: boolean): React.CSSProperties => ({
  width: "100%",
  background: INPUT_BG,
  border: `1px solid ${hasError ? "rgba(248,113,113,0.5)" : BORDER}`,
  borderRadius: 3,
  padding: "10px 14px",
  fontSize: 13,
  color: "#c8baa0",
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
});

export default function ProductModal({
  isOpen,
  mode,
  product,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  mode: "add" | "edit";
  product: Product | null;
  onClose: () => void;
  onSubmit: (data: Product) => void;
}) {
  const empty: Product = {
    name: "",
    category: "",
    price: "",
    stock: "",
    size: "",
    description: "",
    status: "available",
  };
  const [form, setForm] = useState<Product>(empty);
  const [errors, setErrors] = useState<Partial<Product>>({});

  useEffect(() => {
    setForm(mode === "edit" && product ? product : empty);
    setErrors({});
  }, [isOpen, mode, product]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const set = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name as keyof Product]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e: Partial<Product> = {};
    if (!form.name.trim()) e.name = "Wajib diisi";
    if (!form.category) e.category = "Pilih kategori";
    if (!form.price) e.price = "Wajib diisi";
    if (!form.stock) e.stock = "Wajib diisi";
    if (!form.size) e.size = "Pilih ukuran";
    setErrors(e);
    return Object.keys(e).length === 0;
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
          maxWidth: 520,
          background: "#141310",
          border: `1px solid ${BORDER}`,
          borderRadius: 6,
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
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
                color: "#4a4440",
                marginBottom: 4,
              }}
            >
              {mode === "add" ? "Tambah" : "Edit"} Produk
            </p>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 20,
                fontWeight: 300,
                color: "#e8ddc8",
              }}
            >
              {mode === "add" ? "Produk Baru" : form.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              color: "#3a3430",
              padding: 4,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
            className="hover:!text-[#7a7060] transition-colors"
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
            gap: 16,
          }}
        >
          <Field label="Nama Produk" error={errors.name}>
            <input
              name="name"
              type="text"
              placeholder="Celeste Midi Dress"
              value={form.name}
              onChange={set}
              style={inputStyle(!!errors.name)}
            />
          </Field>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <Field label="Kategori" error={errors.category}>
              <select
                name="category"
                value={form.category}
                onChange={set}
                style={{
                  ...inputStyle(!!errors.category),
                  appearance: "none",
                  cursor: "pointer",
                }}
              >
                <option value="">Pilih...</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Ukuran" error={errors.size}>
              <select
                name="size"
                value={form.size}
                onChange={set}
                style={{
                  ...inputStyle(!!errors.size),
                  appearance: "none",
                  cursor: "pointer",
                }}
              >
                <option value="">Pilih...</option>
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <Field label="Harga Sewa / Hari" error={errors.price}>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 11,
                    color: "#4a4440",
                  }}
                >
                  Rp
                </span>
                <input
                  name="price"
                  type="number"
                  placeholder="350000"
                  value={form.price}
                  onChange={set}
                  style={{ ...inputStyle(!!errors.price), paddingLeft: 32 }}
                />
              </div>
            </Field>
            <Field label="Stok" error={errors.stock}>
              <input
                name="stock"
                type="number"
                placeholder="1"
                value={form.stock}
                onChange={set}
                style={inputStyle(!!errors.stock)}
              />
            </Field>
          </div>

          {/* Status */}
          <Field label="Status">
            <div style={{ display: "flex", gap: 10 }}>
              {(["available", "unavailable"] as const).map((s) => (
                <label
                  key={s}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "10px",
                    borderRadius: 3,
                    cursor: "pointer",
                    border: `1px solid ${form.status === s ? (s === "available" ? "rgba(52,211,153,0.4)" : "rgba(248,113,113,0.3)") : BORDER}`,
                    background:
                      form.status === s
                        ? s === "available"
                          ? "rgba(52,211,153,0.06)"
                          : "rgba(248,113,113,0.06)"
                        : INPUT_BG,
                    transition: "all 0.2s",
                  }}
                >
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={form.status === s}
                    onChange={set}
                    style={{ display: "none" }}
                  />
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: s === "available" ? "#34d399" : "#f87171",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      color:
                        form.status === s
                          ? s === "available"
                            ? "#34d399"
                            : "#f87171"
                          : "#4a4440",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {s === "available" ? "Tersedia" : "Tidak Tersedia"}
                  </span>
                </label>
              ))}
            </div>
          </Field>

          <Field label="Deskripsi">
            <textarea
              name="description"
              value={form.description}
              onChange={set}
              rows={3}
              placeholder="Deskripsi singkat produk..."
              style={{ ...inputStyle(), resize: "none", fontFamily: "inherit" }}
            />
          </Field>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: `1px solid ${BORDER}`,
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            flexShrink: 0,
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
              color: "#4a4440",
              padding: "10px 16px",
            }}
            className="hover:!text-[#7a7060] transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => {
              if (validate()) {
                onSubmit(form);
                onClose();
              }
            }}
            style={{
              background: "rgba(212,180,120,0.12)",
              border: "1px solid rgba(212,180,120,0.3)",
              color: "#d4b478",
              fontSize: 11,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              padding: "10px 24px",
              borderRadius: 3,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            className="hover:!bg-[rgba(212,180,120,0.2)] hover:!border-[rgba(212,180,120,0.5)]"
          >
            {mode === "add" ? "Tambah" : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
