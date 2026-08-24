# Asset pipeline — batch reference images & video, Old Light brand

Turns the product catalog into a queue of on-brand image-generation prompts,
one per shot angle per item, and defines the ledger shape for tracking what's
been generated. This is Stage 1 of a larger pipeline; later stages are real
but require spending image/video-generation credits, so they're run
deliberately rather than wired up to fire automatically — see "What's next"
below.

## What's built (free, no credits spent)

- `shot-angles.ts` — four shot presets per item: Flat Lay, Detail Macro,
  Ghost Mannequin, Styled Editorial. Covers what a resale listing actually
  needs (what it is, what it's made of, any flaws, how it looks styled).
- `prompt-builder.ts` — turns one `Product` + one `ShotAngle` into a full
  image-generation prompt, in the Old Light brand look (void background,
  gold rim light, starfield bokeh), with the styling note driven by the same
  condition score that already powers the moon-phase grading on the site —
  a mint item gets "styled precisely and symmetrically," a well-worn one
  gets "styled to look lived-in and storied."
- `build-queue.ts` — expands the whole in-stock catalog x every shot angle
  into a flat job list.
- `types.ts` — `PromptJob` (Stage 1 output) and `AssetJob` (adds the fields
  a real generation run needs to track: job id, result URL, status).

Run it (no network calls, no cost):

```bash
npx tsx lib/asset-pipeline/demo-queue.ts
```

## What's next (spends real credits — do deliberately, not automatically)

1. **Stage 2 — batch image generation.** Feed each `PromptJob` to an
   image-generation model. `recraft_v4_1` (utility mode) is the model this
   queue defaults to — it's built for clean, consistent product shots
   rather than expressive/stylized art, which matters for holding one look
   across a whole catalog. Preview cost per image before running a full
   batch.
2. **Stage 3 — the ledger.** Results (image URL, job id, status) get
   recorded somewhere resumable. Since this shop's inventory already lives
   in a Google Sheet, the natural move is a second tab in that same sheet
   rather than a new database — one row per `AssetJob`. Not built yet.
3. **Stage 4 — video.** Once a product has generated stills, those feed
   into a marketing-video generation step (a Higgsfield Marketing Studio
   product video, or similar) to produce a short ad per item or a themed
   reel across several. Not built yet.
4. **Stage 5 — scheduling.** A recurring job that finds catalog items
   without generated assets yet and runs Stages 2-4 for them unattended.

### Important limitation on "autonomous"

Stages 2 and 4 call paid, third-party generation tools that are only
reachable from inside an agent conversation right now (there's no API key
wired into this codebase for them) — the storefront's own server code
can't call them directly. The realistic version of "fully autonomous" here
is a **scheduled routine that wakes an agent up** to run the pipeline steps
on a cadence, not backend code with no human/agent in the loop. That's a
real, buildable pattern, but it means every scheduled run spends credits
unattended — worth confirming budget/cadence before turning it on, not
after.
