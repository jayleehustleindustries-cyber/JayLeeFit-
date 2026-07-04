# Resale Clip Engine — SOP (load this to run the system)

**What this system does:** turns one sourced resale item into one short-form
vertical clip (9:16) that drives comments/DMs/sales, published to Instagram +
TikTok and logged in Airtable.

**This file is written for the dumbest model or a tired human.** Follow the steps
literally. Do not improvise. Every judgment call has been replaced with a rule or
a checklist. If a step says "pick from the Hook Bank," pick from the Hook Bank —
do not invent a new hook.

---

## The standard of success (what "good" means, measured)

A clip is a success only if it does BOTH:
1. **Passes the verification gate** in `VERIFICATION.md` (all 10 boxes ✅), and
2. **Drives the funnel:** comments with the CTA keyword → DMs → link clicks → sale.

Do not measure success by likes or views. Measure by keyword-comments and sales.

---

## Who runs each step (the mix, now that Fable is gone)

| Owner | Means |
|-------|-------|
| **AUTO** | Automation: Airtable + Zapier/Make (move data), Metricool (schedule), ManyChat (CTA→DM). No AI judgment. |
| **MODEL** | A cheap/small model in Claude Code. Only does text: drafts the script + caption from the Airtable row, and runs the verification checklist. |
| **HUMAN** | You. Films 3 fixed shots, edits to the template, taps approve/publish. |

The system must never require MODEL to make a taste call. MODEL only fills
templates and checks yes/no boxes.

---

## The pipeline (7 steps, each with an owner)

| # | Step | Owner | Rule / file |
|---|------|-------|-------------|
| 0 | **Trigger** | AUTO | An item's Status becomes `Coming Soon`, OR it is batch day (Sunday). |
| 1 | **Intake** | HUMAN + AUTO | Log the item in Airtable **Resale Inventory** via the mobile form: photo, Purchase Price, Brand (Notes), Size (Notes), any flaw. |
| 2 | **Script** | MODEL | Run `checklists.md → Step 2`. Produces Hook + 3-beat script + Caption + CTA keyword from the row. Fills a template; no creativity. |
| 3 | **Film** | HUMAN | Shoot the 3 fixed shots in `checklists.md → Shot List`. Same 3 shots every time. |
| 4 | **Edit** | HUMAN | Assemble to the fixed template in `checklists.md → Step 4` (CapCut/Descript). Add hook text on frame 1, price reveal, CTA end card. |
| 5 | **Verify** | MODEL + HUMAN | Run `VERIFICATION.md`. ALL 10 boxes must be ✅. Any ❌ → fix and re-check. |
| 6 | **Publish** | AUTO | Schedule via Metricool at the best window (Wed–Fri 10:00 / 18:00 PT). Set the CTA keyword in ManyChat. |
| 7 | **Log** | AUTO | Set Status = `Listed`, paste the clip link into the item's Airtable row. |

---

## The loop (recurring)

- **Cadence:** once a week (Sunday), batch-film 5 items in one session. Efficiency
  rule: never film one item at a time — film the whole batch, then edit the batch.
- **Trigger to run:** ≥5 items at Status `Coming Soon`, OR it's Sunday.
- **Self-check:** the loop is only "done" when every clip in the batch has passed
  `VERIFICATION.md` and been scheduled. If any clip fails twice, park that item at
  Status `Sourced` and move on — do not hold up the batch.
- **Model note:** MODEL drafts all scripts/captions for the batch up front (cheap,
  fast). HUMAN films + edits. AUTO schedules. No step waits on a smart model.

---

## Hard rules (never break these)

1. Never publish a clip that fails even one verification box.
2. Never bake AI-generated text into a clip — all on-screen text is typed by hand
   in the editor.
3. Always state a price anchor ("paid $X / asking $Y" or "retails $Z").
4. Always end with exactly one CTA keyword.
5. Always log the clip link + status back to Airtable before moving on.

If you are unsure about anything not covered here, STOP and ask the human. Do not
guess.
