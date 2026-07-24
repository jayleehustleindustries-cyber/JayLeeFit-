# EHC eBay / Vendoo sync

Turns the **EHC Inventory Log V2** Google Sheet
(`17JeIyMsos60gqsppplILJYnQVV1276V5KxODcDo-PuI`) into ready-to-import
marketplace files, plus a Make.com blueprint for automating the eBay side.

```
data/inventory-v2.json        normalized snapshot of the sheet (83 SKUs)
build-exports.mjs             generator — run with: node build-exports.mjs
out/ebay-draft-listings.csv   eBay Seller Hub bulk-upload file (Draft action)
out/vendoo-import.csv         Vendoo-friendly import file
out/make-inventory.json       flat JSON for Make.com scenarios / data stores
out/readiness-report.md       per-SKU blockers + what to cross-list first
make-scenario-blueprint.json  importable Make.com scenario skeleton
```

## Fastest path to "my eBay is updated"

1. **eBay Seller Hub → Listings → Upload** (or *Reports → Upload*):
   upload `out/ebay-draft-listings.csv`. Every row uses the **Draft**
   action, so this creates ~81 editable drafts — nothing goes live until
   you open each draft, attach photos, confirm the category eBay suggests,
   and publish. The SKU lands in *Custom label*, so sold items reconcile
   back to the inventory log by SKU.
2. Start with the three items the log marks **"Poshmark Listed / eBay
   Pending"** — A2-MD-0046 (Brooks Brothers quarter-zip), A2-MD-0048
   (Nautica windbreaker), A2-MD-0050 (Fabletics joggers). They already
   have Poshmark listings, so photos and details are one copy-paste away.
3. `out/readiness-report.md` lists the 51 items with open flags
   (missing price on A4-MD-0060, unconfirmed brands/sizes, "Needs
   Review" statuses) so review effort goes where it matters.

## Vendoo path

Vendoo has no public API — its bulk intake is CSV import (Vendoo →
Inventory → Import) plus its crosslisting extension. `out/vendoo-import.csv`
carries title/SKU/brand/size/color/condition/price/description plus the
sheet's *Current Status* and *Target Platforms* (A4/A5 items also target
Mercari) so Vendoo's import wizard can map columns directly. Photos still
attach in Vendoo per item.

## Make.com automation path

`make-scenario-blueprint.json` imports as a scenario skeleton
(Scenarios → Create → import blueprint):

- **Google Sheets · Search Rows** on the V2 sheet, filtered to rows whose
  *Listing Platforms* contain "eBay" and *Inventory Status* ≠ "Listed";
- a normalizer step that strips `$` from prices and builds an 80-char title;
- **HTTP** calls to eBay's Sell Inventory API — `PUT inventory_item/{sku}`
  then `POST offer` — which create **unpublished offers** (drafts), never
  live listings, so photo-less items can't go live by accident.

After import you must attach your own Google connection, an eBay OAuth2
connection (scope `sell.inventory`), and your Seller Hub business-policy
IDs (fulfillment/payment/return) plus `merchantLocationKey`. Publishing
(`publishOffer`) is deliberately left out of the flow.

## Photos — the honest gap

The **EHC inventory import file v2** Drive folder
(`1BeJVhhEBB_XGDm1dHctL0APvBNw3lMKr`) holds **150+ photos** (iPhone
HEIC/JPG, Photoroom cutouts, listing screenshots) uploaded July 3–6, with
camera filenames — no SKU in any filename and no mapping column filled in
the sheet (rows 0064–0068 have an empty "Image Url Address" placeholder).
Until photos are matched to SKUs, every export intentionally leaves the
photo field blank and every eBay listing stays a draft. Matching is open
thread #1 in the repo's `CLAUDE.md`.

## Refreshing the snapshot

`data/inventory-v2.json` is a hand-normalized snapshot (2026-07-10). The
raw sheet has known quirks the normalization fixed — unquoted commas in
Color cells shifting columns on ~7 rows, `$12.00` vs bare `13` prices,
duplicated trailing columns on some A4 rows, and missing SKUs 0031/0041.
To refresh: re-export the sheet as CSV, apply the same fixes, and re-run
`node build-exports.mjs`. (No Google-write credential exists in this
toolchain, so the sheet itself is never modified by this tool.)
