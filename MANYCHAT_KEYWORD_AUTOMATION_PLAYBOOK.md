# ManyChat Keyword-Trigger Automation Playbook
## MAO Methodology / JayLee Fit — Instagram (@j_lee_is_me) + Facebook

*Prepared by Manus AI — Jul 31, 2026. Designed to plug directly into the MAO funnel: keyword → automated DM → 4-phase application on the website.*

---

## 1. What This Sets Up

When someone **comments a trigger keyword on your Instagram post/Reel** or **DMs you a keyword**, ManyChat instantly replies with an automated flow that qualifies them and pushes them to the right destination — your application form, the AI Engine, or the pay-invoice page. Manychat users running Instagram Keywords see roughly **99% faster response times and up to 40% higher engagement**, and every lead is captured 24/7 without you touching your phone.

**Honest scoping note:** ManyChat has **no public API for creating keywords or flows programmatically** — flows must be built in the ManyChat dashboard by a logged-in user (their API only lets external systems *send* existing flows to subscribers). So this playbook gives you an exact, click-by-click build with all copy written for you. If you connect your ManyChat/Instagram login through my browser, I can also click through the setup for you — see Section 8.

---

## 2. Prerequisites (10 minutes, one-time)

1. **Instagram professional account** — @j_lee_is_me must be a Business or Creator account (Settings → Account type).
2. **Facebook Page** linked to the Instagram account (required by Meta for DM automation permissions).
3. **ManyChat account** — sign up at manychat.com with the Facebook login that admins your Page. The **Free plan works for basic keyword DM automation**; the **Pro plan (~$15/mo starting tier)** unlocks Comments Growth Tool on unlimited posts, audience tagging at scale, and removes ManyChat branding. Start Free; upgrade when a post pops.
4. **Connect Instagram to ManyChat:** ManyChat dashboard → Settings → Instagram → Connect → approve all requested Meta permissions (message access, comment access).

---

## 3. Keyword Architecture for MAO

Five keywords, each mapped to one funnel destination. Keep them short, uppercase-promotable, and typo-tolerant.

| Keyword | Variations to add | Intent | Destination |
|---|---|---|---|
| `APPLY` | aply, applly, package | Serious prospect → application | Website 4-phase application (`#apply`) |
| `PLAN` | plans, engine, ai | Curious → AI Powered Engine demo | Website AI Engine section (`#ai-engine`) |
| `SPLIT` | training, workout | Content lead magnet | Sample Weekly Split section (`#sample-split`) |
| `HUSTLE` | coaching, business | Hustle Coaching inquiry | Services section → application |
| `PAY` | invoice, paypal | Onboarded client settling invoice | Pay Invoice section (`#pay-invoice`) |

Matching rule: use **"Message is"** (exact) for the main keyword and add the variations as separate entries with **"Message contains"** used sparingly — broad "contains" rules misfire (e.g., "I don't want to apply" would still trigger APPLY).

---

## 4. Click-by-Click Setup in ManyChat

### A. Create the keyword triggers
1. ManyChat dashboard → **Automation → Keywords** → **+ New Keyword**.
2. Enter `APPLY`, set channel to **Instagram**, rule **Message is** `apply` (ManyChat is case-insensitive).
3. Add variation entries: `aply`, `applly`, `package`.
4. Under **Actions**, add tag `lead-apply` (create it inline).
5. Set the reply to launch the flow you'll build next. Repeat for the other four keywords with tags `lead-plan`, `lead-split`, `lead-hustle`, `client-pay`.

