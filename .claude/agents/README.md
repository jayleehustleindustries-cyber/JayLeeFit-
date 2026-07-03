# JayLeeFit Subagents

Deployable Claude Code subagents for the marketing operation. Each maps to a
node in the Airtable **System Architecture** table.

| Agent | Job | Runs on |
|-------|-----|---------|
| `analytics-agent` | Weekly review → content plan | Metricool + Airtable |
| `content-research-agent` | Plan → shot briefs | Web + Airtable |
| `media-brief-agent` | Brief → 9:16 reference frames | Higgsfield |
| `qa-agent` | Gate: brand + virality check | Higgsfield + brand rules |

## How to deploy them
- **On demand:** ask Claude, e.g. "use the analytics-agent to review last week."
- **In a chain:** analytics → research → media → qa, then publish via Metricool.

## Making them "active" / periodic
Subagent files define **who does what** — not **when**. Two ways to run them on a
cadence so they're active without you prompting each time:
1. **CronCreate** (in Claude Code): schedule "use the analytics-agent to review
   last week and plan next" weekly. Recurring cron tasks auto-expire after 7 days
   and are re-armed.
2. **Orchestrator (n8n/Make):** the durable production path — the "CEO" dispatches
   each agent on schedule and enforces the QA gate before publishing.

Start with a weekly CronCreate for `analytics-agent`; graduate to the orchestrator
when the pipeline is producing content to analyze.

## Not a subagent: DM / comment engagement
Auto-watching comments and replying to Instagram/TikTok DMs is **not** a Claude
subagent job — it needs a platform-connected tool (e.g. **ManyChat**) that holds
the IG/TikTok messaging permissions. See `docs/engagement-dm-automation.md`.
Claude designs the CTA keyword flows; ManyChat executes them.
