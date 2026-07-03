# Engagement / DM Automation — CTA Watching for IG & TikTok

How to automate watching comments and auto-replying to DMs so your CTAs convert
without you glued to the app. This is **not** a Claude subagent — it needs a
tool that holds Instagram/TikTok messaging permissions.

## The right tool
**ManyChat** (or Manus AI) is the standard for Instagram + TikTok comment→DM
automation. It connects directly to your accounts and reacts in real time. Claude
designs the flows; ManyChat runs them. There is no ManyChat connector in this
agent workspace, so this is a run-it-yourself setup — but a fast one.

## The CTA keyword flow (build this in ManyChat)
1. **Trigger:** a comment or DM containing a keyword you seed in your caption —
   e.g. "Comment **PLAN** and I'll send you the intake link."
2. **Auto-reply:** ManyChat DMs the person the link + a one-line qualifier
   ("What's your #1 goal — fat loss or muscle?").
3. **Capture:** their reply + handle flow into your CRM (Airtable Clients table).
4. **Handoff:** hot leads flagged for you to close personally.

## CTA tactics worth watching
- One keyword per campaign so you can measure which post drove which leads.
- "Comment X" outperforms "link in bio" — the comment feeds the algorithm *and*
  triggers the DM.
- Always qualify in the auto-DM (one question) before you spend time.
- Track: comments → DMs opened → link clicks → intake completions.

## Where it fits the operation
This is the **Lead-Gen / Engagement** node feeding the Airtable CRM. In the agent
chain it sits after Publishing: post goes out → ManyChat watches the CTA →
qualified leads land in Airtable → you close. Wire the ManyChat→Airtable step via
Zapier/Make (native integrations both sides).

## Honest limits
- Instagram/TikTok API rules restrict automated DMs — ManyChat stays compliant by
  reacting to opt-in triggers (the user comments first). Don't cold-DM at scale.
- Claude can draft every message and qualifier and map the Airtable fields, but
  cannot press "send" on your social DMs — that's ManyChat's job.
