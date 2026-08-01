# Video generation — Kling 3.0 (primary path)

Stage 1 of the content-engine video pipeline: turns a content idea into a
finished, portable generation prompt. Same pure-logic/network-call split as
`storefront/lib/asset-pipeline/` — nothing here spends credits until an
agent explicitly calls the generation tool with the built request.

## What's built (free, no credits spent)

- `types.ts` — `HookFormat` (a reusable proven structure), `VideoPromptJob`
  (Stage 1 output), `VideoAssetJob` (adds the fields a real run needs to
  track: job id, result URL, cost, status).
- `hook-formats.ts` — four seed formats: three delivered directly in this
  project's design conversation (mistake-fix, cold-open confrontation,
  myth-vs-science), plus a fourth — **consistent-character multi-scene
  montage** — reverse-engineered from a real reference clip the user
  provided. That clip showed the same on-screen persona (backwards cap,
  chain necklace, "Everyday Hustle Co." shirt) holding across a gym, a
  rooftop skyline at dusk, and back to the gym, in front of the same
  "DISCIPLINE FOCUS CONSISTENCY SUCCESS" wall graphic that also appears in
  a real photo already in this account's Drive. The takeaway: identity
  consistency across scenes is a real requirement here, not a nice-to-have
  — flag this when picking a generation backend/model, since not every
  model holds a character consistently across cuts.
- `prompt-builder.ts` — merges a specific idea with a hook format's proven
  structure into one finished prompt.
- `demo-queue.ts` — run with `npx tsx lib/video/demo-queue.ts` (or
  `npm run demo:video`) — prints all four seed prompts against sample
  ideas, zero network calls.
- `generate.ts` — `buildKlingRequest()`, a pure function producing the
  exact `{ model, params }` shape to hand to Higgsfield's `generate_video`
  MCP tool. Doesn't call it — there's no API key wired into this codebase
  for that; only an agent conversation can reach it.

## What's not built yet

- **Cost has not been confirmed.** `generate_video` with `get_cost:true`
  for `kling3_0` returned a persistent "requires approval" error this
  session (four attempts, unlike the transient version of this error seen
  elsewhere) — unresolved as of this writing. **Do not run a real
  generation call until this is confirmed and a real cost number is known**
  — the Higgsfield balance was at 9.9 credits as of this session.
- No real pilot clip has been generated yet (blocked on the above).
- No Airtable `Content Queue`/`Assets` tables exist yet (see
  `content-engine/ARCHITECTURE.md` §2) — ideas here are hardcoded samples
  in `demo-queue.ts`, not read from a real queue.
- The Vertex AI / Veo 3.1 path is designed (see `ARCHITECTURE.md`'s
  appendix) but deliberately deprioritized behind this Kling 3.0 path per
  the user's explicit choice.

## Next step

Once the `generate_video`/`get_cost` tool access issue resolves: preview
cost for `kling3_0` at a representative duration, confirm it's affordable
against the current balance, then run exactly one real pilot clip using
`buildKlingRequest()`'s output for the `consistent-character-montage`
format (the one closest to what the reference clip demonstrated) before
this becomes load-bearing in the bigger pipeline.
