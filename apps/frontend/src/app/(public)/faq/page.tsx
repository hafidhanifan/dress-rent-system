"use client";

// src/app/(public)/faq/page.tsx

import { useState, useMemo } from "react";
import Link from "next/link";

type FaqItem = { q: string; a: string };
type FaqCategory = { id: string; label: string; items: FaqItem[] };

const categories: FaqCategory[] = [
  {
    id: "pemesanan",
    label: "Pemesanan & Pembayaran",
    items: [
      {
        q: "Bagaimana cara menyewa gaun di Naia?",
        a: 'Pilih gaun yang kamu suka, tentukan ukuran dan tanggal sewa di halaman detail produk, lalu lanjutkan ke checkout. Setelah pembayaran berhasil lewat Midtrans (transfer bank, e-wallet, QRIS, atau kartu kredit), pesananmu akan berstatus "Menunggu Konfirmasi" — tim kami akan mengonfirmasi dalam 1x24 jam dan menyiapkan gaunmu.',
      },
      {
        q: "Berapa lama sebelum acara saya harus memesan?",
        a: "Kami sarankan memesan minimal H-7 sebelum acara supaya ada cukup waktu untuk pengecekan dan pengiriman. Pemesanan mendadak (H-1 atau H-2) tetap bisa dilakukan selama ukuran dan tanggal yang kamu pilih masih tersedia di sistem — kalau sudah tidak ada slot, sistem otomatis akan menandainya sebagai tidak tersedia.",
      },
      {
        q: "Metode pembayaran apa saja yang bisa saya pakai?",
        a: "Kami menerima transfer virtual account (BCA, BNI, BRI, Mandiri, dan bank lainnya), e-wallet (GoPay, OVO, DANA, ShopeePay), QRIS, serta kartu kredit/debit — semuanya diproses aman lewat Midtrans sebagai payment gateway resmi.",
      },
      {
        q: "Apakah saya bisa membatalkan atau mengubah tanggal pesanan?",
        a: 'Pesanan yang masih berstatus "Menunggu Pembayaran" bisa dibatalkan sendiri lewat halaman Pesanan Saya. Untuk perubahan tanggal setelah pembayaran berhasil, hubungi admin kami minimal H-2 sebelum tanggal mulai sewa — perubahan tunduk pada ketersediaan gaun di tanggal baru yang kamu minta.',
      },
      {
        q: "Bagaimana kalau ukuran yang saya pilih ternyata kurang pas?",
        a: "Setiap gaun punya detail ukuran lengkap (lingkar dada, pinggang, pinggul, dan panjang) di halaman produk — kami sarankan mengukur badan sendiri dulu sebelum memesan. Kalau setelah pesan kamu ragu dengan ukuran yang dipilih, segera hubungi admin sebelum tanggal pengiriman; penukaran ukuran masih bisa dilakukan selama stok ukuran lain tersedia.",
      },
    ],
  },
  {
    id: "pengiriman",
    label: "Pengambilan & Pengiriman",
    items: [
      {
        q: "Apakah gaun dikirim, atau saya harus mengambil sendiri?",
        a: "Keduanya bisa. Kami menyediakan layanan antar untuk wilayah Semarang dan sekitarnya, atau kamu bisa mengambil langsung di studio kami sesuai jadwal yang disepakati. Pilihan ini bisa dikonfirmasi lewat chat admin setelah pesanan dibuat.",
      },
      {
        q: "Berapa biaya pengiriman?",
        a: "Pengiriman gratis untuk area dalam kota Semarang. Untuk area di luar itu, akan dikenakan biaya tambahan sesuai jarak yang dihitung saat konfirmasi pesanan — admin akan menginformasikan nominalnya sebelum gaun dikirim.",
      },
      {
        q: "Kapan gaun akan saya terima?",
        a: "Gaun biasanya dikirim atau siap diambil H-1 sebelum tanggal mulai sewa, supaya kamu punya waktu untuk mengecek kondisi dan mencoba sebelum hari-H. Untuk pemesanan mendadak, waktu pengiriman akan disesuaikan dan dikonfirmasi langsung oleh admin.",
      },
      {
        q: "Apa yang harus saya lakukan begitu gaun sampai?",
        a: "Segera periksa kondisi gaun — jahitan, kebersihan, dan kelengkapan aksesorisnya. Kalau ada hal yang tidak sesuai, laporkan ke admin dalam 3 jam setelah gaun diterima supaya bisa segera kami tindak lanjuti sebelum acaramu berlangsung.",
      },
    ],
  },
  {
    id: "pengembalian",
    label: "Pengembalian & Denda",
    items: [
      {
        q: "Kapan saya harus mengembalikan gaun?",
        a: "Gaun harus dikembalikan paling lambat pada tanggal selesai sewa yang tertera di halaman pesananmu, maksimal pukul 20.00 WIB pada hari tersebut — baik lewat pengambilan oleh kurir kami maupun diantar sendiri ke studio.",
      },
      {
        q: "Bagaimana cara mengembalikan gaun?",
        a: "Kamu bisa mengantar langsung ke studio Naia, atau menjadwalkan penjemputan oleh kurir kami (biaya sama seperti tarif pengiriman). Jadwal penjemputan bisa diatur lewat chat admin minimal 1 hari sebelum tanggal pengembalian.",
      },
      {
        q: "Apa yang terjadi kalau saya terlambat mengembalikan?",
        a: "Keterlambatan dikenakan denda sebesar 50% dari harga sewa per hari, dihitung mulai hari pertama setelah tanggal jatuh tempo. Contoh: kalau harga sewa Rp 300.000/hari dan kamu telat 2 hari, dendanya Rp 300.000 (2 hari × Rp 150.000). Kalau keterlambatan lebih dari 5 hari tanpa konfirmasi, gaun akan dianggap hilang dan dikenakan biaya penggantian penuh sesuai harga gaun.",
      },
      {
        q: "Bagaimana kalau gaun kotor atau rusak saat dikembalikan?",
        a: "Noda ringan yang wajar (bekas riasan, keringat, debu) sudah termasuk dalam biaya sewa — dry cleaning menjadi tanggung jawab kami. Untuk kerusakan seperti robek, jahitan lepas parah, atau noda permanen yang tidak bisa dibersihkan, kamu akan dikenakan biaya perbaikan sesuai tingkat kerusakan, atau biaya penggantian penuh kalau gaun sudah tidak bisa diperbaiki.",
      },
      {
        q: "Apakah saya perlu membayar deposit di awal?",
        a: "Untuk sebagian besar gaun, kami tidak mewajibkan deposit terpisah — cukup pembayaran sewa penuh di muka. Untuk gaun dengan kategori premium atau harga tinggi, admin kami mungkin akan menginformasikan kebijakan deposit tambahan secara khusus saat konfirmasi pesanan.",
      },
    ],
  },
  {
    id: "ukuran",
    label: "Ukuran & Ketersediaan",
    items: [
      {
        q: "Bagaimana saya tahu ukuran yang tepat untuk saya?",
        a: "Setiap halaman detail gaun menampilkan ukuran lengkap per label (S, M, L, dst) meliputi lingkar dada, pinggang, pinggul, dan panjang gaun dalam sentimeter. Ukur badanmu dengan meteran kain dan bandingkan dengan angka tersebut — kalau masih ragu, chat admin kami untuk konsultasi ukuran secara personal.",
      },
      {
        q: "Bagaimana kalau ukuran saya di antara dua pilihan?",
        a: "Kami sarankan memilih ukuran yang sedikit lebih besar, karena penyesuaian kecil (misalnya dengan peniti mode atau clip) lebih mudah dilakukan dibanding gaun yang terlalu ketat. Tim kami juga bisa membantu menyarankan ukuran terbaik berdasarkan detail ukuran badanmu.",
      },
      {
        q: "Bagaimana saya tahu gaun tersedia di tanggal yang saya inginkan?",
        a: "Sistem kami otomatis mengecek ketersediaan setiap ukuran berdasarkan jadwal sewa yang sudah ada. Kalau ukuran dan tanggal yang kamu pilih sudah dipesan orang lain, kalender pemesanan akan menandainya sebagai tidak tersedia sebelum kamu checkout — jadi tidak akan terjadi pemesanan ganda.",
      },
    ],
  },
  {
    id: "akun",
    label: "Akun & Wishlist",
    items: [
      {
        q: "Apakah saya harus membuat akun untuk menyewa gaun?",
        a: "Ya, kamu perlu membuat akun terlebih dahulu. Akun ini digunakan untuk menyimpan riwayat pesanan, wishlist gaun favorit, dan mempermudah proses checkout di kemudian hari.",
      },
      {
        q: "Bagaimana cara menyimpan gaun favorit saya?",
        a: "Klik ikon hati di kartu gaun atau di halaman detail produk. Gaun yang kamu simpan bisa dilihat kembali kapan saja lewat menu Wishlist di navbar bagian atas.",
      },
      {
        q: "Di mana saya bisa melihat riwayat pesanan saya?",
        a: 'Buka menu "Pesanan Saya" dari ikon profil di navbar. Di sana kamu bisa melihat status setiap pesanan — mulai dari menunggu pembayaran, dikonfirmasi, sedang disewa, hingga selesai dikembalikan.',
      },
    ],
  },
];

