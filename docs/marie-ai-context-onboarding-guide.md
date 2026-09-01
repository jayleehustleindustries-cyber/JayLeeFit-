# Marie’s AI Context Onboarding Guide and Training Script

## Purpose

This guide trains Marie to use the synced company AI context as a **resale operations assistant**. It explains how to work from HubSpot, use the linked GitHub documentation, locate image evidence in Google Drive, verify inventory, prepare listing drafts, and ask the AI for task-specific coaching.

The AI is a teaching and coordination assistant. It is not a replacement for source verification, human judgment, account permissions, or final marketplace approval.

## Learning outcomes

By the end of onboarding, Marie should be able to locate her assigned HubSpot tasks, identify the source of truth for an item, match a Permanent SKU to its Drive image evidence, update or escalate a review task according to her permissions, prepare a listing draft without publishing it, and explain when a human owner must approve or take over.

| Marie should be able to… | Evidence of readiness |
|---|---|
| Navigate the shared HubSpot resale workspace | Opens her task view and identifies owner, due date, priority, business unit, and next action. |
| Use the synced AI context | Asks a bounded question and identifies which source document supports the answer. |
| Verify inventory | Matches SKU, item, images, condition, and storage information without inventing missing facts. |
| Work with GitHub references | Opens the approved repository documentation and identifies the relevant SOP or schema. |
| Work with Drive image references | Locates files by approved folder/file ID and preserves file IDs and view links. |
| Prepare listing work | Produces a complete draft and QA checklist without clicking Publish, Post, List, or Submit. |
| Escalate safely | Creates a conflict or review task when evidence is missing, inconsistent, sensitive, or outside her authority. |

## Access and safety boundaries

Marie may view the company data required for assigned resale tasks and may use the synced AI context for instruction, summarization, and review preparation. Her exact edit permissions should be set by the company owner in HubSpot and the connected systems.

Marie must not provide passwords, one-time codes, browser cookies, API keys, payment information, identity documents, or unnecessary personal information to the AI. She must not bypass CAPTCHA, bot detection, identity checks, rate limits, marketplace controls, or access restrictions. She must stop and escalate when any of those controls appear.

Marie must not publish listings, send customer messages, change approved prices, archive or delete source records, alter schemas, enable connectors, change permissions, or create calendar events unless the company owner has explicitly assigned and approved that authority. A browser form being filled is not the same as a listing being approved.

## Part 1: Start-of-day routine

### Step 1 — Open HubSpot and orient yourself

Open the shared HubSpot portal and go to the views assigned to resale operations. Begin with `My Due Tasks`, `Needs Verification`, `Ready to List`, `Active by Marketplace`, `Sold Awaiting Fulfillment`, and `Cross-List Conflicts`. Confirm the business unit before opening or changing any record.

For each task, read the owner, priority, due date, business unit, source system, Permanent SKU, next action, and evidence URL. If any of these are missing or contradictory, do not guess. Create or use the appropriate review task.

### Step 2 — Ask the AI for task-specific guidance

Use a bounded request that names the task and the SKU or source record. For example:

```text
Teach me how to complete task RESALE-001 for Permanent SKU A1-MD-0002. Start with read-only guidance. Tell me which source fields and image evidence to verify, what I should record in HubSpot, the definition of done, and when I must escalate. Do not make changes or publish anything.
```

The AI should explain the procedure using the synced SOPs and return the source references it used. If the answer conflicts with the current HubSpot record or source documentation, pause and create a conflict review.

### Step 3 — Choose the authoritative source

Use the current operating context to determine whether the relevant field is authoritative in Google Sheets, Airtable, Notion, Drive evidence, or another approved source. Keep the source system, source record ID, source URL, and last verified time visible in your notes.

Never treat a legacy duplicate as current merely because it contains a value. Never copy an unverified value into a verified field.

## Part 2: Verify one inventory item

### Step 4 — Confirm the item identity

Search HubSpot by Permanent SKU first. If no SKU is available, use the source record ID, item name, brand, size, and image-folder reference. Confirm that the item belongs to the correct business unit and that the record is not a duplicate.

