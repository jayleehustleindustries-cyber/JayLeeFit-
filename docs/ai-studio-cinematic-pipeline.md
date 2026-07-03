# Cinematic Content Pipeline — Google AI Studio

A run-it-yourself workflow for generating **original** cinematic marketing stills
and video for JayLeeFit, using Google AI Studio, then posting at your data-backed
best times. Built around original brand assets + licensed references — **not**
cloning any competitor's footage.

> Why run-it-yourself: there is no Google AI Studio connector in this agent
> environment. This SOP is the pipeline; you execute it in
> [aistudio.google.com](https://aistudio.google.com). (Higgsfield is available
> in-agent if you ever want assisted generation instead.)

---

## 1. Pick the model (AI Studio, 2026)

| Need | Model | Why |
|------|-------|-----|
| **Brand-consistent hero stills** | **Nano Banana Pro** (Gemini 3 Pro Image) | Best world-knowledge, brand consistency, precise creative control |
| **High-volume frames** (batch scenes) | **Nano Banana 2** (Gemini 3.1 Flash Image) | 4K, fast, cheap workhorse |
| **Cheapest bulk drafts** | Nano Banana 2 Lite | ~$0.034/image, ~4s |
| **Video from a still/text** | **Veo 3.1** or **Gemini Omni Flash** | Image→video, conversational edits |

**Recommendation:** draft scenes with Nano Banana 2 → finalize your hero frames
with **Nano Banana Pro** (for brand consistency) → animate the best frames with
**Veo 3.1 / Omni Flash**.

---

## 2. Drive folder structure

Create this in Google Drive so the pipeline stays organized (agent can read/write
Drive if you want assets pulled/pushed later):

```
JayLeeFit-Creative/
├── 00_references/     ← your own + licensed moodboard images (style targets)
├── 01_stills_draft/   ← Nano Banana 2 batch output
├── 02_stills_final/   ← Nano Banana Pro hero frames
├── 03_video/          ← Veo / Omni Flash clips
└── 04_ready_to_post/  ← captioned, cut to 9:16, scheduled
```

---

## 3. The workflow (per asset)

1. **Reference:** drop 2–4 style images into `00_references/`. In AI Studio,
   attach them as image input so the model matches the *aesthetic* (lighting,
   grade, mood) — while generating **original** subjects/scenes.
2. **Draft:** generate 4–6 variations with Nano Banana 2.
3. **Finalize:** re-prompt the best one in Nano Banana Pro, pinning your brand
   (colors, logo placement, subject) for consistency.
4. **Animate (optional):** feed the final still to Veo 3.1 → 5–8s motion.
5. **Post:** cut 9:16, caption with one CTA, schedule at your best times (§5).

---

## 4. Cinematic prompt pack (reusable)

**Master template** — fill the brackets:
```
Cinematic [shot type] of [subject], [action]. [Setting/environment].
Lighting: [e.g. hard low-key gym light, single rim light, volumetric haze].
Color grade: [e.g. teal-orange, desaturated steel, warm film].
Lens: [e.g. 35mm, shallow depth of field, anamorphic flare].
Mood: [disciplined / explosive / premium]. Aspect ratio 9:16.
Brand: keep [color] accents; leave clean negative space top-third for text.
```

**Five ready fitness scenes:**
1. `Cinematic low-angle shot of an athlete mid-deadlift, chalk dust in the air. Dark industrial gym. Lighting: hard low-key with a single blue rim light. Grade: desaturated steel. 35mm, shallow DOF. Mood: disciplined. 9:16. Clean negative space top-third.`
2. `Cinematic slow push-in on a sweat-covered face catching breath after a set. Volumetric haze, warm key light. Grade: warm film. Anamorphic flare. Mood: earned. 9:16.`
3. `Cinematic wide of a lone figure sprinting a stadium tunnel toward light. Teal-orange grade. Motion blur. Mood: explosive. 9:16. Negative space top-third.`
4. `Cinematic overhead flat-lay: prepped macro-balanced meal, measuring scale, notebook. Soft daylight. Premium, clean. Grade: neutral. 9:16.` (ties to your macro engine)
5. `Cinematic portrait of a coach mid-cue, arms crossed, confident. Single softbox, dark backdrop. Grade: warm. 85mm. Mood: premium authority. 9:16.`

**Brand consistency tip:** in Nano Banana Pro, attach 1–2 previous final frames
as reference each time so grade + look stay identical across the series.

---

## 5. Post at your data-backed best times (PT)

From your `jay_legacy_fit` Metricool audience data:
- **Best days:** Wednesday–Friday.
- **Primary:** 10am PT. **Secondary:** 6pm PT.
- Weekends: stories/engagement only, not hero drops.

The agent can auto-schedule finished assets into Metricool at these slots.

---

## 6. Guardrails

- Generate **original** scenes; use references only for *style*, not to
  reproduce a specific creator's copyrighted shots.
- Keep AI-generated people generic or clearly your own brand talent.
- Disclose AI use where a platform requires it.
