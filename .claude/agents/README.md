# content-engine agent hierarchy

This directory holds the real, invokable subagents for the JayLeeFit
`content-engine` video pipeline: script → avatar video → clip/edit →
publish → analytics → improvement, feeding back into the next script.

## The five real subagents (this directory)

| File | Role | Status |
|---|---|---|
| `managerial-agent-1-scriptwriter.md` | Writes the script | Ready |
| `managerial-agent-2-video-generator.md` | Generates avatar video | Ready — uses Higgsfield, not Google Flow (not connected yet) |
| `managerial-agent-3-clip-editor.md` | Clips/edits the video | Ready — uses Higgsfield's clipper or Descript, not OpusClip (not connected yet) |
| `analytical-agent.md` | Watches post-publish metrics | Ready — uses Metricool |
| `improvement-agent.md` | Turns metrics into the next script's direction | Ready |

Invoke each with the `Agent` tool, `subagent_type` set to the file's `name`.
They run in sequence, one handing its output to the next — nothing here
runs on its own schedule yet; each step still needs to be kicked off.

## Why there's no `action-CEO-agent.md` or `master-orchestration-agent.md` file here

Those two roles were part of the original request but don't map onto what a
Claude Code subagent actually is. A subagent is invoked once, does one
delegated job, and reports back — it has no memory across turns and can't
itself decide what to invoke next. "Deciding which of the five roles above
to run, in what order, right now" requires exactly the standing context
(this conversation, this session) that a subagent doesn't have.

That job is already being done — it's the main session itself, operating
under the rules in the published **Standing Charter** artifact (Article II:
"Cross-venture routing & triage"). Making a fake subagent file for it would
create something that looks callable but can't actually orchestrate
anything on its own. If real autonomous scheduling is wanted later (e.g.
"generate and publish a video every Tuesday without me kicking it off"),
that's a different, buildable thing — a scheduled Routine — not a subagent
file, and would need its own explicit design.

## Not yet connected

Two tools named in the original request aren't wired up in this account
yet: **Google Flow** (script-to-video) and **OpusClip** (clip editing).
Each affected agent above falls back to a connected equivalent (Higgsfield,
Descript) and says so plainly rather than pretending to use the named tool.
Connect either one and tell the relevant agent file to prefer it once it's
available.