### Step 5 — View the Drive image folder

Use the approved shared-folder reference from the record or task. The agent should view the folder by exact folder ID and return a bounded list of file IDs, filenames, MIME types, and view links. Match images to the item before using them in a listing draft.

Check for front, back, label, detail/flaw, and measurement evidence where required. Record unmatched, duplicate, missing, or cross-business-unit images as review issues. Do not move, rename, share, upload, or delete files during this verification step.

Example AI request:

```text
For Permanent SKU A1-MD-0002, show me the approved Drive folder and the image files matched to this item. Return file IDs, filenames, view links, and missing-image flags only. Do not upload, move, share, or delete files.
```

### Step 6 — Verify item attributes

Check brand, category, size, color, pattern, material, condition, condition notes, storage location, cost of goods, and any measurements against the source evidence. Use `Needs Review` or a conflict task when a field is missing or uncertain.

The definition of done is a record with a stable identity, correct business unit, source references, current status, owner, evidence links, and no unresolved identity conflict.

## Part 3: Prepare listing research and drafts

### Step 7 — Review market research

Read the available sold-count, active-count, sell-through, comp range, realistic sold value, and platform fields. Record the research date and source. Do not present an estimate as a verified sale price. Do not change a price without the required human approval.

### Step 8 — Generate a platform draft

If the master CSV is approved for use, run the draft helper from the repository root:

```bash
python3 tools/crosslist_prep.py inventory.csv ./drafts --platforms poshmark mercari depop facebook
```

Review the resulting JSON for title, price, description, image paths, source SKU, and safety flags. The expected safety flags are `review_required: true` and `submit_automatically: false`.

### Step 9 — Perform listing QA

Check that the title is accurate, the description matches the evidence, the price is approved, the images belong to the item, required fields are present, the business unit is correct, and the listing status is accurately recorded. Use the relevant platform-specific SOP and ask the AI to explain any failed check.

Example AI request:

```text
Review this draft for missing evidence, unsupported claims, incorrect business-unit data, title problems, price inconsistencies, and image mismatches. Return PASS or REVISE with exact corrections. Do not submit or publish it.
```

### Step 10 — Use browser assistance safely

If an approved browser adapter is available, it may open the marketplace form, fill approved fields, and display the completed page. Marie must review the page and perform the final external submission only if she has explicit authority. Stop for login, CAPTCHA, identity verification, policy warnings, rate limits, unexpected fields, or unclear submission controls.

## Part 4: Complete, escalate, and report

### Step 11 — Close or escalate the task

Close the task only when the definition of done is met and evidence is recorded. If a source conflict, missing image, unclear identity, duplicate SKU, unsupported claim, or permission issue remains, leave the item in review and create an escalation task.

An escalation should state what was checked, what conflicts, which source IDs are involved, what evidence is missing, the recommended human decision, and the next action.

### Step 12 — End-of-day report

Ask the AI to prepare a concise report:

```text
Prepare my end-of-day resale helper report. Include completed tasks, items moved forward, items blocked, missing evidence, source conflicts, listing drafts prepared but not submitted, Drive image issues, and the next action for each item. Do not change any records.
```

The report should be factual and traceable. It should not claim that an item was listed, sold, or synchronized unless the target system returned verifiable evidence.

## Trainer-led training script

### Opening — 5 minutes

**Trainer:** “Marie, your role is to keep resale work accurate and moving. The AI is here to teach you the process, explain the documents, and help prepare work. It is not allowed to invent facts, bypass platform controls, or publish listings for you.”

**Trainer:** “Our operating rule is simple: verify the item, preserve the source, complete the task, and escalate anything uncertain. Every record must retain the business unit, Permanent SKU or source identity, source system, source record ID, owner, status, and evidence.”

### HubSpot orientation — 10 minutes

**Trainer:** “Open `My Due Tasks`. Pick one task with a clear Permanent SKU. Tell me the business unit, owner, priority, due date, source system, and definition of done.”

**Marie:** “I can see the assigned owner, priority, due date, business unit, source, and next action.”

**Trainer:** “Now open `Needs Verification`. What is different about those items?”

