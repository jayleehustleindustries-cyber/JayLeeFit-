import Link from "next/link";
import type { Product } from "@/lib/types";
import ProductImage from "./product-image";
import PriceTag from "./price-tag";
import Badge from "./badge";
import ConditionBadge from "./condition-badge";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group flex flex-col border border-line bg-ink transition-colors hover:border-acid"
    >
      <div className="relative aspect-[4/5] overflow-hidden border-b border-line">
        <ProductImage
          src={product.images[0]}
          alt={product.name}
          className="transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {!product.inStock && <Badge tag="SOLD" />}
          {product.inStock && product.tags.map((tag) => <Badge key={tag} tag={tag} />)}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-mute">
              {product.brand}
            </p>
            <h3 className="font-sans text-sm font-semibold leading-snug text-paper">
              {product.name}
            </h3>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <ConditionBadge condition={product.condition} />
          <span className="font-mono text-[10px] text-mute">{product.size}</span>
        </div>
        <PriceTag price={product.price} originalPrice={product.originalPrice} />
      </div>
    </Link>
  );
}
