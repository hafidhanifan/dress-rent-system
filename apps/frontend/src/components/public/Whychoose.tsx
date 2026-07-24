"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────
// Daftar keunggulan — ganti teks sesuai kebutuhan bisnismu
// ─────────────────────────────────────────────────────────────
const features = [
  {
    id: 1,
    title: "Curated Collections",
    desc: "Each dress is carefully selected from chosen designers — only the best for your most special moments.",
  },
  {
    id: 2,
    title: "Perfect Fit, Every Time",
    desc: "Our personalized sizing consultation ensures the dress you rent feels like it was made just for you.",
  },
  {
    id: 3,
    title: "Flexible Rental Periods",
    desc: "Rent from 1 day up to 1 week. We adjust to your schedule, not the other way around.",
  },
  {
    id: 4,
    title: "Delivered & Dry Cleaned",
    desc: "Your dress arrives in perfect condition, and we take care of the return and dry cleaning.",
  },
];

export default function WhyChooseSection() {
  const sectionRef = useRef<HTMLElement>(null);

  // ── Animasi scroll-in ──
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const items = Array.from(
      section.querySelectorAll<HTMLElement>("[data-reveal]"),
    );

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        items.forEach((el) => {
          el.style.opacity = "0";
          el.style.transform = "translateY(24px)";
          el.style.transition = "opacity 0s, transform 0s";
        });

        const observer = new IntersectionObserver(
          ([entry]) => {
            if (!entry.isIntersecting) return;
            items.forEach((el) => {
              const delay = parseFloat(el.dataset.delay ?? "0") * 1000;
              setTimeout(() => {
                el.style.transition = "opacity 0.8s ease, transform 0.8s ease";
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
      className="w-full overflow-hidden py-16 md:py-24 lg:py-32"
      style={{ background: "var(--user-bg)" }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        {/*
          Layout dua kolom:
          - Mobile  : foto atas, teks bawah (stack vertikal)
          - Desktop : foto kiri (55%), teks kanan (45%)
        */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-0 items-center lg:items-stretch">
          {/* ════════════════════════════
              KOLOM KIRI — Foto kolase
          ════════════════════════════ */}
          <div className="relative w-full lg:w-[55%] lg:pr-16">
            {/*
              Foto 1 — besar, pojok kiri atas
              Mengambil ~75% lebar kolom
            */}
            <div
              data-reveal
              data-delay="0.05"
              className="relative overflow-hidden w-[75%]"
              style={{ aspectRatio: "4/5" }}
            >
              <Image
                src="/images/why-us-1.webp"
                alt="Detail dress"
                fill
                className="object-cover"
              />
            </div>

            {/*
              Foto 2 — lebih kecil, overlap di pojok kanan bawah foto 1
              Posisi absolute: right-0, ditaruh di tengah-bawah foto 1
            */}
            <div
              data-reveal
              data-delay="0.15"
              className="
                absolute
                right-0 lg:right-12
                bottom-0
                w-[52%]
                overflow-hidden
                shadow-xl
              "
              style={{ aspectRatio: "3/4" }}
            >
              <Image
                src="/images/why-us-2.webp"
                alt="Dress model"
                fill
                className="object-cover object-top"
              />
            </div>

            {/*
              Dekorasi: angka besar samar di background
              Memberi kedalaman visual tanpa mengganggu foto
            */}
            <span
              className="
                absolute -bottom-6 left-0
                font-serif text-[8rem] md:text-[10rem] font-light
                leading-none select-none pointer-events-none
              "
              style={{ color: "var(--user-text-faint)", opacity: 0.4 }}
            >
              N
            </span>
          </div>

          {/* ════════════════════════════
              KOLOM KANAN — Konten teks
          ════════════════════════════ */}
          <div className="w-full lg:w-[45%] flex flex-col justify-center">
            {/* Garis dekoratif atas */}
            <div
              data-reveal
              data-delay="0.1"
              className="w-16 h-px mb-8"
              style={{ background: "var(--user-text-muted)" }}
            />

            {/* Judul */}
            <h2
              data-reveal
              data-delay="0.15"
              className="font-serif font-light leading-[1.1] mb-4"
              style={{
                fontSize: "clamp(2rem, 3.5vw, 3rem)",
                color: "var(--user-text)",
              }}
            >
              Why choose <em className="italic">Naia Dress?</em>
            </h2>

            {/* Subtitle */}
            <p
              data-reveal
              data-delay="0.2"
              className="font-sans font-light text-sm md:text-base leading-relaxed mb-10 md:mb-12 max-w-sm"
              style={{ color: "var(--user-text-secondary)" }}
            >
              We believe every woman deserves to look stunning — without having
              to own it all. Just rent, wear it, and shine.
            </p>

            {/* Daftar keunggulan */}
            <ul className="flex flex-col gap-6 md:gap-7 mb-10 md:mb-14">
              {features.map((f, i) => (
                <li
                  key={f.id}
                  data-reveal
                  data-delay={String(0.25 + i * 0.1)}
                  className="flex items-start gap-4"
                >
                  {/* Icon centang custom — SVG sederhana */}
                  <span className="shrink-0 mt-0.5">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* Lingkaran */}
                      <circle
                        cx="10"
                        cy="10"
                        r="9"
                        stroke="var(--user-text-muted)"
                        strokeWidth="1"
                      />
                      {/* Centang */}
                      <path
                        d="M6 10.5l2.5 2.5 5.5-6"
                        stroke="var(--user-text-muted)"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>

                  {/* Teks fitur */}
                  <div>
                    <p
                      className="font-sans text-[10px] tracking-[0.2em] uppercase mb-1"
                      style={{ color: "var(--user-text)" }}
                    >
                      {f.title}
                    </p>
                    <p
                      className="font-sans font-light text-sm leading-relaxed"
                      style={{ color: "var(--user-text-muted)" }}
                    >
                      {f.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Tombol CTA */}
            <div data-reveal data-delay="0.7">
              <Link
                href="/about"
                className="
                  group inline-flex items-center gap-4
                  font-sans text-[10px] tracking-[0.25em] uppercase
                "
                style={{ color: "var(--user-text-secondary)" }}
              >
                {/*
                  Tombol pill — background muda, border tipis
                  Hover: background sedikit lebih gelap
                */}
                <span
                  className="
                    px-8 py-3.5
                    rounded-full
                    transition-colors duration-300
                  "
                  style={{
                    background: "var(--user-bg-alt)",
                    border: "1px solid var(--user-border)",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = "var(--user-accent)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = "var(--user-bg-alt)")
                  }
                >
                  More About Us
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
