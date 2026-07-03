import Link from "next/link";
import { getProducts, discountPercent } from "@/lib/products";
import ProductCard from "@/components/product-card";

export default async function Home() {
  const products = await getProducts();
  const inStock = products.filter((p) => p.inStock);
  const steals = [...inStock]
    .sort((a, b) => discountPercent(b) - discountPercent(a))
    .slice(0, 8);

  return (
    <div className="flex flex-col">
      <section className="bg-noise relative border-b border-line px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-acid">
            Pre-owned. Authenticated. Priced to move.
          </p>
          <h1 className="font-display text-5xl leading-none tracking-wide sm:text-7xl">
            DEADSTOCK DEALS.
            <br />
            <span className="text-acid">PRE-OWNED HEAT.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl font-sans text-base text-mute sm:text-lg">
            Real streetwear, thrifted and checked by hand, priced at what it&apos;s
            actually worth — not what a resale app says it&apos;s worth. Every piece
            is one-of-one. Once it&apos;s gone, it&apos;s gone.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4 font-mono text-xs font-bold uppercase tracking-widest">
            <Link href="/shop?category=Men" className="bg-acid px-6 py-3 text-ink hover:opacity-90">
              Shop Men
            </Link>
            <Link
              href="/shop?category=Women"
              className="border border-line px-6 py-3 text-paper hover:border-acid hover:text-acid"
            >
              Shop Women
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-display text-3xl tracking-wide">TODAY&apos;S STEALS</h2>
            <Link href="/shop?sale=1" className="font-mono text-xs uppercase tracking-widest text-mute hover:text-acid">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {steals.map((product) => (
              <ProductCard key={product.sku} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line px-4 py-16 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2">
          <Link
            href="/shop?category=Men"
            className="halftone group relative flex h-64 items-end border border-line bg-concrete p-6"
          >
            <span className="font-display text-4xl tracking-wide group-hover:text-acid">MEN</span>
          </Link>
          <Link
            href="/shop?category=Women"
            className="halftone group relative flex h-64 items-end border border-line bg-concrete p-6"
          >
            <span className="font-display text-4xl tracking-wide group-hover:text-acid">WOMEN</span>
          </Link>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-3">
          {[
            {
              step: "01",
              title: "Sourced & Sorted",
              body: "Every piece is hand-picked from thrift runs, estate finds, and closet cleanouts — not mass liquidation pallets.",
            },
            {
              step: "02",
              title: "Checked & Graded",
              body: "Condition graded 1–10, flaws called out honestly. What you see in the listing is what ships.",
            },
            {
              step: "03",
              title: "Priced Below Resale Apps",
              body: "No auction bidding wars, no 'offers' game. One fair price, marked down from retail, ready to buy now.",
            },
          ].map((item) => (
            <div key={item.step} className="border border-line p-6">
              <p className="font-mono text-3xl text-acid">{item.step}</p>
              <h3 className="mt-2 font-display text-xl tracking-wide">{item.title}</h3>
              <p className="mt-2 font-sans text-sm text-mute">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
