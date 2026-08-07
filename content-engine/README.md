# Content Engine — jay_legacy_fit / Everyday Hustle Co.

**This is its own project. It is not EHC (resale) and not the JayLeeFit
Airtable coaching data layer** — those live at the repo root and in
`storefront/`. This directory exists specifically so a social-media content
pipeline never gets mixed into either of those, per explicit instruction.

- **Brand it serves:** `jay_legacy_fit` / "Everyday Hustle Co." — the
  personal-brand social presence (Instagram `@j_lee_is_me`, TikTok
  `@jay_legacy_fit`, YouTube), confirmed live in Metricool.
- **What this is:** an architecture design for a multi-role content pipeline
  (idea → script → visuals/VO → edit → publish → 24h/72h/1wk performance
  review → retro → next idea), translating a "CEO agent / orchestrator /
  crew" org-chart concept into real, buildable primitives.
- **Status:** design only. See `ARCHITECTURE.md`. Nothing is built/running
  yet — no Airtable base created, no schedules armed, no generation wired.
  That's intentional: the design was requested first, build comes after
  it's reviewed.

Read `ARCHITECTURE.md` for everything else.

## `assets/`

Not part of the (still design-only) content pipeline above — this holds
finished deliverables for the brand. Currently: `jayleefit-program-builder-pack.docx`,
the free lead-magnet sent by the Instagram-comment → landing-page →
email automation (see `storefront/app/program-pack/` and the Make.com
scenarios built for it). A copy-paste AI system prompt that turns any LLM
into a program-building interview, adapted from an existing "Everyday
Hustle" AI context pack found in the account's Google Drive.
