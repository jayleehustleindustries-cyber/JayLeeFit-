import { getProducts, discountPercent } from "@/lib/products";
import ProductCard from "@/components/product-card";
import type { Product } from "@/lib/types";

type SearchParams = { [key: string]: string | string[] | undefined };

function sortProducts(products: Product[], sort: string): Product[] {
  const sorted = [...products];
  if (sort === "price-asc") return sorted.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") return sorted.sort((a, b) => b.price - a.price);
  if (sort === "discount") return sorted.sort((a, b) => discountPercent(b) - discountPercent(a));
  return sorted;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const category = typeof sp.category === "string" ? sp.category : "All";
  const size = typeof sp.size === "string" ? sp.size : "All";
  const sort = typeof sp.sort === "string" ? sp.sort : "newest";
  const saleOnly = sp.sale === "1";

  const products = await getProducts();
  const sizes = Array.from(new Set(products.map((p) => p.size))).sort();

  let filtered = products;
  if (category !== "All") filtered = filtered.filter((p) => p.category === category);
  if (size !== "All") filtered = filtered.filter((p) => p.size === size);
  if (saleOnly) filtered = filtered.filter((p) => discountPercent(p) >= 40);
  filtered = sortProducts(filtered, sort);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl tracking-wide">SHOP</h1>
      <p className="mt-2 font-mono text-xs uppercase tracking-widest text-mute">
        {filtered.length} piece{filtered.length !== 1 ? "s" : ""}
        {saleOnly ? " · steals only" : ""}
      </p>

      <form
        method="get"
        className="mt-6 flex flex-wrap items-end gap-4 border border-line p-4 font-mono text-xs uppercase tracking-widest"
      >
        <label className="flex flex-col gap-1">
          Category
          <select
            name="category"
            defaultValue={category}
            className="border border-line bg-transparent px-3 py-2 text-paper"
          >
            {["All", "Men", "Women", "Unisex"].map((c) => (
              <option key={c} value={c} className="bg-ink">
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          Size
          <select
            name="size"
            defaultValue={size}
            className="border border-line bg-transparent px-3 py-2 text-paper"
          >
            <option value="All" className="bg-ink">
              All
            </option>
            {sizes.map((s) => (
              <option key={s} value={s} className="bg-ink">
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          Sort
          <select
            name="sort"
            defaultValue={sort}
            className="border border-line bg-transparent px-3 py-2 text-paper"
          >
            <option value="newest" className="bg-ink">Newest</option>
            <option value="price-asc" className="bg-ink">Price: Low to High</option>
            <option value="price-desc" className="bg-ink">Price: High to Low</option>
            <option value="discount" className="bg-ink">Biggest Discount</option>
          </select>
        </label>

        <label className="flex items-center gap-2 pb-2">
          <input type="checkbox" name="sale" value="1" defaultChecked={saleOnly} />
          Steals only (40%+ off)
        </label>

        <button type="submit" className="bg-acid px-5 py-2 font-bold text-ink">
          Apply
        </button>
      </form>

      {filtered.length === 0 ? (
        <p className="mt-16 text-center font-mono text-sm text-mute">
          Nothing matches those filters right now — check back, new drops land weekly.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.sku} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
