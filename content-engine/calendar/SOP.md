# SOP — Create the weekly EHC content calendar

Load this file, `HOOK-STANDARD.md`, `TEMPLATE.md`, `EXAMPLES.md`, and the
two most recent files in `weeks/` before writing anything. Follow the
steps in order. Do not skip the verification step. Do not improvise
fields, days, or content types that are not defined here.

## 1. Scope (fixed decisions — do not re-decide)

- Covers **fitness/brand-voice content only** for Everyday Hustle Co. /
  jay_legacy_fit. No resale/inventory promo, no JayLeeFit client data.
- **7 rows, Monday through Sunday**, one per day. Never more, never fewer.
- Personas allowed: **Jay** and **Marie** only. Types allowed:
  **Mechanical**, **Villain**, **Filter** only. Definitions in
  `HOOK-STANDARD.md`.
- The calendar is a DRAFT until the owner (Aaron,
  jayleehustle.industries@gmail.com) approves it. Production must not use
  an unapproved calendar.

## 2. Trigger and cadence

- Runs **once per week, Saturday or Sunday**, producing the calendar for
  the week starting the coming Monday.
- If automated: a weekly scheduled Routine/trigger fires with the prompt
  "Run content-engine/calendar/SOP.md for next week." If manual: Aaron
  (or Codex) opens this file and follows it — the steps are identical.
- Week numbering: previous week's number + 1, zero-padded to 3 digits
  (001, 002, …). The previous number is the highest `weeks/week-NNN.md`.

## 3. Steps

### Step 1 — Gather inputs (10 min cap)
1. Read the last two files in `weeks/` (or the last two `Content schedule
   for this week NNN` Docs in Drive if the repo is unavailable). You need
   them for the no-repetition checks in Step 3.
2. OPTIONAL (skip without guilt if the tool is unavailable): pull last
   week's post performance from Metricool (`getAnalyticsDataByMetrics`,
   brand `jay_legacy_fit`). If one hook clearly outperformed (≥2× the
   week's median views), note its Type — you'll add one extra hook of
   that Type to the Sunday slot's alternates in Step 2. That is the ONLY
   way performance data changes the draft. No other "optimization."
3. OPTIONAL: check the Drive folder `EHC Generated Assets` for new
   assets. If an asset obviously matches a hook you draft, put its file
   name in that row's Asset Need column. If nothing matches, write
   `Generate: <one-line description>` instead. Never leave Asset Need
   blank.

### Step 2 — Draft (follow the fixed weekly recipe)
Fill the table in `TEMPLATE.md` using this rotation. The rotation is
fixed; do not rearrange it:

| Day | Type | Persona | Slot rule |
|---|---|---|---|
| Mon | Mechanical | Marie | Exercise-mistake teaching hook |
| Tue | Villain | Jay | Identity/discipline declaration |
| Wed | Mechanical | Marie | Exercise-mistake teaching hook (different body part than Mon) |
| Thu | Villain | Jay | Contrast: what everyone wants vs. what it costs |
| Fri | Filter | Jay | Audience-repelling statement (the only Filter of the week) |
| Sat | Villain | Jay | Short aesthetic declaration (≤9 words, two clauses) |
| Sun | Villain | Jay | Week-closing recap: the standard held, others didn't |

For every hook: use ONLY the sentence patterns in `HOOK-STANDARD.md` §3
(pattern banks). Write 2 candidate hooks per day, then keep the one that
scores better on the §4 checklist. Put the loser in an "Alternates"
section under the table — the owner sometimes swaps.

### Step 3 — Self-check (mandatory, mechanical)
If you can run code, run `python3 verify.py weeks/week-NNN.md` from this
folder — it automates most of the checklist and prints the handful of
checks that still need eyes (claim truth, body-part variety, contrast).
If you cannot run code, run every row through the verification checklist
in `HOOK-STANDARD.md` §4 by hand. It is pass/fail per row — word counts, banned strings, required
structures, repetition checks. **If a row fails, rewrite it from the
pattern bank and re-check. Never ship a failing row with a note.** When
all 7 rows pass, write `Self-check: 7/7 PASS (<date>)` at the bottom of
the file.

### Step 4 — Deliver for approval
1. Save the draft as `weeks/week-NNN.md` in this repo (commit it on the
   working branch if in Claude Code; in Cowork just create the file).
2. Send it to Aaron with exactly this framing: the table, the alternates,
   and any rows where you had to use a `Generate:` asset placeholder.
   Ask for approve/edit. Do not push it to production channels yourself.

### Step 5 — After approval (owner or any model)
1. Apply any edits Aaron made to `weeks/week-NNN.md`.
2. Publish to Drive: create a Google Doc titled
   `Content schedule for this week NNN` (My Drive root) containing the
   final table — via the Drive `create_file` tool if available, otherwise
   Aaron pastes it by hand. This Doc is what Codex and the daily 8:00 AM
   media-production block read.
3. Mark the repo file `Status: APPROVED <date>`.

## 4. Model routing (post-2026-07-07, no Fable)

| Step | Minimum runner | Notes |
|---|---|---|
| 1 Gather | Haiku-class or by hand | Pure reading; no writing decisions |
| 2 Draft | Sonnet-class recommended; Haiku-class acceptable | Only because the pattern banks + recipe carry the quality; do not run this step "freestyle" on any model |
| 3 Self-check | Haiku-class or by hand | Deliberately mechanical: counting and string-matching |
| 4 Deliver | Any | |
| 5 Publish | Any model with Drive access, or by hand | |
| Approve | **Aaron only** | Never automated |
| Pattern-bank refresh (monthly, see HOOK-STANDARD §5) | Strongest model available, or Aaron | The ONE place taste re-enters the system |

## 5. Failure handling

- Can't find previous weeks in repo or Drive → STOP, tell Aaron. (This is
  AG-010's "missing source calendar" stop condition.)
- Metricool/Drive tools down → skip the optional parts of Step 1, note
  "performance/assets not checked" in the draft, continue. Never block
  the calendar on optional inputs.
- Can't write a passing hook for a slot after 3 attempts → use the
  fallback hook for that slot listed in `HOOK-STANDARD.md` §3 (each
  pattern bank ends with one evergreen fallback), and flag the row
  `FALLBACK USED` so Aaron looks at it first.
- It's Monday and no calendar exists → run this SOP immediately for the
  current week; a day late beats a missing week.
