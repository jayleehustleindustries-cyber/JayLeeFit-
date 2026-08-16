# Manus Agent Handoff — JayLeeFit- Repository

**Date:** 2026-08-16
**From:** Claude Code (Opus 4.6), session `session_01DncpnmsYicD7VnbtzDUr93`
**Owner:** jayleehustle.industries@gmail.com
**Repo:** `jayleehustleindustries-cyber/JayLeeFit-`

---

## 0. What This Document Is

A complete operational debrief for Manus to pick up where Claude Code left off. Everything below reflects the actual committed state of the codebase as of `39ba023` on branch `claude/jaylee-fit-website-build-aor3la`. Read it top to bottom before touching anything.

---

## 1. Repo Structure — Three Distinct Businesses

This repo contains three **completely separate** projects that happen to share a GitHub repo. They have different brands, different customers, different tech stacks, and different data sources. Confusing them is worse than asking which one a task belongs to.

### Project A: EHC Storefront (`storefront/`)
- **Brand:** Old Light — "Secondhand, sold under old light."
- **What it is:** Men's/women's secondhand apparel resale (eBay, Poshmark, Mercari)
- **Stack:** Next.js 16, Tailwind v4, Stripe, Google Sheets as inventory DB
- **Data source:** EHC Inventory Log (Google Sheet `1-UcTy4Cr_NPK622SPRXob7LfpHFEw5874mv9y5E90Ys`)
- **Marketplace accounts:** eBay `everyday_hustle_clothing_co`, Poshmark/Mercari `jayleehustle.industries@gmail.com`
- **Status:** Functional but not deployed to production domain

### Project B: JayLeeFit Website (`jayleefit-website/`)
- **Brand:** JayLeeFit — online fitness coaching
- **What it is:** Lead capture website with intake form
- **Stack:** Next.js 16, Tailwind v4, React Hook Form + Zod, Airtable
- **Data source:** Airtable base `appN8QFsoWJ1fJhxC` (Clients table)
- **Target domain:** jayleefit.com
- **Status:** Builds clean, not deployed

### Project C: Content Engine (`content-engine/`)
- **Brand:** `jay_legacy_fit` / Everyday Hustle Co. (personal brand social)
- **What it is:** Multi-agent content pipeline architecture (design only, nothing built)
- **Platforms:** Instagram `@j_lee_is_me`, TikTok `@jay_legacy_fit`, YouTube
- **Status:** Architecture doc + operational briefs, no code running

### Legacy: Data API (`data-api/`)
- Superseded by storefront's built-in data layer (`storefront/lib/data/`)
- The storefront handles its own sheets fetching, CSV/JSON export, sync state
- Don't build new features here — all data work goes through `storefront/`

---

## 2. What's Been Built and Works

### 2a. Storefront Data Layer (`storefront/lib/data/`)

| File | Purpose | Status |
|------|---------|--------|
| `sheets-fetcher.ts` | Fetches inventory from Google Sheet CSV export, parses columns, maps both this project's schema and the real EHC sheet layout | Working |
| `csv-parser.ts` | CSV parsing utilities | Working |
| `sync-state.ts` | Tracks sync timestamps per source (sheets, drive, staleness) in `public/logs/sync-state.json` | Working |
| `drive-fetcher.ts` | Fetches files from Google Drive folder, maps images to SKUs by filename | Working |
| `image-mapper.ts` | Links Drive images to inventory items | Working |

### 2b. Staleness Ladder (`storefront/lib/staleness/`)

Complete 30/60/90-day pricing automation. See `STALE_INVENTORY_AUTOMATION.md` for full docs.

| File | Purpose |
|------|---------|
| `config.ts` | Tier rules (fresh/30/60/90/liquidate), floors, marketplace list, `resolveTier()`, `loadConfig()` |
| `engine.ts` | Pure decision engine: `decidePrice()`, `buildPlan()`, `stalePriceMap()` |
| `content.ts` | Title/description rewriting with per-marketplace character limits |
| `ledger.ts` | Tracks what's been applied to prevent redundant edits |
| `runner.ts` | Orchestrates three delivery channels (eBay API, Poshmark/Mercari queue, CSV feed) |
| `types.ts` | `PriceDecision`, `ListingEdit`, `StalenessPlan`, `StalenessRunReport`, etc. |
| `verify-ladder.ts` | 39-assertion test harness |
| `adapters/ebay.ts` | eBay Trading API `ReviseFixedPriceItem` |
| `adapters/queue.ts` | Poshmark/Mercari work queue |

