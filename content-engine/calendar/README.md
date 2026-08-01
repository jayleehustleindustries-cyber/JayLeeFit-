# EHC Content Calendar — the system

This folder IS the "EHC Calendar Creation" system (AG-010 "EHC Content
Calendar Agent" in the Agentic Company Structures Datasheet). It exists so
the weekly Everyday Hustle Co. content calendar can be produced by **any**
model — or by hand — without a frontier model improvising the brand voice.

**Lane check (from repo CLAUDE.md):** this is the EHC *content* lane
(jay_legacy_fit / Everyday Hustle Co. social brand). It is NOT the resale
inventory lane (Poshmark/eBay/storefront) and NOT the JayLeeFit coaching
data layer. The calendar covers fitness/brand-voice content only; resale
promo is deliberately out of scope (owner decision, 2026-07-04 — change it
by editing `SOP.md` §1).

## What the system produces

One calendar per week: 7 rows (Mon–Sun), each with Day, Type, Persona,
Hook, Platform, Asset Need, Caption Angle, CTA. Canonical format in
`TEMPLATE.md`. Real gold-standard example: `weeks/week-001.md`.

## Where it lives downstream

- Each approved week is archived as `weeks/week-NNN.md` in this repo AND
  published to Google Drive as a Doc titled `Content schedule for this
  week NNN` (My Drive root) — that Doc is what the daily ops schedule's
  8:00 AM "Media production planning" block and Codex read.
- Hooks feed the 3-agent video pipeline defined in the Drive doc
  "Everyday Hustle Co Media Fitness Content Agent Instructions"
  (Strategist → Asset/Edit → Publisher via Metricool → 48h review).
- Channels: Instagram `@j_lee_is_me`, TikTok `@jay_legacy_fit`, YouTube
  (Metricool brand `jay_legacy_fit`).

## The files

| File | What it is | Who reads it |
|---|---|---|
| `SOP.md` | The run-it instructions: trigger, steps, model routing, approval gate | The model/person running the weekly loop — load this FIRST |
| `HOOK-STANDARD.md` | Brand voice as hard rules + pattern banks + banned list | Loaded during drafting AND verification |
| `TEMPLATE.md` | Exact output format, copy-paste ready | Drafting step |
| `EXAMPLES.md` | Annotated gold output + known failure modes | Drafting step; read before writing any hook |
| `weeks/` | One file per approved week (archive + audit trail) | Everyone; last 2 weeks are a required drafting input |

## Why this is built this way

The old process was one example Doc plus taste in a frontier model's head.
After 2026-07-07 the runner is a cheaper model, so: taste is encoded as
pass/fail checks (word caps, required structures, banned phrases, claims
bank), the weekly rotation is fixed, and verification is dumb-model-simple
— count words, match patterns, grep for banned strings. "Use good
judgment" appears nowhere in these files on purpose.
