"use client";

/**
 * QuoteSection.tsx
 *
 * Cara kerja section ini:
 * 1. Section ini tingginya 300vh — tapi yang "kelihatan" hanya 100vh (sticky)
 * 2. Saat user scroll melewati 300vh tersebut, posisi visual tidak bergerak (sticky)
 * 3. Scroll progress (0–1) dikonversi jadi animasi opacity per kata
 * 4. Setelah semua kata muncul (scroll habis), baru bisa lanjut scroll ke bawah
 */

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

// ─────────────────────────────────────────
// Teks quote yang akan dianimasikan
// Dipisah per kata supaya bisa reveal satu per satu
// ─────────────────────────────────────────
const QUOTE =
  "Every dress is a silent poem — it speaks of who you are before you say a word. Wear it with grace, move with confidence, and let every thread remind you that you were made to be seen, to be felt, and to be remembered.";
const AUTHOR = "NAIA DRESS";

export default function QuoteSection() {
  // Ref ke container luar (yang tingginya 300vh)
  // Ini yang di-track posisi scroll-nya
  const containerRef = useRef<HTMLDivElement>(null);

  // useScroll dari Motion — melacak seberapa jauh container sudah di-scroll
  // scrollYProgress: 0 = belum masuk viewport, 1 = sudah terlewat
  const { scrollYProgress } = useScroll({
    target: containerRef,
    // "start start" = mulai hitung saat top container menyentuh top viewport
    // "end end"     = selesai hitung saat bottom container menyentuh bottom viewport
    offset: ["start start", "end end"],
  });

  // Pisah quote jadi array per kata: ["Every", "dress", "tells", ...]
  const words = QUOTE.split(" ");

  return (
    /**
     * Container luar — tinggi 300vh
     * Fungsinya: memberi "ruang scroll" yang panjang
     * Semakin tinggi nilai ini, semakin lambat animasinya
     */
    <div ref={containerRef} className="relative h-[500vh]">
      {/**
       * Container dalam — sticky, tinggi 100vh
       * "sticky top-0" = elemen ini akan "nempel" di atas viewport
       * selama user scroll melewati container luar
       * Jadi visual tidak bergerak, tapi scroll progress terus berjalan
       */}
      <div className="sticky top-0 h-screen w-full bg-[#f0ebe3] flex flex-col items-center justify-center px-6 md:px-16 lg:px-24 overflow-hidden">
        {/* Label kecil atas */}
        <p className="font-sans text-[9px] md:text-[10px] tracking-[0.35em] uppercase text-stone-400 mb-10 md:mb-14">
          Our Philosophy
        </p>

        {/**
         * Wrapper teks quote
         * flex-wrap supaya kata-kata bisa turun ke baris berikutnya
         * gap-x untuk jarak antar kata, gap-y untuk jarak antar baris
         */}
        <div className="flex flex-wrap justify-center gap-x-[0.35em] gap-y-[0.1em] max-w-4xl">
          {words.map((word, i) => (
            /**
             * Setiap kata dibungkus <WordReveal>
             * Masing-masing kata dapat range progress sendiri
             * supaya reveal-nya stagger (tidak muncul semua sekaligus)
             */
            <WordReveal
              key={i}
              word={word}
              index={i}
              total={words.length}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </div>

        {/* Author / sumber quote — muncul setelah semua kata tampil */}
        <AuthorReveal author={AUTHOR} scrollYProgress={scrollYProgress} />

        {/* Indikator scroll di pojok bawah */}
        <ScrollIndicator scrollYProgress={scrollYProgress} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Komponen: satu kata dengan animasi opacity
// ─────────────────────────────────────────
function WordReveal({
  word,
  index,
  total,
  scrollYProgress,
}: {
  word: string;
  index: number;
  total: number;
  scrollYProgress: any;
}) {
  /**
   * Hitung kapan kata ini mulai dan selesai muncul
   *
   * Kita bagi progress (0–1) jadi slot per kata
   * Tapi ada overlap supaya tidak terasa terputus-putus
   *
   * Contoh dengan 10 kata:
   * kata ke-0: muncul di progress 0.00 – 0.15
   * kata ke-1: muncul di progress 0.08 – 0.23
   * kata ke-2: muncul di progress 0.16 – 0.31
   * dst...
   *
   * Kita sisakan 30% progress awal & akhir sebagai "buffer"
   * supaya ada jeda sebelum animasi mulai dan sesudah selesai
   */
  const BUFFER_START = 0.1; // animasi mulai di 10% scroll
  const BUFFER_END = 0.85; // animasi selesai di 85% scroll
  const range = BUFFER_END - BUFFER_START;

  // Lebar satu slot kata (dengan overlap 40%)
  const slotWidth = (range / total) * 1.4;

  // Titik mulai kata ini
  const start = BUFFER_START + (index / total) * range;
  // Titik selesai kata ini
  const end = Math.min(start + slotWidth, BUFFER_END + 0.05);

  /**
   * useTransform: konversi scrollYProgress (0–1) jadi opacity (0.15–1)
   * - Saat progress < start → opacity 0.15 (samar)
   * - Saat progress > end   → opacity 1    (penuh)
   */
  const opacity = useTransform(scrollYProgress, [start, end], [0.15, 1]);

  /**
   * Efek blur ringan — kata samar = sedikit blur, kata jelas = tidak blur
   * Bikin efek "focus" yang dramatis
   */
  const filter = useTransform(
    scrollYProgress,
    [start, end],
    ["blur(4px)", "blur(0px)"],
  );

  return (
    <motion.span
      style={{ opacity, filter }}
      /**
       * Font serif besar, clamp untuk responsive:
       * - min: 2rem  (mobile kecil)
       * - ideal: 4.5vw
       * - max: 4.5rem (desktop besar)
       */
      className="font-serif font-[300] text-stone-800 leading-[1.15] tracking-[-0.01em]"
      style={{
        opacity,
        filter,
        fontSize: "clamp(1.4rem, 3.2vw, 3.4rem)",
        // Italic untuk kata tertentu supaya lebih dramatis
        fontStyle: ["story", "grace,", "magic."].includes(word)
          ? "italic"
          : "normal",
      }}
    >
      {word}
    </motion.span>
  );
}

// ─────────────────────────────────────────
// Komponen: author — muncul di akhir
// ─────────────────────────────────────────
function AuthorReveal({
  author,
  scrollYProgress,
}: {
  author: string;
  scrollYProgress: any;
}) {
  // Muncul di 85–95% progress (setelah semua kata tampil)
  const opacity = useTransform(scrollYProgress, [0.82, 0.95], [0, 1]);
  const y = useTransform(scrollYProgress, [0.82, 0.95], [12, 0]);

  return (
    <motion.p
      style={{ opacity, y }}
      className="mt-10 md:mt-14 font-sans text-[9px] md:text-[10px] tracking-[0.3em] uppercase text-stone-400"
    >
      — {author}
    </motion.p>
  );
}

// ─────────────────────────────────────────
// Komponen: indikator scroll bawah
// Menghilang saat sudah hampir selesai
// ─────────────────────────────────────────
function ScrollIndicator({ scrollYProgress }: { scrollYProgress: any }) {
  // Hilang di 85% progress
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.1, 0.8, 0.9],
    [0, 1, 1, 0],
  );

  return (
    <motion.div
      style={{ opacity }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
    >
      <span className="font-sans text-[8px] tracking-[0.3em] uppercase text-stone-400">
        Scroll
      </span>
      {/* Animasi garis turun — CSS keyframes */}
      <div className="w-[1px] h-8 bg-stone-300 overflow-hidden relative">
        <div className="absolute inset-0 bg-stone-500 animate-scroll-line" />
      </div>
    </motion.div>
  );
}
