"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loggedIn, ready } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Proteksi halaman admin
  useEffect(() => {
    if (!ready) return; // tunggu sampai localStorage selesai dibaca

    if (loggedIn) {
      // belum login sama sekali? redirect ke login
      router.push("/auth/login?redirect=/admin/dashboard");
      return;
    }

    if (user?.role !== "admin") {
      // sudah login tapi role bukan admin? redirect ke halaman home
      router.push("/");
      return;
    }
  }, [ready, loggedIn, user, router]);

  // selama proses cek auth, tampilkan loading kosong supaya konten admin tidak kelihatan sekilas sebelum proses redirect
  if (!ready || !loggedIn || user?.role !== "admin") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--admin-bg)" }}
      >
        <p style={{ fontSize: 13, color: "var(--admin-text-faint)" }}>
          Memuat...
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--admin-bg)", color: "var(--admin-text)" }}
    >
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-[220px]">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-5 md:p-7 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
