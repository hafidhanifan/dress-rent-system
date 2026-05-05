"use client";

import { useState, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────────────────────
// Types — sesuai persis dengan response dari NestJS backend
// ─────────────────────────────────────────────────────────────
type Category = {
  id: number;
  name: string;
  slug: string;
  description: string;
  order: number;
  isActive: boolean;
  dressCount?: number;
  createdAt: string;
  updatedAt: string;
};

type CategoryFormData = {
  name: string;
  description: string;
  order: string;
  isActive: boolean;
};

type ApiError = {
  message: string | string[];
  statusCode: number;
};

type ModalState =
  | { open: false }
  | { open: true; mode: "add" }
  | { open: true; mode: "edit"; category: Category };

type DelState = { open: false } | { open: true; category: Category };

// ─────────────────────────────────────────────────────────────
// Konstanta
// ─────────────────────────────────────────────────────────────
const GOLD = "#d4b478";
const BORDER = "rgba(255,255,255,0.07)";
const CARD = "rgba(255,255,255,0.03)";
const API = process.env.NEXT_PUBLIC_API_URL;

// Helper: ambil pesan error dari response NestJS
// NestJS kadang kirim message sebagai string, kadang array of strings
function getErrorMessage(err: ApiError): string {
  if (Array.isArray(err.message)) return err.message[0];
  return err.message;
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<ModalState>({ open: false });
  const [del, setDel] = useState<DelState>({ open: false });

  // ── Fetch semua kategori dari backend ──────────────────────
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/categories`);
      if (!res.ok) throw new Error("Gagal mengambil data kategori");
      const data: Category[] = await res.json();
      setCategories(data);
    } catch (e) {
      setError(
        "Tidak dapat terhubung ke server. Pastikan backend sudah berjalan.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ── CREATE ─────────────────────────────────────────────────
  const handleCreate = async (
    form: CategoryFormData,
  ): Promise<string | null> => {
    const res = await fetch(`${API}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        description: form.description || undefined,
        order: parseInt(form.order) || 0,
        isActive: form.isActive,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      // Kembalikan pesan error ke modal supaya ditampilkan di sana
      return getErrorMessage(data as ApiError);
    }

    // Tambahkan ke state lokal — tidak perlu refetch seluruh list
    setCategories((prev) => [...prev, data]);
    return null; // null = sukses
  };

  // ── UPDATE ─────────────────────────────────────────────────
  const handleUpdate = async (
    id: number,
    form: CategoryFormData,
  ): Promise<string | null> => {
    const res = await fetch(`${API}/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        description: form.description || undefined,
        order: parseInt(form.order) || 0,
        isActive: form.isActive,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return getErrorMessage(data as ApiError);
    }

    setCategories((prev) => prev.map((c) => (c.id === id ? data : c)));
    return null;
  };

  // ── TOGGLE ACTIVE ──────────────────────────────────────────
  const handleToggle = async (category: Category) => {
    // Optimistic update — update UI dulu, baru kirim ke server
    // Kalau gagal, kembalikan ke state semula
    setCategories((prev) =>
      prev.map((c) =>
        c.id === category.id ? { ...c, isActive: !c.isActive } : c,
      ),
    );

    const res = await fetch(`${API}/categories/${category.id}/toggle-active`, {
      method: "PATCH",
    });

    if (!res.ok) {
      // Rollback jika gagal
      setCategories((prev) =>
        prev.map((c) =>
          c.id === category.id ? { ...c, isActive: category.isActive } : c,
        ),
      );
    }
  };

  // ── DELETE ─────────────────────────────────────────────────
  const handleDelete = async (category: Category): Promise<string | null> => {
    const res = await fetch(`${API}/categories/${category.id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      return getErrorMessage(data as ApiError);
    }

    setCategories((prev) => prev.filter((c) => c.id !== category.id));
    setDel({ open: false });
    return null;
  };

  // ── Statistik ──────────────────────────────────────────────
  const activeCount = categories.filter((c) => c.isActive).length;
  const totalDresses = categories.reduce(
    (sum, c) => sum + (c.dressCount ?? 0),
    0,
  );
  const sorted = [...categories].sort((a, b) => a.order - b.order);

  // ── Format tanggal ─────────────────────────────────────────
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

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
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* Tombol refresh */}
          <button
            onClick={fetchCategories}
            disabled={loading}
            title="Refresh data"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${BORDER}`,
              color: "#4a4440",
              padding: "9px 12px",
              borderRadius: 3,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) =>
              !loading && (e.currentTarget.style.color = "#9a8a70")
            }
            onMouseOut={(e) => (e.currentTarget.style.color = "#4a4440")}
          >
            <svg
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              style={{
                animation: loading ? "spin 1s linear infinite" : "none",
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </button>

          {/* Tombol tambah */}
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
      </div>

      {/* ── Error global ── */}
      {error && (
        <div
          style={{
            background: "rgba(248,113,113,0.08)",
            border: "1px solid rgba(248,113,113,0.2)",
            borderRadius: 4,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg
              width="16"
              height="16"
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
            <p style={{ fontSize: 13, color: "#f87171" }}>{error}</p>
          </div>
          <button
            onClick={fetchCategories}
            style={{
              fontSize: 11,
              color: "#f87171",
              background: "rgba(248,113,113,0.15)",
              border: "1px solid rgba(248,113,113,0.3)",
              padding: "4px 12px",
              borderRadius: 3,
              cursor: "pointer",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 12,
        }}
      >
        {[
          { label: "Total Kategori", value: loading ? "—" : categories.length },
          { label: "Aktif", value: loading ? "—" : activeCount },
          {
            label: "Nonaktif",
            value: loading ? "—" : categories.length - activeCount,
          },
          { label: "Total Dress", value: loading ? "—" : totalDresses },
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
                color: "#4a4440",
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
                color: "#e8ddc8",
                lineHeight: 1,
              }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Tabel ── */}
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

        {/* Loading state */}
        {loading ? (
          <div style={{ padding: "48px", textAlign: "center" }}>
            <div
              style={{
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
              }}
            >
              <svg
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#4a4440"
                strokeWidth={1.5}
                style={{ animation: "spin 1s linear infinite" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
              <p
                style={{
                  fontSize: 12,
                  color: "#4a4440",
                  letterSpacing: "0.1em",
                }}
              >
                Memuat data...
              </p>
            </div>
          </div>
        ) : sorted.length === 0 && !error ? (
          /* Empty state */
          <div style={{ padding: "48px", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "#3a3430", marginBottom: 12 }}>
              Belum ada kategori
            </p>
            <button
              onClick={() => setModal({ open: true, mode: "add" })}
              style={{
                fontSize: 11,
                color: GOLD,
                background: "rgba(212,180,120,0.08)",
                border: "1px solid rgba(212,180,120,0.2)",
                padding: "8px 16px",
                borderRadius: 3,
                cursor: "pointer",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Tambah kategori pertama
            </button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                minWidth: 620,
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.2)" }}>
                  {[
                    "Order",
                    "Nama",
                    "Slug",
                    "Deskripsi",
                    "Status",
                    "Dibuat",
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
                          width: 26,
                          height: 26,
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
                      <p style={{ fontSize: 13, color: "#c8baa0" }}>
                        {cat.name}
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
                          padding: "3px 8px",
                          borderRadius: 3,
                          border: `1px solid rgba(255,255,255,0.05)`,
                          whiteSpace: "nowrap",
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
                        {cat.description || (
                          <span
                            style={{ color: "#2a2420", fontStyle: "italic" }}
                          >
                            —
                          </span>
                        )}
                      </p>
                    </td>

                    {/* Status — klik untuk toggle */}
                    <td style={{ padding: "14px 18px" }}>
                      <button
                        onClick={() => handleToggle(cat)}
                        title="Klik untuk toggle status"
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

                    {/* Tanggal dibuat */}
                    <td
                      style={{
                        padding: "14px 18px",
                        fontSize: 11,
                        color: "#3a3430",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDate(cat.createdAt)}
                    </td>

                    {/* Aksi */}
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", gap: 14 }}>
                        <button
                          onClick={() =>
                            setModal({
                              open: true,
                              mode: "edit",
                              category: cat,
                            })
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
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 11,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: "#4a3030",
                            padding: 0,
                            transition: "color 0.15s",
                          }}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.color = "#f87171")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.color = "#4a3030")
                          }
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
        )}
      </div>

      {/* Animasi spin */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* ── Modal Add / Edit ── */}
      {modal.open && (
        <CategoryModal
          mode={modal.mode}
          category={modal.mode === "edit" ? modal.category : undefined}
          onClose={() => setModal({ open: false })}
          onSubmit={async (form, category) => {
            if (category) {
              return handleUpdate(category.id, form);
            } else {
              return handleCreate(form);
            }
          }}
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

// ═══════════════════════════════════════════════════════════════
// Modal Form Add / Edit
// ═══════════════════════════════════════════════════════════════
function CategoryModal({
  mode,
  category,
  onClose,
  onSubmit,
}: {
  mode: "add" | "edit";
  category?: Category;
  onClose: () => void;
  // onSubmit mengembalikan string (pesan error) atau null (sukses)
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
    if (errors[name as keyof typeof errors]) {
      setErrors((p) => ({ ...p, [name]: "", server: "" }));
    }
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
      // Tampilkan error dari server (misal: nama duplikat)
      setErrors({ server: error });
    } else {
      onClose();
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.03)",
    border: `1px solid rgba(255,255,255,0.08)`,
    borderRadius: 3,
    padding: "10px 14px",
    fontSize: 13,
    color: "#c8baa0",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
    fontFamily: "inherit",
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
          {/* Error dari server */}
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
              Deskripsi <span style={{ color: "#3a3430" }}>(opsional)</span>
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

            {/* Toggle status */}
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
                {/* Toggle switch visual */}
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
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              background: submitting
                ? "rgba(212,180,120,0.05)"
                : "rgba(212,180,120,0.12)",
              border: "1px solid rgba(212,180,120,0.3)",
              color: submitting ? "#7a6840" : GOLD,
              fontSize: 11,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              padding: "10px 24px",
              borderRadius: 3,
              cursor: submitting ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              minWidth: 100,
            }}
            onMouseOver={(e) =>
              !submitting &&
              (e.currentTarget.style.background = "rgba(212,180,120,0.2)")
            }
            onMouseOut={(e) =>
              !submitting &&
              (e.currentTarget.style.background = "rgba(212,180,120,0.12)")
            }
          >
            {submitting ? "Menyimpan..." : mode === "add" ? "Tambah" : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Modal Konfirmasi Hapus
// ═══════════════════════════════════════════════════════════════
function DeleteModal({
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
    // Kalau sukses, modal ditutup di handleDelete
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
            marginBottom: error ? 12 : 24,
          }}
        >
          <span style={{ color: "#c8baa0" }}>{category.name}</span> akan dihapus
          permanen dari database dan tidak bisa dikembalikan.
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
            onMouseOver={(e) =>
              !deleting &&
              (e.currentTarget.style.background = "rgba(248,113,113,0.18)")
            }
            onMouseOut={(e) =>
              !deleting &&
              (e.currentTarget.style.background = "rgba(248,113,113,0.1)")
            }
          >
            {deleting ? "Menghapus..." : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}
