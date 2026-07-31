# MAO Methodology — Single-Page Fitness Coaching Website
## Complete Build Specification for Claude (or any AI coding assistant)

**Client:** Jordan Lee ("Coach Jay") — JayLee Fit / JayLee Hustle Industries LLC, Hot Springs, Arkansas
**Source of truth:** This document. Copy is captured verbatim from the client's original site (jayleefit-rmz52gzf.manus.space) where noted as "(verbatim)"; all remaining copy has been finalized in this spec and must be implemented exactly as written.
**Deliverable:** One single-page website (plus minimal backend) that takes a prospect from discovery → qualification → gated pricing → payment in one seamless scroll.

---

## 1. Project Overview & Hard Requirements

Build a **single-page** site with smooth-scroll anchor navigation. These constraints are non-negotiable:

| # | Constraint |
|---|---|
| 1 | The brand name **"MAO Methodology"** must appear prominently in the hero section. |
| 2 | Hero CTA button labels must read **exactly**: `Apply for a Package` and `Run AI Powered Engine`. |
| 3 | Investment pricing must be **strictly hidden** until all four qualification form phases are completed. Do not render prices in the DOM, in JS bundles as plaintext next to tier names, or at any earlier step. Reveal only after Phase 4 submits successfully. |
| 4 | The AI Engine must **actually call an LLM** server-side and return a generated training plan to the user on the same page. No canned/mock responses. |
| 5 | The Pay Invoice form must capture all five fields: **name, email, amount, order ID, transaction ID**. |
| 6 | Nav link labels must match exactly: `Services, Apply, Investment, Sample Split, AI Engine, Coach Jay, Proof, Gallery, Pay Invoice`. |
| 7 | **Never fabricate testimonials.** The Proof section ships with an empty/placeholder state until the client supplies verified client quotes (see §Section 8). |

### Recommended tech stack

Any modern stack works. Recommended: **React + Vite + Tailwind CSS** frontend with a small **Node/Express (or Next.js API routes / serverless)** backend that provides: (a) an LLM proxy endpoint for the AI Engine (keep the API key server-side), and (b) endpoints to persist application-form and payment-report submissions (SQLite/Postgres/MySQL — anything durable). If a database is unavailable, fall back to emailing submissions or writing to a hosted form service — but persistence of form submissions is expected.

### Backend data model (suggested schema)

```sql
-- Qualification applications (4-phase form)
CREATE TABLE applications (
  id            INTEGER PRIMARY KEY AUTO_INCREMENT,
  email         VARCHAR(320) NOT NULL,
  full_name     VARCHAR(160),
  phase1_json   TEXT,          -- contact & identity answers
  phase2_json   TEXT,          -- goals & training history answers
  phase3_json   TEXT,          -- commitment & logistics answers
  phase4_json   TEXT,          -- readiness & agreement answers
  completed_at  DATETIME,      -- set only when phase 4 submits; gate pricing on this
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- AI Engine intake + generated plans
CREATE TABLE ai_plans (
  id            INTEGER PRIMARY KEY AUTO_INCREMENT,
  name          VARCHAR(160),
  goals         TEXT NOT NULL,
  fitness_level VARCHAR(32) NOT NULL,   -- Beginner | Intermediate | Advanced
  availability  VARCHAR(160) NOT NULL,
  focus_area    VARCHAR(160),
  limitations   TEXT,
  plan_output   MEDIUMTEXT,             -- LLM-generated plan (markdown)
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Payment self-reports
CREATE TABLE payment_reports (
  id             INTEGER PRIMARY KEY AUTO_INCREMENT,
  name           VARCHAR(160) NOT NULL,
  email          VARCHAR(320) NOT NULL,
  method         VARCHAR(32) DEFAULT 'PayPal',
  amount         DECIMAL(10,2) NOT NULL,
  order_id       VARCHAR(64) NOT NULL,
  transaction_id VARCHAR(64) NOT NULL,
  note           TEXT,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Pricing-gate logic (critical)

1. The Investment section always renders the three tier cards, but the price element shows `[PRICING HIDDEN] — REVEALED AFTER QUALIFICATION` until unlocked.
2. Unlock condition: the visitor completes **all four phases** of the Apply form in the current session. On the Phase 4 success response, set client state (e.g., React state + `sessionStorage.maoQualified = "true"`) and re-render the Investment section with prices visible.
3. Serve actual price values **from the backend only after phase-4 completion** (e.g., the phase-4 submit response returns the price table). Do not ship prices in the static JS bundle.
4. The client has not finalized public pricing. Implement prices as backend config (env vars or a `pricing` table) with placeholder values, e.g. `FOUNDATION_PRICE`, `RECOMP_PRICE`, `LEGACY_PRICE`, so Coach Jay can set real numbers without a code change.

---

## 2. Style Direction

No fixed brand kit exists; the designer has latitude. Direction that matches the brand voice: **dark, high-contrast, industrial/tactical "operator" aesthetic** — near-black backgrounds (#0A0A0B range), one aggressive accent (signal red `#E11D2E` or safety orange), stark white display type. Typography: a condensed uppercase display face for headers (e.g., Archivo Expanded/Black, Anton, or Bebas Neue) paired with a mono or grotesk for body/labels (e.g., JetBrains Mono, IBM Plex Mono, Inter). Use section index labels (`01 / SERVICES`, `02 / APPLY`…) as a recurring motif, thin rule lines, scanline/grain textures, and terminal-style `//` separators — the original site used labels like `MAO // INTAKE AGENT` and `OUTPUT // AI POWERED ENGINE`. Motion: fast (<300ms), snappy ease-out reveals; no bouncy or playful easing. The overall feel is a classified dossier / command console, not a wellness brand.