**Key design decision:** Tier percentages are *absolute* fractions of the original price, not compounding. Replaying a tier can never double-discount. This makes the whole thing idempotent and safe to run repeatedly.

### 2c. Operations Health Engine (`storefront/lib/ops/`)

Just committed — the latest automation layer.

| File | Purpose |
|------|---------|
| `types.ts` | `HealthGrade`, `AlertSeverity`, `ItemHealth`, `Alert`, `PipelineStatus`, `TierBreakdown`, `InventoryMetrics`, `OpsHealthReport` |
| `health.ts` | `scoreItem()` (100-point scale), `computeMetrics()`, `generateAlerts()`, `getPipelineStatuses()`, `buildHealthReport()` |
| `system-prompts.ts` | Four dynamic system prompts generated from live data: daily-ops-briefing, staleness-ops, listing-quality-ops, sourcer-ops |

### 2d. API Routes (`storefront/app/api/`)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/data/sync` | POST | Trigger Google Sheets inventory sync |
| `/api/data/drive-sync` | POST | Trigger Google Drive image sync |
| `/api/data/export` | GET | CSV/JSON export with ladder prices and images (`?format=csv&include-images=true`) |
| `/api/data/inventory` | GET | Raw inventory query |
| `/api/staleness/run` | GET/POST | Cron entry point — GET = dry run, POST with `Authorization: Bearer $CRON_SECRET` = real run |
| `/api/staleness/queue` | GET/PATCH | Poshmark/Mercari edit queue (read open items, close completed) |
| `/api/ops/health` | GET | Full health report (`?compact=true` omits per-item scores) |
| `/api/ops/prompts` | GET | All system prompts or specific one (`?id=daily-ops-briefing`) |
| `/api/checkout` | POST | Stripe Checkout Session creation (server-side re-pricing from live data) |
| `/api/checkout/webhook` | POST | Stripe webhook handler |

### 2e. Storefront Pages

| Path | Purpose |
|------|---------|
| `/` | Landing page — Old Light branding |
| `/shop` | Product catalog with filtering |
| `/shop/[slug]` | Product detail page |
| `/about` | Brand story |
| `/dashboard` | Ops dashboard — sync controls, staleness preview, health panel, alerts |
| `/checkout/success` | Post-purchase confirmation |
| `/checkout/cancel` | Checkout cancellation |

### 2f. JayLeeFit Website Pages

| Path | Purpose |
|------|---------|
| `/` | Hero + value prop + feature blocks (MAO methodology) |
| `/about` | Coach bio + methodology |
| `/intake` | Lead capture form (React Hook Form + Zod validation) |
| `/intake/success` | Confirmation after form submission |
| `/api/intake` | POST handler — validates + writes to Airtable Clients table |

### 2g. Vercel Cron

Defined in `storefront/vercel.json`:
```json
{ "crons": [{ "path": "/api/staleness/run", "schedule": "0 14 * * *" }] }
```
Fires daily at 14:00 UTC. Vercel Hobby allows one cron/day — this fits.

---

## 3. What Is NOT Built / NOT Working

### Critical gaps:

1. **No photos are wired to real inventory.** Every real item renders a "Photo coming soon" placeholder. The EHC Reference Frames (Drive folder with real phone photos) exist but are not matched to specific SKUs in the sheet. This is a real open problem.

2. **CSV export may still return 501.** The Vendoo integration docs describe CSV export, but the actual implementation needs verification. Check `storefront/app/api/data/export/route.ts` — if the CSV formatter isn't implemented, it needs to be.

3. **Google Drive image sync may not have Drive API credentials configured.** `GOOGLE_DRIVE_FOLDER_ID` and `GOOGLE_DRIVE_API_KEY` are documented in `.env.example` but may not be set in any deployed environment.

4. **Neither project is deployed to a custom domain.** Both need:
   - User's Vercel account (manual setup)
   - Environment variables configured in Vercel dashboard
   - DNS records pointed at Vercel

5. **Content Engine is design only.** `content-engine/ARCHITECTURE.md` describes a full multi-agent pipeline but zero code is running. The Airtable base for it hasn't been created. Metricool analytics connection is live but unused.

