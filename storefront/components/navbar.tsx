"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import Marquee from "./marquee";

const LINKS = [
  { href: "/shop?category=Men", label: "Men" },
  { href: "/shop?category=Women", label: "Women" },
  { href: "/shop?sale=1", label: "Sale" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const { count, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-void">
      <Marquee />
      <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-6">
        <Link href="/" className="font-display text-2xl font-semibold tracking-wide text-chalk">
          OLD <span className="text-gold">LIGHT</span>
        </Link>

        <nav className="hidden items-center gap-6 font-mono text-xs font-bold uppercase tracking-widest sm:flex">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-gold">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={openCart}
            className="font-mono text-xs font-bold uppercase tracking-widest hover:text-gold"
          >
            Cart ({count})
          </button>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="font-mono text-xs font-bold uppercase tracking-widest sm:hidden"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col border-b border-line px-4 py-3 font-mono text-xs font-bold uppercase tracking-widest sm:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="py-2 hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
