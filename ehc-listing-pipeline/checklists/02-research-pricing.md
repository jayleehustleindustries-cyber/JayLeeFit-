# Checklist 02 — Comp Research & Pricing

Input: a row with Brand, Category, Size, Condition filled (from checklist
01). Output: `Sold Comp Low`, `Realistic Sold Value`, `Sold Comp High`,
list prices, and the market fields — all as plain dollar amounts.

Budget: **≤ 10 minutes per item.** Research is done when the three comp
fields are filled from ≥ 3 sold comps. Do not keep researching past that.

## Steps

1. Search eBay **sold/completed** listings:
   `<Brand> <gender> <color> <item type> <size>` — e.g.
   `Brooks Brothers mens orange quarter zip S`. Filter: Sold Items,
   Pre-owned (or New for NWT).
2. Take the 3 most similar solds (same brand + same garment type + same-ish
   size; color match is nice-to-have). Record their prices.
   - Fewer than 3 exact solds? Widen ONE notch at a time: drop color →
     drop size (±1) → sister category (pullover→sweater). Note the widening
     in `Market Range` in one sentence, e.g. `Comps widened to any color`.
   - Still fewer than 3 after widening twice? Use 2 comps and set
     `Realistic Sold Value` to the LOWER one. Never stall — a conservative
     price listed beats a perfect price drafted.
3. Fill: `Sold Comp Low` = cheapest of the 3, `Sold Comp High` = highest,
   `Realistic Sold Value` = middle (for NWT: use the high).
4. Record counts if visible in the same search (no extra searching):
   `90 Day eBay Sold Count`, `Current eBay Active Count`,
   `90 Day Sell-Through Rate` = sold ÷ active (1 decimal). If not visible,
   leave EMPTY. These fields never block anything.
5. Compute list prices per SOP pricing formula (comps → +20% Poshmark →
   round up to $X.99 → floor $9.99 → donate if RSV < $8).
6. `Market Range` = ONE sentence stating what the comps were, e.g.
   `3 sold comps $18–$29, priced at middle.` Never write a confidence
   disclaimer — the widening note IS the confidence signal.

## Self-check (must pass before moving on)

- [ ] All three comp fields are plain dollar amounts (`$16.00`), no prose.
- [ ] Poshmark list price ends in .99, is ≥ $9.99, and sits between
      `Sold Comp Low` and `Sold Comp High × 1.5`.
- [ ] `Market Range` is ≤ 1 sentence and contains no banned phrase.
- [ ] You did not re-open research on a row that already had all three
      comp fields filled. (If prices look stale — item unsold 60+ days —
      that's the repricing rule in LOOP.md, not a re-research.)
