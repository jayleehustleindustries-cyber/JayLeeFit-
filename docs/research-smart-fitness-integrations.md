# Research — Smart Integrations in Fitness (Wearable Sync)

Research for the "smart wearable sync" build. Goal: let a client's device push
metrics (weight, HR/HRV, sleep, steps, workouts) into the JayLeeFit data layer
automatically, so coaching reacts to real data instead of manual logging.

> Status check: this software is **not built yet** — it is the next build. This
> doc scopes how to do it.

---

## 1. The two ways to get wearable data

### A. Aggregator API (buy) — recommended to start
One integration → hundreds of devices, one normalized data schema.

| Provider | Coverage | Notes |
|----------|----------|-------|
| **Terra** | 300–500+ wearables/apps | Largest coverage, single normalized schema, webhooks |
| **Vital** | Wearables + lab/health data | Strong health/clinical angle |
| **ROOK** | Wearables, normalized | Developer-experience focused |
| **Metriport** | Open-core option | Self-host or managed |
| **Open Wearables** (open-source) | Apple, Garmin, Fitbit, Oura, Whoop, Strava | Self-hosted, no per-user fee but you own the infra |
| _Legacy:_ Validic, HumanAPI | Enterprise/clinical | Older, pricier |

**Why buy:** building integrations direct costs roughly **$3,800–$7,700 of dev
time per platform** — about **$23k–$46k for six platforms** — before
maintenance. An aggregator collapses that into one integration.

### B. Direct device APIs (build) — for control / no per-user fee

| Source | Reach | Key constraint |
|--------|-------|----------------|
| **Apple HealthKit** | All Apple Watch + iPhone health data | Requires a **native iOS app**; data lives on-device |
| **Google Health Connect** | Android hub (replaced Google Fit, **deprecated Jul 1 2025**) | Requires a **native Android app** |
| **Garmin Health API** | Garmin devices | Partner approval; server-to-server |
| **Fitbit Web API** (Google) | Fitbit devices | OAuth; Google-owned now |
| **Oura API** | Oura ring (sleep/HRV/readiness) | Clean REST API |
| **Whoop API** | Whoop (recovery/strain/sleep) | OAuth |
| **Strava API** | Workouts/activities (many devices) | Rate limits, OAuth |
| **Polar AccessLink** | Polar devices | OAuth |

**Key gotcha:** HealthKit and Health Connect both require a **native mobile
app** to read the on-device store — this is the single biggest reason to
eventually go native (Phase 3C in the design brief).

---

## 2. What data is actually useful for coaching

Don't ingest everything. Map each metric to a coaching action:

| Metric | Source | Coaching use |
|--------|--------|--------------|
| Body weight | Smart scale → HealthKit/Health Connect | Trend → adjust calories/macros |
| Steps / active energy | Watch/phone | Adherence, NEAT, weekly targets |
| Heart rate / **HRV** | Watch/Whoop/Oura | Recovery scoring, deload nudges |
| Sleep | Oura/Whoop/watch | Adjust training load + nudges |
| Workouts (sets/HR) | Watch/Strava | Auto-log into the Workouts table |
| Resting HR | Most devices | Long-term fitness trend |

These map cleanly onto existing Airtable tables (Progress Tracking, Workouts).

---

## 3. Recommended architecture

```
Client wearable
      │  (native app reads HealthKit / Health Connect)
      ▼
Aggregator API (Terra/Vital)  ──webhook──►  small sync service
      │                                          │
      └────────── normalized JSON ───────────────┘
                                                  │ writes via Airtable REST API
                                                  ▼
                              Airtable: JayLeeFit Client Hub
                                  (Progress Tracking, Workouts)
                                                  │
                                                  ▼
                              Coaching surfaces (bot, app) react
```

**Phased plan**
1. **Manual + smart scale first** — client logs weight; validate the loop. (now)
2. **Aggregator (Terra/Vital) sandbox** — connect one test account, write to
   Airtable via webhook. (first real sync)
3. **Native app shell** — unlock HealthKit / Health Connect for full data.
4. **Smart rules** — recovery/HRV/sleep drive automated coaching nudges.

---

## 4. Compliance & trust (do not skip)

- **Consent + privacy policy:** wearable/health data is sensitive. Explicit
  opt-in, clear policy, allow disconnect/delete.
- **HIPAA:** generally **not** triggered for fitness coaching (you're not a
  covered entity), **but** if you ever handle clinical data or partner with
  providers, revisit. Aggregators like Vital offer compliant paths.
- **Platform rules:** Apple/Google restrict using health data for advertising.
  Use it only to coach.
- **Data minimization:** ingest only the metrics in §2.

---

## 5. Recommendation

Start with an **aggregator (Terra or Vital) in sandbox**, writing to Airtable
via webhook — it's the fastest path to a working sync and avoids $20k+ of
direct-integration work. Go native only when clients need full Apple
Watch / Health Connect depth.

---

## Sources
- [Terra API](https://tryterra.co/) · [Terra integrations](https://tryterra.co/integrations)
- [The Real Cost of Wearables Integration 2025 (build vs buy)](https://www.themomentum.ai/blog/the-real-cost-of-wearables-integration-in-2025-build-vs-buy-analysis)
- [Open Wearables (open-source)](https://github.com/the-momentum/open-wearables)
- [Apple Health vs Health Connect — ROOK](https://www.tryrook.io/blog/apple-health-vs-health-connect)
- [Google Fit deprecation / Health Connect](https://onix-systems.com/blog/healthkit-and-google-fit-for-fitness-apps)
- [Google AI health coach + Health Connect/HealthKit (CNN, 2026)](https://www.cnn.com/2026/05/07/tech/google-ai-health-fitbit)
