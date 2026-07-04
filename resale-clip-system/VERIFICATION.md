# Resale Clip Engine — VERIFICATION GATE (the standard)

This is the most important file. A clip publishes ONLY if all 10 boxes are ✅.
Every check is yes/no and observable — no taste, no judgment. A dumb model or a
tired human can run it.

**How to score:** go down the list. Mark each ✅ or ❌. If ANY box is ❌ → the clip
is REVISE. Fix that specific thing and re-run the whole list. Do not publish on a
"close enough."

MODEL can check boxes 1, 4, 5, 9, 10 from the script + caption + Airtable row.
HUMAN checks boxes 2, 3, 6, 7, 8 by watching the clip once.

| # | Check (yes/no) | ✅ passes if… | Who |
|---|----------------|--------------|-----|
| 1 | **Hook text present** | Frame 1 has typed on-screen text of ≤ 7 words. | MODEL |
| 2 | **Hook is early** | That text is visible within 0:00–0:03. | HUMAN |
| 3 | **Item shown fast** | The actual item is on screen within the first 5 seconds. | HUMAN |
| 4 | **Price anchor** | Script/caption states a number: "$[ask]" AND ("paid $[buy]" OR "retails $[retail]"). | MODEL |
| 5 | **Exactly one CTA keyword** | Caption contains one of `FIT`/`KICKS`/`LINK`, exactly once, in a "Comment X" line. | MODEL |
| 6 | **Length** | Clip is 12–30 seconds. | HUMAN |
| 7 | **Format** | 9:16 vertical, image fills frame, no black bars. | HUMAN |
| 8 | **No junk** | No AI-garbled text, no watermark, no logo/audio you don't own. | HUMAN |
| 9 | **Caption complete** | Caption has: hook sentence + brand + size + $ask + keyword line + 3–5 hashtags. | MODEL |
| 10 | **Logged** | Airtable row has clip URL in Cloud Folder Link AND Status = `Listed`. | MODEL |

**Verdict rule:**
- 10 ✅ → **PUBLISH.**
- Any ❌ → **REVISE** (name the box number, fix only that, re-run all 10).
- Failed twice → park item at Status `Sourced`, move on. Don't block the batch.

**Why this exists:** after July 7 there is no smart model to judge "is this good?"
This checklist *is* the judgment, frozen into yes/no tests. Keep it. If you ever
want to raise quality, add a new box here — never go back to "use good taste."
