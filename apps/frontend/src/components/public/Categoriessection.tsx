"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const categories = [
  { name: "Evening Gown", href: "/dresses?cat=evening-gown" },
  { name: "Cocktail", href: "/dresses?cat=cocktail" },
  { name: "Midi Dress", href: "/dresses?cat=midi" },
  { name: "Wrap Dress", href: "/dresses?cat=wrap" },
  { name: "Maxi Dress", href: "/dresses?cat=maxi" },
];

export default function CategoriesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const items = Array.from(
      section.querySelectorAll<HTMLElement>("[data-reveal]"),
    );

    // ── Langkah 1: set opacity 0 dulu sebelum browser paint ──
    // Pakai dua requestAnimationFrame supaya browser sempat render
    // elemen dulu, baru kita sembunyikan — mencegah "flash of visible"
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        items.forEach((el) => {
          el.style.opacity = "0";
          el.style.transform = "translateY(28px)";
          // Belum ada transition — supaya perubahan di atas instant
        });

        // ── Langkah 2: baru pasang observer ──
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (!entry.isIntersecting) return;

            items.forEach((el) => {
              const delay = parseFloat(el.dataset.delay ?? "0") * 1000;
              setTimeout(() => {
                // Aktifkan transition LALU ubah nilai
                el.style.transition = "opacity 0.8s ease, transform 0.8s ease";
                el.style.opacity = "1";
                el.style.transform = "translateY(0)";
              }, delay);
            });

            observer.disconnect();
          },
          // rootMargin negatif = animasi baru jalan saat elemen
          // sudah 80px masuk dari bawah viewport
          { threshold: 0, rootMargin: "0px 0px -80px 0px" },
        );

        observer.observe(section);
      });
    });

    return () => {};
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full h-screen flex flex-col justify-center bg-[#f0ebe3] overflow-hidden"
    >
      {/* ══════════════════════════
          MOBILE  (<md)
      ══════════════════════════ */}
      <div className="md:hidden flex flex-col items-center py-16 px-6 gap-10">
        <div className="flex flex-col items-center text-center w-full">
          <p
            data-reveal
            data-delay="0.05"
            className="font-sans text-[9px] tracking-[0.35em] uppercase text-stone-400 mb-6"
          >
            Browse Collection
          </p>

          <nav>
            <ul className="flex flex-col items-center">
              {categories.map((cat, i) => (
                <li
                  key={cat.name}
                  data-reveal
                  data-delay={String(0.15 + i * 0.1)}
                >
                  <a
                    href={cat.href}
                    className="block font-serif font-light leading-[1.15] text-[clamp(2rem,9vw,3rem)] text-stone-800 hover:text-stone-400 transition-colors duration-500"
                  >
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div
            data-reveal
            data-delay="0.75"
            className="mt-8 flex flex-col items-center gap-2"
          >
            <a
              href="/dresses"
              className="group flex items-center gap-2 font-sans text-[9px] tracking-[0.3em] uppercase text-stone-500 hover:text-stone-800 transition-colors duration-300"
            >
              <span className="text-stone-400 group-hover:text-stone-600">
                &rsaquo;
              </span>
              View Everything
            </a>
            <div className="w-8 h-px bg-stone-400" />
          </div>
        </div>

        <div className="flex gap-3 w-full">
          <div data-reveal data-delay="0.1" className="flex-1 mt-8">
            <div
              className="overflow-hidden w-full"
              style={{ aspectRatio: "3/4" }}
            >
              <div className="w-full h-full bg-[#c8bdb0] flex items-center justify-center">
                <span className="font-sans text-[8px] tracking-widest uppercase text-stone-400 rotate-90 whitespace-nowrap">
                  Foto kiri
                </span>
              </div>
            </div>
          </div>
          <div data-reveal data-delay="0.2" className="flex-1 -mt-4">
            <div
              className="overflow-hidden w-full"
              style={{ aspectRatio: "3/4" }}
            >
              <div className="w-full h-full bg-[#d4bfb0] flex items-center justify-center">
                <span className="font-sans text-[8px] tracking-widest uppercase text-stone-400 rotate-90 whitespace-nowrap">
                  Foto kanan
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════
          DESKTOP (≥md)
      ══════════════════════════ */}
      <div className="hidden md:flex items-stretch justify-center min-h-150 lg:min-h-170">
        {/* Foto kiri — align bawah */}
        <div
          data-reveal
          data-delay="0.1"
          className="flex items-end w-[18%] lg:w-[20%] pl-6 lg:pl-12 lg:ml-56 pb-12"
        >
          <div
            className="relative overflow-hidden w-full"
            style={{ aspectRatio: "3/4" }}
          >
            <div className="w-full h-full bg-[#c8bdb0] flex items-center justify-center">
              <Image
                src="/images/categories-section-1.webp"
                alt="Dress collection"
                fill
                className="object-cover object-top"
              />
            </div>
          </div>
        </div>

        {/* Teks tengah */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16">
          <p
            data-reveal
            data-delay="0.05"
            className="font-sans text-[10px] tracking-[0.35em] uppercase text-stone-400 mb-8"
          >
            Browse Collection
          </p>

          <nav>
            <ul className="flex flex-col items-center">
              {categories.map((cat, i) => (
                <li
                  key={cat.name}
                  data-reveal
                  data-delay={String(0.15 + i * 0.1)}
                >
                  <a
                    href={cat.href}
                    className="block font-serif font-light leading-[1.1] text-[clamp(2.4rem,3.8vw,3.8rem)] text-stone-800 hover:text-stone-400 transition-colors duration-500 tracking-[-0.01em] whitespace-nowrap"
                  >
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div
            data-reveal
            data-delay="0.75"
            className="mt-10 flex flex-col items-center gap-2"
          >
            <a
              href="/dresses"
              className="group flex items-center gap-2 font-sans text-[10px] tracking-[0.3em] uppercase text-stone-500 hover:text-stone-800 transition-colors duration-300"
            >
              <span className="text-stone-400 group-hover:text-stone-600">
                &rsaquo;
              </span>
              View Everything
            </a>
            <div className="w-8 h-px bg-stone-400" />
          </div>
        </div>

        {/* Foto kanan — align atas */}
        <div
          data-reveal
          data-delay="0.2"
          className="flex items-start w-[18%] lg:w-[20%] pr-6 lg:pr-12 lg:mr-56 pt-12"
        >
          <div
            className="relative overflow-hidden w-full"
            style={{ aspectRatio: "3/4" }}
          >
            <div className="w-full h-full bg-[#d4bfb0] flex items-center justify-center">
              <Image
                src="/images/categories-section-2.webp"
                alt="Dress collection"
                fill
                className="object-cover object-top"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
