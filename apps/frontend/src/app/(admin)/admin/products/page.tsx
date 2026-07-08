"use client";

// src/app/(admin)/admin/products/page.tsx
// Setelah dipecah: hanya berisi state utama + tabel
// Modal dipindah ke _components/

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import DressModal from "./_components/DressModal";
import DeleteModal from "./_components/DeleteModal";

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
  createdAt: string;
};
type ModalState =
  | { open: false }
  | { open: true; mode: "add" }
  | { open: true; mode: "edit"; dress: Dress };
type DelState = { open: false } | { open: true; dress: Dress };

const GOLD = "var(--admin-accent)";
const BORDER = "var(--admin-border)";
const CARD = "var(--admin-card-bg)";
const API = process.env.NEXT_PUBLIC_API_URL;
const IMG_BASE = "http://localhost:3001";

const statusCfg = {
  available: {
    label: "Tersedia",
    color: "#34d399",
    bg: "rgba(52,211,153,0.08)",
    border: "rgba(52,211,153,0.2)",
  },
  unavailable: {
    label: "Tidak Tersedia",
    color: "#f87171",
    bg: "rgba(248,113,113,0.08)",
    border: "rgba(248,113,113,0.2)",
  },
  archived: {
    label: "Diarsipkan",
    color: "#6b7280",
    bg: "rgba(107,114,128,0.08)",
    border: "rgba(107,114,128,0.2)",
  },
};
const conditionCfg = {
  new: { label: "Baru", color: GOLD },
  good: { label: "Baik", color: "#4a7c5a" },
  fair: { label: "Cukup", color: "#8b6f47" },
};
const formatPrice = (n: number) => `Rp ${Number(n).toLocaleString("id-ID")}`;

