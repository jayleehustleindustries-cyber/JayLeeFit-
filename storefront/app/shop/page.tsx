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
      <h1 className="font-display text-4xl font-semibold tracking-wide">SHOP</h1>
      <p className="mt-2 font-mono text-xs uppercase tracking-widest text-ash">
        {filtered.length} piece{filtered.length !== 1 ? "s" : ""}
        {saleOnly ? " · eclipse pieces only" : ""}
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
            className="border border-line bg-transparent px-3 py-2 text-chalk"
          >
            {["All", "Men", "Women", "Unisex"].map((c) => (
              <option key={c} value={c} className="bg-void">
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
            className="border border-line bg-transparent px-3 py-2 text-chalk"
          >
            <option value="All" className="bg-void">
              All
            </option>
            {sizes.map((s) => (
              <option key={s} value={s} className="bg-void">
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
            className="border border-line bg-transparent px-3 py-2 text-chalk"
          >
            <option value="newest" className="bg-void">Newest</option>
            <option value="price-asc" className="bg-void">Price: Low to High</option>
            <option value="price-desc" className="bg-void">Price: High to Low</option>
            <option value="discount" className="bg-void">Biggest Discount</option>
          </select>
        </label>

        <label className="flex items-center gap-2 pb-2">
          <input type="checkbox" name="sale" value="1" defaultChecked={saleOnly} />
          40%+ off only
        </label>

        <button type="submit" className="bg-gold px-5 py-2 font-bold text-void">
          Apply
        </button>
      </form>

      {filtered.length === 0 ? (
        <p className="mt-16 text-center font-mono text-sm text-ash">
          Nothing matches those filters right now — new light arrives weekly.
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