export default function FaqPage() {
  const [activeCat, setActiveCat] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    return categories
      .filter((cat) => activeCat === "all" || cat.id === activeCat)
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            !q ||
            item.q.toLowerCase().includes(q) ||
            item.a.toLowerCase().includes(q),
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [activeCat, search]);

  const totalResults = filtered.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <div className="min-h-screen" style={{ background: "var(--user-bg)" }}>
      {/* Header */}
      <div className="pt-32 pb-14 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Link
            href="/"
            className="font-sans text-[10px] tracking-[0.2em] uppercase transition-colors"
            style={{ color: "var(--user-text-muted)" }}
          >
            Home
          </Link>
          <span style={{ color: "var(--user-text-faint)" }} className="text-xs">
            /
          </span>
          <span
            className="font-sans text-[10px] tracking-[0.2em] uppercase"
            style={{ color: "var(--user-text)" }}
          >
            FAQ
          </span>
        </div>

        <h1
          className="font-serif font-light leading-none mb-5"
          style={{
            fontSize: "clamp(2.2rem, 6vw, 4.5rem)",
            color: "var(--user-text)",
          }}
        >
          Pertanyaan yang <em className="italic">Sering Diajukan</em>
        </h1>

        <p
          className="font-sans font-light text-sm leading-relaxed max-w-md mx-auto"
          style={{ color: "var(--user-text-muted)" }}
        >
          Semua yang perlu kamu tahu tentang cara sewa, pengiriman, dan
          pengembalian gaun di Naia.
        </p>
      </div>

      {/* Search + filter */}
      <div className="max-w-3xl mx-auto px-6 mb-12">
        <div className="relative mb-6">
          <svg
            width="14"
            height="14"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: "var(--user-text-muted)" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Cari pertanyaan... misalnya 'denda' atau 'ukuran'"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent rounded-full pl-11 pr-5 py-3 font-sans text-sm outline-none transition-colors"
            style={{
              border: "1px solid var(--user-border)",
              color: "var(--user-text)",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "var(--user-text-muted)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = "var(--user-border)")
            }
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {[
            { id: "all", label: "Semua" },
            ...categories.map((c) => ({ id: c.id, label: c.label })),
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className="font-sans text-[9px] tracking-[0.12em] uppercase px-4 py-2 rounded-full transition-all duration-200"
              style={{
                background:
                  activeCat === c.id ? "var(--user-text)" : "transparent",
                color:
                  activeCat === c.id
                    ? "var(--user-bg)"
                    : "var(--user-text-secondary)",
                border: `1px solid ${activeCat === c.id ? "var(--user-text)" : "var(--user-border)"}`,
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* List FAQ */}
      <div className="max-w-3xl mx-auto px-6 pb-24">
        {totalResults === 0 ? (
          <div className="text-center py-20">
            <p
              className="font-serif font-light text-2xl mb-3"
              style={{ color: "var(--user-text-muted)" }}
            >
              Tidak ditemukan
            </p>
            <p
              className="font-sans text-sm"
              style={{ color: "var(--user-text-muted)" }}
            >
              Coba kata kunci lain, atau hubungi kami langsung di bawah.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-14">
            {filtered.map((cat) => (
              <div key={cat.id}>
                <h2
                  className="font-serif font-light mb-5"
                  style={{
                    fontSize: "clamp(1.3rem, 2vw, 1.6rem)",
                    color: "var(--user-text)",
                  }}
                >
                  {cat.label}
                </h2>

                <div
                  className="flex flex-col"
                  style={{ borderTop: "1px solid var(--user-border)" }}
                >
                  {cat.items.map((item, i) => {
                    const id = `${cat.id}-${i}`;
                    const isOpen = openId === id;
                    return (
                      <FaqAccordionItem
                        key={id}
                        item={item}
                        isOpen={isOpen}
                        onToggle={() => setOpenId(isOpen ? null : id)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA bawah */}
      <div
        className="px-6 py-16 md:py-20 text-center"
        style={{ borderTop: "1px solid var(--user-border)" }}
      >
        <p
          className="font-serif font-light mb-3"
          style={{
            fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
            color: "var(--user-text)",
          }}
        >
          Masih ada yang ingin ditanyakan?
        </p>
        <p
          className="font-sans text-sm mb-8"
          style={{ color: "var(--user-text-muted)" }}
        >
          Tim kami siap bantu jawab pertanyaanmu langsung.
        </p>
        <a
          href="https://wa.me/6281234567890"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block font-sans text-[10px] tracking-[0.25em] uppercase px-8 py-3.5 transition-all duration-300"
          style={{
            border: "1px solid var(--user-text)",
            color: "var(--user-text)",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "var(--user-text)";
            e.currentTarget.style.color = "var(--user-bg)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--user-text)";
          }}
        >
          Hubungi Kami di WhatsApp
        </a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Satu item accordion — pakai teknik CSS grid-rows untuk animasi
// expand/collapse yang smooth tanpa perlu ukur tinggi lewat JS
// ─────────────────────────────────────────────────────────────
function FaqAccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={{ borderBottom: "1px solid var(--user-border)" }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
      >
        <span
          className="font-sans text-sm md:text-base"
          style={{ color: isOpen ? "var(--user-text)" : "var(--user-text)" }}
        >
          {item.q}
        </span>
        <span
          className="shrink-0 w-6 h-6 flex items-center justify-center transition-transform duration-300"
          style={{
            color: "var(--user-text-muted)",
            transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
          }}
        >
          <svg
            width="14"
            height="14"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </span>
      </button>

      {/* Grid-rows trick: 0fr -> 1fr, overflow hidden, transisi smooth
          tanpa perlu hitung scrollHeight via JS */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: isOpen ? "1fr" : "0fr",
          transition: "grid-template-rows 0.35s ease",
        }}
      >
        <div style={{ overflow: "hidden" }}>
          <p
            className="font-sans font-light text-sm leading-relaxed pb-6 pr-8"
            style={{ color: "var(--user-text-secondary)" }}
          >
            {item.a}
          </p>
        </div>
      </div>
    </div>
  );
}
