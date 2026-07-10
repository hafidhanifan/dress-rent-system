"use client";

// src/app/(admin)/admin/categories/page.tsx
// Setelah dipecah: hanya berisi state utama + tabel
// Modal dipindah ke _components/

import { useState, useEffect, useCallback } from "react";
import CategoryModal, {
  Category,
  CategoryFormData,
} from "./_components/CategoryModal";
import DeleteCategoryModal from "./_components/DeleteCategoryModal";

const GOLD = "var(--admin-accent)";
const BORDER = "var(--admin-border)";
const CARD = "var(--admin-card-bg)";
const API = process.env.NEXT_PUBLIC_API_URL;

type ApiError = { message: string | string[]; statusCode: number };
type ModalState =
  | { open: false }
  | { open: true; mode: "add" }
  | { open: true; mode: "edit"; category: Category };
type DelState = { open: false } | { open: true; category: Category };

function getErrorMessage(err: ApiError): string {
  if (Array.isArray(err.message)) return err.message[0];
  return err.message;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<ModalState>({ open: false });
  const [del, setDel] = useState<DelState>({ open: false });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/categories`);
      if (!res.ok) throw new Error();
      setCategories(await res.json());
    } catch {
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
    if (!res.ok) return getErrorMessage(data as ApiError);
    setCategories((prev) => [...prev, data]);
    return null;
  };

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
    if (!res.ok) return getErrorMessage(data as ApiError);
    setCategories((prev) => prev.map((c) => (c.id === id ? data : c)));
    return null;
  };

  const handleToggle = async (category: Category) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === category.id ? { ...c, isActive: !c.isActive } : c,
      ),
    );
    const res = await fetch(`${API}/categories/${category.id}/toggle-active`, {
      method: "PATCH",
    });
    if (!res.ok)
      setCategories((prev) =>
        prev.map((c) =>
          c.id === category.id ? { ...c, isActive: category.isActive } : c,
        ),
      );
  };

  const handleDelete = async (category: Category): Promise<string | null> => {
    const res = await fetch(`${API}/categories/${category.id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) return getErrorMessage(data as ApiError);
    setCategories((prev) => prev.filter((c) => c.id !== category.id));
    setDel({ open: false });
    return null;
  };

  const activeCount = categories.filter((c) => c.isActive).length;
  const sorted = [...categories].sort((a, b) => a.order - b.order);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
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
            Categories
          </h1>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={fetchCategories}
            disabled={loading}
            title="Refresh data"
            style={{
              background: "var(--admin-border)",
              border: `1px solid ${BORDER}`,
              color: "var(--admin-text-faint)",
              padding: "9px 12px",
              borderRadius: 3,
              cursor: loading ? "not-allowed" : "pointer",
            }}
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
          <button
            onClick={() => setModal({ open: true, mode: "add" })}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "var(--admin-accent-bg)",
              border: "1px solid var(--admin-accent-border)",
              color: GOLD,
              fontSize: 11,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              padding: "10px 20px",
              borderRadius: 3,
              cursor: "pointer",
            }}
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

      {/* Error */}
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
          <p style={{ fontSize: 13, color: "#f87171" }}>{error}</p>
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

      {/* Stats */}
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
                color: "var(--admin-text-faint)",
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
                color: "var(--admin-text)",
                lineHeight: 1,
              }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Tabel */}
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
              color: "var(--admin-text)",
            }}
          >
            Semua Kategori
          </p>
          <p style={{ fontSize: 10, color: "var(--admin-text-faint)" }}>
            {sorted.length} kategori
          </p>
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <svg
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
              stroke="var(--admin-text-faint)"
              strokeWidth={1.5}
              style={{
                margin: "0 auto 12px",
                display: "block",
                animation: "spin 1s linear infinite",
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
            <p style={{ fontSize: 12, color: "var(--admin-text-faint)" }}>
              Memuat data...
            </p>
          </div>
        ) : sorted.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <p
              style={{
                fontSize: 13,
                color: "var(--admin-text-faint)",
                marginBottom: 12,
              }}
            >
              Belum ada kategori
            </p>
            <button
              onClick={() => setModal({ open: true, mode: "add" })}
              style={{
                fontSize: 11,
                color: GOLD,
                background: "var(--admin-accent-bg)",
                border: "1px solid var(--admin-accent-border)",
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
                <tr style={{ background: "rgba(0,0,0,0.05)" }}>
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
                {sorted.map((cat) => (
                  <tr
                    key={cat.id}
                    style={{
                      borderBottom: `1px solid ${BORDER}`,
                      transition: "background 0.15s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.background = "rgba(0,0,0,0.02)")
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
                          background: "rgba(0,0,0,0.04)",
                          border: `1px solid ${BORDER}`,
                          fontSize: 11,
                          color: "var(--admin-text-muted)",
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
                          color: "var(--admin-text)",
                          fontWeight: 500,
                        }}
                      >
                        {cat.name}
                      </p>
                    </td>

                    {/* Slug */}
                    <td style={{ padding: "14px 18px" }}>
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: 11,
                          color: "var(--admin-text-muted)",
                          background: "var(--admin-border)",
                          padding: "3px 8px",
                          borderRadius: 3,
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
                          color: "var(--admin-text-faint)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {cat.description || (
                          <span style={{ fontStyle: "italic" }}>—</span>
                        )}
                      </p>
                    </td>

                    {/* Status toggle */}
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
                            : "var(--admin-border)",
                          color: cat.isActive
                            ? "#34d399"
                            : "var(--admin-text-faint)",
                          outline: `1px solid ${cat.isActive ? "rgba(52,211,153,0.2)" : BORDER}`,
                        }}
                      >
                        <span
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            flexShrink: 0,
                            background: cat.isActive
                              ? "#34d399"
                              : "var(--admin-text-faint)",
                          }}
                        />
                        {cat.isActive ? "Aktif" : "Nonaktif"}
                      </button>
                    </td>

                    {/* Tanggal */}
                    <td
                      style={{
                        padding: "14px 18px",
                        fontSize: 11,
                        color: "var(--admin-text-faint)",
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
                            color: "var(--admin-text-muted)",
                            padding: 0,
                          }}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.color = GOLD)
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.color =
                              "var(--admin-text-muted)")
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
                            color: "var(--admin-danger)",
                            padding: 0,
                          }}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.opacity = "0.7")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.opacity = "1")
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

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {modal.open && (
        <CategoryModal
          mode={modal.mode}
          category={modal.mode === "edit" ? modal.category : undefined}
          onClose={() => setModal({ open: false })}
          onSubmit={async (form, category) => {
            if (category) return handleUpdate(category.id, form);
            else return handleCreate(form);
          }}
        />
      )}

      {del.open && (
        <DeleteCategoryModal
          category={del.category}
          onClose={() => setDel({ open: false })}
          onConfirm={() => handleDelete(del.category)}
        />
      )}
    </div>
  );
}