### B. Build the APPLY flow (template — clone for the others)
Automation → Flows → **+ New Flow**, name it `KW - APPLY`:
1. **Message 1:** "🔥 You just knocked on MAO's door. We don't sell off the shelf — every Operator is placed by application. Quick question first:"
2. **Question block:** "What's your #1 goal right now?" with quick-reply buttons: `Drop body fat` / `Build muscle` / `Level up my hustle`. Save answer to a custom field `goal`; tag accordingly (`goal-cut`, `goal-build`, `goal-hustle`).
3. **Message 2 (per branch):** "Locked in. The 4-phase application takes ~3 minutes. Investment details unlock only after you complete it — that's the MAO standard." Button: **START MY APPLICATION** → your website URL + `#apply` (use a UTM: `?utm_source=ig&utm_medium=manychat&utm_campaign=kw_apply`).
4. **Delay 23 hours → follow-up:** "Still thinking? Applications are reviewed personally by Coach Jay. One message. One decision. 👊 [link]" *(One follow-up within Meta's 24-hour messaging window is compliant; do not schedule promotional messages beyond 24h.)*

### C. Flow copy for the other keywords
- **KW - PLAN:** "Want the machine to build your first week? Run the AI Powered Engine — free, 60 seconds." Button: **RUN THE ENGINE** → `#ai-engine`.
- **KW - SPLIT:** "Here's exactly how an Operator trains. Full MON–SUN split with Coach Jay's notes:" Button: **SEE THE SPLIT** → `#sample-split`. Then: "When you're ready to stop sampling and start operating, type APPLY."
- **KW - HUSTLE:** "Body and business run on the same operating system. Hustle Coaching is applications-only." Button: **APPLY FOR HUSTLE COACHING** → `#apply`.
- **KW - PAY:** "Operator confirmed. Settle your invoice via PayPal and file your payment report here:" Button: **PAY INVOICE** → `#pay-invoice`.

### D. Comment-to-DM automation (the growth engine)
This is the highest-leverage piece — "Comment APPLY below" on a Reel:
1. Automation → **+ New Trigger → Instagram → User comments on your Post or Reel** (Comments Growth Tool).
2. Choose **specific post** (Pro lets you apply to all posts) and set trigger word `APPLY`.
3. Configure the three-part response: (a) **public comment reply** — "Sent you a DM 📬 check your inbox"; (b) **DM opener** — because Meta requires the user to respond before full automation, the first DM should be: "You commented APPLY 👀 Tap below and I'll send you the door." with one button `SHOW ME`; (c) button press → launches the `KW - APPLY` flow above.
4. Repeat for `PLAN` on AI-Engine-teaser content.

### E. Default Reply + Story Mentions (catch-alls)
- **Default Reply** (Automation → Default Reply): "Appreciate the message 🙏 Coach Jay reviews DMs daily. Fastest routes: type APPLY for coaching, PLAN for a free AI training plan, or PAY to settle an invoice."
- **Story Mention trigger:** auto-thank anyone who mentions you in a Story and drop the PLAN hook.

---

## 5. Compliance Guardrails (Meta will suspend automations that break these)

- Automated promotional DMs are only allowed **within 24 hours of the user's last interaction**. The flows above stay inside that window.
- Never DM people who haven't interacted (no cold DM automation).
- The comment-reply opener must include a way to opt out / not continue (the single-button opener satisfies the response-gate requirement).
- Don't use vague trigger words like "hi" or "yes" — they misfire and inflate accidental opt-ins.

---

## 6. Content Prompts That Feed the Machine

Every automation needs fuel. CTA lines to use in captions/Stories/Reels:
- "Comment **APPLY** and I'll send you the door. MAO doesn't sell off the shelf."
- "DM me **PLAN** and my AI engine builds your first training week free."
- "Want my exact MON–SUN split? Comment **SPLIT**."
- Bio line: "DM APPLY to start | DM PLAN for a free AI training week"

---

## 7. Measurement (weekly, 5 minutes)

ManyChat → Automation → each keyword shows **Runs / CTR**. Watch: keyword trigger volume, button click-through to site, and application completions (match `utm_campaign` in your site analytics). Kill or reword any keyword flow with <30% button CTR after 100 runs.

---

## 8. What I Can Do vs. What Needs You

| Step | Who |
|---|---|
| All flow copy, architecture, compliance design | ✅ Done (this document) |
| Creating the ManyChat account & connecting Instagram | 🔑 You (requires your Facebook/Instagram login) — or connect your browser session and I can drive the clicks with you watching |
| Building keywords/flows in the dashboard | Either — I can do it via browser once logged in |
| Website anchor links (`#apply`, `#ai-engine`, etc.) | Built into the website spec already delivered |

**No-ManyChat alternative:** Instagram now has native limited keyword auto-replies (Instagram app → Settings → Business tools → Saved replies / FAQ), and Meta's Messenger API for Instagram would let me build a fully custom DM bot hosted on your website's backend — more control, no ManyChat subscription, but requires Meta App Review (1–2 weeks). ManyChat is the fastest path live today.
