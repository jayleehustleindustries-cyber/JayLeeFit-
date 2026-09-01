# Marie — HubSpot Resale Helper Onboarding Debrief

## Purpose

This debrief is the starting brief for Marie’s helper role in the shared HubSpot resale operation. It links the operational rules, code, schemas, workflows, and agent context maintained in the approved GitHub repository.

## Approved GitHub source

| Field | Value |
|---|---|
| Repository | `jayleehustleindustries-cyber/JayLeeFit-` |
| Repository URL | https://github.com/jayleehustleindustries-cyber/JayLeeFit- |
| Working branch | `claude/fitness-airtable-client-data-g1iot3` |
| Latest connected artifact commit | `b1c660a` |
| Purpose | Read-only operating documentation, automation code, schemas, SOPs, and agent context |

The GitHub repository is a source of operating documentation and code. It is not a substitute for HubSpot permissions, Google Workspace access, marketplace credentials, or company approval. Marie should use the linked files as instructions and reference material, not as authorization to change records or publish listings.

## Core files Marie should know

| GitHub path | What Marie uses it for |
|---|---|
| `docs/hubspot-resale-agent-blueprint.md` | Understand the shared HubSpot resale model, source hierarchy, objects, pipelines, views, and approval checkpoints. |
| `docs/resale-helper-sops-and-hubspot-workflows.md` | Follow intake, verification, research, listing QA, cross-listing, fulfillment, and conflict procedures. |
| `docs/hubspot-agent-context.md` | Understand company context, business-unit separation, source-of-truth rules, and agent operating boundaries. |
| `docs/openai-agent-prompt-template.md` | Understand how the AI agent loads context, performs read-only discovery, previews changes, and waits for approval. |
| `docs/openai-hubspot-supabase-function-schema.json` | Reference the safe HubSpot/Supabase function boundaries. |
| `docs/openai-agenda-helper-function-schema.json` | Reference monthly agenda and helper task-sheet preview/delivery functions. |
| `docs/openai-drive-ehc-view-function-schema.json` | Reference read-only shared-folder and EHC inventory viewing functions. |
| `docs/openai-github-function-schema.json` | Reference read-only GitHub repository inspection functions. |
| `tools/crosslist_prep.py` | Generate platform-specific draft listings from a master CSV. |
| `tools/CROSSLISTING.md` | Follow the draft-first cross-listing process. |
| `tools/test_crosslist_prep.py` | Confirm the draft generator still passes its safety and output tests. |

## Marie’s first-week task sheet

| Priority | Task | Expected output | Definition of done |
|---|---|---|---|
| P1 | Review the resale blueprint and helper SOP | One-page summary of the resale pipeline and approval gates | Marie can explain intake, verification, listing QA, sale, fulfillment, and conflict handling. |
| P1 | Audit a small inventory batch by Permanent SKU | Missing-field and evidence checklist | Each item has business unit, SKU/source ID, image reference, status, owner, and next action. |
| P1 | Match image files to inventory records | Matched/unmatched image report | Every matched image retains Drive file ID, folder ID, filename, and view link. |
| P1 | Review active marketplace listing statuses | Channel-status audit | Each item/channel pair is marked Draft, Active, Sold/Ended, Delisted, or Needs Review with evidence. |
| P2 | Prepare listing research evidence | Research notes and source links | Price and market observations are recorded without unverified claims. |
| P2 | Run the cross-list draft generator on a test CSV | Four reviewable platform drafts | Drafts contain no credentials and have automatic submission disabled. |
| P2 | Create conflict tickets for mismatched records | Conflict queue with source values and IDs | No conflict is silently overwritten or discarded. |
| P3 | Review GitHub artifact links and latest commit | Knowledge-reference checklist | Marie can locate the SOP, schemas, prompt, scripts, and test fixture. |

## AI teaching instructions for Marie

Marie may ask the approved AI agent questions such as:

> “Teach me how to verify one resale item from intake through listing readiness. Use the helper SOP, show me the fields to inspect, and stop before any write or publication.”

> “Show me how to match this Permanent SKU to its Drive image files and identify missing images. Do not upload, move, share, or delete anything.”

> “Review this listing draft for missing required information and explain each correction. Do not publish or submit it.”

> “Explain this source conflict and show me what evidence a human owner needs before deciding.”

Marie must not provide passwords, tokens, browser cookies, identity documents, payment details, or unnecessary personal data to the AI agent. The agent should teach the process, explain the definition of done, and request escalation when a task involves a marketplace submission, CAPTCHA, identity verification, pricing override, destructive action, or unclear source ownership.

## HubSpot record mapping for Marie

Marie should be represented as a HubSpot Contact if the company has authorized her contact record. Her onboarding work should be represented by Tasks or Tickets associated with the relevant business unit and inventory/listing records. The debrief should be linked through a note or knowledge-reference record containing the GitHub repository URL, branch, commit, and file paths.

Recommended fields include `Helper Role = Resale Operations Helper`, `Business Unit = Shared Company` or the assigned operating unit, `Onboarding Status`, `Start Date`, `Manager/Owner`, `GitHub Repository URL`, `GitHub Branch`, `GitHub Commit`, `Current SOP Version`, and `Access Scope`. Do not put secrets or full source code into Marie’s contact record. Store links and concise summaries; keep code and schemas in GitHub.

## Connection and approval sequence

The agent should first verify that the GitHub repository is the approved repository and branch, inspect only the listed files, and produce a source-reference manifest. It should then inspect HubSpot’s available contact, task, ticket, note, and knowledge-reference capabilities. Next it should prepare a mutation preview that includes Marie’s contact mapping, onboarding tasks, debrief reference, GitHub URLs, source commit, and proposed associations. A human owner must approve that preview before the agent creates or updates HubSpot records.

The first approved HubSpot write should be a small pilot consisting of Marie’s contact or onboarding task record, the debrief reference, and no more than the initial starter tasks. The agent must return created record IDs and evidence links. It must not claim that all GitHub information has been copied into HubSpot; the correct design is to preserve GitHub as the code/documentation source and place traceable links and summaries in HubSpot.
