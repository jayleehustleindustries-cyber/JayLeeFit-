import { notFound } from "next/navigation";
import { getProductBySlug, getProducts, formatPrice } from "@/lib/products";
import ProductImage from "@/components/product-image";
import RankChip from "@/components/rank-chip";
import AddToCartButton from "@/components/add-to-cart-button";
import ProductCard from "@/components/product-card";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Not found — MagicDeals 007" };
  return {
    title: `${product.name} — MagicDeals 007`,
    description: `${product.brand} · ${product.condition} · ${formatPrice(product.price)} — one of one, gone when it's gone.`,
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
    .filter(
      (p) =>
        p.sku !== product.sku &&
        p.department === product.department &&
        p.status !== "sold"
    )
    .slice(0, 4);

  const sold = product.status === "sold";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-[4/5] overflow-hidden border border-line bg-velvet">
            <ProductImage src={product.images[0]} alt={product.name} />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((img) => (
                <div key={img} className="aspect-square overflow-hidden border border-line bg-velvet">
                  <ProductImage src={img} alt={product.name} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {sold ? (
              <span className="bg-silk px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-bone">
                Vanished
              </span>
            ) : (
              <span className="border border-gold/50 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-goldbright">
                1 of 1 — only card in the deck
              </span>
            )}
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-fog">
              {product.brand || "Brand under verification"}
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-wide text-bone sm:text-4xl">
              {product.name}
            </h1>
          </div>

          <p className="font-display text-3xl font-semibold text-goldbright">
            {formatPrice(product.price)}
          </p>

          <RankChip rank={product.rank} />

          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 border-y border-line py-4 font-mono text-xs uppercase tracking-widest">
            {product.size && (
              <>
                <dt className="text-fog">Size</dt>
                <dd className="text-bone">{product.size}</dd>
              </>
            )}
            {product.color && (
              <>
                <dt className="text-fog">Color</dt>
                <dd className="text-bone">{product.color}</dd>
              </>
            )}
            {product.type && (
              <>
                <dt className="text-fog">Type</dt>
                <dd className="text-bone">{product.type}</dd>
              </>
            )}
            <dt className="text-fog">SKU</dt>
            <dd className="text-bone">{product.sku}</dd>
            {product.daysInInventory !== null && !sold && (
              <>
                <dt className="text-fog">On the table</dt>
                <dd className="text-bone">{product.daysInInventory} days</dd>
              </>
            )}
          </dl>

          <p className="text-sm leading-relaxed text-fog">
            <span className="font-mono text-[10px] uppercase tracking-widest text-goldbright">
              Dealer&apos;s notes:{" "}
            </span>
            {product.condition}
          </p>

          <p className="font-mono text-xs uppercase tracking-widest text-silk">
            {sold
              ? "This one already vanished — the vault has more."
              : "Once it's claimed, the trick can't be repeated."}
          </p>

          <AddToCartButton product={product} />

          {!sold && product.platforms.length > 0 && (
            <p className="text-center font-mono text-[10px] uppercase tracking-widest text-fog">
              Also live on {product.platforms.join(" · ")}
            </p>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="mb-6 font-display text-2xl font-semibold tracking-wide text-bone">
            More from the {product.department.toLowerCase()}&apos;s table
          </h2>
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
