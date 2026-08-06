// src/hooks/useWishlist.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { getToken, isLoggedIn } from "@/lib/auth";
import { apiFetch } from "@/lib/apiFetch";}

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/**
 * Hook untuk manage wishlist
 * - Fetch wishlist dari backend saat mount
 * - Toggle wishlist (add/remove) dengan satu fungsi
 * - Cek apakah dress sudah di-wishlist
 */
export function useWishlist() {
  const [wishlistedIds, setWishlistedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch semua dressId yang sudah di-wishlist
  const fetchWishlistIds = useCallback(async () => {
    if (!isLoggedIn()) return;
    try {
      const res = await apiFetch(`${API}/wishlist/ids`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        cache: "no-store",
      });
      if (res.ok) {
        const ids: number[] = await res.json();
        setWishlistedIds(ids);
      }
    } catch {
      // silent fail
    }
  }, []);

  useEffect(() => {
    fetchWishlistIds();
    // Refresh wishlist kalau user login/logout
    window.addEventListener("auth-change", fetchWishlistIds);
    return () => window.removeEventListener("auth-change", fetchWishlistIds);
  }, [fetchWishlistIds]);

  /** Cek apakah dress sudah di-wishlist */
  const isWishlisted = (dressId: number) => wishlistedIds.includes(dressId);

  /**
   * Toggle wishlist — tambah kalau belum ada, hapus kalau sudah ada
   * Returns: true kalau berhasil, false kalau gagal (belum login dll)
   */
  const toggleWishlist = async (dressId: number): Promise<boolean> => {
    if (!isLoggedIn()) return false;

    setLoading(true);
    try {
      const res = await apiFetch(`${API}/wishlist/${dressId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) return false;

      const data: { wishlisted: boolean } = await res.json();
      setWishlistedIds((prev) =>
        data.wishlisted
          ? [...prev, dressId]
          : prev.filter((id) => id !== dressId),
      );
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    isWishlisted,
    toggleWishlist,
    wishlistedIds,
    loading,
    refetch: fetchWishlistIds,
  };
}
