# JayLeeFit Repo — Complete Build & Setup Guide

This repository contains **four distinct projects**. Three are public-facing applications; one is a shared data infrastructure service.

---

## 📋 Project Overview

| Project | Purpose | Status | Link |
|---------|---------|--------|------|
| **EHC Data API** | Centralized data sync for inventory, images, eBay | ✅ Complete | [Setup Instructions](./data-api/README.md) |
| **JayLeeFit Coaching Website** | Client intake & lead capture for coaching | ✅ Complete | [Setup Instructions](./jayleefit-website/README.md) |
| **Old Light Storefront** (EHC) | Secondhand apparel resale platform | In Progress | [Setup Instructions](./storefront/README.md) |
| **Content Engine** | Social video content pipeline | In Progress | [Setup Instructions](./content-engine/README.md) |
| **Airtable Data Layer** | Coaching & inventory data system | ✅ Live | [Data Schema](./README.md) |

---

## 🚀 Quick Start by Project

### 0. EHC Data API (Infrastructure)
**Use this to:** Centralize data sync from Google Sheets, Google Drive, and eBay. Powers both Storefront and JayLeeFit with fresh inventory data.

```bash
cd data-api
npm install
cp .env.example .env.local
# Edit .env.local with Google Sheets/Drive IDs and credentials
npm run dev
```

📖 **Full instructions:** [data-api/README.md](./data-api/README.md)

**What's included:**
- Live sync from EHC Inventory Log (Google Sheets CSV)
- REST API for inventory queries (`/api/inventory`)
- Sync monitoring dashboard (`/dashboard`)
- Logs and state tracking (`/api/sync`)

**Environment variables needed:**
- `EHC_SHEET_ID` — EHC Inventory Log sheet ID
- `GOOGLE_DRIVE_FOLDER_ID` — EHC-IMPORT-INVENTORY folder
- `GOOGLE_SHEETS_API_KEY` — Google API key (for public sheet access)

**Runs on:** `http://localhost:3001`

---

### 1. JayLeeFit Coaching Website
**Use this to:** Build a professional intake funnel for fitness coaching clients.

```bash
cd jayleefit-website
npm install
cp .env.example .env.local
# Edit .env.local with your Airtable credentials
npm run dev
```

📖 **Full instructions:** [jayleefit-website/README.md](./jayleefit-website/README.md)  
📋 **Build spec:** [CLAUDE_BUILD_INSTRUCTIONS.md](./CLAUDE_BUILD_INSTRUCTIONS.md)

**What's included:**
- Landing page + methodology showcase
- Intake form with Airtable integration
- Success confirmation page
- Responsive dark theme (gold accents)

**Environment variables needed:**
- `AIRTABLE_API_TOKEN` — Airtable personal access token
- `AIRTABLE_BASE_ID` — JayLeeFit Client Hub base ID
- `AIRTABLE_CLIENTS_TABLE` — Table name (default: "Clients")

---

### 2. Old Light Storefront (EHC)
**Use this to:** Control all inventory from one place, sync to eBay/Facebook/Vendoo with your own API keys.

```bash
cd storefront
npm install
cp .env.example .env.local
# Edit .env.local with your Google Sheets API key and Stripe keys
npm run dev
```

📖 **Full instructions:** [storefront/README.md](./storefront/README.md)

**What's included:**
- Product catalog + filtering (reads from EHC Inventory Log)
- Integrated data sync from Google Sheets (on-demand or manual)
- Sync monitoring dashboard at `/dashboard`
- Data export API (`/api/data/export`) for Vendoo/marketplace syncs
- Stripe checkout
- Celestial/night-sky branding (moon phases)
- Real inventory tracking

**Environment variables needed:**
- `EHC_SHEET_ID` — EHC Inventory Log sheet ID (comes pre-filled)
- `GOOGLE_SHEETS_API_KEY` — Google API key for public sheet access
- `STRIPE_SECRET_KEY` — Stripe API key
- `STRIPE_WEBHOOK_SECRET` — For local webhook testing

