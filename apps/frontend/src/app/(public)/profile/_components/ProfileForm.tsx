"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getToken, saveAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/apiFetch";

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

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
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

  const validateProfile = (): boolean => {
    const errs: Partial<ProfileFormData> = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2)
      errs.fullName = "Nama minimal 2 karakter";
    if (!emailRegex.test(form.email)) errs.email = "Format email tidak valid";
    if (!phoneRegex.test(form.phone)) errs.phone = "Format nomor tidak valid";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validateProfile()) return;
    setSaving(true);
    setErrors((p) => ({ ...p, server: undefined }));
    try {
      const res = await apiFetch(`${API}/user/me`, {
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
      // sinkronkan data user baru ke localStorage, biar navbar dkk ikut update
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
    if (!passwordForm.current) errs.current = "Password lama wajib diisi";
    if (!passwordForm.next || passwordForm.next.length < 6)
      errs.next = "Minimal 6 karakter";
    if (passwordForm.next !== passwordForm.confirm)
      errs.confirm = "Konfirmasi tidak cocok";
    setPasswordErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;
    setChangingPassword(true);
    setPasswordErrors((p) => ({ ...p, server: "" }));
    try {
      const res = await apiFetch(`${API}/user/me/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.next,
        }),
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
      setPasswordForm({ current: "", next: "", confirm: "" });
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
      <PageHeader firstName={user.fullName?.split(" ")[0]} />

      <div className="max-w-5xl mx-auto px-6 md:px-10 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-10 md:gap-16">
          <Sidebar
            user={user}
            memberSince={memberSince}
            activeTab={activeTab}
            onChangeTab={setActiveTab}
          />

          <div>
            {activeTab === "data" && (
              <DataTab
                form={form}
                errors={errors}
                saving={saving}
                success={success}
                onChangeField={setField}
                onSave={handleSave}
              />
            )}

            {activeTab === "security" && (
              <SecurityTab
                passwordForm={passwordForm}
                onChangePasswordForm={setPasswordForm}
                errors={passwordErrors}
                submitting={changingPassword}
                success={passwordSuccess}
                onSubmit={handleChangePassword}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// sapaan nama depan user di paling atas halaman
function PageHeader({ firstName }: { firstName?: string }) {
  return (
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
        Halo, <em className="italic">{firstName}</em>
      </h1>
    </div>
  );
}

// avatar, info singkat, dan navigasi tab (data diri / keamanan)
function Sidebar({
  user,
  memberSince,
  activeTab,
  onChangeTab,
}: {
  user: { fullName: string; email: string };
  memberSince: string | null;
  activeTab: "data" | "security";
  onChangeTab: (tab: "data" | "security") => void;
}) {
  const tabs = [
    { id: "data" as const, label: "Data Diri" },
    { id: "security" as const, label: "Keamanan" },
  ];

  return (
    <div>
      <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-0 mb-8 md:mb-10">
        <div
          className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shrink-0 md:mb-5"
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

      <div
        className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible"
        style={{ borderTop: "1px solid var(--user-border)", paddingTop: 20 }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className="text-left px-4 py-3 font-sans text-[10px] tracking-[0.15em] uppercase whitespace-nowrap transition-all duration-200"
            style={{
              background:
                activeTab === tab.id ? "var(--user-bg-alt)" : "transparent",
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
  );
}

// form nama, email, nomor hp
function DataTab({
  form,
  errors,
  saving,
  success,
  onChangeField,
  onSave,
}: {
  form: ProfileFormData;
  errors: Partial<ProfileFormData> & { server?: string };
  saving: boolean;
  success: boolean;
  onChangeField: (key: keyof ProfileFormData, value: string) => void;
  onSave: () => void;
}) {
  return (
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
          Perbarui informasi kontak yang digunakan admin untuk menghubungi Anda.
        </p>
      </div>

      {errors.server && <ErrorBanner message={errors.server} />}
      {success && <SuccessBanner message="Perubahan berhasil disimpan" />}

      <div className="space-y-6 max-w-md">
        <FormField
          label="Nama Lengkap"
          value={form.fullName}
          error={errors.fullName}
          onChange={(v) => onChangeField("fullName", v)}
        />
        <FormField
          label="Email"
          type="email"
          value={form.email}
          error={errors.email}
          onChange={(v) => onChangeField("email", v)}
        />
        <FormField
          label="Nomor HP / WhatsApp"
          type="tel"
          value={form.phone}
          error={errors.phone}
          placeholder="081234567890"
          onChange={(v) => onChangeField("phone", v)}
        />
      </div>

      <SubmitButton
        loading={saving}
        label="Simpan Perubahan"
        loadingLabel="Menyimpan..."
        onClick={onSave}
      />
    </div>
  );
}

// form password lama, baru, konfirmasi
function SecurityTab({
  passwordForm,
  onChangePasswordForm,
  errors,
  submitting,
  success,
  onSubmit,
}: {
  passwordForm: { current: string; next: string; confirm: string };
  onChangePasswordForm: (form: {
    current: string;
    next: string;
    confirm: string;
  }) => void;
  errors: Record<string, string>;
  submitting: boolean;
  success: boolean;
  onSubmit: () => void;
}) {
  const setField = (key: keyof typeof passwordForm, value: string) => {
    onChangePasswordForm({ ...passwordForm, [key]: value });
  };

  return (
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
          Perbarui password secara berkala untuk menjaga keamanan akun Anda.
        </p>
      </div>

      {errors.server && <ErrorBanner message={errors.server} />}
      {success && <SuccessBanner message="Password berhasil diubah" />}

      <div className="space-y-6 max-w-md">
        <FormField
          label="Password Lama"
          type="password"
          value={passwordForm.current}
          error={errors.current}
          onChange={(v) => setField("current", v)}
        />
        <div
          style={{ borderTop: "1px solid var(--user-border)", paddingTop: 24 }}
        >
          <FormField
            label="Password Baru"
            type="password"
            value={passwordForm.next}
            error={errors.next}
            onChange={(v) => setField("next", v)}
          />
        </div>
        <FormField
          label="Konfirmasi Password Baru"
          type="password"
          value={passwordForm.confirm}
          error={errors.confirm}
          onChange={(v) => setField("confirm", v)}
        />
      </div>

      <SubmitButton
        loading={submitting}
        label="Ubah Password"
        loadingLabel="Memproses..."
        onClick={onSubmit}
      />
    </div>
  );
}

// satu baris input + label + pesan error, dipakai di kedua tab
function FormField({
  label,
  value,
  error,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle(!!error)}
      />
      {error && (
        <p
          className="font-sans text-[10px] mt-1.5"
          style={{ color: "#f87171" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

// tombol submit di bawah form, teksnya berubah saat loading
function SubmitButton({
  loading,
  label,
  loadingLabel,
  onClick,
}: {
  loading: boolean;
  label: string;
  loadingLabel: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="mt-9 px-10 py-3.5 font-sans text-[10px] tracking-[0.3em] uppercase transition-all duration-300"
      style={{
        background: loading ? "var(--user-border)" : "var(--user-text)",
        color: loading ? "var(--user-text-muted)" : "var(--user-bg)",
        cursor: loading ? "not-allowed" : "pointer",
      }}
    >
      {loading ? loadingLabel : label}
    </button>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      className="mb-6 px-4 py-3 flex items-start gap-3"
      style={{
        background: "rgba(248,113,113,0.06)",
        border: "1px solid rgba(248,113,113,0.2)",
      }}
    >
      <p className="font-sans text-xs" style={{ color: "#f87171" }}>
        {message}
      </p>
    </div>
  );
}

function SuccessBanner({ message }: { message: string }) {
  return (
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
      <p className="font-sans text-xs" style={{ color: "#4a7c5a" }}>
        {message}
      </p>
    </div>
  );
}