6. **No Google Sheets write access.** The system can read but never write to the EHC Inventory Log. This is a hard constraint — there is no service account with write credentials. All "updates" flow through marketplace APIs (eBay) or manual processes.

---

## 4. Environment Variables Required

### Storefront (`storefront/.env.local`)

```bash
# REQUIRED — Google Sheets (inventory source)
EHC_SHEET_ID=1-UcTy4Cr_NPK622SPRXob7LfpHFEw5874mv9y5E90Ys
GOOGLE_SHEETS_API_KEY=                    # Google Cloud Console API key

# REQUIRED for payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# REQUIRED for staleness automation (without this, cron runs preview-only)
CRON_SECRET=                              # any long random string

# OPTIONAL — Google Drive image sync
GOOGLE_DRIVE_FOLDER_ID=                   # EHC Image Import Folder ID
GOOGLE_DRIVE_API_KEY=                     # same or separate API key

# OPTIONAL — direct eBay writes (falls back to CSV feed via Vendoo)
EBAY_OAUTH_TOKEN=
EBAY_SITE_ID=0

# OPTIONAL — staleness guardrails (defaults shown)
STALE_ABSOLUTE_FLOOR=8
STALE_FLOOR_PCT=0.5
STALE_MAX_EDITS_PER_RUN=40
```

### JayLeeFit Website (`jayleefit-website/.env.local`)

```bash
AIRTABLE_API_TOKEN=pat_...                # Airtable personal access token
AIRTABLE_BASE_ID=appN8QFsoWJ1fJhxC
AIRTABLE_CLIENTS_TABLE=Clients
NEXT_PUBLIC_SITE_URL=https://jayleefit.com
NEXT_PUBLIC_SHOW_STOREFRONT_PROMO=true
NEXT_PUBLIC_STOREFRONT_URL=https://oldlight.shop
```

---

## 5. Git State

- **Active branch:** `claude/jaylee-fit-website-build-aor3la`
- **Default branch (base for PRs):** `claude/fitness-airtable-client-data-g1iot3` (not `main`)
- **Open PR:** #13 (draft) — "Build JayLeeFit coaching website with Airtable intake"
- **Other branch:** `claude/apparel-resale-storefront-jz63ws` — earlier storefront work, PR #5 (draft)
- **Latest commit:** `39ba023` — "Add inventory operations health engine and system prompts"

---

## 6. Hard Constraints — Do Not Violate

1. **Never write to the Google Sheet.** No write credential exists. The sheet is read-only.
2. **Never spend Higgsfield credits without explicit user approval.** Balance was ~15 credits (~1.25 credits per 1K product image). Always preview cost with `get_cost:true` first.
3. **Never deploy to a custom domain unilaterally.** Requires user's own Vercel account + DNS.
4. **Don't resurrect RE:UP branding.** It's been superseded by "Old Light."
5. **Cost-related actions require explicit approval** — image generation, paid APIs, anything that bills.
6. **Three projects, three brands, three data sources.** Don't let them bleed into each other.
7. **Content Engine work that creates Airtable tables/bases must be reviewed first** — the architecture is designed but not approved for build.

---

## 7. Priority Task List for Manus

### Tier 1 — Deployment (User Must Be Involved)

- [ ] **Deploy JayLeeFit website to jayleefit.com**
  - Vercel project setup (root directory: `jayleefit-website`)
  - Environment variables from Section 4 above
  - DNS: point jayleefit.com to Vercel
  - Verify Airtable intake form submission works in production

- [ ] **Deploy Old Light Storefront**
  - Vercel project setup (root directory: `storefront`)
  - Environment variables from Section 4 above
  - Set `CRON_SECRET` to activate the staleness ladder
  - DNS: point chosen domain (e.g., oldlight.shop) to Vercel

### Tier 2 — Finish the Data Pipeline

- [ ] **Verify CSV export works end-to-end**
  - `GET /api/data/export?format=csv` should return valid CSV
  - If it returns 501, implement the CSV formatter in `storefront/app/api/data/export/route.ts`
  - Columns needed: SKU, Brand, Gender, Garment, Condition, Price, ListedPrice, eBayURL, PoshmarkURL, Status, DaysInInventory, Notes, ImageURL

