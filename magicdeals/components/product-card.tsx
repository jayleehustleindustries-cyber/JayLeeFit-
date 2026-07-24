import Link from "next/link";
import ProductImage from "./product-image";
import RankChip from "./rank-chip";
import { formatPrice } from "@/lib/products";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  const sold = product.status === "sold";

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group flex flex-col overflow-hidden border border-line bg-velvet transition-all hover:-translate-y-1 hover:border-gold/60 hover:shadow-[0_8px_40px_rgba(217,180,91,0.12)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <ProductImage src={product.images[0]} alt={product.name} />
        {sold ? (
          <span className="absolute left-2 top-2 bg-silk px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-bone">
            Vanished
          </span>
        ) : (
          <span className="absolute left-2 top-2 bg-noir/80 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-goldbright backdrop-blur">
            1 of 1
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-fog">
          {product.brand || "Brand under verification"}
        </p>
        <h3 className="font-display text-sm font-semibold leading-snug text-bone group-hover:text-goldbright">
          {product.name}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className={`font-mono text-sm ${sold ? "text-fog line-through" : "text-goldbright"}`}>
            {formatPrice(product.price)}
          </span>
          <RankChip rank={product.rank} showLabel={false} />
        </div>
      </div>
    </Link>
  );
}
