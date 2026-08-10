"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const GOLD = "var(--admin-accent)";
const BORDER = "var(--admin-border)";
const API = process.env.NEXT_PUBLIC_API_URL;
const IMG_BASE = "http://localhost:3001";
const SIZE_LABELS = ["XS", "S", "M", "L", "XL", "XXL", "Custom"];
const SIZE_FIELDS = [
  { key: "bust", label: "Bust (cm)" },
  { key: "waist", label: "Waist (cm)" },
  { key: "hip", label: "Hip (cm)" },
  { key: "length", label: "Length (cm)" },
  { key: "stock", label: "Stok" },
] as const;

type Category = { id: number; name: string };
type DressPhoto = {
  id: number;
  url: string;
  isThumbnail: boolean;
  order: number;
};
type DressSize = {
  id?: number;
  label: string;
  bust: string;
  waist: string;
  hip: string;
  length: string;
  stock: string;
};
type Dress = {
  id: number;
  name: string;
  slug: string;
  description: string;
  pricePerDay: number;
  minRentalDays: number;
  status: "available" | "unavailable" | "archived";
  condition: "new" | "good" | "fair";
  color: string;
  material: string;
  isActive: boolean;
  categoryId: number;
  category: Category;
  photos: DressPhoto[];
  sizes: DressSize[];
  spotlightOrder: number | null;
  displayOrder: number | null;
};
type DressForm = {
  name: string;
  description: string;
  pricePerDay: string;
  minRentalDays: string;
  status: "available" | "unavailable" | "archived";
  condition: "new" | "good" | "fair";
  color: string;
  material: string;
  isActive: boolean;
  categoryId: string;
  sizes: DressSize[];
  isSpotlight: boolean;
  spotlightOrder: string;
  displayOrder: string;
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(0,0,0,0.03)",
  border: "1px solid var(--admin-border)",
  borderRadius: 3,
  padding: "9px 12px",
  fontSize: 13,
  color: "var(--admin-text)",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 0.2s",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 9,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: "var(--admin-text-muted)",
  marginBottom: 6,
};

const emptySize = (): DressSize => ({
  label: "M",
  bust: "",
  waist: "",
  hip: "",
  length: "",
  stock: "1",
});

const emptyForm = (): DressForm => ({
  name: "",
  description: "",
  pricePerDay: "",
  minRentalDays: "1",
  status: "available",
  condition: "good",
  color: "",
  material: "",
  isActive: true,
  categoryId: "",
  sizes: [emptySize()],
  isSpotlight: false,
  spotlightOrder: "1",
  displayOrder: "",
});

// isi form awal dari data dress (mode edit) atau kosong (mode tambah)
function buildInitialForm(dress?: Dress): DressForm {
  if (!dress) return emptyForm();
  return {
    name: dress.name,
    description: dress.description ?? "",
    pricePerDay: String(dress.pricePerDay),
    minRentalDays: String(dress.minRentalDays),
    status: dress.status,
    condition: dress.condition,
    color: dress.color ?? "",
    material: dress.material ?? "",
    isActive: dress.isActive,
    categoryId: String(dress.categoryId),
    sizes: dress.sizes?.length
      ? dress.sizes.map((s) => ({
          ...s,
          bust: String(s.bust ?? ""),
          waist: String(s.waist ?? ""),
          hip: String(s.hip ?? ""),
          length: String(s.length ?? ""),
          stock: String(s.stock ?? "1"),
        }))
      : [emptySize()],
    isSpotlight:
      dress.spotlightOrder !== null && dress.spotlightOrder !== undefined,
    spotlightOrder: dress.spotlightOrder ? String(dress.spotlightOrder) : "1",
    displayOrder: dress.displayOrder ? String(dress.displayOrder) : "",
  };
}

