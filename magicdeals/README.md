# MagicDeals 007 — the storefront

**"Now you see it. Soon you don't."**

A Shopify-style store for the MagicDeals 007 resale operation (the
EHC/Everyday Hustle inventory, sold under the MagicDeals 007 storefront
brand). Next.js 16 + Tailwind v4, deployed on Vercel.

**Live URL:** https://magicdeals007-jayleehustleindustries-8086s-projects.vercel.app
(project `magicdeals007` on the jayleehustle Vercel account)

## The concept

Resale's defining constraint — every item is a physical one-of-one — is
the brand. The store is staged as a magic show:

- **The Vault** (shop) — every card on the table is "1 of 1"
- **Your Hand** (cart) — claims, not carts
- **Vanished** (sold) — sold items stay visible as social proof
- **Card-rank condition grades** — Ace (NWT) / King (good) / Queen
  (honest pre-owned) / Jack (played, flaws disclosed), derived from the
  sheet's free-text Condition notes
- Palette: velvet noir `#0b0812`, gold foil `#d9b45b`, silk red
  `#c04a55`; Fraunces display + Libre Franklin + Space Mono

## Where products come from

`lib/products.ts` reads the **EHC Inventory Log V2** Google Sheet
(`17JeIyMsos60gqsppplILJYnQVV1276V5KxODcDo-PuI`) via its public CSV
export at request time (5-min revalidate). Until that sheet is shared
"Anyone with the link → Viewer", the export returns a login wall, and the
site falls back to `lib/snapshot.ts` — a baked snapshot of the same
sheet's real rows (28 items, real SKUs/prices/photo links) taken
2026-07-10 via the Drive connector.

**To flip the site to live inventory: share the V2 sheet → link-viewer.
That's the whole switch.** Env overrides: `GOOGLE_SHEET_ID`,
`GOOGLE_SHEET_NAME`.

Product photos are the sheet's `White Photo Links` column (Drive share
links), rewritten to `drive.google.com/thumbnail?id=…&sz=w1200`. Those
render once each photo file (or its parent folder) is link-shared;
otherwise the UI shows a styled "the reveal is coming" card back.

The V2 sheet doubles as Codex's work queue, so the mapper drops
non-inventory rows: missing SKU/name/price, `Vendoo-ready`, `Temporary
intake key`, `VOID`, duplicates, etc. `Sold` rows are kept and rendered
as "Vanished" (social proof), never buyable.

## Checkout

v1 is a **claim flow**: the cart drawer's "Claim these deals" opens a
prefilled email (`NEXT_PUBLIC_CONTACT_EMAIL`, defaults to the
jayleehustle Gmail) listing SKUs + total; the dealer replies with a
payment link or the live Poshmark/eBay/Mercari listing. Stripe Checkout
can replace the mailto later without touching the cart model (the Old
Light storefront in `../storefront` already has that pattern).

## Custom domain

`magicdeals007.com` was **available for $11.25/yr** (also `.shop` $2.99,
`.store` $1.99) when checked 2026-07-24 via Vercel. Buying + attaching it
to the `magicdeals007` project is a two-click job in the Vercel dashboard
— deliberately not done without an explicit go-ahead since it spends real
money.

## Relationship to `../storefront` (Old Light)

Same underlying inventory, different storefront brand and codebase. Old
Light is the earlier EHC-branded build with Stripe checkout; this is the
MagicDeals 007 brand requested 2026-07-24. They share the CSV-mapping
approach (this one targets the V2 sheet layout and its photo-link
columns). Nothing here writes to any sheet.

## Dev

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # verified green on Next 16.2.10
```
