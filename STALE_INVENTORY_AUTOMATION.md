# Stale Inventory Automation — the 30/60/90 ladder

Watches every active EHC listing's age and moves the price, title, and
description down a ladder as it goes stale. Runs on a schedule with no one in
the loop.

**Accounts in scope:** eBay `everyday_hustle_clothing_co`, plus the Poshmark and
Mercari closets under `jayleehustle.industries@gmail.com`.

---

## What the watcher actually is

A **Vercel Cron job**, defined in `storefront/vercel.json`, hitting
`GET /api/staleness/run` once a day at 14:00 UTC. Vercel attaches
`Authorization: Bearer $CRON_SECRET` to that request; the endpoint executes the
ladder when that header checks out and returns a harmless preview when it
doesn't.

That auth check is the whole safety model, and it has a useful consequence:
**the endpoint is safe to open in a browser.** No token, no edits — you get a
dry run.

```
Google Sheet (EHC Inventory Log)
        │  Timestamp column -> daysInInventory
        ▼
  buildPlan()  ── pure decision, no side effects
        │
        ├──► eBay Trading API      (immediate, needs EBAY_OAUTH_TOKEN)
        ├──► Poshmark/Mercari queue (no public write API exists)
        └──► CSV feed              (always on, no credentials)
                    │
                    ▼
                 Vendoo ──► eBay + Poshmark + Mercari
```

---

## The ladder

| Age | Tier | Price | Title | Description | Bump |
|-----|------|-------|-------|-------------|------|
| 0–29d | Fresh | unchanged | — | — | no |
| 30–59d | 30-Day Nudge | **90%** of original | unchanged | "Price just dropped" | yes |
| 60–89d | 60-Day Drop | **75%** | `PRICE DROP — …` | "Reduced 25%…" | yes |
| 90–119d | 90-Day Clearance | **60%** | `CLEARANCE — …` | "Final markdown…" | yes |
| 120d+ | Liquidate | *frozen at 60%* | — | — | **human review** |

Tune any of it in `storefront/lib/staleness/config.ts`. The tier table is data,
not logic — you can add or move a rung without touching the engine.

### Why the percentages are absolute

Every tier states a target as a fraction of the item's **original** listed
price, never "drop another 10% from wherever it is now."

That one decision is what makes the automation safe to leave running. A
duplicate cron fire, a retry, a redeploy that wipes local state — all of it
replays the same tier and lands on the same number. There is no path where the
ladder runs twice and the price falls twice.

It also means the read-only Google Sheet is a *feature*, not a limitation. The
sheet keeps the original price forever, so the anchor never drifts. (We have no
Sheets write credential anyway — see the root `CLAUDE.md`.)

### The floor

No tier can take a listing below:

```
max( STALE_ABSOLUTE_FLOOR , STALE_FLOOR_PCT × realistic sold value )
```

Defaults: `$8` and `50%`. When the floor overrides a tier, the dashboard and the
API both mark that row `floored` so you can see the ladder hit its limit rather
than silently flattening.

### Why it stops at 120 days

Past 120 days the discount ladder has done what discounting can do; cutting
further mostly donates margin. So `tier_liquidate` freezes the price and routes
the item to **human review** on the dashboard — lot-sale, donate, or keep is a
call worth a person making.

---

## Delivery channels

The engine decides; three separate channels do. They degrade independently, so
losing one doesn't stop markdowns.

### 1. CSV feed — always on, needs nothing

`GET /api/data/export?format=csv` now serves **ladder prices** in the `Price`
column, with the sheet's figure preserved in `OriginalPrice` and the tier named
in `StaleTier`. Vendoo already pulls this feed and maps `Price`, so markdowns
reach eBay, Poshmark, and Mercari on Vendoo's next sync with no marketplace
credentials of our own.

This is the channel that makes the whole thing work today. Add `?stale=false`
for raw sheet prices.

### 2. eBay Trading API — immediate, optional

Set `EBAY_OAUTH_TOKEN` and the ladder calls `ReviseFixedPriceItem` directly
against `everyday_hustle_clothing_co`, addressing listings by the item ID it
parses out of the sheet's existing **eBay Link** column — no new mapping to
maintain. Revising (rather than relisting) keeps each listing's watchers and
sales history.

Unset, every eBay call reports `skipped` and the CSV feed carries it instead.

### 3. Poshmark / Mercari queue — because no API exists

Neither marketplace offers a public write API. Poshmark has none at all;
Mercari's is closed to third parties. Any claim to "automatically edit Poshmark
listings" via API is a claim someone can't keep.

