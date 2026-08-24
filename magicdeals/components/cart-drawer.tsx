"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/products";

const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || "jayleehustle.industries@gmail.com";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, subtotal } = useCart();

  if (!isOpen) return null;

  // Checkout v1: a reserve-by-email flow. Every item is also live on
  // Poshmark/eBay, so payment happens on the marketplace listing (or a
  // direct invoice) — no card processing on this site yet. Stripe
  // Checkout can slot in here later without changing the cart model.
  const mailtoBody = encodeURIComponent(
    `I want to claim the following item(s) from MagicDeals 007:\n\n` +
      items.map((i) => `- ${i.name} (SKU ${i.sku}) — ${formatPrice(i.price)}`).join("\n") +
      `\n\nTotal: ${formatPrice(subtotal)}\n\nPlease send me the payment link / marketplace listing.`
  );
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    "MagicDeals 007 — claim request"
  )}&body=${mailtoBody}`;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-label="Your hand">
      <button
        type="button"
        aria-label="Close cart"
        onClick={closeCart}
        className="absolute inset-0 bg-noir/70 backdrop-blur-sm"
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-line bg-velvet-deep">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-goldbright">
            Your Hand
          </h2>
          <button
            type="button"
            onClick={closeCart}
            className="font-mono text-xs uppercase tracking-widest text-fog hover:text-bone"
          >
            Close ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="font-display text-3xl text-gold">✦</span>
            <p className="text-sm text-fog">
              Empty hand. Every card in the vault is one of one — pick yours
              before it vanishes.
            </p>
            <Link
              href="/shop"
              onClick={closeCart}
              className="mt-2 border border-gold/60 px-4 py-2 font-mono text-xs uppercase tracking-widest text-goldbright hover:bg-gold hover:text-noir"
            >
              Open the vault
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-5 py-4">
              {items.map((item) => (
                <li
                  key={item.sku}
                  className="flex items-center justify-between gap-3 border-b border-line/60 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm text-bone">{item.name}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-fog">
                      {item.brand || "—"} · SKU {item.sku}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-mono text-sm text-goldbright">
                      {formatPrice(item.price)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.sku)}
                      className="font-mono text-xs text-fog hover:text-silk"
                      aria-label={`Remove ${item.name}`}
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-line px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-widest text-fog">
                  Total
                </span>
                <span className="font-display text-xl font-semibold text-goldbright">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <a
                href={mailto}
                className="block w-full border border-gold bg-gold px-6 py-3 text-center font-mono text-sm font-bold uppercase tracking-widest text-noir transition-colors hover:bg-goldbright"
              >
                Claim these deals
              </a>
              <p className="mt-2 text-center font-mono text-[10px] leading-relaxed text-fog">
                Claims go straight to the dealer — you&apos;ll get the payment
                link or marketplace listing within the day.
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
