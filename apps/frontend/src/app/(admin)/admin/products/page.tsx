"use client";

import { useState } from "react";
import ProductModal, { Product } from "@/components/admin/ProductModal";

const BORDER = "rgba(255,255,255,0.07)";
const CARD = "rgba(255,255,255,0.03)";

const init: Product[] = [
  {
    id: 1,
    name: "Aurelia Evening Gown",
    category: "Evening Gown",
    price: "580000",
    stock: "2",
    size: "M",
    description: "Gaun malam elegan.",
    status: "available",
  },
  {
    id: 2,
    name: "Celeste Midi Dress",
    category: "Midi Dress",
    price: "350000",
    stock: "3",
    size: "S",
    description: "Midi dress kasual.",
    status: "available",
  },
  {
    id: 3,
    name: "Vivienne Wrap Dress",
    category: "Wrap Dress",
    price: "280000",
    stock: "1",
    size: "L",
    description: "Wrap dress flattering.",
    status: "available",
  },
  {
    id: 4,
    name: "Noir Cocktail Dress",
    category: "Cocktail",
    price: "420000",
    stock: "2",
    size: "XS",
    description: "Cocktail minimalis.",
    status: "unavailable",
  },
  {
    id: 5,
    name: "Serena Maxi Dress",
    category: "Maxi Dress",
    price: "320000",
    stock: "1",
    size: "M",
    description: "Maxi flowy.",
    status: "available",
  },
];

type ModalState =
  | { open: false }
  | { open: true; mode: "add" }
  | { open: true; mode: "edit"; product: Product };
type DelState = { open: false } | { open: true; product: Product };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(init);
  const [modal, setModal] = useState<ModalState>({ open: false });
  const [del, setDel] = useState<DelState>({ open: false });
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (cat === "all" || p.category === cat),
  );

  const cats = ["all", ...Array.from(new Set(products.map((p) => p.category)))];

  const handleSubmit = (data: Product) => {
    if (modal.open && modal.mode === "edit") {
      setProducts((prev) => prev.map((p) => (p.id === data.id ? data : p)));
    } else {
      setProducts((prev) => [...prev, { ...data, id: Date.now() }]);
    }
  };

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
            Products
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
            color: "#d4b478",
            fontSize: 11,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            padding: "10px 20px",
            borderRadius: 3,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          className="hover:!bg-[rgba(212,180,120,0.18)]"
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
          Tambah Produk
        </button>
      </div>

      {/* Filter bar */}
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
        {/* Search */}
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
              color: "#3a3430",
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
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${BORDER}`,
              borderRadius: 3,
              paddingLeft: 34,
              paddingRight: 12,
              paddingTop: 8,
              paddingBottom: 8,
              fontSize: 13,
              color: "#c8baa0",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Category pills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              style={{
                fontSize: 9,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                padding: "5px 12px",
                borderRadius: 20,
                cursor: "pointer",
                transition: "all 0.2s",
                background:
                  cat === c ? "rgba(212,180,120,0.12)" : "transparent",
                border: `1px solid ${cat === c ? "rgba(212,180,120,0.4)" : BORDER}`,
                color: cat === c ? "#d4b478" : "#4a4440",
              }}
            >
              {c === "all" ? "Semua" : c}
            </button>
          ))}
        </div>
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
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", minWidth: 620, borderCollapse: "collapse" }}
          >
            <thead>
              <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                {[
                  "Produk",
                  "Kategori",
                  "Ukuran",
                  "Harga / Hari",
                  "Stok",
                  "Status",
                  "Aksi",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 18px",
                      textAlign: "left",
                      fontSize: 9,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "#3a3430",
                      fontWeight: 400,
                      background: "rgba(0,0,0,0.2)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      fontSize: 13,
                      color: "#3a3430",
                    }}
                  >
                    Tidak ada produk ditemukan
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    style={{ borderBottom: `1px solid rgba(255,255,255,0.03)` }}
                    className="hover:bg-white/[0.015] transition-colors"
                  >
                    <td style={{ padding: "14px 18px" }}>
                      <p style={{ fontSize: 13, color: "#c8baa0" }}>{p.name}</p>
                    </td>
                    <td
                      style={{
                        padding: "14px 18px",
                        fontSize: 10,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "#4a4440",
                      }}
                    >
                      {p.category}
                    </td>
                    <td
                      style={{
                        padding: "14px 18px",
                        fontSize: 13,
                        color: "#5a5450",
                      }}
                    >
                      {p.size}
                    </td>
                    <td
                      style={{
                        padding: "14px 18px",
                        fontSize: 13,
                        color: "#c8baa0",
                      }}
                    >
                      Rp {parseInt(p.price).toLocaleString("id-ID")}
                    </td>
                    <td
                      style={{
                        padding: "14px 18px",
                        fontSize: 13,
                        color: "#7a7060",
                      }}
                    >
                      {p.stock}
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: 9,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          padding: "3px 10px",
                          borderRadius: 20,
                          background:
                            p.status === "available"
                              ? "rgba(52,211,153,0.07)"
                              : "rgba(255,255,255,0.03)",
                          color:
                            p.status === "available" ? "#34d399" : "#4a4440",
                          border: `1px solid ${p.status === "available" ? "rgba(52,211,153,0.2)" : BORDER}`,
                        }}
                      >
                        <span
                          style={{
                            width: 4,
                            height: 4,
                            borderRadius: "50%",
                            background:
                              p.status === "available" ? "#34d399" : "#3a3430",
                            flexShrink: 0,
                          }}
                        />
                        {p.status === "available"
                          ? "Tersedia"
                          : "Tidak Tersedia"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", gap: 14 }}>
                        <button
                          onClick={() =>
                            setModal({ open: true, mode: "edit", product: p })
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
                          }}
                          className="hover:!text-[#d4b478] transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDel({ open: true, product: p })}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 11,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: "#4a3030",
                            padding: 0,
                          }}
                          className="hover:!text-[#f87171] transition-colors"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div
          style={{
            padding: "10px 18px",
            borderTop: `1px solid rgba(255,255,255,0.03)`,
          }}
        >
          <p style={{ fontSize: 10, color: "#3a3430" }}>
            {filtered.length} dari {products.length} produk
          </p>
        </div>
      </div>

      {/* Modal add/edit */}
      <ProductModal
        isOpen={modal.open}
        mode={modal.open ? modal.mode : "add"}
        product={modal.open && modal.mode === "edit" ? modal.product : null}
        onClose={() => setModal({ open: false })}
        onSubmit={handleSubmit}
      />

      {/* Modal hapus */}
      {del.open && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setDel({ open: false });
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
            {/* Ikon warning */}
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
              Hapus Produk?
            </h3>
            <p
              style={{
                fontSize: 13,
                color: "#5a5450",
                lineHeight: 1.6,
                marginBottom: 24,
              }}
            >
              <span style={{ color: "#c8baa0" }}>{del.product.name}</span> akan
              dihapus permanen dan tidak bisa dikembalikan.
            </p>
            <div
              style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}
            >
              <button
                onClick={() => setDel({ open: false })}
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
                className="hover:!text-[#7a7060] transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setProducts((p) => p.filter((x) => x.id !== del.product.id));
                  setDel({ open: false });
                }}
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
                className="hover:!bg-[rgba(248,113,113,0.18)]"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
test;
