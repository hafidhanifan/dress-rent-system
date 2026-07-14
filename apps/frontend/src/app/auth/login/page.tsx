"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { saveAuth } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userName, setUserName] = useState("");

  // Redirect setelah popup muncul
  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => {
      // cek role dari localStorage, redirect sesuai dengan role
      const user = JSON.parse(localStorage.getItem("user") ?? "null");
      if (user?.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push(redirectTo);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [success, router, redirectTo]);

  const setField = (k: string, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
    if (errors.server) setErrors((p) => ({ ...p, server: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email.trim()) e.email = "Email wajib diisi";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Format email tidak valid";
    if (!form.password) e.password = "Password wajib diisi";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ server: data.message ?? "Email atau password salah" });
        return;
      }
      // Simpan auth
      saveAuth(data.access_token, data.user);
      setUserName(data.user.fullName?.split(" ")[0] ?? "");
      // Tampilkan popup sukses
      setSuccess(true);
    } catch {
      setErrors({ server: "Tidak dapat terhubung ke server" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0ebe3] flex">
      {/* ── Popup sukses ── */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f0ebe3]/80 backdrop-blur-sm">
          <div
            className="text-center px-12 py-14 bg-[#f0ebe3] border border-stone-200 shadow-2xl"
            style={{ animation: "fadeUp 0.5s ease forwards" }}
          >
            {/* Ikon centang */}
            <div className="w-12 h-12 rounded-full border border-stone-300 flex items-center justify-center mx-auto mb-6">
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#78716c"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
            </div>
            <p className="font-sans text-[9px] tracking-[0.35em] uppercase text-stone-400 mb-3">
              Login Berhasil
            </p>
            <h2
              className="font-serif font-[300] text-stone-800 mb-2"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2rem)" }}
            >
              Selamat datang{userName ? `, ${userName}` : ""}
            </h2>
            <p className="font-sans text-xs text-stone-400">
              Mengalihkan halaman...
            </p>
            {/* Progress bar */}
            <div className="mt-6 h-[1px] bg-stone-200 overflow-hidden">
              <div
                className="h-full bg-stone-500"
                style={{ animation: "progress 2s linear forwards" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Kiri: Visual Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#1a1714] flex-col justify-between p-14">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
            backgroundSize: "200px",
          }}
        />
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#d4b478]/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#d4b478]/30 to-transparent" />
        <div>
          <Link href="/" className="inline-block">
            <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-[#d4b478]/60 mb-1">
              Naia
            </p>
            <h2 className="font-serif font-[300] text-[#e8ddc8] text-2xl tracking-wide">
              Dress Rental
            </h2>
          </Link>
        </div>
        <div className="my-auto">
          <div className="w-8 h-[1px] bg-[#d4b478]/40 mb-8" />
          <blockquote
            className="font-serif font-[300] text-[#e8ddc8]/80 leading-relaxed"
            style={{ fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)" }}
          >
            Setiap gaun membawa{" "}
            <em className="italic text-[#d4b478]">kisahnya</em> sendiri.
          </blockquote>
          <div className="w-8 h-[1px] bg-[#d4b478]/40 mt-8" />
        </div>
        <div className="flex items-center gap-6">
          <div>
            <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-[#4a4440] mb-1">
              Koleksi
            </p>
            <p className="font-serif font-[300] text-[#c8baa0] text-lg">
              Premium
            </p>
          </div>
          <div className="w-[1px] h-8 bg-[#2a2520]" />
          <div>
            <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-[#4a4440] mb-1">
              Pengiriman
            </p>
            <p className="font-serif font-[300] text-[#c8baa0] text-lg">
              Semarang
            </p>
          </div>
        </div>
      </div>

      {/* ── Kanan: Form Panel ── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-20 py-16">
        <div className="lg:hidden mb-12">
          <Link href="/">
            <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-stone-400 mb-0.5">
              Naia
            </p>
            <h2 className="font-serif font-[300] text-stone-800 text-xl">
              Dress Rental
            </h2>
          </Link>
        </div>

        <div className="max-w-sm w-full mx-auto lg:mx-0">
          <div className="mb-10">
            <p className="font-sans text-[9px] tracking-[0.35em] uppercase text-stone-400 mb-3">
              Selamat Datang Kembali
            </p>
            <h1
              className="font-serif font-[300] text-stone-800 leading-tight"
              style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)" }}
            >
              Masuk ke <em className="italic">Akun</em>
            </h1>
          </div>

          {errors.server && (
            <div className="mb-6 px-4 py-3 border border-red-200 bg-red-50 rounded-sm">
              <p className="font-sans text-xs text-red-500">{errors.server}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block font-sans text-[9px] tracking-[0.25em] uppercase text-stone-400 mb-2">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="nama@email.com"
                className="w-full bg-transparent border-b py-3 font-sans text-sm text-stone-700 placeholder:text-stone-300 outline-none transition-colors duration-200"
                style={{ borderColor: errors.email ? "#fca5a5" : "#d6d3d1" }}
                onFocus={(e) => (e.target.style.borderColor = "#1c1917")}
                onBlur={(e) =>
                  (e.target.style.borderColor = errors.email
                    ? "#fca5a5"
                    : "#d6d3d1")
                }
              />
              {errors.email && (
                <p className="font-sans text-[10px] text-red-400 mt-1.5">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block font-sans text-[9px] tracking-[0.25em] uppercase text-stone-400">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="font-sans text-[9px] tracking-[0.1em] uppercase text-stone-400 hover:text-stone-600 transition-colors"
                >
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent border-b py-3 font-sans text-sm text-stone-700 placeholder:text-stone-300 outline-none transition-colors duration-200 pr-10"
                  style={{
                    borderColor: errors.password ? "#fca5a5" : "#d6d3d1",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#1c1917")}
                  onBlur={(e) =>
                    (e.target.style.borderColor = errors.password
                      ? "#fca5a5"
                      : "#d6d3d1")
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="font-sans text-[10px] text-red-400 mt-1.5">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 font-sans text-[10px] tracking-[0.3em] uppercase transition-all duration-300"
                style={{
                  background: loading ? "#d6d3d1" : "#1c1917",
                  color: loading ? "#a8a29e" : "#f0ebe3",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Memproses..." : "Masuk"}
              </button>
            </div>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-[1px] bg-stone-200" />
            <span className="font-sans text-[9px] tracking-[0.2em] uppercase text-stone-300">
              atau
            </span>
            <div className="flex-1 h-[1px] bg-stone-200" />
          </div>

          <p className="font-sans text-xs text-stone-400 text-center">
            Belum punya akun?{" "}
            <Link
              href="/auth/register"
              className="text-stone-700 underline underline-offset-4 hover:text-stone-900 transition-colors"
            >
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
