# Video generation — free API backends + Kling 3.0 (via MCP)

## Runnable backends (`backends/` + `cli.ts`) — NEW

This module can now generate real videos itself over plain HTTP — no MCP
required — via `npm run generate:video`. Three backends behind one
interface, cheapest-first (see `.env.example` at the content-engine root
for keys):

| Backend | Free? | Key |
|---|---|---|
| `pollinations` (default) | Keyless free tier for free models; premium video models (ltx-2, wan, seedance, veo) bill Pollen credits against an optional key | optional `POLLINATIONS_API_KEY` |
| `magichour` | **400 free credits on signup + 100/day claimable** in the web app — the sustainable free API path | `MAGIC_HOUR_API_KEY` |
| `luma` | **No free API tier — paid per generation.** Wired by explicit request as the quality fallback (Ray models) | `LUMAAI_API_KEY` |

Runway was evaluated as another fallback and skipped for now: its API is
image-to-video-centric (`gen4_turbo` requires a `promptImage`) and has no
recurring free tier, only one-time trial credits.

```
# preview the exact HTTP call, zero network, zero cost:
npm run generate:video -- --format consistent-character-montage \
  --idea "Gym-to-rooftop brand reel" --backend magichour --dry-run

# real run (writes out/<ts>.mp4 + appends out/video-ledger.jsonl):
npm run generate:video -- --prompt "..." --duration 8 --aspect 9:16
```

`--dry-run` is the same "preview before spending" rule this repo applies
to Higgsfield credits. Every real run appends a ledger line
(`out/video-ledger.jsonl`) — the `VideoAssetJob` row, until the Airtable
Assets table exists.

**Verified vs not:** the CLI, prompt plumbing, and dry-run output are
tested locally. The live HTTP calls could **not** be exercised from the
cloud session that wrote this (its network policy blocks non-allowlisted
domains — `gen.pollinations.ai` etc. get a proxy 403); endpoint shapes
were taken from each provider's official docs/SDKs. First real run should
be one cheap clip per backend to confirm.

## Clips → edit pipeline

The intended production flow for multi-clip videos (e.g. the EHC reselling
asset): generate each scene as its own short clip via `generate:video`
(or Higgsfield MCP), then assemble/edit in **Descript** — its MCP
connector (already connected to this account) can `import_media` from
URLs or upload, and `prompt_project_agent` handles trimming, arranging,
captions. So: this module produces the clips + ledger; Descript is the
edit bay.

**The EHC reselling video is fully storyboarded** — see
`reselling-storyboard.ts` (+ `npm run demo:storyboard`). Four user-provided
brand frames (committed at `../../assets/reselling-story/`, 768x1344 9:16,
reverse-engineered from a competitor's video and re-cloned with this
brand's visuals) double as image-to-video start frames: dashboard →
pack station → label → shipping-label stack, 5s each, with per-clip motion
prompts and ready-to-hand Higgsfield request shapes. The matching
text-to-video fallback is the `reseller-operator-montage` hook format.
Cost reality at last check: one 5s `kling3_0_turbo` clip = 7.5 Higgsfield
credits vs a 9.9 balance, so the four-clip run needs Magic Hour's free
daily credits (or a Higgsfield top-up) to complete.

**Magic Hour was chosen as the production backend.** The whole clip run
is one command once `MAGIC_HOUR_API_KEY` exists:

```
npm run produce:reselling -- --dry-run   # full plan, zero network
npm run produce:reselling                # all four clips → out/reselling/
npm run produce:reselling -- --clip dashboard   # one clip only
```

Each clip runs image-to-video (frame uploaded via /v1/files/upload-urls,
then /v1/image-to-video — the video inherits the frame's 9:16), saves to
`out/reselling/clip-N-<id>.mp4`, appends `out/reselling/ledger.jsonl`,
and the run stops at the first failure so credits don't drain on a
misconfiguration. `generate:video` also gained `--start-image <path>` for
one-off image-to-video runs (magichour backend only — pollinations/luma
would need an already-hosted image URL).

---

# Original Stage-1 design — Kling 3.0 (via Higgsfield MCP)

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
  for that; only an agent conversation can reach it. Also
  `buildVeoRequest()`, the same idea for Veo 3.1 — backend-agnostic on
  purpose, since which real service accepts this shape is still
  unconfirmed (see below).

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
- The Vertex AI / Veo 3.1 path is designed (see `ARCHITECTURE.md` §4) but
  deliberately deprioritized behind this Kling 3.0 path per the user's
  explicit choice. A claimed alternate route — calling Veo 3.1 through a
  Vercel-hosted model/extension — came up in conversation but is **not
  verified**: no documented Vercel capability for this has been confirmed,
  and the Vercel MCP connector was disconnected when this was raised.
  `buildVeoRequest()` exists so the prompt-design work isn't blocked on
  resolving that, but don't wire it to a real network call — via Vertex
  or otherwise — until a real, confirmed path exists.

## Next step

Once the `generate_video`/`get_cost` tool access issue resolves: preview
cost for `kling3_0` at a representative duration, confirm it's affordable
against the current balance, then run exactly one real pilot clip using
`buildKlingRequest()`'s output for the `consistent-character-montage`
format (the one closest to what the reference clip demonstrated) before
this becomes load-bearing in the bigger pipeline.
