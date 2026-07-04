# Resale Clip Engine — Checklists & Templates

Run these literally. Fill every `[bracket]`. Do not add steps. Do not skip steps.

---

## Step 2 — SCRIPT (owner: MODEL)

Input: one row from Airtable **Resale Inventory** (Item Name, Purchase Price,
Brand, Size, Category, any flaw in Notes).

Do exactly this:

1. **Pick ONE hook** from the Hook Bank below that matches the item. Copy it
   verbatim. It must be ≤ 7 words.
2. **Fill the Script Template** with the row's data.
3. **Fill the Caption Template.**
4. **Set the CTA keyword** = the item's Category in caps (CLOTHING → `FIT`,
   SHOES → `KICKS`, else → `LINK`). Use one of: `FIT`, `KICKS`, `LINK`.
5. Output all four (hook, script, caption, keyword) as plain text. Nothing else.

### Hook Bank (pick one; do not invent)
| Item situation | Use one of these (≤7 words) |
|---|---|
| Cheap buy-in | "I paid $[buy] for this." · "This shouldn't be this cheap." |
| High retail | "Retail was $[retail]." · "$[retail] hoodie, [ask] dollars." |
| One available | "Only one. Size [size]." · "Gone by tonight." |
| Reverse-psych | "Don't buy this if you're broke." · "Not for everyone." |
| Brand flex | "[Brand] for lunch money." |
| Flip story | "Thrift find → resale flip." |

### Script Template (three beats, ~20 seconds)
```
HOOK TEXT (on frame 1, ≤7 words): [chosen hook]
BEAT 1 (0–3s):  Say the hook out loud. Show the item full-frame.
BEAT 2 (3–10s): "[Brand] [Item], size [size]. [Condition/flaw honest note].
                 Retails around $[retail] — I'm asking $[ask]."
BEAT 3 (10–20s): "Comment [KEYWORD] and I'll send you the link before it's gone."
```

### Caption Template
```
[Hook restated as a sentence]. [Brand] [Item], size [size], $[ask].
Comment [KEYWORD] for the link 👇
#resale #thrifted #[brand] #[category] #poshmark
```

---

## Shot List — FILM (owner: HUMAN)

Shoot these THREE shots, same every time, phone vertical (9:16). Nothing fancy.

1. **HERO (3s):** item held up / on hanger, filling the frame, good light.
2. **DETAIL (3s):** close-up of the brand tag + any flaw (honesty sells).
3. **YOU (5s):** you talking to camera saying Beat 2 + Beat 3 (or voiceover later).

Rule: film all 5 items' 3 shots in one sitting. Do not edit yet.

---

## Step 4 — EDIT (owner: HUMAN)

Assemble in CapCut/Descript to this fixed order. Do not rearrange.

1. Frame 1: **HERO shot** + the HOOK TEXT typed on screen (big, top third).
2. Then DETAIL shot (2–3s).
3. Then YOU shot (Beat 2 value).
4. End card (last 3s): plain background + typed text: **"Comment [KEYWORD]"**.
5. Add auto-captions. Check they're correct (fix any wrong words).
6. Export 9:16, no black bars.

Then go to `VERIFICATION.md`.

---

## Step 6/7 — PUBLISH + LOG (owner: AUTO, human taps go)

1. Upload the clip to Metricool, caption from Step 2, schedule Wed–Fri 10:00 or
   18:00 PT.
2. In ManyChat, make sure the keyword ([FIT]/[KICKS]/[LINK]) auto-replies with the
   item's link.
3. In Airtable: set Status = `Listed`, paste the clip URL into Cloud Folder Link.
