# Resale Helper Duties: SOPs and HubSpot Workflow Specifications

## Operating objective

The resale helper owns the accurate movement of physical inventory from intake through verification, research, listing, sale, fulfillment, and archive. HubSpot is the shared team coordination layer. The authoritative inventory source remains the source explicitly designated in the current operating documentation until a pilot migration is approved.

The helper must preserve the separation between Magicdeals Wholesale Outlet, EHC, and JayLeeFit. Every record must have a `Business Unit`, `Permanent SKU` where available, `Source System`, `Source Record ID`, `Source URL`, `Owner`, `Status`, and `Last Verified At`.

## Role responsibilities

| Duty | Helper responsibility | Required evidence | Escalate when |
|---|---|---|---|
| Intake | Create or verify one inventory record per physical item | SKU, item name, source record, image folder, storage location | SKU collision, unclear ownership, missing images |
| Verification | Confirm brand, category, size, color, condition, flaws, and measurements from source evidence | Image references, notes, verification timestamp | Conflicting photos, uncertain authenticity, missing tags |
| Research | Record sold comps, active counts, sell-through, realistic value, and price recommendation | Research source, date, range, confidence | Evidence is stale or materially inconsistent |
| Listing preparation | Prepare platform-specific titles, descriptions, prices, and image sequence | Draft listing record, QA checklist | Required marketplace fields are unknown |
| Cross-listing | Track each item/channel pair and prevent duplicate active listings | Listing URL/status/last verified timestamp | Item appears sold or unavailable elsewhere |
| Buyer follow-up | Log inquiries, offers, and next actions against a contact/deal | Contact identity, channel, next action, due date | Identity is ambiguous or consent is unclear |
| Fulfillment | Move sold items through payment, packing, shipping, and completion | Sale record, shipping evidence, completion timestamp | Payment, address, or shipping exception |
| Exception handling | Create a ticket or review task instead of guessing | Blocker, owner, evidence URL, proposed resolution | Any source conflict or policy concern |

## SOP 1: Inventory intake and verification

Start by checking whether the item already has a Permanent SKU. If it does, match by SKU and confirm the source record. If it does not, create a proposed identifier only in the staging layer; do not invent a permanent SKU in the authoritative system without approval. Attach or link the source image folder and record the storage location.

Verify the visible fields from evidence. Use `Needs Review` for any field that is not supported by the source. Do not infer authenticity, material, measurements, condition grade, or gender department from appearance alone. When a field is unresolved, create a review task with the missing evidence and an owner.

## SOP 2: Listing research and pricing

For each item, record the research date, marketplace, sold-count evidence, active-count evidence, sold-comp low, realistic sold value, sold-comp high, and recommended asking price. Preserve the original research reference. If the source record contains platform-specific SEO titles or descriptions, retain them as drafts and identify the generator or source.

The helper may prepare recommendations but must not change a price or publish a listing solely because an automated recommendation exists. A human owner approves material pricing changes and all final listing submissions.

## SOP 3: Listing preparation and QA

Create one Listing record per item and marketplace channel. The listing must include Permanent SKU, channel, title, description, price, image folder, listing URL if active, listing status, last verified timestamp, and source references. Before moving the listing to `Ready to Publish`, check that the item identity, condition, images, price, shipping settings, and required marketplace attributes are complete.

For Playwright-assisted form preparation, the browser may navigate to the form and fill approved fields. It must stop for login, CAPTCHA, identity verification, policy warnings, unexpected pages, or missing fields. It must stop before `Publish`, `Post`, `List`, or `Submit`; the human owner performs the final action.

## SOP 4: Cross-listing and delisting control

Before activating a new listing, check all existing channel records for the same Permanent SKU. If the item is marked sold, reserved, unavailable, or pending fulfillment anywhere, do not create another active listing. When a sale is confirmed, create a delisting task for every other active channel and record the completion evidence.

Do not delete historical listings. Use `Ended`, `Sold`, `Delisted`, `Cancelled`, or `Archived` statuses so the team can audit what happened.

## SOP 5: Buyer and supplier follow-up

Create or update a Contact only when a reliable identifier is available. Associate the Contact with the relevant Company, Deal, Listing, or Ticket. Record the source channel, consent status where relevant, last contact date, next action, owner, and due date. Do not copy sensitive personal information into unrelated records.

A buyer inquiry becomes a Deal when there is a concrete offer, purchase intent, or transaction. A supplier relationship becomes a Company relationship when there is a repeat or operational relationship. Keep casual engagement as an activity or note rather than creating unnecessary deals.

## SOP 6: Sale and fulfillment

When a sale is confirmed, update the item’s availability and create or update the transaction Deal. Capture the channel, sale price, fees if authorized, shipping status, buyer association, and fulfillment owner. Use a ticket or task for packing, label, shipment, delivery, return, or exception steps. Close the transaction only after the required completion evidence is present.

## SOP 7: Sync conflicts and data stewardship

When two sources disagree, do not overwrite either source. Create a conflict ticket containing the field name, source A value, source B value, source timestamps, record IDs, and a recommended human decision. After resolution, record the decision and verification timestamp. Legacy or read-only sources remain read-only.

## HubSpot workflow specifications

| Workflow | Trigger | Actions | Guardrails |
|---|---|---|---|
| New inventory intake | Inventory record created or status becomes `Intake` | Assign owner, create verification task, set business-unit view | Require SKU/source reference; no listing creation |
| Missing evidence | Required field empty or status `Needs Review` | Create ticket, assign queue, set due date | Never auto-fill uncertain facts |
| Ready for research | Verification complete | Create research task and set research status | Do not recommend a price without evidence |
| Ready to list | QA checklist complete | Create channel listing tasks or listing records | Human approval before publishing |
| Cross-list collision | Same SKU has multiple active or sold conflicts | Create conflict ticket, pause downstream tasks | Do not auto-delist or overwrite |
| Sale confirmed | Deal moves to `Closed Won` or sale status confirmed | Mark item sold, create delisting tasks, create fulfillment task | Idempotent by Permanent SKU and transaction ID |
| Fulfillment exception | Shipment delayed, returned, or blocked | Create operations ticket and notify owner | Avoid exposing buyer data unnecessarily |
| Stale listing review | Listing not verified within configured period | Create review task | Never delete automatically |
| Weekly operating review | Scheduled internal review | Report intake, ready-to-list, active, sold, blocked, and stale counts | Report only authorized team data |

## Suggested HubSpot views

Create shared views for `All Active Inventory`, `Needs Verification`, `Ready for Research`, `Ready to List`, `Active by Marketplace`, `Sold Awaiting Fulfillment`, `Cross-List Conflicts`, `Unassigned`, `My Due Tasks`, and `By Business Unit`. Team-wide visibility should not remove owner accountability or the approval gate for external publication.

## Acceptance criteria for the helper role

A helper task is complete when the record has a stable identity, correct business unit, verified source references, a current status, an owner, a next action or completion evidence, and no unresolved conflict. A listing task is not complete merely because a browser form was filled. It is complete only when the human review decision and final marketplace outcome are recorded.
