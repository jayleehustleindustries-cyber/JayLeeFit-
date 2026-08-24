# Checklist 01 — Intake Capture (the one-touch pass)

This is the step the old system never defined, and it's why 64 of 71 items
never listed. Everything the pipeline needs from the physical item is
captured HERE, ONCE, while the item is in hand. If this checklist is
followed, no downstream step ever needs the item touched again.

Budget: **≤ 4 minutes per item.** Don't polish. Done beats perfect.

## Part A — Human, item in hand

Do items one at a time, start to finish. No batching of half-steps.

1. **Assign the SKU first.** Look up the highest item number in the
   Inventory Log, add 1. Pick the bin the item will live in.
   SKU = `<BIN>-MD-<number>`, e.g. `A2-MD-0055`. Write it on masking tape,
   stick it on the bag/hanger. Say it out loud in the first photo's video
   caption or write it on a card in frame.
2. **Take exactly these 8 photos, in this order** (order is how the model
   knows which photo is which — do not shuffle):
   1. Front, full garment, laid flat
   2. Back, full garment
   3. Brand tag (close, readable)
   4. Size tag (close, readable)
   5. Material/care tag (close, readable)
   6. Measurement 1: pit-to-pit (tops) or waist flat (bottoms), tape
      measure visible in frame
   7. Measurement 2: length shoulder-to-hem (tops) or inseam (bottoms),
      tape visible
   8. Every flaw found, or a second front angle if none (check in this
      order: armpits, collar, cuffs, hems, crotch, zipper, buttons,
      pilling, fading; sniff test)
3. **Say/record 3 facts** with the photos: cost paid (guess `$2 (est)` if
   forgotten — never leave it to "later"), where it came from (bin day,
   bundle, etc.), and NWT yes/no.
4. Upload the batch to the chat (or the `EHC Reference Frames` Drive
   folder) with the SKU as the message/folder label. **Filenames or folder
   name must contain the SKU** — that is the photo↔item link; there is no
   other one.

If a tag is missing: photo the spot where it would be, and include both
measurements — the size becomes `Approx <measurement> from measurements`.
A missing tag is never a blocker.

## Part B — Model, from the capture batch

Input: one batch of 8 photos + 3 spoken facts + SKU. Output: one complete
row in the Inventory Log (via the current write path — Codex, or a row
drafted in chat for the human to paste if no write access exists).

1. Confirm photo count ≥ 4 and SKU present. If not → do NOT create a row;
   reply with exactly what's missing and stop.
2. Fill from photos: `Brand`, `Size`, `Color`, `Pattern`, `Material`,
   `Country of Manufacture`, `Category`, `Department`, `Style Features`.
   Read tags from photos 3–5; take measurements from photos 6–7.
3. Grade `Condition` using ONLY the SOP grading table. List every flaw
   visible in photo 8 in `Condition Notes`, or write
   `No flaws found on inspection`.
4. Fill `Cost of Goods` from the spoken fact (including `$2 (est)` form),
   `Storage Location` from the SKU's bin, `Timestamp` = today,
   `Inventory Status` = `Unlisted`, `Listing Platforms` = `Poshmark / eBay`.
5. Write `SEO Listing Title` + description per SOP rules.
6. **Self-check before finishing:** re-read the row you wrote. If any cell
   contains a banned phrase (SOP list), empty that cell and add
   `SKU + missing fact` to the Capture Queue instead. A row with 3 empty
   cells and a Capture Queue entry is CORRECT output; a "complete" row full
   of hedges is FAILED output.
7. Hand off to checklist 02 (research) — same session if possible.