Accessibility: maintain WCAG AA contrast, visible focus rings, semantic headings (one `h1` in the hero), and `prefers-reduced-motion` support.

---

## 3. Global Layout & Navigation

Sticky top nav, left brand mark `JAYLEE FIT`, right link row (smooth-scroll to section anchors) in this exact order and casing:

`SERVICES · APPLY · INVESTMENT · SAMPLE SPLIT · AI ENGINE · COACH JAY · PROOF · GALLERY · PAY INVOICE`

plus a highlighted `APPLY` button at the far right. On mobile, collapse to a full-screen overlay menu. Anchor IDs: `#services #apply #investment sample-split → #sample-split #ai-engine #coach-jay #proof #gallery #pay-invoice`. Use scroll-margin-top so the sticky nav never covers section headers. Nav shows an active-section indicator (scroll-spy).

Section order down the page: Hero → Terminology → Services → Apply (4-phase form) → Investment → Sample Split → AI Engine → Command Center → Coach Jay → Proof → Gallery → Pay Invoice → Footer.

---

## 4. Section-by-Section Specification (with verbatim copy)

### Section 0 — Hero / Landing

Kicker line: `JAYLEE FIT ·· EST. JAYLEE HUSTLE INDUSTRIES LLC`

Headline treatment must feature **MAO Methodology** prominently — e.g., giant `MAO` monogram with `MAO METHODOLOGY / JAYLEE HUSTLE INDUSTRIES` lockup.

Body copy (verbatim):

> JayLee Hustle Industries utilizes the proprietary MAO (Massive Action Orientation) Framework—an elite triad of physical conditioning, neural optimization, and strict accountability engineered exclusively for high-output founders and career professionals.
>
> Adaptation is the game. 12-week specialized programs for your body's purpose: athletic performance, fat loss, functional strength, metabolic efficiency. AI engine. Human coach. By application only.

Two CTAs with exact labels: **`APPLY FOR A PACKAGE`** (primary, scrolls to `#apply`) and **`RUN AI POWERED ENGINE`** (secondary/outline, scrolls to `#ai-engine`). Add a subtle `SCROLL` indicator at the bottom.

### Section 0b — Proprietary Terminology (`00 / TERMINOLOGY`)

Heading: `PROPRIETARY TERMINOLOGY`. Intro: "Three terms you must understand before you read another line on this site. Everything else inherits from these."

Four glossary cards (verbatim):

| Code | Term | Definition |
|---|---|---|
| G/00 | FOUNDER — MEET COACH JAY | Founder of JayLee Hustle Industries. Author of the MAO Framework. Coach to the Operators on this platform — every protocol on this site comes from his system, not a textbook. Coach Jay built the MAO Framework in the field — not in a classroom. Every Operator on the roster is coached against the same standard he holds himself to. Adaptation is the game. |
| G/01 | OPERATOR | A high-output founder, executive, or career professional whose physical conditioning is the lever that compounds every other system in their life. We do not coach hobbyists. We coach Operators. |
| G/02 | MAO (MASSIVE ACTION ORIENTATION) | The proprietary JayLee framework: a triad of physical conditioning, neural optimization, and strict accountability. Every protocol is engineered to compound across all three planes simultaneously — not in isolation. |
| G/03 | SWARM ECOSYSTEM | The 12-agent intelligence layer that surrounds every Operator on the roster: Strategist, Fitness Architect, Telegram Coach, Email Worker, Audit Logger, Notification Router, and the rest of the swarm. Always-on, always learning, never off-shift. |

### Section 1 — Services (`01 / SERVICES`, anchor `#services`)

Heading: `THE OFFER`. Three service cards (verbatim):

**S/01 — FITNESS PLANS.** "Programmed 12-week body recomposition blocks. Progressive overload, conditioning, mobility, nutrition guardrails — engineered around your life." Features: `CUSTOM SPLIT + LIFT PROGRESSIONS` · `WEEKLY CHECK-INS & AUDITS` · `NUTRITION GUARDRAILS`.

**S/02 — PERSONAL TRAINING.** "1:1 sessions and remote coaching with the JayLee Hustle Industries standard — every rep logged, every session reviewed." Features: `LIVE OR REMOTE SESSIONS` · `FORM AUDITS + VIDEO REVIEW` · `ACCOUNTABILITY LOOP`.