So the ladder does the deciding and hands off the doing. Each queue entry is a
fully-specified edit — target price, new title, banner — at
`GET /api/staleness/queue?status=open`. Close one with
`PATCH /api/staleness/queue` and it stays closed; later runs won't reopen work
you deliberately dismissed.

For Vendoo users this queue is a checklist and an audit trail, since channel 1
already delivers the same prices.

---

## Deploying it

1. **Set `CRON_SECRET`** in Vercel → Settings → Environment Variables
   (Production). Any long random string. *Until this exists the cron runs in
   preview mode and nothing changes.*
2. **Deploy.** Vercel reads `storefront/vercel.json` and registers the cron
   automatically.
3. **Confirm** at Vercel → your project → Cron Jobs.

Optional: add `EBAY_OAUTH_TOKEN` for immediate eBay writes. Tune
`STALE_ABSOLUTE_FLOOR`, `STALE_FLOOR_PCT`, `STALE_MAX_EDITS_PER_RUN` to taste.

> Vercel's Hobby plan allows one cron invocation per day. The 14:00 UTC daily
> schedule fits it. Faster cadence needs Pro — though for a 30-day ladder, daily
> is already far more resolution than the thresholds need.

---

## Watching it

- **`/dashboard`** — tier distribution across the catalogue, the exact repricing
  the next run will do, and the 120-day human-review pile. Always a dry run;
  loading the dashboard cannot move a price.
- **Preview by hand:** `curl https://<your-domain>/api/staleness/run?dry=true`
- **Force a run:**
  ```bash
  curl -X POST https://<your-domain>/api/staleness/run \
    -H "Authorization: Bearer $CRON_SECRET"
  ```
- **Run history** lands in the existing sync log under source `staleness`.

---

## Guardrails, in one place

| Guard | Does |
|---|---|
| Absolute targets | Replaying a tier can't compound a discount |
| Price floor | Hard dollar + margin-relative floor, whichever binds |
| `maxEditsPerRun` | Caps blast radius at 40 listings/run — a corrupted Timestamp column can't flip the catalogue to clearance overnight |
| Status filter | Sold / pending / archived items are never touched |
| 120-day stop | Ladder refuses to auto-discount forever |
| `CRON_SECRET` | Unauthenticated callers get a preview, never an edit |
| Ledger | Suppresses repeat edits for a SKU already at its tier price |

---

## Verifying the math

```bash
cd storefront && npm run verify:ladder
```

39 assertions over tier boundaries, floor precedence, idempotency under replay,
ledger suppression, the run cap, and per-marketplace title limits. All passing.

Live-sheet behaviour can't be exercised from the sandboxed dev environment —
its network policy blocks `docs.google.com` — so the harness runs against
fixtures shaped like real rows. The sheet fetch itself is the same code path the
existing inventory sync already uses in production.

---

## Known edges

- **The ledger is best-effort on Vercel.** Serverless filesystems don't persist,
  so the "already applied" suppression can be lost between deploys. Costs
  redundant no-op edits, never a double markdown — that's the absolute-targets
  property paying off. Point `STALE_LEDGER_PATH` at a mounted volume, or swap
  the two IO functions in `lib/staleness/ledger.ts` for a KV store, to make it
  durable.
- **Mercari has no link column** in the sheet, so every stale SKU queues a
  Mercari work item whether or not it's actually listed there. Adding a
  `Mercari Link` column and reading it in `sheets-fetcher.ts` would make this
  precise.
- **Age comes from the sheet's `Timestamp`**, which is the row's creation date.
  If a row is edited in a way that resets it, that item's clock restarts.

---

## Files

| Path | Role |
|---|---|
| `lib/staleness/config.ts` | Tier table, floors, marketplace list |
| `lib/staleness/engine.ts` | Pure decision: inventory + ledger → plan |
| `lib/staleness/content.ts` | Title/description rewriting, per-marketplace limits |
| `lib/staleness/ledger.ts` | What's already been applied |
| `lib/staleness/runner.ts` | Orchestration across the three channels |
| `lib/staleness/adapters/ebay.ts` | Trading API `ReviseFixedPriceItem` |
| `lib/staleness/adapters/queue.ts` | Poshmark/Mercari work queue |
| `lib/staleness/verify-ladder.ts` | The 39-assertion harness |
| `app/api/staleness/run/route.ts` | Cron entry point |
| `app/api/staleness/queue/route.ts` | Queue read/close |
| `vercel.json` | The schedule |