- [ ] **Match real EHC Reference Frames photos to inventory SKUs**
  - Photos exist in Google Drive (EHC Reference Frames folder)
  - No systematic SKU-to-photo mapping exists yet
  - The `driveFolder` field on inventory items is where photo URLs should land
  - Photo naming convention is documented but may not match actual filenames

- [ ] **Wire product images into storefront**
  - Currently every item shows "Photo coming soon" placeholder
  - Once Drive sync maps images to SKUs, the shop pages need to render them
  - `storefront/lib/products.ts` maps the data — add image URL handling there

### Tier 3 — Operations & Automation

- [ ] **Set up Vendoo to pull from the CSV export**
  - Endpoint: `/api/data/export?format=csv&include-images=true`
  - See `VENDOO_INTEGRATION.md` for full column mapping and setup guide
  - Vendoo syncs to eBay + Facebook Marketplace

- [ ] **Test the staleness ladder end-to-end in production**
  - Dry run: `GET /api/staleness/run?dry=true`
  - Live run needs `CRON_SECRET` set
  - Verify the Poshmark/Mercari queue populates: `GET /api/staleness/queue`
  - Verify CSV feed serves ladder prices: `GET /api/data/export?format=csv`

- [ ] **Run image-gen pilot (small batch, cost-previewed)**
  - Use `storefront/lib/asset-pipeline/` — stage 1 is built (shot angles + prompts)
  - Preview cost before generating — Higgsfield credits are real money
  - Start with 3-5 items max as a pilot

### Tier 4 — Content Engine (Requires User Review)

- [ ] **Create the Airtable base for content pipeline** (needs user greenlight)
  - Tables: Content Queue, Assets, Performance, AgentLog
  - Schema is fully designed in `content-engine/ARCHITECTURE.md`

- [ ] **Wire Metricool analytics** (connection is live, unused)
  - Brand `jay_legacy_fit` is connected
  - Use `getAnalyticsDataByMetrics` for post-performance data

- [ ] **Build first content workflow** (after Airtable base exists)
  - Start with the orchestrator Routine that reads Content Queue
  - Script/writer step is just a Claude turn — lowest risk to build first

---

## 8. Key External Systems

| System | Status | Credential Location |
|--------|--------|---------------------|
| Google Sheets (EHC Inventory Log) | Live, 71+ rows | `GOOGLE_SHEETS_API_KEY` in `.env.local` |
| Airtable (JayLeeFit Client Hub) | Live, base `appN8QFsoWJ1fJhxC` | `AIRTABLE_API_TOKEN` in `.env.local` |
| Stripe | Configured for test mode | `STRIPE_SECRET_KEY` in `.env.local` |
| eBay (`everyday_hustle_clothing_co`) | Live account | `EBAY_OAUTH_TOKEN` (optional) |
| Poshmark/Mercari | Live accounts | No API — manual or via Vendoo |
| Vendoo | User's account | Pulls from CSV export endpoint |
| Metricool | Connected (`jay_legacy_fit`) | MCP connector |
| Higgsfield | Connected (~15 credits) | MCP connector |
| Descript | Connected | MCP connector |
| Google Drive | EHC Image Import Folder + Reference Frames | `GOOGLE_DRIVE_API_KEY` |

---

## 9. Existing Agents in the Ecosystem

- **Codex** — another AI agent that actively manages the "Poshmark Agentic Inventory Command Sheet" (a separate Google Sheet with ROI gates, research tabs, problem finders). Don't write to sheets Codex owns without confirming it won't conflict.
- **Claude Code** (this session) — built everything in `storefront/lib/staleness/`, `storefront/lib/ops/`, the dashboard, API routes, and the JayLeeFit website.
- **Manus** (you) — picking up from here.

---

## 10. File Map (Quick Reference)

