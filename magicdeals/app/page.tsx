import Link from "next/link";
import { getProducts } from "@/lib/products";
import ProductCard from "@/components/product-card";

export const revalidate = 300;

export default async function Home() {
  const products = await getProducts();
  const withPhotos = products.filter((p) => p.images.length > 0 && p.status !== "sold");
  const featured = [
    ...withPhotos,
    ...products.filter((p) => p.images.length === 0 && p.status !== "sold"),
  ].slice(0, 8);
  const vanished = products.filter((p) => p.status === "sold").slice(0, 4);
  const liveCount = products.filter((p) => p.status !== "sold").length;

  return (
    <div>
      {/* ——— The stage ——— */}
      <section className="bg-stage bg-noise border-b border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.35em] text-fog">
            The secondhand magic show
          </p>
          <h1 className="font-display text-5xl font-bold leading-tight tracking-wide sm:text-7xl">
            <span className="text-foil shimmer">Now you see it.</span>
            <br />
            <span className="text-bone">Soon you don&apos;t.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-fog sm:text-lg">
            Every piece on this table is the only one we have — found, inspected,
            graded like a card, and priced to move. When it sells, it vanishes
            for good.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/shop"
              className="border border-gold bg-gold px-8 py-3 font-mono text-sm font-bold uppercase tracking-widest text-noir transition-colors hover:bg-goldbright"
            >
              Open the vault
            </Link>
            <Link
              href="/about"
              className="border border-line px-8 py-3 font-mono text-sm uppercase tracking-widest text-fog transition-colors hover:border-gold/60 hover:text-goldbright"
            >
              How the trick works
            </Link>
          </div>
          <p className="mt-10 font-mono text-xs uppercase tracking-widest text-gold">
            ✦ {liveCount} cards on the table right now ✦
          </p>
        </div>
      </section>

      {/* ——— Marquee ——— */}
      <div className="overflow-hidden border-b border-line bg-velvet-deep py-2.5">
        <div className="marquee-track flex w-max gap-8 font-mono text-xs uppercase tracking-[0.3em] text-fog">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="flex gap-8">
              <span>One of one</span>
              <span className="text-gold">✦</span>
              <span>Inspected &amp; graded</span>
              <span className="text-gold">✦</span>
              <span>Ships fast</span>
              <span className="text-gold">✦</span>
              <span>When it&apos;s gone, it&apos;s gone</span>
              <span className="text-gold">✦</span>
              <span>Poshmark · eBay · Mercari</span>
              <span className="text-gold">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ——— Tonight's act ——— */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold tracking-wide text-bone sm:text-3xl">
            Tonight&apos;s act
          </h2>
          <Link
            href="/shop"
            className="font-mono text-xs uppercase tracking-widest text-gold hover:text-goldbright"
          >
            Full vault →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.sku} product={p} />
          ))}
        </div>
      </section>

      {/* ——— The trick, in three moves ——— */}
      <section className="border-y border-line bg-velvet-deep bg-noise">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:grid-cols-3 sm:px-6">
          {[
            {
              step: "01",
              title: "The find",
              body: "We hunt racks, bins, and estates for pieces worth a second act — name brands, vintage, and oddball one-offs.",
            },
            {
              step: "02",
              title: "The inspection",
              body: "Every item gets checked, photographed on white, and graded honestly: Ace, King, Queen, or Jack. Flaws get disclosed, never hidden.",
            },
            {
              step: "03",
              title: "The vanish",
              body: "One of each. Ever. Claim it here or catch it on Poshmark, eBay, or Mercari — after that, the card leaves the table.",
            },
          ].map((s) => (
            <div key={s.step} className="border border-line bg-noir/50 p-6">
              <p className="font-mono text-xs tracking-widest text-silk">{s.step}</p>
              <h3 className="mt-2 font-display text-xl font-semibold text-goldbright">
                {s.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-fog">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ——— Already vanished (social proof) ——— */}
      {vanished.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="mb-2 font-display text-2xl font-semibold tracking-wide text-bone">
            Already vanished
          </h2>
          <p className="mb-6 text-sm text-fog">
            Proof the trick works — these found new homes.
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {vanished.map((p) => (
              <ProductCard key={p.sku} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