**S/03 — HUSTLE COACHING.** "Mindset, discipline, and operating systems for athletes, founders, and grinders. Train the body, sharpen the operator." Features: `DAILY OPS + DISCIPLINE FRAMEWORK` · `QUARTERLY OBJECTIVE SETTING` · `MENTAL CONDITIONING`.

### Section 2 — Apply: 4-Phase Qualification Form (`02B / OPERATOR ADMISSION`, anchor `#apply`)

Heading: `4-PHASE STRICT QUALIFICATION`. Intro copy (verbatim):

> Operator Admission is for committed founders and high-output professionals. The form below is intentionally rigorous — it is the velvet rope between curiosity and the MAO Swarm Ecosystem. Investment details are revealed after qualification.

Status line: `PHASE 1 OF 4 · ALL APPLICATIONS REVIEWED BY COACH JAY WITHIN 48 HOURS.` (update the phase number as the user advances).

A stepper shows `PHASE 1 / PHASE 2 / PHASE 3 / PHASE 4` with completed/active states. Each phase submits to the backend (partial saves keyed by email) and advances with a `NEXT PHASE` button; the final phase's button reads `COMPLETE QUALIFICATION`.

The original site only exposed Phase 1's first field (`EMAIL *`). All remaining fields are finalized below — implement them exactly as written. Fields marked `*` are required.

**PHASE 1 — IDENTITY** (subtitle: `WHO IS APPLYING?`)

| Field label | Type | Helper text / options |
|---|---|---|
| `EMAIL *` | email | "We'll use this email to contact you with your qualification results and next steps." (verbatim) |
| `FULL NAME *` | text | "First and last. Coach Jay reviews every application personally." |
| `PHONE` | tel (optional) | "Optional — for faster scheduling once you're approved." |
| `LOCATION / TIMEZONE *` | text | "City, state, timezone. Check-ins and Zoom calls are scheduled around it." |

**PHASE 2 — MISSION PROFILE** (subtitle: `WHAT ARE WE BUILDING?`)

| Field label | Type | Helper text / options |
|---|---|---|
| `YOUR SINGLE MOST IMPORTANT 12-WEEK GOAL *` | textarea | "One goal. Be specific. 'Get in shape' is not a mission." |
| `CURRENT TRAINING FREQUENCY *` | select | `NOT TRAINING RIGHT NOW` / `1–2 DAYS PER WEEK` / `3–4 DAYS PER WEEK` / `5+ DAYS PER WEEK` |
| `TRAINING HISTORY *` | select | `NEW TO STRUCTURED TRAINING` / `1–3 YEARS` / `3–10 YEARS` / `10+ YEARS` |
| `CURRENT STATS` | text (optional) | "Height, weight, and body fat % if you know it. Estimates are fine." |

**PHASE 3 — LOGISTICS & COMMITMENT** (subtitle: `CAN YOU EXECUTE?`)

| Field label | Type | Helper text / options |
|---|---|---|
| `HOURS PER WEEK YOU CAN TRAIN *` | select | `2–3 HOURS` / `4–6 HOURS` / `7–9 HOURS` / `10+ HOURS` |
| `EQUIPMENT ACCESS *` | select | `FULL GYM` / `HOME SETUP (DUMBBELLS / BANDS)` / `BODYWEIGHT ONLY` / `GYM + HOME` |
| `YOUR BIGGEST OBSTACLE *` | textarea | "What has killed your consistency before? Coach Jay programs around it — but only if you name it." |
| `WILL YOU LOG WORKOUTS AND MEALS DAILY? *` | radio | `YES — EVERY DAY` / `NO` — helper: "The Accountability Loop only works if you feed it. 'No' does not disqualify you, but say it now." |

**PHASE 4 — READINESS** (subtitle: `FINAL GATE.`)

| Field label | Type | Helper text / options |
|---|---|---|
| `WHY NOW? *` | textarea | "What changed? Why is this the 12-week block where it actually happens?" |
| `PREFERRED START WINDOW *` | select | `IMMEDIATELY` / `WITHIN 2 WEEKS` / `WITHIN 30 DAYS` / `JUST SCOUTING` |
| `INVESTMENT ACKNOWLEDGMENT *` | checkbox | "I understand MAO packages are premium coaching investments, not subscriptions, and pricing is revealed after qualification." |
| `REVIEW AGREEMENT *` | checkbox | "I understand Coach Jay personally reviews every application and responds within 48 hours." |

Validation: required fields enforced per phase; email format validated; no phase can be skipped. **On Phase 4 success:** show a confirmation state ("Application received. Coach Jay reviews every application within 48 hours."), set the qualification flag, unlock Investment pricing, and smooth-scroll or link the user to `#investment`.

Also include the "velvet rope" panel copy (verbatim) somewhere in this section:

> VELVET ROPE // PROTOCOL — No discount codes. No "buy now" buttons. Pricing is revealed by application only. Coach Jay personally reviews every transcript. Qualified operators get a 24h reply.

### Section 3 — Investment Packages (`02 / INVESTMENT`, anchor `#investment`)

