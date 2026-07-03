import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/products";
import ProductImage from "@/components/product-image";
import PriceTag from "@/components/price-tag";
import ConditionBadge from "@/components/condition-badge";
import Badge from "@/components/badge";
import AddToCartButton from "@/components/add-to-cart-button";
import ProductCard from "@/components/product-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Not found — RE:UP" };
  return {
    title: `${product.name} — RE:UP`,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const allProducts = await getProducts();
  const related = allProducts
    .filter((p) => p.sku !== product.sku && p.category === product.category && p.inStock)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="aspect-[4/5] border border-line">
          <ProductImage src={product.images[0]} alt={product.name} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-1">
            {!product.inStock && <Badge tag="SOLD" />}
            {product.inStock && product.tags.map((tag) => <Badge key={tag} tag={tag} />)}
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-mute">
              {product.brand}
            </p>
            <h1 className="font-display text-3xl tracking-wide sm:text-4xl">{product.name}</h1>
          </div>

          <PriceTag price={product.price} originalPrice={product.originalPrice} size="lg" />

          <div className="flex flex-wrap items-center gap-3">
            <ConditionBadge condition={product.condition} />
            <span className="font-mono text-xs uppercase tracking-widest text-mute">
              Size {product.size}
            </span>
            <span className="font-mono text-xs uppercase tracking-widest text-mute">
              SKU {product.sku}
            </span>
          </div>

          <p className="font-sans text-sm leading-relaxed text-paper/90">
            {product.description}
          </p>

          <p className="font-mono text-xs uppercase tracking-widest text-warning">
            {product.inStock
              ? "Only 1 available — once it's gone, it's gone."
              : "This one's sold — check the shop for the next drop."}
          </p>

          <AddToCartButton product={product} />
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="mb-6 font-display text-2xl tracking-wide">MORE {product.category.toUpperCase()}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.sku} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
