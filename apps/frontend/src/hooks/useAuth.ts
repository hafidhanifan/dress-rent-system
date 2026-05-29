// src/hooks/useAuth.ts
// Custom hook — pakai di komponen manapun yang butuh info login

"use client";

import { useState, useEffect } from "react";
import { getUser, isLoggedIn, AuthUser } from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [ready, setReady] = useState(false); // true setelah localStorage dibaca

  useEffect(() => {
    // Baca state awal
    setUser(getUser());
    setLoggedIn(isLoggedIn());
    setReady(true);

    // Dengarkan perubahan auth (login/logout dari tab yang sama)
    const handleChange = () => {
      setUser(getUser());
      setLoggedIn(isLoggedIn());
    };

    window.addEventListener("auth-change", handleChange);
    return () => window.removeEventListener("auth-change", handleChange);
  }, []);

  return { user, loggedIn, ready };
}
