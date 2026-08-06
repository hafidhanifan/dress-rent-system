"use client";

import { useRef, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  MotionValue,
} from "motion/react";

// isi quote yang muncul kata per kata seiring scroll
const QUOTE =
  "Every dress is a silent poem — it speaks of who you are before you say a word. Wear it with grace, move with confidence, and let every thread remind you that you were made to be seen, to be felt, and to be remembered.";
const AUTHOR = "NAIA DRESS";

export default function QuoteSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  // progress dihitung manual dari posisi scroll asli (bukan lewat useScroll motion) supaya tidak salah ukur kalau ada layout shift
  const scrollYProgress = useMotionValue(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateProgress = () => {
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const scrolled = -rect.top;
      const p = Math.min(1, Math.max(0, scrolled / total));
      scrollYProgress.set(p);
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    updateProgress();

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [scrollYProgress]);

  const words = QUOTE.split(" ");

  return (
    // tinggi 500vh, isinya sticky 100vh -> memberi jarak scroll yang cukup untuk animasi reveal per kata
    <div ref={containerRef} className="relative h-[500vh]">
      <div className="sticky top-0 h-screen w-full bg-[#f0ebe3] flex flex-col items-center justify-center px-6 md:px-16 lg:px-24 overflow-hidden">
        <p className="font-sans text-[9px] md:text-[10px] tracking-[0.35em] uppercase text-stone-400 mb-10 md:mb-14">
          Our Philosophy
        </p>

        <div className="flex flex-wrap justify-center gap-x-[0.35em] gap-y-[0.1em] max-w-4xl">
          {words.map((word, i) => (
            <WordReveal
              key={i}
              word={word}
              index={i}
              total={words.length}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </div>

        <AuthorReveal author={AUTHOR} scrollYProgress={scrollYProgress} />

        <ScrollIndicator scrollYProgress={scrollYProgress} />
      </div>
    </div>
  );
}

// satu kata quote, muncul (blur -> tajam) sesuai posisi scroll
function WordReveal({
  word,
  index,
  total,
  scrollYProgress,
}: {
  word: string;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  const BUFFER_START = 0.1;
  const BUFFER_END = 0.85;
  const range = BUFFER_END - BUFFER_START;

  const slotWidth = (range / total) * 1.4;

  const start = BUFFER_START + (index / total) * range;
  const end = Math.min(start + slotWidth, BUFFER_END + 0.05);

  const opacity = useTransform(scrollYProgress, [start, end], [0.15, 1]);

  const filter = useTransform(
    scrollYProgress,
    [start, end],
    ["blur(4px)", "blur(0px)"],
  );

  return (
    // wrapper span diperlukan buat memaksa browser repaint filter dengan benar saat berada di dalam flex-wrap
    <span style={{ position: "relative", display: "inline-block" }}>
      <motion.span
        className="font-serif font-light text-stone-800 leading-[1.15] tracking-[-0.01em]"
        style={{
          opacity,
          filter,
          fontSize: "clamp(1.4rem, 3.2vw, 3.4rem)",
          fontStyle: ["story", "grace,", "remembered."].includes(word)
            ? "italic"
            : "normal",
        }}
      >
        {word}
      </motion.span>
    </span>
  );
}

// nama author, muncul belakangan setelah semua kata selesai tampil
function AuthorReveal({
  author,
  scrollYProgress,
}: {
  author: string;
  scrollYProgress: MotionValue<number>;
}) {
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

// indikator "scroll" di bawah, cuma kelihatan di awal & pertengahan
function ScrollIndicator({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}) {
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
      <div className="w-px h-8 bg-stone-300 overflow-hidden relative">
        <div className="absolute inset-0 bg-stone-500 animate-scroll-line" />
      </div>
    </motion.div>
  );
}
