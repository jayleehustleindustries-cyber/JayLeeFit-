# EXAMPLES — copy the right thing

## Gold standard: a complete row (what checklist 01+02 must produce)

| Field | Value |
|---|---|
| Permanent SKU | A2-MD-0049 |
| Storage Location | A2 |
| Item Name | Columbia red plaid stretch long-sleeve shirt |
| Brand | Columbia |
| Category | Casual Button-Down Shirt |
| Size | XXL |
| Color | Red plaid |
| Material | 98% cotton 2% elastane |
| Condition | NWT |
| Condition Notes | No flaws found on inspection |
| Cost of Goods | $2 (est) |
| Sold Comp Low | $15.57 |
| Realistic Sold Value | $37.00 |
| Sold Comp High | $39.95 |
| Market Range | 3 sold comps $15.57–$39.95; NWT priced at high per SOP. |
| Inventory Status | Unlisted |
| SEO Listing Title | Columbia Mens Red Plaid Stretch Long Sleeve Shirt XXL NWT |

Note what's ABSENT: no "verify", no "final inspection required", no
confidence essay. Missing facts would be EMPTY cells + a Capture Queue
entry, not prose.

## Gold standard: Publish Packet block

See checklist 03 — the A2-MD-0049 block there is the reference.

## Failure modes (real, from the old sheet — never reproduce)

1. **The hedge row.** `Size: Not confirmed`, `Condition: Not confirmed`,
   `Market Range: Analyst estimate; missing photos... Low confidence.`
   → 71 rows of this produced 5 listings. Empty cell + queue entry instead.
2. **The cost deadlock.** `Listed Price: Needs Cost` on 17 Command Sheet
   rows; nothing listed while waiting for a number nobody recorded.
   → Cost never blocks. `$2 (est)` and move.
3. **The TEMP key.** `TEMP-HUNT-02-20260626 ... blocked pending storage
   confirmation.` → No SKU, no row. SKU is assigned holding the item.
4. **The eternal inspection.** Items marked Listed while Condition still
   said "final inspection required" — inspection debt shipped to buyers.
   → Inspection is capture step 2.8; it happens exactly once, before the row.
5. **The re-research spiral.** Same items researched repeatedly because
   hedged output looked unfinished to the next agent. → Research is DONE
   when 3 comp fields hold dollar amounts. Gate says so mechanically.
6. **The second key space.** Command Sheet invented `Item ID`s (A2-MD-0037
   in one sheet ≠ same item's row in the other). → One key: Permanent SKU.

## Litmus test for any new automation idea

Before adding a step, ask: "does this step put a dollar amount, a photo, a
measurement, or a live listing into the world?" If it only produces more
text ABOUT the inventory, it's the old failure mode wearing a new hat.
