"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { faqCategories, type FaqItem } from "./_data/faqData";

export default function FaqPage() {
  const [activeCat, setActiveCat] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  // filter kategori & pertanyaan sesuai kategori aktif dan kata kunci
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    return faqCategories
      .filter((cat) => activeCat === "all" || cat.id === activeCat)
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            !q ||
            item.q.toLowerCase().includes(q) ||
            item.a.toLowerCase().includes(q),
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [activeCat, search]);

  const totalResults = filtered.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <div className="min-h-screen" style={{ background: "var(--user-bg)" }}>
      <PageHeader />

      <SearchAndFilter
        search={search}
        onChangeSearch={setSearch}
        activeCat={activeCat}
        onChangeCat={setActiveCat}
      />

      <div className="max-w-3xl mx-auto px-6 pb-24">
        {totalResults === 0 ? (
          <NoResults />
        ) : (
          <div className="flex flex-col gap-14">
            {filtered.map((cat) => (
              <div key={cat.id}>
                <h2
                  className="font-serif font-light mb-5"
                  style={{
                    fontSize: "clamp(1.3rem, 2vw, 1.6rem)",
                    color: "var(--user-text)",
                  }}
                >
                  {cat.label}
                </h2>

                <div
                  className="flex flex-col"
                  style={{ borderTop: "1px solid var(--user-border)" }}
                >
                  {cat.items.map((item, i) => {
                    const id = `${cat.id}-${i}`;
                    const isOpen = openId === id;
                    return (
                      <FaqAccordionItem
                        key={id}
                        item={item}
                        isOpen={isOpen}
                        onToggle={() => setOpenId(isOpen ? null : id)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ContactCta />
    </div>
  );
}

// breadcrumb + judul halaman + subtitle
function PageHeader() {
  return (
    <div className="pt-32 pb-14 px-6 text-center">
      <div className="flex items-center justify-center gap-2 mb-8">
        <Link
          href="/"
          className="font-sans text-[10px] tracking-[0.2em] uppercase transition-colors"
          style={{ color: "var(--user-text-muted)" }}
        >
          Home
        </Link>
        <span style={{ color: "var(--user-text-faint)" }} className="text-xs">
          /
        </span>
        <span
          className="font-sans text-[10px] tracking-[0.2em] uppercase"
          style={{ color: "var(--user-text)" }}
        >
          FAQ
        </span>
      </div>

      <h1
        className="font-serif font-light leading-none mb-5"
        style={{
          fontSize: "clamp(2.2rem, 6vw, 4.5rem)",
          color: "var(--user-text)",
        }}
      >
        Pertanyaan yang <em className="italic">Sering Diajukan</em>
      </h1>

      <p
        className="font-sans font-light text-sm leading-relaxed max-w-md mx-auto"
        style={{ color: "var(--user-text-muted)" }}
      >
        Semua yang perlu kamu tahu tentang cara sewa, pengiriman, dan
        pengembalian gaun di Naia.
      </p>
    </div>
  );
}

// kolom pencarian + pill kategori
function SearchAndFilter({
  search,
  onChangeSearch,
  activeCat,
  onChangeCat,
}: {
  search: string;
  onChangeSearch: (value: string) => void;
  activeCat: string;
  onChangeCat: (id: string) => void;
}) {
  const catOptions = [
    { id: "all", label: "Semua" },
    ...faqCategories.map((c) => ({ id: c.id, label: c.label })),
  ];

  return (
    <div className="max-w-3xl mx-auto px-6 mb-12">
      <div className="relative mb-6">
        <svg
          width="14"
          height="14"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          className="absolute left-4 top-1/2 -translate-y-1/2"
          style={{ color: "var(--user-text-muted)" }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Cari pertanyaan... misalnya 'denda' atau 'ukuran'"
          value={search}
          onChange={(e) => onChangeSearch(e.target.value)}
          className="w-full bg-transparent rounded-full pl-11 pr-5 py-3 font-sans text-sm outline-none transition-colors"
          style={{
            border: "1px solid var(--user-border)",
            color: "var(--user-text)",
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = "var(--user-text-muted)")
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = "var(--user-border)")
          }
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {catOptions.map((c) => (
          <button
            key={c.id}
            onClick={() => onChangeCat(c.id)}
            className="font-sans text-[9px] tracking-[0.12em] uppercase px-4 py-2 rounded-full transition-all duration-200"
            style={{
              background:
                activeCat === c.id ? "var(--user-text)" : "transparent",
              color:
                activeCat === c.id
                  ? "var(--user-bg)"
                  : "var(--user-text-secondary)",
              border: `1px solid ${activeCat === c.id ? "var(--user-text)" : "var(--user-border)"}`,
            }}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// tampil saat pencarian/filter tidak menemukan hasil apapun
function NoResults() {
  return (
    <div className="text-center py-20">
      <p
        className="font-serif font-light text-2xl mb-3"
        style={{ color: "var(--user-text-muted)" }}
      >
        Tidak ditemukan
      </p>
      <p
        className="font-sans text-sm"
        style={{ color: "var(--user-text-muted)" }}
      >
        Coba kata kunci lain, atau hubungi kami langsung di bawah.
      </p>
    </div>
  );
}

// ajakan hubungi wa di paling bawah halaman
function ContactCta() {
  return (
    <div
      className="px-6 py-16 md:py-20 text-center"
      style={{ borderTop: "1px solid var(--user-border)" }}
    >
      <p
        className="font-serif font-light mb-3"
        style={{
          fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
          color: "var(--user-text)",
        }}
      >
        Masih ada yang ingin ditanyakan?
      </p>
      <p
        className="font-sans text-sm mb-8"
        style={{ color: "var(--user-text-muted)" }}
      >
        Tim kami siap bantu jawab pertanyaanmu langsung.
      </p>
      <a
        href="https://wa.me/6281234567890"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block font-sans text-[10px] tracking-[0.25em] uppercase px-8 py-3.5 transition-all duration-300"
        style={{
          border: "1px solid var(--user-text)",
          color: "var(--user-text)",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = "var(--user-text)";
          e.currentTarget.style.color = "var(--user-bg)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--user-text)";
        }}
      >
        Hubungi Kami di WhatsApp
      </a>
    </div>
  );
}

// satu item accordion, animasi expand/collapse pakai grid-rows
// (0fr -> 1fr) supaya smooth tanpa perlu ukur tinggi lewat js
function FaqAccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={{ borderBottom: "1px solid var(--user-border)" }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
      >
        <span
          className="font-sans text-sm md:text-base"
          style={{ color: "var(--user-text)" }}
        >
          {item.q}
        </span>
        <span
          className="shrink-0 w-6 h-6 flex items-center justify-center transition-transform duration-300"
          style={{
            color: "var(--user-text-muted)",
            transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
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
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </span>
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateRows: isOpen ? "1fr" : "0fr",
          transition: "grid-template-rows 0.35s ease",
        }}
      >
        <div style={{ overflow: "hidden" }}>
          <p
            className="font-sans font-light text-sm leading-relaxed pb-6 pr-8"
            style={{ color: "var(--user-text-secondary)" }}
          >
            {item.a}
          </p>
        </div>
      </div>
    </div>
  );
}