export default function DressModal({
  mode,
  dress,
  categories,
  onClose,
  onSuccess,
  onSetThumbnail,
  onDeletePhoto,
}: {
  mode: "add" | "edit";
  dress?: Dress;
  categories: Category[];
  onClose: () => void;
  onSuccess: (id: number) => void;
  onSetThumbnail: (dressId: number, photoId: number) => void;
  onDeletePhoto: (dressId: number, photoId: number) => void;
}) {
  const [form, setForm] = useState<DressForm>(() => buildInitialForm(dress));
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "sizes" | "photos">(
    "info",
  );
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // generate preview foto baru yang belum diupload, bersihkan URL lama tiap ganti
  useEffect(() => {
    const urls = newPhotos.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [newPhotos]);

  const setField = (k: keyof DressForm, v: unknown) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
  };

  const addSize = () =>
    setForm((p) => ({ ...p, sizes: [...p.sizes, emptySize()] }));
  const removeSize = (i: number) =>
    setForm((p) => ({ ...p, sizes: p.sizes.filter((_, idx) => idx !== i) }));
  const setSize = (i: number, k: keyof DressSize, v: string) =>
    setForm((p) => ({
      ...p,
      sizes: p.sizes.map((s, idx) => (idx === i ? { ...s, [k]: v } : s)),
    }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Nama wajib diisi";
    if (!form.pricePerDay || Number(form.pricePerDay) <= 0)
      errs.pricePerDay = "Harga wajib diisi";
    if (!form.categoryId) errs.categoryId = "Kategori wajib dipilih";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSpotlightToggle = (checked: boolean) => {
    setField("isSpotlight", checked);
    // kalau admin aktifkan spotlight, pastikan "tampilkan di website" juga
    // otomatis aktif — supaya tidak ada kombinasi janggal (spotlight nyala
    // tapi dress tidak muncul di manapun)
    if (checked && !form.isActive) setField("isActive", true);
  };

  const handleSubmit = async () => {
    if (!validate()) {
      setActiveTab("info");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("pricePerDay", form.pricePerDay);
      fd.append("minRentalDays", form.minRentalDays);
      fd.append("status", form.status);
      fd.append("condition", form.condition);
      fd.append("color", form.color);
      fd.append("material", form.material);
      fd.append("isActive", String(form.isActive));
      fd.append("spotlightOrder", form.isSpotlight ? form.spotlightOrder : "");
      fd.append("displayOrder", form.displayOrder);
      fd.append("categoryId", form.categoryId);
      fd.append(
        "sizes",
        JSON.stringify(
          form.sizes.map((s) => ({
            // kirim id kalau size ini sudah ada (mode edit) -> backend
            // tahu ini update, bukan bikin size baru
            id: s.id ?? undefined,
            label: s.label,
            bust: s.bust ? Number(s.bust) : null,
            waist: s.waist ? Number(s.waist) : null,
            hip: s.hip ? Number(s.hip) : null,
            length: s.length ? Number(s.length) : null,
            stock: Number(s.stock) || 1,
          })),
        ),
      );
      newPhotos.forEach((f) => fd.append("photos", f));

      const url =
        mode === "add" ? `${API}/dresses` : `${API}/dresses/${dress!.id}`;
      const res = await fetch(url, {
        method: mode === "add" ? "POST" : "PATCH",
        body: fd,
      });
      const data = await res.json();

      if (!res.ok) {
        const msg = Array.isArray(data.message)
          ? data.message[0]
          : data.message;
        setErrors({ server: msg ?? "Terjadi kesalahan" });
        setSubmitting(false);
        return;
      }

      onSuccess(data.id);
      onClose();
    } catch {
      setErrors({ server: "Tidak dapat terhubung ke server" });
    } finally {
      setSubmitting(false);
    }
  };

  const tabs: { key: "info" | "sizes" | "photos"; label: string }[] = [
    { key: "info", label: "Info Dasar" },
    { key: "sizes", label: `Ukuran (${form.sizes.length})` },
    {
      key: "photos",
      label: `Foto (${(dress?.photos?.length ?? 0) + newPhotos.length})`,
    },
  ];

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(0,0,0,0.8)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 600,
          background: "var(--admin-bg)",
          border: `1px solid ${BORDER}`,
          borderRadius: 6,
          boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ModalHeader
          mode={mode}
          title={mode === "add" ? "Dress Baru" : dress?.name}
          onClose={onClose}
        />
        <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <div style={{ overflowY: "auto", flex: 1, padding: "20px 24px" }}>
          {errors.server && <ErrorAlert message={errors.server} />}

          {activeTab === "info" && (
            <InfoTab
              form={form}
              categories={categories}
              errors={errors}
              onChangeField={setField}
              onToggleSpotlight={handleSpotlightToggle}
            />
          )}

          {activeTab === "sizes" && (
            <SizesTab
              sizes={form.sizes}
              onAdd={addSize}
              onRemove={removeSize}
              onChangeSize={setSize}
            />
          )}

          {activeTab === "photos" && (
            <PhotosTab
              mode={mode}
              dress={dress}
              newPhotos={newPhotos}
              previewUrls={previewUrls}
              fileRef={fileRef}
              onAddPhotos={(files) => setNewPhotos((p) => [...p, ...files])}
              onRemoveNewPhoto={(i) =>
                setNewPhotos((p) => p.filter((_, idx) => idx !== i))
              }
              onSetThumbnail={onSetThumbnail}
              onDeletePhoto={onDeletePhoto}
            />
          )}
        </div>

        <ModalFooter
          mode={mode}
          submitting={submitting}
          onClose={onClose}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

// judul modal + tombol tutup
function ModalHeader({
  mode,
  title,
  onClose,
}: {
  mode: "add" | "edit";
  title?: string;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        padding: "18px 24px",
        borderBottom: `1px solid ${BORDER}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexShrink: 0,
      }}
    >
      <div>
        <p
          style={{
            fontSize: 9,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "var(--admin-text-muted)",
            marginBottom: 3,
          }}
        >
          {mode === "add" ? "Tambah" : "Edit"} Dress
        </p>
        <h2
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: 20,
            fontWeight: 300,
            color: "var(--admin-text)",
          }}
        >
          {title}
        </h2>
      </div>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--admin-text-faint)",
          padding: 4,
        }}
      >
        <CloseIcon />
      </button>
    </div>
  );
}

// 3 tab: info dasar, ukuran, foto
function TabBar({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: { key: "info" | "sizes" | "photos"; label: string }[];
  activeTab: "info" | "sizes" | "photos";
  onChange: (tab: "info" | "sizes" | "photos") => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        borderBottom: `1px solid ${BORDER}`,
        flexShrink: 0,
      }}
    >
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          style={{
            flex: 1,
            padding: "10px 16px",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 10,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: activeTab === t.key ? GOLD : "var(--admin-text-muted)",
            borderBottom: `2px solid ${activeTab === t.key ? GOLD : "transparent"}`,
            transition: "color 0.2s, border-color 0.2s",
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <div
      style={{
        background: "rgba(248,113,113,0.08)",
        border: "1px solid rgba(248,113,113,0.2)",
        borderRadius: 3,
        padding: "10px 14px",
        marginBottom: 16,
      }}
    >
      <p style={{ fontSize: 12, color: "#f87171" }}>{message}</p>
    </div>
  );
}

// tab info dasar: nama, kategori, harga, kondisi, toggle website & spotlight
function InfoTab({
  form,
  categories,
  errors,
  onChangeField,
  onToggleSpotlight,
}: {
  form: DressForm;
  categories: Category[];
  errors: Record<string, string>;
  onChangeField: (k: keyof DressForm, v: unknown) => void;
  onToggleSpotlight: (checked: boolean) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label style={labelStyle}>Nama Dress *</label>
        <input
          value={form.name}
          onChange={(e) => onChangeField("name", e.target.value)}
          placeholder="Aurelia Evening Gown"
          style={{
            ...inputStyle,
            borderColor: errors.name
              ? "rgba(248,113,113,0.5)"
              : "var(--admin-border)",
          }}
        />
        {errors.name && (
          <p style={{ fontSize: 10, color: "#f87171", marginTop: 4 }}>
            {errors.name}
          </p>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={labelStyle}>Kategori *</label>
          <select
            value={form.categoryId}
            onChange={(e) => onChangeField("categoryId", e.target.value)}
            style={{
              ...inputStyle,
              appearance: "none",
              cursor: "pointer",
              borderColor: errors.categoryId
                ? "rgba(248,113,113,0.5)"
                : "var(--admin-border)",
            }}
          >
            <option value="">Pilih kategori...</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p style={{ fontSize: 10, color: "#f87171", marginTop: 4 }}>
              {errors.categoryId}
            </p>
          )}
        </div>
        <div>
          <label style={labelStyle}>Status</label>
          <select
            value={form.status}
            onChange={(e) =>
              onChangeField("status", e.target.value as DressForm["status"])
            }
            style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
          >
            <option value="available">Tersedia</option>
            <option value="unavailable">Tidak Tersedia</option>
            <option value="archived">Diarsipkan</option>
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={labelStyle}>Harga Sewa / Hari *</label>
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 11,
                color: "var(--admin-text-muted)",
              }}
            >
              Rp
            </span>
            <input
              type="number"
              value={form.pricePerDay}
              onChange={(e) => onChangeField("pricePerDay", e.target.value)}
              placeholder="350000"
              style={{
                ...inputStyle,
                paddingLeft: 34,
                borderColor: errors.pricePerDay
                  ? "rgba(248,113,113,0.5)"
                  : "var(--admin-border)",
              }}
            />
          </div>
          {errors.pricePerDay && (
            <p style={{ fontSize: 10, color: "#f87171", marginTop: 4 }}>
              {errors.pricePerDay}
            </p>
          )}
        </div>
        <div>
          <label style={labelStyle}>Min. Hari Sewa</label>
          <input
            type="number"
            min="1"
            value={form.minRentalDays}
            onChange={(e) => onChangeField("minRentalDays", e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Urutan di Halaman Dresses</label>
          <input
            type="number"
            min="1"
            value={form.displayOrder}
            onChange={(e) => onChangeField("displayOrder", e.target.value)}
            placeholder="Kosongkan = default (terbaru duluan)"
            style={inputStyle}
          />
          <p
            style={{
              fontSize: 9,
              color: "var(--admin-text-faint)",
              marginTop: 4,
            }}
          >
            Angka kecil tampil lebih dulu
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={labelStyle}>Kondisi</label>
          <select
            value={form.condition}
            onChange={(e) =>
              onChangeField(
                "condition",
                e.target.value as DressForm["condition"],
              )
            }
            style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
          >
            <option value="new">Baru</option>
            <option value="good">Baik</option>
            <option value="fair">Cukup</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Warna</label>
          <input
            value={form.color}
            onChange={(e) => onChangeField("color", e.target.value)}
            placeholder="Dusty Rose"
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={labelStyle}>Material / Bahan</label>
          <input
            value={form.material}
            onChange={(e) => onChangeField("material", e.target.value)}
            placeholder="Chiffon, Silk..."
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Tampilkan di Website</label>
          <ToggleSwitch
            checked={form.isActive}
            onChange={(v) => onChangeField("isActive", v)}
            activeColor="#34d399"
            activeBg="rgba(52,211,153,0.05)"
            activeBorder="rgba(52,211,153,0.3)"
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={labelStyle}>Tampilkan di Spotlight</label>
          <ToggleSwitch
            checked={form.isSpotlight}
            onChange={onToggleSpotlight}
            activeColor={GOLD}
            activeBg="var(--admin-accent-bg)"
            activeBorder="rgba(212,180,120,0.4)"
          />
          <p
            style={{
              fontSize: 9,
              color: "var(--admin-text-faint)",
              marginTop: 4,
            }}
          >
            Otomatis mengaktifkan &quot;Tampilkan di Website&quot;
          </p>
        </div>

        {form.isSpotlight && (
          <div>
            <label style={labelStyle}>Urutan Tampil</label>
            <input
              type="number"
              min="1"
              value={form.spotlightOrder}
              onChange={(e) => onChangeField("spotlightOrder", e.target.value)}
              placeholder="1"
              style={inputStyle}
            />
            <p
              style={{
                fontSize: 9,
                color: "var(--admin-text-faint)",
                marginTop: 4,
              }}
            >
              Angka kecil tampil lebih dulu
            </p>
          </div>
        )}
      </div>

      <div>
        <label style={labelStyle}>Deskripsi</label>
        <textarea
          value={form.description}
          onChange={(e) => onChangeField("description", e.target.value)}
          rows={3}
          placeholder="Deskripsi dress..."
          style={{ ...inputStyle, resize: "none" }}
        />
      </div>
    </div>
  );
}

// toggle switch pill, dipakai buat isActive & isSpotlight
function ToggleSwitch({
  checked,
  onChange,
  activeColor,
  activeBg,
  activeBorder,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  activeColor: string;
  activeBg: string;
  activeBorder: string;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 12px",
        borderRadius: 3,
        cursor: "pointer",
        border: `1px solid ${checked ? activeBorder : BORDER}`,
        background: checked ? activeBg : "rgba(0,0,0,0.02)",
        transition: "border-color 0.2s, background-color 0.2s",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ display: "none" }}
      />
      <div
        style={{
          width: 32,
          height: 18,
          borderRadius: 9,
          position: "relative",
          background: checked ? activeBg : "var(--admin-border)",
          border: `1px solid ${checked ? activeBorder : BORDER}`,
          transition: "border-color 0.2s, background-color 0.2s",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 2,
            left: checked ? 14 : 2,
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: checked ? activeColor : "var(--admin-text-faint)",
            transition: "left 0.2s, background-color 0.2s",
          }}
        />
      </div>
      <span
        style={{
          fontSize: 12,
          color: checked ? activeColor : "var(--admin-text-muted)",
        }}
      >
        {checked ? "Aktif" : "Nonaktif"}
      </span>
    </label>
  );
}

// tab ukuran: daftar size dengan measurement, bisa tambah/hapus
function SizesTab({
  sizes,
  onAdd,
  onRemove,
  onChangeSize,
}: {
  sizes: DressSize[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  onChangeSize: (i: number, k: keyof DressSize, v: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 4,
        }}
      >
        <p style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>
          Semua ukuran dalam{" "}
          <span style={{ color: GOLD }}>sentimeter (cm)</span>
        </p>
        <button
          onClick={onAdd}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "var(--admin-accent-bg)",
            border: "1px solid var(--admin-accent-border)",
            color: GOLD,
            fontSize: 10,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "6px 12px",
            borderRadius: 3,
            cursor: "pointer",
          }}
        >
          <PlusIcon />
          Tambah Ukuran
        </button>
      </div>

      {sizes.map((size, i) => (
        <SizeCard
          key={i}
          index={i}
          size={size}
          canRemove={sizes.length > 1}
          onRemove={() => onRemove(i)}
          onChange={(k, v) => onChangeSize(i, k, v)}
        />
      ))}
    </div>
  );
}

// satu kartu ukuran: label + measurement 5 field
function SizeCard({
  index,
  size,
  canRemove,
  onRemove,
  onChange,
}: {
  index: number;
  size: DressSize;
  canRemove: boolean;
  onRemove: () => void;
  onChange: (k: keyof DressSize, v: string) => void;
}) {
  return (
    <div
      style={{
        background: "rgba(0,0,0,0.02)",
        border: `1px solid ${BORDER}`,
        borderRadius: 4,
        padding: "14px 16px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <p style={{ fontSize: 11, color: GOLD, letterSpacing: "0.1em" }}>
          Ukuran #{index + 1}
        </p>
        {canRemove && (
          <button
            onClick={onRemove}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 10,
              color: "var(--admin-danger)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Hapus
          </button>
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Label Ukuran</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {SIZE_LABELS.map((l) => (
            <button
              key={l}
              onClick={() => onChange("label", l)}
              style={{
                padding: "5px 12px",
                borderRadius: 3,
                fontSize: 11,
                cursor: "pointer",
                border: `1px solid ${size.label === l ? "var(--admin-accent-border)" : BORDER}`,
                background:
                  size.label === l ? "var(--admin-accent-bg)" : "transparent",
                color: size.label === l ? GOLD : "var(--admin-text-muted)",
                transition:
                  "border-color 0.15s, background-color 0.15s, color 0.15s",
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(100px,1fr))",
          gap: 10,
        }}
      >
        {SIZE_FIELDS.map((f) => (
          <div key={f.key}>
            <label style={{ ...labelStyle, fontSize: 8 }}>{f.label}</label>
            <div style={{ position: "relative" }}>
              <input
                type="number"
                min="0"
                value={size[f.key]}
                onChange={(e) => onChange(f.key, e.target.value)}
                placeholder={f.key === "stock" ? "1" : "0"}
                style={{
                  ...inputStyle,
                  paddingRight: f.key !== "stock" ? 28 : 12,
                  fontSize: 12,
                }}
              />
              {f.key !== "stock" && (
                <span
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 9,
                    color: "var(--admin-text-faint)",
                  }}
                >
                  cm
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// tab foto: foto tersimpan (mode edit) + upload foto baru
function PhotosTab({
  mode,
  dress,
  newPhotos,
  previewUrls,
  fileRef,
  onAddPhotos,
  onRemoveNewPhoto,
  onSetThumbnail,
  onDeletePhoto,
}: {
  mode: "add" | "edit";
  dress?: Dress;
  newPhotos: File[];
  previewUrls: string[];
  fileRef: React.RefObject<HTMLInputElement | null>;
  onAddPhotos: (files: File[]) => void;
  onRemoveNewPhoto: (i: number) => void;
  onSetThumbnail: (dressId: number, photoId: number) => void;
  onDeletePhoto: (dressId: number, photoId: number) => void;
}) {
  const savedPhotos =
    mode === "edit" && dress?.photos?.length
      ? [...dress.photos].sort((a, b) => a.order - b.order)
      : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {savedPhotos.length > 0 && dress && (
        <div>
          <p style={{ ...labelStyle, marginBottom: 10 }}>Foto Tersimpan</p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(100px,1fr))",
              gap: 10,
            }}
          >
            {savedPhotos.map((photo) => (
              <SavedPhotoCard
                key={photo.id}
                photo={photo}
                onSetThumbnail={() => onSetThumbnail(dress.id, photo.id)}
                onDelete={() => onDeletePhoto(dress.id, photo.id)}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <p style={{ ...labelStyle, marginBottom: 10 }}>
          {mode === "edit" ? "Tambah Foto Baru" : "Upload Foto"}
        </p>
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border: "2px dashed var(--admin-border)",
            borderRadius: 4,
            padding: "24px 16px",
            textAlign: "center",
            cursor: "pointer",
            transition: "border-color 0.2s",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.borderColor = "var(--admin-accent-border)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.borderColor = "var(--admin-border)")
          }
        >
          <UploadIcon />
          <p
            style={{
              fontSize: 12,
              color: "var(--admin-text-muted)",
              marginBottom: 4,
            }}
          >
            Klik untuk pilih foto
          </p>
          <p style={{ fontSize: 10, color: "var(--admin-text-faint)" }}>
            JPG, PNG, WEBP, AVIF · Maks 5MB · Maks 10 foto
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => onAddPhotos(Array.from(e.target.files ?? []))}
            style={{ display: "none" }}
          />
        </div>

        {previewUrls.length > 0 && (
          <div
            style={{
              marginTop: 12,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(80px,1fr))",
              gap: 8,
            }}
          >
            {previewUrls.map((url, i) => (
              <NewPhotoPreview
                key={i}
                url={url}
                isCover={i === 0 && mode === "add"}
                onRemove={() => onRemoveNewPhoto(i)}
              />
            ))}
          </div>
        )}

        {mode === "add" && newPhotos.length > 0 && (
          <p
            style={{
              fontSize: 10,
              color: "var(--admin-text-muted)",
              marginTop: 8,
            }}
          >
            Foto pertama akan otomatis dijadikan cover thumbnail.
          </p>
        )}
      </div>
    </div>
  );
}

// satu foto yang sudah tersimpan di server, dengan tombol set cover / hapus
function SavedPhotoCard({
  photo,
  onSetThumbnail,
  onDelete,
}: {
  photo: DressPhoto;
  onSetThumbnail: () => void;
  onDelete: () => void;
}) {
  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          aspectRatio: "3/4",
          background: "rgba(0,0,0,0.04)",
          borderRadius: 3,
          overflow: "hidden",
          position: "relative",
          border: `2px solid ${photo.isThumbnail ? GOLD : BORDER}`,
        }}
      >
        <Image
          src={`${IMG_BASE}${photo.url}`}
          alt=""
          fill
          style={{ objectFit: "cover", objectPosition: "top" }}
        />
        {photo.isThumbnail && (
          <div
            style={{
              position: "absolute",
              top: 4,
              left: 4,
              background: "var(--admin-accent-bg)",
              border: "1px solid var(--admin-accent-border)",
              padding: "2px 6px",
              borderRadius: 2,
            }}
          >
            <p
              style={{
                fontSize: 8,
                color: GOLD,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Cover
            </p>
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
        {!photo.isThumbnail && (
          <button
            onClick={onSetThumbnail}
            style={{
              flex: 1,
              background: "var(--admin-accent-bg)",
              border: "1px solid var(--admin-accent-border)",
              color: GOLD,
              fontSize: 8,
              padding: "4px 0",
              borderRadius: 2,
              cursor: "pointer",
            }}
          >
            Set Cover
          </button>
        )}
        <button
          onClick={onDelete}
          style={{
            flex: 1,
            background: "rgba(248,113,113,0.06)",
            border: "1px solid rgba(248,113,113,0.2)",
            color: "#f87171",
            fontSize: 8,
            padding: "4px 0",
            borderRadius: 2,
            cursor: "pointer",
          }}
        >
          Hapus
        </button>
      </div>
    </div>
  );
}

// preview foto baru yang belum diupload, dengan tombol hapus
function NewPhotoPreview({
  url,
  isCover,
  onRemove,
}: {
  url: string;
  isCover: boolean;
  onRemove: () => void;
}) {
  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          aspectRatio: "3/4",
          background: "rgba(0,0,0,0.04)",
          borderRadius: 3,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Image
          src={url}
          alt=""
          fill
          style={{ objectFit: "cover", objectPosition: "top" }}
          unoptimized
        />
        {isCover && (
          <div
            style={{
              position: "absolute",
              top: 3,
              left: 3,
              background: "var(--admin-accent-bg)",
              padding: "2px 5px",
              borderRadius: 2,
            }}
          >
            <p style={{ fontSize: 7, color: GOLD }}>COVER</p>
          </div>
        )}
      </div>
      <button
        onClick={onRemove}
        style={{
          position: "absolute",
          top: 3,
          right: 3,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.5)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#f87171",
          fontSize: 10,
        }}
      >
        ×
      </button>
    </div>
  );
}

// tombol batal + simpan di bawah modal
function ModalFooter({
  mode,
  submitting,
  onClose,
  onSubmit,
}: {
  mode: "add" | "edit";
  submitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div
      style={{
        padding: "14px 24px",
        borderTop: `1px solid ${BORDER}`,
        display: "flex",
        justifyContent: "flex-end",
        gap: 10,
        flexShrink: 0,
      }}
    >
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 11,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "var(--admin-text-muted)",
          padding: "10px 16px",
        }}
      >
        Batal
      </button>
      <button
        onClick={onSubmit}
        disabled={submitting}
        style={{
          background: "var(--admin-accent-bg)",
          border: "1px solid var(--admin-accent-border)",
          color: submitting ? "var(--admin-text-faint)" : GOLD,
          fontSize: 11,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          padding: "10px 24px",
          borderRadius: 3,
          cursor: submitting ? "not-allowed" : "pointer",
          transition: "color 0.2s",
          minWidth: 110,
        }}
      >
        {submitting
          ? "Menyimpan..."
          : mode === "add"
            ? "Tambah Dress"
            : "Simpan"}
      </button>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="10"
      height="10"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.5v15m7.5-7.5h-15"
      />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      stroke="var(--admin-text-faint)"
      strokeWidth={1}
      style={{ margin: "0 auto 8px" }}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
      />
    </svg>
  );
}
