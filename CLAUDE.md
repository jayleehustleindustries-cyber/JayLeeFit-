# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

This is **not a software application repo** — there is no build system, package
manager, linter, or test suite (no `package.json`, no CI). It is the **operating
system for two businesses**, run through Claude Code + connected MCP tools:

1. **JayLeeFit** — online fitness coaching (client data, coaching workflows, and
   the marketing/content engine that drives client acquisition).
2. **Magicdeals Wholesale Outlet** — resale inventory (sourcing, listing,
   short-form clip marketing).

The repo holds three kinds of artifacts: **SOP/reference docs** (Markdown) that
define how agents and humans execute recurring work, **static HTML/JSON
"pages"** (in `site/`) that render dashboards or catalogs client-side from
adjacent JSON, and **subagent definitions** (`.claude/agents/`) that automate
parts of the marketing pipeline. The actual system of record for both
businesses is **Airtable**, accessed live via the Airtable MCP tools — most of
what's "true" at any moment lives there, not in this repo.

## Commands

There is nothing to build, lint, or test. To preview a `site/*.html` page
locally (they `fetch()` sibling JSON files, so `file://` won't work for data
loading), serve the directory over HTTP, e.g.:

```
python3 -m http.server 8000 --directory site
```

## The two-company separation rule (read before touching inventory data)

Every JayLeeFit change is unrelated to Magicdeals, and vice versa — **never
cross-write between them.** This is the single most important convention in
the repo (see `docs/two-company-inventory-workflows.md` and
`company-workflows.json`, the machine-readable version of the same rule):

| | Magicdeals Wholesale Outlet | JayLeeFit |
|---|---|---|
| Purpose | Resale inventory/listings | Fitness merch + content ops |
| Drive folder | id `1i0iepaWtxeM-AtND6O0o282b-KZcUtDC` | id `1e8BchK8r-N1Yp6hvPxWxoZlMIQi1CgVJ` |
| Airtable base | `appRxuE8F529tN7oY`, table `tblXhvLIzTxgyLCIb` | `appAec74Ux8EQrA27`, table `tblFyxQnKkOjeHdmk` |
| Catalog file | `site/magicdeals-inventory-catalog-data.json` | `site/jayleefit-inventory-catalog-data.json` |
| Instagram | `@magicdeals_wholesale_outlet` | `@j_lee_is_me` |

Before any image upload, database record, catalog update, generated visual,
caption, or publish action, determine which company the batch belongs to and
keep every asset/record/caption inside that company's location. Posts always
require explicit human approval immediately before publishing — never
auto-publish.

## Airtable: the single source of truth

The **JayLeeFit Client Hub** base (`appN8QFsoWJ1fJhxC`) is the coaching data
layer — every current and future surface (Telegram bot, client app, web) reads
and writes this same base rather than keeping a separate copy. Its five linked
tables (`Clients`, `Workouts`, `Nutrition Plans`, `Progress Tracking`,
`Check-ins`) all roll up to `Clients`. `airtable-schema.json` is the
machine-readable map of base/table/field IDs — **keep it in sync** whenever a
field is added/renamed in Airtable, since integrations (Telegram bot, n8n/Make
flows) are wired against those literal IDs, not field names.

The `Nutrition Plans` table has a live **macro engine**: you enter
Protein/Carbs/Fat in grams and formulas derive Total Calories
(`P*4 + C*4 + F*9`, Atwater factors) and P/F/C percentages — don't recompute
this elsewhere, treat Airtable's formula fields as authoritative.

A separate `System Architecture` table (in the same base) is a live registry
of every agent/tool/data-flow node in the marketing operation — check it
before assuming a piece of the pipeline described in `docs/` is actually wired
up versus still planned.

Resale inventory for Magicdeals lives in its own base/table (see the
separation table above); the JayLeeFit Client Hub base is coaching-only.

## Subagents (`.claude/agents/`)

Four subagents implement stages of the weekly marketing pipeline, each scoped
to a minimal tool allowlist matching its job:

```
analytics-agent → content-research-agent → media-brief-agent → qa-agent → (publish via Metricool)
```

