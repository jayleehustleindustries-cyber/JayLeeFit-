export default function AboutPage() {
  const showCrossPromo = process.env.NEXT_PUBLIC_SHOW_CROSS_PROMO !== "false";
  const jayLeeFitUrl = process.env.NEXT_PUBLIC_JAYLEEFIT_URL || "#";
  const jayLeeFitLabel = process.env.NEXT_PUBLIC_JAYLEEFIT_LABEL || "JayLeeFit Coaching";

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-widest text-acid">About</p>
      <h1 className="mt-2 font-display text-4xl tracking-wide sm:text-5xl">
        WE THRIFT SO YOU DON&apos;T HAVE TO.
      </h1>

      <div className="mt-8 flex flex-col gap-6 font-sans text-base leading-relaxed text-paper/90">
        <p>
          RE:UP started as one closet, one thrift run at a time. No warehouse, no
          liquidation pallets, no bots sniping every good drop before you see it —
          just real pieces, picked by hand, sold at what they&apos;re actually
          worth.
        </p>
        <p>
          Every item gets graded honestly on a 1–10 condition scale, photographed
          as-is, and priced below what you&apos;d pay chasing the same piece on a
          resale app auction. One price. No bidding wars. No &quot;best offer&quot;
          games.
        </p>
        <p>
          Buying pre-owned isn&apos;t a compromise — it&apos;s the smarter move.
          Better fabric than most of what&apos;s on shelves today, already broken
          in, and one less garment in a landfill.
        </p>
      </div>

      {showCrossPromo && (
        <div className="mt-12 border border-line p-6">
          <p className="font-mono text-xs uppercase tracking-widest text-mute">
            From the same corner as
          </p>
          <a
            href={jayLeeFitUrl}
            className="mt-2 inline-block font-display text-2xl tracking-wide text-paper hover:text-acid"
          >
            {jayLeeFitLabel} →
          </a>
          <p className="mt-2 max-w-md font-sans text-sm text-mute">
            If you&apos;re here for the fits, you might also be into the fitness
            coaching side of the house.
          </p>
        </div>
      )}
    </div>
  );
}