Heading: `INVESTMENT PACKAGES`. Intro (verbatim):

> You are not buying a product. You are investing in a transformation engineered on the MAO methodology — Hustle First, Recomp over Vanity, Consistency over Intensity, Accountability Loop.

Gate banner while locked: `PRICING IS REVEALED ONLY TO QUALIFIED OPERATORS. RUN INTAKE FIRST OR APPLY DIRECTLY.` Locked price element: `[PRICING HIDDEN] / REVEALED AFTER QUALIFICATION`.

Three tier cards (verbatim copy):

**INV/01 — FOUNDATION.** "Entry tier for committed operators. Weekly programming restructures + monthly Zoom call with Coach Jay. Custom 12-week recomposition block with ongoing adjustments." Features: Custom 12-week recomposition block · Weekly programming restructures · Monthly Zoom call with Coach Jay · Nutrition guardrails + macro plan · Async messaging Mon–Fri · AI Powered Engine retunes after week 4 + 8. CTA: `APPLY FOR FOUNDATION`.

**INV/02 — RECOMP** (badge: `FLAGSHIP`). "The flagship transformation. Weekly programming restructures + weekly Zoom calls with Coach Jay. Full body recomposition, form audits, direct line to Coach Jay. Built for the prospect who is done starting over." Features: Everything in FOUNDATION · Weekly programming restructures · Weekly Zoom call with Coach Jay · Weekly 1:1 form audit · Custom recovery + sleep protocol · Direct text access (12hr response) · Full body recomposition focus. CTA: `APPLY FOR RECOMP`.

**INV/03 — LEGACY.** "Premium tier for high-performing operators. Twice-weekly programming restructures + Zoom calls. Full body recomposition, intensive coaching, direct line to Coach Jay. By application only." Features: Everything in RECOMP · Twice-weekly programming restructures · Twice-weekly Zoom calls with Coach Jay · Intensive form audits + video review · Priority on every channel (4hr response) · Custom recovery + sleep protocol · Direct text access (24/7) · Quarterly in-person intensive*. CTA: `APPLY FOR LEGACY`.

Footnote (verbatim): `* IN-PERSON INTENSIVES SUBJECT TO COACH AVAILABILITY AND SCHEDULING. ALL PACKAGES BY APPLICATION VIA THE MAO INTAKE AGENT.`

Tier CTAs scroll to `#apply` while locked; after unlock they may pre-select the tier in the application context or link to Pay Invoice guidance.

### Section 4 — Sample Weekly Training Split (`04 / SAMPLE SPLIT`, anchor `#sample-split`)

Heading: `COACH JAY'S REAL TRAINING WEEK`. Intro (verbatim):

> This is Jordan's actual weekly split. Your custom MAO program will be built to the same standard — personalized to your goals, schedule, and equipment. Home-based or gym — the system adapts.

Sub-line: `TAP A DAY TO SEE THE PRESCRIPTION. COACH'S NOTES INCLUDED ON EVERY LIFT.`

Tabbed navigation `MON TUE WED THU FRI SAT SUN`. Each tab shows a day header (e.g., `DAY 1 · MON — UPPER BODY — PUSH`, muscle groups, lift count) and a table with columns `EXERCISE | SETS | REPS | REST | COACH'S NOTE`.

**Monday's table is captured verbatim from the original site and must be reproduced exactly:**

`DAY 1 · MON — UPPER BODY — PUSH` (Chest, Shoulders, Triceps — 8 LIFTS)

| Exercise | Sets | Reps | Rest | Coach's Note |
|---|---|---|---|---|
| Barbell Bench Press | 4 | 6–8 | 2 min | Primary strength movement — control the descent, 2 sec down |
| Incline Dumbbell Press | 4 | 10–12 | 90s | Feel the upper chest stretch at the bottom of every rep |
| Cable Chest Fly | 3 | 12–15 | 60s | Full stretch and squeeze — don't rush these |
| Overhead Dumbbell Press | 4 | 10–12 | 90s | Keep core braced, don't arch the lower back |
| Cable Lateral Raises | 4 | 15–20 | 45s | Light weight, full range — these build width |
| Rear Delt Cable Fly | 3 | 15 | 45s | Elbows slightly bent, lead with the elbows |
| Tricep Rope Pushdowns | 4 | 12–15 | 60s | Squeeze hard at the bottom, full extension |
| Overhead Tricep Extension | 3 | 12 | 60s | Long head emphasis — keep elbows tight |

TUE–SUN were not captured from the original site; the following authored days are finalized spec — implement them exactly as written. Mark the whole section visually as a *sample*: the real program is custom. (The client may later replace these with his actual week; see §7.)

`DAY 2 · TUE — LOWER BODY — SQUAT` (Quads, Glutes, Hamstrings — 7 LIFTS)

