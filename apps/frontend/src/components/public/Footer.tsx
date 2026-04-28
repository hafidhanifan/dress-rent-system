"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────
// Data kolom footer — ganti href sesuai routing proyekmu
// ─────────────────────────────────────────────────────────────
const footerColumns = [
  {
    id: 1,
    heading: "Mulai dari sini",
    desc: "Temukan dress impianmu dari ratusan koleksi pilihan.",
    linkLabel: "Lihat Koleksi",
    linkHref: "/dresses",
  },
  {
    id: 2,
    heading: "Tentang Kami",
    desc: "Kenali cerita di balik Naia Dress dan filosofi kami.",
    linkLabel: "About Us",
    linkHref: "/about",
  },
  {
    id: 3,
    heading: "Butuh Bantuan?",
    desc: "Ada pertanyaan soal sewa, ukuran, atau pengiriman?",
    linkLabel: "FAQ & Kontak",
    linkHref: "/faq",
  },
];

// Navigasi kecil di bawah
const bottomLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Instagram", href: "https://instagram.com" },
];

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  // ── Animasi scroll-in ──
  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const items = Array.from(
      footer.querySelectorAll<HTMLElement>("[data-reveal]"),
    );

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        items.forEach((el) => {
          el.style.opacity = "0";
          el.style.transform = "translateY(20px)";
          el.style.transition = "opacity 0s, transform 0s";
        });

        const observer = new IntersectionObserver(
          ([entry]) => {
            if (!entry.isIntersecting) return;
            items.forEach((el) => {
              const delay = parseFloat(el.dataset.delay ?? "0") * 1000;
              setTimeout(() => {
                el.style.transition =
                  "opacity 0.75s ease, transform 0.75s ease";
                el.style.opacity = "1";
                el.style.transform = "translateY(0)";
              }, delay);
            });
            observer.disconnect();
          },
          { threshold: 0, rootMargin: "0px 0px -40px 0px" },
        );

        observer.observe(footer);
      });
    });
  }, []);

  return (
    <footer
      ref={footerRef}
      // Warna sedikit lebih gelap dari bg utama (#f0ebe3) → (#e6dfd6)
      className="w-full bg-[#e6dfd6]"
    >
      {/* ══════════════════════════════════════
          BAGIAN ATAS — Need Help + 3 kolom
      ══════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16 md:py-20 lg:py-24">
        {/*
          Grid layout:
          - Mobile  : 1 kolom (stack semua)
          - Tablet  : 2 kolom
          - Desktop : 4 kolom (judul besar | 3 kolom konten)
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* ── Kolom 1: Judul besar "Need Help?" ── */}
          <div data-reveal data-delay="0.05" className="lg:pr-8">
            <h2
              className="font-serif font-[300] text-stone-700 leading-[1.05]"
              style={{ fontSize: "clamp(2.4rem, 4vw, 3.4rem)" }}
            >
              Need <br />
              {/* Italic seperti referensi */}
              <em className="italic">Help?</em>
            </h2>

            {/* Garis dekoratif bawah judul */}
            <div className="w-10 h-[1px] bg-stone-400 mt-5" />
          </div>

          {/* ── Kolom 2, 3, 4: konten footer ── */}
          {footerColumns.map((col, i) => (
            <div
              key={col.id}
              data-reveal
              data-delay={String(0.1 + i * 0.1)}
              className="flex flex-col"
            >
              {/* Judul kolom */}
              <p className="font-sans text-[11px] font-[500] tracking-[0.15em] uppercase text-stone-600 mb-3">
                {col.heading}
              </p>

              {/* Deskripsi */}
              <p className="font-sans font-[300] text-stone-500 text-sm leading-relaxed mb-6 flex-1">
                {col.desc}
              </p>

              {/* Link dengan garis bawah dekoratif — persis seperti referensi */}
              <div>
                <Link
                  href={col.linkHref}
                  className="
                    group inline-flex items-center gap-2
                    font-sans text-[10px] tracking-[0.25em] uppercase
                    text-[#b08060] hover:text-stone-700
                    transition-colors duration-300
                  "
                >
                  {/* Arrow kecil */}
                  <span className="text-[#c09878] group-hover:text-stone-500 transition-colors">
                    &rsaquo;
                  </span>
                  {col.linkLabel}
                </Link>
                {/* Garis oranye-nude di bawah link */}
                <div className="w-10 h-[1px] bg-[#c8a888] mt-2 group-hover:w-14 transition-all duration-300" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════
          GARIS PEMBATAS
      ══════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="w-full h-[1px] bg-stone-300/60" />
      </div>

      {/* ══════════════════════════════════════
          BAGIAN BAWAH — copyright + nav kecil
      ══════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright + nama brand */}
          <div
            data-reveal
            data-delay="0.05"
            className="flex items-center gap-3"
          >
            {/* Logo teks kecil */}
            <span className="font-serif text-sm font-[300] tracking-[0.2em] uppercase text-stone-500">
              Naia Dress
            </span>
            <span className="text-stone-300">·</span>
            <span className="font-sans text-[10px] text-stone-400 tracking-wide">
              © {new Date().getFullYear()} All rights reserved
            </span>
          </div>

          {/* Nav kecil: Privacy, Terms, Instagram */}
          <nav data-reveal data-delay="0.15">
            <ul className="flex items-center gap-5 md:gap-6">
              {bottomLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="
                      font-sans text-[10px] tracking-[0.15em] uppercase
                      text-stone-400 hover:text-stone-600
                      transition-colors duration-300
                    "
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
