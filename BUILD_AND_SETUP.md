# JayLeeFit Repo — Complete Build & Setup Guide

This repository contains **three distinct projects**. Choose which to build based on your needs.

---

## 📋 Project Overview

| Project | Purpose | Status | Link |
|---------|---------|--------|------|
| **JayLeeFit Coaching Website** | Client intake & lead capture for coaching | ✅ Complete | [Setup Instructions](./jayleefit-website/README.md) |
| **Old Light Storefront** (EHC) | Secondhand apparel resale platform | In Progress | [Setup Instructions](./storefront/README.md) |
| **Content Engine** | Social video content pipeline | In Progress | [Setup Instructions](./content-engine/README.md) |
| **Airtable Data Layer** | Coaching & inventory data system | ✅ Live | [Data Schema](./README.md) |

---

## 🚀 Quick Start by Project

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
**Use this to:** Resell pre-owned apparel with real-time inventory from Google Sheets.

```bash
cd storefront
npm install
cp .env.example .env.local
# Edit .env.local with your Google Sheet ID and Stripe keys
npm run dev
```

📖 **Full instructions:** [storefront/README.md](./storefront/README.md)

**What's included:**
- Product catalog + filtering
- Google Sheets inventory integration
- Stripe checkout
- Celestial/night-sky branding (moon phases)
- Real inventory tracking

**Environment variables needed:**
- `GOOGLE_SHEET_ID` — Your inventory sheet ID
- `GOOGLE_SHEET_NAME` — Tab name in the sheet
- `STRIPE_SECRET_KEY` — Stripe API key
- `STRIPE_WEBHOOK_SECRET` — For local testing

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

All three projects share a single source of truth:

```
Airtable "JayLeeFit Client Hub" (appN8QFsoWJ1fJhxC)
    ↓
    ├─→ JayLeeFit Coaching Website (reads intake, writes clients)
    ├─→ Telegram Bot Agent (Phase 2 — daily logging)
    ├─→ Client App (Phase 3 — full UX)
    └─→ Content Engine (pulls progress data for testimonials)

Google Sheet "EHC Inventory Log"
    ↓
    └─→ Old Light Storefront (reads products, displays catalog)
```

**Design principle:** One data source, many front doors. No spreadsheet drift.

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

2. **Choose your project and follow its README:**
   - Coaching website: `cd jayleefit-website && npm install`
   - Storefront: `cd storefront && npm install`
   - Content engine: `cd content-engine && npm install` (Python-based)

3. **Copy env template and configure:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

4. **Run dev server:**
   ```bash
   npm run dev  # for Next.js projects
   python -m main  # for content-engine (if applicable)
   ```

5. **Visit localhost:**
   - Coaching website: `http://localhost:3000`
   - Storefront: `http://localhost:3000`
   - Content engine: Check logs/outputs

---

## 🚢 Deployment

### JayLeeFit Website
**Recommended:** Vercel (zero-config Next.js host)
1. Connect GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy with one click
4. Point custom domain DNS at Vercel

### Old Light Storefront
**Recommended:** Vercel or similar (same as above)
- Real Stripe keys required for live payments
- Test keys for development

### Content Engine
**Deployment:** Depends on chosen host (n8n, Make, or custom Node/Python service)
- See `content-engine/ARCHITECTURE.md` for details

---

## 📝 Project-Specific Guides

| File | Content |
|------|---------|
| [./README.md](./README.md) | Airtable schema + coaching roadmap |
| [./CLAUDE_BUILD_INSTRUCTIONS.md](./CLAUDE_BUILD_INSTRUCTIONS.md) | JayLeeFit website build spec |
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
- **Coaching website:** `claude/jaylee-fit-website-build-*`
- **Storefront:** `claude/apparel-resale-storefront-*`
- **Content engine:** `claude/content-engine-*`

Always create PRs against `claude/fitness-airtable-client-data-g1iot3` (the true default branch, not `main`).

---

## 📞 Support

For questions on any project:
- **Coaching:** See [jayleefit-website/README.md](./jayleefit-website/README.md)
- **Storefront:** See [storefront/README.md](./storefront/README.md)
- **Content:** See [content-engine/README.md](./content-engine/README.md)
- **Data:** See root [README.md](./README.md)

Contact: jayleehustle.industries@gmail.com

---

**Last updated:** 2026-07-31  
**Maintained by:** Claude Code
