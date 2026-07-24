"use client";

// src/app/(admin)/admin/products/_components/DressModal.tsx

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const GOLD = "var(--admin-accent)";
const BORDER = "var(--admin-border)";
const API = process.env.NEXT_PUBLIC_API_URL;
const IMG_BASE = "http://localhost:3001";
const SIZE_LABELS = ["XS", "S", "M", "L", "XL", "XXL", "Custom"];

type Category = { id: number; name: string };
type DressPhoto = {
  id: number;
  url: string;
  isThumbnail: boolean;
  order: number;
};
type DressSize = {
  id?: number;
  label: string;
  bust: string;
  waist: string;
  hip: string;
  length: string;
  stock: string;
};
type Dress = {
  id: number;
  name: string;
  slug: string;
  description: string;
  pricePerDay: number;
  minRentalDays: number;
  status: "available" | "unavailable" | "archived";
  condition: "new" | "good" | "fair";
  color: string;
  material: string;
  isActive: boolean;
  categoryId: number;
  category: Category;
  photos: DressPhoto[];
  sizes: DressSize[];
  spotlightOrder: number | null;
};
type DressForm = {
  name: string;
  description: string;
  pricePerDay: string;
  minRentalDays: string;
  status: "available" | "unavailable" | "archived";
  condition: "new" | "good" | "fair";
  color: string;
  material: string;
  isActive: boolean;
  categoryId: string;
  sizes: DressSize[];
  isSpotlight: boolean; // ← TAMBAHKAN INI
  spotlightOrder: string;
};

const emptySize = (): DressSize => ({
  label: "M",
  bust: "",
  waist: "",
  hip: "",
  length: "",
  stock: "1",
});
const emptyForm = (): DressForm => ({
  name: "",
  description: "",
  pricePerDay: "",
  minRentalDays: "1",
  status: "available",
  condition: "good",
  color: "",
  material: "",
  isActive: true,
  categoryId: "",
  sizes: [emptySize()],
  isSpotlight: false,
  spotlightOrder: "1",
});