**Expected response:** “They require evidence or a decision before they can move to research or listing preparation.”

### AI context demonstration — 10 minutes

**Trainer:** “Ask the AI to teach you the task, but make the request bounded. Include the SKU and tell it not to make changes.”

**Marie:** “Teach me how to verify this item from the current SOP. Start read-only and tell me when I need to escalate.”

**Trainer:** “What should you do if the AI answer disagrees with the source record?”

**Expected response:** “Stop, preserve both values, record the source IDs, and create a conflict review instead of choosing silently.”

### Drive image exercise — 15 minutes

**Trainer:** “Use the exact folder ID from the record. Show the file IDs and view links. Do not move or share anything.”

**Marie:** “I found the folder and matched the front, back, label, and detail images to the SKU.”

**Trainer:** “What if one image belongs to another item?”

**Expected response:** “Mark it unmatched or cross-business-unit, do not attach it, and create a review task.”

### Listing preparation exercise — 20 minutes

**Trainer:** “Generate or open the platform draft. Review the title, price, description, images, source SKU, and safety flags.”

**Marie:** “The draft requires review and automatic submission is disabled.”

**Trainer:** “Open the browser form only if the adapter is approved. Fill the form and stop before Publish.”

**Trainer:** “What would make you stop immediately?”

**Expected response:** “Login, CAPTCHA, identity verification, policy warning, rate limit, unexpected page, missing field, or unclear submit control.”

### Escalation exercise — 10 minutes

**Trainer:** “The size in the record says L, but the tag image is unreadable. What do you do?”

**Expected response:** “Use Needs Review, record the missing evidence, do not invent the size, and assign the escalation to the responsible owner.”

### Close — 5 minutes

**Trainer:** “You are ready when you can explain what you verified, where the evidence came from, what you changed, what you intentionally did not change, and what the next owner must do.”

## Readiness checklist

| Check | Pass condition | Marie initials/date |
|---|---|---|
| HubSpot navigation | Finds assigned views and identifies task metadata | |
| Business-unit control | Confirms business unit before working a record | |
| Source hierarchy | Identifies authoritative source and legacy/read-only source | |
| SKU matching | Matches an item using Permanent SKU or supported fallback identity | |
| Drive evidence | Locates image files by approved folder/file ID and preserves links | |
| Attribute verification | Marks uncertain fields for review instead of guessing | |
| Draft generation | Produces a platform draft with source SKU and safety flags | |
| Listing QA | Finds unsupported claims, missing fields, and image mismatches | |
| Browser boundary | Stops before final submission and escalates blocking controls | |
| Conflict handling | Creates a clear conflict task with both source values | |
| AI prompting | Uses bounded, source-aware, read-only coaching requests | |
| End-of-day report | Reports completed, blocked, and next-action items accurately | |

## Quick-reference prompt card

```text
Teach me this resale task step by step using the synced company context. Start with read-only guidance. Identify the source of truth, required fields, evidence to inspect, definition of done, and escalation conditions. Do not invent missing facts, change records, publish listings, send messages, move Drive files, or bypass login, CAPTCHA, identity verification, policy, or rate-limit controls.
```

## Source references

Marie’s primary reference materials are maintained in the approved GitHub repository:

- https://github.com/jayleehustleindustries-cyber/JayLeeFit-/tree/claude/fitness-airtable-client-data-g1iot3/docs
- https://github.com/jayleehustleindustries-cyber/JayLeeFit-/blob/claude/fitness-airtable-client-data-g1iot3/docs/hubspot-agent-context.md
- https://github.com/jayleehustleindustries-cyber/JayLeeFit-/blob/claude/fitness-airtable-client-data-g1iot3/docs/resale-helper-sops-and-hubspot-workflows.md
- https://github.com/jayleehustleindustries-cyber/JayLeeFit-/blob/claude/fitness-airtable-client-data-g1iot3/docs/openai-agent-prompt-template.md
- https://github.com/jayleehustleindustries-cyber/JayLeeFit-/blob/claude/fitness-airtable-client-data-g1iot3/tools/CROSSLISTING.md