| Exercise | Sets | Reps | Rest | Coach's Note |
|---|---|---|---|---|
| Barbell Back Squat | 4 | 5–6 | 2.5 min | Top strength slot of the week — brace hard, hit depth, drive through mid-foot |
| Romanian Deadlift | 4 | 8–10 | 2 min | Push the hips back, bar stays on the thighs — feel the hamstrings load |
| Walking Lunges | 3 | 12/leg | 90s | Long strides, torso tall — control the knee, no wobble |
| Leg Press | 3 | 12–15 | 90s | Full range without the lower back rolling off the pad |
| Seated Leg Curl | 3 | 12–15 | 60s | Squeeze a full second at the bottom of every rep |
| Standing Calf Raise | 4 | 15–20 | 45s | Pause at the stretch, explode up — no bouncing |
| Hanging Knee Raise | 3 | 12–15 | 60s | Slow and controlled — no swinging, exhale at the top |

`DAY 3 · WED — UPPER BODY — PULL` (Back, Rear Delts, Biceps — 7 LIFTS)

| Exercise | Sets | Reps | Rest | Coach's Note |
|---|---|---|---|---|
| Weighted Pull-Ups | 4 | 6–8 | 2 min | Dead hang to chest-to-bar intent — add load only when all reps are clean |
| Barbell Row | 4 | 8–10 | 2 min | Hinge at 45 degrees, pull to the lower ribs — no torso heave |
| Lat Pulldown | 3 | 10–12 | 90s | Drive the elbows down, chest up — let the lats do the work |
| Chest-Supported Row | 3 | 12 | 90s | Chest glued to the pad kills the momentum — strict reps only |
| Face Pulls | 3 | 15–20 | 45s | Rope to the forehead, thumbs back — this is shoulder insurance |
| Barbell Curl | 3 | 10–12 | 60s | Elbows pinned to your sides — no swinging the weight up |
| Hammer Curl | 3 | 12 | 60s | Neutral grip, slow negative — builds the forearm and brachialis |

`DAY 4 · THU — CONDITIONING + CORE` (Engine, Trunk — 6 BLOCKS)

| Exercise | Sets | Reps | Rest | Coach's Note |
|---|---|---|---|---|
| Rower or Bike Intervals | 6 | 60s hard / 90s easy | — | Hard means hard — the last two intervals should be a negotiation |
| Kettlebell Swings | 4 | 20 | 60s | Snap the hips, arms are just hooks — power comes from the hinge |
| Farmer's Carry | 4 | 40m | 90s | Heavy. Shoulders packed, walk tall — grip and trunk under load |
| Plank | 3 | 60s | 45s | Squeeze glutes and abs — a plank is a full-body contraction, not a rest |
| Pallof Press | 3 | 12/side | 45s | Resist the rotation — slow press out, slow return |
| Ab Wheel Rollout | 3 | 8–12 | 60s | Only roll as far as you can keep the lower back flat |

`DAY 5 · FRI — LOWER BODY — HINGE` (Posterior Chain, Glutes — 7 LIFTS)

| Exercise | Sets | Reps | Rest | Coach's Note |
|---|---|---|---|---|
| Trap Bar Deadlift | 4 | 5–6 | 2.5 min | Second strength slot — wedge in tight, push the floor away |
| Front Squat | 3 | 8 | 2 min | Elbows high, torso vertical — quads and upper back earn their pay |
| Hip Thrust | 4 | 10–12 | 90s | Full lockout with a one-second squeeze — chin tucked, ribs down |
| Bulgarian Split Squat | 3 | 10/leg | 90s | The one everybody skips — that's exactly why we do it |
| Back Extension | 3 | 12–15 | 60s | Squeeze glutes at the top, don't hyperextend the spine |
| Seated Calf Raise | 4 | 15–20 | 45s | Different angle than Tuesday — pause every rep at the stretch |
| Weighted Decline Sit-Up | 3 | 12–15 | 60s | Control down, drive up — add load before adding reps |

`DAY 6 · SAT — FULL BODY — OPERATOR CIRCUIT` (Total Body, Engine — 5 ROUNDS)

| Exercise | Sets | Reps | Rest | Coach's Note |
|---|---|---|---|---|
| Dumbbell Thrusters | 5 | 12 | Circuit | Squat to press in one motion — breathe at the top, keep moving |
| Renegade Rows | 5 | 8/side | Circuit | Hips square to the floor — the anti-rotation is the exercise |
| Push-Ups | 5 | 15–20 | Circuit | Chest to the floor, full lockout — quality doesn't drop with fatigue |
| Goblet Reverse Lunge | 5 | 10/leg | Circuit | Bell tight to the chest, knee kisses the floor — stay tall |
| Sled Push or Hill Sprint | 5 | 20m / 15s | 2 min between rounds | Finish the round with intent — this is where the week is won |

`DAY 7 · SUN — ACTIVE RECOVERY — RESET` (Recovery, Mobility — 5 BLOCKS)

