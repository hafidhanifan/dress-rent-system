"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────
// Data dress spotlight
// Ganti src dengan path foto aslimu, dan isi nama + kategori
// ─────────────────────────────────────────────────────────────
const dresses = [
  {
    id: 1,
    name: "Aurelia Evening Gown",
    category: "Evening Gown",
    src: "/images/collection-1.jpg",
    href: "/dresses/aurelia-evening-gown",
  },
  {
    id: 2,
    name: "Celeste Midi Dress",
    category: "Midi Dress",
    src: "/images/collection-2.jpg",
    href: "/dresses/celeste-midi-dress",
  },
  {
    id: 3,
    name: "Vivienne Wrap Dress",
    category: "Wrap Dress",
    src: "/images/collection-3.jpg",
    href: "/dresses/vivienne-wrap-dress",
  },
  {
    id: 4,
    name: "Noir Cocktail Dress",
    category: "Cocktail",
    src: "/images/collection-4.jpg",
    href: "/dresses/noir-cocktail-dress",
  },
];

export default function SpotlightSection() {
  // Ref ke section untuk animasi scroll-in
  const sectionRef = useRef<HTMLElement>(null);

  // ── Animasi scroll-in (sama seperti section lain) ──
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const items = Array.from(
      section.querySelectorAll<HTMLElement>("[data-reveal]"),
    );

    // Sembunyikan dulu semua elemen sebelum browser paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        items.forEach((el) => {
          el.style.opacity = "0";
          el.style.transform = "translateY(24px)";
          el.style.transition = "opacity 0s, transform 0s";
        });

        // Observe section — animasikan saat masuk viewport
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
          { threshold: 0, rootMargin: "0px 0px -60px 0px" },
        );

        observer.observe(section);
      });
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full bg-[#f0ebe3] py-16 md:py-24 px-6 md:px-12 lg:px-20"
    >
      {/* ── Header: label + judul + link View All ── */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 md:gap-0 mb-10 md:mb-14">
        {/* Kiri: label kecil + judul besar */}
        <div data-reveal data-delay="0.05">
          {/* Label kecil di atas judul */}
          <p className="font-sans text-[9px] tracking-[0.35em] uppercase text-stone-400 mb-3">
            Spotlight
          </p>

          {/*
            Judul dengan mix normal + italic
            "seasonal" normal, "highlights" italic — persis seperti referensi
          */}
          <h2
            className="font-serif font-light text-stone-800 leading-[1.1] tracking-[-0.01em]"
            style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)" }}
          >
            Explore our <br />
            seasonal <em className="italic">highlights</em>
          </h2>
        </div>

        {/* Kanan: tombol View All — ganti icon < > dari referensi */}
        <div data-reveal data-delay="0.15">
          <Link
            href="/dresses"
            className="
              group inline-flex items-center gap-3
              font-sans text-[10px] tracking-[0.25em] uppercase
              text-stone-500 hover:text-stone-800
              transition-colors duration-300
            "
          >
            View All
            {/* Garis animasi hover */}
            <span className="block w-8 h-px bg-stone-400 group-hover:w-12 transition-all duration-300" />
          </Link>
        </div>
      </div>

      {/* ── Grid kartu dress ── */}
      {/*
        Layout:
        - Mobile (< md)  : 1 kolom, scroll vertikal
        - Tablet (md)    : 2 kolom
        - Desktop (lg+)  : 4 kolom

        Semua kartu tingginya sama (aspect-ratio 3/4)
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {dresses.map((dress, i) => (
          <DressCard
            key={dress.id}
            dress={dress}
            // Stagger delay: kartu ke-0 = 0.1s, ke-1 = 0.2s, dst
            delay={0.1 + i * 0.1}
          />
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Komponen kartu dress
// ─────────────────────────────────────────────────────────────
function DressCard({
  dress,
  delay,
}: {
  dress: (typeof dresses)[0];
  delay: number;
}) {
  return (
    <Link
      href={dress.href}
      data-reveal
      data-delay={String(delay)}
      className="group block"
    >
      {/* ── Foto ── */}
      {/*
        - aspect-ratio 3/4 supaya semua kartu tingginya seragam
        - overflow-hidden supaya efek zoom hover tidak keluar kotak
        - relative wajib ada karena pakai <Image fill>
      */}
      <div
        className="relative overflow-hidden bg-[#e0d8cf] w-full"
        style={{ aspectRatio: "3/4" }}
      >
        <Image
          src={dress.src}
          alt={dress.name}
          fill
          // object-cover: gambar mengisi kotak tanpa distorsi
          // object-top: prioritaskan bagian atas (kepala model)
          className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>

      {/* ── Info di bawah foto ── */}
      <div className="mt-3 md:mt-4">
        {/* Kategori — kecil, uppercase */}
        <p className="font-sans text-[8px] md:text-[9px] tracking-[0.3em] uppercase text-stone-400 mb-1">
          {dress.category}
        </p>

        {/* Nama dress */}
        <p className="font-serif font-light text-stone-800 text-base md:text-lg leading-snug group-hover:text-stone-500 transition-colors duration-300">
          {dress.name}
        </p>
      </div>
    </Link>
  );
}
