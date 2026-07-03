# This repo, in brief

**Three distinct projects live in this account — do not let them blend.**
This repo (`JayLeeFit-`) started as the JayLeeFit fitness-coaching data
layer (see `README.md`, `airtable-schema.json`, `docs/`), grew a second,
unrelated business in `storefront/` — **EHC**, a men's/women's secondhand
apparel resale operation (Poshmark/eBay) — and now has a third: a social
content pipeline for the JayLeeFit personal brand itself, in
`content-engine/` (see that folder's `README.md` first, then
`ARCHITECTURE.md`).

Check which of the three a request belongs to before acting — the user
sometimes dictates requests that blend language from more than one at
once, and confusing them is worse than asking.

## EHC — the real business, the real data

EHC is not hypothetical — it has a live operation in Google Drive, already
partly run by another agent called **Codex**:

- **`EHC Inventory Log`** (Google Sheet, id `1-UcTy4Cr_NPK622SPRXob7LfpHFEw5874mv9y5E90Ys`) —
  71+ real inventory rows: SKU, brand, condition, eBay comps, pricing research.
  This is the real source of truth for inventory.
- **`Poshmark Agentic Inventory Command Sheet`** — a more sophisticated sheet
  with an actual agent-routing dashboard, ROI gates, research/problem-finder
  tabs, actively maintained by Codex. Don't write to sheets Codex owns without
  a clear read on whether it'll conflict with that system.
- **`EHC Reference Frames`** (Drive folder) — real phone photos + listing
  screenshots, uploaded recently. Not yet matched to specific SKUs — one
  `EHC Inventory Log` row's Condition Notes references a per-item Drive
  folder link (`.../folders/1oqlB4ap...`), suggesting Codex's workflow links
  photos to items via URLs buried in free-text notes, not a dedicated column.
  Matching real photos to real SKUs is a real open problem, not solved yet.
- **`EHC Image Import Folder`**, **`EHC Generated Assets`**, **`EHC Completed
  Videos`** — designated future drop zones, currently empty.

**Hard tooling limit:** I can read Google Sheets (via the Drive MCP connector
or the public CSV-export endpoint) but have no tool to write/update Sheet
cells. "Automatically update the sheet" isn't buildable end-to-end right now
without either a Google service-account write credential or moving
structured tracking to Airtable (where full read/write access exists).

## The storefront (`storefront/`)

A custom Next.js 16 + Tailwind v4 + Stripe storefront, not a Shopify theme.
Brand identity: **Old Light** — *"Secondhand, sold under old light."* Core
concept: starlight arrives "used" (years old) but still lit — the same
trick a good secondhand find pulls off. Superseded an earlier "RE:UP"
streetwear direction; don't resurrect RE:UP branding.

- Palette/type/condition-grading-as-moon-phases documented in
  `storefront/README.md` and `storefront/lib/asset-pipeline/README.md`.
- `storefront/lib/products.ts` reads inventory from a Google Sheet CSV
  export and maps columns two ways: this project's own documented spec
  (`Category`=gender, `Type`=garment), and the real EHC sheet's layout
  (`Department`=gender, `Category`=garment, `Realistic Sold Value`=price,
  `$`-formatted prices, no `In Stock` column — availability inferred from
  `Inventory Status`/`Condition` text instead). Verified against a real
  71-row export — see `storefront/lib/verify-ehc-mapping.ts`.
- **No photos are wired to real inventory yet.** Every real item currently
  renders the "Photo coming soon" placeholder.
- `storefront/lib/asset-pipeline/` — Stage 1 of a batch reference-image
  prompt engine (shot angles + Old-Light-branded prompts per product). Free,
  deterministic, verified. Stages 2-5 (actual paid image/video generation,
  a Sheet-based results ledger, scheduled autonomy) are designed but not
  built — see that folder's README for the honest scope boundary on what
  "autonomous" can mean given current tool access.
- Stripe: real Checkout Sessions, server re-prices every cart item from
  live inventory data — never trust client-submitted price.
- Cross-promo to JayLeeFit coaching: env-var driven
  (`NEXT_PUBLIC_SHOW_CROSS_PROMO`/`NEXT_PUBLIC_JAYLEEFIT_URL`), on by default.

## Where things stand

- All storefront work is on branch `claude/apparel-resale-storefront-jz63ws`,
  tracked by **PR #5** (draft) against the repo's actual default branch,
  `claude/fitness-airtable-client-data-g1iot3` (not `main`).
- Real deployment (custom domain) needs the user's own Vercel account + DNS
  access — not something to do unilaterally.
- Higgsfield image/video generation is connected and real credits are on
  the line (balance was ~15 credits, ~1.25 credits per 1K product image via
  `recraft_v4_1` utility mode) — always preview cost with `get_cost:true`
  and get explicit go-ahead before spending, don't batch-generate blind.

## Open threads (pick up here)

1. Match real EHC Reference Frames photos to real inventory SKUs.
2. Decide/run the image-gen pilot (small batch, cost-previewed first).
3. Get the storefront actually deployed to a real domain.
4. Confirm the `EHC Inventory Log` sheet is shared "Anyone with the link →
   Viewer" (unverified — the permission-check tool errored out repeatedly
   this session).