| Exercise | Sets | Reps | Rest | Coach's Note |
|---|---|---|---|---|
| Zone 2 Walk (outdoor) | 1 | 45–60 min | — | Conversational pace, phone on do-not-disturb — this is thinking time |
| Couch Stretch | 2 | 90s/side | — | Hip flexors take the beating all week — pay them back here |
| 90/90 Hip Switches | 2 | 10/side | — | Smooth transitions, no hands if you can — own the position |
| Thoracic Openers | 2 | 10/side | — | Desk posture dies here — exhale into every rotation |
| Box Breathing | 1 | 5 min | — | 4s in, 4s hold, 4s out, 4s hold — recovery is a skill, train it |

### Section 5 — AI Engine (`05 / MAO ENGINE`, anchor `#ai-engine`)

Two sub-modules, matching the original site:

**(a) Rapid Diagnostic — `3 QUESTIONS. ROUTED IN 90 SECONDS.`** Intro (verbatim): "Three rapid-fire questions. The MAO Engine routes your goal, archetype, and time commitment into a recommended track — then unlocks the deep AI Blueprint generator below. No fluff. No 6-page form. Pull the trigger." Panel label: `MAO ENGINE // 3-QUESTION DIAGNOSTIC`.

The three questions (Q1 verbatim from the original site; Q2–Q3 finalized here):

| # | Question | Options |
|---|---|---|
| 1 | `WHAT IS YOUR PRIMARY OBJECTIVE?` | `BODY RECOMPOSITION` / `RAW STRENGTH` / `LONGEVITY / HEALTH` / `ATHLETIC PERFORMANCE` |
| 2 | `WHICH OPERATOR ARE YOU?` | `FOUNDER / ENTREPRENEUR` / `EXECUTIVE / PROFESSIONAL` / `ATHLETE / COMPETITOR` / `BUSY PARENT / GRINDER` |
| 3 | `WEEKLY TIME COMMITMENT?` | `2–4 HOURS` / `5–7 HOURS` / `8+ HOURS` |

Routing logic (client-side, deterministic): time `2–4 HOURS` → **FOUNDATION**; `5–7 HOURS` → **RECOMP**; `8+ HOURS` → **LEGACY**; exception: objective `ATHLETIC PERFORMANCE` or archetype `ATHLETE / COMPETITOR` bumps the result up one tier (max LEGACY). Result card shows `ROUTED // RECOMMENDED TRACK: [TIER]` with a one-line rationale composed from the answers (e.g., "Recomposition objective + founder schedule + 5–7 hrs/week = the flagship RECOMP track."), a CTA `APPLY FOR [TIER]` scrolling to `#apply`, then reveals/scrolls to the Deep Blueprint form below.

**(b) Deep Blueprint — `DEEP BLUEPRINT // AI POWERED ENGINE`.** Intake form fields (verbatim labels): `NAME (OPTIONAL)` · `PRIMARY GOALS *` (textarea) · `FITNESS LEVEL *` (select: Beginner / Intermediate / Advanced; default Intermediate) · `AVAILABILITY *` · `FOCUS AREA (OPTIONAL)` · `INJURIES / LIMITATIONS (OPTIONAL)`. Submit button: `GENERATE AI PLAN`.

Output panel labeled `OUTPUT // AI POWERED ENGINE` with idle state text (verbatim): `> Awaiting input. Drop your goals on the left and pull the trigger.`

**LLM integration (required):** the form POSTs to a backend endpoint (e.g., `POST /api/ai-plan`) which calls a real LLM (Anthropic/OpenAI/whatever key is available — keep keys server-side) and returns the plan. Render the response as formatted markdown in the output panel, with a terminal-style streaming or typewriter effect if feasible. Persist each request + output to `ai_plans`. Handle loading ("GENERATING…"), error, and rate-limit states. Suggested system prompt:

```
You are the MAO Engine, the AI programming assistant for Coach Jay of JayLee Fit
(JayLee Hustle Industries). Generate a personalized 7-day training week in the MAO
style: direct, disciplined, no fluff, second person ("you"). Structure the output as:
1) OPERATOR READOUT — 2-3 sentence assessment of the user's inputs.
2) RECOMMENDED TRACK — one of FOUNDATION / RECOMP / LEGACY with one-line rationale.
3) THE WEEK — a day-by-day split (MON-SUN) with exercises, sets x reps, rest, and a
   one-line coach's note per day. Respect stated availability, focus area, and any
   injuries/limitations (substitute safe alternatives and say why).
4) GUARDRAILS — 3 short rules on nutrition, recovery, and consistency.
End with: "This is a sample blueprint. Your full MAO program is built after
qualification. — MAO ENGINE". Keep it under 600 words. Never give medical advice;
advise consulting a professional for injuries.
```

### Section 6 — Command Center (`06 / COMMAND CENTER`) — optional but recommended

Static showcase of the accountability infrastructure. Heading: `MAO COMMAND CENTER`. Intro (verbatim): "Every Operator on the roster gets a private dashboard. Real biomarkers. Real audits. Real comm channels. No vague 'wellness' copy. This is the accountability infrastructure most coaching programs only promise." Sub-line: `BELOW: A REDACTED VIEW OF THE COMMAND CENTER SURFACE. REAL NUMBERS SHOWN AFTER ADMISSION.`

