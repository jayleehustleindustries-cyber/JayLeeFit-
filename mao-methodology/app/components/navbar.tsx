'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'Services', href: '#services' },
    { label: 'Apply', href: '#apply' },
    { label: 'Investment', href: '#investment' },
    { label: 'Sample Split', href: '#sample-split' },
    { label: 'AI Engine', href: '#ai-engine' },
    { label: 'Coach Jay', href: '#coach-jay' },
    { label: 'Proof', href: '#proof' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Pay Invoice', href: '#pay-invoice' },
  ];

  return (
    <nav className="fixed top-0 w-full bg-black/90 backdrop-blur border-b operator-border z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="#" className="text-2xl font-bold operator-accent">
          MAO
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium hover:text-amber-400 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-cyan-400 text-2xl"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-t operator-border">
          <div className="container mx-auto px-6 py-4 flex flex-col gap-4">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium hover:text-amber-400 transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
