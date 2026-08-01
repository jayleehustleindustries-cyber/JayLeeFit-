# EHC Listing Pipeline — durable, post-Fable infrastructure

Rebuilt 2026-07-04 so the EHC resale listing operation runs on any model
(or by hand) after Fable 5 is gone (July 7). Start with `SOP.md`.

| File | What it is |
|---|---|
| `SOP.md` | Master instructions any model loads first. The law. |
| `checklists/00-verification-gate.md` | The pass/fail standard + session self-check |
| `checklists/01-intake-capture.md` | The one-touch physical capture (the bottleneck fix) |
| `checklists/02-research-pricing.md` | Comp research → dollar amounts, bounded |
| `checklists/03-publish.md` | Publish Packet format + 10-min phone procedure |
| `tools/gate.py` | Deterministic gate: CSV in → LISTABLE/BLOCKED + Capture Queue out |
| `LOOP.md` | Session loop, weekly self-check, model assignments, report log |
| `EXAMPLES.md` | Gold-standard row/packet + 6 real failure modes |

## Why it's shaped this way

Diagnosis (from the real sheets, 2026-07-04): 71 items, 5 ever listed,
Codex dashboard at 0 active listings / $0 projected payout. Every blocked
item was missing the same physical facts (size, measurements, cost, bin,
inspection), and every agent handled missing facts by writing hedged prose
into the data. The structural fix: **a defined one-touch capture step
feeding a mechanical listable gate** — intelligence is moved out of the
loop and into these files, so the runner only follows checklists and a
script arbitrates "done."

## Decision log (assumptions to override if wrong)

The interview couldn't complete (session drops), so these four defaults
were adopted from evidence. Edit the SOP if any is wrong:

1. **Capture flow** = phone photos into a chat batch, model fills the row
   (evidence: `CHAT-20260626-*` batch IDs, "supplied photos" notes).
2. **Real blocker** = no defined hands-on pass + manual phone posting
   (evidence: all 64 unlisted rows blocked on physical facts only).
3. **Money rule** = price from sold comps; the 400% ROI gate applies to
   buying/repricing only when cost is recorded — missing cost never blocks
   a listing (evidence: "Needs Cost" deadlocked 17 items at $0 payout).
4. **Source of truth** = `EHC Inventory Log` is master; Codex's Command
   Sheet is a derived queue keyed by Permanent SKU (evidence: Log is the
   richer, older record; the Command Sheet's parallel keys already drifted).

## Handoff note for Codex

Codex: load `SOP.md` before writing to either sheet. Your existing
operating notes ("Item ID is the permanent key", "don't overwrite human
fields") remain true with one amendment — Item ID **is** the Inventory
Log's Permanent SKU, and rows lacking one route to the Capture Queue, not
to `TEMP-*` keys. Your "Needs Human Review" state maps to the gate's
BLOCKED output; the Capture Queue replaces Problem_Finder for physical
facts.
