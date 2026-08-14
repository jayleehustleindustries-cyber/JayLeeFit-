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
  production backend.
- **Higgsfield is the only real generation backend reachable from this
  session** (`generate_image`, `generate_video`, real credits). It has
  only been proven, elsewhere in this repo, for `recraft_v4_1` in
  utility mode on flat product photography
  (`storefront/lib/asset-pipeline/`) — an unrelated brand and use case.
  It is **unvalidated for photorealistic human-likeness consistency**
  against `JAYLEEFIT_AVATAR`.
- Any real generation run from this session must therefore be scoped as
  a **small, explicitly-labeled exploratory pilot** — one clip or
  still, cost-previewed with `get_cost:true` first, framed to whoever's
  watching as "does this backend hold this identity at all," never as a
  replacement for or a step in the real Google Flow/Veo pipeline. Do
  not write pilot results back to the live Drive/Sheets system as if
  they were real Veo-pipeline output.

## Verification note

Every constraint that appeared in any of `JLF-20260629-001`'s three
per-clip `Negative_Constraints` lists, and every banned item in the
governance doc's §6.5, appears somewhere in
`avatar-identity.ts`'s `MASTER_NEGATIVE_CONSTRAINTS` — nothing was
dropped in the merge. Near-duplicate phrasings from different sources
(e.g. "no warped hands" / "no malformed hands") were kept as separate
entries rather than collapsed, since more phrasing coverage costs
nothing and may help a generation model actually avoid the failure mode.