**Multi-marketplace workflow:**
1. Edit inventory in EHC Inventory Log (Google Sheet)
2. Hit `/api/data/sync` or visit `/dashboard` → "Trigger Sync Now"
3. Storefront updates automatically
4. Export to Vendoo via `/api/data/export` (your Vendoo account syncs to eBay, Facebook, etc.)
5. You control all API keys — nothing goes through our system

---

### 3. Content Engine
**Use this to:** Generate and manage social media video content for fitness marketing.

📖 **Full instructions:** [content-engine/README.md](./content-engine/README.md)  
📋 **Architecture guide:** [content-engine/ARCHITECTURE.md](./content-engine/ARCHITECTURE.md)

**What's included:**
- Video prompt generation pipeline
- Multi-agent workflow for content production
- Integration with Higgsfield (video generation)
- Operational briefs for content roles

---

## 🔗 System Architecture

Multiple data sources feed into centralized services:

```
Airtable "JayLeeFit Client Hub"          Google Sheet "EHC Inventory Log"
    ↓                                           ↓
    │                                           │
    │    ┌─────────────────────────────────────┘
    │    │
    ├─→ JayLeeFit Coaching Website       EHC Data API (Central Hub)
    │                                         ├─→ /api/inventory
    ├─→ Content Engine                       ├─→ /api/sync
    │                                         └─→ /dashboard
    └─→ Telegram Bot (Phase 2)

    Google Drive (EHC-IMPORT-INVENTORY)
         ↓
    EHC Data API (pulls images)

    eBay Listings
         ↓
    EHC Data API (syncs inventory status)
```

**Design principles:**
- Coaching system (Airtable) → JayLeeFit ecosystem
- Inventory system (Google Sheets + Drive + eBay) → EHC Data API → Storefront & JayLeeFit
- One data source per domain, many front doors. No data drift.

---

## 📊 Data Layers

### Airtable Base: JayLeeFit Client Hub

| Table | Purpose | Key Fields |
|-------|---------|------------|
| **Clients** | Client profiles | Name, Email, Goals, Status |
| **Workouts** | Training sessions | Date, Exercises, Sets, Reps |
| **Nutrition Plans** | Macro targets | Protein/Carbs/Fat (g), Total Kcal, P/F/C % |
| **Progress Tracking** | Body metrics | Weight, Measurements, Progress Photos |
| **Check-ins** | Accountability | Date, Adherence, Notes |

Base ID: `appN8QFsoWJ1fJhxC`

### Google Sheet: EHC Inventory Log

Real inventory with 70+ rows of pre-owned apparel:
- SKU, Brand, Condition, Pricing
- eBay comps, listing photos
- Inventory status tracking

Used by: Old Light Storefront (CSV export)

---

## 🛠️ Development Setup

### Prerequisites
- **Node.js 18+** and npm
- **Git** (to clone)
- **Airtable account** (free tier OK)
- **Google account** (for Sheets API)
- **Stripe account** (for storefront payments — optional for dev)

### Initial Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/jayleehustleindustries-cyber/JayLeeFit-.git
   cd JayLeeFit-
   ```

2. **Start the Data API first** (provides data to other services)
   ```bash
   cd data-api
   npm install
   cp .env.example .env.local
   # Edit .env.local with Google Sheets/Drive credentials
   npm run dev
   # Runs on http://localhost:3001
   ```

3. **In separate terminals, start your other services:**
   ```bash
   # Terminal 2: JayLeeFit Coaching Website
   cd jayleefit-website && npm install && npm run dev
   # http://localhost:3000

   # Terminal 3: Storefront
   cd storefront && npm install && npm run dev
   # http://localhost:3000 (note: requires port config or different port)

   # Terminal 4: Content Engine
   cd content-engine && npm install && npm run dev
   ```

4. **Point Storefront/JayLeeFit to the Data API:**
   Update their `.env.local` files with:
   ```
   NEXT_PUBLIC_DATA_API_URL=http://localhost:3001
   ```

5. **Visit localhost:**
   - Data API: `http://localhost:3001` + dashboard at `/dashboard`
   - Coaching website: `http://localhost:3000` (or `:3002`)
   - Storefront: `http://localhost:3000` (or `:3003`)
   - Content engine: Check logs/outputs

