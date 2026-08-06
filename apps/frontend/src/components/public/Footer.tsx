"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";

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

const bottomLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Instagram", href: "https://instagram.com" },
];

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

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
      className="w-full"
      style={{ background: "var(--user-bg-alt)" }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16 md:py-20 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          <div data-reveal data-delay="0.05" className="lg:pr-8">
            <h2
              className="font-serif font-light leading-[1.05]"
              style={{
                fontSize: "clamp(2.4rem, 4vw, 3.4rem)",
                color: "var(--user-text-secondary)",
              }}
            >
              Need <br />
              <em className="italic">Help?</em>
            </h2>
            <div
              className="w-10 h-px mt-5"
              style={{ background: "var(--user-text-muted)" }}
            />
          </div>

          {footerColumns.map((col, i) => (
            <div
              key={col.id}
              data-reveal
              data-delay={String(0.1 + i * 0.1)}
              className="flex flex-col"
            >
              <p
                className="font-sans text-[11px] font-medium tracking-[0.15em] uppercase mb-3"
                style={{ color: "var(--user-text-secondary)" }}
              >
                {col.heading}
              </p>
              <p
                className="font-sans font-light text-sm leading-relaxed mb-6 flex-1"
                style={{ color: "var(--user-text-muted)" }}
              >
                {col.desc}
              </p>

              <div>
                <Link
                  href={col.linkHref}
                  className="group inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.25em] uppercase transition-colors duration-300"
                  style={{ color: "var(--user-accent-alt)" }}
                >
                  <span
                    className="transition-colors"
                    style={{ color: "var(--user-accent)" }}
                  >
                    &rsaquo;
                  </span>
                  {col.linkLabel}
                </Link>
                <div
                  className="w-10 h-px mt-2 group-hover:w-14 transition-all duration-300"
                  style={{ background: "var(--user-accent)" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div
          className="w-full h-px"
          style={{ background: "var(--user-border)" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div
            data-reveal
            data-delay="0.05"
            className="flex items-center gap-3"
          >
            <span
              className="font-serif text-sm font-light tracking-[0.2em] uppercase"
              style={{ color: "var(--user-text-secondary)" }}
            >
              Naia Dress
            </span>
            <span style={{ color: "var(--user-text-faint)" }}>·</span>
            <span
              className="font-sans text-[10px] tracking-wide"
              style={{ color: "var(--user-text-muted)" }}
            >
              © {new Date().getFullYear()} All rights reserved
            </span>
          </div>

          <nav data-reveal data-delay="0.15">
            <ul className="flex items-center gap-5 md:gap-6">
              {bottomLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-sans text-[10px] tracking-[0.15em] uppercase transition-colors duration-300"
                    style={{ color: "var(--user-text-muted)" }}
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
