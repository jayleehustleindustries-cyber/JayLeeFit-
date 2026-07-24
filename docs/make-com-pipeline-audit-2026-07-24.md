# Make.com Reselling Pipeline — Audit (2026-07-24)

Scope: all 8 scenarios in org "My Organization" (id 8240998, **Free
plan**: 1,000 ops/month, 2 active scenarios max, 15-min minimum
interval), team "My Team" (2516712). Read via the Make MCP connector —
blueprints and execution stats inspected; nothing was modified.

## Headline

**Nothing is running.** All 8 scenarios are inactive (`isActive: false`).
The main pipeline has a 91% failure rate (52 errors in 57 runs) and is
flagged invalid by Make itself. The "working" copy has 0 errors only
because nothing but its trigger ever executed. The white-background
photos that ARE appearing in Drive (the `IMG_83xx-Photoroom.jpg` batch)
carry the Photoroom app's filename suffix — i.e. they're coming from the
Photoroom app/manual workflow, not from any Make scenario.

The concept is right. The wiring is broken in specific, fixable places.

## Scenario-by-scenario

### 1. "Google Drive to Google Sheets Image Analysis Pipeline" (5552918) — the flagship, broken
57 runs, 52 errors, 146 ops burned, `isinvalid: true`. Blueprint defects:

- **Corrupt file input:** Photoroom's `file_data` is mapped as
  `{{24.data}}{{24.id}}{{24.webViewLink}}` — binary image data with a
  file ID and a URL *concatenated onto it*. Downstream APIs get garbage;
  this alone explains most of the 52 errors.
- **Double background removal:** both Photoroom (`greenScreenDespill`)
  AND Remove.bg run in the same flow — paying two APIs for one job.
- **OpenAI module misconfigured:** `getModelResponse` is fed a
  `response_id` of `{{42}}{{42.file_name}}` (nonsense) instead of a
  prompt with image input.
- **Sheets writes are literal placeholders:** the "EHC Inventory Log V2"
  addRow writes the string `"Image Url Address"` into column P; the
  Vendoo-draft addRow writes literal `"title"`, `"description"`,
  `"price"` … instead of mapped AI output. That's why sheet rows show
  "Image Url Address" as text.
- **Airtable createRecord sends an empty record `{}`** and a Placeholder
  module dangles on the last route.

### 2–3. Two "(copy)" scenarios (5585751, 5585752)
Drafts/clones of #1: one adds Gemini + an AI agent + OCR (5 runs, 5
errors), one is never-run. They double your maintenance surface and
confuse which scenario is canonical. On a 2-active-scenario Free plan,
dead copies are pure liability.

### 4. "Integration Google Drive" (5552670)
A bare watch-folder trigger, never run. Harmless scaffold — delete.

### 5. "Integration Google Drive, Airtable, Remove.bg, Gemini" (5601418) — closest to viable, still mis-wired
10 runs, 0 errors — but 10 ops in 10 runs means *only the trigger
polled; no file ever flowed through*. Defects waiting to fire:

- `getAFile.file` is a concatenation of ~10 unrelated fields
  (`photoLink`+`permissionId`+`modifiedTime`+…+`id`) — invalid file ID
  the moment a file arrives.
- Remove.bg `image_data` is mapped to **`{{executionId}}`** — a run ID
  string where image bytes belong. Instant 400 on first real file.
- The Drive `uploadAFile` module (25) has **no configuration at all**.
- Router filter compares `{{25}}{{25.id}}` to `map("url"; 25.id)` — a
  condition that can never mean anything.
- The AI-agent module's system prompt is raw dictation ("/export agentic
  command to check very specifically…") and its `threadId` embeds binary
  image data.
- The Sheets addRow writes an **empty values object** — blank rows.
- Bright spot: the Gemini prompt (module 38) is genuinely well-formed —
  clean JSON schema, resale-safe rules, no invented flaws. Worth keeping
  — but it only receives the *file name*, never the image, so it's
  generating metadata from filenames.

