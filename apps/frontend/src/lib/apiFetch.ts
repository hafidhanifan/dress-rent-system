// src/lib/apiFetch.ts
// Wrapper untuk fetch() yang otomatis handle token expired (401).
// Pakai ini menggantikan fetch() biasa untuk request yang butuh login.

import { clearAuth } from "./auth";

export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const res = await fetch(input, init);

  if (res.status === 401) {
    // Token sudah tidak valid / expired -> logout paksa
    clearAuth();

    // Simpan halaman saat ini supaya bisa balik lagi setelah login ulang
    const currentPath = window.location.pathname + window.location.search;
    window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}&reason=expired`;
  }

  return res;
}
