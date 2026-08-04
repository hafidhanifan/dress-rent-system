"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getToken, saveAuth } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type ProfileForm = {
  fullName: string;
  email: string;
  phone: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;

export default function ProfileForm() {
  const router = useRouter();
  const { user, loggedIn, ready } = useAuth();

  const [form, setForm] = useState<ProfileForm>({
    fullName: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState<
    Partial<ProfileForm> & { server?: string }
  >({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {},
  );
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (ready && !loggedIn) {
      router.push("/auth/login?redirect=/profile");
    }
  }, [ready, loggedIn, router]);

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
      });
    }
  }, [user]);

  const setField = (key: keyof ProfileForm, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
    if (success) setSuccess(false);
  };

  const validate = (): boolean => {
    const errs: Partial<ProfileForm> = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      errs.fullName = "Nama minimal 2 karakter";
    }
    if (!emailRegex.test(form.email)) {
      errs.email = "Format email tidak valid";
    }
    if (!phoneRegex.test(form.phone)) {
      errs.phone = "Format nomor HP tidak valid (contoh: 081234567890)";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setErrors((p) => ({ ...p, server: undefined }));

    try {
      const res = await fetch(`${API}/user/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        const msg = Array.isArray(data.message)
          ? data.message[0]
          : data.message;
        setErrors((p) => ({
          ...p,
          server: msg ?? "Gagal menyimpan perubahan",
        }));
        return;
      }

      // Update data user di localStorage supaya navbar dkk ikut ter-update
      const token = getToken();
      if (token) saveAuth(token, data);

      setSuccess(true);
    } catch {
      setErrors((p) => ({ ...p, server: "Tidak dapat terhubung ke server" }));
    } finally {
      setSaving(false);
    }
  };

  const validatePasswordForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!currentPassword) errs.currentPassword = "Password lama wajib diisi";
    if (!newPassword || newPassword.length < 6) {
      errs.newPassword = "Password baru minimal 6 karakter";
    }
    if (newPassword !== confirmPassword) {
      errs.confirmPassword = "Konfirmasi password tidak cocok";
    }
    setPasswordErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;
    setChangingPassword(true);
    setPasswordErrors((p) => ({ ...p, server: "" }));

    try {
      const res = await fetch(`${API}/user/me/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        const msg = Array.isArray(data.message)
          ? data.message[0]
          : data.message;
        setPasswordErrors((p) => ({
          ...p,
          server: msg ?? "Gagal mengubah password",
        }));
        return;
      }

      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordSuccess(false);
      }, 1500);
    } catch {
      setPasswordErrors((p) => ({
        ...p,
        server: "Tidak dapat terhubung ke server",
      }));
    } finally {
      setChangingPassword(false);
    }
  };

  if (!ready || !loggedIn) return null;

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: "100%",
    background: "transparent",
    border: `1px solid ${hasError ? "#f87171" : "var(--user-border)"}`,
    padding: "10px 14px",
    fontFamily: "inherit",
    fontSize: 14,
    color: "var(--user-text-secondary)",
    outline: "none",
    transition: "border-color 0.2s",
  });

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 9,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "var(--user-text-muted)",
    marginBottom: 8,
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--user-bg)" }}>
      {/* Header */}
      <div className="pt-32 pb-14 px-6 text-center">
        <p
          className="font-sans text-[9px] tracking-[0.35em] uppercase mb-3"
          style={{ color: "var(--user-text-muted)" }}
        >
          Akun Saya
        </p>
        <h1
          className="font-serif font-light leading-none"
          style={{
            fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
            color: "var(--user-text)",
          }}
        >
          Profil <em className="italic">Saya</em>
        </h1>
      </div>

      <div className="max-w-xl mx-auto px-6 pb-24">
        {/* ── Form data profil ── */}
        <div
          className="p-6 md:p-8"
          style={{ border: "1px solid var(--user-border)" }}
        >
          <h2
            className="font-serif font-light text-xl mb-6"
            style={{ color: "var(--user-text)" }}
          >
            Data Diri
          </h2>

          {errors.server && (
            <div
              className="mb-5 p-3"
              style={{
                background: "rgba(248,113,113,0.08)",
                border: "1px solid rgba(248,113,113,0.2)",
              }}
            >
              <p className="font-sans text-xs" style={{ color: "#f87171" }}>
                {errors.server}
              </p>
            </div>
          )}

          {success && (
            <div
              className="mb-5 p-3"
              style={{
                background: "rgba(74,124,90,0.08)",
                border: "1px solid rgba(74,124,90,0.2)",
              }}
            >
              <p className="font-sans text-xs" style={{ color: "#4a7c5a" }}>
                Perubahan berhasil disimpan
              </p>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label style={labelStyle}>Nama Lengkap</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => setField("fullName", e.target.value)}
                style={inputStyle(!!errors.fullName)}
              />
              {errors.fullName && (
                <p
                  className="font-sans text-[10px] mt-1.5"
                  style={{ color: "#f87171" }}
                >
                  {errors.fullName}
                </p>
              )}
            </div>

            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                style={inputStyle(!!errors.email)}
              />
              {errors.email && (
                <p
                  className="font-sans text-[10px] mt-1.5"
                  style={{ color: "#f87171" }}
                >
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label style={labelStyle}>Nomor HP / WhatsApp</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="081234567890"
                style={inputStyle(!!errors.phone)}
              />
              {errors.phone && (
                <p
                  className="font-sans text-[10px] mt-1.5"
                  style={{ color: "#f87171" }}
                >
                  {errors.phone}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full mt-7 py-3.5 font-sans text-[10px] tracking-[0.3em] uppercase transition-all duration-300"
            style={{
              background: saving ? "var(--user-border)" : "var(--user-text)",
              color: saving ? "var(--user-text-muted)" : "var(--user-bg)",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>

        {/* ── Ganti password ── */}
        <div
          className="mt-6 p-6 md:p-8"
          style={{ border: "1px solid var(--user-border)" }}
        >
          <button
            onClick={() => setShowPasswordForm((p) => !p)}
            className="w-full flex items-center justify-between"
          >
            <h2
              className="font-serif font-light text-xl"
              style={{ color: "var(--user-text)" }}
            >
              Ubah Password
            </h2>
            <span
              style={{
                color: "var(--user-text-muted)",
                transform: showPasswordForm ? "rotate(45deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            >
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
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </span>
          </button>

          {showPasswordForm && (
            <div className="mt-6 space-y-5">
              {passwordErrors.server && (
                <div
                  className="p-3"
                  style={{
                    background: "rgba(248,113,113,0.08)",
                    border: "1px solid rgba(248,113,113,0.2)",
                  }}
                >
                  <p className="font-sans text-xs" style={{ color: "#f87171" }}>
                    {passwordErrors.server}
                  </p>
                </div>
              )}

              {passwordSuccess && (
                <div
                  className="p-3"
                  style={{
                    background: "rgba(74,124,90,0.08)",
                    border: "1px solid rgba(74,124,90,0.2)",
                  }}
                >
                  <p className="font-sans text-xs" style={{ color: "#4a7c5a" }}>
                    Password berhasil diubah
                  </p>
                </div>
              )}

              <div>
                <label style={labelStyle}>Password Lama</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={inputStyle(!!passwordErrors.currentPassword)}
                />
                {passwordErrors.currentPassword && (
                  <p
                    className="font-sans text-[10px] mt-1.5"
                    style={{ color: "#f87171" }}
                  >
                    {passwordErrors.currentPassword}
                  </p>
                )}
              </div>

              <div>
                <label style={labelStyle}>Password Baru</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={inputStyle(!!passwordErrors.newPassword)}
                />
                {passwordErrors.newPassword && (
                  <p
                    className="font-sans text-[10px] mt-1.5"
                    style={{ color: "#f87171" }}
                  >
                    {passwordErrors.newPassword}
                  </p>
                )}
              </div>

              <div>
                <label style={labelStyle}>Konfirmasi Password Baru</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={inputStyle(!!passwordErrors.confirmPassword)}
                />
                {passwordErrors.confirmPassword && (
                  <p
                    className="font-sans text-[10px] mt-1.5"
                    style={{ color: "#f87171" }}
                  >
                    {passwordErrors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                onClick={handleChangePassword}
                disabled={changingPassword}
                className="w-full py-3.5 font-sans text-[10px] tracking-[0.3em] uppercase transition-all duration-300"
                style={{
                  background: changingPassword
                    ? "var(--user-border)"
                    : "var(--user-text)",
                  color: changingPassword
                    ? "var(--user-text-muted)"
                    : "var(--user-bg)",
                  cursor: changingPassword ? "not-allowed" : "pointer",
                }}
              >
                {changingPassword ? "Memproses..." : "Ubah Password"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
