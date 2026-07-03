"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/products";
import ProductImage from "./product-image";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, subtotal } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skus: items.map((i) => i.sku) }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error || "Checkout failed. Try again.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Checkout failed. Try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-ink/70 transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeCart}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-line bg-ink transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line p-4">
          <h2 className="font-display text-xl tracking-wide">CART</h2>
          <button
            onClick={closeCart}
            className="font-mono text-xs uppercase tracking-widest text-mute hover:text-acid"
          >
            Close ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <p className="font-mono text-sm text-mute">
              Empty. Every piece here is one-of-one — go grab it before someone else does.
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li key={item.sku} className="flex gap-3 border border-line">
                  <div className="h-20 w-16 shrink-0">
                    <ProductImage src={item.image} alt={item.name} />
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-2">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-mute">
                        {item.brand}
                      </p>
                      <p className="text-sm font-semibold leading-snug">{item.name}</p>
                      <p className="font-mono text-[10px] text-mute">Size {item.size}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm">{formatPrice(item.price)}</span>
                      <button
                        onClick={() => removeItem(item.sku)}
                        className="font-mono text-[10px] uppercase tracking-widest text-mute hover:text-warning"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-line p-4">
          <div className="mb-3 flex items-center justify-between font-mono text-sm">
            <span className="uppercase tracking-widest text-mute">Subtotal</span>
            <span className="font-bold">{formatPrice(subtotal)}</span>
          </div>
          {error && <p className="mb-2 font-mono text-xs text-warning">{error}</p>}
          <button
            onClick={handleCheckout}
            disabled={items.length === 0 || loading}
            className="w-full bg-acid py-3 font-mono text-xs font-bold uppercase tracking-widest text-ink transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {loading ? "Redirecting…" : "Checkout"}
          </button>
          <Link
            href="/shop"
            onClick={closeCart}
            className="mt-3 block text-center font-mono text-[10px] uppercase tracking-widest text-mute hover:text-acid"
          >
            Keep Browsing
          </Link>
        </div>
      </aside>
    </>
  );
}
