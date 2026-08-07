"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getToken } from "@/lib/auth";
import DateRangePicker, {
  DateRange,
} from "@/components/public/DateRangePicker";
import { apiFetch } from "@/lib/apiFetch";

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

// snap dari midtrans tidak resmi punya types, jadi dideklarasikan manual
type MidtransSnap = {
  pay: (
    token: string,
    options: {
      onSuccess: (result: unknown) => void;
      onPending: (result: unknown) => void;
      onError: (result: unknown) => void;
      onClose: () => void;
    },
  ) => void;
};

declare global {
  interface Window {
    snap?: MidtransSnap;
  }
}

const formatPrice = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const formatDate = (d: Date) =>
  d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const toYMD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const validatePhone = (phone: string): string => {
  const cleaned = phone.trim();
  const regex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;
  if (!cleaned) return "Nomor WhatsApp wajib diisi";
  if (!regex.test(cleaned))
    return "Format nomor tidak valid (contoh: 081234567890)";
  return "";
};

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
  const [contactPhone, setContactPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [bookedRanges, setBookedRanges] = useState<
    { startDate: string; endDate: string }[]
  >([]);
  const [bufferDays, setBufferDays] = useState(0);
  const [sizeStock, setSizeStock] = useState(1);

  // isi nomor wa otomatis dari profil user begitu datanya siap.
  // dihitung langsung saat render (bukan lewat useEffect) supaya tidak
  // memicu render bertingkat — pola ini yang direkomendasikan react
  // untuk kasus "sinkronkan state dari data yang baru datang"
  const [autoFilledFor, setAutoFilledFor] = useState<string | undefined>(
    undefined,
  );
  if (user?.phone && user.phone !== autoFilledFor && !contactPhone) {
    setAutoFilledFor(user.phone);
    setContactPhone(user.phone);
  }

  // redirect ke login kalau belum login — ini efek "beneran" (navigasi
  // ke luar komponen), bukan sekadar sinkronisasi state
  useEffect(() => {
    if (ready && !loggedIn) {
      router.push(
        `/auth/login?redirect=/checkout?dressId=${dress.id}${initialSize ? `&sizeId=${initialSize.id}` : ""}`,
      );
    }
  }, [ready, loggedIn, dress.id, initialSize, router]);

  // ambil tanggal yang sudah dipesan buat dress + ukuran ini,
  // dipakai buat highlight kalender. refetch tiap ukuran berubah
  useEffect(() => {
    const fetchBookedRanges = async () => {
      try {
        const url = selectedSize
          ? `${API}/orders/booked-ranges/${dress.id}?sizeId=${selectedSize.id}`
          : `${API}/orders/booked-ranges/${dress.id}`;
        const res = await apiFetch(url, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (res.ok) {
          const data = await res.json();
          setBookedRanges(data.ranges);
          setSizeStock(data.stock);
          setBufferDays(data.bufferDays);
        }
      } catch {
        // gagal ambil data booked ranges -> kalender tetap tampil normal
      }
    };
    fetchBookedRanges();
  }, [dress.id, selectedSize]);

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
  const needsSize = dress.sizes.length > 0 && !selectedSize;
  const thumb = dress.photos?.find((p) => p.isThumbnail) ?? dress.photos?.[0];

  const handleSubmit = async () => {
    if (!canProceed) return;

    if (needsSize) {
      setError("Silakan pilih ukuran terlebih dahulu");
      return;
    }

    const phoneErr = validatePhone(contactPhone);
    if (phoneErr) {
      setPhoneError(phoneErr);
      return;
    }

    setLoading(true);
    setError("");

    try {
      let orderId = createdOrderId;

      // cuma bikin order baru kalau belum pernah dibuat di sesi checkout ini
      if (!orderId) {
        const orderRes = await apiFetch(`${API}/orders`, {
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
            contactPhone,
          }),
        });

        const order = await orderRes.json();
        if (!orderRes.ok) {
          setError(order.message ?? "Gagal membuat pesanan");
          setLoading(false);
          return;
        }

        orderId = order.id;
        setCreatedOrderId(orderId);
      }

      const snapRes = await apiFetch(`${API}/payment/snap-token/${orderId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      const snapData = await snapRes.json();
      if (!snapRes.ok) {
        setError(snapData.message ?? "Gagal memproses pembayaran");
        setLoading(false);
        return;
      }

      const snapWindow = window.snap;
      if (!snapWindow) {
        setError("Midtrans tidak tersedia, coba refresh halaman");
        setLoading(false);
        return;
      }

      snapWindow.pay(snapData.snapToken, {
        onSuccess: () => router.push(`/orders/${orderId}?payment=finish`),
        onPending: () => router.push(`/orders/${orderId}?payment=pending`),
        onError: () => {
          setError("Pembayaran gagal, silakan coba lagi");
          setLoading(false);
        },
        // user tutup popup tanpa bayar -> arahkan ke halaman order detail,
        // biar halaman itu jadi "pusat kontrol" pesanan ini
        onClose: () => router.push(`/orders/${orderId}`),
      });
    } catch {
      setError("Tidak dapat terhubung ke server");
      setLoading(false);
    }
  };

  if (!ready) return null;

  return (
    <div className="min-h-screen" style={{ background: "var(--user-bg)" }}>
      <PageHeader dressSlug={dress.slug} />

      <div className="max-w-6xl mx-auto px-6 md:px-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3 space-y-8">
            <StepIndicator step={step} />

            {step === 1 && (
              <DateStep
                dress={dress}
                dateRange={dateRange}
                onChangeDateRange={setDateRange}
                totalDays={totalDays}
                canProceed={!!canProceed}
                onNext={() => setStep(2)}
                bookedRanges={bookedRanges}
                bufferDays={bufferDays}
                stock={sizeStock}
                selectedSize={selectedSize}
                onSelectSize={setSelectedSize}
              />
            )}

            {step === 2 && (
              <SummaryStep
                dress={dress}
                dateRange={dateRange}
                totalDays={totalDays}
                selectedSize={selectedSize}
                onSelectSize={setSelectedSize}
                notes={notes}
                onChangeNotes={setNotes}
                contactPhone={contactPhone}
                onChangePhone={(v) => {
                  setContactPhone(v);
                  if (phoneError) setPhoneError("");
                }}
                phoneError={phoneError}
                loading={loading}
                needsSize={needsSize}
                error={error}
                onBack={() => setStep(1)}
                onSubmit={handleSubmit}
              />
            )}
          </div>

          <div className="lg:col-span-2">
            <DressSummaryCard
              dress={dress}
              thumb={thumb}
              totalDays={totalDays}
              totalPrice={totalPrice}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// judul halaman + link kembali ke detail dress
function PageHeader({ dressSlug }: { dressSlug: string }) {
  return (
    <div className="pt-24 pb-8 px-6 md:px-10 max-w-6xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link
          href={`/dresses/${dressSlug}`}
          className="font-sans text-[9px] tracking-[0.2em] uppercase transition-colors"
          style={{ color: "var(--user-text-muted)" }}
          onMouseOver={(e) =>
            (e.currentTarget.style.color = "var(--user-text-secondary)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.color = "var(--user-text-muted)")
          }
        >
          ← Kembali
        </Link>
      </div>
      <p
        className="font-sans text-[9px] tracking-[0.35em] uppercase mb-2"
        style={{ color: "var(--user-text-muted)" }}
      >
        Pemesanan
      </p>
      <h1
        className="font-serif font-light"
        style={{
          fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
          color: "var(--user-text)",
        }}
      >
        Konfirmasi <em className="italic">Pesanan</em>
      </h1>
    </div>
  );
}

// bulatan angka 1-2 penanda posisi step saat ini
function StepIndicator({ step }: { step: 1 | 2 }) {
  const steps = [
    { n: 1, label: "Pilih Tanggal" },
    { n: 2, label: "Ringkasan" },
  ];

  return (
    <div className="flex items-center gap-3">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center font-sans text-[10px] transition-all duration-200"
              style={{
                background:
                  step >= s.n ? "var(--user-text)" : "var(--user-border)",
                color:
                  step >= s.n ? "var(--user-bg)" : "var(--user-text-muted)",
              }}
            >
              {step > s.n ? "✓" : s.n}
            </div>
            <span
              className="font-sans text-[10px] tracking-widest uppercase"
              style={{
                color:
                  step >= s.n ? "var(--user-text)" : "var(--user-text-muted)",
              }}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className="w-8 h-px"
              style={{ background: "var(--user-border)" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// step 1 — pilih ukuran dulu (kalau ada >1 pilihan), baru kalender tanggal sewa
function DateStep({
  dress,
  dateRange,
  onChangeDateRange,
  totalDays,
  canProceed,
  onNext,
  bookedRanges,
  bufferDays,
  stock,
  selectedSize,
  onSelectSize,
}: {
  dress: Dress;
  dateRange: DateRange;
  onChangeDateRange: (range: DateRange) => void;
  totalDays: number;
  canProceed: boolean;
  onNext: () => void;
  bookedRanges: { startDate: string; endDate: string }[];
  bufferDays: number;
  stock: number;
  selectedSize: DressSize | null;
  onSelectSize: (size: DressSize) => void;
}) {
  // kalau dress punya lebih dari 1 ukuran, wajib pilih dulu sebelum
  // kalender muncul -- supaya highlight tanggal terpakai akurat
  // sesuai stok ukuran yang benar
  const needsSizeFirst = dress.sizes.length > 1 && !selectedSize;

  return (
    <div
      className="p-6 md:p-8"
      style={{
        background: "color-mix(in srgb, var(--user-bg-alt) 50%, transparent)",
        border: "1px solid var(--user-border)",
      }}
    >
      <h2
        className="font-serif font-light text-xl mb-1"
        style={{ color: "var(--user-text)" }}
      >
        {needsSizeFirst ? "Pilih Ukuran" : "Pilih Tanggal Sewa"}
      </h2>
      <p
        className="font-sans text-[11px] mb-6"
        style={{ color: "var(--user-text-muted)" }}
      >
        {needsSizeFirst ? (
          "Pilih ukuran dulu supaya kami bisa tunjukkan tanggal yang tersedia"
        ) : (
          <>
            Minimal sewa{" "}
            <span style={{ color: "var(--user-text-secondary)" }}>
              {dress.minRentalDays} hari
            </span>
          </>
        )}
      </p>

      {needsSizeFirst ? (
        <SizePicker
          sizes={dress.sizes}
          selectedSize={selectedSize}
          onSelect={onSelectSize}
        />
      ) : (
        <>
          {dress.sizes.length > 1 && selectedSize && (
            <div
              className="flex items-center justify-between mb-5 pb-4"
              style={{ borderBottom: "1px solid var(--user-border)" }}
            >
              <span
                className="font-sans text-[10px] tracking-[0.15em] uppercase"
                style={{ color: "var(--user-text-muted)" }}
              >
                Ukuran dipilih
              </span>
              <div className="flex items-center gap-3">
                <span
                  className="font-serif text-base"
                  style={{ color: "var(--user-text)" }}
                >
                  {selectedSize.label}
                </span>
                <button
                  onClick={() => onSelectSize(null as unknown as DressSize)}
                  className="font-sans text-[9px] tracking-widest uppercase underline"
                  style={{ color: "var(--user-text-muted)" }}
                >
                  Ganti
                </button>
              </div>
            </div>
          )}

          <DateRangePicker
            value={dateRange}
            onChange={onChangeDateRange}
            minRentalDays={dress.minRentalDays}
            bookedRanges={bookedRanges}
            bufferDays={bufferDays}
            stock={stock}
          />

          {dateRange.startDate && dateRange.endDate && (
            <div
              className="mt-6 p-4"
              style={{
                background: "var(--user-bg)",
                border: "1px solid var(--user-border)",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="font-sans text-[9px] tracking-[0.2em] uppercase mb-1"
                    style={{ color: "var(--user-text-muted)" }}
                  >
                    Tanggal Sewa
                  </p>
                  <p
                    className="font-sans text-sm"
                    style={{ color: "var(--user-text-secondary)" }}
                  >
                    {formatDate(dateRange.startDate)} —{" "}
                    {formatDate(dateRange.endDate)}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="font-sans text-[9px] tracking-[0.2em] uppercase mb-1"
                    style={{ color: "var(--user-text-muted)" }}
                  >
                    Durasi
                  </p>
                  <p
                    className="font-serif font-light text-lg"
                    style={{ color: "var(--user-text)" }}
                  >
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
            onClick={onNext}
            disabled={!canProceed}
            className="w-full mt-6 py-4 font-sans text-[10px] tracking-[0.3em] uppercase transition-all duration-300"
            style={{
              background: canProceed
                ? "var(--user-text)"
                : "var(--user-border)",
              color: canProceed ? "var(--user-bg)" : "var(--user-text-muted)",
              cursor: canProceed ? "pointer" : "not-allowed",
            }}
          >
            Lanjut ke Ringkasan →
          </button>
        </>
      )}
    </div>
  );
}

// step 2 — ringkasan pesanan, pilih ukuran, catatan, nomor wa
function SummaryStep({
  dress,
  dateRange,
  totalDays,
  selectedSize,
  onSelectSize,
  notes,
  onChangeNotes,
  contactPhone,
  onChangePhone,
  phoneError,
  loading,
  needsSize,
  error,
  onBack,
  onSubmit,
}: {
  dress: Dress;
  dateRange: DateRange;
  totalDays: number;
  selectedSize: DressSize | null;
  onSelectSize: (size: DressSize) => void;
  notes: string;
  onChangeNotes: (v: string) => void;
  contactPhone: string;
  onChangePhone: (v: string) => void;
  phoneError: string;
  loading: boolean;
  needsSize: boolean;
  error: string;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const summaryRows = [
    { label: "Tanggal Mulai", value: formatDate(dateRange.startDate!) },
    { label: "Tanggal Selesai", value: formatDate(dateRange.endDate!) },
    { label: "Durasi", value: `${totalDays} hari` },
    { label: "Ukuran", value: selectedSize?.label ?? "Tidak dipilih" },
  ];

  return (
    <div className="space-y-5">
      <div
        className="p-6 md:p-8"
        style={{
          background: "color-mix(in srgb, var(--user-bg-alt) 50%, transparent)",
          border: "1px solid var(--user-border)",
        }}
      >
        <h2
          className="font-serif font-light text-xl mb-5"
          style={{ color: "var(--user-text)" }}
        >
          Detail Pesanan
        </h2>

        {summaryRows.map((item) => (
          <div
            key={item.label}
            className="flex justify-between py-3"
            style={{ borderBottom: "1px solid var(--user-border)" }}
          >
            <span
              className="font-sans text-[10px] tracking-[0.15em] uppercase"
              style={{ color: "var(--user-text-muted)" }}
            >
              {item.label}
            </span>
            <span
              className="font-sans text-sm"
              style={{ color: "var(--user-text-secondary)" }}
            >
              {item.value}
            </span>
          </div>
        ))}

        {!selectedSize && dress.sizes && dress.sizes.length > 0 && (
          <SizePicker
            sizes={dress.sizes}
            selectedSize={selectedSize}
            onSelect={onSelectSize}
          />
        )}

        <div className="mt-5">
          <label
            className="block font-sans text-[10px] tracking-[0.15em] uppercase mb-2"
            style={{ color: "var(--user-text-muted)" }}
          >
            Catatan (opsional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => onChangeNotes(e.target.value)}
            rows={3}
            placeholder="Permintaan khusus, ukuran custom, dll..."
            className="w-full bg-transparent p-3 font-sans text-sm outline-none transition-colors resize-none"
            style={{
              border: "1px solid var(--user-border)",
              color: "var(--user-text-secondary)",
            }}
          />
        </div>

        <div className="mt-5">
          <label
            className="block font-sans text-[10px] tracking-[0.15em] uppercase mb-2"
            style={{ color: "var(--user-text-muted)" }}
          >
            Nomor WhatsApp *
          </label>
          <input
            type="tel"
            value={contactPhone}
            onChange={(e) => onChangePhone(e.target.value)}
            placeholder="081234567890"
            className="w-full bg-transparent p-3 font-sans text-sm outline-none transition-colors"
            style={{
              border: `1px solid ${phoneError ? "#f87171" : "var(--user-border)"}`,
              color: "var(--user-text-secondary)",
            }}
          />
          {phoneError && (
            <p
              className="font-sans text-[10px] mt-1.5"
              style={{ color: "#f87171" }}
            >
              {phoneError}
            </p>
          )}
          <p
            className="font-sans text-[10px] mt-1.5"
            style={{ color: "var(--user-text-muted)" }}
          >
            Pastikan nomor aktif — admin akan menghubungi Anda untuk konfirmasi
            pengiriman
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 font-sans text-[10px] tracking-[0.2em] uppercase transition-all duration-200"
          style={{
            border: "1px solid var(--user-border)",
            color: "var(--user-text-secondary)",
          }}
        >
          ← Ubah Tanggal
        </button>
        <button
          onClick={onSubmit}
          disabled={loading || needsSize}
          className="flex-1 py-3 font-sans text-[10px] tracking-[0.3em] uppercase transition-all duration-300"
          style={{
            background:
              loading || needsSize ? "var(--user-border)" : "var(--user-text)",
            color:
              loading || needsSize
                ? "var(--user-text-muted)"
                : "var(--user-bg)",
            cursor: loading || needsSize ? "not-allowed" : "pointer",
          }}
        >
          {loading
            ? "Memproses..."
            : needsSize
              ? "Pilih Ukuran Dulu"
              : "Buat Pesanan"}
        </button>
      </div>

      {error && (
        <div className="p-4 border border-red-200 bg-red-50">
          <p className="font-sans text-xs text-red-500">{error}</p>
        </div>
      )}
    </div>
  );
}

// tombol pilihan ukuran, muncul kalau di step 1 belum pilih ukuran
function SizePicker({
  sizes,
  selectedSize,
  onSelect,
}: {
  sizes: DressSize[];
  selectedSize: DressSize | null;
  onSelect: (size: DressSize) => void;
}) {
  return (
    <div className="mt-4">
      <p
        className="font-sans text-[10px] tracking-[0.15em] uppercase mb-3"
        style={{ color: "var(--user-text-muted)" }}
      >
        Pilih Ukuran
      </p>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const isSelected = selectedSize?.id === size.id;
          return (
            <button
              key={size.id}
              onClick={() => onSelect(size)}
              className="font-sans text-[10px] tracking-widest uppercase px-4 py-2 border transition-all duration-200"
              style={{
                borderColor: isSelected
                  ? "var(--user-text)"
                  : "var(--user-border)",
                background: isSelected ? "var(--user-text)" : "transparent",
                color: isSelected
                  ? "var(--user-bg)"
                  : "var(--user-text-secondary)",
              }}
            >
              {size.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// kartu ringkasan dress di kolom kanan, nempel saat scroll
function DressSummaryCard({
  dress,
  thumb,
  totalDays,
  totalPrice,
}: {
  dress: Dress;
  thumb: DressPhoto | undefined;
  totalDays: number;
  totalPrice: number;
}) {
  return (
    <div
      className="sticky top-24 p-6"
      style={{
        background: "color-mix(in srgb, var(--user-bg-alt) 50%, transparent)",
        border: "1px solid var(--user-border)",
      }}
    >
      <div
        className="relative overflow-hidden mb-5"
        style={{ aspectRatio: "3/4" }}
      >
        {thumb ? (
          <Image
            src={`${IMG_BASE}${thumb.url}`}
            alt={dress.name}
            fill
            className="object-cover object-top"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: "var(--user-border)" }}
          >
            <span
              className="font-sans text-[9px] tracking-widest uppercase"
              style={{ color: "var(--user-text-muted)" }}
            >
              No photo
            </span>
          </div>
        )}
      </div>

      <p
        className="font-sans text-[9px] tracking-[0.2em] uppercase mb-1"
        style={{ color: "var(--user-text-muted)" }}
      >
        {dress.category?.name}
      </p>
      <h3
        className="font-serif font-light text-lg leading-tight mb-4"
        style={{ color: "var(--user-text)" }}
      >
        {dress.name}
      </h3>

      <div
        className="space-y-0 pt-4"
        style={{ borderTop: "1px solid var(--user-border)" }}
      >
        <div className="flex justify-between py-2">
          <span
            className="font-sans text-[10px] tracking-widest uppercase"
            style={{ color: "var(--user-text-muted)" }}
          >
            Harga / hari
          </span>
          <span
            className="font-sans text-sm"
            style={{ color: "var(--user-text-secondary)" }}
          >
            {formatPrice(dress.pricePerDay)}
          </span>
        </div>
        <div className="flex justify-between py-2">
          <span
            className="font-sans text-[10px] tracking-widest uppercase"
            style={{ color: "var(--user-text-muted)" }}
          >
            Durasi
          </span>
          <span
            className="font-sans text-sm"
            style={{ color: "var(--user-text-secondary)" }}
          >
            {totalDays > 0 ? `${totalDays} hari` : "—"}
          </span>
        </div>
        <div
          className="flex justify-between py-3 mt-2"
          style={{ borderTop: "1px solid var(--user-border)" }}
        >
          <span
            className="font-sans text-[10px] tracking-widest uppercase font-medium"
            style={{ color: "var(--user-text-secondary)" }}
          >
            Total
          </span>
          <span
            className="font-serif font-light text-lg"
            style={{ color: "var(--user-text)" }}
          >
            {totalDays > 0 ? formatPrice(totalPrice) : "—"}
          </span>
        </div>
      </div>

      <p
        className="font-sans text-[9px] mt-4 leading-relaxed"
        style={{ color: "var(--user-text-muted)" }}
      >
        Pembayaran dilakukan setelah pesanan dikonfirmasi oleh admin.
      </p>
    </div>
  );
}