---

## 🚢 Deployment

### 1. EHC Data API (Deploy First)
**Recommended:** Vercel (runs on separate port/domain from other services)
1. Create new Vercel project for `data-api/`
2. Set environment variables (Google Sheets ID, Drive folder ID, etc.)
3. Deploy to production
4. Record the deployment URL (e.g., `https://data-api.vercel.app`)
5. Update Storefront/JayLeeFit to point to this URL

### 2. JayLeeFit Website
**Recommended:** Vercel (zero-config Next.js host)
1. Connect GitHub repo to Vercel
2. Set environment variables (`AIRTABLE_API_TOKEN`, `AIRTABLE_BASE_ID`, `NEXT_PUBLIC_DATA_API_URL`)
3. Deploy with one click
4. Point custom domain DNS at Vercel

### 3. Old Light Storefront
**Recommended:** Vercel or similar
- Point `NEXT_PUBLIC_DATA_API_URL` to your deployed Data API
- Real Stripe keys required for live payments
- Test keys for development

### 4. Content Engine
**Deployment:** Depends on chosen host (n8n, Make, or custom Node/Python service)
- See `content-engine/ARCHITECTURE.md` for details

**Important:** Deploy the Data API before Storefront or JayLeeFit so they can reach it during initialization.

---

## 📝 Project-Specific Guides

| File | Content |
|------|---------|
| [./README.md](./README.md) | Airtable schema + coaching roadmap |
| [./CLAUDE_BUILD_INSTRUCTIONS.md](./CLAUDE_BUILD_INSTRUCTIONS.md) | JayLeeFit website build spec |
| [./data-api/README.md](./data-api/README.md) | Data API setup, endpoints, integration |
| [./jayleefit-website/README.md](./jayleefit-website/README.md) | Website setup + deployment |
| [./storefront/README.md](./storefront/README.md) | Storefront setup + Google Sheets integration |
| [./storefront/lib/asset-pipeline/README.md](./storefront/lib/asset-pipeline/README.md) | Image generation pipeline (stage 1) |
| [./content-engine/README.md](./content-engine/README.md) | Content pipeline overview |
| [./content-engine/ARCHITECTURE.md](./content-engine/ARCHITECTURE.md) | Multi-agent system design |
| [./docs/marketing-sop.md](./docs/marketing-sop.md) | Marketing strategy & content positioning |

---

## ✅ Verification Checklist

Before shipping any project:

- [ ] Runs locally without errors (`npm install`, `npm run dev`)
- [ ] TypeScript compiles cleanly
- [ ] All environment variables documented in `.env.example`
- [ ] API integrations tested (Airtable, Google, Stripe, etc.)
- [ ] Responsive design verified on mobile
- [ ] Error handling displays user-friendly messages
- [ ] Security: no hardcoded keys, no XSS/SQL injection vulnerabilities

---

## 🤝 Contributing

All work happens on feature branches:
- **Data API:** `claude/data-api-*`
- **Coaching website:** `claude/jaylee-fit-website-build-*`
- **Storefront:** `claude/apparel-resale-storefront-*`
- **Content engine:** `claude/content-engine-*`

Always create PRs against `claude/fitness-airtable-client-data-g1iot3` (the true default branch, not `main`).

---

## 📞 Support

For questions on any project:
- **Data API:** See [data-api/README.md](./data-api/README.md) — API endpoints, environment setup, troubleshooting
- **Coaching:** See [jayleefit-website/README.md](./jayleefit-website/README.md)
- **Storefront:** See [storefront/README.md](./storefront/README.md)
- **Content:** See [content-engine/README.md](./content-engine/README.md)
- **Airtable Schema:** See root [README.md](./README.md)

Contact: jayleehustle.industries@gmail.com

---

**Last updated:** 2026-07-31  
**Maintained by:** Claude Code
