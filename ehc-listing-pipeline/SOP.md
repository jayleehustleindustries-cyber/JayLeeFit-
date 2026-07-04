# EHC Listing Pipeline — Standard Operating Procedure

**Load this file before touching any EHC inventory data.** It is written so
that any model — or a human with no context — can run the pipeline
correctly. Do not improvise beyond what is written here. If a situation is
not covered, add the item's SKU to the Blocked list with one sentence of
why, and move on. Never invent a new rule mid-run.

## What this system does

Takes a thrifted garment from "photographed" to "live listing on
Poshmark/eBay" and records everything in the **EHC Inventory Log**
(Google Sheet, id `1-UcTy4Cr_NPK622SPRXob7LfpHFEw5874mv9y5E90Ys`).

Success = items reach `Inventory Status: Listed`. Drafts, research notes,
and hedged prose are NOT output. **A run that improves 10 rows but lists 0
items has failed.**

## The one law: no hedging in data fields

The old system died because agents wrote "Not confirmed", "verify before
listing", "final inspection required", "Pending" into data cells instead of
listing items. 71 items produced 5 listings and $0 payout that way.

**Banned phrases in any data field:** `Not confirmed`, `Pending`,
`unconfirmed`, `verify`, `Needs Review` (as a value in a fact field),
`final inspection required`, `TBD`, `unknown`, `low confidence`.

If a fact is missing, you do not write a hedge into the cell. You leave the
cell EMPTY and add the SKU + the missing fact to the **Capture Queue**
(see LOOP.md). Empty cells are countable; hedged prose is a swamp.

## Single source of truth

- **Master:** `EHC Inventory Log`. One row per item. `Permanent SKU` is the
  only item key that exists.
- **Codex's Poshmark Agentic Inventory Command Sheet** is a derived work
  queue. It must use `Permanent SKU` as its `Item ID` — never invent a new
  key, never a `TEMP-*` key. If an item has no Permanent SKU yet, it does
  not enter the Command Sheet; it goes to the Capture Queue instead.
- Never overwrite a human-entered value (Cost of Goods, Storage Location,
  condition flaws). Append corrections to Notes with a date instead.

## SKU rule (kills TEMP keys)

`<BIN>-MD-<4-digit item number>` e.g. `A1-MD-0031`, `A2-MD-0055`.

- SKU is assigned **at capture time, while holding the item**, never later.
- The bin is wherever the item physically goes at that moment. Write the
  SKU on masking tape on the bag/hanger. No item gets a row without a SKU;
  no SKU without a physical bin. Next item number = highest existing item
  number in the sheet + 1 (item numbers are globally unique across bins).

## The LISTABLE gate

A row is **LISTABLE** when ALL of these 10 fields are non-empty and contain
no banned phrase:

1. `Permanent SKU`
2. `Storage Location` (a real bin, not "Pending confirmation")
3. `Brand`
4. `Size` (tag size; if no tag, measured size written as `Approx WxL from measurements`)
5. `Condition` (one of exactly: `NWT`, `Excellent`, `Good`, `Fair` — see grading table)
6. `Condition Notes` (flaws listed, or the exact phrase `No flaws found on inspection`)
7. `Realistic Sold Value` (a dollar amount)
8. `Sold Comp Low` and `Sold Comp High` (dollar amounts)
9. `SEO Listing Title` (rules below)
10. Photos: at least 4 photos whose filenames start with the SKU exist in
    the `EHC Reference Frames` Drive folder (or the item's linked folder).

Check it mechanically: `python3 tools/gate.py <csv-export>` prints
LISTABLE / BLOCKED (+ exactly which facts are missing) for every row.
**Run the gate before and after every session.** The number of LISTABLE and
Listed rows must never go down.

`Cost of Goods` is NOT in the gate. Missing cost never blocks a listing —
record it when known, estimate it as `$2 (est)` from typical thrift cost if
forgotten. The 400% ROI gate applies only to *buying* decisions and to
*repricing* decisions where cost is actually recorded.

## Condition grading (no taste required)

| Grade | Rule |
|---|---|
| `NWT` | Retail tags attached, no flaws |
| `Excellent` | No visible flaws after checking: pits, collar, cuffs, hems, crotch, zipper, buttons, pilling, fading, odor |
| `Good` | 1–2 minor flaws (light pilling, faint mark, light fading) — each one named in Condition Notes |
| `Fair` | 3+ flaws or any major flaw (hole, stain, broken zipper) — all named. If Fair AND Realistic Sold Value < $12: donate, mark `Donated / Liquidated`, done. |

## Pricing (formula, not feel)

1. Find 3+ sold comps (checklist 02). `Sold Comp Low` = cheapest of the 3,
   `Sold Comp High` = highest, `Realistic Sold Value` = the middle one.
2. **List price = Realistic Sold Value rounded up to next $X.99, +20% on
   Poshmark** (offer headroom; Poshmark buyers expect to negotiate).
   eBay list price = Realistic Sold Value rounded up to $X.99.
3. Floor: never list below $9.99. If Realistic Sold Value < $8 → donate or
   bundle with a same-brand item; do not list solo.
4. Lowest Acceptable Price = 70% of list, rounded to whole dollar. Accept
   any offer at or above it without asking anyone.
5. NWT items: use the high comp, not the middle one.

## SEO Listing Title rules

`Brand + Gender + Color + Item type + Size` in that order, ≤ 80 chars, no
punctuation except spaces, no hype words (`rare`, `amazing`, `must-have`).
Example: `Brooks Brothers Mens Orange Cotton Quarter Zip Pullover S`.
Description = 2–4 sentences: what it is, material, measurements, flaws
verbatim from Condition Notes. Flaws are ALWAYS disclosed. Never write
"verify before purchasing" — the verifying already happened at capture.

## Who does what after July 7

| Step | Runner | File |
|---|---|---|
| Capture (photos, tags, measurements, SKU, bin) | **Human, in hand, once** | checklists/01-intake-capture.md |
| Row creation from capture batch | Any model / Codex | checklists/01-intake-capture.md §B |
| Comp research + pricing | Any model / Codex | checklists/02-research-pricing.md |
| Gate check | `tools/gate.py` (no model needed) | checklists/00-verification-gate.md |
| Publish to Poshmark/eBay | Human on phone (10 min per batch) | checklists/03-publish.md |
| Weekly loop + self-check | Any model / Codex | LOOP.md |

No step in this pipeline requires reasoning beyond following its checklist.
If a step feels like it needs judgment, the checklist is missing a rule —
flag it in Notes, pick the conservative option (lower price, worse
condition grade, donate), and continue.

## Known failure modes (do not repeat)

Real quotes from the old system — each one is now illegal:

- ❌ `Size: Not confirmed` → leave empty + Capture Queue entry.
- ❌ `Listed Price: Needs Cost` → cost never blocks pricing; price from comps.
- ❌ `TEMP-HUNT-02-20260626` as a key → no row without a real SKU.
- ❌ `Storage Location: Pending confirmation` (22 items) → SKU is assigned
  holding the item; bin comes first.
- ❌ Marking an item `Listed` while Condition still says "final inspection
  required" → the gate blocks this; inspection happens at capture, once.
- ❌ Re-researching an already-researched item because the last run's output
  was hedged → research is done when comps + price are filled; move on.
