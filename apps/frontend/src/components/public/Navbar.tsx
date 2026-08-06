"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { clearAuth } from "@/lib/auth";

const NAV_LINKS = [
  { label: "Collection", href: "/dresses" },
  { label: "About", href: "/about" },
  { label: "Faq", href: "/faq" },
];

const USER_MENU_LINKS = [
  { label: "Profil Saya", href: "/profile" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Pesanan Saya", href: "/orders" },
];

const textLinkClass =
  "font-sans text-[9px] tracking-[0.15em] uppercase transition-colors";

export default function Navbar() {
  const router = useRouter();
  const { user, loggedIn, ready } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearAuth();
    setDropdownOpen(false);
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const isLoggedIn = ready && loggedIn && !!user;

  return (
    <>
      <nav className="absolute top-0 left-0 right-0 z-50 px-6 md:px-12 py-5 flex items-center justify-between">
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="font-sans text-[11px] font-normal tracking-[0.18em] uppercase"
                style={{ color: "var(--user-text)" }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="absolute left-1/2 -translate-x-1/2">
          <Link
            href="/"
            className="font-serif text-xl md:text-2xl font-light tracking-[0.25em] uppercase"
            style={{ color: "var(--user-text)" }}
          >
            Naia Dress
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-6 ml-auto">
          <button
            className="transition-colors"
            style={{ color: "var(--user-text-secondary)" }}
            aria-label="Search"
          >
            <IconSearch />
          </button>

          <Link
            href="/wishlist"
            className="transition-colors"
            style={{ color: "var(--user-text-secondary)" }}
            aria-label="Wishlist"
          >
            <IconHeart />
          </Link>

          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen((p) => !p)}
              style={{ color: "var(--user-text-secondary)" }}
              aria-label="User menu"
            >
              {isLoggedIn ? <UserAvatar name={user!.fullName} /> : <IconUser />}
            </button>

            {dropdownOpen && (
              <UserDropdown
                isLoggedIn={isLoggedIn}
                user={user}
                onNavigate={() => setDropdownOpen(false)}
                onLogout={handleLogout}
              />
            )}
          </div>

          <Link
            href="/dresses"
            className="font-sans text-[10px] tracking-[0.2em] uppercase border px-5 py-2 hover:text-(--user-bg) transition-all duration-300"
            style={{
              borderColor: "var(--user-text)",
              color: "var(--user-text)",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "var(--user-text)";
              e.currentTarget.style.color = "var(--user-bg)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--user-text)";
            }}
          >
            Rent Now
          </Link>
        </div>

        <button
          className="md:hidden ml-auto z-50"
          style={{ color: "var(--user-text)" }}
          onClick={() => setMenuOpen((p) => !p)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <IconClose /> : <IconMenu />}
        </button>

        {menuOpen && (
          <MobileMenu
            isLoggedIn={isLoggedIn}
            onClose={() => setMenuOpen(false)}
            onLogout={handleLogout}
          />
        )}
      </nav>

      <style>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

function UserAvatar({ name }: { name?: string }) {
  return (
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center"
      style={{ background: "var(--user-text)" }}
    >
      <span
        className="font-sans text-[9px] leading-none"
        style={{ color: "var(--user-bg)" }}
      >
        {name?.charAt(0).toUpperCase() ?? "U"}
      </span>
    </div>
  );
}

function UserDropdown({
  isLoggedIn,
  user,
  onNavigate,
  onLogout,
}: {
  isLoggedIn: boolean;
  user: { fullName?: string; role?: string } | null;
  onNavigate: () => void;
  onLogout: () => void;
}) {
  return (
    <div
      className="absolute right-0 top-full mt-3 w-44 shadow-xl overflow-hidden"
      style={{
        background: "var(--user-bg-alt)",
        border: "1px solid var(--user-border)",
        animation: "fadeDown 0.15s ease forwards",
      }}
    >
      {isLoggedIn ? (
        <>
          <div
            className="px-4 py-3"
            style={{ borderBottom: "1px solid var(--user-border)" }}
          >
            <p
              className="font-sans text-[8px] tracking-[0.2em] uppercase"
              style={{ color: "var(--user-text-muted)" }}
            >
              Masuk sebagai
            </p>
            <p
              className="font-sans text-xs mt-0.5 truncate"
              style={{ color: "var(--user-text)" }}
            >
              {user?.fullName}
            </p>
          </div>

          {USER_MENU_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`block px-4 py-2.5 ${textLinkClass}`}
              style={{ color: "var(--user-text-secondary)" }}
            >
              {item.label}
            </Link>
          ))}

          {user?.role === "admin" && (
            <Link
              href="/admin/dashboard"
              onClick={onNavigate}
              className={`block px-4 py-2.5 ${textLinkClass}`}
              style={{
                color: "var(--user-text-secondary)",
                borderTop: "1px solid var(--user-border)",
              }}
            >
              Dashboard Admin
            </Link>
          )}

          <button
            onClick={onLogout}
            className={`w-full text-left px-4 py-2.5 ${textLinkClass} text-red-400 hover:bg-red-50 hover:text-red-500`}
            style={{ borderTop: "1px solid var(--user-border)" }}
          >
            Keluar
          </button>
        </>
      ) : (
        <>
          <Link
            href="/auth/login"
            onClick={onNavigate}
            className={`block px-4 py-2.5 ${textLinkClass}`}
            style={{ color: "var(--user-text-secondary)" }}
          >
            Masuk
          </Link>
          <Link
            href="/auth/register"
            onClick={onNavigate}
            className={`block px-4 py-2.5 ${textLinkClass}`}
            style={{
              color: "var(--user-text-secondary)",
              borderTop: "1px solid var(--user-border)",
            }}
          >
            Daftar
          </Link>
        </>
      )}
    </div>
  );
}

function MobileMenu({
  isLoggedIn,
  onClose,
  onLogout,
}: {
  isLoggedIn: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  const links = [...NAV_LINKS, { label: "Rent Now", href: "/dresses" }];

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 md:hidden"
      style={{ background: "var(--user-bg)" }}
    >
      {links.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          onClick={onClose}
          className="font-serif text-2xl font-light tracking-[0.15em]"
          style={{ color: "var(--user-text)" }}
        >
          {item.label}
        </Link>
      ))}

      <div className="flex items-center gap-6 mt-4">
        {isLoggedIn ? (
          <button
            onClick={onLogout}
            className="font-sans text-[10px] tracking-[0.2em] uppercase hover:text-red-400 transition-colors"
            style={{ color: "var(--user-text-muted)" }}
          >
            Keluar
          </button>
        ) : (
          <>
            <Link
              href="/auth/login"
              onClick={onClose}
              className="font-sans text-[10px] tracking-[0.2em] uppercase transition-colors"
              style={{ color: "var(--user-text-muted)" }}
            >
              Masuk
            </Link>
            <span style={{ color: "var(--user-text-faint)" }}>·</span>
            <Link
              href="/auth/register"
              onClick={onClose}
              className="font-sans text-[10px] tracking-[0.2em] uppercase transition-colors"
              style={{ color: "var(--user-text-muted)" }}
            >
              Daftar
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

function IconSearch() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
      />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  );
}

function IconUser() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
      />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg
      className="w-5 h-5"
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
  );
}

function IconClose() {
  return (
    <svg
      className="w-5 h-5"
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