- **analytics-agent**: pulls Metricool performance + best-time data and
  Airtable metrics, ranks what worked, writes next week's content plan.
- **content-research-agent**: turns a content plan into per-pillar shot
  briefs (hook, format, reference direction, CTA).
- **media-brief-agent**: turns a brief into actual 9:16 reference imagery via
  Higgsfield, respecting the plan's 4-concurrent-job cap.
- **qa-agent**: the gate before anything publishes — checks brand rules +
  virality/hook strength, returns PASS or REVISE. Nothing ships without
  clearing this agent.

Subagent files define *who does what*, not *when* — see
`.claude/agents/README.md` for how to run them on a cadence (CronCreate for a
weekly pass, or an external orchestrator like n8n/Make for the durable
production path). DM/comment engagement automation is explicitly **not** a
subagent job (it needs a tool with IG/TikTok messaging permissions, e.g.
ManyChat) — see `docs/engagement-dm-automation.md`.

## Brand DNA (applies to every generated asset, both businesses' content ops)

Defined in full in `docs/brand-dna-and-content-mechanics.md`; the rules the
qa-agent enforces:

- Avatar: backward cream cap, black tee, silver chain — locked wardrobe.
- Grade: cool desaturated steel/teal shadows with warm sunset accents.
- **Never bake AI-generated text into an image/clip** — it renders garbled;
  all on-screen text is added by hand in the editor (Descript/CapCut).
- Every asset carries exactly **one CTA**.
- 3-second hook, no runway — the payoff must be stated in frame 1 / the first
  3 seconds.
- Best posting window (from live Metricool data, re-verify before relying on
  it): Wed–Fri, 10:00 / 18:00 PT.

## Resale Clip Engine (`resale-clip-system/`)

A separate, stricter SOP for turning one Magicdeals resale item into one
published 9:16 clip. Read `resale-clip-system/SOP.md` first — it defines a
7-step pipeline with an explicit owner per step (`AUTO` / `MODEL` / `HUMAN`)
and is written to require **zero taste calls from the model**: hooks come
only from the Hook Bank in `checklists.md`, and a clip may publish only after
passing all 10 yes/no boxes in `VERIFICATION.md`. If asked to run or assist
this pipeline, follow those files literally rather than improvising — do not
invent hooks, skip verification boxes, or publish on "close enough."

## Docs directory map

`docs/` holds forward-looking build guides, not implemented code — treat each
as a spec/SOP to execute against connected tools, not as describing
already-built software:

- `agentic-operation-blueprint.md` — the full agent "constellation" and weekly
  orchestration loop (Analytics → Research → Media → Editing → QA → Publish →
  Data/Memory).
- `marketing-sop.md` — the weekly content SOP and asset-stack model (pillar →
  cut-downs → proof/authority/CTA).
- `telegram-bot-n8n-guide.md` — no-code wiring guide for a Telegram bot that
  writes client weight/check-ins straight into the Airtable base above.
- `software-design-extension-app.md` — design principle ("extension, not
  replacement") and phased build plan (Airtable Interfaces → PWA → native) for
  the eventual client app.
- `research-smart-fitness-integrations.md` — wearable-sync research (buy an
  aggregator like Terra/Vital vs. build direct device integrations).
- `ai-studio-cinematic-pipeline.md` — run-it-yourself Google AI Studio
  workflow for generating original cinematic stills/video (no AI Studio
  connector exists in-agent).
- `two-company-inventory-workflows.md` — the separation rule described above.

## Working conventions

- Never commit API keys/tokens (Airtable PAT, bot tokens, etc.) — the docs
  repeatedly emphasize these live only in the relevant tool's own credential
  store (n8n/Make/Airtable), never in a message or this repo.
- Report only real numbers pulled from Metricool/Airtable for anything
  analytics-related; never invent metrics, and say so and stop if a data
  source is unavailable rather than guessing.
- Track funnel/intent metrics (clicks, DMs, intake completions), not vanity
  metrics (likes/followers) — this is a stated principle across the
  analytics-agent and marketing SOP.
