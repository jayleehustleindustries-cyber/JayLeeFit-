# JayLeeFit — Software Design Brief: The Coaching Extension App

How to design the software so it behaves like an **extension** of you as a coach
— not a separate product you have to babysit. The app sits on top of the
Airtable data layer that already exists.

---

## 1. Design principle: "extension, not replacement"

The software should do the repetitive parts of coaching so you can do the
high-value parts. It extends your reach; it does not replace the coaching.

- **One source of truth:** Airtable (`JayLeeFit Client Hub`). Every surface
  reads/writes the same base — no second database to keep in sync.
- **You stay in the loop:** the app drafts, reminds, and logs; you approve and
  coach. Automation handles cadence, you handle judgment.

```
        ┌─────────────────────────────────────────┐
        │      Airtable: JayLeeFit Client Hub      │  ← single source of truth
        │  Clients · Workouts · Nutrition · etc.   │
        └───────────────┬─────────────┬────────────┘
            reads/writes │             │ reads/writes
                ┌────────┴───┐   ┌─────┴─────────┐
                │ Telegram   │   │  Client app   │   ← "front doors"
                │ bot agent  │   │ (extension)   │
                └────────────┘   └───────────────┘
```

---

## 2. MVP scope (Phase 3 of the roadmap)

Keep the first version tiny and useful. Three screens:

1. **Today** — the client's macro target (P/F/C % from Nutrition Plans), today's
   workout, and a "log it" button.
2. **Log** — weight + a photo → writes to Progress Tracking. One tap.
3. **Progress** — weight trend chart + macro adherence, pulled from Airtable.

That's it. Everything else is v2.

---

## 3. Build approach (lowest risk → highest control)

| Option | What it is | When to pick it |
|--------|-----------|-----------------|
| **A. No-code on Airtable** | Airtable Interfaces + Automations as the "app" | Validate the loop this week, $0 extra build |
| **B. PWA front-end** | A small web app (installable on phone) reading the Airtable API | When you want your own branded UX |
| **C. Native app** | iOS/Android | Only once paying clients demand it (needed for wearable sync — see research doc) |

**Recommendation:** A now → B next → C only when wearable sync requires it.
A native shell is what unlocks Apple HealthKit / Google Health Connect.

---

## 4. "Get my software generation skills up" — a learning path

Build the skill by shipping the layers in order. Each is a real, finishable rung:

1. **Airtable Interfaces** — design the client view. (no code)
2. **Airtable Automations** — reminders + check-in rollups. (low code)
3. **Telegram bot** — first real integration writing to the Airtable API.
   (Node or Python; or no-code via n8n/Make)
4. **PWA** — your first front-end reading live data.
5. **Wearable sync** — the advanced rung (see `research-smart-fitness-integrations.md`).

> Each rung reuses the same base, so nothing is throwaway. Ship rung N before
> starting rung N+1.

---

## 5. Open decisions (yours to call)

1. Bot host: no-code (n8n/Make) vs coded service?
2. App platform order: confirm A → B → C?
3. Branding: lock the visual style (shared with the marketing template kit)?
