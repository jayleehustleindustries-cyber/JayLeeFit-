# Project TODO — JayLeeFit MAO Methodology Website

## Website Build
- [x] Download and re-host image assets from original JayLeeFit site (Coach Jay photos, gallery images)
- [x] Global theme: dark tactical aesthetic (near-black, signal red, Bebas Neue + JetBrains Mono)
- [x] Sticky navigation bar with smooth-scroll links: Services, Apply, Investment, Sample Split, AI Engine, Coach Jay, Proof, Gallery, Pay Invoice
- [x] Hero section with "MAO Methodology" branding, headline, CTAs exactly "Apply for a Package" and "Run AI Powered Engine"
- [x] Terminology section: 4 glossary cards (Founder, Operator, MAO, Swarm Ecosystem)
- [x] Services section: Fitness Plans, Personal Training, Hustle Coaching (description + feature list each)
- [x] 4-phase multi-step qualification form (collects prospect info; stores applications in DB)
- [x] Investment packages section: Foundation, Recomp, Legacy — pricing hidden until all 4 form phases completed
- [x] Pricing gate logic: unlock pricing only after form completion (state + sessionStorage persistence)
- [x] Sample weekly training split: tabbed MON–SUN day-by-day workout tables with coach notes (7 days, full lift prescriptions)
- [x] AI Engine section: 3-question diagnostic + deep blueprint generator → real LLM call → plan rendered on page
- [x] MAO Command Center section: 4 dashboard stat cards + accountability loop description
- [x] Coach Jay bio section with photo and background story
- [x] Proof / Gallery section (3 gallery images with lightbox; testimonial placeholder — no fabricated reviews)
- [x] Pay Invoice section: PayPal handle display + payment report form (name, email, amount, order ID, transaction ID) stored in DB
- [x] Backend: tRPC routers for applications (4 phases), AI plan generation, payment reports
- [x] Database schema: applications, payment_reports, ai_plans tables — migration applied
- [ ] Vitest tests for routers
- [x] Visual verification via screenshots (desktop + mobile)
- [ ] Save checkpoint and push to GitHub
- [ ] Set pricing env vars (FOUNDATION_PRICE, RECOMP_PRICE, LEGACY_PRICE)
- [ ] Instagram carousel post (6 slides) — MAO Methodology content

## Meta Ads Analysis
- [ ] Read meta-ads-analyzer skill
- [ ] Retrieve ad account, campaigns, and 30-day insights via Meta Marketing connector
- [ ] Analyze performance: winners, budget waste, root causes
- [ ] Write actionable report and deliver

## Scope Change (user request): Port build to Claude
- [x] Download original site image assets (Coach Jay photo + 3 gallery images) for the handoff package
- [x] Write complete build instruction document (site structure, all copy, exact CTA/nav labels, pricing-gate logic, AI Engine spec, DB schema, style direction)
- [x] Package assets + spec and deliver to user for handoff to Claude

## ManyChat / Meta Keyword-Trigger Automation (current request)
- [x] Check connected tools for ManyChat / Meta messaging automation access (no ManyChat connector; Instagram connector exists but disabled; ManyChat has no public flow-creation API)
- [x] Design keyword-trigger flows (APPLY, PLAN, SPLIT, HUSTLE, PAY) for comments/DMs
- [x] Deliver step-by-step setup playbook with all flow copy and compliance guardrails
- [ ] Deliver results and next steps to user
- [x] Vitest tests for routers (9 tests passing: application phases 1+4, aiEngine, payment.report)
