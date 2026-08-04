"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getToken, saveAuth } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type ProfileFormData = { fullName: string; email: string; phone: string };

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;

const inputStyle = (hasError: boolean): React.CSSProperties => ({
  width: "100%",
  background: "transparent",
  border: "none",
  borderBottom: `1px solid ${hasError ? "#f87171" : "var(--user-border)"}`,
  padding: "10px 2px",
  fontFamily: "inherit",
  fontSize: 15,
  color: "var(--user-text)",
  outline: "none",
  transition: "border-color 0.2s",
});

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 9,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: "var(--user-text-muted)",
  marginBottom: 10,
};

export default function ProfileForm() {
  const router = useRouter();
  const { user, loggedIn, ready } = useAuth();
  const [activeTab, setActiveTab] = useState<"data" | "security">("data");

  // ── Data diri ──
  const [form, setForm] = useState<ProfileFormData>({
    fullName: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState<
    Partial<ProfileFormData> & { server?: string }
  >({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // ── Ganti password ──
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {},
  );
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (ready && !loggedIn) router.push("/auth/login?redirect=/profile");
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

  const setField = (key: keyof ProfileFormData, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
    if (success) setSuccess(false);
  };

  const validate = (): boolean => {
    const errs: Partial<ProfileFormData> = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2)
      errs.fullName = "Nama minimal 2 karakter";
    if (!emailRegex.test(form.email)) errs.email = "Format email tidak valid";
    if (!phoneRegex.test(form.phone)) errs.phone = "Format nomor tidak valid";
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
    if (!newPassword || newPassword.length < 6)
      errs.newPassword = "Minimal 6 karakter";
    if (newPassword !== confirmPassword)
      errs.confirmPassword = "Konfirmasi tidak cocok";
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
      setTimeout(() => setPasswordSuccess(false), 2500);
    } catch {
      setPasswordErrors((p) => ({
        ...p,
        server: "Tidak dapat terhubung ke server",
      }));
    } finally {
      setChangingPassword(false);
    }
  };

  if (!ready || !loggedIn || !user) return null;

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen" style={{ background: "var(--user-bg)" }}>
      {/* Header */}
      <div className="pt-28 pb-4 px-6 md:px-10 max-w-5xl mx-auto">
        <p
          className="font-sans text-[9px] tracking-[0.35em] uppercase mb-3"
          style={{ color: "var(--user-text-muted)" }}
        >
          Akun Saya
        </p>
        <h1
          className="font-serif font-light leading-none"
          style={{
            fontSize: "clamp(2rem, 4.5vw, 3.2rem)",
            color: "var(--user-text)",
          }}
        >
          Halo, <em className="italic">{user.fullName?.split(" ")[0]}</em>
        </h1>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-10 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-10 md:gap-16">
          {/* ══════════════ Sidebar ══════════════ */}
          <div>
            {/* Avatar + info */}
            <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-0 mb-8 md:mb-10">
              <div
                className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center flex-shrink-0 md:mb-5"
                style={{ background: "var(--user-text)" }}
              >
                <span
                  className="font-serif font-light"
                  style={{ fontSize: "1.8rem", color: "var(--user-bg)" }}
                >
                  {user.fullName?.charAt(0).toUpperCase() ?? "U"}
                </span>
              </div>
              <div>
                <p
                  className="font-serif font-light text-lg leading-tight"
                  style={{ color: "var(--user-text)" }}
                >
                  {user.fullName}
                </p>
                <p
                  className="font-sans text-xs mt-1"
                  style={{ color: "var(--user-text-muted)" }}
                >
                  {user.email}
                </p>
                {memberSince && (
                  <p
                    className="font-sans text-[9px] tracking-[0.15em] uppercase mt-2"
                    style={{ color: "var(--user-text-faint)" }}
                  >
                    Member sejak {memberSince}
                  </p>
                )}
              </div>
            </div>

            {/* Tab nav */}
            <div
              className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible"
              style={{
                borderTop: "1px solid var(--user-border)",
                paddingTop: 20,
              }}
            >
              {[
                { id: "data" as const, label: "Data Diri" },
                { id: "security" as const, label: "Keamanan" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="text-left px-4 py-3 font-sans text-[10px] tracking-[0.15em] uppercase whitespace-nowrap transition-all duration-200"
                  style={{
                    background:
                      activeTab === tab.id
                        ? "var(--user-bg-alt)"
                        : "transparent",
                    color:
                      activeTab === tab.id
                        ? "var(--user-text)"
                        : "var(--user-text-muted)",
                    borderLeft: `2px solid ${activeTab === tab.id ? "var(--user-text)" : "transparent"}`,
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ══════════════ Content ══════════════ */}
          <div>
            {/* ── Tab: Data Diri ── */}
            {activeTab === "data" && (
              <div>
                <div className="mb-8">
                  <h2
                    className="font-serif font-light text-2xl mb-2"
                    style={{ color: "var(--user-text)" }}
                  >
                    Data Diri
                  </h2>
                  <p
                    className="font-sans text-sm"
                    style={{ color: "var(--user-text-muted)" }}
                  >
                    Perbarui informasi kontak yang digunakan admin untuk
                    menghubungi Anda.
                  </p>
                </div>

                {errors.server && (
                  <div
                    className="mb-6 px-4 py-3 flex items-start gap-3"
                    style={{
                      background: "rgba(248,113,113,0.06)",
                      border: "1px solid rgba(248,113,113,0.2)",
                    }}
                  >
                    <p
                      className="font-sans text-xs"
                      style={{ color: "#f87171" }}
                    >
                      {errors.server}
                    </p>
                  </div>
                )}

                {success && (
                  <div
                    className="mb-6 px-4 py-3 flex items-center gap-3"
                    style={{
                      background: "rgba(74,124,90,0.06)",
                      border: "1px solid rgba(74,124,90,0.2)",
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="#4a7c5a"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4.5 12.75 6 6 9-13.5"
                      />
                    </svg>
                    <p
                      className="font-sans text-xs"
                      style={{ color: "#4a7c5a" }}
                    >
                      Perubahan berhasil disimpan
                    </p>
                  </div>
                )}

                <div className="space-y-6 max-w-md">
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
                  className="mt-9 px-10 py-3.5 font-sans text-[10px] tracking-[0.3em] uppercase transition-all duration-300"
                  style={{
                    background: saving
                      ? "var(--user-border)"
                      : "var(--user-text)",
                    color: saving ? "var(--user-text-muted)" : "var(--user-bg)",
                    cursor: saving ? "not-allowed" : "pointer",
                  }}
                >
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            )}

            {/* ── Tab: Keamanan ── */}
            {activeTab === "security" && (
              <div>
                <div className="mb-8">
                  <h2
                    className="font-serif font-light text-2xl mb-2"
                    style={{ color: "var(--user-text)" }}
                  >
                    Keamanan
                  </h2>
                  <p
                    className="font-sans text-sm"
                    style={{ color: "var(--user-text-muted)" }}
                  >
                    Perbarui password secara berkala untuk menjaga keamanan akun
                    Anda.
                  </p>
                </div>

                {passwordErrors.server && (
                  <div
                    className="mb-6 px-4 py-3"
                    style={{
                      background: "rgba(248,113,113,0.06)",
                      border: "1px solid rgba(248,113,113,0.2)",
                    }}
                  >
                    <p
                      className="font-sans text-xs"
                      style={{ color: "#f87171" }}
                    >
                      {passwordErrors.server}
                    </p>
                  </div>
                )}

                {passwordSuccess && (
                  <div
                    className="mb-6 px-4 py-3 flex items-center gap-3"
                    style={{
                      background: "rgba(74,124,90,0.06)",
                      border: "1px solid rgba(74,124,90,0.2)",
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="#4a7c5a"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4.5 12.75 6 6 9-13.5"
                      />
                    </svg>
                    <p
                      className="font-sans text-xs"
                      style={{ color: "#4a7c5a" }}
                    >
                      Password berhasil diubah
                    </p>
                  </div>
                )}

                <div className="space-y-6 max-w-md">
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

                  <div
                    style={{
                      borderTop: "1px solid var(--user-border)",
                      paddingTop: 24,
                    }}
                  >
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
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="mt-9 px-10 py-3.5 font-sans text-[10px] tracking-[0.3em] uppercase transition-all duration-300"
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
    </div>
  );
}
