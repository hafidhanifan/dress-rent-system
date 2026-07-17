import Image from "next/image";

export default function HeroSection() {
  return (
    <section
      className="relative w-full h-screen overflow-hidden flex flex-col"
      style={{ background: "var(--user-bg)" }}
    >
      {/* ── Headline ── */}
      <div className="text-center pt-28 md:pt-32 px-4 shrink-0">
        <h1 className="font-serif leading-none tracking-tight">
          <span
            className="block text-[clamp(1.6rem,5vw,5rem)] font-light uppercase tracking-[0.12em]"
            style={{ color: "var(--user-text)" }}
          >
            Luxurious <em style={{ fontStyle: "italic" }}>and</em>
          </span>
          <span
            className="block text-[clamp(1.6rem,5vw,5rem)] font-light uppercase tracking-[0.12em]"
            style={{ color: "var(--user-text)" }}
          >
            Contemporary Appeal
          </span>
          <span
            className="block text-[clamp(1.2rem,3.5vw,3.8rem)] font-light tracking-[0.08em]"
            style={{ color: "var(--user-text)" }}
          >
            <span className="align-middle">— </span>
            <em className="italic text-[clamp(1.4rem,4vw,4.2rem)]">for</em>{" "}
            <span className="uppercase tracking-[0.12em]">Every Woman</span>
          </span>
        </h1>
      </div>

      {/* ── Kolase Foto — flex-1 mengisi sisa ruang ── */}
      <div className="relative flex items-end justify-center gap-1.5 md:gap-2 flex-1 min-h-0 mt-6 md:mt-8">
        {/* Foto 1 */}
        <div
          className="relative w-[22%] md:w-[18%] overflow-hidden shrink-0 -ml-2 md:-ml-4"
          style={{ height: "70%" }}
        >
          <Image
            src="/images/hero-section-1.jpg"
            alt="Dress collection"
            fill
            className="object-cover object-top"
          />
        </div>

        {/* Foto 2 — paling tinggi */}
        <div
          className="relative w-[28%] md:w-[24%] overflow-hidden shrink-0"
          style={{ height: "90%" }}
        >
          <Image
            src="/images/hero-section-3.jpg"
            alt="Dress collection"
            fill
            className="object-cover"
          />
        </div>

        {/* Foto 3 */}
        <div
          className="relative w-[28%] md:w-[24%] overflow-hidden shrink-0"
          style={{ height: "80%" }}
        >
          <Image
            src="/images/hero-section-2.jpg"
            alt="Dress collection"
            fill
            className="object-cover object-top"
          />
        </div>

        {/* Foto 4 */}
        <div
          className="relative w-[16%] md:w-[13%] overflow-hidden shrink-0"
          style={{ height: "60%" }}
        >
          <Image
            src="/images/hero-section-4.jpg"
            alt="Dress collection"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* ── Tagline bawah ── */}
      <div className="text-center py-4 md:py-6 shrink-0">
        <p
          className="font-sans text-[10px] md:text-[11px] tracking-[0.3em] uppercase"
          style={{ color: "var(--user-text-secondary)" }}
        >
          Rent the dress of your dreams
        </p>
      </div>
    </section>
  );
}
