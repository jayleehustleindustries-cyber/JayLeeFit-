"use client";

import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/types";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem, items } = useCart();
  const inHand = items.some((i) => i.sku === product.sku);
  const sold = product.status === "sold";

  if (sold) {
    return (
      <button
        type="button"
        disabled
        className="w-full cursor-not-allowed border border-line px-6 py-3 font-mono text-sm uppercase tracking-widest text-fog"
      >
        Vanished — already sold
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => addItem(product)}
      className="w-full border border-gold bg-gold px-6 py-3 font-mono text-sm font-bold uppercase tracking-widest text-noir transition-colors hover:bg-goldbright"
    >
      {inHand ? "In your hand — view" : "Claim this deal"}
    </button>
  );
}
