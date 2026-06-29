# JayLeeFit — Client Data & Coaching System

The operating system for JayLeeFit online coaching. This repo documents the
data layer (Airtable), the client journey, and the build roadmap toward a
Telegram bot agent and a full client application.

**Design principle:** one source of truth (Airtable) that every other surface
— Telegram bot, client app, web — reads from and writes to. Nothing is rebuilt;
each layer is added on top of the same data.

---

## 1. Where things stand today

| Layer | Status | Notes |
|-------|--------|-------|
| **Airtable client data layer** | ✅ Live | Base: *JayLeeFit Client Hub* (`appN8QFsoWJ1fJhxC`) |
| **Macro engine (P/F/C %)** | ✅ Live | Auto-calculated in Nutrition Plans |
| Telegram bot agent | ⏳ Planned | Phase 2 — see roadmap |
| Client application | ⏳ Planned | Phase 3 — built on the same Airtable data |
| Web presence + paid intake | ⏳ Planned | Phase 4 |

The Airtable base is the "client data sheet" that holds each client's metrics
**until they graduate to the Telegram bot and the app.** It is intentionally
the only thing that has to exist for you to coach paying clients right now.

---

## 2. Airtable schema (the data layer)

Base: **JayLeeFit Client Hub** — `appN8QFsoWJ1fJhxC`

| Table | Purpose | Key fields |
|-------|---------|------------|
| **Clients** | Central profile per client | Name, Email, Phone, Program Start Date, Goals, Status, Preferred Reminder Method, Primary Coach, Tags, links to all other tables |
| **Workouts** | Logged training sessions | Workout Name, Client, Date, Exercises, Sets, Reps, Notes, Session Type |
| **Nutrition Plans** | Diet + macros | Meal Plan, Client, **Protein/Carbs/Fat (g)**, **Total Calories**, **P/F/C %**, Plan dates, Type |
| **Progress Tracking** | Body metrics over time | Client, Date, Weight (kg), Body Measurements, Progress Photos, Milestones, Mood, Energy |
| **Check-ins** | Accountability cadence | Client, Scheduled Date, Status, Notes, Reminder Sent, Self-Reported Updates |

All four child tables link back to **Clients**, so one client record rolls up
their entire history.

### Macro engine (built this session)

Added to **Nutrition Plans**. You enter grams; the percentages and calories
calculate themselves:

| Field | Type | Logic |
|-------|------|-------|
| Protein (g) | input | grams/day |
| Carbs (g) | input | grams/day |
| Fat (g) | input | grams/day |
| **Total Calories** | formula | `P×4 + C×4 + F×9` |
| **Protein %** | formula | `P×4 / Total Calories` |
| **Carbs %** | formula | `C×4 / Total Calories` |
| **Fat %** | formula | `F×9 / Total Calories` |

Worked example (live in the base): **P180 / C200 / F60 → 2,060 kcal →
35% / 39% / 26%**.

> Calorie factors: protein & carbs = 4 kcal/g, fat = 9 kcal/g (Atwater).

---

## 3. "Smart sync" — how the metric data moves

The goal is that a client logs a number once and it shows up everywhere. The
practical wiring, in order of effort:

1. **Now:** data lives in Airtable; you enter or import it. Airtable's own
   **Automations** can send reminders and roll up weekly check-ins.
2. **Phase 2 (Telegram):** the bot writes straight to Airtable via the REST
   API (`api.airtable.com/v0/appN8QFsoWJ1fJhxC/...`). A client texts their
   weight → it lands in Progress Tracking → the macro/diet view updates.
3. **Phase 3 (App):** the app reads/writes the same base, so there is never a
   second copy of the truth to keep in sync.

"Smart sync" = **one base, many front doors.** Avoid spreadsheets that drift.

---

## 4. Client journey (the funnel)

```
Social media content  →  free/low-cost intake  →  Airtable Client Hub
        (marketing)          (lead capture)         (you coach here)
                                                          │
                                  client gets comfortable │
                                                          ▼
                              Telegram bot agent  →  Client app  →  Web checkout
                               (daily logging)       (full UX)     (technical fee)
```

The Airtable base is where a new client is **coached from day one**. They only
move to the bot/app once they're familiar — exactly as intended.

---

## 5. Build roadmap

### Phase 1 — Data layer ✅ (done)
- [x] Airtable base with 5 linked tables
- [x] Body metrics in Progress Tracking
- [x] Macro engine: P/F/C grams → calories + % breakdown

### Phase 2 — Telegram bot agent
- [ ] Decide host (n8n, Make, or a small Node/Python service)
- [ ] Bot writes check-ins, weight, and adherence to Airtable
- [ ] Daily macro target reminder pulled from the client's Nutrition Plan
- [ ] Reminder cadence driven by the Check-ins table

### Phase 3 — Client application
- [ ] Define MVP screens: today's macros, log weight, see progress chart
- [ ] Reads/writes the same Airtable base (no second database)
- [ ] Claude-assisted build (this repo is the home for it)

### Phase 4 — Web + paid intake
- [ ] Landing page + the technical training fee / checkout
- [ ] Connect lead capture into the Clients table

---

## 6. Marketing notes (fitness niche)

Social is the right channel — the content engine should feed the funnel above.
Keep it concrete and measurable rather than "go viral":
- **Content → 1 CTA:** every post points to the same intake link.
- **Proof:** progress photos + metric deltas (pulled from Progress Tracking)
  are your highest-converting content.
- **Positioning, not "targeting competitors":** win on a clear niche and a
  visible system (this exact macro + check-in loop), which most coaches don't
  show. Differentiate on transparency and responsiveness, not call-outs.

---

## 7. Open decisions (need your input)

These shape Phase 2+ and are yours to call:
1. **Telegram bot host** — no-code (n8n/Make) vs. a coded service?
2. **App platform** — mobile-first PWA, native, or web app first?
3. **Pricing** — what is the "technical training fee," and is it per month?
4. **Units** — base is in **kg**; confirm kg vs lb for your client base.

---

*Data layer and macro engine are live in Airtable now. The rest is sequenced
above so each phase reuses the same single source of truth.*
