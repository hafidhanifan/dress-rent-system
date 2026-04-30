"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─────────────────────────────────────────────────────────────
// Tipe data form
// ─────────────────────────────────────────────────────────────
type FormData = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

type FieldError = Partial<Record<keyof FormData, string>>;

export default function RegisterPage() {
  const router = useRouter();

  // ── State form ──
  const [form, setForm] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // Error per field — dari validasi frontend
  const [errors, setErrors] = useState<FieldError>({});

  // Error global — dari response backend (misal: email sudah terdaftar)
  const [serverError, setServerError] = useState("");

  // Loading state — disable tombol saat sedang kirim request
  const [isLoading, setIsLoading] = useState(false);

  // Toggle show/hide password
  const [showPassword, setShowPassword] = useState(false);

  // ── Handler perubahan input ──
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Hapus error field ini saat user mulai ketik lagi
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ── Validasi frontend sebelum kirim ke backend ──
  const validate = (): boolean => {
    const newErrors: FieldError = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = "Nama lengkap tidak boleh kosong";
    }

    if (!form.email) {
      newErrors.email = "Email tidak boleh kosong";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!form.phone) {
      newErrors.phone = "Nomor HP tidak boleh kosong";
    }

    if (!form.password) {
      newErrors.password = "Password tidak boleh kosong";
    } else if (form.password.length < 8) {
      newErrors.password = "Password minimal 8 karakter";
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      newErrors.password =
        "Password harus mengandung huruf besar, huruf kecil, dan angka";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password tidak boleh kosong";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Password tidak cocok";
    }

    setErrors(newErrors);

    // Return true jika tidak ada error
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit form ──
  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    setServerError("");

    // Validasi dulu — jika gagal, berhenti di sini
    if (!validate()) return;

    setIsLoading(true);

    try {
      /**
       * Kirim request ke NestJS backend
       * URL: http://localhost:3001/auth/register
       *
       * Kita tidak kirim confirmPassword ke backend —
       * backend tidak butuh itu, cukup validasi di frontend
       */
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: form.fullName,
            email: form.email,
            phone: form.phone,
            password: form.password,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        // Error dari backend — tampilkan pesannya
        setServerError(data.message || "Terjadi kesalahan, coba lagi");
        return;
      }

      /**
       * Simpan token ke localStorage
       * Token ini akan dipakai di setiap request berikutnya
       * sebagai "bukti" bahwa user sudah login
       */
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect ke halaman dashboard setelah berhasil
      router.push("/dashboard");
    } catch (err) {
      setServerError("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f0ebe3] flex">
      {/* ══════════════════════════════════════
          KIRI — dekorasi (hanya muncul di desktop)
      ══════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#e6dfd6] flex-col items-center justify-center p-16">
        {/* Huruf dekoratif besar */}
        <span
          className="absolute -bottom-8 -left-4 font-serif font-[300] text-[#d8d0c8] leading-none select-none pointer-events-none"
          style={{ fontSize: "22rem" }}
        >
          N
        </span>

        {/* Konten tengah */}
        <div className="relative z-10 text-center">
          {/* Logo */}
          <Link
            href="/"
            className="font-serif text-2xl font-[300] tracking-[0.25em] uppercase text-stone-700 block mb-16"
          >
            Naia Dress
          </Link>

          <h2
            className="font-serif font-[300] text-stone-700 leading-[1.1] mb-6"
            style={{ fontSize: "clamp(2rem, 3vw, 2.8rem)" }}
          >
            Selamat datang <br />
            di <em className="italic">Naia Dress</em>
          </h2>

          <p className="font-sans font-[300] text-stone-400 text-sm leading-relaxed max-w-xs mx-auto">
            Daftar dan temukan ratusan pilihan dress untuk setiap momenmu — dari
            pesta hingga pernikahan.
          </p>

          {/* Garis dekoratif */}
          <div className="flex items-center gap-3 mt-10 justify-center">
            <div className="w-8 h-[1px] bg-stone-400" />
            <span className="font-sans text-[9px] tracking-[0.3em] uppercase text-stone-400">
              Est. 2024
            </span>
            <div className="w-8 h-[1px] bg-stone-400" />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          KANAN — Form register
      ══════════════════════════════════════ */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 md:px-12 py-12">
        {/* Logo mobile — hanya muncul di mobile */}
        <Link
          href="/"
          className="lg:hidden font-serif text-xl font-[300] tracking-[0.25em] uppercase text-stone-700 mb-10 block"
        >
          Naia Dress
        </Link>

        <div className="w-full max-w-md">
          {/* Header form */}
          <div className="mb-8">
            <p className="font-sans text-[9px] tracking-[0.35em] uppercase text-stone-400 mb-2">
              Buat Akun
            </p>
            <h1
              className="font-serif font-[300] text-stone-800 leading-tight"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.2rem)" }}
            >
              Daftar <em className="italic">sekarang</em>
            </h1>
          </div>

          {/* Error dari server */}
          {serverError && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded text-red-600 font-sans text-sm">
              {serverError}
            </div>
          )}

          {/* ── Form fields ── */}
          <div className="flex flex-col gap-5">
            {/* Nama Lengkap */}
            <InputField
              label="Nama Lengkap"
              name="fullName"
              type="text"
              placeholder="Siti Aurellia"
              value={form.fullName}
              onChange={handleChange}
              error={errors.fullName}
            />

            {/* Email */}
            <InputField
              label="Email"
              name="email"
              type="email"
              placeholder="kamu@email.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
            />

            {/* Nomor HP */}
            <InputField
              label="Nomor HP"
              name="phone"
              type="tel"
              placeholder="08xxxxxxxxxx"
              value={form.phone}
              onChange={handleChange}
              error={errors.phone}
            />

            {/* Password */}
            <div className="relative">
              <InputField
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 karakter"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
              />
              {/* Toggle show password */}
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-8 text-stone-400 hover:text-stone-600 transition-colors text-xs"
              >
                {showPassword ? "Sembunyikan" : "Tampilkan"}
              </button>
            </div>

            {/* Konfirmasi Password */}
            <InputField
              label="Konfirmasi Password"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Ulangi password"
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
            />

            {/* Tombol Submit */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="
                mt-2 w-full py-3.5
                font-sans text-[11px] tracking-[0.25em] uppercase
                bg-stone-800 hover:bg-stone-700
                disabled:bg-stone-400 disabled:cursor-not-allowed
                text-stone-100
                transition-colors duration-300
              "
            >
              {isLoading ? "Memproses..." : "Daftar Sekarang"}
            </button>
          </div>

          {/* Link ke login */}
          <p className="mt-6 text-center font-sans text-sm text-stone-400">
            Sudah punya akun?{" "}
            <Link
              href="/auth/login"
              className="text-stone-600 hover:text-stone-800 underline underline-offset-2 transition-colors"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────
// Komponen InputField — dipakai ulang untuk setiap field
// ─────────────────────────────────────────────────────────────
function InputField({
  label,
  name,
  type,
  placeholder,
  value,
  onChange,
  error,
}: {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {/* Label */}
      <label
        htmlFor={name}
        className="font-sans text-[10px] tracking-[0.15em] uppercase text-stone-500"
      >
        {label}
      </label>

      {/* Input */}
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`
          w-full px-4 py-3
          bg-transparent
          border-b
          font-sans text-sm text-stone-700
          placeholder:text-stone-300
          outline-none
          transition-colors duration-200
          ${
            error
              ? "border-red-400 focus:border-red-500"
              : "border-stone-300 focus:border-stone-600"
          }
        `}
      />

      {/* Pesan error */}
      {error && (
        <p className="font-sans text-[11px] text-red-400 mt-0.5">{error}</p>
      )}
    </div>
  );
}
