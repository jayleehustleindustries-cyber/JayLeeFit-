# Content Engine — Architecture

Design only, nothing built yet. This translates the requested org-chart
("CEO agent → orchestrator → chief of crew → crew → analytics/review →
retro") into things that actually exist and can actually run, and flags
every point where the real vision needs something not available today.

## 0. The honest version of "autonomous"

There is no standing swarm of separate, always-on agents. What actually
exists:

- **One model (me), invoked at different times, playing different roles**
  by following a role-specific brief. "The orchestrator" and "the script
  writer" aren't different programs — they're the same model reading a
  different prompt at a different moment.
- **Scheduled Routines** (durable triggers) that wake a session at a set
  cadence and hand it a prompt. This is the real mechanism behind "checks
  performance at 24h/72h/1wk" and "runs the weekly retro" — not a
  background process that runs with no session behind it.
- **Subagents** (the Agent tool) for doing several roles' worth of work in
  parallel within one turn — e.g. script drafting and reference-image
  prompting happening side by side instead of sequentially.
- **Airtable as the shared memory** between all of the above — since
  nothing persists in a model's head between invocations, the task queue,
  asset log, and performance data all have to live somewhere real. That's
  what makes this "one pipeline" instead of a string of disconnected
  one-off requests.

Every "agent" below is one of these three things. None of them make
decisions with real money or brand risk unsupervised — see §6.

## 1. Org chart → real primitives

| Requested role | What it actually is |
|---|---|
| **CEO agent** ("makes the big shots") | Not automated. This is you. The pipeline surfaces a recommendation (next asset idea, what to try next) at the end of each retro cycle; nothing gets produced or spent against until you greenlight it. See §6 — this is a deliberate choice, not a limitation I'm working around. |
| **Master Orchestrating Agent** | A Claude turn (fired by a Routine on a set cadence, e.g. daily) that reads `Content Queue` in Airtable, decides what's ready to move to the next stage, and either does the work directly or dispatches pieces to subagents. |
| **Chief of Crew** | The same orchestrator turn, one level down — when a queue item needs multiple crew roles, it uses the Agent tool to run them (in parallel where they don't depend on each other), and reconciles the results into one Airtable row update. Not a separate persistent role. |
| **Crew: Script/Writer** | A generation step grounded in the brand-voice pillars (§3) — writes hook, script, caption from a `Content Queue` idea row. |
| **Crew: Reference-Image-Gen** | Higgsfield `generate_image` (`recraft_v4_1`, utility mode) — already proven this session at ~1.25 credits/image. Same shot-angle-prompt pattern already built for EHC in `storefront/lib/asset-pipeline/`, retargeted to content stills instead of product photos. |
| **Crew: Prompting/VO** | Higgsfield `generate_audio` for voiceover, driven by the script from the writer step. Not yet tested this session — needs a pilot the same way the image step got one. |
| **Crew: Clip/Editing** | **Descript** (already connected: `import_media`, `prompt_project_agent`). Real capability, not hypothetical — it can trim, caption, and assemble from natural-language instructions today. |
| **Crew: Video generation** | **Open item, not yet connected — see §4.** You asked for this to route through Veo 3.1 via Google Vertex AI rather than Higgsfield's video models. That's a real, sensible choice (Veo is a strong model) but it needs its own setup before it can be part of an automated loop. |
| **QA Agent** | A Claude turn that reviews the assembled piece (script + visuals + edit) against the four brand pillars (§3) and basic technical quality — before a queue item is eligible to move to `Scheduled`. Named explicitly in the workflow diagram; added here to keep the doc and diagram in sync. |
| **Analytics agents** | Metricool (`getAnalyticsDataByMetrics`) — **confirmed live**, real brand `jay_legacy_fit` connected across Instagram/TikTok/YouTube. Polled at 24h/72h/1wk after a post goes live, via three scheduled Routines per published asset. |
| **Reviewing agents / "the meeting"** | A retro turn (fired by a Routine once the 1-week window closes) that reads the Performance rows for everything published that week, writes a synthesis to `AgentLog`, and proposes 1-3 next `Content Queue` ideas — flagged `Needs CEO Review`, not auto-launched. |

### 1a. Full operational briefs (so no role runs on inference)

The table above says *what* each role is. This says what each one must
actually read, decide, write, and never do — written so a less capable
model can execute a role correctly by following the brief, not by
guessing what a smarter model would have done. The authority model does
**not** change here — every brief below still terminates at §6's gates
(no autonomous spend, no autonomous publish). What changes is that the
orchestrator tier gets a complete map of the crew's inputs/outputs
instead of just its own slice, so it can dispatch and reconcile correctly.

**Master Orchestrating Agent**
- Reads: every `Content Queue` row (all statuses), not just ones already
  in progress — it's the only role that sees the whole board each run.
- Decides: for each row, whether its current `Status` can advance, using
  the fixed state machine `Idea → Scripting → Assets In Progress →
  QA Review → Scheduled → Published → Reviewed`. Never skips a state.
- Acts: either performs the next step itself (e.g. the writer step is
  just a Claude turn) or dispatches to Chief of Crew when a row needs
  more than one crew role.
- Writes: `Status` field updates, links new `Assets` rows to the
  `Content Queue` row they belong to.
- Never: spends Higgsfield/other credits, calls `createScheduledPost`,
  or moves anything to `Scheduled` without a human approval already
  recorded — see §6.

**Chief of Crew** (same turn, one level down — not a separate process)
- Needs the input/output contract for every crew role below so it can
  fan out correctly and reconcile one coherent update instead of
  partial, conflicting writes:

  | Crew role | Needs as input | Produces as output |
  |---|---|---|
  | Script/Writer | Idea text, Pillar | Hook, script, caption (writes to `Content Queue.Script`) |
  | Reference-Image-Gen | Script/idea, shot-angle preset | Image URL(s) → new `Assets` row, `Type=Reference Image` |
  | Prompting/VO | Finished script | Audio URL → new `Assets` row, `Type=VO Audio` |
  | Video Generation | Script + hook format (see `lib/video/`) | Video job/URL → new `Assets` row, `Type=Video Clip` |
  | Clip/Editing | All prior Assets for the row | Final cut URL → new `Assets` row, `Type=Final Edit` |

- Runs independent crew roles (e.g. images and VO) in parallel via the
  Agent tool; only serializes steps that genuinely depend on each other
  (editing needs the other assets to exist first).
- Reconciles: one `Content Queue` row update per cycle, not one write
  per crew role — avoids half-applied states if a crew step fails.

**Batch dispatch, concretely** — this is the actual mechanism behind
"spinning up batches of agents": Chief of Crew groups the crew-role
table above into numbered batches by dependency, not by role count or
any arbitrary limit.
1. **Batch 1** — every crew role whose "Needs as input" column is
   satisfied by the `Content Queue` row alone: Script/Writer,
   Reference-Image-Gen, Prompting/VO. These have no dependency on each
   other, so they're dispatched as one Agent tool call each, all in the
   *same* message — true parallelism, not a loop of sequential calls.
2. **Batch 2** — every role whose input is another role's output:
   Video Generation (needs the finished script) and Clip/Editing (needs
   every other `Assets` row for this item). These wait for Batch 1 to
   return, then dispatch together the same way.
3. The batch numbers are the orchestrator's own reasoning scratch space
   for sequencing — they are **not** a field anywhere in Airtable. The
   real dependency graph already lives in the input/output contract
   table above; a batch number is just "how many of these can start
   right now," recomputed each cycle, not a fixed schedule.
4. A batch never spans multiple `Content Queue` rows unless those rows
   are independently at the same stage — one call per crew role *per
   row*, so a QA failure or crew error on one idea never blocks another
   idea's batch.

**QA Agent**
- Reads: the assembled row's Script, and every linked `Assets` row.
- Checklist (pass/fail, not vibes): (1) script explicitly reflects one
  of the four pillars in §3, not generic fitness-influencer copy; (2)
  hook lands in the first line/first 2 seconds of the script; (3) every
  `Assets` row for this item has `Status=Approved`, not `Rejected` or
  still `Generated`; (4) no placeholder/lorem text anywhere in Script.
- Writes: advances `Status` to `Scheduled` only if all four pass;
  otherwise sends it back to `Assets In Progress` with the specific
  failing item noted in `Notes`.
- Never: approves on partial completion — a missing crew asset is a
  QA failure, not a warning.

**Analytical Agent**
- Fires per published item at 24h/72h/1wk (three separate Routines),
  calling `getAnalyticsDataByMetrics` with the field IDs already listed
  in §5. Writes one `Performance` row per window per platform.
- Never infers metrics it can't fetch — an unavailable metric is a
  blank cell, not a guess.

**Reviewing Agent / "the meeting" (retro)**
- Fires once a `Content Queue` item's 1wk `Performance` window closes.
- Reads: every `Performance` row for everything published that week.
- Writes: one `AgentLog` row — `Summary` synthesizes what worked/didn't
  (cite the actual numbers, don't editorialize without them), and
  `Proposed Next Ideas` links 1-3 new `Content Queue` rows created with
  `Origin=Retro Suggestion`, `Status=Idea`.
- Never: checks its own `Reviewed By CEO` box — that field only gets
  set by you. A proposed idea with that box unchecked is inert; nothing
  downstream acts on it.

**CEO tier (you)**
- The only thing every other brief above ultimately defers to. In
  practice this means: approving/rejecting `AgentLog` proposals,
  authorizing any step that spends credits or calls a real
  publish/schedule tool, and being the tiebreaker when QA sends
  something back more than once. Nothing above is designed to route
  around this — if a future session ever proposes skipping it, that's
  a bug against this doc, not a feature.

## 2. Master data — Airtable (backend) + Sheets (view)

Per your call: Airtable is the thing agents actually read/write (I have
full read/write access there today, unlike Sheets, where I can only read).
A read-only Sheets view can mirror it later for a familiar spreadsheet look
— that's a thin export step, not the source of truth, and isn't built yet.

**New, separate Airtable base** (not reusing the JayLeeFit Client Hub base)
— proposed name: **"Everyday Hustle Content Engine"**, in the same
workspace (`My First Workspace` / `wspHcQC3zsHRt6uRg`, the only workspace
on this account). Kept as its own base specifically so this never shares
tables with the coaching data or gets touched by that system.

Proposed tables:

### `Content Queue`
One row per content idea, from conception to published.
| Field | Type | Notes |
|---|---|---|
| Idea | single line text | primary field |
| Pillar | single select | Fitness/Training, Motivation/Mindset, Personal Brand/Hustle, Evidence-Based Performance (see §3) |
| Status | single select | Idea → Scripting → Assets In Progress → QA Review → Scheduled → Published → Reviewed |
| Script | long text | writer output |
| Platform(s) | multiple select | Instagram, TikTok, YouTube |
| Scheduled Date | date | |
| Metricool Post URL | url | filled once published, links to §5 |
| Origin | single select | New, Retro Suggestion — where the idea came from |
| Notes | long text | |

### `Assets`
One row per generated file, linked to a `Content Queue` row.
| Field | Type | Notes |
|---|---|---|
| Name | single line text | primary field |
| Queue Item | link to `Content Queue` | |
| Type | single select | Reference Image, VO Audio, Video Clip, Final Edit |
| Source | single select | Higgsfield, Vertex/Veo, Descript |
| URL | url | |
| Cost (credits) | number | tracked so spend is auditable, ties into §6 |
| Status | single select | Generated, Approved, Rejected |

### `Performance`
One row per (queue item × review window).
| Field | Type | Notes |
|---|---|---|
| Name | single line text | primary field, e.g. "Queue Item — 24h" |
| Queue Item | link to `Content Queue` | |
| Window | single select | 24h, 72h, 1wk |
| Platform | single select | Instagram, TikTok, YouTube |
| Views/Reach | number | Metricool `IGPO14`/`IGPO28`, `TKPO07`/`TKPO11` |
| Likes | number | `IGPO13`, `TKPO08` |
| Comments | number | `IGPO08`, `TKPO09` |
| Shares/Saves | number | `IGPO15`/`IGPO27`, `TKPO10` |
| Engagement Rate | number | `IGPO10`, `TKPO9999` |
| Avg Watch Time | number | TikTok only: `TKPO15` |
| Pulled At | date time | |

### `AgentLog`
The "meeting notes" — one row per retro cycle.
| Field | Type | Notes |
|---|---|---|
| Name | single line text | primary field, e.g. "Week of Jul 6" |
| Summary | long text | what worked / what didn't, synthesized from `Performance` |
| Proposed Next Ideas | link to `Content Queue` | rows created with Origin = Retro Suggestion |
| Reviewed By CEO | checkbox | gate before any proposed idea moves past Idea status |

**Next step if you want this built:** confirm the base name and I'll create
it via `create_base`/`create_table` — that part's low-risk and reversible
(an empty Airtable base), so it can happen as soon as you say go, separate
from the bigger open items below.

## 3. Content pillars (brand voice, from your answer)

Four pillars, seeded now so the writer step has something concrete to
ground scripts in instead of generic fitness-influencer copy:

1. **Fitness/Training** — the gym-floor content (workouts, form, splits).
2. **Motivation/Mindset** — discipline/focus/consistency messaging (matches
   the "DISCIPLINE FOCUS CONSISTENCY SUCCESS" gym wall graphic already in
   the reference photos).
3. **Personal Brand/Hustle** — "Everyday Hustle Co." positioning, broader
   than fitness — entrepreneurship/hustle framing.
4. **Evidence-Based Performance** — my read of "AI backed data driven
   science backed integrations that ROI your time and value" is: content
   that positions advice as scientifically grounded and quantifies the
   payoff on time/effort invested, as a differentiator from generic
   bro-science fitness content. **Flag: confirm this reading is right** —
   it's a paraphrase of a fragment, not a direct quote.

## 4. Open item: Veo 3.1 via Vertex AI (not connected)

You asked for video generation to route through Google's Veo 3.1 via
Vertex AI / an agentic Google workflow, rather than Higgsfield's video
models, and mentioned "nbp" as part of that flow — **I don't know what
that refers to** (possibly a specific tool name that got garbled in
dictation — n8n? NotebookLM? something else?). Flagging rather than
guessing.

What connecting Vertex/Veo for real would need, none of which I have
today:
- A Google Cloud **project** with billing enabled.
- The **Vertex AI API** enabled on that project.
- **Veo 3.1 access** specifically (model access is gated/allowlisted on
  Vertex, separate from general Vertex access).
- A **service account key** (or workload identity) so calls can be made
  from a script/session rather than your personal login.
- A place to stage **reference images** for Veo prompts — Vertex's video
  models take reference/first-frame images via a **Google Cloud Storage
  bucket URI**, not an arbitrary URL, so "figuring out a location" is
  right: a small GCS bucket is the actual answer.

Until that's set up, the design keeps Higgsfield in the video-adjacent
slots it's already proven for (stills via `generate_image`, VO via
`generate_audio` once piloted) and leaves **Video Clip** in the `Assets`
table pointing at whichever backend is actually connected when the time
comes — Vertex/Veo if you set it up, Higgsfield `generate_video` as a
fallback if you'd rather not stand up GCP for this.

## 5. Analytics loop (Metricool — confirmed live)

Real brand, real data, right now:

```
Brand: jay_legacy_fit (id 6394851)
Instagram: j_lee_is_me · TikTok: jay_legacy_fit · YouTube: UCsgtODjIaB-lsxpC6b8Dsfg
Timezone: America/Los_Angeles
```

Per published post, three Routines fire (24h, 72h, 1wk after
`Scheduled Date`), each calling `getAnalyticsDataByMetrics` for that
platform and writing one `Performance` row. Field IDs above are real,
pulled from Metricool's own metric catalog this session — not invented.

`createScheduledPost` (also confirmed available) means the pipeline could
eventually publish directly instead of you scheduling by hand — not
wired up yet, deliberately: that's a "posts to your real accounts"
action, worth its own explicit go-ahead rather than bundling it into this
design pass.

## 6. Spend and approval gates

Given the current Higgsfield balance (9.9 credits after this session's
pilot) and that video generation isn't even connected yet:

- **Every paid generation step pauses for a go-ahead** until you say
  otherwise — no autonomous spend by default.
- Cost is tracked per-asset in the `Assets` table (`Cost (credits)`) so
  spend is auditable from day one, not bolted on later.
- The **CEO tier never auto-executes** — the retro step proposes next
  ideas, it doesn't queue them for production unmoderated. This mirrors
  the same principle used elsewhere in this session (never spend real
  money or touch real accounts without a live go-ahead).

## 7. What's actually next

In order of "cheapest/safest first":

1. Confirm the content-pillar reading in §3, and clarify "nbp."
2. Say go on creating the Airtable base (§2) — reversible, no cost.
3. Decide the video path (§4): stand up Vertex/Veo, or use Higgsfield
   `generate_video` as a nearer-term fallback.
4. Pilot Higgsfield `generate_audio` for VO the same way `generate_image`
   already got piloted, before it's load-bearing in the pipeline.
5. Once 2-4 are settled, build the first real Routine (the daily
   orchestrator check) end-to-end against one real `Content Queue` idea.
