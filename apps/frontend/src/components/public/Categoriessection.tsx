"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

type Category = { id: number; name: string; slug: string; isActive: boolean };

export default function CategoriesSection({
  categories,
}: {
  categories: Category[];
}) {
  const sectionRef = useRef<HTMLElement>(null);

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
          el.style.transform = "translateY(28px)";
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
          { threshold: 0, rootMargin: "0px 0px -80px 0px" },
        );

        observer.observe(section);
      });
    });

    return () => {};
  }, [categories]);

  return (
    <section
      ref={sectionRef}
      className="w-full h-screen flex flex-col justify-center overflow-hidden"
      style={{ background: "var(--user-bg)" }}
    >
      {/* ══════════════════════════
          MOBILE  (<md)
      ══════════════════════════ */}
      <div className="md:hidden flex flex-col items-center py-16 px-6 gap-10">
        <div className="flex flex-col items-center text-center w-full">
          <p
            data-reveal
            data-delay="0.05"
            className="font-sans text-[9px] tracking-[0.35em] uppercase mb-6"
            style={{ color: "var(--user-text-muted)" }}
          >
            Browse Collection
          </p>

          <nav>
            <ul className="flex flex-col items-center">
              {categories.map((cat, i) => (
                <li
                  key={cat.id}
                  data-reveal
                  data-delay={String(0.15 + i * 0.1)}
                >
                  {/* link ke /dresses dengan query ?cat=slug -> auto-filter */}
                  <a
                    href={`/dresses?cat=${cat.slug}`}
                    className="block font-serif font-light leading-[1.15] text-[clamp(2rem,9vw,3rem)] transition-colors duration-500"
                    style={{ color: "var(--user-text)" }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.color = "var(--user-text-muted)")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.color = "var(--user-text)")
                    }
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
            <Link
              href="/dresses"
              className="group flex items-center gap-2 font-sans text-[9px] tracking-[0.3em] uppercase transition-colors duration-300"
              style={{ color: "var(--user-text-secondary)" }}
            >
              <span style={{ color: "var(--user-text-muted)" }}>&rsaquo;</span>
              View Everything
            </Link>
            <div
              className="w-8 h-px"
              style={{ background: "var(--user-text-muted)" }}
            />
          </div>
        </div>

        <div className="flex gap-3 w-full">
          <div data-reveal data-delay="0.1" className="flex-1 mt-8">
            <div
              className="relative overflow-hidden w-full"
              style={{ aspectRatio: "3/4" }}
            >
              <Image
                src="/images/categories-section-1.webp"
                alt="Dress collection"
                fill
                className="object-cover object-top"
              />
            </div>
          </div>
          <div data-reveal data-delay="0.2" className="flex-1 -mt-4">
            <div
              className="relative overflow-hidden w-full"
              style={{ aspectRatio: "3/4" }}
            >
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

      {/* ══════════════════════════
          DESKTOP (≥md)
      ══════════════════════════ */}
      <div className="hidden md:flex items-stretch justify-center min-h-150 lg:min-h-170">
        <div
          data-reveal
          data-delay="0.1"
          className="flex items-end w-[18%] lg:w-[20%] pl-6 lg:pl-12 lg:ml-56 pb-12"
        >
          <div
            className="relative overflow-hidden w-full"
            style={{ aspectRatio: "3/4" }}
          >
            <Image
              src="/images/categories-section-1.webp"
              alt="Dress collection"
              fill
              className="object-cover object-top"
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16">
          <p
            data-reveal
            data-delay="0.05"
            className="font-sans text-[10px] tracking-[0.35em] uppercase mb-8"
            style={{ color: "var(--user-text-muted)" }}
          >
            Browse Collection
          </p>

          <nav>
            <ul className="flex flex-col items-center">
              {categories.map((cat, i) => (
                <li
                  key={cat.id}
                  data-reveal
                  data-delay={String(0.15 + i * 0.1)}
                >
                  <a
                    href={`/dresses?cat=${cat.slug}`}
                    className="block font-serif font-light leading-[1.1] text-[clamp(2.4rem,3.8vw,3.8rem)] transition-colors duration-500 tracking-[-0.01em] whitespace-nowrap"
                    style={{ color: "var(--user-text)" }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.color = "var(--user-text-muted)")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.color = "var(--user-text)")
                    }
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
            <Link
              href="/dresses"
              className="group flex items-center gap-2 font-sans text-[10px] tracking-[0.3em] uppercase transition-colors duration-300"
              style={{ color: "var(--user-text-secondary)" }}
            >
              <span style={{ color: "var(--user-text-muted)" }}>&rsaquo;</span>
              View Everything
            </Link>
            <div
              className="w-8 h-px"
              style={{ background: "var(--user-text-muted)" }}
            />
          </div>
        </div>

        <div
          data-reveal
          data-delay="0.2"
          className="flex items-start w-[18%] lg:w-[20%] pr-6 lg:pr-12 lg:mr-56 pt-12"
        >
          <div
            className="relative overflow-hidden w-full"
            style={{ aspectRatio: "3/4" }}
          >
            <Image
              src="/images/categories-section-2.webp"
              alt="Dress collection"
              fill
              className="object-cover object-top"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
