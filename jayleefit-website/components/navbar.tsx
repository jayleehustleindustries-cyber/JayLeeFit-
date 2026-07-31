"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-dark-secondary border-b border-accent/20 sticky top-0 z-50">
      <div className="container-max flex justify-between items-center py-4">
        <Link href="/" className="text-2xl font-serif font-bold text-accent">
          JayLeeFit
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex gap-8">
          <Link href="/" className="hover:text-accent transition-smooth">
            Home
          </Link>
          <Link href="/about" className="hover:text-accent transition-smooth">
            About
          </Link>
          <Link href="/intake" className="btn-primary">
            Start Intake
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-accent"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-dark-secondary border-t border-accent/20 px-4 py-4 space-y-3">
          <Link
            href="/"
            className="block hover:text-accent transition-smooth"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/about"
            className="block hover:text-accent transition-smooth"
            onClick={() => setIsOpen(false)}
          >
            About
          </Link>
          <Link href="/intake" className="btn-primary block text-center">
            Start Intake
          </Link>
        </div>
      )}
    </nav>
  );
}
