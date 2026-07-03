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
      <span className={`${priceClass} font-bold text-paper`}>{formatPrice(price)}</span>
      {originalPrice > price && (
        <>
          <span className="text-mute line-through">{formatPrice(originalPrice)}</span>
          <span className="text-acid">-{percentOff}%</span>
        </>
      )}
    </div>
  );
}
