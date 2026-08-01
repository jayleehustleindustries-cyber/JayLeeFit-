---
name: ehc-calendar
description: Create the weekly EHC (Everyday Hustle Co. / jay_legacy_fit) content calendar. Use when asked to make, draft, or update the weekly content schedule, "Content schedule for this week", or run the EHC Content Calendar Agent (AG-010). Works on any model — all judgment is encoded in the referenced files.
---

# EHC weekly content calendar

Do not draft anything from memory or taste. Everything you need is in
`content-engine/calendar/`:

1. Read, in order: `SOP.md`, `HOOK-STANDARD.md`, `TEMPLATE.md`,
   `EXAMPLES.md`, and the two most recent files in `weeks/`.
2. Follow `SOP.md` steps 1–4 exactly (gather → draft from pattern banks
   → self-check with `python3 verify.py weeks/week-NNN.md` → deliver as
   a DRAFT for the owner's approval).
3. Hard rules that override anything else you might think:
   - Only draft hooks from the pattern banks in `HOOK-STANDARD.md` §3.
   - A row that fails `verify.py` or the §4 checklist gets rewritten,
     never shipped with a caveat.
   - Never publish, schedule, or mark APPROVED yourself — the owner
     (Aaron) approves every week.
   - Never edit `HOOK-STANDARD.md` during a weekly run (bank refresh is
     a separate monthly task per §5).
4. If the previous week's file is missing from both the repo and Drive,
   stop and tell the owner — do not reconstruct it from memory.
