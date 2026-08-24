import Link from "next/link";
import { getProducts, discountPercent } from "@/lib/products";
import ProductCard from "@/components/product-card";
import MoonPhase from "@/components/moon-phase";

const PHASES = [
  { score: 10, body: "Mint. Every original detail still visible." },
  { score: 8, body: "Excellent. Barely worn, no real story yet." },
  { score: 6, body: "Good. Honest, visible wear — worn the way it was meant to be." },
  { score: 3, body: "Vintage character. What's left is what makes it worth keeping." },
];

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
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-gold">
            Pre-owned. Graded by the moon. Priced to move.
          </p>
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-wide sm:text-6xl">
            Every piece here already
            <br />
            <span className="text-gold">caught the light once.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl font-sans text-base text-ash sm:text-lg">
            Real menswear and womenswear, thrifted and checked by hand, priced at what
            it&apos;s actually worth — not what a resale app says it&apos;s worth. Every
            piece is one-of-one. Once it&apos;s gone, it&apos;s gone.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4 font-mono text-xs font-bold uppercase tracking-widest">
            <Link href="/shop?category=Men" className="bg-gold px-6 py-3 text-void hover:opacity-90">
              Shop Men
            </Link>
            <Link
              href="/shop?category=Women"
              className="border border-line px-6 py-3 text-chalk hover:border-gold hover:text-gold"
            >
              Shop Women
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-display text-3xl font-semibold tracking-wide">
              TONIGHT&apos;S SHOOTING STARS
            </h2>
            <Link href="/shop?sale=1" className="font-mono text-xs uppercase tracking-widest text-ash hover:text-gold">
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
            className="halftone group relative flex h-64 items-end border border-line bg-panel p-6"
          >
            <span className="font-display text-4xl font-semibold tracking-wide group-hover:text-gold">MEN</span>
          </Link>
          <Link
            href="/shop?category=Women"
            className="halftone group relative flex h-64 items-end border border-line bg-panel p-6"
          >
            <span className="font-display text-4xl font-semibold tracking-wide group-hover:text-gold">WOMEN</span>
          </Link>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-3xl font-semibold tracking-wide">
            Condition, As Phases
          </h2>
          <p className="mt-2 max-w-2xl font-sans text-sm text-ash">
            A grading scale that means something twice — how much of the moon you can
            see, and how much of a piece&apos;s first life is still visible on it.
          </p>
          <div className="mt-8 flex flex-col divide-y divide-line border-y border-line">
            {PHASES.map((p) => (
              <div key={p.score} className="flex items-center gap-4 py-4">
                <MoonPhase score={p.score} />
                <p className="font-sans text-sm text-ash">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
