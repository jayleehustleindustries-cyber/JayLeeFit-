# JayLeeFit — Agentic Operation Blueprint

How the fitness Airtable ties into a coordinated multi-agent marketing + media
engine. This is the "constellation": a set of specialized agents, each mapped to
a real connected tool, coordinated by an orchestrator (the "CEO").

> Honest framing: a persistent autonomous "swarm" doesn't run inside a chat
> session. It runs on an **orchestrator** — n8n, Make, or scheduled triggers —
> that calls each tool/agent on a schedule and passes data between them. Below is
> that buildable system, not a metaphor.

---

## The constellation (data flow)

```
                         ┌─────────────────────────────┐
                         │   CEO / ORCHESTRATOR         │
                         │   (n8n / Make / scheduler)   │
                         │   owns schedule + routing    │
                         └──────────────┬──────────────┘
        ┌───────────────┬───────────────┼───────────────┬───────────────┐
        ▼               ▼               ▼               ▼               ▼
  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐
  │ ANALYTICS │  │ RESEARCH  │  │  MEDIA    │  │ EDITING / │  │    QA     │
  │  agent    │  │  agent    │  │  ENGINE   │  │ CLIPPING  │  │  agent    │
  ├───────────┤  ├───────────┤  ├───────────┤  ├───────────┤  ├───────────┤
  │ Metricool │  │ Web       │  │ AI Studio │  │ Descript  │  │ brand +   │
  │ + Airtable│  │ research  │  │/ Higgsfield│ │ (clips,   │  │ virality  │
  │           │  │           │  │           │  │  captions)│  │ gate      │
  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘
        └──────────────┴───────┬───────┴──────────────┴──────────────┘
                               ▼
                    ┌─────────────────────┐        ┌──────────────────┐
                    │  PUBLISH (Metricool) │◄──────►│  DATA / MEMORY    │
                    │  at best-time slots  │        │ Airtable·Drive·   │
                    └─────────────────────┘        │ Notion            │
                                                    └──────────────────┘
```

**Airtable is the source of truth at the center** — every agent reads context
from it and writes results back to it.

---

## Agent roster (role → real tool → job)

| Agent | Tool (connected) | Input | Output |
|-------|------------------|-------|--------|
| **CEO / Orchestrator** | n8n / Make / cron triggers | The weekly plan | Dispatches each agent, enforces order + schedule |
| **Analytics** | Metricool + Airtable | Post performance, client metrics, best-time data | Weekly report + "what to make next" |
| **Research** | Web search | Niche trends, hooks, formats | Content brief per pillar |
| **Media Engine** | Google AI Studio / Higgsfield | Brief + brand references | Cinematic stills + video |
| **Editing / Clipping** | Descript | Long video / raw footage | Short clips, captions, filler removed |
| **QA** | Brand rules + Higgsfield virality predictor | Draft asset | Pass/revise gate before anything publishes |
| **Publish** | Metricool | Approved asset | Scheduled post at Wed–Fri 10am / 6pm PT |
| **Data / Memory** | Airtable · Drive · Notion | All artifacts | Stored, versioned, linked to client/campaign |

---

## The weekly loop (what the orchestrator runs)

1. **Mon — Analytics** reads last week (Metricool + Airtable) → ranks top content
   → writes the plan.
2. **Tue — Research** turns the plan into briefs (hooks, formats, references).
3. **Tue/Wed — Media Engine** generates stills/video from briefs + brand refs.
4. **Wed — Editing/Clipping** (Descript) cuts long assets into shorts + captions.
5. **Wed — QA** runs each asset through the virality predictor + brand check;
   only passes gate if it clears.
6. **Wed–Fri — Publish** schedules approved assets into Metricool at best times.
7. **Sun — Data/Memory** archives everything to Drive/Notion, logs results to
   Airtable for next week's Analytics pass.

---

## Build order (don't build it all at once)

1. **Wire the spine:** orchestrator (n8n/Make) + Airtable read/write. (Phase 2)
2. **Add Analytics + Publish:** Metricool in, scheduled posts out. (Phase 2)
3. **Add Media + Editing:** AI Studio/Higgsfield + Descript. (Phase 3)
4. **Add the QA gate:** virality predictor + brand rules before publish. (Phase 3)
5. **Close the loop:** results back to Airtable → Analytics improves the plan.

Each node is independently useful, so value ships at every step — you are never
waiting on the whole swarm to see a result.
