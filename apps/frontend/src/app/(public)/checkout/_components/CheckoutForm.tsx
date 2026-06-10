"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getToken } from "@/lib/auth";
import DateRangePicker, {
  DateRange,
} from "@/components/public/DateRangePicker";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const IMG_BASE = process.env.NEXT_PUBLIC_IMG_BASE ?? "http://localhost:3001";

type Category = { id: number; name: string };
type DressPhoto = {
  id: number;
  url: string;
  isThumbnail: boolean;
  order: number;
};
type DressSize = {
  id: number;
  label: string;
  bust: number | null;
  waist: number | null;
  hip: number | null;
  length: number | null;
  stock: number;
};
type Dress = {
  id: number;
  name: string;
  slug: string;
  description: string;
  pricePerDay: number;
  minRentalDays: number;
  status: string;
  category: Category;
  photos: DressPhoto[];
  sizes: DressSize[];
};

const formatPrice = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const formatDate = (d: Date) => {
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const toYMD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function CheckoutForm({
  dress,
  initialSize,
}: {
  dress: Dress;
  initialSize: DressSize | null;
}) {
  const router = useRouter();
  const { user, loggedIn, ready } = useAuth();
  const [selectedSize, setSelectedSize] = useState<DressSize | null>(
    initialSize,
  );
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<1 | 2>(1); // 1=tanggal, 2=ringkasan

  const thumb = dress.photos?.find((p) => p.isThumbnail) ?? dress.photos?.[0];

  // Redirect ke login kalau belum login
  useEffect(() => {
    if (ready && !loggedIn) {
      router.push(
        `/auth/login?redirect=/checkout?dressId=${dress.id}${initialSize ? `&sizeId=${initialSize.id}` : ""}`,
      );
    }
  }, [ready, loggedIn]);

  const totalDays =
    dateRange.startDate && dateRange.endDate
      ? Math.ceil(
          (dateRange.endDate.getTime() - dateRange.startDate.getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

  const totalPrice = totalDays * Number(dress.pricePerDay);

  const canProceed =
    dateRange.startDate &&
    dateRange.endDate &&
    totalDays >= dress.minRentalDays;

  const handleSubmit = async () => {
    if (!canProceed) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          dressId: dress.id,
          sizeId: selectedSize?.id ?? null,
          startDate: toYMD(dateRange.startDate!),
          endDate: toYMD(dateRange.endDate!),
          notes: notes || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Gagal membuat pesanan");
        return;
      }

      // Nanti: redirect ke halaman payment Midtrans
      // Untuk sekarang redirect ke halaman konfirmasi
      router.push(`/orders/${data.id}?success=true`);
    } catch {
      setError("Tidak dapat terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-[#f0ebe3]">
      {/* Header */}
      <div className="pt-24 pb-8 px-6 md:px-10 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Link
            href={`/dresses/${dress.slug}`}
            className="font-sans text-[9px] tracking-[0.2em] uppercase text-stone-400 hover:text-stone-600 transition-colors"
          >
            ← Kembali
          </Link>
        </div>
        <p className="font-sans text-[9px] tracking-[0.35em] uppercase text-stone-400 mb-2">
          Pemesanan
        </p>
        <h1
          className="font-serif font-[300] text-stone-800"
          style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
        >
          Konfirmasi <em className="italic">Pesanan</em>
        </h1>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* ── Kiri: Form ── */}
          <div className="lg:col-span-3 space-y-8">
            {/* Step indicator */}
            <div className="flex items-center gap-3">
              {[
                { n: 1, label: "Pilih Tanggal" },
                { n: 2, label: "Ringkasan" },
              ].map((s, i) => (
                <div key={s.n} className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center font-sans text-[10px] transition-all duration-200"
                      style={{
                        background: step >= s.n ? "#1c1917" : "#e7e5e4",
                        color: step >= s.n ? "#f0ebe3" : "#a8a29e",
                      }}
                    >
                      {step > s.n ? "✓" : s.n}
                    </div>
                    <span
                      className="font-sans text-[10px] tracking-[0.1em] uppercase"
                      style={{ color: step >= s.n ? "#1c1917" : "#a8a29e" }}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < 1 && <div className="w-8 h-[1px] bg-stone-300" />}
                </div>
              ))}
            </div>

            {/* ── Step 1: Pilih tanggal ── */}
            {step === 1 && (
              <div className="bg-white/50 border border-stone-200/60 p-6 md:p-8">
                <h2 className="font-serif font-[300] text-stone-800 text-xl mb-1">
                  Pilih Tanggal Sewa
                </h2>
                <p className="font-sans text-[11px] text-stone-400 mb-6">
                  Minimal sewa{" "}
                  <span className="text-stone-600">
                    {dress.minRentalDays} hari
                  </span>
                </p>

                <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  minRentalDays={dress.minRentalDays}
                />

                {/* Tampilkan ringkasan tanggal yang dipilih */}
                {dateRange.startDate && dateRange.endDate && (
                  <div className="mt-6 p-4 bg-[#f0ebe3] border border-stone-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-1">
                          Tanggal Sewa
                        </p>
                        <p className="font-sans text-sm text-stone-700">
                          {formatDate(dateRange.startDate)} —{" "}
                          {formatDate(dateRange.endDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-1">
                          Durasi
                        </p>
                        <p className="font-serif font-[300] text-stone-800 text-lg">
                          {totalDays} hari
                        </p>
                      </div>
                    </div>
                    {totalDays < dress.minRentalDays && (
                      <p className="font-sans text-[10px] text-red-400 mt-3">
                        Minimal sewa {dress.minRentalDays} hari
                      </p>
                    )}
                  </div>
                )}

                <button
                  onClick={() => setStep(2)}
                  disabled={!canProceed}
                  className="w-full mt-6 py-4 font-sans text-[10px] tracking-[0.3em] uppercase transition-all duration-300"
                  style={{
                    background: canProceed ? "#1c1917" : "#e7e5e4",
                    color: canProceed ? "#f0ebe3" : "#a8a29e",
                    cursor: canProceed ? "pointer" : "not-allowed",
                  }}
                >
                  Lanjut ke Ringkasan →
                </button>
              </div>
            )}

            {/* ── Step 2: Ringkasan & konfirmasi ── */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="bg-white/50 border border-stone-200/60 p-6 md:p-8">
                  <h2 className="font-serif font-[300] text-stone-800 text-xl mb-5">
                    Detail Pesanan
                  </h2>

                  {[
                    {
                      label: "Tanggal Mulai",
                      value: formatDate(dateRange.startDate!),
                    },
                    {
                      label: "Tanggal Selesai",
                      value: formatDate(dateRange.endDate!),
                    },
                    { label: "Durasi", value: `${totalDays} hari` },
                    {
                      label: "Ukuran",
                      value: selectedSize?.label ?? "Tidak dipilih",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex justify-between py-3 border-b border-stone-100"
                    >
                      <span className="font-sans text-[10px] tracking-[0.15em] uppercase text-stone-400">
                        {item.label}
                      </span>
                      <span className="font-sans text-sm text-stone-700">
                        {item.value}
                      </span>
                    </div>
                  ))}

                  {/* Pilih ukuran kalau belum */}
                  {!selectedSize && dress.sizes?.length > 0 && (
                    <div className="mt-4">
                      <p className="font-sans text-[10px] tracking-[0.15em] uppercase text-stone-400 mb-3">
                        Pilih Ukuran
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {dress.sizes.map((size) => (
                          <button
                            key={size.id}
                            onClick={() => setSelectedSize(size)}
                            className="font-sans text-[10px] tracking-[0.1em] uppercase px-4 py-2 border transition-all duration-200"
                            style={{
                              borderColor:
                                selectedSize?.id === size.id
                                  ? "#1c1917"
                                  : "#d6d3d1",
                              background:
                                selectedSize?.id === size.id
                                  ? "#1c1917"
                                  : "transparent",
                              color:
                                selectedSize?.id === size.id
                                  ? "#f0ebe3"
                                  : "#78716c",
                            }}
                          >
                            {size.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Catatan */}
                  <div className="mt-5">
                    <label className="block font-sans text-[10px] tracking-[0.15em] uppercase text-stone-400 mb-2">
                      Catatan (opsional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Permintaan khusus, ukuran custom, dll..."
                      className="w-full bg-transparent border border-stone-200 p-3 font-sans text-sm text-stone-700 placeholder:text-stone-300 outline-none focus:border-stone-400 transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* Tombol navigasi */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 font-sans text-[10px] tracking-[0.2em] uppercase border border-stone-300 text-stone-500 hover:border-stone-500 hover:text-stone-700 transition-all duration-200"
                  >
                    ← Ubah Tanggal
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 py-3 font-sans text-[10px] tracking-[0.3em] uppercase transition-all duration-300"
                    style={{
                      background: loading ? "#e7e5e4" : "#1c1917",
                      color: loading ? "#a8a29e" : "#f0ebe3",
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                  >
                    {loading ? "Memproses..." : "Buat Pesanan"}
                  </button>
                </div>

                {error && (
                  <div className="p-4 border border-red-200 bg-red-50">
                    <p className="font-sans text-xs text-red-500">{error}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Kanan: Ringkasan Dress ── */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 bg-white/50 border border-stone-200/60 p-6">
              {/* Foto dress */}
              <div
                className="relative overflow-hidden mb-5"
                style={{ aspectRatio: "3/4" }}
              >
                {thumb ? (
                  <img
                    src={`${IMG_BASE}${thumb.url}`}
                    alt={dress.name}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full bg-[#e8e0d5] flex items-center justify-center">
                    <span className="font-sans text-[9px] tracking-widest uppercase text-stone-400">
                      No photo
                    </span>
                  </div>
                )}
              </div>

              {/* Info dress */}
              <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-1">
                {dress.category?.name}
              </p>
              <h3 className="font-serif font-[300] text-stone-800 text-lg leading-tight mb-4">
                {dress.name}
              </h3>

              <div className="space-y-0 border-t border-stone-100 pt-4">
                <div className="flex justify-between py-2">
                  <span className="font-sans text-[10px] tracking-[0.1em] uppercase text-stone-400">
                    Harga / hari
                  </span>
                  <span className="font-sans text-sm text-stone-600">
                    {formatPrice(dress.pricePerDay)}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-sans text-[10px] tracking-[0.1em] uppercase text-stone-400">
                    Durasi
                  </span>
                  <span className="font-sans text-sm text-stone-600">
                    {totalDays > 0 ? `${totalDays} hari` : "—"}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-t border-stone-200 mt-2">
                  <span className="font-sans text-[10px] tracking-[0.1em] uppercase text-stone-600 font-[500]">
                    Total
                  </span>
                  <span className="font-serif font-[300] text-stone-800 text-lg">
                    {totalDays > 0 ? formatPrice(totalPrice) : "—"}
                  </span>
                </div>
              </div>

              <p className="font-sans text-[9px] text-stone-400 mt-4 leading-relaxed">
                Pembayaran dilakukan setelah pesanan dikonfirmasi oleh admin.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
