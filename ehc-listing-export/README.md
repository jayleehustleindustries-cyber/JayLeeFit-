# EHC → eBay bulk draft export

Turns the **EHC Inventory Log** Google Sheet into eBay's bulk
draft-listing upload format, so the whole inventory lands in eBay as
drafts in one upload — no per-item typing, no browser automation, no
credentials handed to an agent.

## Why drafts, not live listings or headless-browser posting

- An agent in this environment has no eBay/Vendoo session and can't get
  past login + 2FA + bot detection, so "headless Chromium into my
  account" isn't a real path. eBay's own bulk-upload pipe is.
- Drafts tolerate missing data (photos, a few prices, unconfirmed
  sizes). Every sellable item gets a draft now; you finish each one in
  Seller Hub's bulk editor when photos are matched.
- Nothing goes live without you pressing publish — no accidental
  listings with placeholder data.

## How to upload (one time, ~2 minutes)

1. Go to **Seller Hub → Reports → Upload** (ebay.com/sh/reports/uploads).
2. Choose **Upload template**, pick `output/ebay-draft-listings.csv`.
3. When processing finishes, your drafts are at **ebay.com/sh/lst/drafts**.
4. Fix anything eBay flags per-row (usually a category ID it wants
   narrowed) in the bulk editor, add photos, publish.

`output/vendoo-import.csv` carries the same data in a generic
column layout if you'd rather import into Vendoo/Crosslist instead —
map columns in their import wizard.

## Files

- `generate.py` — stdlib-only generator; run `python3 generate.py
  [inventory.csv]` to regenerate from a fresh sheet export.
- `inventory-snapshot-2026-07-10.csv` — the sheet as exported on that
  date (80 rows).
- `output/ebay-draft-listings.csv` — 78 drafts, upload this.
- `output/vendoo-import.csv` — same items, generic cross-lister layout.
- `output/report.md` — every draft with its assigned category, plus
  skipped rows and review flags (unconfirmed gender, missing price,
  placeholder SKUs for the 9 rows the sheet hasn't SKU'd yet).

## Mapping decisions

- **Price** = `Realistic Sold Value` (the researched comp), not the
  aspirational high comp.
- **Condition**: "New with tags" → NEW; "Fair/Stained" → USED_GOOD;
  "Damaged" → USED_ACCEPTABLE; everything else pre-owned → USED_EXCELLENT.
- **Category ID**: keyword match on the sheet's `Category` + title,
  split by `Department` gender; unconfirmed gender defaults to Men's
  and is flagged in the report.
- **Skipped**: Donated/Liquidated and Passed/Not Purchased rows.
- Photos: intentionally blank — Reference Frames photos aren't matched
  to SKUs yet (open thread #1 in the repo CLAUDE.md). Drafts don't
  need them to upload.

To refresh after the sheet changes: export the sheet as CSV (File →
Download → CSV), then `python3 generate.py path/to/export.csv`.

## Recurring sync (sheet → eBay drafts)

`exported-skus.txt` is the ledger of every item already delivered in an
upload file (keyed by SKU + title fallback, so rows that later gain a
real SKU aren't re-exported). When the ledger exists, `generate.py`
also emits `output/ebay-draft-listings-delta.csv` containing **only
items not yet exported** — or prints "in sync" and emits nothing when
the sheet is fully covered. After delivering a delta file, rerun with
`--update-ledger` to absorb it.

A scheduled agent Routine re-pulls the sheet on this cycle and pushes /
delivers the delta whenever the sheet has grown; it stays silent when
in sync. The ledger tracks *exported to a draft file*, not *live on
eBay* — publishing the drafts (photos, final check) stays a human step,
and nothing here can read the eBay account to confirm it.
