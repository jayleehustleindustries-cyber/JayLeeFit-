"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export default function Navbar() {
  const { count, openCart } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-noir/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-xl font-bold tracking-wide text-foil shimmer">
            MAGICDEALS
          </span>
          <span className="font-mono text-sm font-bold text-silk">007</span>
        </Link>

        <div className="flex items-center gap-5">
          <Link
            href="/shop"
            className="font-mono text-xs uppercase tracking-widest text-fog transition-colors hover:text-goldbright"
          >
            The Vault
          </Link>
          <Link
            href="/about"
            className="hidden font-mono text-xs uppercase tracking-widest text-fog transition-colors hover:text-goldbright sm:inline"
          >
            The Trick
          </Link>
          <button
            type="button"
            onClick={openCart}
            className="relative border border-gold/60 px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-goldbright transition-colors hover:bg-gold hover:text-noir"
          >
            Your Hand
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-silk text-[10px] font-bold text-bone">
                {count}
              </span>
            )}
          </button>
        </div>
      </nav>
    </header>
  );
}
