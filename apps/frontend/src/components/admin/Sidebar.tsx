"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  {
    label: "Overview",
    href: "/admin/dashboard",
    icon: (
      <svg
        width="15"
        height="15"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: (
      <svg
        width="15"
        height="15"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 6h.008v.008H6V6z"
        />
      </svg>
    ),
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: (
      <svg
        width="15"
        height="15"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 6h.008v.008H6V6z"
        />
      </svg>
    ),
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: (
      <svg
        width="15"
        height="15"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
        />
      </svg>
    ),
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: (
      <svg
        width="15"
        height="15"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
        />
      </svg>
    ),
  },
];

export default function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={`
        fixed top-0 left-0 h-full z-30 flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
      `}
      style={{
        width: 220,
        background: "#080807",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Logo */}
      <div
        className="px-6 pt-8 pb-7"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <Link href="/" onClick={onClose} className="block">
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 18,
              fontWeight: 300,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#e8d5b0",
            }}
          >
            Naia Dress
          </p>
          <p
            style={{
              fontSize: 9,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#4a4640",
              marginTop: 2,
            }}
          >
            Admin Console
          </p>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto">
        <p
          style={{
            fontSize: 8,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#3a3630",
            padding: "0 10px",
            marginBottom: 8,
          }}
        >
          Navigation
        </p>
        <ul className="flex flex-col gap-0.5">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all duration-200 group"
                  style={{
                    background: active
                      ? "rgba(212,180,120,0.12)"
                      : "transparent",
                    color: active ? "#d4b478" : "#5a5450",
                  }}
                >
                  <span
                    style={{
                      color: active ? "#d4b478" : "#3a3630",
                      transition: "color 0.2s",
                    }}
                    className="group-hover:!text-[#8a7a60]"
                  >
                    {item.icon}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      letterSpacing: "0.08em",
                      fontWeight: active ? 400 : 300,
                      transition: "color 0.2s",
                    }}
                    className={!active ? "group-hover:!text-[#9a8a70]" : ""}
                  >
                    {item.label}
                  </span>
                  {active && (
                    <span
                      className="ml-auto w-1 h-1 rounded-full"
                      style={{ background: "#d4b478" }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User */}
      <div
        className="px-4 py-5"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: "rgba(212,180,120,0.15)",
              border: "1px solid rgba(212,180,120,0.3)",
            }}
          >
            <span
              style={{ fontFamily: "serif", fontSize: 12, color: "#d4b478" }}
            >
              A
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ fontSize: 11, color: "#7a6e60" }} className="truncate">
              Admin
            </p>
            <p style={{ fontSize: 9, color: "#3a3430" }} className="truncate">
              admin@naiadress.com
            </p>
          </div>
          <button
            style={{ color: "#3a3430" }}
            className="hover:!text-[#7a6e60] transition-colors"
          >
            <svg
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
              />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
