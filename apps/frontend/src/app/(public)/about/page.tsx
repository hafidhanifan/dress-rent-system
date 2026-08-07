"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const stats = [
  { value: "500+", label: "Gaun Terkurasi" },
  { value: "2.4K", label: "Penyewaan Selesai" },
  { value: "4.9", label: "Rating Rata-rata" },
  { value: "2021", label: "Tahun Berdiri" },
];

const process = [
  {
    num: "01",
    title: "Jelajahi & Pilih",
    desc: "Telusuri koleksi kami yang terkurasi — dari gaun pengantin klasik hingga potongan kontemporer untuk momen spesialmu. Setiap gaun punya cerita, tinggal temukan yang cocok denganmu.",
    img: "/images/about-process-1.jpg",
  },
  {
    num: "02",
    title: "Sewa Sesuai Jadwalmu",
    desc: "Pilih tanggal, kami siapkan. Fleksibel dari satu hari hingga satu minggu — kami menyesuaikan dengan acaramu, bukan sebaliknya.",
    img: "/images/about-process-2.jpg",
  },
  {
    num: "03",
    title: "Pakai, Kembalikan, Selesai",
    desc: "Gaun tiba dalam kondisi sempurna. Setelah acara usai, kami yang urus pengembalian dan dry cleaning — tidak ada yang perlu kamu pikirkan lagi.",
    img: "/images/about-process-3.jpg",
  },
];

export default function AboutPage() {
  const pageRef = useRef<HTMLDivElement>(null);

  // animasi scroll-reveal untuk seluruh halaman, sama seperti section homepage
  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;

    const items = Array.from(
      root.querySelectorAll<HTMLElement>("[data-reveal]"),
    );

    items.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(28px)";
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const delay = parseFloat(el.dataset.delay ?? "0") * 1000;
          setTimeout(() => {
            el.style.transition = "opacity 0.8s ease, transform 0.8s ease";
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
          }, delay);
          observer.unobserve(el);
        });
      },
      { threshold: 0, rootMargin: "0px 0px -60px 0px" },
    );

    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={pageRef} style={{ background: "var(--user-bg)" }}>
      <HeroSection />
      <StorySection />
      <StatsSection />
      <ProcessSection />
      <CraftSection />
      <CtaSection />
    </div>
  );
}

