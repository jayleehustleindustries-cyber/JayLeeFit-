"use client";

import Link from "next/link";

export default function Footer() {
  const showStorefrontPromo =
    process.env.NEXT_PUBLIC_SHOW_STOREFRONT_PROMO === "true";
  const storefrontUrl =
    process.env.NEXT_PUBLIC_STOREFRONT_URL || "https://oldlight.shop";

  return (
    <footer className="bg-dark-secondary border-t border-accent/20 mt-20">
      <div className="container-max py-12">
        {showStorefrontPromo && (
          <div className="mb-12 p-6 border border-accent/30 rounded-lg bg-dark">
            <h3 className="text-xl font-serif font-bold text-accent mb-2">
              Old Light — Curated Secondhand Apparel
            </h3>
            <p className="text-gray-300 mb-4">
              Complement your transformation with quality pre-owned clothing.
              Starlight arrives used but still lit.
            </p>
            <Link href={storefrontUrl} className="btn-secondary">
              Shop Now
            </Link>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h4 className="font-serif font-bold text-accent mb-4">JayLeeFit</h4>
            <p className="text-gray-400">
              Data-driven coaching through transparent macro tracking and daily
              accountability.
            </p>
          </div>
          <div>
            <h4 className="font-serif font-bold text-accent mb-4">Navigate</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/" className="hover:text-accent transition-smooth">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-accent transition-smooth"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/intake"
                  className="hover:text-accent transition-smooth"
                >
                  Intake
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif font-bold text-accent mb-4">Contact</h4>
            <p className="text-gray-400">
              <a
                href="mailto:jayleehustle.industries@gmail.com"
                className="hover:text-accent transition-smooth"
              >
                jayleehustle.industries@gmail.com
              </a>
            </p>
          </div>
        </div>

        <div className="border-t border-accent/20 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; 2026 JayLeeFit. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