### 6. "Integration Google Sheets, Gemini, Make AI Agent" (5607801)
3 clean runs. Watches sheet rows → Gemini → agent. Skeleton is fine;
does nothing durable yet (no write-back).

### 7–8. Manychat scenario + "New scenario"
Empty experiments. Delete.

## What's GOOD (keep these decisions)

1. **The architecture is the right shape:** Drive drop-folder → bg
   removal → AI metadata → inventory sheet + listing-draft queue is
   exactly the pipeline a one-person resale op should run.
2. **Gemini prompt quality** in 5601418 — honest, schema'd, resale-safe.
   Reuse it verbatim.
3. **The V2 sheet as hub** (photo-link columns, Vendoo queue status,
   processing notes) is genuinely good data design, and Codex's rows
   prove the human side of the loop works.
4. **15-min polling cadence** is right for the volume.
5. **Real throughput exists without Make** — the Photoroom-app batch of
   ~30 white-background photos shows the manual pipeline works, which is
   the thing worth automating.

## What's BAD (beyond the per-scenario bugs)

1. **One pipeline, five overlapping scenarios.** Nobody (human or agent)
   can tell which is canonical.
2. **Ops budget math doesn't work on Free.** 1,000 ops/month at 15-min
   polling = ~2,880 trigger polls/month for ONE scenario — the plan is
   exhausted by polling alone before any real work. This is why runs
   died mid-month.
3. **Every failure mode is silent.** No error-handler routes, no
   notification on failure — 52 straight errors and nothing told you.
4. **Mapping hygiene:** the recurring pattern is multi-field
   concatenations pasted into single-value inputs (file IDs, image
   buffers, thread IDs). That's the #1 root cause across both main
   scenarios.
5. **Two paid bg-removal vendors** configured simultaneously.

## How to make it BETTER (in order)

1. **Declare one canonical scenario and delete the other seven.**
   Rebuild from 5601418's skeleton (it has the best modules) as:
   `watchFilesInAFolder` (EHC Image Import Folder) → `getAFile`
   (map **only** `{{5.id}}`) → Remove.bg (`image_data` = **only**
   `{{9.data}}`) → `uploadAFile` (configured: EHC Generated Assets
   folder, filename = SKU) → Gemini (keep the good prompt, and pass the
   *image* via multimodal input, not just the name) → ONE Sheets addRow
   mapped field-by-field to V2 columns (P status, Q photo link).
2. **Fix the economics:** on Free, switch the trigger from 15-min
   polling to **on-demand + manual run after each photo session**, or an
   hourly window you actually shoot in. Alternatively the Core plan
   (10k ops) makes 15-min polling viable — but fix the mappings first;
   don't pay to fail faster.
3. **Add an error route:** one error-handler path → Gmail "pipeline
   failed on file X because Y". 52 silent failures should never happen
   again.
4. **Pick ONE background-removal vendor** (Remove.bg is already
   credentialed and cheaper at your volume; drop Photoroom from Make
   since the phone app covers ad-hoc needs).
5. **Write-back contract:** the scenario should fill exactly the V2
   columns Codex's workflow reads (`Photo Destination Status`, `White
   Photo Links`, `Vendoo Draft Queue Status`) — that makes Make, Codex,
   and the new MagicDeals storefront one loop: photo drop → processed →
   sheet row → live on the site within 5 minutes of sheet-share.
6. **Then, and only then, scale:** OCR-from-tag (the AI-extractor module
   in copy #2 was a good instinct) and Airtable mirroring are v2
   features. Get one file through the happy path first.

## Quick wins (do these this week, ~30 min total)

- Delete scenarios 5585751, 5585752, 5552670, 5592960, 5592996.
- In 5601418: fix the three one-field mappings (`file`, `image_data`,
  Sheets values), configure module 25, delete the broken router filter.
- Run once manually with a single test photo in the watch folder.
- Add the error-notification route.
- Share the V2 sheet link-view so the storefront reads live inventory.
