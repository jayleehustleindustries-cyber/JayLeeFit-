"use client";

import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/types";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem, items } = useCart();
  const inCart = items.some((i) => i.sku === product.sku);

  if (!product.inStock) {
    return (
      <button
        disabled
        className="w-full border border-line bg-concrete py-3 font-mono text-xs font-bold uppercase tracking-widest text-mute"
      >
        Sold Out
      </button>
    );
  }

  return (
    <button
      onClick={() => addItem(product)}
      disabled={inCart}
      className="w-full bg-acid py-3 font-mono text-xs font-bold uppercase tracking-widest text-ink transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {inCart ? "In Cart" : "Add To Cart — 1 Available"}
    </button>
  );
}
