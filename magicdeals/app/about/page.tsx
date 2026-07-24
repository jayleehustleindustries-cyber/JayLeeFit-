import Link from "next/link";

export const metadata = {
  title: "The Trick — MagicDeals 007",
  description:
    "How MagicDeals 007 works: the find, the inspection, the grade, the vanish.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.35em] text-fog">
        Dossier · For your eyes only
      </p>
      <h1 className="font-display text-4xl font-bold tracking-wide text-foil sm:text-5xl">
        The Trick
      </h1>

      <div className="mt-8 space-y-6 text-base leading-relaxed text-fog">
        <p>
          MagicDeals 007 is a one-person secondhand operation with a simple
          act: find clothing worth a second life, inspect it like it&apos;s
          evidence, and sell it before anyone realizes how good the deal was.
        </p>
        <p>
          There is no warehouse of duplicates behind the curtain. Every listing
          is the single, physical, one-of-one item photographed on the table.
          That&apos;s not a marketing line — it&apos;s just what reselling is.
          When a card leaves the table, the trick can&apos;t be repeated.
        </p>

        <h2 className="pt-4 font-display text-2xl font-semibold text-goldbright">
          The grading deck
        </h2>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="rank-card mt-0.5">A</span>
            <span>
              <strong className="text-bone">Ace</strong> — new with tags.
              Never played.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="rank-card mt-0.5">K</span>
            <span>
              <strong className="text-bone">King</strong> — good pre-owned,
              inspected, nothing to hide.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="rank-card mt-0.5">Q</span>
            <span>
              <strong className="text-bone">Queen</strong> — honest pre-owned;
              final inspection notes ride along with the listing.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="rank-card mt-0.5">J</span>
            <span>
              <strong className="text-bone">Jack</strong> — it&apos;s been
              played. Flaws photographed and disclosed, priced accordingly.
            </span>
          </li>
        </ul>

        <h2 className="pt-4 font-display text-2xl font-semibold text-goldbright">
          How claiming works
        </h2>
        <p>
          Add cards to your hand and hit{" "}
          <em className="text-bone">Claim these deals</em> — your claim goes
          straight to the dealer, and you get the payment link or the live
          marketplace listing (Poshmark, eBay, or Mercari) within the day.
          First claim wins; that&apos;s the 007 part.
        </p>

        <div className="pt-6">
          <Link
            href="/shop"
            className="inline-block border border-gold bg-gold px-8 py-3 font-mono text-sm font-bold uppercase tracking-widest text-noir transition-colors hover:bg-goldbright"
          >
            Open the vault
          </Link>
        </div>
      </div>
    </div>
  );
}
