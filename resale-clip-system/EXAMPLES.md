# Resale Clip Engine — Examples & Failure Modes

Copy the good. Avoid the bad. These are written into the system so the next model
(or you) copies the right thing.

---

## ✅ GREAT OUTPUT — worked example

**Item (Airtable row):** Nike Tech Fleece Hoodie, size L, black. Purchase Price $3.
Asking $45. Retails ~$110. Category: Clothing → keyword `FIT`.

**Hook (from Bank):** `I paid $3 for this.`

**Script:**
```
HOOK TEXT (frame 1): I paid $3 for this.
BEAT 1 (0–3s):  "I paid three dollars for this." — hold up the black hoodie, full frame.
BEAT 2 (3–10s): "Nike Tech Fleece, size large, clean — no flaws. Retails around
                 $110. I'm asking $45."
BEAT 3 (10–20s): "Comment FIT and I'll send you the link before it's gone."
```

**Caption:**
```
I paid $3 for this. Nike Tech Fleece hoodie, size L, $45.
Comment FIT for the link 👇
#resale #thrifted #nike #hoodie #poshmark
```

**Verification:** 10/10 ✅ → PUBLISH.
- Hook ≤7 words ✅ · early ✅ · item fast ✅ · price anchor ($3→$45, retail $110) ✅
- one keyword FIT ✅ · 18s ✅ · 9:16 ✅ · no junk ✅ · caption complete ✅ · logged ✅

---

## ❌ KNOWN FAILURE MODES (and the box they fail)

1. **AI-baked text.** Letting a generator write on-screen text → garbled words
   ("FCIPLINE"). → fails **Box 8**. Fix: type all text by hand in the editor.
2. **Slow hook.** 5 seconds of intro before the point. → fails **Box 2**. Fix:
   hook text on the very first frame.
3. **No price.** "Cute hoodie, DM me" → fails **Box 4**. Fix: always say paid/ask
   /retail numbers.
4. **Vague CTA.** "Link in bio" or three different asks → fails **Box 5**. Fix:
   exactly one "Comment [KEYWORD]".
5. **Too long.** A 60-second haul → fails **Box 6**. Fix: 12–30s, one item.
6. **Black bars.** Landscape footage in a vertical frame → fails **Box 7**. Fix:
   film vertical, fill frame.
7. **Hashtag wall.** 25 hashtags → not in the caption template → fails **Box 9**.
   Fix: 3–5 relevant tags only.
8. **Never logged.** Clip posts but Airtable never updated → fails **Box 10**, and
   you lose ROI tracking. Fix: log before you consider it done.

---

## The one taste call that stays human

Deciding WHICH items are worth filming (what will sell) is genuinely your
judgment — keep it. Everything after "this item is worth a clip" is systematized
above. Do not let a dumb model pick inventory; do let it script and check.
