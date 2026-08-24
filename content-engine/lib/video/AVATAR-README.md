# Avatar identity — what's locked, and an honest backend status

## The identity itself

See `avatar-identity.ts` (`JAYLEEFIT_AVATAR`) — the single source of
truth for the JayLeeFit on-screen persona, consolidated from three
sources that previously disagreed:

1. Job `JLF-20260629-001`'s three clip prompts, each of which had a
   **different** `Negative_Constraints` list — now merged into one
   master set (`MASTER_NEGATIVE_CONSTRAINTS`) applied to every
   generation, not just clip-specific subsets.
2. That job's reference-image manifest (`identity_lock_notes`),
   role-tagging 8 real photos (hero_identity/backup/texture/profile/
   motion ×2/full_body/wardrobe) of an actual person.
3. The "Social Media Automation Pipeline" governance doc's §6.5
   JayLeeFit continuity requirements and §10 human-approval gates.

All three live in Google Drive, outside this repo, and are the product
of a separate, more mature, already-executing system than anything in
`content-engine/` — see below.

**This is a real person's actual likeness** (photo references, not a
fictional character; `likenessApprovalStatus: "approved"` in the Drive
manifest). Treat identity-consistency rules here as a consent matter,
not just a branding one. Any proposed change to `JAYLEEFIT_AVATAR`'s
identity fields (face/hair/build/wardrobe) is a "major change to
JayLeeFit visual identity" — the governing doc requires human approval
for that; this repo should too. Don't edit those fields without that
approval recorded somewhere.

Two of the four `approvedEnvironments` (kitchen-sunrise, misty-hilltop)
are tagged `status: "extended"` — they come from later jobs that
referenced the identity only as `@jayleehustle.industries` rather than
by written description, and are included here on explicit approval, not
because their identity match to the original locked description has
been independently re-verified. Treat `"core"` environments (industrial
gym, rooftop-at-dusk) as the higher-confidence set if a real generation
ever needs to pick just one.

## Backend reality check — read before generating anything

- The live system's canonical generator is **Google Flow / Veo 3.1
  Frames-to-Video** — real jobs are already queued against it in the
  "JayLeeFit Agentic Video Control" Sheet, operated in part by a
  separate agent ("Codex"). **This Claude Code session cannot reach
  it.** No Google Flow, Vertex AI, or Veo MCP tool is connected here.
- `generate.ts`'s Kling 3.0 "primary path" choice predates discovery of
  that live Veo-based system. Relative to the real system, Kling here is
  now a **secondary/orphaned path** — kept because it's the only video
  backend this session can reach at all, not because it's the intended
  production backend. (Higgsfield's own `kling3_0` model is very likely
  the same underlying Kling engine, reached through Higgsfield's
  aggregation layer rather than a direct vendor connection.)
- **Higgsfield is the only real generation backend reachable from this
  session, full stop.** Checked directly this session, not assumed:
  - **Adobe for Creativity** — real, connected, but its video tools
    (`video_render`, `video_create_quick_cut`, etc.) composite/render an
    existing timeline; they don't generate a new person from text.
    Right tool for assembly, wrong tool for the avatar itself.
  - **HyperFrames by HeyGen** — connected, but its actual generation
    tools (`compose`, `render_video`) are disabled for this CLI client
    by the server's own design (it points CLI/IDE agents at a local
    skill install instead: `npx skills add heygen-com/hyperframes`).
    Only its read tools (`list_projects`, `get_project`, …) work here.
  - **Canva / Figma** — templated graphics/motion export
    (`export-design` type mp4, Figma `export_video`), not photorealistic
    generation. Good for surrounding marketing assets, not the avatar.
  - **ElevenLabs** — audio only (TTS, voice cloning, conversational
    agents). Zero video/image capability.
  - **No MCP connector exists** in this environment or in the org's
    connector registry (checked via `SearchMcpRegistry`) for Runway,
    Luma, Pika, a direct Kling API, or Synthesia — these aren't
    installed-but-unavailable, they're simply not offered as connectors
    here today.
  - Higgsfield has only been proven, elsewhere in this repo, for
    `recraft_v4_1` in utility mode on flat product photography
    (`storefront/lib/asset-pipeline/`) — an unrelated brand and use
    case. It is **unvalidated for photorealistic human-likeness
    consistency** against `JAYLEEFIT_AVATAR` (see `generator.rationale`
    in `avatar-identity.ts` for the specific model picked —
    `soul_cast`, Higgsfield's own recommended model for this).
- Any real generation run from this session must therefore be scoped as
  a **small, explicitly-labeled exploratory pilot** — one clip or
  still, cost-previewed with `get_cost:true` first, framed to whoever's
  watching as "does this backend hold this identity at all," never as a
  replacement for or a step in the real Google Flow/Veo pipeline. Do
  not write pilot results back to the live Drive/Sheets system as if
  they were real Veo-pipeline output.

### If Higgsfield genuinely isn't enough — 3 real alternatives worth knowing about

None of these are connectable as an MCP tool in this environment today
— they'd mean using the vendor directly (their own web app or a raw API
key wired into a script), not something reachable from this session.
Ranked by fit for "one locked identity, many marketing scenes":

1. **Google Flow / Veo 3.1** — not really an "alternative," this is
   what the live pipeline already picked, already has real reference
   photos and job history against it. The honest recommendation if
   anyone's setting up new infrastructure is to finish wiring *this*
   one, not add a fourth option. Needs: a GCP project with billing, the
   Vertex AI API enabled, allowlisted Veo 3.1 access, a service account,
   and a GCS bucket for reference images (see ARCHITECTURE.md §4).
2. **Runway (Gen-4 / Aleph)** — industry-strong specifically for
   holding one character's identity across different generated shots
   via its character-reference feature; real REST API. Would slot into
   `generate.ts` as a third `buildXRequest()` alongside Kling/Veo, same
   pattern, if a Runway API key ever gets provisioned.
3. **HeyGen or Synthesia (direct API, not the blocked HyperFrames MCP
   path)** — purpose-built "locked avatar + script → talking video"
   platforms, arguably a better fit than a general video model for
   straight-to-camera coaching content specifically (as opposed to the
   multi-environment cinematic montages `JAYLEEFIT_AVATAR` also
   supports). HeyGen is half-present already via HyperFrames; going
   direct to their avatar API (separate from HyperFrames' programmable-
   video product) bypasses the CLI-client restriction.

## Verification note

Every constraint that appeared in any of `JLF-20260629-001`'s three
per-clip `Negative_Constraints` lists, and every banned item in the
governance doc's §6.5, appears somewhere in
`avatar-identity.ts`'s `MASTER_NEGATIVE_CONSTRAINTS` — nothing was
dropped in the merge. Near-duplicate phrasings from different sources
(e.g. "no warped hands" / "no malformed hands") were kept as separate
entries rather than collapsed, since more phrasing coverage costs
nothing and may help a generation model actually avoid the failure mode.