Four stat cards (verbatim): **D/01 DAILY COMPLIANCE — 96% — WORKOUTS LOGGED THIS WEEK** ("Every set, every meal, every recovery window — timestamped and auto-reviewed by the Audit Logger every 24 hours."); **D/02 BIOMARKER TRACKING — BF 13.4% — DOWN FROM 18.2% IN 9 WEEKS** ("DEXA, InBody, HRV, sleep latency, fasted glucose. Your raw data is the source of truth — not the scale, not the mirror."); **D/03 COMM CHANNELS — 24/7 — TELEGRAM • EMAIL • VOICE** ("Direct line to Coach Jay — not a VA, not a chatbot. Audio-message form audits within 12 hours, max."); **D/04 WEEKLY AUDIT — MON 06:00 CDT — STRATEGIST AGENT RE-PRESCRIBES** ("The Swarm reviews your last 7 days, identifies the bottleneck, and adapts your block. Zero stagnation. No copy-paste programs.").

Closing block (verbatim): "ACCOUNTABILITY LOOP ·· MATERIALIZED — The Command Center is the physical manifestation of the Accountability Loop. Every metric is logged by the Operator, audited by the Swarm, and re-prescribed by the Strategist Agent every Monday at 06:00 CDT. No theatre. No spreadsheets. Just the numbers, and the work that produced them."

**Important:** label these numbers as an illustrative/redacted sample view (the original site already frames it as "a redacted view"). Do not present them as claims about specific real clients.

### Section 7 — Coach Jay Bio (`06 / COACH JAY`, anchor `#coach-jay`)

Heading: `THE OPERATOR`. Use the supplied portrait photo `assets/coach_jay_portrait.png`. Credential strip: `CERTIFIED PERSONAL TRAINER · HOT SPRINGS, ARKANSAS · JAYLEE FIT — JLH INDUSTRIES LLC`.

Statement (verbatim): `JAYLEE FIT IS NOT A GYM. IT IS AN OPERATING SYSTEM FOR YOUR BODY.`

Bio (verbatim):

> Jordan Lee — "Coach Jay" — is a certified personal trainer and the founder of JayLee Fit (JayLee Hustle Industries LLC), based in Hot Springs, Arkansas. He built his coaching practice on one belief: real results come from realistic systems, not extreme programs that fall apart in week two. MAO — the Master Orchestrator — is his coaching engine for operators who refuse soft programming and softer accountability.
>
> Jordan coaches founders, athletes, and busy dads specifically because he understands the life — the early mornings, the packed schedules, the guilt of putting yourself last. His approach strips away the noise and builds programs that actually fit your week, your equipment, and your energy. Home-based training. No gym required. Real accountability.

Sub-blocks (verbatim): **SPECIALIZATIONS** — Athletic performance • Fat loss • Functional strength • Metabolic efficiency • GLP-1 adaptation • Wearable data integration • 12-week specialization programs. **CREDENTIALS** — NASM Certified Personal Trainer • Nutrition Certification • Advanced Programming • AI-Powered Coaching • 15+ years coaching experience. **MISSION** — Build disciplined, capable bodies and operators through programmed recomposition and a relentless accountability loop. **METHOD** — Hustle First. Recomp over Vanity. Consistency over Intensity. Accountability Loop. Repeat for 12 weeks.

Stat row (verbatim): `100% Home-based programs · 1:1 Personal coaching · CUSTOM Every plan · REAL Accountability`.

### Section 8 — Proof (`07 / PROOF`, anchor `#proof`)

Heading: `THE RECEIPTS`. **Compliance note for the builder:** do NOT invent or seed testimonials, ratings, or transformation claims. Build the testimonial card grid as a component fed by real data the client supplies (a JSON/db table with quote, name, descriptor). Ship it with a tasteful empty state such as: `CLIENT RESULTS — VERIFIED TESTIMONIALS PUBLISHING SOON. ASK COACH JAY FOR REFERENCES DURING YOUR QUALIFICATION REVIEW.` The client's original site displayed three testimonials (Marcus T., Aisha R., Devon K.); only re-publish them after the client confirms in writing that they are genuine client statements he has permission to use.

### Section 9 — Gallery (`09 / GALLERY`, anchor `#gallery`)

Heading: `THE STANDARD`. Intro (verbatim): "Every Operator holds the same standard. Discipline. Focus. Consistency. Success." Three-image grid with caption overlays, using the supplied assets: `gallery_operator_focus.png` → caption `OPERATOR FOCUS`; `gallery_absolute_focus.png` → caption `ABSOLUTE FOCUS`; `gallery_the_visionary.png` → caption `THE VISIONARY`. Images are portrait-orientation (roughly 4:5 and 9:19.5); crop/cover to a consistent aspect. Add a lightbox on click if quick to implement.

### Section 10 — Pay Invoice (`08 / PAY INVOICE`, anchor `#pay-invoice`)

Heading: `PAY INVOICE`. Intro (verbatim):

