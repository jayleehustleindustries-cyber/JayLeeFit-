# Checklist 03 — Publish (human, phone, 10-minute batch)

Input: the **Publish Packet** — a message the model prepares containing, for
each LISTABLE item, every field in exact app-entry order so the human never
composes anything on the phone, only copies.

Rule for the model: only gate-passing rows (run `tools/gate.py` first) go
into a Publish Packet. Never include a row "that's basically ready."

## Publish Packet format (model produces this, one block per item)

```
=== A2-MD-0049 — Columbia red plaid stretch shirt XXL ===
PHOTOS: EHC Reference Frames / A2-MD-0049_* (8 photos)

POSHMARK
Title:      Columbia Mens Red Plaid Stretch Long Sleeve Shirt XXL NWT
Description: <full description>
Category:   Men > Shirts > Casual Button Down
Size:       XXL
Brand:      Columbia
Color:      Red
Condition:  New with tags
Price:      $47.99   (Lowest acceptable: $34 — accept offers ≥ this without asking)

EBAY
Title:      Columbia Mens Red Plaid Stretch Long Sleeve Shirt XXL NWT
Price:      $39.99  (Buy It Now, Best Offer ON, auto-accept $34, auto-decline $27)
Item specifics: Brand Columbia / Size XXL / Color Red / Material <from row>
Shipping:   Calculated, 1 lb (shirt) — see weight table below
```

Weight table (no scale needed): shirt/tee 1 lb, pants/jeans 2 lb,
hoodie/sweater 2 lb, jacket 3 lb.

## Human steps, per item (~2 min)

1. Open Poshmark → Sell. Select the item's photos (search the SKU in your
   camera roll / Drive — filenames start with it).
2. Copy each field from the packet top to bottom. Change nothing. If a
   field looks wrong, list it anyway and note the SKU + issue in one line
   back to the model — fixing data happens in the sheet, not mid-listing.
3. Publish. Repeat the same block's EBAY section in the eBay app.
4. Reply to the model with the SKUs you published (just the list).

## Model afterstep

Set `Inventory Status` = `Poshmark Listed / eBay Listed` (or whichever
happened) for exactly the confirmed SKUs, add listing date to Notes.
Never mark Listed without human confirmation.

## Offers (standing rules — no judgment needed)

- Offer ≥ Lowest Acceptable Price → accept.
- Offer below → counter once at Lowest Acceptable + $3, then let it go.
- Bundle requests → 15% off combined list. That's the whole policy.
