// src/lib/auth.ts
// Utility functions untuk auth — bisa dipakai di mana saja

export type AuthUser = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: "user" | "admin";
  createdAt: string;
};

/** Ambil token dari localStorage */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

/** Ambil data user dari localStorage */
export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Cek apakah user sudah login */
export function isLoggedIn(): boolean {
  return !!getToken();
}

/** Simpan token dan user setelah login */
export function saveAuth(token: string, user: AuthUser): void {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  // Trigger event supaya komponen lain tahu auth berubah
  window.dispatchEvent(new Event("auth-change"));
}

/** Hapus token dan user saat logout */
export function clearAuth(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("auth-change"));
}
