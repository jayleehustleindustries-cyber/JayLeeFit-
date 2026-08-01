# photo-edit — cinematic grade for real jay_legacy_fit photos

Deterministic, local, free photo treatment for real phone photos — no AI
image regeneration, so faces and physiques stay 100% authentic. This is
the still-image stage that feeds the video stage in `../video/`.

## What it does

`cinematic_grade.py` applies the "sinister premium" look developed for the
jay_legacy_fit brand (2026-07-22 session):

1. Exposure pull-down, black crush, S-curve contrast
2. Partial desaturation toward steel/charcoal
3. Split-tone: cold teal shadows, restrained warm highlights
4. Elliptical key-light falloff centered on the subject's face/chest
   (`--focus fx,fy`) so he emerges from near-black — chiaroscuro
5. Big-radius clarity + micro-sharpen to carve muscle definition
6. Film grain (shadow-weighted), cinematic letterbox bars
7. Optional tracked-out brand mark ("JAY LEGACY / EVERYDAY HUSTLE CO.")
   in Anton (OFL) or DejaVu Bold fallback, placed above the bottom bar

## Usage

```bash
pip install pillow numpy
python3 cinematic_grade.py IN.png OUT.jpg \
  --focus 0.44,0.42 \
  --brand "JAY LEGACY" --sub "EVERYDAY HUSTLE CO." \
  --font path/to/Anton-Regular.ttf
```

Tuning used for the delivered 2026-07-22 stills: hero front-flex
`--edge-dark 0.10 --desat 0.50 --center-boost 1.18 --key-rx 0.58`;
moody profile adds `--key-rx 0.48`. Source photos and rendered outputs
are intentionally NOT in this repo — media stays out of git.

See `RUN-LOG-2026-07-22.md` for the full session record, including the
Veo 3 video prompt this frame feeds into.