// judul besar + foto utama di atas halaman
function HeroSection() {
  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 px-6 md:px-12 lg:px-20 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end gap-10 lg:gap-16">
          <div className="lg:w-[52%]">
            <p
              data-reveal
              data-delay="0.05"
              className="font-sans text-[9px] md:text-[10px] tracking-[0.35em] uppercase mb-6"
              style={{ color: "var(--user-text-muted)" }}
            >
              About Naia
            </p>
            <h1
              data-reveal
              data-delay="0.12"
              className="font-serif font-light leading-[1.05] tracking-[-0.01em]"
              style={{
                fontSize: "clamp(2.4rem, 5.5vw, 4.6rem)",
                color: "var(--user-text)",
              }}
            >
              Every dress carries
              <br />a story <em className="italic">we help</em>
              <br />
              you find.
            </h1>
            <p
              data-reveal
              data-delay="0.22"
              className="font-sans font-light text-sm md:text-base leading-relaxed mt-8 max-w-md"
              style={{ color: "var(--user-text-secondary)" }}
            >
              Naia lahir dari satu pertanyaan sederhana — kenapa momen istimewa
              harus dibatasi oleh lemari pakaian? Kami percaya gaun terbaik
              adalah yang membuatmu merasa jadi dirimu sendiri, sekali pakai
              atau seribu kali.
            </p>
          </div>

          <div data-reveal data-delay="0.15" className="lg:w-[48%] relative">
            <div
              className="relative overflow-hidden w-full"
              style={{ aspectRatio: "4/5", background: "var(--user-border)" }}
            >
              <Image
                src="/images/about-hero.jpg"
                alt="Naia Dress"
                fill
                className="object-cover object-top"
                priority
              />
            </div>
            <span
              className="absolute -bottom-6 -left-4 font-serif font-light leading-none select-none pointer-events-none hidden md:block"
              style={{
                fontSize: "7rem",
                color: "var(--user-text-faint)",
                opacity: 0.5,
              }}
            >
              N
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

// cerita berdirinya naia, foto kolase kiri + teks kanan
function StorySection() {
  return (
    <section className="px-6 md:px-12 lg:px-20 py-16 md:py-28">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div
          data-reveal
          data-delay="0.05"
          className="relative order-2 lg:order-1"
        >
          <div
            className="relative overflow-hidden w-[80%]"
            style={{ aspectRatio: "3/4", background: "var(--user-border)" }}
          >
            <Image
              src="/images/about-story-1.jpg"
              alt="Detail kain"
              fill
              className="object-cover"
            />
          </div>
          <div
            className="absolute right-0 bottom-0 overflow-hidden w-[48%] shadow-xl"
            style={{ aspectRatio: "3/4", background: "var(--user-border)" }}
          >
            <Image
              src="/images/about-story-2.jpg"
              alt="Model gaun"
              fill
              className="object-cover object-top"
            />
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <p
            data-reveal
            data-delay="0.05"
            className="font-sans text-[9px] tracking-[0.35em] uppercase mb-6"
            style={{ color: "var(--user-text-muted)" }}
          >
            Sejak 2021
          </p>
          <h2
            data-reveal
            data-delay="0.12"
            className="font-serif font-light leading-[1.15] mb-6"
            style={{
              fontSize: "clamp(1.8rem, 3.2vw, 2.8rem)",
              color: "var(--user-text)",
            }}
          >
            Dimulai dari kamar tidur, tumbuh jadi{" "}
            <em className="italic">rumah bagi ribuan gaun.</em>
          </h2>
          <p
            data-reveal
            data-delay="0.2"
            className="font-sans font-light text-sm md:text-base leading-relaxed mb-5"
            style={{ color: "var(--user-text-secondary)" }}
          >
            Naia dimulai dari koleksi pribadi — beberapa gaun yang dipinjamkan
            ke teman dan keluarga untuk acara penting mereka. Ternyata,
            permintaan itu tidak pernah berhenti.
          </p>
          <p
            data-reveal
            data-delay="0.28"
            className="font-sans font-light text-sm md:text-base leading-relaxed"
            style={{ color: "var(--user-text-secondary)" }}
          >
            Sekarang, kami merawat ratusan gaun — masing-masing dipilih dengan
            detail, diperlakukan seperti pusaka, dan menunggu giliran menemani
            momen berharga berikutnya.
          </p>
        </div>
      </div>
    </section>
  );
}

// strip angka besar (jumlah gaun, penyewaan, rating, tahun berdiri)
function StatsSection() {
  return (
    <section
      className="py-14 md:py-20 px-6 md:px-12 lg:px-20"
      style={{
        borderTop: "1px solid var(--user-border)",
        borderBottom: "1px solid var(--user-border)",
      }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            data-reveal
            data-delay={String(0.05 + i * 0.08)}
            className="text-center py-6 md:py-0"
            style={{
              borderLeft: i !== 0 ? "1px solid var(--user-border)" : "none",
            }}
          >
            <p
              className="font-serif font-light leading-none mb-2"
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                color: "var(--user-text)",
              }}
            >
              {s.value}
            </p>
            <p
              className="font-sans text-[9px] tracking-[0.25em] uppercase"
              style={{ color: "var(--user-text-muted)" }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// 3 langkah cara sewa, foto & teks bergantian kiri-kanan
function ProcessSection() {
  return (
    <section className="px-6 md:px-12 lg:px-20 py-16 md:py-28">
      <div className="max-w-7xl mx-auto">
        <div className="mb-14 md:mb-20 text-center">
          <p
            data-reveal
            data-delay="0.05"
            className="font-sans text-[9px] tracking-[0.35em] uppercase mb-5"
            style={{ color: "var(--user-text-muted)" }}
          >
            Cara Kerja
          </p>
          <h2
            data-reveal
            data-delay="0.12"
            className="font-serif font-light leading-[1.1]"
            style={{
              fontSize: "clamp(1.8rem, 3.5vw, 3rem)",
              color: "var(--user-text)",
            }}
          >
            Sesederhana <em className="italic">tiga langkah.</em>
          </h2>
        </div>

        <div className="flex flex-col gap-16 md:gap-24">
          {process.map((step, i) => (
            <ProcessStep key={step.num} step={step} reversed={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessStep({
  step,
  reversed,
}: {
  step: (typeof process)[number];
  reversed: boolean;
}) {
  return (
    <div
      className={`flex flex-col lg:flex-row gap-8 lg:gap-16 items-center ${reversed ? "lg:flex-row-reverse" : ""}`}
    >
      <div
        data-reveal
        data-delay="0.05"
        className="lg:w-1/2 relative overflow-hidden w-full"
        style={{ aspectRatio: "16/10", background: "var(--user-border)" }}
      >
        <Image src={step.img} alt={step.title} fill className="object-cover" />
      </div>

      <div className="lg:w-1/2" data-reveal data-delay="0.15">
        <span
          className="font-serif font-light leading-none block mb-4"
          style={{
            fontSize: "clamp(2.4rem, 4vw, 3.4rem)",
            color: "var(--user-text-faint)",
          }}
        >
          {step.num}
        </span>
        <h3
          className="font-serif font-light leading-[1.2] mb-4"
          style={{
            fontSize: "clamp(1.4rem, 2.2vw, 1.9rem)",
            color: "var(--user-text)",
          }}
        >
          {step.title}
        </h3>
        <p
          className="font-sans font-light text-sm md:text-base leading-relaxed max-w-md"
          style={{ color: "var(--user-text-secondary)" }}
        >
          {step.desc}
        </p>
      </div>
    </div>
  );
}

// cerita perawatan gaun, foto kolase kanan + teks kiri
function CraftSection() {
  return (
    <section className="px-6 md:px-12 lg:px-20 py-16 md:py-28">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
        <div className="lg:w-[45%]">
          <p
            data-reveal
            data-delay="0.05"
            className="font-sans text-[9px] tracking-[0.35em] uppercase mb-6"
            style={{ color: "var(--user-text-muted)" }}
          >
            Dirawat, Bukan Sekadar Disewakan
          </p>
          <h2
            data-reveal
            data-delay="0.12"
            className="font-serif font-light leading-[1.15] mb-6"
            style={{
              fontSize: "clamp(1.8rem, 3.2vw, 2.8rem)",
              color: "var(--user-text)",
            }}
          >
            Setiap gaun diperlakukan{" "}
            <em className="italic">seperti pusaka keluarga.</em>
          </h2>
          <p
            data-reveal
            data-delay="0.2"
            className="font-sans font-light text-sm md:text-base leading-relaxed mb-5"
            style={{ color: "var(--user-text-secondary)" }}
          >
            Sebelum sampai ke tanganmu, setiap gaun melalui pemeriksaan detail —
            jahitan, kain, hingga aksesoris kecil sekalipun. Setelah dipakai,
            kami bawa ke dry cleaning khusus yang memahami cara merawat
            bahan-bahan halus.
          </p>
          <p
            data-reveal
            data-delay="0.28"
            className="font-sans font-light text-sm md:text-base leading-relaxed"
            style={{ color: "var(--user-text-secondary)" }}
          >
            Karena gaun yang baik seharusnya bisa dipakai lagi dan lagi — oleh
            siapa pun yang membutuhkan momennya sendiri.
          </p>
        </div>

        <div
          data-reveal
          data-delay="0.15"
          className="lg:w-[55%] relative w-full"
        >
          <div
            className="relative overflow-hidden w-[70%]"
            style={{ aspectRatio: "3/4", background: "var(--user-border)" }}
          >
            <Image
              src="/images/about-craft-1.jpg"
              alt="Perawatan gaun"
              fill
              className="object-cover"
            />
          </div>
          <div
            className="absolute left-[55%] top-[15%] overflow-hidden w-[45%] shadow-xl"
            style={{ aspectRatio: "4/5", background: "var(--user-border)" }}
          >
            <Image
              src="/images/about-craft-2.jpg"
              alt="Detail jahitan"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// panel gelap penutup halaman, ajakan lihat koleksi
function CtaSection() {
  return (
    <section
      className="relative overflow-hidden px-6 md:px-12 py-20 md:py-28 text-center"
      style={{ background: "#1a1714" }}
    >
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          backgroundSize: "200px",
        }}
      />

      <div className="relative max-w-2xl mx-auto">
        <p
          data-reveal
          data-delay="0.05"
          className="font-sans text-[9px] tracking-[0.35em] uppercase mb-6"
          style={{ color: "#d4b478" }}
        >
          Siap Menemukan Gaunmu?
        </p>
        <h2
          data-reveal
          data-delay="0.12"
          className="font-serif font-light leading-[1.15] mb-10"
          style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", color: "#e8ddc8" }}
        >
          Momen istimewamu menunggu{" "}
          <em className="italic" style={{ color: "#d4b478" }}>
            gaun yang tepat.
          </em>
        </h2>
        <div data-reveal data-delay="0.2">
          <Link
            href="/dresses"
            className="inline-block font-sans text-[10px] tracking-[0.3em] uppercase px-10 py-4 transition-all duration-300"
            style={{
              border: "1px solid rgba(212,180,120,0.4)",
              color: "#e8ddc8",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(212,180,120,0.1)";
              e.currentTarget.style.borderColor = "rgba(212,180,120,0.7)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "rgba(212,180,120,0.4)";
            }}
          >
            Jelajahi Koleksi
          </Link>
        </div>
      </div>
    </section>
  );
}