> For already-onboarded clients only. Once Coach Jay has approved your application and issued an Order ID, settle your invoice via PayPal below.

Callout (verbatim): `NEW HERE? RUN THE INTAKE AGENT ABOVE. MAO DOES NOT SELL OFF THE SHELF.`

**PayPal panel:** label `PAYPAL`, instruction "Send to the JayLee Hustle Industries PayPal handle," display the PayPal email **`magicdeals.wholesale@gmail.com`** with a copy-to-clipboard button, and an `OPEN PAYPAL` link (`https://www.paypal.com/paypalme/` link if the client supplies a PayPal.Me handle; otherwise link to `https://www.paypal.com/` and note the email). 

**Payment self-report form** (label: `PAYMENT // SELF-REPORT`, heading `ALREADY SENT PAYMENT?`, intro verbatim: "Drop your details and your PayPal Transaction ID so MAO finance can run automatic verification. Coach Jay gets pinged immediately."). Fields — all five required capture fields present: `NAME *` · `EMAIL *` · `METHOD *` (select: PayPal / Other, default PayPal) · `AMOUNT *` · `ORDER ID *` · `PAYPAL TRANSACTION ID *` · `NOTE` (optional). Submit button: `REPORT PAYMENT`. Persist to `payment_reports` and show a success state ("Payment report received — verification in progress."). If email infrastructure exists, notify `Jay.everydayhustleco@gmail.com` on each submission.

**Honesty constraint:** the original site claimed live "PayPal Orders API" verification. Do NOT claim automatic API verification unless you actually integrate PayPal's API with the client's credentials. Default implementation: manual review — copy may say "Every payment report is verified by MAO finance before your program is released." A verbatim verification-pipeline list from the old site is available but should only be used if real API verification is built.

### Section 11 — Footer

Brand block (verbatim): "JAYLEE FIT — High-performance coaching portal. Body recomposition, personal training, and hustle coaching orchestrated by the MAO operating system. Investment tiers — not subscriptions. By application only."

Contact: `Jay.everydayhustleco@gmail.com` · `PayPal: magicdeals.wholesale@gmail.com`. Sitemap repeating the nav links. Legal line: `© 2026 JAYLEE FIT · JAYLEE HUSTLE INDUSTRIES LLC — JAYLEEFIT.COM · MAO METHODOLOGY`.

---

## 5. Supplied Assets

All four images ship alongside this document in the `assets/` folder. Host them with the site (optimize/compress for web; serve WebP with PNG fallback if convenient).

| File | Dimensions | Use |
|---|---|---|
| `assets/coach_jay_portrait.png` | 360×536 | Coach Jay bio section portrait |
| `assets/gallery_operator_focus.png` | 1179×2556 | Gallery — "OPERATOR FOCUS" |
| `assets/gallery_absolute_focus.png` | 1664×2080 | Gallery — "ABSOLUTE FOCUS" |
| `assets/gallery_the_visionary.png` | 1664×2080 | Gallery — "THE VISIONARY" |

The hero and other sections may use abstract/graphic treatments (grids, type, textures) rather than stock photography.

---

## 6. Acceptance / QA Checklist

Verify every item before delivery:

- [ ] "MAO Methodology" appears prominently in the hero.
- [ ] Hero buttons read exactly `Apply for a Package` and `Run AI Powered Engine` (uppercase styling via CSS is fine; the text content must match).
- [ ] Nav labels exactly: Services, Apply, Investment, Sample Split, AI Engine, Coach Jay, Proof, Gallery, Pay Invoice — all smooth-scroll to the right anchors; sticky nav never covers section headings.
- [ ] No package price is visible or present in the served HTML/JS before Phase 4 completion; prices appear only after the 4-phase form completes.
- [ ] All four form phases validate and persist; refresh mid-form does not crash; Phase 4 completion unlocks pricing in the same session.
- [ ] AI Engine makes a real server-side LLM call and renders a personalized plan on the page; loading and error states work; the intake captures goals, experience level, availability, and focus area.
- [ ] Sample Split MON table matches this spec verbatim; all seven tabs populated; table scrolls horizontally on mobile.
- [ ] Pay Invoice form captures name, email, amount, order ID, transaction ID (plus method/note) and persists submissions.
- [ ] No fabricated testimonials anywhere.
- [ ] Responsive at 375px, 768px, 1280px; WCAG AA contrast; `prefers-reduced-motion` respected.
- [ ] Lighthouse performance ≥ 85 on mobile (optimize the large gallery PNGs).

---

## 7. Open Items for the Client (Coach Jay)

These need client input and are intentionally parameterized: (1) final prices for FOUNDATION / RECOMP / LEGACY (stored as backend config); (2) verified testimonials with written permission; (3) PayPal.Me handle if one exists; (4) real TUE–SUN split details if he wants his actual week instead of authored sample days; (5) whether to build true PayPal Orders API verification (requires his PayPal developer credentials).

---

*Prepared by Manus AI — complete handoff specification. All verbatim copy captured from the client's original site on Jul 31, 2026.*
