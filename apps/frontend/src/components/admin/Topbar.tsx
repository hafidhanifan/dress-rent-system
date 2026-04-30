"use client";

import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/admin/dashboard": "Overview",
  "/admin/products": "Products",
  "/admin/orders": "Orders",
  "/admin/customers": "Customers",
};

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const title = titles[pathname] ?? "Admin";
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <header
      className="sticky top-0 z-10 flex items-center justify-between px-5 md:px-7 py-4 gap-4"
      style={{
        background: "rgba(15,14,13,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Kiri */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden transition-colors"
          style={{ color: "#4a4440" }}
        >
          <svg
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
        <div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.2rem, 2.5vw, 1.5rem)",
              fontWeight: 300,
              color: "#e8ddc8",
              lineHeight: 1,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: 10,
              color: "#3a3630",
              marginTop: 3,
              letterSpacing: "0.05em",
            }}
            className="hidden sm:block"
          >
            {today}
          </p>
        </div>
      </div>

      {/* Kanan */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          className="transition-colors p-2 rounded-sm hover:bg-white/5"
          style={{ color: "#4a4440" }}
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
              d="m21 21-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
            />
          </svg>
        </button>
        {/* Bell */}
        <button
          className="relative transition-colors p-2 rounded-sm hover:bg-white/5"
          style={{ color: "#4a4440" }}
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
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
          </svg>
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
            style={{ background: "#d4b478" }}
          />
        </button>
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center ml-1 cursor-pointer"
          style={{
            background: "rgba(212,180,120,0.1)",
            border: "1px solid rgba(212,180,120,0.25)",
          }}
        >
          <span style={{ fontFamily: "serif", fontSize: 13, color: "#d4b478" }}>
            A
          </span>
        </div>
      </div>
    </header>
  );
}
