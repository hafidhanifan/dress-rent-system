"use client";

import { useState, useEffect, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────────
type Category = {
  id: number;
  name: string;
  slug: string;
  description: string;
  order: number;
  isActive: boolean;
  dressCount?: number;
  createdAt: string;
};

type FormData = {
  name: string;
  description: string;
  order: string;
  isActive: boolean;
};

type ModalMode = "add" | "edit";
type ModalState =
  | { open: false }
  | { open: true; mode: "add" }
  | { open: true; mode: "edit"; category: Category };
type DelState = { open: false } | { open: true; category: Category };

// ── Konstanta warna (konsisten dengan halaman lain) ────────────
const GOLD = "#d4b478";
const BORDER = "rgba(255,255,255,0.07)";
const CARD = "rgba(255,255,255,0.03)";
const API = process.env.NEXT_PUBLIC_API_URL;

// ── Data dummy — akan diganti fetch dari backend ───────────────
const DUMMY: Category[] = [
  {
    id: 1,
    name: "Evening Gown",
    slug: "evening-gown",
    description: "Gaun malam formal untuk acara spesial",
    order: 1,
    isActive: true,
    dressCount: 12,
    createdAt: "2025-01-10",
  },
  {
    id: 2,
    name: "Cocktail",
    slug: "cocktail",
    description: "Dress semi-formal untuk pesta dan gathering",
    order: 2,
    isActive: true,
    dressCount: 8,
    createdAt: "2025-01-10",
  },
  {
    id: 3,
    name: "Midi Dress",
    slug: "midi-dress",
    description: "Dress panjang lutut yang serbaguna",
    order: 3,
    isActive: true,
    dressCount: 15,
    createdAt: "2025-01-10",
  },
  {
    id: 4,
    name: "Wrap Dress",
    slug: "wrap-dress",
    description: "Siluet flattering untuk semua bentuk tubuh",
    order: 4,
    isActive: true,
    dressCount: 7,
    createdAt: "2025-01-11",
  },
  {
    id: 5,
    name: "Maxi Dress",
    slug: "maxi-dress",
    description: "Dress panjang anggun untuk berbagai acara",
    order: 5,
    isActive: false,
    dressCount: 4,
    createdAt: "2025-01-12",
  },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(DUMMY);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<ModalState>({ open: false });
  const [del, setDel] = useState<DelState>({ open: false });

  // ── Fetch dari backend ─────────────────────────────────────
  /**
   * Uncomment bagian ini setelah backend siap:
   *
   * const fetchCategories = useCallback(async () => {
   *   setLoading(true);
   *   try {
   *     const res = await fetch(`${API}/categories`);
   *     const data = await res.json();
   *     setCategories(data);
   *   } catch (e) {
   *     console.error(e);
   *   } finally {
   *     setLoading(false);
   *   }
   * }, []);
   *
   * useEffect(() => { fetchCategories(); }, [fetchCategories]);
   */

  // ── Handler submit (add / edit) ────────────────────────────
  const handleSubmit = async (form: FormData, category?: Category) => {
    const payload = {
      name: form.name,
      description: form.description,
      order: parseInt(form.order) || 0,
      isActive: form.isActive,
    };

    /**
     * Untuk sekarang pakai state lokal (dummy mode).
     * Uncomment bagian fetch saat backend sudah siap.
     */

    if (category) {
      // ── EDIT ──
      /**
       * const res = await fetch(`${API}/categories/${category.id}`, {
       *   method: 'PATCH',
       *   headers: { 'Content-Type': 'application/json' },
       *   body: JSON.stringify(payload),
       * });
       * const updated = await res.json();
       */
      const updated = { ...category, ...payload };
      setCategories((prev) =>
        prev.map((c) => (c.id === category.id ? updated : c)),
      );
    } else {
      // ── ADD ──
      /**
       * const res = await fetch(`${API}/categories`, {
       *   method: 'POST',
       *   headers: { 'Content-Type': 'application/json' },
       *   body: JSON.stringify(payload),
       * });
       * const created = await res.json();
       * setCategories(prev => [...prev, created]);
       */
      const created: Category = {
        id: Date.now(),
        slug: payload.name.toLowerCase().replace(/\s+/g, "-"),
        dressCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
        ...payload,
      };
      setCategories((prev) => [...prev, created]);
    }
    setModal({ open: false });
  };

  // ── Handler delete ─────────────────────────────────────────
  const handleDelete = async (category: Category) => {
    /**
     * const res = await fetch(`${API}/categories/${category.id}`, {
     *   method: 'DELETE',
     * });
     */
    setCategories((prev) => prev.filter((c) => c.id !== category.id));
    setDel({ open: false });
  };

  // ── Handler toggle active ──────────────────────────────────
  const handleToggle = async (category: Category) => {
    /**
     * const res = await fetch(`${API}/categories/${category.id}/toggle-active`, {
     *   method: 'PATCH',
     * });
     * const updated = await res.json();
     */
    setCategories((prev) =>
      prev.map((c) =>
        c.id === category.id ? { ...c, isActive: !c.isActive } : c,
      ),
    );
  };

  const sorted = [...categories].sort((a, b) => a.order - b.order);
  const activeCount = categories.filter((c) => c.isActive).length;
  const totalDresses = categories.reduce(
    (sum, c) => sum + (c.dressCount ?? 0),
    0,
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ── Header ── */}
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
              color: "#4a4440",
            }}
          >
            Kelola
          </p>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.6rem, 3vw, 2rem)",
              fontWeight: 300,
              color: "#e8ddc8",
            }}
          >
            Categories
          </h1>
        </div>
        <button
          onClick={() => setModal({ open: true, mode: "add" })}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(212,180,120,0.1)",
            border: "1px solid rgba(212,180,120,0.3)",
            color: GOLD,
            fontSize: 11,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            padding: "10px 20px",
            borderRadius: 3,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.background = "rgba(212,180,120,0.18)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background = "rgba(212,180,120,0.1)")
          }
        >
          <svg
            width="12"
            height="12"
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
          Tambah Kategori
        </button>
      </div>

      {/* ── Summary cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
        }}
      >
        {[
          { label: "Total Kategori", value: categories.length, icon: "◈" },
          { label: "Aktif", value: activeCount, icon: "◉" },
          {
            label: "Nonaktif",
            value: categories.length - activeCount,
            icon: "◎",
          },
          { label: "Total Dress", value: totalDresses, icon: "◇" },
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <p
                style={{
                  fontSize: 9,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#4a4440",
                }}
              >
                {s.label}
              </p>
              <span style={{ color: "#3a3430", fontSize: 14 }}>{s.icon}</span>
            </div>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.8rem",
                fontWeight: 300,
                color: "#e8ddc8",
                lineHeight: 1,
              }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Tabel kategori ── */}
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
            alignItems: "center",
          }}
        >
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 16,
              fontWeight: 300,
              color: "#c8baa0",
            }}
          >
            Semua Kategori
          </p>
          <p style={{ fontSize: 10, color: "#3a3430" }}>
            {sorted.length} kategori
          </p>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", minWidth: 580, borderCollapse: "collapse" }}
          >
            <thead>
              <tr style={{ background: "rgba(0,0,0,0.2)" }}>
                {[
                  "Order",
                  "Nama",
                  "Slug",
                  "Deskripsi",
                  "Dress",
                  "Status",
                  "Aksi",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "11px 18px",
                      textAlign: "left",
                      fontSize: 9,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "#3a3430",
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
              {sorted.map((cat) => (
                <tr
                  key={cat.id}
                  style={{
                    borderBottom: `1px solid rgba(255,255,255,0.03)`,
                    transition: "background 0.15s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.015)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {/* Order */}
                  <td style={{ padding: "14px 18px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 24,
                        height: 24,
                        borderRadius: 3,
                        background: "rgba(255,255,255,0.04)",
                        border: `1px solid ${BORDER}`,
                        fontSize: 11,
                        color: "#5a5450",
                      }}
                    >
                      {cat.order}
                    </span>
                  </td>

                  {/* Nama */}
                  <td style={{ padding: "14px 18px" }}>
                    <p
                      style={{
                        fontSize: 13,
                        color: "#c8baa0",
                        marginBottom: 2,
                      }}
                    >
                      {cat.name}
                    </p>
                    <p style={{ fontSize: 9, color: "#3a3430" }}>
                      {cat.createdAt}
                    </p>
                  </td>

                  {/* Slug */}
                  <td style={{ padding: "14px 18px" }}>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: 11,
                        color: "#5a5450",
                        background: "rgba(255,255,255,0.03)",
                        padding: "2px 8px",
                        borderRadius: 3,
                        border: `1px solid rgba(255,255,255,0.05)`,
                      }}
                    >
                      {cat.slug}
                    </span>
                  </td>

                  {/* Deskripsi */}
                  <td style={{ padding: "14px 18px", maxWidth: 200 }}>
                    <p
                      style={{
                        fontSize: 12,
                        color: "#4a4440",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {cat.description || "—"}
                    </p>
                  </td>

                  {/* Jumlah dress */}
                  <td style={{ padding: "14px 18px" }}>
                    <span
                      style={{
                        fontSize: 12,
                        color: GOLD,
                        background: "rgba(212,180,120,0.08)",
                        padding: "3px 10px",
                        borderRadius: 20,
                        border: "1px solid rgba(212,180,120,0.2)",
                      }}
                    >
                      {cat.dressCount ?? 0} dress
                    </span>
                  </td>

                  {/* Status toggle */}
                  <td style={{ padding: "14px 18px" }}>
                    <button
                      onClick={() => handleToggle(cat)}
                      title={
                        cat.isActive
                          ? "Klik untuk nonaktifkan"
                          : "Klik untuk aktifkan"
                      }
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 9,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        padding: "4px 10px",
                        borderRadius: 20,
                        cursor: "pointer",
                        border: "none",
                        transition: "all 0.2s",
                        background: cat.isActive
                          ? "rgba(52,211,153,0.07)"
                          : "rgba(255,255,255,0.03)",
                        color: cat.isActive ? "#34d399" : "#4a4440",
                        outline: `1px solid ${cat.isActive ? "rgba(52,211,153,0.2)" : BORDER}`,
                      }}
                    >
                      <span
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          flexShrink: 0,
                          background: cat.isActive ? "#34d399" : "#3a3430",
                        }}
                      />
                      {cat.isActive ? "Aktif" : "Nonaktif"}
                    </button>
                  </td>

                  {/* Aksi */}
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ display: "flex", gap: 14 }}>
                      <button
                        onClick={() =>
                          setModal({ open: true, mode: "edit", category: cat })
                        }
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 11,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: "#5a5450",
                          padding: 0,
                          transition: "color 0.15s",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.color = GOLD)
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.color = "#5a5450")
                        }
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDel({ open: true, category: cat })}
                        disabled={(cat.dressCount ?? 0) > 0}
                        title={
                          (cat.dressCount ?? 0) > 0
                            ? "Kategori masih memiliki dress"
                            : "Hapus kategori"
                        }
                        style={{
                          background: "none",
                          border: "none",
                          cursor:
                            (cat.dressCount ?? 0) > 0
                              ? "not-allowed"
                              : "pointer",
                          fontSize: 11,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color:
                            (cat.dressCount ?? 0) > 0 ? "#2a2420" : "#4a3030",
                          padding: 0,
                          transition: "color 0.15s",
                        }}
                        onMouseOver={(e) => {
                          if ((cat.dressCount ?? 0) === 0)
                            e.currentTarget.style.color = "#f87171";
                        }}
                        onMouseOut={(e) => {
                          if ((cat.dressCount ?? 0) === 0)
                            e.currentTarget.style.color = "#4a3030";
                        }}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal Add / Edit ── */}
      {modal.open && (
        <CategoryModal
          mode={modal.mode}
          category={modal.mode === "edit" ? modal.category : undefined}
          onClose={() => setModal({ open: false })}
          onSubmit={handleSubmit}
        />
      )}

      {/* ── Modal Hapus ── */}
      {del.open && (
        <DeleteModal
          category={del.category}
          onClose={() => setDel({ open: false })}
          onConfirm={() => handleDelete(del.category)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Modal Add / Edit Kategori
// ═══════════════════════════════════════════════════════
function CategoryModal({
  mode,
  category,
  onClose,
  onSubmit,
}: {
  mode: ModalMode;
  category?: Category;
  onClose: () => void;
  onSubmit: (form: FormData, category?: Category) => void;
}) {
  const [form, setForm] = useState<FormData>({
    name: category?.name ?? "",
    description: category?.description ?? "",
    order: String(category?.order ?? 0),
    isActive: category?.isActive ?? true,
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

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
    if (errors[name as keyof FormData])
      setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const errs: Partial<FormData> = {};
    if (!form.name.trim()) errs.name = "Nama kategori wajib diisi";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 3,
    padding: "10px 14px",
    fontSize: 13,
    color: "#c8baa0",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
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
          background: "#141310",
          border: `1px solid ${BORDER}`,
          borderRadius: 6,
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
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
                color: "#4a4440",
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
                color: "#e8ddc8",
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
              color: "#3a3430",
              padding: 4,
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = "#7a7060")}
            onMouseOut={(e) => (e.currentTarget.style.color = "#3a3430")}
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
          {/* Nama */}
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
              Nama Kategori *
            </label>
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
                  : "rgba(255,255,255,0.08)",
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
              Deskripsi
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={set}
              rows={2}
              placeholder="Deskripsi singkat kategori ini..."
              style={{ ...inputStyle, resize: "none", fontFamily: "inherit" }}
            />
          </div>

          {/* Order + Status */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
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
                Urutan Tampil
              </label>
              <input
                name="order"
                type="number"
                min="0"
                value={form.order}
                onChange={set}
                placeholder="0"
                style={inputStyle}
              />
              <p style={{ fontSize: 9, color: "#3a3430", marginTop: 4 }}>
                Angka kecil = tampil lebih dulu
              </p>
            </div>

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
                Status
              </label>
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
                    : "rgba(255,255,255,0.02)",
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
                      : "rgba(255,255,255,0.08)",
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
                      background: form.isActive ? "#34d399" : "#3a3430",
                      transition: "all 0.2s",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 12,
                    color: form.isActive ? "#34d399" : "#4a4440",
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
              color: "#4a4440",
              padding: "10px 16px",
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = "#7a7060")}
            onMouseOut={(e) => (e.currentTarget.style.color = "#4a4440")}
          >
            Batal
          </button>
          <button
            onClick={() => {
              if (validate()) onSubmit(form, category);
            }}
            style={{
              background: "rgba(212,180,120,0.12)",
              border: "1px solid rgba(212,180,120,0.3)",
              color: GOLD,
              fontSize: 11,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              padding: "10px 24px",
              borderRadius: 3,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = "rgba(212,180,120,0.2)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = "rgba(212,180,120,0.12)")
            }
          >
            {mode === "add" ? "Tambah" : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Modal Konfirmasi Hapus
// ═══════════════════════════════════════════════════════
function DeleteModal({
  category,
  onClose,
  onConfirm,
}: {
  category: Category;
  onClose: () => void;
  onConfirm: () => void;
}) {
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
          background: "#141310",
          border: `1px solid ${BORDER}`,
          borderRadius: 6,
          padding: 28,
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
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
            color: "#e8ddc8",
            marginBottom: 8,
          }}
        >
          Hapus Kategori?
        </h3>
        <p
          style={{
            fontSize: 13,
            color: "#5a5450",
            lineHeight: 1.6,
            marginBottom: 24,
          }}
        >
          <span style={{ color: "#c8baa0" }}>{category.name}</span> akan dihapus
          permanen. Pastikan kategori ini tidak memiliki dress aktif.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: `1px solid ${BORDER}`,
              color: "#4a4440",
              fontSize: 11,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              padding: "9px 16px",
              borderRadius: 3,
              cursor: "pointer",
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = "#7a7060")}
            onMouseOut={(e) => (e.currentTarget.style.color = "#4a4440")}
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            style={{
              background: "rgba(248,113,113,0.1)",
              border: "1px solid rgba(248,113,113,0.3)",
              color: "#f87171",
              fontSize: 11,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              padding: "9px 20px",
              borderRadius: 3,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = "rgba(248,113,113,0.18)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = "rgba(248,113,113,0.1)")
            }
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
