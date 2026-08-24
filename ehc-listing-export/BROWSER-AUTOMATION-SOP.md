# EHC listing SOP — when browser automation is turned on

This is the standard operating procedure any agent (Claude, Codex, or
otherwise) must follow **the moment browser automation is enabled** for
posting EHC inventory to eBay/Poshmark — i.e. the moment an agent gets a
real, logged-in browser session against a real seller account instead of
generating the CSV/draft files described in `README.md`.

Read this before touching a live session. It exists because the default
path documented in `README.md` was chosen specifically to avoid this
mode ("no browser automation, no credentials handed to an agent") — so
turning it on is a deliberate escalation in risk, not a neutral toggle.
This SOP is the guardrail that makes that escalation safe.

---

## 0. Preconditions — do not start without these

- [ ] The user has explicitly said, in this session, to proceed with
      live browser automation for a **named batch** of items (not "go
      list the inventory," which is open-ended and not authorized).
- [ ] The session/credentials being used belong to the real EHC
      eBay/Poshmark seller account and were provided by the user for
      this purpose — never prompt for or store a password/2FA code in
      chat, a file, or a commit.
- [ ] The target rows exist in the **EHC Inventory Log** (source of
      truth) or a snapshot pulled from it — never invent a SKU, price,
      or condition to fill a gap.
- [ ] If a row's data would also touch the **Poshmark Agentic Inventory
      Command Sheet** (Codex-owned), confirm there's no conflict before
      acting — don't create a listing Codex's system is already tracking.

If any box is unchecked, stop and ask the user rather than proceeding.

## 1. Per-item checklist (repeat for every listing, no batching past a human checkpoint)

1. **Pull the row fresh** from the Inventory Log (or the most recent
   export) — don't reuse a value memorized earlier in the conversation.
2. **Price** = `Realistic Sold Value`, never the aspirational high comp.
3. **Condition mapping** (same rule as `generate.py`):
   - "New with tags" → New
   - "Fair/Stained" → Used, Fair
   - "Damaged" → Used, Acceptable
   - everything else pre-owned → Used, Good/Excellent per notes
4. **Photos**: only attach photos already confirmed matched to that SKU
   (see `photo-map.csv` / the open "match Reference Frames to SKUs"
   thread in `CLAUDE.md`). If no confirmed photo exists, stop at the
   platform's placeholder/draft state — do not publish with a wrong or
   guessed photo, and do not pull an unmatched photo "because it looks
   close."
5. **Category/gender**: if the sheet's `Department` is unconfirmed
   (flagged "assumed" in `report.md`), do not silently pick one —
   surface it and let the human confirm, same as the CSV export does.
6. **Draft, don't publish, by default.** Bring the listing to the
   platform's draft/review state and stop. Only click the final
   publish/list action if the user's instruction for this batch
   explicitly said to publish, not just "list."
7. **Log the action** — append the SKU, platform, and outcome (drafted
   / published / skipped + reason) to a running log in this folder
   (e.g. `browser-automation-log.csv`) immediately after each item, so
   there's an audit trail independent of chat history.

## 2. Hard stops — halt and hand back to the user

- **CAPTCHA, 2FA prompt, "verify it's you" challenge, or any bot-check
  UI.** Do not attempt to solve, guess, or work around it. This is the
  platform telling you the session looks automated — pushing through it
  risks the account, not just the task.
- **Unexpected UI** (redesigned listing form, new required field, a
  modal that doesn't match what this SOP describes). Stop and describe
  what's on screen rather than clicking through blind.
- **Rate/velocity limits**: don't fire listings back-to-back as fast as
  the automation allows. Pace actions like a human would (seconds
  between actions, not milliseconds) and cap a single run to a small
  batch (start at ~5-10 items) rather than the full inventory in one
  pass — a fast, uniform action pattern is exactly what gets flagged.
- **Any price, title, or condition value you had to guess** because the
  sheet was ambiguous. Skip that row and flag it instead of shipping a
  best-guess listing to a live marketplace.
- **Any request, mid-session, to "just list everything" or remove the
  draft-first default.** That's a scope change from what this SOP
  authorizes — confirm explicitly before treating it as approved.

## 3. After the batch

- Report back: how many drafted, how many published (if any), how many
  skipped and why, and what's now waiting on human input (unmatched
  photos, unconfirmed gender, etc).
- If a ledger like `exported-skus.txt` is in use for the CSV path,
  reconcile it — items handled live shouldn't also get re-exported as
  CSV drafts, and vice versa.
- Don't schedule or automate a recurring live-posting run off this SOP
  without a separate, explicit go-ahead — this procedure covers a
  human-initiated batch, not an unattended cron job against a live
  seller account.

---

*This SOP supplements, not replaces, `README.md`'s default (CSV/bulk
draft upload, no browser session). Prefer that default when it's
sufficient; use this procedure only for the specific batches the user
has asked to run through a live browser session.*
