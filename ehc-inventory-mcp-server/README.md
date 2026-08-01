# ehc-inventory-mcp-server

MCP server that connects this repo directly to the **EHC resale inventory
backend** — the Supabase database behind the Lovable "QuickFind Inventory"
project (the one built to look like "a high-end Shopify store"). It exposes
inventory browsing/management, marketplace cross-listing conflict detection,
the customer intake queue, and the published knowledge base as MCP tools.

## Why this exists

QuickFind Inventory already has a real, well-designed backend: inventory
items, images, marketplace listings with automatic sold/available conflict
detection, a customer intake pipeline, and an AI receptionist. Previously the
only way to touch that data was through Lovable's own tools. This server lets
Claude (or any MCP client) talk to that same Supabase project directly, so it
can become the shared inventory source of truth for other parts of this
repo (the storefront, eBay/Poshmark export tooling) without going through
Lovable at all.

## Setup

```bash
npm install
npm run build
```

Copy `.env.example` to `.env` (or set the equivalent MCP server env vars) and
fill in `SUPABASE_SERVICE_ROLE_KEY` to unlock staff tools:

```bash
cp .env.example .env
```

`SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` already default to the real
QuickFind Inventory project (`ygwgkoaoojkaabsieqpf`) inside the server — you
only need to set them if pointing this server at a different Supabase
project. `SUPABASE_SERVICE_ROLE_KEY` has no default and must be supplied:
get it from the Supabase dashboard for that project under
**Project Settings → API → service_role secret key**. Never commit it —
`.env` is gitignored, and it's not written anywhere in this repo.

This repo's `.mcp.json` already registers this server (`ehc-inventory`) for
Claude Code sessions opened here; add your service role key to that file's
`env` block locally (or via your MCP client's own env var config) rather than
committing it.

## Access model

Two Supabase clients, matched to the database's actual Row Level Security
policies:

- **Public client** (publishable/anon key, always available): read access to
  published inventory (`public_inventory` view), public marketplace listings,
  published knowledge articles — plus the ability to submit customer intake
  requests, exactly like the site's own "Sell to us" form and AI receptionist
  do. No secret required.
- **Admin client** (service role key, optional): bypasses RLS entirely.
  Required for every staff tool — creating/updating inventory, recording
  marketplace listings, reading or resolving the intake queue. Tools that
  need it return a clear, actionable error (not a crash) when it's missing.

## Tools

| Tool | Access | Purpose |
|---|---|---|
| `ehc_list_inventory` | public | Browse/search published inventory with filters |
| `ehc_get_inventory_item` | public | Fetch one item + images + marketplace listings |
| `ehc_create_inventory_item` | staff | Add a new inventory item |
| `ehc_update_inventory_item` | staff | Update status/price/visibility/notes |
| `ehc_add_inventory_image` | staff | Attach an image URL to an item |
| `ehc_upsert_marketplace_listing` | staff | Record/update an item's status on eBay/Poshmark/etc. |
| `ehc_list_marketplace_conflicts` | staff (full) / public (partial) | List listings flagged as conflicting with internal status — the double-sell early-warning report |
| `ehc_submit_intake_request` | public | Submit a sell-to-us / sourcing / question request |
| `ehc_list_intake_requests` | staff | Read the review queue |
| `ehc_update_intake_request` | staff | Resolve/update a queue entry |
| `ehc_list_knowledge_articles` | public | Read published FAQ/policy content |

## Why `ehc_list_marketplace_conflicts` matters

The schema already has a database trigger that flags a listing as
`conflict = true` whenever a marketplace (eBay, Poshmark, Mercari, Depop,
Facebook Marketplace, Vendoo) reports an item sold while the internal record
still shows it as available, pending, or needs verification. That's the
exact double-sell risk of cross-listing the same one-off item in multiple
places. Call `ehc_upsert_marketplace_listing` whenever a listing's status is
checked or changed elsewhere, and check `ehc_list_marketplace_conflicts`
periodically to catch it before a customer does.

## Development

```bash
npm run dev     # tsx watch, no build step
npm run build   # compile to dist/
npm start       # run the compiled server
```

## Known limitation in sandboxed dev environments

This server was built and verified (tool registration, schema validation,
and the missing-service-role-key error path all confirmed working) inside a
network-restricted development sandbox that blocks direct egress to
`*.supabase.co`. Live database calls were not exercised end-to-end there —
only the network policy blocked it, not the server code. It will reach the
real database normally wherever it actually runs with unrestricted internet
access (a local machine, a CI runner, or a less-restricted hosting
environment).
