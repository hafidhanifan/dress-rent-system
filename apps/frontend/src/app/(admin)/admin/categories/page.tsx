"use client";

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

const TABLE_HEADERS = [
  "Order",
  "Nama",
  "Slug",
  "Deskripsi",
  "Status",
  "Dibuat",
  "Aksi",
];

const linkButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: 11,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  padding: 0,
};

function getErrorMessage(err: ApiError): string {
  return Array.isArray(err.message) ? err.message[0] : err.message;
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

  // update tampilan dulu (optimistic), baru sinkron ke server —
  // kalau gagal, balikin lagi ke kondisi semula
  const handleToggle = async (category: Category) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === category.id ? { ...c, isActive: !c.isActive } : c,
      ),
    );
    const res = await fetch(`${API}/categories/${category.id}/toggle-active`, {
      method: "PATCH",
    });
    if (!res.ok) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === category.id ? { ...c, isActive: category.isActive } : c,
        ),
      );
    }
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
      <PageHeader
        loading={loading}
        onRefresh={fetchCategories}
        onAdd={() => setModal({ open: true, mode: "add" })}
      />

      {error && <ErrorBanner message={error} onRetry={fetchCategories} />}

      <StatsRow
        loading={loading}
        total={categories.length}
        active={activeCount}
      />

      <CategoryTable
        categories={sorted}
        loading={loading}
        onAdd={() => setModal({ open: true, mode: "add" })}
        onEdit={(cat) => setModal({ open: true, mode: "edit", category: cat })}
        onDelete={(cat) => setDel({ open: true, category: cat })}
        onToggle={handleToggle}
      />

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {modal.open && (
        <CategoryModal
          mode={modal.mode}
          category={modal.mode === "edit" ? modal.category : undefined}
          onClose={() => setModal({ open: false })}
          onSubmit={(form, category) =>
            category ? handleUpdate(category.id, form) : handleCreate(form)
          }
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

// judul halaman + tombol refresh & tambah kategori
function PageHeader({
  loading,
  onRefresh,
  onAdd,
}: {
  loading: boolean;
  onRefresh: () => void;
  onAdd: () => void;
}) {
  return (
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
          onClick={onRefresh}
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
          <RefreshIcon spinning={loading} />
        </button>
        <button
          onClick={onAdd}
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
          <PlusIcon />
          Tambah Kategori
        </button>
      </div>
    </div>
  );
}

// pesan error koneksi + tombol coba lagi
function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
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
      <p style={{ fontSize: 13, color: "#f87171" }}>{message}</p>
      <button
        onClick={onRetry}
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
  );
}

// 3 kartu ringkasan: total, aktif, nonaktif
function StatsRow({
  loading,
  total,
  active,
}: {
  loading: boolean;
  total: number;
  active: number;
}) {
  const stats = [
    { label: "Total Kategori", value: total },
    { label: "Aktif", value: active },
    { label: "Nonaktif", value: total - active },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 12,
      }}
    >
      {stats.map((s) => (
        <div
          key={s.label}
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
            {loading ? "—" : s.value}
          </p>
        </div>
      ))}
    </div>
  );
}

// tabel utama, isinya loading / kosong / daftar kategori
function CategoryTable({
  categories,
  loading,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
}: {
  categories: Category[];
  loading: boolean;
  onAdd: () => void;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
  onToggle: (cat: Category) => void;
}) {
  return (
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
          {categories.length} kategori
        </p>
      </div>

      {loading ? (
        <div style={{ padding: 48, textAlign: "center" }}>
          <RefreshIcon spinning large />
          <p
            style={{
              fontSize: 12,
              color: "var(--admin-text-faint)",
              marginTop: 12,
            }}
          >
            Memuat data...
          </p>
        </div>
      ) : categories.length === 0 ? (
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
            onClick={onAdd}
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
            style={{ width: "100%", minWidth: 620, borderCollapse: "collapse" }}
          >
            <thead>
              <tr style={{ background: "rgba(0,0,0,0.05)" }}>
                {TABLE_HEADERS.map((h) => (
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
              {categories.map((cat) => (
                <CategoryRow
                  key={cat.id}
                  category={cat}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggle={onToggle}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// satu baris kategori di tabel
function CategoryRow({
  category,
  onEdit,
  onDelete,
  onToggle,
}: {
  category: Category;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
  onToggle: (cat: Category) => void;
}) {
  return (
    <tr
      style={{
        borderBottom: `1px solid ${BORDER}`,
        transition: "background 0.15s",
      }}
      onMouseOver={(e) =>
        (e.currentTarget.style.background = "rgba(0,0,0,0.02)")
      }
      onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
    >
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
          {category.order}
        </span>
      </td>

      <td style={{ padding: "14px 18px" }}>
        <p
          style={{ fontSize: 13, color: "var(--admin-text)", fontWeight: 500 }}
        >
          {category.name}
        </p>
      </td>

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
          {category.slug}
        </span>
      </td>

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
          {category.description || (
            <span style={{ fontStyle: "italic" }}>—</span>
          )}
        </p>
      </td>

      <td style={{ padding: "14px 18px" }}>
        <button
          onClick={() => onToggle(category)}
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
            background: category.isActive
              ? "rgba(52,211,153,0.07)"
              : "var(--admin-border)",
            color: category.isActive ? "#34d399" : "var(--admin-text-faint)",
            outline: `1px solid ${category.isActive ? "rgba(52,211,153,0.2)" : BORDER}`,
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              flexShrink: 0,
              background: category.isActive
                ? "#34d399"
                : "var(--admin-text-faint)",
            }}
          />
          {category.isActive ? "Aktif" : "Nonaktif"}
        </button>
      </td>

      <td
        style={{
          padding: "14px 18px",
          fontSize: 11,
          color: "var(--admin-text-faint)",
          whiteSpace: "nowrap",
        }}
      >
        {formatDate(category.createdAt)}
      </td>

      <td style={{ padding: "14px 18px" }}>
        <div style={{ display: "flex", gap: 14 }}>
          <button
            onClick={() => onEdit(category)}
            style={{ ...linkButtonStyle, color: "var(--admin-text-muted)" }}
            onMouseOver={(e) => (e.currentTarget.style.color = GOLD)}
            onMouseOut={(e) =>
              (e.currentTarget.style.color = "var(--admin-text-muted)")
            }
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(category)}
            style={{ ...linkButtonStyle, color: "var(--admin-danger)" }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.7")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Hapus
          </button>
        </div>
      </td>
    </tr>
  );
}

function RefreshIcon({
  spinning,
  large,
}: {
  spinning?: boolean;
  large?: boolean;
}) {
  const size = large ? 24 : 14;
  return (
    <svg
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
      stroke={large ? "var(--admin-text-faint)" : "currentColor"}
      strokeWidth={1.5}
      style={{
        animation: spinning ? "spin 1s linear infinite" : "none",
        display: large ? "block" : "inline",
        margin: large ? "0 auto" : 0,
      }}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
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
  );
}