```
JayLeeFit-/
├── CLAUDE.md                          # Repo-wide instructions + constraints
├── BUILD_AND_SETUP.md                 # Master setup guide
├── VENDOO_INTEGRATION.md              # Vendoo CSV feed docs
├── STALE_INVENTORY_AUTOMATION.md      # Staleness ladder docs
├── MANUS_HANDOFF.md                   # THIS FILE
│
├── storefront/                        # Project A: Old Light (EHC resale)
│   ├── app/
│   │   ├── page.tsx                   # Landing page
│   │   ├── shop/page.tsx              # Product catalog
│   │   ├── shop/[slug]/page.tsx       # Product detail
│   │   ├── about/page.tsx             # Brand story
│   │   ├── dashboard/page.tsx         # Ops dashboard (sync, staleness, health)
│   │   ├── checkout/success/page.tsx
│   │   ├── checkout/cancel/page.tsx
│   │   └── api/
│   │       ├── data/sync/             # POST — sheets sync
│   │       ├── data/drive-sync/       # POST — Drive image sync
│   │       ├── data/export/           # GET — CSV/JSON with ladder prices
│   │       ├── data/inventory/        # GET — raw inventory
│   │       ├── staleness/run/         # GET/POST — cron entry point
│   │       ├── staleness/queue/       # GET/PATCH — Poshmark/Mercari queue
│   │       ├── ops/health/            # GET — health report
│   │       ├── ops/prompts/           # GET — system prompts
│   │       ├── checkout/              # POST — Stripe session
│   │       └── checkout/webhook/      # POST — Stripe webhook
│   ├── lib/
│   │   ├── data/                      # Sheets fetcher, Drive fetcher, sync state
│   │   ├── staleness/                 # 30/60/90 ladder engine + adapters
│   │   ├── ops/                       # Health scoring + system prompts
│   │   ├── asset-pipeline/            # Reference-image prompt engine (Stage 1)
│   │   ├── products.ts                # Inventory → product mapping
│   │   ├── stripe.ts                  # Stripe helpers
│   │   └── types.ts                   # Shared types
│   ├── vercel.json                    # Cron schedule (14:00 UTC daily)
│   └── .env.example                   # All env vars documented
│
├── jayleefit-website/                 # Project B: JayLeeFit coaching
│   ├── app/
│   │   ├── page.tsx                   # Home
│   │   ├── about/page.tsx             # About
│   │   ├── intake/page.tsx            # Intake form
│   │   ├── intake/success/page.tsx    # Confirmation
│   │   └── api/intake/route.ts        # POST → Airtable
│   ├── lib/
│   │   ├── airtable.ts               # Airtable client
│   │   └── form-validation.ts        # Zod schemas
│   └── .env.example
│
├── content-engine/                    # Project C: Social content pipeline
│   ├── README.md                      # Scope + status
│   ├── ARCHITECTURE.md                # Full multi-agent design
│   └── lib/                           # Prompt builders (Veo, batch dispatch)
│
├── data-api/                          # LEGACY — superseded by storefront/lib/data
│
└── docs/                              # Marketing SOPs, schema docs
```

---

## 11. System Operation Prompts (for Agent Automation)

The ops engine generates four dynamic prompts from live inventory data at `/api/ops/prompts`. These are designed to be consumed by agents (you, Codex, scheduled Routines) as system-level instructions:

1. **`daily-ops-briefing`** — Morning briefing with metrics, pipeline status, alerts. Trigger: daily at 08:00 local.
2. **`staleness-ops`** — Manage the 30/60/90 ladder, handle 120d+ human review items. Trigger: after each cron run.
3. **`listing-quality-ops`** — Improve listing completeness (photos, prices, marketplace coverage). Trigger: weekly or when completeness < 70.
4. **`sourcer-ops`** — Guide new inventory sourcing based on sell-through data. Trigger: when active count drops or weekly.

Fetch them: `GET /api/ops/prompts` (all) or `GET /api/ops/prompts?id=daily-ops-briefing` (specific).

Each prompt includes the specific EHC accounts, operational rules (no Sheet writes, cost approval required), and current inventory state.

---

## 12. How to Verify You're Set Up

```bash
# 1. Storefront builds
cd storefront && npx next build

# 2. JayLeeFit builds
cd jayleefit-website && npx next build

# 3. Staleness ladder tests pass
cd storefront && npm run verify:ladder

# 4. API endpoints respond (requires npm run dev)
curl http://localhost:3000/api/ops/health?compact=true
curl http://localhost:3000/api/ops/prompts
curl http://localhost:3000/api/staleness/run?dry=true
curl http://localhost:3000/api/data/export?format=json
```

---

*End of handoff. Pick up from the Priority Task List (Section 7). Ask the user before spending money or deploying to domains.*