export default function DressModal({
  mode,
  dress,
  categories,
  onClose,
  onSuccess,
  onSetThumbnail,
  onDeletePhoto,
}: {
  mode: "add" | "edit";
  dress?: Dress;
  categories: Category[];
  onClose: () => void;
  onSuccess: (id: number) => void;
  onSetThumbnail: (dressId: number, photoId: number) => void;
  onDeletePhoto: (dressId: number, photoId: number) => void;
}) {
  const [form, setForm] = useState<DressForm>(() =>
    dress
      ? {
          name: dress.name,
          description: dress.description ?? "",
          pricePerDay: String(dress.pricePerDay),
          minRentalDays: String(dress.minRentalDays),
          status: dress.status,
          condition: dress.condition,
          color: dress.color ?? "",
          material: dress.material ?? "",
          isActive: dress.isActive,
          categoryId: String(dress.categoryId),
          sizes: dress.sizes?.length
            ? dress.sizes.map((s) => ({
                ...s,
                bust: String(s.bust ?? ""),
                waist: String(s.waist ?? ""),
                hip: String(s.hip ?? ""),
                length: String(s.length ?? ""),
                stock: String(s.stock ?? "1"),
              }))
            : [emptySize()],
          // ← TAMBAHKAN 2 BARIS INI
          isSpotlight:
            dress.spotlightOrder !== null && dress.spotlightOrder !== undefined,
          spotlightOrder: dress.spotlightOrder
            ? String(dress.spotlightOrder)
            : "1",
        }
      : emptyForm(),
  );
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "sizes" | "photos">(
    "info",
  );
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  useEffect(() => {
    const urls = newPhotos.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [newPhotos]);

  const setField = (k: keyof DressForm, v: unknown) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
  };
  const addSize = () =>
    setForm((p) => ({ ...p, sizes: [...p.sizes, emptySize()] }));
  const removeSize = (i: number) =>
    setForm((p) => ({ ...p, sizes: p.sizes.filter((_, idx) => idx !== i) }));
  const setSize = (i: number, k: keyof DressSize, v: string) =>
    setForm((p) => ({
      ...p,
      sizes: p.sizes.map((s, idx) => (idx === i ? { ...s, [k]: v } : s)),
    }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Nama wajib diisi";
    if (!form.pricePerDay || Number(form.pricePerDay) <= 0)
      e.pricePerDay = "Harga wajib diisi";
    if (!form.categoryId) e.categoryId = "Kategori wajib dipilih";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      setActiveTab("info");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("pricePerDay", form.pricePerDay);
      fd.append("minRentalDays", form.minRentalDays);
      fd.append("status", form.status);
      fd.append("condition", form.condition);
      fd.append("color", form.color);
      fd.append("material", form.material);
      fd.append("isActive", String(form.isActive));
      fd.append("spotlightOrder", form.isSpotlight ? form.spotlightOrder : "");
      fd.append("categoryId", form.categoryId);
      fd.append(
        "sizes",
        JSON.stringify(
          form.sizes.map((s) => ({
            // Kirim id kalau size ini sudah ada (mode edit) —
            // supaya backend tahu ini UPDATE, bukan bikin size baru
            id: s.id ?? undefined,
            label: s.label,
            bust: s.bust ? Number(s.bust) : null,
            waist: s.waist ? Number(s.waist) : null,
            hip: s.hip ? Number(s.hip) : null,
            length: s.length ? Number(s.length) : null,
            stock: Number(s.stock) || 1,
          })),
        ),
      );
      newPhotos.forEach((f) => fd.append("photos", f));
      const url =
        mode === "add" ? `${API}/dresses` : `${API}/dresses/${dress!.id}`;
      const res = await fetch(url, {
        method: mode === "add" ? "POST" : "PATCH",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = Array.isArray(data.message)
          ? data.message[0]
          : data.message;
        setErrors({ server: msg ?? "Terjadi kesalahan" });
        setSubmitting(false);
        return;
      }
      onSuccess(data.id);
      onClose();
    } catch {
      setErrors({ server: "Tidak dapat terhubung ke server" });
    } finally {
      setSubmitting(false);
    }
  };

  const inp: React.CSSProperties = {
    width: "100%",
    background: "rgba(0,0,0,0.03)",
    border: `1px solid var(--admin-border)`,
    borderRadius: 3,
    padding: "9px 12px",
    fontSize: 13,
    color: "var(--admin-text)",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
  };
  const lbl: React.CSSProperties = {
    display: "block",
    fontSize: 9,
    letterSpacing: "0.2em",
    textTransform: "uppercase" as const,
    color: "var(--admin-text-muted)",
    marginBottom: 6,
  };

  const tabs: { key: "info" | "sizes" | "photos"; label: string }[] = [
    { key: "info", label: "Info Dasar" },
    { key: "sizes", label: `Ukuran (${form.sizes.length})` },
    {
      key: "photos",
      label: `Foto (${(dress?.photos?.length ?? 0) + newPhotos.length})`,
    },
  ];

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
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 600,
          background: "var(--admin-bg)",
          border: `1px solid ${BORDER}`,
          borderRadius: 6,
          boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 24px",
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
                color: "var(--admin-text-muted)",
                marginBottom: 3,
              }}
            >
              {mode === "add" ? "Tambah" : "Edit"} Dress
            </p>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: 20,
                fontWeight: 300,
                color: "var(--admin-text)",
              }}
            >
              {mode === "add" ? "Dress Baru" : dress?.name}
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

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            borderBottom: `1px solid ${BORDER}`,
            flexShrink: 0,
          }}
        >
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                flex: 1,
                padding: "10px 16px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 10,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: activeTab === t.key ? GOLD : "var(--admin-text-muted)",
                borderBottom: `2px solid ${activeTab === t.key ? GOLD : "transparent"}`,
                transition: "all 0.2s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", flex: 1, padding: "20px 24px" }}>
          {errors.server && (
            <div
              style={{
                background: "rgba(248,113,113,0.08)",
                border: "1px solid rgba(248,113,113,0.2)",
                borderRadius: 3,
                padding: "10px 14px",
                marginBottom: 16,
              }}
            >
              <p style={{ fontSize: 12, color: "#f87171" }}>{errors.server}</p>
            </div>
          )}

          {/* Tab Info */}
          {activeTab === "info" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={lbl}>Nama Dress *</label>
                <input
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="Aurelia Evening Gown"
                  style={{
                    ...inp,
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
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label style={lbl}>Kategori *</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setField("categoryId", e.target.value)}
                    style={{
                      ...inp,
                      appearance: "none",
                      cursor: "pointer",
                      borderColor: errors.categoryId
                        ? "rgba(248,113,113,0.5)"
                        : "var(--admin-border)",
                    }}
                  >
                    <option value="">Pilih kategori...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p style={{ fontSize: 10, color: "#f87171", marginTop: 4 }}>
                      {errors.categoryId}
                    </p>
                  )}
                </div>
                <div>
                  <label style={lbl}>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setField("status", e.target.value as DressForm["status"])
                    }
                    style={{ ...inp, appearance: "none", cursor: "pointer" }}
                  >
                    <option value="available">Tersedia</option>
                    <option value="unavailable">Tidak Tersedia</option>
                    <option value="archived">Diarsipkan</option>
                  </select>
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label style={lbl}>Harga Sewa / Hari *</label>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: 11,
                        color: "var(--admin-text-muted)",
                      }}
                    >
                      Rp
                    </span>
                    <input
                      type="number"
                      value={form.pricePerDay}
                      onChange={(e) => setField("pricePerDay", e.target.value)}
                      placeholder="350000"
                      style={{
                        ...inp,
                        paddingLeft: 34,
                        borderColor: errors.pricePerDay
                          ? "rgba(248,113,113,0.5)"
                          : "var(--admin-border)",
                      }}
                    />
                  </div>
                  {errors.pricePerDay && (
                    <p style={{ fontSize: 10, color: "#f87171", marginTop: 4 }}>
                      {errors.pricePerDay}
                    </p>
                  )}
                </div>
                <div>
                  <label style={lbl}>Min. Hari Sewa</label>
                  <input
                    type="number"
                    min="1"
                    value={form.minRentalDays}
                    onChange={(e) => setField("minRentalDays", e.target.value)}
                    style={inp}
                  />
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label style={lbl}>Kondisi</label>
                  <select
                    value={form.condition}
                    onChange={(e) =>
                      setField(
                        "condition",
                        e.target.value as DressForm["condition"],
                      )
                    }
                    style={{ ...inp, appearance: "none", cursor: "pointer" }}
                  >
                    <option value="new">Baru</option>
                    <option value="good">Baik</option>
                    <option value="fair">Cukup</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Warna</label>
                  <input
                    value={form.color}
                    onChange={(e) => setField("color", e.target.value)}
                    placeholder="Dusty Rose"
                    style={inp}
                  />
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label style={lbl}>Material / Bahan</label>
                  <input
                    value={form.material}
                    onChange={(e) => setField("material", e.target.value)}
                    placeholder="Chiffon, Silk..."
                    style={inp}
                  />
                </div>
                <div>
                  <label style={lbl}>Tampilkan di Website</label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "9px 12px",
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
                      checked={form.isActive}
                      onChange={(e) => setField("isActive", e.target.checked)}
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
                          : "var(--admin-text-muted)",
                      }}
                    >
                      {form.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </label>
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label style={lbl}>Tampilkan di Spotlight</label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "9px 12px",
                      borderRadius: 3,
                      cursor: "pointer",
                      border: `1px solid ${form.isSpotlight ? "rgba(212,180,120,0.4)" : BORDER}`,
                      background: form.isSpotlight
                        ? "var(--admin-accent-bg)"
                        : "rgba(0,0,0,0.02)",
                      transition: "all 0.2s",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={form.isSpotlight}
                      onChange={(e) =>
                        setField("isSpotlight", e.target.checked)
                      }
                      style={{ display: "none" }}
                    />
                    <div
                      style={{
                        width: 32,
                        height: 18,
                        borderRadius: 9,
                        position: "relative",
                        background: form.isSpotlight
                          ? "var(--admin-accent-bg)"
                          : "var(--admin-border)",
                        border: `1px solid ${form.isSpotlight ? "rgba(212,180,120,0.5)" : BORDER}`,
                        transition: "all 0.2s",
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 2,
                          left: form.isSpotlight ? 14 : 2,
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: form.isSpotlight
                            ? GOLD
                            : "var(--admin-text-faint)",
                          transition: "all 0.2s",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        color: form.isSpotlight
                          ? GOLD
                          : "var(--admin-text-muted)",
                      }}
                    >
                      {form.isSpotlight ? "Aktif" : "Nonaktif"}
                    </span>
                  </label>
                </div>

                {form.isSpotlight && (
                  <div>
                    <label style={lbl}>Urutan Tampil</label>
                    <input
                      type="number"
                      min="1"
                      value={form.spotlightOrder}
                      onChange={(e) =>
                        setField("spotlightOrder", e.target.value)
                      }
                      placeholder="1"
                      style={inp}
                    />
                    <p
                      style={{
                        fontSize: 9,
                        color: "var(--admin-text-faint)",
                        marginTop: 4,
                      }}
                    >
                      Angka kecil tampil lebih dulu
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label style={lbl}>Deskripsi</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  rows={3}
                  placeholder="Deskripsi dress..."
                  style={{ ...inp, resize: "none" }}
                />
              </div>
            </div>
          )}

          {/* Tab Ukuran */}
          {activeTab === "sizes" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <p style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>
                  Semua ukuran dalam{" "}
                  <span style={{ color: GOLD }}>sentimeter (cm)</span>
                </p>
                <button
                  onClick={addSize}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "var(--admin-accent-bg)",
                    border: "1px solid var(--admin-accent-border)",
                    color: GOLD,
                    fontSize: 10,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    padding: "6px 12px",
                    borderRadius: 3,
                    cursor: "pointer",
                  }}
                >
                  <svg
                    width="10"
                    height="10"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                  Tambah Ukuran
                </button>
              </div>
              {form.sizes.map((size, i) => (
                <div
                  key={i}
                  style={{
                    background: "rgba(0,0,0,0.02)",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 4,
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 11,
                        color: GOLD,
                        letterSpacing: "0.1em",
                      }}
                    >
                      Ukuran #{i + 1}
                    </p>
                    {form.sizes.length > 1 && (
                      <button
                        onClick={() => removeSize(i)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 10,
                          color: "var(--admin-danger)",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                        }}
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={lbl}>Label Ukuran</label>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {SIZE_LABELS.map((l) => (
                        <button
                          key={l}
                          onClick={() => setSize(i, "label", l)}
                          style={{
                            padding: "5px 12px",
                            borderRadius: 3,
                            fontSize: 11,
                            cursor: "pointer",
                            border: `1px solid ${size.label === l ? "var(--admin-accent-border)" : BORDER}`,
                            background:
                              size.label === l
                                ? "var(--admin-accent-bg)"
                                : "transparent",
                            color:
                              size.label === l
                                ? GOLD
                                : "var(--admin-text-muted)",
                            transition: "all 0.15s",
                          }}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit,minmax(100px,1fr))",
                      gap: 10,
                    }}
                  >
                    {[
                      { key: "bust", label: "Bust (cm)" },
                      { key: "waist", label: "Waist (cm)" },
                      { key: "hip", label: "Hip (cm)" },
                      { key: "length", label: "Length (cm)" },
                      { key: "stock", label: "Stok" },
                    ].map((f) => (
                      <div key={f.key}>
                        <label style={{ ...lbl, fontSize: 8 }}>{f.label}</label>
                        <div style={{ position: "relative" }}>
                          <input
                            type="number"
                            min="0"
                            value={size[f.key as keyof DressSize]}
                            onChange={(e) =>
                              setSize(
                                i,
                                f.key as keyof DressSize,
                                e.target.value,
                              )
                            }
                            placeholder={f.key === "stock" ? "1" : "0"}
                            style={{
                              ...inp,
                              paddingRight: f.key !== "stock" ? 28 : 12,
                              fontSize: 12,
                            }}
                          />
                          {f.key !== "stock" && (
                            <span
                              style={{
                                position: "absolute",
                                right: 8,
                                top: "50%",
                                transform: "translateY(-50%)",
                                fontSize: 9,
                                color: "var(--admin-text-faint)",
                              }}
                            >
                              cm
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab Foto */}
          {activeTab === "photos" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {mode === "edit" && dress && dress.photos?.length > 0 && (
                <div>
                  <p style={{ ...lbl, marginBottom: 10 }}>Foto Tersimpan</p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill,minmax(100px,1fr))",
                      gap: 10,
                    }}
                  >
                    {[...dress.photos]
                      .sort((a, b) => a.order - b.order)
                      .map((photo) => (
                        <div key={photo.id} style={{ position: "relative" }}>
                          <div
                            style={{
                              aspectRatio: "3/4",
                              background: "rgba(0,0,0,0.04)",
                              borderRadius: 3,
                              overflow: "hidden",
                              position: "relative",
                              border: `2px solid ${photo.isThumbnail ? GOLD : BORDER}`,
                            }}
                          >
                            <Image
                              src={`${IMG_BASE}${photo.url}`}
                              alt=""
                              fill
                              style={{
                                objectFit: "cover",
                                objectPosition: "top",
                              }}
                            />
                            {photo.isThumbnail && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: 4,
                                  left: 4,
                                  background: "var(--admin-accent-bg)",
                                  border:
                                    "1px solid var(--admin-accent-border)",
                                  padding: "2px 6px",
                                  borderRadius: 2,
                                }}
                              >
                                <p
                                  style={{
                                    fontSize: 8,
                                    color: GOLD,
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase",
                                  }}
                                >
                                  Cover
                                </p>
                              </div>
                            )}
                          </div>
                          <div
                            style={{ display: "flex", gap: 4, marginTop: 6 }}
                          >
                            {!photo.isThumbnail && (
                              <button
                                onClick={() =>
                                  onSetThumbnail(dress.id, photo.id)
                                }
                                style={{
                                  flex: 1,
                                  background: "var(--admin-accent-bg)",
                                  border:
                                    "1px solid var(--admin-accent-border)",
                                  color: GOLD,
                                  fontSize: 8,
                                  padding: "4px 0",
                                  borderRadius: 2,
                                  cursor: "pointer",
                                }}
                              >
                                Set Cover
                              </button>
                            )}
                            <button
                              onClick={() => onDeletePhoto(dress.id, photo.id)}
                              style={{
                                flex: 1,
                                background: "rgba(248,113,113,0.06)",
                                border: "1px solid rgba(248,113,113,0.2)",
                                color: "#f87171",
                                fontSize: 8,
                                padding: "4px 0",
                                borderRadius: 2,
                                cursor: "pointer",
                              }}
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              <div>
                <p style={{ ...lbl, marginBottom: 10 }}>
                  {mode === "edit" ? "Tambah Foto Baru" : "Upload Foto"}
                </p>
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{
                    border: `2px dashed var(--admin-border)`,
                    borderRadius: 4,
                    padding: "24px 16px",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "border-color 0.2s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.borderColor =
                      "var(--admin-accent-border)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.borderColor = "var(--admin-border)")
                  }
                >
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="var(--admin-text-faint)"
                    strokeWidth={1}
                    style={{ margin: "0 auto 8px" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                  </svg>
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--admin-text-muted)",
                      marginBottom: 4,
                    }}
                  >
                    Klik untuk pilih foto
                  </p>
                  <p style={{ fontSize: 10, color: "var(--admin-text-faint)" }}>
                    JPG, PNG, WEBP, AVIF · Maks 5MB · Maks 10 foto
                  </p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) =>
                      setNewPhotos((p) => [
                        ...p,
                        ...Array.from(e.target.files ?? []),
                      ])
                    }
                    style={{ display: "none" }}
                  />
                </div>
                {previewUrls.length > 0 && (
                  <div
                    style={{
                      marginTop: 12,
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill,minmax(80px,1fr))",
                      gap: 8,
                    }}
                  >
                    {previewUrls.map((url, i) => (
                      <div key={i} style={{ position: "relative" }}>
                        <div
                          style={{
                            aspectRatio: "3/4",
                            background: "rgba(0,0,0,0.04)",
                            borderRadius: 3,
                            overflow: "hidden",
                            position: "relative",
                          }}
                        >
                          <img
                            src={url}
                            alt=""
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              objectPosition: "top",
                            }}
                          />
                          {i === 0 && mode === "add" && (
                            <div
                              style={{
                                position: "absolute",
                                top: 3,
                                left: 3,
                                background: "var(--admin-accent-bg)",
                                padding: "2px 5px",
                                borderRadius: 2,
                              }}
                            >
                              <p style={{ fontSize: 7, color: GOLD }}>COVER</p>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() =>
                            setNewPhotos((p) => p.filter((_, idx) => idx !== i))
                          }
                          style={{
                            position: "absolute",
                            top: 3,
                            right: 3,
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            background: "rgba(0,0,0,0.5)",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#f87171",
                            fontSize: 10,
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {mode === "add" && newPhotos.length > 0 && (
                  <p
                    style={{
                      fontSize: 10,
                      color: "var(--admin-text-muted)",
                      marginTop: 8,
                    }}
                  >
                    Foto pertama akan otomatis dijadikan cover thumbnail.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 24px",
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
              color: "var(--admin-text-muted)",
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
              minWidth: 110,
            }}
          >
            {submitting
              ? "Menyimpan..."
              : mode === "add"
                ? "Tambah Dress"
                : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
