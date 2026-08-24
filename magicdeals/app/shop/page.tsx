import Link from "next/link";
import { getProducts } from "@/lib/products";
import ProductCard from "@/components/product-card";

export const revalidate = 300;

export const metadata = {
  title: "The Vault — MagicDeals 007",
  description:
    "Every one-of-one find currently on the table. Men's, women's, shoes, outerwear — inspected, graded, priced to move.",
};

const DEPARTMENTS = ["All", "Men", "Women", "Kids"] as const;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ dept?: string; sort?: string }>;
}) {
  const { dept = "All", sort = "newest" } = await searchParams;
  const products = await getProducts();

  const filtered = products
    .filter((p) => p.status !== "sold")
    .filter((p) => dept === "All" || p.department === dept)
    .sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      // newest: fewest days in inventory first; photo'd items break ties
      const da = a.daysInInventory ?? 999;
      const db = b.daysInInventory ?? 999;
      if (da !== db) return da - db;
      return b.images.length - a.images.length;
    });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-2 flex items-baseline justify-between">
        <h1 className="font-display text-3xl font-semibold tracking-wide text-bone sm:text-4xl">
          The Vault
        </h1>
        <span className="font-mono text-xs uppercase tracking-widest text-fog">
          {filtered.length} on the table
        </span>
      </div>
      <p className="mb-8 max-w-2xl text-sm text-fog">
        Everything here is the only one we have. Grades are honest — Ace is
        new with tags, Jack means it&apos;s been played and we tell you where.
      </p>

      <div className="mb-8 flex flex-wrap items-center gap-2">
        {DEPARTMENTS.map((d) => (
          <Link
            key={d}
            href={`/shop?dept=${d}&sort=${sort}`}
            className={`border px-4 py-1.5 font-mono text-xs uppercase tracking-widest transition-colors ${
              dept === d
                ? "border-gold bg-gold text-noir"
                : "border-line text-fog hover:border-gold/60 hover:text-goldbright"
            }`}
          >
            {d}
          </Link>
        ))}
        <span className="mx-2 hidden text-line sm:inline">|</span>
        {[
          ["newest", "Fresh finds"],
          ["price-asc", "Price ↑"],
          ["price-desc", "Price ↓"],
        ].map(([key, label]) => (
          <Link
            key={key}
            href={`/shop?dept=${dept}&sort=${key}`}
            className={`border px-4 py-1.5 font-mono text-xs uppercase tracking-widest transition-colors ${
              sort === key
                ? "border-silk bg-silk text-bone"
                : "border-line text-fog hover:border-silk/60 hover:text-bone"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-20 text-center font-mono text-sm uppercase tracking-widest text-fog">
          Nothing in this suit right now — the next act is loading.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.sku} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
