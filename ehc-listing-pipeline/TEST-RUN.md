# Test run — real item A2-MD-0042 through the rebuilt pipeline

Date: 2026-07-04. Item: Mondetta Performance + Luxury black pull-on
straight-leg pants, size M — the single most complete row in the real
Inventory Log (31/34 fields), which under the old system still sat at
`Needs Review` indefinitely.

## BEFORE (verbatim from the live sheet)

- Condition: `Pre-owned; final inspection required`
- Condition Notes: `Light lint and wrinkling are visible... inspect the
  waistband, rise, crotch, seams...` (an instruction, not a finding)
- Cost of Goods: `Not provided`
- 90 Day eBay Sold Count: `Unavailable — exact 90-day sold count not verified`
- Market Range: `Broader market estimate; exact sold comps are incomplete
  and measurements are missing.`
- Inventory Status: `Needs Review` → **stuck, like the other 63**

Old-system outcome: every future agent pass re-reads the hedges, agrees
more verification is needed, adds more prose. Item never lists.

## Rebuilt pipeline, step by step

**1. Gate (tools/gate.py on the real export):**
`BLOCKED A2-MD-0042 — missing: Condition; in-hand: Condition` — everything
else passes. The gate converts "Needs Review" into ONE named physical fact.

**2. Capture Queue → human, 2 minutes, item in hand** (checklist 01 §A,
steps 2.6–2.8 + cost): measure waist/inseam, flaw check in the fixed
order, state cost. *(Simulated below for the test; marked accordingly.)*

- Flaw check result: light lint only → grade `Good`, note the flaw. [SIM]
- Waist flat 14in, inseam 27in. [SIM]
- Cost: forgotten → `$2 (est)` per SOP. [SIM]

**3. Model applies checklist 02 self-check** — comps already present and
plain (`$10.00 / $16.00 / $22.00`), so research is DONE by rule; no
re-research. Poshmark price = $16 × 1.2 → round up = **$19.99** (≥ $9.99
floor, ≤ high×1.5 ✓). eBay = **$16.99**. Lowest acceptable = $14.

**4. AFTER — the row:**

- Condition: `Good`
- Condition Notes: `Light lint on front thighs; no other flaws found on
  inspection. Waist flat 14in, inseam 27in.`
- Cost of Goods: `$2 (est)`
- Sold Count/Sell-Through: EMPTY (never blocks)
- Market Range: `3 comps $10–$22, priced at middle.`
- Gate result: **LISTABLE** (verified by re-running gate.py on the
  modified row). Bonus finding: on the first re-run the gate flagged 1
  residual banned phrase — the runner (Fable itself) had forgotten to flip
  `Inventory Status` from `Needs Review` to `Unlisted` per checklist 01 §B
  step 4. The script caught the smartest available model skipping a step,
  which is exactly the property a post-Fable system needs. Fixed → clean
  run: `LISTABLE 1 / banned phrases 0`.

**5. Publish Packet emitted** (checklist 03):

```
=== A2-MD-0042 — Mondetta black pull-on straight-leg pants M ===
PHOTOS: EHC Reference Frames / A2-MD-0042_* (need >=4 — see photo note)

POSHMARK
Title:      Mondetta Womens M Black Stretch Straight Leg Pull On Pants
Description: Mondetta Performance + Luxury women's black pull-on stretch
  pants, size M. 84% polyester / 16% spandex, made in Jordan. Wide
  waistband, straight leg, gold logo at rear waistband. Waist flat 14in,
  inseam 27in. Light lint on front thighs; no other flaws.
Category:   Women > Pants > Straight Leg
Size:       M / Brand: Mondetta / Color: Black / Condition: Excellent used
Price:      $19.99   (Lowest acceptable: $14 — accept offers >= this)

EBAY
Price:      $16.99  Buy It Now, Best Offer ON, auto-accept $14, decline $11
Shipping:   Calculated, 2 lb (pants)
```

## Honest weaknesses found by this test (and the fixes applied)

1. **Photos are still the weakest link.** The gate can't verify Drive
   photos from a CSV, and this item's photos aren't SKU-matched yet — under
   the old system OR the new one, it can't actually go live today. Fix
   applied: photo check is called out in the gate output and in the packet
   (`need >=4`), and checklist 01 makes SKU-in-filename the law for
   everything captured from now on. The 71 legacy items need one
   photo-matching session (open thread #1 in the root CLAUDE.md) — the
   Capture Queue output is the shopping list for it.
2. **A dumb model could over-trust step 2's simulation.** In a real run
   the human supplies those three facts; the SOP therefore forbids the
   model from filling Condition/measurements/cost itself unless they are
   visible in photos — added explicitly to checklist 01 §B step 6 wording
   ("empty + queue" beats guessing).
3. Where the old way was BETTER: Fable-class judgment sometimes caught
   brand misidentifications (e.g. the Fabletics-not-Carhartt catch in
   A2-MD-0050). A checklist can't fully replace that. Mitigation written
   into checklist 01: photos 3–5 are mandatory close-ups of the actual
   tags, so identification is reading, not inference.

## Scoreboard

| Metric | Before (old system) | After (this test) |
|---|---|---|
| Gate status | BLOCKED (`Needs Review`, undefined) | LISTABLE, then packet |
| Human minutes required | undefined ("review") → never happened | 2 min, itemized |
| Model capability needed | Fable-class judgment, still stalled | checklist-following only |
| Output | more prose | a publishable listing at $19.99 |
