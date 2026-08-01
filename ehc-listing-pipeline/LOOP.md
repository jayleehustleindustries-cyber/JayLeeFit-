# LOOP — the recurring cycle that keeps EHC listing

Two loops: a **session loop** (whenever new items or free time exist) and a
**weekly self-check**. Both are runnable by any model — Codex, Haiku,
Sonnet, or a human with the checklists printed. Nothing here needs Fable.

## Session loop

**Trigger:** any of —
- New capture batch (photos + SKUs) arrives → run steps 2→5.
- ≥ 5 items sitting BLOCKED on desk-only facts → run step 3.
- Human says "give me the queue" → run step 1 only.

**Steps:**
1. **Gate first.** Export CSV, run `tools/gate.py`. The output is the plan:
   Capture Queue → human, desk-only blocks → model, LISTABLE rows → packet.
2. New batches: run checklist 01 Part B (row creation).
3. Rows missing only comps/pricing: run checklist 02.
4. Rows passing the gate: build a Publish Packet (checklist 03) and deliver
   it. **Every session that has ≥1 LISTABLE row must end with a packet.**
5. **Gate again.** Apply the session self-check in checklist 00. Report one
   line: `LISTABLE X (+n) / LISTED Y (+n) / queue Z items / packet: yes|no`.

## Weekly self-check (Sunday)

1. Run the gate. Compare to last week's one-line report (kept at the bottom
   of this file — append each week).
2. **Stale rule:** any item Listed > 60 days → drop list price 15% (round
   to $X.99, respect the $9.99 floor) in the next Publish Packet as a
   reprice instruction. Any item Listed > 120 days → move to donate/bundle.
3. **Drift rule:** if Codex's Command Sheet contains any Item ID that is
   not a Permanent SKU in the Inventory Log, flag it in the report — that's
   corruption, fix it before anything else.
4. Append the one-line report below.

## Who runs what (post-Fable assignments)

| Step | Minimum runner |
|---|---|
| gate.py | no model at all (any scheduler/human) |
| Row creation from photos (01-B) | any vision-capable model (Haiku-class OK — tags are photographed close-up on purpose) |
| Comp research (02) | any model with web/eBay access; human in 10 min if none |
| Publish Packet assembly (03) | any text model — it's field reordering |
| Publishing | human, phone |
| Weekly check | any model; the rules are arithmetic |

## Weekly reports (append-only)

- 2026-07-04 (baseline, pre-rebuild): LISTABLE 0 / LISTED 5 / BLOCKED 64 /
  DONE 2 / packet: no. 22 rows with no SKU. Banned phrases everywhere.
