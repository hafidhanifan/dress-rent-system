"use client";

import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 px-6 md:px-12 py-5 flex items-center justify-between">
      {/* Kiri: menu navigasi (desktop) */}
      <ul className="hidden md:flex items-center gap-8">
        {["Collection", "New Arrivals", "About"].map((item) => (
          <li key={item}>
            <a
              href="#"
              className="font-sans text-[11px] font-[400] tracking-[0.18em] uppercase text-stone-700 hover:text-stone-900 transition-colors duration-200"
            >
              {item}
            </a>
          </li>
        ))}
      </ul>

      {/* Tengah: Logo */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <a
          href="#"
          className="font-serif text-xl md:text-2xl font-[300] tracking-[0.25em] uppercase text-stone-800"
        >
          Élégance
        </a>
      </div>

      {/* Kanan: ikon & CTA */}
      <div className="hidden md:flex items-center gap-6 ml-auto">
        {/* Search */}
        <button
          className="text-stone-600 hover:text-stone-900 transition-colors"
          aria-label="Search"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
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
        </button>
        {/* Wishlist */}
        <button
          className="text-stone-600 hover:text-stone-900 transition-colors"
          aria-label="Wishlist"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
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
        </button>
        {/* Rent Now */}
        <a
          href="#"
          className="font-sans text-[10px] tracking-[0.2em] uppercase border border-stone-700 text-stone-700 px-5 py-2 hover:bg-stone-800 hover:text-stone-100 hover:border-stone-800 transition-all duration-300"
        >
          Rent Now
        </a>
      </div>

      {/* Hamburger (mobile) */}
      <button
        className="md:hidden ml-auto text-stone-700 z-50"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        {menuOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
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
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
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
        )}
      </button>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-stone-50 z-40 flex flex-col items-center justify-center gap-8 md:hidden">
          {["Collection", "New Arrivals", "About", "Rent Now"].map((item) => (
            <a
              key={item}
              href="#"
              onClick={() => setMenuOpen(false)}
              className="font-serif text-2xl font-[300] tracking-[0.15em] text-stone-800 hover:text-stone-500 transition-colors"
            >
              {item}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