export default function ProductsPage() {
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<ModalState>({ open: false });
  const [del, setDel] = useState<DelState>({ open: false });
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [dr, cr] = await Promise.all([
        fetch(`${API}/dresses`),
        fetch(`${API}/categories`),
      ]);
      if (!dr.ok || !cr.ok) throw new Error();
      const [dd, cd] = await Promise.all([dr.json(), cr.json()]);
      setDresses(dd);
      setCategories(cd);
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleDelete = async (dress: Dress): Promise<string | null> => {
    const res = await fetch(`${API}/dresses/${dress.id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json();
      return d.message ?? "Gagal menghapus";
    }
    setDresses((p) => p.filter((d) => d.id !== dress.id));
    setDel({ open: false });
    return null;
  };

  const handleSetThumbnail = async (dressId: number, photoId: number) => {
    const res = await fetch(
      `${API}/dresses/${dressId}/photos/${photoId}/thumbnail`,
      { method: "PATCH" },
    );
    if (res.ok) {
      const photos = await res.json();
      setDresses((p) =>
        p.map((d) => (d.id === dressId ? { ...d, photos } : d)),
      );
    }
  };

  const handleDeletePhoto = async (dressId: number, photoId: number) => {
    const res = await fetch(`${API}/dresses/${dressId}/photos/${photoId}`, {
      method: "DELETE",
    });
    if (res.ok)
      setDresses((p) =>
        p.map((d) =>
          d.id === dressId
            ? { ...d, photos: d.photos.filter((ph) => ph.id !== photoId) }
            : d,
        ),
      );
  };

  const reloadDress = async (id: number) => {
    const res = await fetch(`${API}/dresses/${id}`);
    if (res.ok) {
      const u = await res.json();
      setDresses((p) => {
        const e = p.find((d) => d.id === id);
        return e ? p.map((d) => (d.id === id ? u : d)) : [u, ...p];
      });
    }
  };

  const filtered = dresses.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) &&
      (filterCat === "all" || String(d.categoryId) === filterCat) &&
      (filterStatus === "all" || d.status === filterStatus),
  );

  const thumb = (d: Dress) =>
    d.photos?.find((p) => p.isThumbnail) ?? d.photos?.[0];

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
              color: "var(--admin-text-muted)",
            }}
          >
            Kelola
          </p>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "clamp(1.6rem,3vw,2rem)",
              fontWeight: 300,
              color: "var(--admin-text)",
            }}
          >
            Products
          </h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={fetchAll}
            style={{
              background: CARD,
              border: `1px solid ${BORDER}`,
              color: "var(--admin-text-muted)",
              padding: "9px 12px",
              borderRadius: 3,
              cursor: "pointer",
            }}
          >
            <svg
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
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
            Tambah Dress
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: "rgba(248,113,113,0.08)",
            border: "1px solid rgba(248,113,113,0.2)",
            borderRadius: 4,
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p style={{ fontSize: 13, color: "#f87171" }}>{error}</p>
          <button
            onClick={fetchAll}
            style={{
              fontSize: 11,
              color: "#f87171",
              background: "rgba(248,113,113,0.15)",
              border: "1px solid rgba(248,113,113,0.3)",
              padding: "4px 12px",
              borderRadius: 3,
              cursor: "pointer",
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
          gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
          gap: 12,
        }}
      >
        {[
          { label: "Total Dress", value: dresses.length },
          {
            label: "Tersedia",
            value: dresses.filter((d) => d.status === "available").length,
          },
          {
            label: "Tidak Tersedia",
            value: dresses.filter((d) => d.status === "unavailable").length,
          },
          {
            label: "Diarsipkan",
            value: dresses.filter((d) => d.status === "archived").length,
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
                color: "var(--admin-text-muted)",
                marginBottom: 10,
              }}
            >
              {s.label}
            </p>
            <p
              style={{
                fontFamily: "'Cormorant Garamond',serif",
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

      {/* Filter */}
      <div
        style={{
          background: CARD,
          border: `1px solid ${BORDER}`,
          borderRadius: 4,
          padding: "14px 16px",
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", flex: "1 1 200px" }}>
          <svg
            width="13"
            height="13"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--admin-text-faint)",
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Cari dress..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              background: "rgba(0,0,0,0.03)",
              border: `1px solid ${BORDER}`,
              borderRadius: 3,
              paddingLeft: 34,
              paddingRight: 12,
              paddingTop: 8,
              paddingBottom: 8,
              fontSize: 13,
              color: "var(--admin-text)",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          style={{
            background: "rgba(0,0,0,0.03)",
            border: `1px solid ${BORDER}`,
            borderRadius: 3,
            padding: "8px 12px",
            fontSize: 11,
            color: "var(--admin-text-muted)",
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="all">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            background: "rgba(0,0,0,0.03)",
            border: `1px solid ${BORDER}`,
            borderRadius: 3,
            padding: "8px 12px",
            fontSize: 11,
            color: "var(--admin-text-muted)",
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="all">Semua Status</option>
          <option value="available">Tersedia</option>
          <option value="unavailable">Tidak Tersedia</option>
          <option value="archived">Diarsipkan</option>
        </select>
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
          }}
        >
          <p
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 16,
              fontWeight: 300,
              color: "var(--admin-text)",
            }}
          >
            Semua Dress
          </p>
          <p style={{ fontSize: 10, color: "var(--admin-text-faint)" }}>
            {filtered.length} dress
          </p>
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>
              Memuat data...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <p
              style={{
                fontSize: 13,
                color: "var(--admin-text-faint)",
                marginBottom: 12,
              }}
            >
              Belum ada dress
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
              }}
            >
              Tambah dress pertama
            </button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                minWidth: 700,
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.05)" }}>
                  {[
                    "Foto",
                    "Nama Dress",
                    "Kategori",
                    "Harga/Hari",
                    "Ukuran",
                    "Status",
                    "Kondisi",
                    "Aksi",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "11px 16px",
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
                {filtered.map((dress) => {
                  const t = thumb(dress);
                  const sc = statusCfg[dress.status];
                  const cc = conditionCfg[dress.condition];
                  return (
                    <tr
                      key={dress.id}
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
                      <td style={{ padding: "12px 16px" }}>
                        <div
                          style={{
                            width: 48,
                            height: 64,
                            background: "rgba(0,0,0,0.04)",
                            borderRadius: 2,
                            overflow: "hidden",
                            position: "relative",
                            border: `1px solid ${BORDER}`,
                          }}
                        >
                          {t ? (
                            <Image
                              src={`${IMG_BASE}${t.url}`}
                              alt={dress.name}
                              fill
                              style={{
                                objectFit: "cover",
                                objectPosition: "top",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <svg
                                width="16"
                                height="16"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="var(--admin-text-faint)"
                                strokeWidth={1}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <p
                          style={{
                            fontSize: 13,
                            color: "var(--admin-text)",
                            marginBottom: 3,
                          }}
                        >
                          {dress.name}
                        </p>
                        <p
                          style={{
                            fontSize: 9,
                            color: "var(--admin-text-faint)",
                            fontFamily: "monospace",
                          }}
                        >
                          {dress.slug}
                        </p>
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 11,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: "var(--admin-text-muted)",
                        }}
                      >
                        {dress.category?.name ?? "—"}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 13,
                          color: "var(--admin-text)",
                        }}
                      >
                        {formatPrice(dress.pricePerDay)}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div
                          style={{ display: "flex", gap: 4, flexWrap: "wrap" }}
                        >
                          {dress.sizes?.slice(0, 4).map((s) => (
                            <span
                              key={s.label}
                              style={{
                                fontSize: 9,
                                padding: "2px 6px",
                                borderRadius: 3,
                                background: "rgba(0,0,0,0.04)",
                                border: `1px solid ${BORDER}`,
                                color: "var(--admin-text-muted)",
                              }}
                            >
                              {s.label}
                            </span>
                          ))}
                          {(dress.sizes?.length ?? 0) > 4 && (
                            <span
                              style={{
                                fontSize: 9,
                                color: "var(--admin-text-faint)",
                              }}
                            >
                              +{dress.sizes.length - 4}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 9,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            padding: "3px 10px",
                            borderRadius: 20,
                            background: sc.bg,
                            color: sc.color,
                            border: `1px solid ${sc.border}`,
                          }}
                        >
                          <span
                            style={{
                              width: 4,
                              height: 4,
                              borderRadius: "50%",
                              background: sc.color,
                              flexShrink: 0,
                            }}
                          />
                          {sc.label}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 11,
                          color: cc.color,
                        }}
                      >
                        {cc.label}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 14 }}>
                          <button
                            onClick={() =>
                              setModal({ open: true, mode: "edit", dress })
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
                            onClick={() => setDel({ open: true, dress })}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal.open && (
        <DressModal
          mode={modal.mode}
          dress={modal.mode === "edit" ? modal.dress : undefined}
          categories={categories}
          onClose={() => setModal({ open: false })}
          onSuccess={reloadDress}
          onSetThumbnail={handleSetThumbnail}
          onDeletePhoto={handleDeletePhoto}
        />
      )}
      {del.open && (
        <DeleteModal
          name={del.dress.name}
          onClose={() => setDel({ open: false })}
          onConfirm={() => handleDelete(del.dress)}
        />
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
