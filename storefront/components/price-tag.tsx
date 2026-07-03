import { discountPercent, formatPrice } from "@/lib/products";

export default function PriceTag({
  price,
  originalPrice,
  size = "base",
}: {
  price: number;
  originalPrice: number;
  size?: "base" | "lg";
}) {
  const percentOff = discountPercent({ price, originalPrice });
  const priceClass = size === "lg" ? "text-3xl" : "text-lg";

  return (
    <div className="flex items-baseline gap-2 font-mono">
      <span className={`${priceClass} font-bold text-chalk`}>{formatPrice(price)}</span>
      {originalPrice > price && (
        <>
          <span className="text-ash line-through">{formatPrice(originalPrice)}</span>
          <span className="text-gold">-{percentOff}%</span>
        </>
      )}
    </div>
  );
}
